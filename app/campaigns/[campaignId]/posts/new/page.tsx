import { notFound } from 'next/navigation';
import { getCampaignById } from '@/src/server/queries/campaigns.queries';
import PostGeneratorClient from '@/src/features/campaigns/posts/new/PostGeneratorClient';
import { getCharactersForCampaign } from '@/src/server/queries/characters.queries';
import { getMergeFieldsForCampaignId } from '@/src/server/queries/mergefields.queries';
import { getAssetUrlFromAssetRef } from '@/src/server/actions/assets';
import type { MergeField } from '@/src/lib/zod/campaign.schema';
import type { AssetData } from '@/src/lib/zod/assets.schema';
import type { Character } from '@/src/lib/types/ui';
import { isMediaAssetType } from '@/src/features/assets';
import { guessAudioMime } from '@/src/lib/utils/mediaDetection';
import { determineAssetKind } from '@/src/server/utils/assetTypeVerifier';

interface PageProps {
    params: Promise<{ campaignId: string }>;
}

export default async function PostGeneratorPage({ params }: PageProps) {
    const { campaignId } = await params;

    // Fetch campaign with RLS on server
    const campaign = await getCampaignById(campaignId);

    if (!campaign) {
        notFound();
    }

    // Server-side: fetch characters and resolve asset refs to URLs for previews
    type MergeFieldAsset = (
        { type: string; objectName?: string | null; contentType?: string | null; isAudio?: boolean } & AssetData
    );

    const guessMimeFromNameOrUrl = (path?: string | null): string | undefined => {
        if (!path) return undefined;
        const lower = path.split('?')[0]?.toLowerCase?.() || '';
        // Use audio guesser first
        const audio = guessAudioMime(lower);
        if (audio) return audio;
        if (lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.webm')) return 'video/mp4';
        if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif') || lower.endsWith('.webp')) return 'image/*';
        return undefined;
    };

    async function resolveMergeFieldValues(fields: MergeField[]): Promise<Record<string, MergeFieldAsset>> {
        const entries = await Promise.all(
            fields.map(async (f) => {
                try {
                    if (!f.value || !f.mediaValueType) return null;

                    const isUrl = /^(https?|ftp):\/\/[^\s\/$.?#].\S*$/i.test(f.value);

                    if (isMediaAssetType(String(f.mediaValueType))) {
                        if (isUrl) {
                            const prelim = guessMimeFromNameOrUrl(f.value) || null;
                            let kind: { contentType: string | null; isAudio: boolean } = { contentType: prelim || null, isAudio: /^audio\//.test(prelim || '') };
                            try {
                                kind = await determineAssetKind({ url: f.value, objectName: null, mediaValueType: String(f.mediaValueType), guessedContentType: prelim });
                            } catch (_e) {
                                // Non-fatal: fall back to prelim guesses
                            }
                            return [
                                f.value,
                                {
                                    type: String(f.mediaValueType),
                                    asset_ref: f.value,
                                    name: f.name,
                                    asset_url: f.value,
                                    path_tokens: null,
                                    bucket_id: null,
                                    objectName: null,
                                    contentType: kind.contentType,
                                    isAudio: kind.isAudio,
                                },
                            ] as const;
                        } else {
                            const assetData = await getAssetUrlFromAssetRef(f.value);
                            if (!assetData) return null;
                            const objectName = assetData.name;
                            const prelim = guessMimeFromNameOrUrl(objectName) || null;
                            let kind: { contentType: string | null; isAudio: boolean } = { contentType: prelim || null, isAudio: /^audio\//.test(prelim || '') };
                            try {
                                kind = await determineAssetKind({ url: assetData.asset_url, objectName, mediaValueType: String(f.mediaValueType), guessedContentType: prelim });
                            } catch (_e) {
                                // Non-fatal: fall back to prelim guesses
                            }
                            return [
                                f.value,
                                { type: String(f.mediaValueType), ...assetData, objectName, contentType: kind.contentType, isAudio: kind.isAudio },
                            ] as const;
                        }
                    }

                    // Non-media types: still include an entry so lookups are safe
                    return [
                        f.value,
                        {
                            type: String(f.mediaValueType),
                            asset_ref: null,
                            name: f.name,
                            path_tokens: null,
                            bucket_id: null,
                            asset_url: null,
                        },
                    ] as const;
                } catch (err) {
                    console.error('[posts/new] Failed to resolve merge field', { fieldId: f.id, name: f.name, value: f.value }, err);
                    return null;
                }
            })
        );

        return Object.fromEntries(entries.filter((e): e is readonly [string, MergeFieldAsset] => !!e));
    }

    const [rawCharacters, mergeFields] = await Promise.all([
        getCharactersForCampaign(campaign.id),
        getMergeFieldsForCampaignId(campaign.id),
    ]);

    const campaignCharacters: Character[] = rawCharacters as unknown as Character[];
    const campaignMergeFieldValues = await resolveMergeFieldValues(mergeFields as unknown as MergeField[]);

    return (
        <PostGeneratorClient
            campaign={campaign}
            campaignCharacters={campaignCharacters}
            campaignMergeFieldValues={campaignMergeFieldValues}
        />
    );
}
