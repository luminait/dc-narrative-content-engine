import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Skeleton } from '@/ui/shadcn/skeleton';
import { Alert, AlertDescription } from '@/ui/shadcn/alert';
import type { Campaign, Character, Persona } from '@/src/lib/types/ui';
import { isAssetSystemAvailable } from '@/src/features/assets';
import { MergeField } from "@/src/features/campaigns/campaign.schema";
import { Badge } from "@/ui/shadcn/badge";
import { getAssetUrl } from "@/src/server/actions/assets";
import type { AssetData } from "@/src/features/assets/assets.schema";


// Mapping of merge field types to their corresponding asset types and values
type MergeFieldEntry = [ string, MergeFieldAsset ];
type MergeFieldAsset = { type: string } & AssetData;

interface MergeFieldsTabProps {
    campaign: Campaign;
    campaignMergeFields: MergeField[];
    campaignPersonas: Persona[];
    campaignCharacters: Character[];
    mergeFieldsLoading: boolean;
    mergeFieldsError: string | null;
    campaignMergeFieldValues: Record<string, MergeFieldAsset>;
}

export function MergeFieldsTab( {
                                    campaignMergeFieldValues,
                                    campaign,
                                    campaignMergeFields,
                                    mergeFieldsLoading,
                                    mergeFieldsError,
                                    campaignPersonas,
                                    campaignCharacters,
                                }: MergeFieldsTabProps ) {


    return (
        <>
            {/* Merge Fields Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Merge Fields</CardTitle>
                    <CardDescription>
                        Manage asset pools for each merge field in this campaign
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Asset System Status Warning */}
                    {!mergeFieldsLoading && isAssetSystemAvailable() === false && (
                        <Alert className="border-orange-200 bg-orange-50 justify-start">
                            <AlertCircle className="h-4 w-4 text-orange-600"/>
                            <AlertDescription className="text-orange-800">
                                <strong>Asset resolution system is not available.</strong> Asset reference IDs will be
                                displayed as shortened identifiers instead of resolved filenames or URLs. <br/>This is
                                expected if the assets database table hasn't been set up yet or if the asset management
                                system is not configured.
                            </AlertDescription>
                        </Alert>
                    )}
                    {mergeFieldsLoading ? (
                        <div className="space-y-4">
                            {[ ...Array( 3 ) ].map( ( _, i ) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-1/4"/>
                                    <Skeleton className="h-10 w-full"/>
                                </div>
                            ) )}
                        </div>
                    ) : mergeFieldsError ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4"/>
                            <AlertDescription>{mergeFieldsError}</AlertDescription>
                        </Alert>
                    ) : campaignMergeFields.length > 0 ? (
                        <div className={"space-y-8"}>
                            {campaignPersonas.length > 0 && (
                                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                    <h5 className="font-medium text-blue-800 mb-2">Available Campaign Personas:</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {campaignPersonas.map( ( persona ) => (
                                            <Badge
                                                key={persona.id}
                                                variant="secondary"
                                                className="bg-blue-100 text-blue-800"
                                            >
                                                {persona.name} ({persona.isPrimaryPersona ? 'Primary' : 'Secondary'})
                                            </Badge>
                                        ) )}
                                    </div>
                                    <p className="text-sm text-blue-700 mt-2">
                                        These personas are associated with this campaign and can be used in merge
                                        fields.
                                    </p>
                                </div>
                            )}

                            {campaignMergeFields.map( ( field, fieldIndex ) => (
                                <div key={fieldIndex}
                                     className="space-y-4 pb-6 border-b border-gray-100 last:border-b-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-medium text-lg">{field.name}</h4>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {field.mediaValueType}
                                                </Badge>
                                                {field.type && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {field.type}
                                                    </Badge>
                                                )}

                                            </div>
                                            <p className={"text-sm text-gray-600 mb-3"}>
                                                {field.description}
                                            </p>
                                            {/* Default Value Display */}
                                            {field.value && (
                                                <div className={"bg-gray-50 p-3 rounded-lg mb-4"}>
                                                    <div
                                                        className={"grid grid-cols-1 gap-2 md:flex md:gap-4 md:items-start"}>
                                                        <span
                                                            className={"text-sm font-medium text-gray-700"}>Value:</span>
                                                        <div
                                                            className={"text-sm text-blue-600 hover:text-blue-800 cursor-pointer break-all"}
                                                            title={"Click to open asset in new tab"}
                                                        >
                                                            {field.mediaValueType === "text" && ( field.value )}
                                                            {field.mediaValueType === 'image' && (
                                                                <img
                                                                    src={campaignMergeFieldValues[field.value]?.asset_url}
                                                                    alt={campaignMergeFieldValues[field.value]?.name || field.value}
                                                                /> )}
                                                            {field.mediaValueType === 'video' && (
                                                                <video
                                                                    controls
                                                                    width="480"
                                                                    className="rounded-md border border-gray-200"
                                                                >
                                                                    <source
                                                                        src={campaignMergeFieldValues[field.value]?.asset_url}
                                                                        type="video/mp4"
                                                                    />
                                                                    Your browser does not support the video tag.
                                                                </video>
                                                            )}

                                                            {field.mediaValueType && ['audio_music', 'audio_voice', 'gen_ai_voice'].includes(field.mediaValueType) && (
                                                                <audio
                                                                    controls
                                                                    className="w-full mt-2"
                                                                >
                                                                    <source
                                                                        src={campaignMergeFieldValues[field.value]?.asset_url}
                                                                        type="audio/mpeg"
                                                                    />
                                                                    Your browser does not support the audio element.
                                                                </audio>
                                                            )}

                                                            {field.mediaValueType === 'image_or_video' && (
                                                                campaignMergeFieldValues[field.value]?.asset_url?.match(/\.(mp4|mov|webm)$/i) ? (
                                                                    <video
                                                                        controls
                                                                        width="480"
                                                                        className="rounded-md border border-gray-200"
                                                                    >
                                                                        <source
                                                                            src={campaignMergeFieldValues[field.value]?.asset_url}
                                                                            type="video/mp4"
                                                                        />
                                                                        Your browser does not support the video tag.
                                                                    </video>
                                                                ) : (
                                                                    <img
                                                                        src={campaignMergeFieldValues[field.value]?.asset_url}
                                                                        alt={campaignMergeFieldValues[field.value]?.name || field.value}
                                                                        className="rounded-md w-full object-contain"
                                                                    />
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) )}
                        </div>

                    ) : (
                        <p className="text-gray-500 text-sm">No merge fields found for this campaign.</p>
                    )}
                </CardContent>
            </Card>
        </>

    );
}
