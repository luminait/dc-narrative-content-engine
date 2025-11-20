'use server'

import { createSupabaseServerClient } from '@/src/server/supabase/server';
import { buildAiGenerationJob } from '@/src/server/ai/buildAiGenerationJob';
import { shotstackService } from '@/src/server/shotstack/shotstack.service';

export interface GenerateVideoResult {
    renderId: string;
    message: string;
    status: 'queued' | 'fetching' | 'rendering' | 'done' | 'failed';
    url?: string;
}

async function requireAuth(): Promise<string> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
        throw new Error('User not authenticated');
    }
    return data.user.id;
}

export async function generateVideoForPostAction(input: {
    campaignId: string;
    postId?: string;
}): Promise<GenerateVideoResult> {
    // 1. Auth
    await requireAuth();

    // 2. Build Job
    const job = await buildAiGenerationJob({
        campaignId: input.campaignId,
        postId: input.postId,
    });

    // 3. Call Shotstack
    try {
        const response = await shotstackService.renderVideo(job);

        return {
            renderId: response.id,
            message: response.message,
            status: 'queued',
        };
    } catch (error) {
        console.error('Shotstack Generation failed:', error);
        throw new Error('Failed to queue video generation');
    }
}

export async function getVideoRenderStatusAction(renderId: string): Promise<GenerateVideoResult> {
    await requireAuth();

    try {
        const response = await shotstackService.getRenderStatus(renderId);

        return {
            renderId: response.id,
            message: response.message || response.status,
            status: response.status,
            url: response.url,
        };
    } catch (error) {
        console.error('Shotstack Status Check failed:', error);
        throw new Error('Failed to check render status');
    }
}
