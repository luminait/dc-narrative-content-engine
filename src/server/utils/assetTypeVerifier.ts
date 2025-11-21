"use server";

// Utilities to verify asset content type via HTTP without downloading the whole file.
// Includes a small in-memory cache to avoid duplicate HEADs during a single request lifecycle.

import { isAudioFromHints } from "@/src/lib/utils/mediaDetection";

const contentTypeCache = new Map<string, string | null>();

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    promise
      .then((value) => {
        clearTimeout(id);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(id);
        reject(err);
      });
  });
}

export async function fetchContentTypeForUrl(url: string, { timeoutMs = 3500 }: { timeoutMs?: number } = {}): Promise<string | null> {
  try {
    if (contentTypeCache.has(url)) return contentTypeCache.get(url) ?? null;

    // Try HEAD first
    try {
      const headResp = await withTimeout(fetch(url, { method: 'HEAD' }), timeoutMs);
      const ct = headResp.headers.get('content-type');
      if (ct) {
        contentTypeCache.set(url, ct);
        return ct;
      }
    } catch (_e) {
      // Ignore, will try GET fallback
    }

    // Fallback to ranged GET (first byte) to elicit headers on providers that don't support HEAD
    try {
      const getResp = await withTimeout(fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' } }), timeoutMs);
      const ct = getResp.headers.get('content-type');
      if (ct) {
        contentTypeCache.set(url, ct);
        return ct;
      }
    } catch (_e2) {
      // ignore
    }

    contentTypeCache.set(url, null);
    return null;
  } catch (_err) {
    return null;
  }
}

export type DetermineAssetKindParams = {
  url?: string | null;
  objectName?: string | null;
  mediaValueType?: string | null;
  semanticType?: string | null;
  guessedContentType?: string | null; // from filename if any
};

export type DetermineAssetKindResult = {
  contentType: string | null;
  isAudio: boolean;
  isVideo: boolean;
  isImage: boolean;
};

export async function determineAssetKind(params: DetermineAssetKindParams): Promise<DetermineAssetKindResult> {
  const { url, objectName, mediaValueType, semanticType, guessedContentType } = params;

  let contentType: string | null = guessedContentType || null;

  const tryFetch = !contentType && url ? true : false;

  if (tryFetch) {
    const fetched = await fetchContentTypeForUrl(url!);
    if (fetched) contentType = fetched;
  }

  // Decide kinds
  const ct = contentType || undefined;
  const isAudio = isAudioFromHints({ mediaValueType, semanticType, contentType: ct, objectName, url: url || null });
  const isVideo = !!ct?.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi)$/i.test(objectName ?? '') || false;
  const isImage = !!ct?.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(objectName ?? '') || false;

  return { contentType: contentType || null, isAudio, isVideo, isImage };
}
