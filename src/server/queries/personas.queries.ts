import { prisma } from '@/src/server/db/prisma';
import { unstable_cache } from 'next/cache';

/**
 * Fetches all personas with their associated campaigns.
 */
export const getPersonas = unstable_cache(
  async () => {
    return prisma.persona.findMany({
      where: { deletedAt: null },
      include: {
        campaigns: { include: { campaign: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },
  ['personas'],
  { tags: ['personas'], revalidate: 3600 },
);

/**
 * Fetches a single persona by ID with its associated campaigns.
 */
export const getPersonaById = unstable_cache(
  async (id: string) => {
    return prisma.persona.findUnique({
      where: { id, deletedAt: null },
      include: {
        campaigns: { include: { campaign: true } },
      },
    });
  },
  ['persona-by-id'],
  { tags: ['personas'], revalidate: 3600 },
);

/**
 * Fetches all personas for a specific campaign.
 */
export const getPersonasForCampaign = unstable_cache(
  async (campaignId: string) => {
    return prisma.persona.findMany({
      where: {
        deletedAt: null,
        campaigns: {
          some: {
            campaignId: campaignId,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  },
  ['personas-for-campaign'],
  { tags: ['personas'], revalidate: 3600 },
);
