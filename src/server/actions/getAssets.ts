"use server";

import { getAssetUrl } from "@/src/server/actions/assets";

export async function getAssetAction(asset_ref: string) {
    const asset = await getAssetUrl({ asset_ref });
    return asset;
}


export async function getAssetsAction(asset_refs: string[]) {
    const assets = await Promise.all(asset_refs.map(getAssetAction));
    return assets;
}
