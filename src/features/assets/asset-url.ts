import { projectId, publicAnonKey } from '@/src/config/supabase.public';
import { isMediaAssetType, isAssetReferenceId } from '@/src/lib/utils/assets.utils';
import { getAssetUrlFromRef } from './asset-resolver.client';

export const canOpenAsset = (asset: string, mergeField: any): boolean => {
    const mediaType = mergeField.media_value_type;
    const type = mergeField.merge_field_type;
    if (isMediaAssetType(mediaType) && isAssetReferenceId(asset)) return true;
    if (asset.includes(':')) return true;
    if (type === 'environment' || type === 'luma_matte' || ['music','audio_music','audio_voice'].includes(mediaType)) return true;
    return false;
};

export async function buildAssetUrl(
    asset: string,
    mergeField: any,
    campaignTitle: string,
    assetUrls: Record<string, string>,
): Promise<string | null> {
    const mediaType = mergeField.media_value_type;
    const type = mergeField.merge_field_type;

    if (isMediaAssetType(mediaType) && isAssetReferenceId(asset)) {
        return assetUrls[asset] ?? (await getAssetUrlFromRef(asset));
    }

    if (asset.includes(':')) {
        const [characterName, filename] = asset.split(':', 2);
        if (isAssetReferenceId(filename)) {
            return assetUrls[filename] ?? (await getAssetUrlFromRef(filename));
        }
        const cn = characterName.toLowerCase();
        return `https://${projectId}.supabase.co/storage/v1/object/public/pokemon-assets/characters/${cn}/${filename}`;
    }

    const campaignName = campaignTitle.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    if (type === 'environment') {
        const env = mergeField.merge_field.replace('environment_', '');
        return `https://${projectId}.supabase.co/storage/v1/object/public/pokemon-assets/environments/${env}/${campaignName}/${asset}`;
    }
    if (type === 'luma_matte') {
        const env = mergeField.merge_field.replace('luma_matte_', '');
        return `https://${projectId}.supabase.co/storage/v1/object/public/pokemon-assets/environments/${env}/${campaignName}/luma_mattes/${asset}`;
    }
    if (mediaType === 'music' || mediaType === 'audio_music') {
        return `https://${projectId}.supabase.co/storage/v1/object/public/pokemon-assets/music/${campaignName}/${asset}`;
    }
    if (mediaType === 'audio_voice') {
        return `https://${projectId}.supabase.co/storage/v1/object/public/pokemon-assets/voiceover/${campaignName}/${asset}`;
    }
    return null;
}

