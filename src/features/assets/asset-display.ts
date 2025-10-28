import { isMediaAssetType, isAssetReferenceId } from '@/src/lib/utils/assets.utils';
import { isAssetSystemAvailable } from './availability';

export function getAssetDisplayValue(
    asset: string,
    mediaType: string,
    assetRefNames: Record<string, string>,
    loadingAssetRefs: Set<string>,
    resolveAssetReferenceCallback: (assetRefId: string) => void,
): string {
    if (asset.includes(':')) {
        const [characterName, filename] = asset.split(':', 2);
        return `${characterName}:${filename}`;
    }

    if (isMediaAssetType(mediaType) && isAssetReferenceId(asset)) {
        if (assetRefNames[asset]) return assetRefNames[asset];
        if (loadingAssetRefs.has(asset)) return 'Resolving...';
        if (isAssetSystemAvailable() === false) return `[Asset ID: ${asset.slice(-8)}]`;
        setTimeout(() => resolveAssetReferenceCallback(asset), 0);
        return `[${mediaType}] ${asset.slice(-8)}...`;
    }

    return asset;
}
