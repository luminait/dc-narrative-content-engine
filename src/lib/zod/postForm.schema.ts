import { z } from 'zod';

/**
 * Schema for post generation form data.
 * Uses boolean flags (isDraft, isActive, isArchived) instead of a status enum.
 * All fields that have defaults are REQUIRED (not optional) to match react-hook-form expectations.
 */
export const postFormSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    content: z.string().min(1, 'Content is required').max(5000),
    customInstructions: z.string().max(1000).optional(),
    hashtags: z.array(z.string()), // Required array, can be empty
    isDraft: z.boolean(), // Required boolean
    isActive: z.boolean(), // Required boolean
    isArchived: z.boolean(), // Required boolean
    scheduledAt: z.date().optional().nullable(),
    mergeFieldValues: z.record(z.string(), z.string()).optional(),
    images: z
        .array(
            z.object({
                url: z.string().url(),
                altText: z.string().optional(),
                order: z.number().int().min(0),
            })
        )
        .optional(),
}).refine(
    (data) => {
        // Exactly one of isDraft, isActive, isArchived must be true
        const statusCount = [data.isDraft, data.isActive, data.isArchived].filter(Boolean).length;
        return statusCount === 1;
    },
    {
        message: 'Exactly one of isDraft, isActive, or isArchived must be true',
        path: ['isDraft'],
    }
);

export type PostFormData = z.infer<typeof postFormSchema>;

/**
 * Schema for AI-generated content returned from n8n webhook.
 */
export const generatedContentSchema = z.object({
    title: z.string(),
    content: z.string(),
    hashtags: z.array(z.string()),
    imageUrl: z.string().url().optional(),
    mergeFieldValues: z.record(z.string(), z.string()).optional(),
});

export type GeneratedContent = z.infer<typeof generatedContentSchema>;
