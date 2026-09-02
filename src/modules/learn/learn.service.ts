import { prisma } from "../../lib/prisma.js";

export const learnService = {
  getCategories() {
    return prisma.learnCategory.findMany({
      orderBy: {
        name: "asc",
      },
    });
  },

  getArticles(categoryId?: string) {
    return prisma.article.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  getArticleById(id: string) {
    return prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  },
};
