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


/**
 * Persona schema for UI consumption
 * Simplified version focusing on what the form needs
 */
export const personaFormSchema = z.object({
    id: z.string(),
    label: z.string(),
    description: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    deletedAt: z.string().optional(),
});

/**
 * Main campaign form schema
 */
export const campaignSchema = z.object({
    id: z.uuid(),
    title: z.string().min(1, 'Title is required'),
    objective: z.string().min(1, 'Objective is required'),
    narrativeContext: z.string().optional(),
    postLength: z.string().min(1, 'Post length is required'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    cadence: cadenceSchema,
    postType: z.enum(['single_image', 'carousel', 'video']),
    videoLength: z.union([z.literal(30), z.literal(45), z.literal(60)]).optional(),
    personas: z.array(z.string()).min(1, 'Select at least one persona'),
    characters: z.array(z.string()).min(1, 'Select at least one character'),
    mergeFields: z.array(mergeFieldSchema).optional(),
    isArchived: z.boolean().optional(),
    isActive: z.boolean().optional(),
    isDraft: z.boolean().optional(),
    createdAt: z.date(),
});


// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates campaign form data and returns parsed result
 * @throws ZodError if validation fails
 */
export function validateCampaignForm(data: unknown): CampaignData {
    return campaignSchema.parse(data);
}

/**
 * Safe validation that returns success/error result
 */
export function safeParseCampaignForm(data: unknown) {
    return campaignSchema.safeParse(data);
}



// ============================================================================
// Inferred Types (For Form Hook)
// ============================================================================

export type CampaignData = z.infer<typeof campaignSchema>;
export type Cadence = z.infer<typeof cadenceSchema>;
export type MergeField = z.infer<typeof mergeFieldSchema>;
export type PersonaData = z.infer<typeof personaFormSchema>;
