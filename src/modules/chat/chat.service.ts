import { ChatMessageRole, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

type Actor = { id: string; role?: string | null };

export type ChatSource = {
  type: "Law" | "Cybercrime guide" | "Learning article" | "Support resource";
  title: string;
  excerpt: string;
  url?: string;
};

type KnowledgeDocument = ChatSource & { searchable: string };
type GeminiModelList = {
  models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>;
};

const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";
const FALLBACK_GEMINI_MODELS = ["gemini-3.5-flash", "gemini-flash-lite-latest"];

function environmentValue(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, "$1$2").trim();
}

function terms(value: string) {
  return new Set(value.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []);
}

function excerpt(value: string, length = 750) {
  return value.replace(/\s+/g, " ").trim().slice(0, length);
}

function rankDocuments(query: string, documents: KnowledgeDocument[]) {
  const queryTerms = terms(query);
  return documents
    .map((document) => ({
      document,
      score: [...queryTerms].reduce(
        (total, term) => total + (document.searchable.toLowerCase().includes(term) ? 1 : 0),
        0,
      ),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ document }) => ({ type: document.type, title: document.title, excerpt: document.excerpt, url: document.url }));
}

async function retrieveKnowledge(query: string): Promise<ChatSource[]> {
  const [laws, crimes, articles, resources] = await Promise.all([
    prisma.law.findMany({ select: { title: true, description: true, source: true, legalTopics: true, applicability: true }, take: 80 }),
    prisma.crimeType.findMany({ select: { name: true, description: true, category: true, subtypes: true, immediateSteps: true }, take: 80 }),
    prisma.article.findMany({ select: { title: true, summary: true, content: true, category: { select: { name: true } } }, take: 80 }),
    prisma.supportResource.findMany({ select: { name: true, description: true, serviceType: true, contactLabel: true, contactValue: true, contactUrl: true }, take: 80 }),
  ]);

  const documents: KnowledgeDocument[] = [
    ...laws.map((law) => ({ type: "Law" as const, title: law.title, excerpt: excerpt(`${law.description} Topics: ${law.legalTopics.join(", ")}. Applies to: ${law.applicability.join(", ")}.`), url: law.source ?? undefined, searchable: `${law.title} ${law.description} ${law.legalTopics.join(" ")} ${law.applicability.join(" ")}` })),
    ...crimes.map((crime) => ({ type: "Cybercrime guide" as const, title: crime.name, excerpt: excerpt(`${crime.description} Immediate steps: ${crime.immediateSteps.join("; ")}`), searchable: `${crime.name} ${crime.category} ${crime.description} ${crime.subtypes.join(" ")} ${crime.immediateSteps.join(" ")}` })),
    ...articles.map((article) => ({ type: "Learning article" as const, title: article.title, excerpt: excerpt(`${article.summary} ${article.content}`), searchable: `${article.title} ${article.summary} ${article.content} ${article.category.name}` })),
    ...resources.map((resource) => ({ type: "Support resource" as const, title: resource.name, excerpt: excerpt(`${resource.description} Service: ${resource.serviceType}. Contact: ${resource.contactLabel} ${resource.contactValue}.`), url: resource.contactUrl ?? undefined, searchable: `${resource.name} ${resource.description} ${resource.serviceType}` })),
  ];

  return rankDocuments(query, documents);
}

