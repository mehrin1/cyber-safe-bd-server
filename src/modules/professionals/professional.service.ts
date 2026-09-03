import { ProfessionalRole } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { parsePositiveInt } from "../../utils/api.js";

type QueryOptions = {
  role?: string;
  verified?: boolean;
  limit?: unknown;
};

type SupportResourceFilters = {
  region?: string;
  serviceType?: string;
  urgency?: string;
  search?: string;
};

function normalizeRole(role?: string): ProfessionalRole | undefined {
  if (!role) {
    return undefined;
  }

  const value = role.toUpperCase();
  if (value in ProfessionalRole) {
    return value as ProfessionalRole;
  }

  return undefined;
}

export const professionalService = {
  getProfessionals(options: QueryOptions) {
    return prisma.professional.findMany({
      where: {
        role: normalizeRole(options.role),
        verified: options.verified,
      },
      orderBy: [{ verified: "desc" }, { name: "asc" }],
      take: parsePositiveInt(options.limit, 50),
    });
  },

  getAdvices(options: QueryOptions) {
    return prisma.advice.findMany({
      where: {
        professional: {
          role: normalizeRole(options.role),
          verified: options.verified,
        },
      },
      include: {
        professional: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: parsePositiveInt(options.limit, 50),
    });
  },

  getSupportResources(filters: SupportResourceFilters) {
    return prisma.supportResource.findMany({
      where: {
        ...(filters.region ? { region: filters.region.toUpperCase() } : {}),
        ...(filters.serviceType ? { serviceType: filters.serviceType.toUpperCase() } : {}),
        ...(filters.urgency ? { urgency: filters.urgency.toUpperCase() } : {}),
        ...(filters.search
          ? {
              OR: [
                { name: { contains: filters.search, mode: "insensitive" } },
                { description: { contains: filters.search, mode: "insensitive" } },
                { serviceType: { contains: filters.search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ urgency: "asc" }, { region: "asc" }, { name: "asc" }],
    });
  },
};
