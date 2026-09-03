import { LawCategory, LawRegion, LawStatus } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";

type LawFilters = {
  region?: string;
  category?: string;
  status?: string;
  topic?: string;
  search?: string;
};

function normalizeRegion(region?: string): LawRegion | undefined {
  if (!region) {
    return undefined;
  }

  const value = region.toUpperCase();
  if (value in LawRegion) {
    return value as LawRegion;
  }

  return undefined;
}

function normalizeStatus(status?: string): LawStatus | undefined {
  if (!status) return undefined;
  const value = status.toUpperCase();
  return value in LawStatus ? value as LawStatus : undefined;
}

function normalizeCategory(category?: string): LawCategory | undefined {
  if (!category) {
    return undefined;
  }

  const value = category.toUpperCase();
  if (value in LawCategory) {
    return value as LawCategory;
  }

  return undefined;
}

export const lawService = {
  getLaws(filters: LawFilters) {
    const region = normalizeRegion(filters.region);
    const category = normalizeCategory(filters.category);
    const status = normalizeStatus(filters.status);

    return prisma.law.findMany({
      where: {
        region,
        category,
        status,
        ...(filters.topic ? { legalTopics: { has: filters.topic } } : {}),
        ...(filters.search ? {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
            { applicability: { has: filters.search } },
          ],
        } : {}),
      },
      orderBy: [{ region: "asc" }, { title: "asc" }],
    });
  },

  getLawBySlug(slug: string) {
    return prisma.law.findUnique({ where: { slug } });
  },
};
