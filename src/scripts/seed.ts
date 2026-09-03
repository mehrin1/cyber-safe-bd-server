import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import {
  HelpCategory,
  HelpRequestStatus,
  LawCategory,
  LawRegion,
  MessageSender,
  ProfessionalRole,
} from "../generated/prisma/enums.js";

async function main() {
  await prisma.learnCategory.createMany({
    data: [
      {
        id: "phishing",
        name: "Phishing",
        description: "Fraudulent attempts to steal sensitive information.",
      },
      {
        id: "identity",
        name: "Identity Theft",
        description: "Using someone's identity for illegal purposes.",
      },
      {
        id: "harassment",
        name: "Online Harassment",
        description: "Bullying or threats through digital platforms.",
      },
      {
        id: "fraud",
        name: "Financial Fraud",
        description: "Scams involving digital or mobile money transactions.",
      },
    ],
    skipDuplicates: true,
  });

  const articleCount = await prisma.article.count();
  if (articleCount === 0) {
    await prisma.article.createMany({
      data: [
        {
          title: "How Phishing Works",
          summary: "Understand how attackers trick users into revealing data.",
          content:
            "Phishing attacks usually arrive through email, SMS, or fake login pages that imitate trusted brands.",
          categoryId: "phishing",
          tips: [
            "Never click unknown links",
            "Check the sender email carefully",
            "Use multi-factor authentication",
          ],
          cases: [
            "A victim lost bank access through a fake login page",
            "Students received scholarship-themed phishing emails",
          ],
        },
        {
          title: "Protect Yourself from Identity Theft",
          summary: "Learn how criminals misuse your identity and accounts.",
          content:
            "Identity theft happens when personal data is collected and reused for SIM, banking, or account fraud.",
          categoryId: "identity",
          tips: ["Do not share NID images publicly", "Use unique passwords"],
          cases: ["A stolen NID copy was used for fake SIM registration"],
        },
      ],
    });
  }

  const lawCount = await prisma.law.count();
  if (lawCount === 0) {
    await prisma.law.createMany({
      data: [
        {
          title: "Digital Security Act",
          description:
            "Bangladesh law addressing cybercrime, digital fraud, and online offenses.",
          region: LawRegion.BANGLADESH,
          category: LawCategory.CYBERCRIME,
          authority: "Government of Bangladesh",
          publishedDate: "2018",
        },
        {
          title: "Cyber Security Act 2023",
          description:
            "Updated Bangladesh framework focusing on cybersecurity and digital rights.",
          region: LawRegion.BANGLADESH,
          category: LawCategory.DATA_PROTECTION,
          authority: "Government of Bangladesh",
          publishedDate: "2023",
        },
        {
          title: "GDPR",
          description:
            "European Union regulation for personal data protection and privacy.",
          region: LawRegion.INTERNATIONAL,
          category: LawCategory.DATA_PROTECTION,
          authority: "European Union",
          publishedDate: "2018",
        },
      ],
    });
  }

  const professionalCount = await prisma.professional.count();
  if (professionalCount === 0) {
    const police = await prisma.professional.create({
      data: {
        name: "Inspector Rahman",
        role: ProfessionalRole.POLICE,
        designation: "Cyber Crime Unit Officer",
        organization: "Dhaka Metropolitan Police",
        verified: true,
      },
    });

    const lawyer = await prisma.professional.create({
      data: {
        name: "Advocate Sara Khan",
        role: ProfessionalRole.LAWYER,
        designation: "Cyber Law Specialist",
        organization: "Supreme Court",
        verified: true,
      },
    });

    const psychologist = await prisma.professional.create({
      data: {
        name: "Dr. Hasan Mahmud",
        role: ProfessionalRole.PSYCHOLOGIST,
        designation: "Clinical Psychologist",
        organization: "Mind Care BD",
        verified: true,
      },
    });

    await prisma.advice.createMany({
      data: [
        {
          title: "What to do if your account is hacked",
          content:
            "Change the password immediately, review recovery options, and report the incident with screenshots.",
          category: "phishing",
          professionalId: police.id,
        },
        {
          title: "Legal steps against online harassment",
          content:
            "Preserve evidence and prepare a dated incident timeline before filing a complaint.",
          category: "harassment",
          professionalId: lawyer.id,
        },
        {
          title: "Handling mental stress after cybercrime",
          content:
            "Talk to someone you trust and seek licensed mental health support if anxiety keeps escalating.",
          category: "mental",
          professionalId: psychologist.id,
        },
      ],
    });
  }

  const requestCount = await prisma.helpRequest.count();
  if (requestCount === 0) {
    const helpRequest = await prisma.helpRequest.create({
      data: {
        title: "Facebook account hacked",
        description: "Someone accessed my account and changed the password.",
        category: HelpCategory.LEGAL,
        isAnonymous: true,
        status: HelpRequestStatus.PENDING,
      },
    });

    await prisma.helpMessage.createMany({
      data: [
        {
          helpRequestId: helpRequest.id,
          senderType: MessageSender.USER,
          text: "I need help with my hacked account.",
        },
        {
          helpRequestId: helpRequest.id,
          senderType: MessageSender.PROFESSIONAL,
          text: "Please share when you first noticed the account takeover.",
        },
      ],
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
