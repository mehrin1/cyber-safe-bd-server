import { prisma } from "../../lib/prisma.js";

export const crimeService = {
  getCrimeTypes(search?: string, category?: string) {
    return prisma.crimeType.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }, { subtypes: { has: search } }] } : {}),
      },
      include: { legalReferences: { include: { law: true }, orderBy: { law: { title: "asc" } } } },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  },
};
