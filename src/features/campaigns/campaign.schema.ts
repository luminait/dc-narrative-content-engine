import { z } from 'zod';

// ============================================================================
// Base Schemas
// ============================================================================

export const cadenceSchema = z.object({
    daysOfWeek: z.array(z.string()).min(1, 'Select at least one day'),
    frequency: z.enum(['weekly', 'bi-weekly']),
});

export const mergeFieldSchema = z.object({
    id: z.string(),
    mergeField: z.string().min(1),
    description: z.string().optional(),
    valueType: z.string(),
    value: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    length: z.string().optional(),
});

// ============================================================================
// Zod Schemas for Form Data (UI Layer)
// ============================================================================

/**
 * Character schema for UI consumption
 * Simplified version focusing on what the form needs
 */
export const characterFormSchema = z.object({
    id: z.string(),
    name: z.string(),
    tagline: z.string().optional(),
    imageUrl: z.string().optional(),
});

/**
 * Persona schema for UI consumption
 * Simplified version focusing on what the form needs
 */
export const personaFormSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
});

/**
 * Main campaign form schema
 */
export const campaignFormSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    objective: z.string().min(1, 'Objective is required'),
    narrativeContext: z.string().optional(),
    postLength: z.string().min(1, 'Post length is required'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    cadence: cadenceSchema,
    postType: z.enum(['image', 'carousel', 'video']),
    videoLength: z.union([z.literal(30), z.literal(45), z.literal(60)]).optional(),
    personas: z.array(z.string()).min(1, 'Select at least one persona'),
    characters: z.array(z.string()).min(1, 'Select at least one character'),
    mergeFields: z.array(mergeFieldSchema).optional(),
});

// ============================================================================
// Inferred Types (For Form Hook)
// ============================================================================

export type CampaignFormData = z.infer<typeof campaignFormSchema>;
export type Cadence = z.infer<typeof cadenceSchema>;
export type MergeField = z.infer<typeof mergeFieldSchema>;
export type CharacterFormData = z.infer<typeof characterFormSchema>;
export type PersonaFormData = z.infer<typeof personaFormSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates campaign form data and returns parsed result
 * @throws ZodError if validation fails
 */
export function validateCampaignForm(data: unknown): CampaignFormData {
    return campaignFormSchema.parse(data);
}

/**
 * Safe validation that returns success/error result
 */
export function safeParseCampaignForm(data: unknown) {
    return campaignFormSchema.safeParse(data);
}

// ============================================================================
// Character UI Schema (Extended for Selection Component)
// ============================================================================

/**
 * Character asset schema for UI consumption
 * Represents a simplified view of character images/assets
 */
export const characterAssetUISchema = z.object({
    id: z.string().uuid(),
    url: z.string().url().optional(),
    isPrimary: z.boolean().optional(),
    label: z.string().optional(),
});

/**
 * Extended character schema for selection UI with image support
 * This is the type that should be passed to CharactersSelection component
 */
export const characterSelectionSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    characterTypes: z.string().optional().nullable(),
    imageUrl: z.string().optional(), // Pre-computed default image URL
});

