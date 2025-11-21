import type { AssetData } from "@/src/lib/zod/assets.schema";

/**
 * Shared type for merge field asset values passed between server and client.
 *
 * A value can either be a fully resolved AssetData from our storage, or a
 * looser variant produced when the source is a plain URL or a non-media field,
 * allowing several AssetData fields to be null.
 */
export type MergeFieldAsset =
  { type: string; objectName?: string | null; contentType?: string | null; isAudio?: boolean }
  & (
    | AssetData
    | {
        asset_ref: string | null;
        name: string;
        path_tokens: string[] | null;
        bucket_id: string | null;
        asset_url: string | null;
      }
  );

export type MergeFieldAssetMap = Record<string, MergeFieldAsset>;
