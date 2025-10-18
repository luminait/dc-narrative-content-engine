
'use server';

import { revalidateTag } from 'next/cache';
import { prisma } from '@/src/server/db';
import { campaignFormSchema, type CampaignFormData } from '@/src/features/campaigns/campaign.schema';
import { sendWebhookToN8n } from '@/src/server/webhooks/SendWebhookToN8n';
import { formDataToPrismaInput } from '@/src/lib/mappers/campaignFormDataMapper';


/**
 * Campaign action type definition
 */
export type CampaignAction = 'archive' | 'unpublish' | 'delete';

/**
 * Handles campaign state changes (archive, unpublish, delete).
 * Unified server action for common campaign status mutations.
 */
export async function handleCampaignAction(
    campaignId: string,
    action: CampaignAction
) {
    'use server';

    try {
        switch (action) {
            case 'archive':
                await prisma.campaign.update({
                    where: { id: campaignId },
                    data: { isArchived: true },
                });
                break;

            case 'unpublish':
                await prisma.campaign.update({
                    where: { id: campaignId },
                    data: { isActive: false },
                });
                break;

            case 'delete':
                await prisma.campaign.update({
                    where: { id: campaignId },
                    data: { deletedAt: new Date() },
                });
                break;

            default:
                throw new Error(`Unknown campaign action: ${action}`);
        }

        // Revalidate caches
        revalidateTag('campaigns');
        revalidateTag(`campaign-${campaignId}`);

        return { success: true, action };
    } catch (error) {
        console.error(`Campaign ${action} error:`, error);
        throw new Error(`Failed to ${action} campaign`);
    }
}



/**
 * Fetches all campaigns.
 * Server Action for retrieving campaigns with related data.
 */
export async function getCampaignsAction() {
    'use server';

    try {
        const campaigns = await prisma.campaign.findMany({
            where: { deletedAt: null },
            include: {
                personas: { include: { persona: true } },
                characters: { include: { character: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });

        return { success: true, campaigns };
    } catch (error) {
        console.error('Campaign fetch error:', error);
        throw new Error('Failed to fetch campaigns');
    }
}

/**
 * Fetches a single campaign by ID.
 * Server Action for retrieving a specific campaign with full details.
 */
export async function getCampaignByIdAction(campaignId: string) {
    'use server';

    try {
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId, deletedAt: null },
            include: {
                personas: { include: { persona: true } },
                characters: { include: { character: true } },
                mergeFields: true,
            },
        });

        if (!campaign) {
            throw new Error('Campaign not found');
        }

        return { success: true, campaign };
    } catch (error) {
        console.error('Campaign fetch error:', error);
        throw new Error('Failed to fetch campaign');
    }
}

/**
 * Creates a new campaign.
 * Server Action for campaign creation with validation, database persistence, and webhook notification.
 */
export async function createCampaignAction(formData: CampaignFormData) {
    // 1. Validate with Zod
    const validatedData = campaignFormSchema.parse(formData);

    try {
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

        return { success: true, campaignId: campaign.id };
    } catch (error) {
        console.error('Campaign creation error:', error);
        throw new Error('Failed to create campaign');
    }
}

/**
 * Updates a campaign's status.
 */
export async function updateCampaignStatusAction(
    campaignId: string,
    isActive: boolean,
    isArchived: boolean
) {
    'use server';

    try {
        await prisma.campaign.update({
            where: { id: campaignId },
            data: { isActive, isArchived },
        });

        revalidateTag('campaigns');
        revalidateTag(`campaign-${campaignId}`);

        return { success: true };
    } catch (error) {
        console.error('Campaign status update error:', error);
        throw new Error('Failed to update campaign status');
    }
}

/**
 * Deletes a campaign (soft delete via deletedAt).
 */
export async function deleteCampaignAction(campaignId: string) {
    'use server';

    try {
        await prisma.campaign.update({
            where: { id: campaignId },
            data: { deletedAt: new Date() },
        });

        revalidateTag('campaigns');

        return { success: true };
    } catch (error) {
        console.error('Campaign deletion error:', error);
        throw new Error('Failed to delete campaign');
    }
}
