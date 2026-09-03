import { prisma } from "../../lib/prisma.js";

export const dashboardService = {
  async getUserDashboard(userId: string) {
    const [user, surveys, helpRequests, sentMessageCount, communityPosts] = await Promise.all([
      prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { name: true, email: true, image: true, role: true, createdAt: true },
      }),
      prisma.surveyResponse.findMany({
        where: { userId, status: "COMPLETED" },
        orderBy: { submittedAt: "desc" },
        take: 5,
        select: { id: true, submittedAt: true, survey: { select: { title: true } } },
      }),
      prisma.helpRequest.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, title: true, category: true, status: true, updatedAt: true },
      }),
      prisma.helpMessage.count({ where: { senderId: userId } }),
      prisma.communityPost.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          createdAt: true,
          _count: { select: { likes: true, comments: true } },
        },
      }),
    ]);

    return { profile: user, activity: { surveys, helpRequests, sentMessageCount, communityPosts } };
  },

  async getAdminDashboard() {
    const [userCount, surveyResponseCount, helpRequestCount, pendingHelpRequestCount, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.surveyResponse.count({ where: { status: "COMPLETED" } }),
      prisma.helpRequest.count(),
      prisma.helpRequest.count({ where: { status: "PENDING" } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, name: true, role: true, createdAt: true },
      }),
    ]);

    return { userCount, surveyResponseCount, helpRequestCount, pendingHelpRequestCount, recentUsers };
  },
};
