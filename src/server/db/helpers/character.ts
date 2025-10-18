import type { CharacterAsset } from "@/src/server/db/generated/prisma";
import type { CharacterWithAssets } from "../types";

/**
 * Get the default image for a character.
 * Returns the primary asset if it exists, otherwise returns the first asset.
 * Filters out soft-deleted assets.
 */
export function getDefaultImage(
    assets: CharacterAsset[] | undefined | null
): CharacterAsset | null {
    if (!assets || assets.length === 0) {
        return null;
    }

    // Filter out soft-deleted assets
    const activeAssets = assets.filter((asset) => asset.deletedAt === null);

    if (activeAssets.length === 0) {
        return null;
    }

    // Find primary asset
    const primaryAsset = activeAssets.find((asset) => asset.isPrimary === true);

    if (primaryAsset) {
        return primaryAsset;
    }

    // Return first asset, sorted by creation date
    return activeAssets.sort((a, b) => {
        const aTime = a.createdAt?.getTime() ?? 0;
        const bTime = b.createdAt?.getTime() ?? 0;
        return aTime - bTime;
    })[0];
}

/**
 * Enriches a character object with a defaultImage property
 *
 * @param character - The character object to enrich.
 * @returns The enriched character object.
 *
 * @example
 * // Enrich with defaultImage
 * const enrichedCharacter = withDefaultImage(character);
 *
 * // Now you can access it like a property
 * const defaultImage = enrichedCharacter.defaultImage;
 *
 */
export function withDefaultImage<T extends { assets?: CharacterAsset[] | null }>(
    character: T
): T & { defaultImage: CharacterAsset | null } {
    return {
        ...character,
        defaultImage: getDefaultImage(character.assets),
    };
}

