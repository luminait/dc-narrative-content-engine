import { prisma } from '@/src/server/db/prisma';
import { unstable_cache } from 'next/cache';
import { getCharacterDefaultImage, RawCharacterFromQuery } from '@/src/lib/utils/characters.utils';
import { CharacterWithImage } from "@/src/lib/types/ui";

/**
 * Fetches all characters with their associated campaigns and assets.
 */
export const getCharacters = unstable_cache(
  async (): Promise<CharacterWithImage[]> => {
    const characters = await prisma.character.findMany({
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

    return Promise.all(
        characters.map(async (char) => ({
            ...char,
            imageUrl: await getCharacterDefaultImage(char as RawCharacterFromQuery),
        }))
    );
  },
  ['characters'],
  { tags: ['characters'], revalidate: 3600 },
);

/**
 * Fetches a single character by ID with its associated campaigns and assets.
 */
export const getCharacterById = unstable_cache(
  async (id: string) => {
    const character = await prisma.character.findUnique({
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

    if (!character) return null;

    return {
        ...character,
        imageUrl: await getCharacterDefaultImage(character as RawCharacterFromQuery),
    };
  },
  ['character-by-id'],
  { tags: ['characters'], revalidate: 3600 },
);

/**
 * Fetches all characters for a specific campaign, conforming to the RawCharacterFromQuery type.
 * Now includes the campaign relationship fields (narrativeRole, recommendedScene, notes)
 */
export const getCharactersForCampaign = unstable_cache(
    async (campaignId: string): Promise<CharacterWithImage[]> => {
        const characters = await prisma.character.findMany({
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

        return Promise.all(
            characters.map(async (char) => ({
                ...char,
                imageUrl: await getCharacterDefaultImage(char as RawCharacterFromQuery),
            }))
        );
    },
    ['characters-for-campaign'],
    { tags: ['characters'], revalidate: 3600 },
);
