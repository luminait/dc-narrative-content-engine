'use server';

import { revalidateTag } from 'next/cache';
import { settingsSchema, type WebhookSettings } from '@/src/lib/zod/settings.schema';
import { prisma } from '@/src/server/db';

/**
 * Server action to update webhook settings.
 * Stores settings in the database (or env vars) and revalidates the cache.
 */
export async function settingsAction( settings: WebhookSettings) {
  try {
    // Validate input
    const validated = settingsSchema.parse(settings);

    // Store in database (example using Prisma)
    // Alternatively, you could update .env.local via file system writes
    // For production, consider using a settings table or Supabase config
    await prisma.appSettings.upsert({
      where: { key: 'webhook_settings' },
      update: { value: validated },
      create: { key: 'webhook_settings', value: validated },
    });

    // Revalidate settings cache
    revalidateTag('webhook-settings');

    return { success: true };
  } catch (error) {
    console.error('Failed to update webhook settings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update settings',
    };
  }
}
