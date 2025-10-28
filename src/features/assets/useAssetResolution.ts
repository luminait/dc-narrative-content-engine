import { useCallback } from 'react';
import { resolveAssetReferenceForFilename } from './asset-resolver.client';

export function useAssetResolution(
    assetRefNames: Record<string, string>,
    setAssetRefNames: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    setAssetUrls: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    setLoadingAssetRefs: React.Dispatch<React.SetStateAction<Set<string>>>,
) {
    return useCallback(async (assetRefId: string) => {
        if (assetRefNames[assetRefId]) return assetRefNames[assetRefId];
        setLoadingAssetRefs(prev => new Set([...prev, assetRefId]));
        try {
            const { filename, assetUrl } = await resolveAssetReferenceForFilename(assetRefId);
            const name = filename ?? `[Asset ID: ${assetRefId.slice(-8)}]`;
            setAssetRefNames(prev => ({ ...prev, [assetRefId]: name }));
            if (assetUrl) setAssetUrls(prev => ({ ...prev, [assetRefId]: assetUrl }));
            return name;
        } finally {
            setLoadingAssetRefs(prev => { const s = new Set(prev); s.delete(assetRefId); return s; });
        }
    }, [assetRefNames, setAssetRefNames, setAssetUrls, setLoadingAssetRefs]);
}
