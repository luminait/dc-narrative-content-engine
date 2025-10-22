import React, { useState, useEffect } from 'react';
import { Play, FileText, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/ui/shadcn/card';
import { Checkbox } from '@/ui/shadcn/checkbox';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { getAssetUrlFromRef } from './utils';
import type { CharacterAsset } from './types';

interface CharacterAssetGridProps {
    assets: CharacterAsset[];
    selectedAssets: Set<string>;
    onAssetToggle: (asset: CharacterAsset) => void;
}

export function CharacterAssetGrid({ assets, selectedAssets, onAssetToggle }: CharacterAssetGridProps) {
    const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});
    const [loadingUrls, setLoadingUrls] = useState<Set<string>>(new Set());

    // Load asset URLs when assets change
    useEffect(() => {
        const loadAssetUrls = async () => {
            const newLoadingUrls = new Set(loadingUrls);

            for (const asset of assets) {
                if (!assetUrls[asset.asset_ref] && !loadingUrls.has(asset.asset_ref)) {
                    newLoadingUrls.add(asset.asset_ref);
                    setLoadingUrls(new Set(newLoadingUrls));

                    try {
                        const url = await getAssetUrlFromRef(asset.asset_ref);
                        if (url) {
                            setAssetUrls(prev => ({ ...prev, [asset.asset_ref]: url }));
                        }
                    } catch (error) {
                        console.error('Error loading asset URL:', error);
                    } finally {
                        newLoadingUrls.delete(asset.asset_ref);
                        setLoadingUrls(new Set(newLoadingUrls));
                    }
                }
            }
        };

        loadAssetUrls();
    }, [assets]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 w-full">
            {assets.map((asset, index) => {
                const isSelected = selectedAssets.has(asset.asset_ref);
                const assetUrl = assetUrls[asset.asset_ref];
                const isLoadingUrl = loadingUrls.has(asset.asset_ref);

                // Extract filename from URL if available
                let filename = asset.asset_ref;
                if (assetUrl) {
                    try {
                        const urlPath = new URL(assetUrl).pathname;
                        filename = urlPath.split('/').pop() || asset.asset_ref;
                    } catch (e) {
                        // If URL parsing fails, use asset_ref
                        filename = asset.asset_ref;
                    }
                }

                const isImage = assetUrl ? /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(assetUrl) : true; // Assume image by default
                const isVideo = assetUrl ? /\.(mp4|mov|avi|mkv|webm)$/i.test(assetUrl) : false;

                return (
                    <Card
                        key={asset.asset_ref}
                        className={`cursor-pointer hover:shadow-md transition-shadow relative ${
                            isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => onAssetToggle(asset)}
                    >
                        <CardContent className="p-3">
                            <div className="relative">
                                {/* Checkbox */}
                                <div className="absolute top-2 left-2 z-10">
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => onAssetToggle(asset)}
                                        className="bg-white border-2"
                                    />
                                </div>

                                {/* Asset preview */}
                                <div className="relative h-24 w-full mb-3 bg-gray-100 rounded-lg overflow-hidden">
                                    {isLoadingUrl ? (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        </div>
                                    ) : assetUrl ? (
                                        isImage ? (
                                            <ImageWithFallback
                                                src={assetUrl}
                                                alt={filename}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : isVideo ? (
                                            <div className="relative w-full h-full">
                                                <video
                                                    src={assetUrl}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    preload="metadata"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                                    <Play className="h-6 w-6 text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <FileText className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FileText className="h-8 w-8 text-gray-400" />
                                            <span className="text-xs text-gray-500 ml-2">No URL</span>
                                        </div>
                                    )}
                                </div>

                                {/* Asset info */}
                                <div className="text-center">
                                    <p className="text-xs text-gray-600 truncate" title={filename}>
                                        {filename}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
