import { prisma } from '@/src/server/db/prisma';
import { unstable_cache } from 'next/cache';
import { RawPostFromQuery } from '@/src/lib/utils/posts.utils';

/**
 * Fetches all posts with related data.
 */
export const getPosts = unstable_cache(
  async () => {
    return prisma.post.findMany({
      where: { deletedAt: null },
      include: {
        campaign: true,
        images: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  },
  ['posts'],
  { tags: ['posts'], revalidate: 3600 },
);

/**
 * Fetches a single post by ID.
 */
export const getPostById = unstable_cache(
  async (id: string) => {
    return prisma.post.findUnique({
      where: { id, deletedAt: null },
      include: {
        campaign: true,
        images: true,
      },
    });
  },
  ['post-by-id'],
  { tags: ['posts'], revalidate: 3600 },
);

/**
 * Fetches all posts for a specific campaign.
 */
export const getPostsForCampaign = unstable_cache(
  async (campaignId: string): Promise<RawPostFromQuery[]> => {
    return prisma.post.findMany({
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
  },
  ['posts-for-campaign'],
  { tags: ['posts'], revalidate: 3600 },
);
