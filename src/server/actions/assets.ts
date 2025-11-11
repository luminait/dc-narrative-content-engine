import { assetSchema } from "@/src/lib/zod/assets.schema";
import { z } from "zod";

const SUPABASE_EDGE_URL = process.env.NEXT_PUBLIC_SUPABASE_EDGE_URL ?? "";
const FUNCTION_NAME = "get-url-from-asset-ref";

export async function getAssetUrlFromAssetRef( asset_ref: string) {
    // ✅ Validate the input
    // const { asset_ref } = assetSchema.parse(input);

    if (!SUPABASE_EDGE_URL) {
        console.error('CRITICAL: NEXT_PUBLIC_SUPABASE_EDGE_URL is not set in .env.local');
        throw new Error('Server configuration error: Missing Edge Function URL.');
    }

    // ✅ Call the Edge Function
    const res = await fetch(`${SUPABASE_EDGE_URL}/${FUNCTION_NAME}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // (optional) auth header if you use Supabase Auth
            // "Authorization": `Bearer ${supabaseAuthToken}`
        },
        body: JSON.stringify({ asset_ref: asset_ref }),
    });

    const json = await res.json();

    if (!res.ok) {
        console.error("Error from Edge Function:", json);
        throw new Error(json.error || "Failed to fetch asset URL");
    }

    return json as {
        asset_ref: string;
        name: string;
        path_tokens: string[];
        bucket_id: string;
        asset_url: string;
    };
}
