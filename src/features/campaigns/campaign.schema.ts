import { z } from 'zod';

// ============================================================================
// Base Schemas
// ============================================================================

export const cadenceSchema = z.object({
    daysOfWeek: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).min(1, 'Select at least one day'),
    frequency: z.enum(['weekly', 'bi-weekly']),
});

export const mergeFieldSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    mediaValueType: z.enum(['image', 'text', 'video', 'audio_voice', 'audio_music', 'gen_ai_image', 'gen_ai_text', 'gen_ai_video', 'gen_ai_voice', 'gen_ai_music', 'image_or_video']).optional(),
    value: z.string().optional(),
    type: z.enum(['text', 'character', 'environment', 'music', 'voiceover', 'sfx', 'luma_matte']).optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    length: z.string().optional(),
});


/**
 * Persona schema for UI consumption
 * Simplified version focusing on what the form needs
 */
export const personaFormSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    personaKey: z.string(),
    isPrimaryPersona: z.boolean().default(true),
    createdAt: z.string(),
    updatedAt: z.string(),
    deletedAt: z.string().optional(),
});

/**
 * Main campaign form schema
 */
export const campaignSchema = z.object({
    id: z.string(),
    title: z.string(),
    objective: z.string(),
    narrativeContext: z.string().optional(),
    postCaptionLength: z.string(),
    startDate: z.coerce.date().nullable().optional(),
    endDate: z.coerce.date().nullable().optional(),
    cadence: z.object({
        daysOfWeek: z.array(z.string()),
        frequency: z.string().optional(),
    }),
    postType: z.string(),
    videoLength: z.number().optional(),
    personas: z.array(z.string()),
    primaryPersonaKey: z.string().optional(),
    characters: z.array(z.string()),
    mergeFields: z.array(mergeFieldSchema),
    isActive: z.boolean(),
    isArchived: z.boolean(),
    isDraft: z.boolean(),
    createdAt: z.coerce.date().nullable().optional(),
    updatedAt: z.coerce.date().nullable().optional(),
    deletedAt: z.coerce.date().nullable().optional(),
}).refine(
    (data) => {
        if (data.primaryPersonaKey && !data.personas.includes(data.primaryPersonaKey)) {
            return false;
        }
        return true;
    }
);



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
