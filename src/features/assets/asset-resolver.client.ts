import { projectId, publicAnonKey } from '@/src/config/supabase.public';
import { isAssetsTableMissingError } from '@/src/lib/utils/assets.utils';
import { isAssetSystemAvailable, markAssetSystemAvailable, markAssetSystemUnavailable } from './availability';

const endpoint = `https://${projectId}.supabase.co/functions/v1/get-url-from-asset-ref`;

export async function resolveAssetReferenceForFilename(assetRefId: string) {
    if (!projectId || !publicAnonKey) throw new Error('Supabase configuration missing');
    if (!isAssetSystemAvailable() && isAssetSystemAvailable() !== null) return { filename: null, assetUrl: null };

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { Authorization: `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ asset_ref: assetRefId }),
        });

        if (!res.ok) {
            const text = await res.text();
            try { if (JSON.parse(text)?.fallback || isAssetsTableMissingError(JSON.parse(text))) { markAssetSystemUnavailable(); return { filename: null, assetUrl: null }; } }
            catch { if (isAssetsTableMissingError(text)) { markAssetSystemUnavailable(); return { filename: null, assetUrl: null }; } }
            markAssetSystemUnavailable(); return { filename: null, assetUrl: null };
        }

        const data = await res.json();
        if (data.fallback) { markAssetSystemUnavailable(); return { filename: null, assetUrl: null }; }
        markAssetSystemAvailable();

        const filename = Array.isArray(data.path_tokens) && data.path_tokens.length
            ? data.path_tokens[data.path_tokens.length - 1]
            : (data.name ?? null);

        const assetUrl = data.asset_url ?? null;
        return { filename, assetUrl };
    } catch (e) {
        if (isAssetsTableMissingError(e)) markAssetSystemUnavailable();
        return { filename: null, assetUrl: null };
    }
}

export async function getAssetUrlFromRef(assetRefId: string): Promise<string | null> {
    if (!projectId || !publicAnonKey) throw new Error('Supabase configuration missing');

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { Authorization: `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ asset_ref: assetRefId }),
        });

        if (!res.ok) {
            const text = await res.text();
            try { if (JSON.parse(text)?.fallback || isAssetsTableMissingError(JSON.parse(text))) { markAssetSystemUnavailable(); return null; } }
            catch { if (isAssetsTableMissingError(text)) { markAssetSystemUnavailable(); return null; } }
            markAssetSystemUnavailable(); return null;
        }

        const data = await res.json();
        if (data.fallback) { markAssetSystemUnavailable(); return null; }
        markAssetSystemAvailable();
        return data.asset_url ?? null;
    } catch (e) {
        if (isAssetsTableMissingError(e)) markAssetSystemUnavailable();
        return null;
    }
}
