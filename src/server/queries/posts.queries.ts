import { prisma } from '@/src/server/db/prisma';
import { unstable_cache } from 'next/cache';
import { PostWithStatus } from '@/src/lib/types/ui';
import { getPostStatus } from '@/src/lib/utils/posts.utils';
import { Post } from '@/src/server/db/generated/prisma';

/**
 * Fetches all posts with related data and computed status.
 */
export const getPosts = unstable_cache(
  async (): Promise<PostWithStatus[]> => {
    const posts = await prisma.post.findMany({
      where: { deletedAt: null },
      include: {
        campaign: true,
        images: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    return posts.map(post => ({
      ...post,
      status: getPostStatus(post),
    }));
  },
  ['posts'],
  { tags: ['posts'], revalidate: 3600 },
);

/**
 * Fetches a single post by ID with computed status.
 */
export const getPostById = unstable_cache(
  async (id: string): Promise<PostWithStatus | null> => {
    const post = await prisma.post.findUnique({
      where: { id, deletedAt: null },
      include: {
        campaign: true,
        images: true,
      },
    });
    if (!post) return null;
    return {
      ...post,
      status: getPostStatus(post),
    };
  },
  ['post-by-id'],
  { tags: ['posts'], revalidate: 3600 },
);

/**
 * Fetches all posts for a specific campaign with computed status.
 */
export const getPostsForCampaign = unstable_cache(
  async (campaignId: string): Promise<PostWithStatus[]> => {
    const posts = await prisma.post.findMany({
      where: {
        campaignId,
        deletedAt: null,
      },
      include: {
        images: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    return posts.map(post => ({
      ...post,
      status: getPostStatus(post),
    }));
  },
  ['posts-for-campaign'],
  { tags: ['posts'], revalidate: 3600 },
);
