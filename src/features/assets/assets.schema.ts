// Create a zod schema for assets
// {
//     "asset_ref": "f2f00b19-4489-4a0c-bbc0-4b251e4af773",
//     "name": "characters/greninja/char_greninja_pose_default_v1.png",
//     "path_tokens": [
//         "characters",
//         "greninja",
//         "char_greninja_pose_default_v1.png"
//     ],
//     "bucket_id": "pokemon-assets",
//     "asset_url": "https://kjueavqphwsjnnbikphw.supabase.co/storage/v1/object/public/pokemon-assets/characters/greninja/char_greninja_pose_default_v1.png"
// }
import { z } from 'zod';

/**
 * Schema for validating assets returned from the database,
 */
export const assetSchema = z.object({
    asset_ref: z.uuid(),
    name: z.string(),
    path_tokens: z.array(z.string()),
    bucket_id: z.string(),
    asset_url: z.url(),
});

export type AssetData = z.infer<typeof assetSchema>;


/**
 * Schema for validating requests to the get-url-from-asset-ref Edge Function.
 */
export const GetAssetUrlSchema = z.object({
    asset_ref: z.uuid("Invalid asset_ref: must be a valid UUID string"),
});

/**
 * TypeScript type inferred from the schema.
 * Use this for strong typing in your server actions or API handlers.
 */
export type GetAssetUrlInput = z.infer<typeof GetAssetUrlSchema>;
