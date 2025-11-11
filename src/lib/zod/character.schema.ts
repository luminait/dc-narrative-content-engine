import { z } from 'zod';

// ============================================================================
// Database-Aligned Schema
// ============================================================================

/**
 * Represents the full Character model from the database, aligned with `schema.prisma`.
 * This is used for type safety on raw data returned from Prisma queries.
 */
export const characterDbSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
  deletedAt: z.date().nullable().optional(),
  isHuman: z.boolean().nullable().optional(),
  isTrainer: z.boolean().nullable().optional(),
  characterTypes: z.string().nullable().optional(),
  personality: z.string().nullable().optional(),
  heightCentimeters: z.number().int().nullable().optional(),
  weightGrams: z.number().int().nullable().optional(),
  moralAlignment: z.string().nullable().optional(),
});


// ============================================================================
// UI & Form Schemas
// ============================================================================

/**
 * Character asset schema for UI consumption
 * Represents a simplified view of character images/assets
 */
export const characterAssetUISchema = z.object({
    id: z.uuid(),
    url: z.url().optional(),
    isPrimary: z.boolean().optional(),
    label: z.string().optional(),
});

/**
 * Extended character schema for selection UI with image support
 * This is the type that should be passed to the CharactersSelection component
 */
export const characterSelectionSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    characterTypes: z.string().optional().nullable(),
    imageUrl: z.string().optional(), // Pre-computed default image URL
});

/**
 * Character schema for UI forms
 */
export const characterFormSchema = z.object({
    id: z.string(),
    name: z.string(),
    tagline: z.string().optional(),
    imageUrl: z.string().optional(),
    characterTypes: z.string().optional().nullable(),
    isHuman: z.boolean().optional(),
    isTrainer: z.boolean().optional(),
    heightCentimeters: z.number().optional(),
    weightGrams: z.number().optional(),
    moralAlignment: z.string().optional(),
    personality: z.string().optional(),
    assets: z.array(characterAssetUISchema).optional(),
});


// ============================================================================
// Inferred Types
// ============================================================================

export type CharacterData = z.infer<typeof characterDbSchema>;
export type CharacterFormData = z.infer<typeof characterFormSchema>;
export type CharacterSelectionData = z.infer<typeof characterSelectionSchema>;
export type CharacterAssetUI = z.infer<typeof characterAssetUISchema>;
