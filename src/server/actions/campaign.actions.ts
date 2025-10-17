
'use server';

import { revalidateTag } from 'next/cache';
import { prisma } from '@/src/server/db';
import { campaignFormSchema, type CampaignFormData } from '@/src/features/campaigns/campaign.schema';
import { sendWebhookToN8n } from '@/src/server/webhooks/SendWebhookToN8n';
import { formDataToPrismaInput } from '@/src/lib/mappers/campaignFormDataMapper';

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
