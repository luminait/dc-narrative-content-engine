import { CharacterData } from "@/src/features/characters/character.schema";
import { CharacterWithImage } from "@/src/lib/types/ui";
import { getPublicUrl } from "./supabase";

// Based on schema.prisma: This defines the shape of the `assets` relation
// as returned by our Prisma query.
export type RawCharacterAssetFromPrisma = {
    isPrimary: boolean | null;
    storageObject: {
        id: string;
    };
};

// This is the complete shape of a character object returned by our data-fetching functions.
// It is built from the DB-aligned schema and includes the `assets` relation.
export type RawCharacterFromQuery = CharacterData & {
    assets: RawCharacterAssetFromPrisma[];
};

/**
 * Retrieves the default image URL for a character from the raw query data.
 *
 * @param character - The raw character object from Prisma, including the `assets` array.
 * @returns The URL of the primary image, falling back to the first image.
 */
export const getCharacterDefaultImage = (
    character: RawCharacterFromQuery,
): string | undefined => {
    if (!character.assets || character.assets.length === 0) {
        return undefined;
    }

    const primaryAsset = character.assets.find(asset => asset.isPrimary);
    const assetToUse = primaryAsset || character.assets[0];

    if (!assetToUse?.storageObject?.id) {
        return undefined;
    }

    // Assumes character images are in a "characters" bucket.
    return getPublicUrl("characters", assetToUse.storageObject.id);
};

/**
 * Transforms raw character data into the UI-specific `CharacterWithImage` type.
 *
 * @param rawCharacters - The array of raw character data from the database.
 * @returns An array of characters with a computed `defaultImage` field.
 */
export const toUiCharacters = (
    rawCharacters: RawCharacterFromQuery[],
): CharacterWithImage[] => {
    return rawCharacters.map(character => ({
        ...character,
        defaultImage: getCharacterDefaultImage(character),
    }));
};
