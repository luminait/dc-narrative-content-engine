import { z } from 'zod';

/**
 * Schema for webhook settings.
 * Validates environment selection and webhook URLs.
 */
export const settingsSchema = z.object({
  environment: z.enum(['testing', 'production']),
  testingUrl: z.string().url('Must be a valid URL'),
  productionUrl: z.string().url('Must be a valid URL'),
});

export type WebhookSettings = z.infer<typeof settingsSchema>;

/**
 * Schema for updating webhook settings via server action.
 */
export const updateWebhookSettingsSchema = settingsSchema.partial();
