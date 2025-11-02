'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/src/server/db';
import {
  campaignFormSchema,
  type CampaignFormData,
} from '@/src/features/campaigns/campaign.schema';
import { sendWebhookToN8n } from '@/src/server/webhooks/SendWebhookToN8n';
import { formDataToPrismaInput } from '@/src/lib/mappers/campaignFormDataMapper';

/**
 * Creates a new campaign.
 * Server Action for campaign creation with validation, database persistence, and webhook notification.
 */
export async function createCampaignAction(values: CampaignFormData) {
  try {
    // 1. Validate with Zod
    const validatedData = campaignFormSchema.parse(values);

    // 2. Transform to Prisma input
    // TODO: Get userId from auth session
    const prismaInput = formDataToPrismaInput(validatedData, 'user-id-placeholder');

    // 3. Save to database
    const campaign = await prisma.campaign.create({
      data: prismaInput,
      include: {
        personas: { include: { persona: true } },
        characters: { include: { character: true } },
        mergeFields: true,
      },
    });

    // 4. Send webhook (non-blocking)
    try {
      await sendWebhookToN8n({
        campaignId: campaign.id,
        action: 'campaign.created',
        data: campaign,
      });
    } catch (webhookError) {
      console.error('Webhook failed but campaign was saved:', webhookError);
    }

    // 5. Revalidate caches
    revalidateTag('campaigns');
    revalidateTag(`campaign-${campaign.id}`);

    return { success: true, campaignId: campaign.id, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        campaignId: null,
        error: error.flatten(),
      };
    }
    console.error('Campaign creation error:', error);
    return {
      success: false,
      campaignId: null,
      error: 'Failed to create campaign',
    };
  }
}
