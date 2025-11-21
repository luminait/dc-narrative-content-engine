"use server"

import { prisma } from '@/src/server/db/prisma';
import { unstable_cache } from 'next/cache';
import type { CharacterAsset } from '@/src/server/db/generated/prisma';

// TODO: Delete this file if not needed. Check first
export const getCharacterAssets = unstable_cache(async (): Promise<CharacterAsset[]> => {
        const assets = await prisma.characterAsset.findMany({
            where: { deletedAt: null },
        });
        if (!assets) {
            throw new Error('No assets found');
        }
        return assets;
    },
    [ 'character-assets' ],
    { tags: [ 'characters', 'assets', 'character-assets' ], revalidate: 3600 }
);
