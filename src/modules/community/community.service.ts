import { prisma } from "../../lib/prisma.js";

type Actor = { id: string };

type PostFilters = {
  search?: string;
  mine?: boolean;
  cursor?: string;
  limit: number;
};

const postInclude = (actorId?: string) => ({
  author: { select: { id: true, name: true, image: true } },
  _count: { select: { likes: true, comments: true } },
  likes: {
    where: { userId: actorId ?? "__anonymous__" },
    select: { id: true },
    take: 1,
  },
});

function serializePost(post: {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; name: string; image: string | null };
  likes: { id: string }[];
  _count: { likes: number; comments: number };
}) {
  const { likes, _count, ...data } = post;
  return {
    ...data,
    likeCount: _count.likes,
    commentCount: _count.comments,
    likedByCurrentUser: likes.length > 0,
  };
}

export const communityService = {
  async getPosts(filters: PostFilters, actor?: Actor) {
    const posts = await prisma.communityPost.findMany({
      where: {
        ...(filters.mine ? { authorId: actor!.id } : {}),
        ...(filters.search
          ? {
              OR: [
                { title: { contains: filters.search, mode: "insensitive" } },
                { content: { contains: filters.search, mode: "insensitive" } },
                { author: { name: { contains: filters.search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      cursor: filters.cursor ? { id: filters.cursor } : undefined,
      skip: filters.cursor ? 1 : 0,
      take: filters.limit + 1,
      include: postInclude(actor?.id),
    });

    const hasMore = posts.length > filters.limit;
    const page = hasMore ? posts.slice(0, filters.limit) : posts;
    return {
      posts: page.map(serializePost),
      nextCursor: hasMore ? page.at(-1)?.id ?? null : null,
    };
  },

  async createPost(payload: { title: string; content: string }, actor: Actor) {
    const post = await prisma.communityPost.create({
      data: { ...payload, authorId: actor.id },
      include: postInclude(actor.id),
    });
    return serializePost(post);
  },

  async toggleLike(postId: string, actor: Actor) {
    const post = await prisma.communityPost.findUnique({ where: { id: postId }, select: { id: true } });
    if (!post) return null;

    const existingLike = await prisma.communityPostLike.findUnique({
      where: { postId_userId: { postId, userId: actor.id } },
      select: { id: true },
    });

    if (existingLike) {
      await prisma.communityPostLike.delete({ where: { id: existingLike.id } });
    } else {
      await prisma.communityPostLike.create({ data: { postId, userId: actor.id } });
    }

    const likeCount = await prisma.communityPostLike.count({ where: { postId } });
    return { liked: !existingLike, likeCount };
  },

  async getComments(postId: string) {
    const post = await prisma.communityPost.findUnique({ where: { id: postId }, select: { id: true } });
    if (!post) return null;

    return prisma.communityComment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { id: true, name: true, image: true } } },
    });
  },

  async createComment(postId: string, payload: { content: string }, actor: Actor) {
    const post = await prisma.communityPost.findUnique({ where: { id: postId }, select: { id: true } });
    if (!post) return null;

    return prisma.communityComment.create({
      data: { ...payload, postId, authorId: actor.id },
      include: { author: { select: { id: true, name: true, image: true } } },
    });
  },
};
