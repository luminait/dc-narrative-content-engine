import { z } from 'zod';
import { cadenceSchema, CAPTION_LENGTHS, mergeFieldSchema } from "@/src/lib/zod/campaign.schema";

// ============================================================================
// Database-Aligned Schema
// ============================================================================

/**
 * Represents the full Character model from the database, aligned with `schema.prisma`.
 * This is used for type safety on raw data returned from Prisma queries.
 */
export const characterDbSchema = z.object({
  id: z.uuid(),
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
export const characterSelectionSchema = z.object( {
    id: z.uuid(),
    name: z.string(),
    characterTypes: z.string().nullable().optional(),
    imageUrl: z.url().nullable().optional(),
    narrativeRole: z.string().nullable().optional(),
    recommendedScene: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
} );

/**
 * Schema for the join table data when creating/updating campaign-character relationships
 */
export const campaignCharacterRelationSchema = z.object({
    characterId: z.uuid(),
    narrativeRole: z.string().nullable().optional(),
    recommendedScene: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
});

/**
 * Main campaign form schema for creating and editing campaigns.
 */
export const campaignFormSchema = z
    .object( {
        title: z.string().min( 3, 'Title must be at least 3 characters' ),
        objective: z.string().min( 10, 'Objective must be at least 10 characters' ),
        narrativeContext: z.string().optional(),
        postLength: z.enum( CAPTION_LENGTHS, 'Post length is required' ),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        cadence: cadenceSchema,
        postType: z.enum( [ 'single_image', 'carousel', 'video' ] ),
        videoLength: z.number().optional(),
        personas: z.array( z.string() ).refine( ( arr ) => arr.length > 0, { message: 'Select at least one persona' } ),
        // Updated to support either simple string IDs or full relationship objects
        characters: z.array(
            z.union([
                z.uuid(),
                campaignCharacterRelationSchema
            ])
        ).refine( ( arr ) => arr.length > 0, { message: 'Select at least one character' } ),
        mergeFields: z.array( mergeFieldSchema ).optional(),
    } )
    .refine(
        ( data ) => {
            if ( data.postType === 'video' ) {
                return data.videoLength !== undefined && data.mergeFields !== undefined;
            }
            return true;
        },
        {
            message: 'Video length and merge fields are required for video posts',
            path: [ 'videoLength' ],
        },
    );


// ============================================================================
// Inferred Types
// ============================================================================

export type CampaignCharacterRelation = z.infer<typeof campaignCharacterRelationSchema>;
export type CharacterData = z.infer<typeof characterDbSchema>;
export type CharacterFormData = z.infer<typeof characterSelectionSchema>;
export type CharacterSelectionData = z.infer<typeof characterSelectionSchema>;
export type CharacterAssetUI = z.infer<typeof characterAssetUISchema>;
