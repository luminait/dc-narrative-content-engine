'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/src/server/db';
import {
  campaignFormSchema,
  type CampaignFormData,
} from '@/src/lib/zod/campaign.schema';
import { sendWebhookToN8n } from '@/src/server/webhooks/SendWebhookToN8n';
import { formDataToPrismaInput } from '@/src/lib/mappers/campaignFormDataMapper';
import { createSupabaseServerClient } from '@/src/server/supabase/server';

/**
 * Creates a new campaign.
 * Server Action for campaign creation with validation, database persistence, and webhook notification.
 */
export async function createCampaignAction(values: CampaignFormData) {
  try {
    // 0. Get User and Ensure Profile Exists
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      throw new Error('User not authenticated');
    }
    const authUser = authData.user;

    // Ensure a public user profile exists.
    if (!authUser.email) {
      throw new Error('User email is not available, cannot create profile.');
    }
    await prisma.user.upsert({
      where: { userId: authUser.id },
      update: {},
      create: {
        userId: authUser.id,
        email: authUser.email,
      },
    });

    // 1. Validate with Zod
    const validatedData = campaignFormSchema.parse(values);

    // 2. Transform to Prisma input
    const prismaInput = formDataToPrismaInput(validatedData, authUser.id);

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
      error:
        error instanceof Error ? error.message : 'Failed to create campaign',
    };
  }
}

/**
 * Campaign action types
 */
export type CampaignAction = 'archive' | 'unpublish' | 'delete';

/**
 * Handles various campaign actions (archive, unpublish, delete).
 * Server Action for campaign state management.
 */
export async function handleCampaignAction(
  campaignId: string,
  action: CampaignAction
) {
  try {
    // Get User and verify authentication
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      throw new Error('User not authenticated');
    }

    // Verify the campaign exists and belongs to the user
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.createdBy !== authData.user.id) {
      throw new Error('Unauthorized: You do not own this campaign');
    }

    // Perform the action
    switch (action) {
      case 'archive':
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { isArchived: true, isActive: false },
        });
        break;

      case 'unpublish':
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { isActive: false },
        });
        break;

      case 'delete':
        await prisma.campaign.delete({
          where: { id: campaignId },
        });
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Send webhook notification (non-blocking)
    try {
      await sendWebhookToN8n({
        campaignId,
        action: `campaign.${action}`,
        data: { campaignId, action },
      });
    } catch (webhookError) {
      console.error('Webhook failed but action was performed:', webhookError);
    }

    // Revalidate caches
    revalidateTag('campaigns');
    revalidateTag(`campaign-${campaignId}`);

    return { success: true, error: null };
  } catch (error) {
    console.error(`Campaign ${action} error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : `Failed to ${action} campaign`,
    };
  }
}
