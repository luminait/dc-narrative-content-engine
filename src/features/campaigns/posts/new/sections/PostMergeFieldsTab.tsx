'use client';

import { Badge } from "@/ui/shadcn/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/shadcn/card";
import type { CampaignData } from "@/src/features/campaigns/campaign.schema";

interface PostMergeFieldsTabProps {
    campaign: CampaignData;
}

export default function PostMergeFieldsTab({ campaign }: PostMergeFieldsTabProps) {
    // For now, we'll display the campaign's merge fields
    // Later, this will allow customization of merge field values for this specific post
    const campaignMergeFields = campaign.mergeFields || [];

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Post Asset Customization</CardTitle>
                    <CardDescription>
                        Customize merge field values for this specific post. Default values are inherited from the campaign.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {campaignMergeFields.length > 0 ? (
                        <div className="space-y-8">
                            {campaignMergeFields.map((field, fieldIndex) => (
                                <div
                                    key={fieldIndex}
                                    className="space-y-4 pb-6 border-b border-gray-100 last:border-b-0"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-medium text-lg">{field.name}</h4>
                                                <Badge variant="outline" className="text-xs">
                                                    {field.mediaValueType}
                                                </Badge>
                                                {field.type && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {field.type}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">
                                                {field.description}
                                            </p>
                                            
                                            {/* Placeholder for future merge field customization UI */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-500 italic">
                                                    Using campaign default: {field.value || 'Not set'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Customization controls will be added here
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                No merge fields found for this campaign.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
