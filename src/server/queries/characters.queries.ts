import { prisma } from '@/src/server/db/prisma';
import { unstable_cache } from 'next/cache';
import { RawCharacterFromQuery } from '@/src/lib/utils/characters.utils';

/**
 * Fetches all characters with their associated campaigns and assets.
 */
export const getCharacters = unstable_cache(
  async (): Promise<RawCharacterFromQuery[]> => {
    return prisma.character.findMany({
      where: { deletedAt: null },
      include: {
        campaigns: { include: { campaign: true } },
        // Corrected from `images` to `assets` to match schema.prisma
        assets: {
          include: {
            storageObject: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  },
  ['characters'],
  { tags: ['characters'], revalidate: 3600 },
);

/**
 * Fetches a single character by ID with its associated campaigns and assets.
 */
export const getCharacterById = unstable_cache(
  async (id: string) => {
    return prisma.character.findUnique({
      where: { id, deletedAt: null },
      include: {
        campaigns: { include: { campaign: true } },
        // Corrected from `images` to `assets` to match schema.prisma
        assets: {
          include: {
            storageObject: true,
          },
        },
      },
    });
  },
  ['character-by-id'],
  { tags: ['characters'], revalidate: 3600 },
);

/**
 * Fetches all characters for a specific campaign, conforming to the RawCharacterFromQuery type.
 * Now includes the campaign relationship fields (narrativeRole, recommendedScene, notes)
 */
export const getCharactersForCampaign = unstable_cache(
    async (campaignId: string): Promise<RawCharacterFromQuery[]> => {
        return prisma.character.findMany({
            where: {
                deletedAt: null,
                campaigns: {
                    some: {
                        campaignId: campaignId,
                    },
                },
            },
            include: {
                campaigns: {
                    where: {
                        campaignId: campaignId,
                    },
                    include: {
                        campaign: true,
                    },
                },
                assets: {
                    include: {
                        storageObject: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
    },
    ['characters-for-campaign'],
    { tags: ['characters'], revalidate: 3600 },
);
