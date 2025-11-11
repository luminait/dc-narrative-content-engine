import { z } from 'zod';

// ============================================================================
// Enums & Constants
// ============================================================================

export const CAPTION_LENGTHS = [ 'short', 'medium', 'long' ] as const;

/**
 * Represents the possible types for a merge field's value, derived from the Prisma schema.
 * This is the single source of truth for merge field value types across the application.
 */
export const MERGE_FIELD_VALUE_TYPES = [
    'image',
    'text',
    'video',
    'audio_voice',
    'audio_music',
    'gen_ai_image',
    'gen_ai_text',
    'gen_ai_video',
    'gen_ai_voice',
    'gen_ai_music',
    'image_or_video',
] as const;

export const mediaValueTypeSchema = z.enum( MERGE_FIELD_VALUE_TYPES );

// ============================================================================
// Base Schemas
// ============================================================================

export const cadenceSchema = z.object( {
    daysOfWeek: z
        .array( z.enum( [ 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' ] ) )
        .refine( ( arr ) => arr.length > 0, { message: 'Select at least one day' } ),
    frequency: z.enum( [ 'weekly', 'bi-weekly' ] ),
} );

export const mergeFieldSchema = z.object( {
    id: z.string().optional(),
    name: z.string().min( 1 ),
    description: z.string().nullable().optional(),
    mediaValueType: mediaValueTypeSchema.optional(),
    value: z.string().nullable().optional(),
    type: z.enum( [ 'text', 'character', 'environment', 'music', 'voiceover', 'sfx', 'luma_matte' ] ).optional(),
    startTime: z.string().nullable().optional(),
    endTime: z.string().nullable().optional(),
    length: z.string().nullable().optional(),
    shouldRefreshOnRegenerate: z.boolean().optional(),
} );

/**
 * Persona schema for UI consumption
 * Simplified version focusing on what the form needs
 */
export const personaFormSchema = z.object( {
    id: z.string(),
    name: z.string(),
    description: z.string(),
    personaKey: z.string(),
    isPrimaryPersona: z.boolean().default( true ),
    createdAt: z.string(),
    updatedAt: z.string(),
    deletedAt: z.string().optional(),
} );

export const characterSelectionSchema = z.object( {
    id: z.uuid(),
    name: z.string(),
    characterTypes: z.string().nullable().optional(),
    imageUrl: z.url().nullable().optional(),
} );

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
        characters: z.array( z.string() ).refine( ( arr ) => arr.length > 0, { message: 'Select at least one character' } ),
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
            path: [ 'videoLength' ], // You can point to a specific field
        },
    );

/**
 * Main campaign form schema
 */
export const campaignSchema = z.object( {
    id: z.string(),
    title: z.string(),
    objective: z.string(),
    narrativeContext: z.string().optional(),
    postCaptionLength: z.string(),
    startDate: z.coerce.date().nullable().optional(),
    endDate: z.coerce.date().nullable().optional(),
    cadence: z.object( {
        daysOfWeek: z.array( z.string() ),
        frequency: z.string().optional(),
    } ),
    postType: z.string(),
    videoLength: z.number().optional(),
    personas: z.array( z.string() ),
    primaryPersonaKey: z.string().optional(),
    characters: z.array( z.string() ),
    mergeFields: z.array( mergeFieldSchema ),
    isActive: z.boolean(),
    isArchived: z.boolean(),
    isDraft: z.boolean(),
    createdAt: z.coerce.date().nullable().optional(),
    updatedAt: z.coerce.date().nullable().optional(),
    deletedAt: z.coerce.date().nullable().optional(),
} ).refine(
    ( data ) => {
        return !( data.primaryPersonaKey && !data.personas.includes( data.primaryPersonaKey ) );
    }
);


// ============================================================================
// Inferred Types
// ============================================================================
export type CampaignData = z.infer<typeof campaignSchema>;
export type CampaignFormData = z.infer<typeof campaignFormSchema>;
export type Cadence = z.infer<typeof cadenceSchema>;
export type MergeField = z.infer<typeof mergeFieldSchema>;
export type CharacterSelectionData = z.infer<typeof characterSelectionSchema>;
export type PersonaData = z.infer<typeof personaFormSchema>;
export type MediaValueType = z.infer<typeof mediaValueTypeSchema>;
