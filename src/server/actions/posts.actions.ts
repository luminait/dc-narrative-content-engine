'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/src/server/db';
import { postFormSchema, type PostFormData } from '@/src/features/campaigns/posts/postForm.schema';
import { sendWebhookToN8n } from '@/src/server/webhooks/SendWebhookToN8n';
import { createSupabaseServerClient } from '@/src/server/supabase/server';

/**
 * Server Action: Generate AI post content via n8n webhook.
 */
export async function generatePostContentAction(campaignId: string) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData?.user) {
            throw new Error('User not authenticated');
        }

        // Fetch campaign with RLS
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: {
                characters: { include: { character: true } },
                personas: { include: { persona: true } },
                mergeFields: true,
            },
        });

        if (!campaign) {
            throw new Error('Campaign not found');
        }

        // Send webhook to n8n for AI generation
        const webhookResponse = await sendWebhookToN8n({
            campaignId: campaign.id,
            action: 'post.generate',
            data: {
                objective: campaign.campaignObjective,
                characters: campaign.characters.map((c) => c.character.name),
                personas: campaign.personas.map((p) => p.persona?.name),
                postType: campaign.postType,
            },
        });

        return {
            success: true,
            content: webhookResponse.data,
            error: null,
        };
    } catch (error) {
        console.error('Post generation error:', error);
        return {
            success: false,
            content: null,
            error: error instanceof Error ? error.message : 'Failed to generate post',
        };
    }
}

/**
 * Server Action: Create a new post with boolean status flags.
 */
export async function createPostAction(campaignId: string, values: PostFormData) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData?.user) {
            throw new Error('User not authenticated');
        }

        // Validate with Zod
        const validatedData = postFormSchema.parse(values);

        // Create post with RLS - using boolean flags instead of status enum
        const post = await prisma.post.create({
            data: {
                campaignId,
                title: validatedData.title,
                content: validatedData.content,
                hashtags: validatedData.hashtags,
                isDraft: validatedData.isDraft,
                isActive: validatedData.isActive,
                isArchived: validatedData.isArchived,
                scheduledAt: validatedData.scheduledAt || null,
                images: validatedData.images
                    ? {
                        create: validatedData.images.map((img, index) => ({
                            objectId: img.url, // This should be the Supabase Storage object ID
                            position: img.order || index + 1,
                        })),
                    }
                    : undefined,
            },
            include: {
                images: true,
            },
        });

        // Revalidate caches
        revalidateTag('posts');
        revalidateTag(`campaign-${campaignId}-posts`);

        return { success: true, postId: post.id, error: null };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                postId: null,
                error: error.flatten(),
            };
        }
        console.error('Post creation error:', error);
        return {
            success: false,
            postId: null,
            error: error instanceof Error ? error.message : 'Failed to create post',
        };
    }
}
