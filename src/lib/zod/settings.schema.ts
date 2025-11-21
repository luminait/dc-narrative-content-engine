import { z } from 'zod';

/**
 * Schema for webhook settings.
 * Validates environment selection and webhook URLs.
 */
export const settingsSchema = z.object({
  environment: z.enum(['testing', 'production']),
  testingUrl: z.string().url('Must be a valid URL'),
  productionUrl: z.string().url('Must be a valid URL'),
  // Make this required in the schema to align with React Hook Form's resolver typing.
  // We'll supply the default via form `defaultValues` instead of Zod `.default()`
  shotstackEnvironment: z.enum(['sandbox', 'production']),
});

export type WebhookSettings = z.infer<typeof settingsSchema>;

/**
 * Schema for updating webhook settings via server action.
 */
export const updateWebhookSettingsSchema = settingsSchema.partial();
