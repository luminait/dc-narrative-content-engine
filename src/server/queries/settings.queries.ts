import 'server-only';
import { cache } from 'react';
import { prisma } from '@/src/server/db';
import {
  settingsSchema,
  type WebhookSettings,
} from '@/src/lib/zod/settings.schema';

/**
 * Fetch webhook settings from database and normalize.
 * Falls back to environment variables if not found or invalid.
 */
export const getWebhookSettings = cache(async (): Promise<WebhookSettings> => {
  // Build env fallbacks (keep working even if only N8N_WEBHOOK_URL is present)
  const envEnvironment =
    (process.env.N8N_ENVIRONMENT as 'testing' | 'production') || 'testing';

  const envTestingUrl =
    process.env.N8N_TESTING_URL ||
    ''; // leave blank if not present to force user input in UI

  const envProductionUrl =
    process.env.N8N_PRODUCTION_URL ||
    process.env.N8N_WEBHOOK_URL || // legacy single-url fallback
    '';

  const fallback: WebhookSettings = {
    environment: envEnvironment,
    testingUrl: envTestingUrl,
    productionUrl: envProductionUrl,
  };

  try {
    const row = await prisma.appSettings.findUnique({
      where: { key: 'webhook_settings' },
    });

    // If nothing stored, use env fallback
    if (!row?.value) {
      return fallback;
    }

    // Prisma returns `Json` which could be any; validate/normalize via Zod
    const parsed = settingsSchema.safeParse(row.value);

    if (!parsed.success) {
      // Stored value is malformed; return env fallback
      return fallback;
    }

    // Merge with env to backfill any optional values that might be missing
    // (schema requires all fields, but this keeps future compatibility)
    const normalized: WebhookSettings = {
      environment: parsed.data.environment ?? fallback.environment,
      testingUrl: parsed.data.testingUrl ?? fallback.testingUrl,
      productionUrl: parsed.data.productionUrl ?? fallback.productionUrl,
    };

    return normalized;
  } catch (error) {
    console.error('Failed to fetch webhook settings:', error);
    // On any error, still return a sensible fallback so UI can render
    return fallback;
  }
});
