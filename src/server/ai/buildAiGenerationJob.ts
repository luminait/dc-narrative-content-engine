import { prisma } from '@/src/server/db';
import { randomUUID } from 'crypto';
import {
    AiGenerationJob,
    AiCharacter,
    AiCharacterAsset,
    AiPersona,
    AiMergeFieldConfig,
    Weekday,
    EventCadence,
    PostType,
    CaptionLength,
    VideoLengthSeconds,
    MergeFieldMediaValueType,
    MergeFieldType,
    MoralAlignment
} from './dto';

function toPublicUrl(bucketId: string, objectName: string): string {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!base) throw new Error('NEXT_PUBLIC_SUPABASE_URL not configured');
    return `${base}/storage/v1/object/public/${bucketId}/${objectName}`;
}

export async function buildAiGenerationJob(options: {
    campaignId: string;
    postId?: string;
    jobId?: string;
}): Promise<AiGenerationJob> {
    const { campaignId, postId, jobId } = options;

    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
            characters: {
                include: {
                    character: {
                        include: {
                            assets: {
                                include: {
                                    storageObject: true,
                                },
                            },
                        },
                    },
                },
            },
            personas: {
                include: {
                    persona: true,
                },
            },
            mergeFields: true,
            posts: postId ? { where: { id: postId } } : false,
        },
    });

    if (!campaign) {
        throw new Error(`Campaign not found: ${campaignId}`);
    }

    const post = postId && campaign.posts.length > 0 ? campaign.posts[0] : null;

    // Map Characters
    const aiCharacters: AiCharacter[] = campaign.characters.map((cc: { character: any; narrativeRole: any; recommendedScene: any; notes: any; }) => {
        const c = cc.character;
        const assets: AiCharacterAsset[] = c.assets.map((ca: { id: any; name: any; isPrimary: any; storageObject: { bucket_id: string; name: string; }; attributes: Record<string, unknown> | undefined; }) => ({
            id: ca.id,
            name: ca.name,
            isPrimary: ca.isPrimary ?? false,
            url: ca.storageObject.bucket_id && ca.storageObject.name
                ? toPublicUrl(ca.storageObject.bucket_id, ca.storageObject.name)
                : '',
            attributes: ca.attributes as Record<string, unknown> | undefined,
        })).filter(( a: { url: string; }) => a.url !== '');

        return {
            id: c.id,
            name: c.name,
            personality: c.personality,
            moralAlignment: c.moralAlignment as MoralAlignment | null,
            characterTypes: c.characterTypes,
            isHuman: c.isHuman,
            isTrainer: c.isTrainer,
            heightCentimeters: c.heightCentimeters,
            weightGrams: c.weightGrams,
            narrativeRole: cc.narrativeRole,
            recommendedScene: cc.recommendedScene,
            notes: cc.notes,
            assets,
        };
    });

    // Map Personas
    const aiPersonas: AiPersona[] = campaign.personas
        .filter((cp) => cp.persona != null)
        .map((cp: { persona: any; isPrimaryPersona: any; }) => ({
            id: cp.persona!.id,
            name: cp.persona!.name,
            description: cp.persona!.description,
            isPrimary: cp.isPrimaryPersona,
        }));

    // Map Merge Fields
    const mergeFieldsMap = new Map<string, AiMergeFieldConfig>();

    // First pass: Campaign level fields
    campaign.mergeFields.forEach((mf: { postId: any; name: string; id: any; description: any; mediaValueType: string; type: string | null; value: any; startTime: any; endTime: any; shouldRefreshOnRegenerate: any; }) => {
        if (mf.postId) return; // Skip post-specific ones here
        mergeFieldsMap.set(mf.name, {
            id: mf.id,
            name: mf.name,
            description: mf.description,
            mediaValueType: mf.mediaValueType as MergeFieldMediaValueType,
            mergeFieldType: mf.type as MergeFieldType | null,
            value: mf.value,
            timing: {
                start: mf.startTime ? Number(mf.startTime) : undefined,
                length: (mf.endTime && mf.startTime) ? Number(mf.endTime) - Number(mf.startTime) : undefined
            },
            shouldRefreshOnRegenerate: mf.shouldRefreshOnRegenerate ?? false,
        });
    });

    // Second pass: Post specific overrides
    if (post) {
        campaign.mergeFields.forEach((mf: { postId: any; name: string; id: any; description: any; mediaValueType: string; type: string | null; value: any; startTime: any; endTime: any; shouldRefreshOnRegenerate: any; }) => {
            if (mf.postId === post.id) {
                mergeFieldsMap.set(mf.name, {
                    id: mf.id,
                    name: mf.name,
                    description: mf.description,
                    mediaValueType: mf.mediaValueType as MergeFieldMediaValueType,
                    mergeFieldType: mf.type as MergeFieldType | null,
                    value: mf.value,
                    timing: {
                        start: mf.startTime ? Number(mf.startTime) : undefined,
                        length: (mf.endTime && mf.startTime) ? Number(mf.endTime) - Number(mf.startTime) : undefined
                    },
                    shouldRefreshOnRegenerate: mf.shouldRefreshOnRegenerate ?? false,
                });
            }
        });
    }

    const aiMergeFields = Array.from(mergeFieldsMap.values());

    return {
        schemaVersion: 'v1',
        jobId: jobId ?? randomUUID(),
        campaign: {
            id: campaign.id,
            title: campaign.title,
            objective: campaign.campaignObjective,
            narrativeContext: campaign.narrativeContext,
            isActive: campaign.isActive,
            isArchived: campaign.isArchived,
            isDraft: campaign.isDraft,
        },
        narrative: {
            characters: aiCharacters,
            personas: aiPersonas,
        },
        schedule: {
            campaignDateRange: {
                startDate: campaign.startDate?.toISOString(),
                endDate: campaign.endDate?.toISOString(),
            },
            cadence: {
                daysOfWeek: campaign.daysOfWeek as Weekday[],
                frequency: campaign.frequency as EventCadence,
            },
            targetPostTime: post?.scheduledAt?.toISOString(),
        },
        postConfig: {
            postType: (post?.postType ?? campaign.postType) as PostType,
            captionLength: campaign.postCaptionLength as CaptionLength,
            videoLengthSeconds: campaign.postVideoLength as VideoLengthSeconds | null,
            customInstructions: post?.customInstructions,
            existingPostId: post?.id,
            preferredHashtags: post?.hashtags,
        },
        mergeFields: aiMergeFields,
    };
}
