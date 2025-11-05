"use server";

import { getAssetUrlFromAssetRef } from "@/src/server/actions/assets";

export async function getAssetFromAssetRefAction( asset_ref: string) {
    const asset = await getAssetUrlFromAssetRef( asset_ref );
    return asset;
}


export async function getAssetsAction(asset_refs: string[]) {
    const assets = await Promise.all(asset_refs.map(getAssetFromAssetRefAction));
    return assets;
}