async function discoverGeminiModels(apiKey: string) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models",
    { headers: { "x-goog-api-key": apiKey } },
  );
  if (!response.ok) return [];

  const payload = await response.json() as GeminiModelList;
  return (payload.models ?? [])
    .filter((model) => model.name?.startsWith("models/gemini-") && model.supportedGenerationMethods?.includes("generateContent"))
    .map((model) => model.name!.replace(/^models\//, ""));
}

async function generateAnswer(history: { role: ChatMessageRole; content: string }[], sources: ChatSource[]) {
  const apiKey = environmentValue(process.env.GEMINI_API_KEY);
  if (!apiKey) throw new Error("CHAT_PROVIDER_NOT_CONFIGURED");

  const configuredModel = environmentValue(process.env.GEMINI_MODEL) || DEFAULT_GEMINI_MODEL;
  const models = [...new Set([configuredModel, DEFAULT_GEMINI_MODEL, ...FALLBACK_GEMINI_MODELS])];
  const context = sources.length
    ? sources.map((source, index) => `[${index + 1}] ${source.type}: ${source.title}\n${source.excerpt}`).join("\n\n")
    : "No matching project knowledge was retrieved.";
  let response: Response | undefined;
  let attemptedDiscovery = false;
  const attemptedModels = new Set<string>();
  while (models.length) {
    const model = models.shift()!;
    attemptedModels.add(model);
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `You are CyberSafeBD's safety information assistant. Answer only from the retrieved project knowledge below. Cite factual claims as [1], [2], etc. If the answer is not in the knowledge, say so and suggest a relevant official support resource when available. Do not claim to be a lawyer, diagnose, request passwords or sensitive evidence, or give instructions for wrongdoing. For immediate danger, tell the user to contact local emergency services.\n\nRETRIEVED KNOWLEDGE:\n${context}` }],
        },
        contents: history.map((message) => ({
          role: message.role === "ASSISTANT" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        generationConfig: { temperature: 0.2, maxOutputTokens: 700 },
      }),
      },
    );
    if (response.status !== 404) break;

    // API keys can expose a different subset of Gemini models than the public defaults.
    // Query the key's catalog once, then retry any compatible models it reports.
    if (!models.length && !attemptedDiscovery) {
      attemptedDiscovery = true;
      const discoveredModels = await discoverGeminiModels(apiKey);
      models.push(...discoveredModels.filter((candidate) => !attemptedModels.has(candidate)));
    }
  }

  if (!response || !response.ok) {
    // Keep provider details out of the client response, but preserve the status for actionable server handling.
    throw new Error(`CHAT_PROVIDER_ERROR:${response?.status ?? "UNKNOWN"}`);
  }
  const payload = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
  if (!text) throw new Error("CHAT_PROVIDER_EMPTY_RESPONSE");
  return text;
}

async function getConversationForActor(id: string, actor: Actor) {
  return prisma.chatConversation.findFirst({
    where: { id, ...(actor.role === "ADMIN" ? {} : { userId: actor.id }) },
    include: { user: { select: { id: true, name: true, email: true } }, messages: { orderBy: { createdAt: "asc" } } },
  });
}

export const chatService = {
  listConversations(actor: Actor, all = false) {
    return prisma.chatConversation.findMany({
      where: all && actor.role === "ADMIN" ? {} : { userId: actor.id },
      orderBy: { updatedAt: "desc" },
      take: all && actor.role === "ADMIN" ? 100 : 50,
      select: { id: true, title: true, createdAt: true, updatedAt: true, user: { select: { name: true, email: true } }, _count: { select: { messages: true } } },
    });
  },

  async getConversation(id: string, actor: Actor) {
    return getConversationForActor(id, actor);
  },

  async sendMessage(payload: { conversationId?: string; content: string }, actor: Actor) {
    const conversation = payload.conversationId
      ? await getConversationForActor(payload.conversationId, actor)
      : await prisma.chatConversation.create({ data: { userId: actor.id, title: excerpt(payload.content, 72) } });
    if (!conversation) return null;

    const userMessage = await prisma.chatMessage.create({
      data: { conversationId: conversation.id, role: "USER", content: payload.content },
    });
    const history = await prisma.chatMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { role: true, content: true },
    });
    const sources = await retrieveKnowledge(payload.content);
    const answer = await generateAnswer(history.reverse(), sources);
    const assistantMessage = await prisma.chatMessage.create({
      data: { conversationId: conversation.id, role: "ASSISTANT", content: answer, sources: sources as Prisma.InputJsonValue },
    });
    await prisma.chatConversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
    return { conversationId: conversation.id, userMessage, assistantMessage };
  },
};
