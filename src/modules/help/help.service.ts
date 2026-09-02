import { HelpRequestStatus } from "../../generated/prisma/enums.ts";
import { prisma } from "../../lib/prisma.js";

type Actor = { id: string; role?: string | null };

function normalizeStatus(status?: string): HelpRequestStatus | undefined {
  if (!status) {
    return undefined;
  }

  const value = status.toUpperCase().replace("-", "_");
  if (value in HelpRequestStatus) {
    return value as HelpRequestStatus;
  }

  return undefined;
}

export const helpService = {
  getHelpRequests(actor: Actor, status?: string) {
    return prisma.helpRequest.findMany({
      where: {
        status: normalizeStatus(status),
        ...(actor.role === "ADMIN" ? {} : { userId: actor.id }),
      },
      orderBy: {
        createdAt: "desc",
      },
      select: { id: true, title: true, category: true, isAnonymous: true, status: true, createdAt: true, updatedAt: true, _count: { select: { messages: true } } },
    });
  },

  getHelpRequestById(id: string, actor: Actor) {
    return prisma.helpRequest.findFirst({
      where: { id, ...(actor.role === "ADMIN" ? {} : { userId: actor.id }) },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
  },

  createHelpRequest(payload: {
    title: string;
    description: string;
    category: "LEGAL" | "MENTAL" | "EMERGENCY" | "ACCOUNT_SECURITY" | "ONLINE_HARASSMENT" | "FINANCIAL_FRAUD" | "IMAGE_ABUSE" | "CHILD_SAFETY";
    isAnonymous?: boolean;
  }, actor?: Actor) {
    const isAnonymous = payload.isAnonymous === true || !actor;
    return prisma.helpRequest.create({
      data: {
        title: payload.title,
        description: payload.description,
        category: payload.category,
        isAnonymous,
        userId: isAnonymous ? undefined : actor!.id,
      },
    });
  },

  async getMessages(helpRequestId: string, actor: Actor) {
    const request = await this.getHelpRequestById(helpRequestId, actor);
    if (!request) return null;
    return prisma.helpMessage.findMany({
      where: { helpRequestId },
      orderBy: {
        createdAt: "asc",
      },
    });
  },

  async createMessage(
    helpRequestId: string,
    payload: { text: string },
    actor: Actor,
  ) {
    const request = await this.getHelpRequestById(helpRequestId, actor);
    if (!request) return null;
    return prisma.helpMessage.create({
      data: {
        helpRequestId,
        senderType: actor.role === "ADMIN" || actor.role === "PROFESSIONAL" ? "PROFESSIONAL" : "USER",
        text: payload.text,
        senderId: actor.id,
      },
    });
  },
};
