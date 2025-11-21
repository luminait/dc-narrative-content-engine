'use server'

import { z } from 'zod';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createSupabaseServerClient } from '@/src/server/supabase/server';
import { buildAiGenerationJob } from '@/src/server/ai/buildAiGenerationJob';

// Define the result schema
const GeneratedPostResultSchema = z.object({
    title: z.string().describe('A short, catchy title for the post'),
    caption: z.string().describe('The post caption, respecting the requested length and narrative style'),
    hashtags: z.array(z.string()).describe('An array of 3-10 relevant hashtags'),
});

export type GeneratedPostResult = z.infer<typeof GeneratedPostResultSchema> & {
    modelName?: string;
    usageTokens?: { input: number; output: number };
};

async function requireAuth(): Promise<string> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
        throw new Error('User not authenticated');
    }
    return data.user.id;
}

export async function generatePostForCampaignAction(input: {
    campaignId: string;
    postId?: string;
}): Promise<GeneratedPostResult> {
    // 1. Auth
    await requireAuth();

    // 2. Build Job
    const job = await buildAiGenerationJob({
        campaignId: input.campaignId,
        postId: input.postId,
    });

    // 3. Call AI
    // Construct a system prompt based on the job context
    const systemPrompt = `
You are an expert social media content creator for "Deez Collectibles", a Pokémon card brand.
Your goal is to generate a single social media post based on the provided campaign context and narrative.

CAMPAIGN OBJECTIVE:
${job.campaign.objective}

NARRATIVE CONTEXT:
${job.campaign.narrativeContext || 'No specific narrative context provided.'}

CHARACTERS:
${job.narrative.characters.map(c => `- ${c.name} (${c.narrativeRole || 'No role'}): ${c.personality || ''}`).join('\n')}

PERSONAS:
${job.narrative.personas.map(p => `- ${p.name}: ${p.description || ''}`).join('\n')}

POST CONFIGURATION:
- Type: ${job.postConfig.postType}
- Caption Length: ${job.postConfig.captionLength}
- Custom Instructions: ${job.postConfig.customInstructions || 'None'}

INSTRUCTIONS:
1. Generate a catchy title.
2. Write a caption that fits the "Degen Host" persona if applicable, or the general brand voice.
3. The caption length must match the requested length (${job.postConfig.captionLength}).
4. Include 3-10 relevant hashtags.
  `;

    try {
        const result = await generateObject({
            model: openai('gpt-4o'),
            schema: GeneratedPostResultSchema,
            system: systemPrompt,
            prompt: `Generate a post for campaign "${job.campaign.title}".`,
        });

        return {
            ...result.object,
            modelName: 'gpt-4o',
            usageTokens: {
                input: result.usage?.inputTokens ?? 0,
                output: result.usage?.outputTokens ?? 0,
            },
        };
    } catch (error) {
        console.error('AI Generation failed:', error);
        throw new Error('Failed to generate post content');
    }
}
