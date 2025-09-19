'use client'

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/ui/shadcn/card";
import {useEffect, useState} from "react";
import {Archive, Calendar, Eye, MoreVertical, PauseCircle, Plus, Trash2} from "lucide-react";
import {Button} from "@/ui/shadcn/button";
import {Skeleton} from "@/ui/shadcn/skeleton";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/ui/shadcn/dropdown-menu";
import {Campaign} from "@/lib/types";
import {Badge} from "@/ui/shadcn/badge";
import {
    getStatusColor,
    getStatusIcon,
    handleCampaignAction
} from "@/lib/campaignUtils";
import {formatDate} from "@/lib/utils"; // Assuming you create a utils file for these



interface CampaignWithCounts extends Campaign {
    personaCount: number;
    characterCount: number;
}
const onNavigate = (view: string) => {
    console.log(`Navigating to ${view}`);
};

const DashboardCampaignOverview = () => {
    const [campaigns, setCampaigns] = useState<CampaignWithCounts[]>([]);
    const [campaignsLoading, setCampaignsLoading] = useState(true);
    const [campaignsError, setCampaignsError] = useState<string | null>(null);

    useEffect(() => {
        // Simulate fetching data
        setTimeout(() => setCampaignsLoading(false), 1500);
    }, []);

    return (

    <Card>
        <CardHeader>
            <CardTitle>Your Campaigns</CardTitle>
            <CardDescription>
                Manage your Pokémon content campaigns and track their performance
            </CardDescription>
        </CardHeader>
        <CardContent>
            {campaignsLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center space-x-3">
                                        <Skeleton className="h-6 w-48" />
                                        <Skeleton className="h-6 w-16" />
                                    </div>
                                    <Skeleton className="h-4 w-96" />
                                    <div className="flex items-center space-x-4">
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Skeleton className="h-8 w-8" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : campaigns.length === 0 ? (
                <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg text-gray-900 mb-2">No campaigns yet</h3>
                    <p className="text-gray-600 mb-6">Get started by creating your first Pokémon campaign</p>
                    <Button onClick={() => onNavigate('campaign-generator')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Campaign
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {campaigns.map((campaign) => {
                        // Safely access campaign properties with fallbacks
                        const characters = campaign.characters || [];
                        const cadence = campaign.cadence || { daysOfWeek: [], frequency: 'weekly' };
                        const daysOfWeek = cadence.daysOfWeek || [];

                        // Use the fetched characterCount if available, otherwise fall back to legacy characters array
                        const characterCount = (campaign as any).characterCount ?? characters.length;

                        return (
                            <div
                                key={campaign.id}
                                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="text-lg text-gray-900">{campaign.title}</h3>
                                            <Badge
                                                variant="secondary"
                                                className={`flex items-center space-x-1 ${getStatusColor(campaign.status)}`}
                                            >
                                                {getStatusIcon(campaign.status)}
                                                <span className="capitalize">{campaign.status}</span>
                                            </Badge>
                                        </div>

                                        <p className="text-gray-600 text-sm max-w-2xl">{campaign.objective}</p>

                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                            <span>Created {formatDate(campaign.createdAt)}</span>
                                            <span>•</span>
                                            <span>{campaign.personaCount} personas</span>
                                            <span>•</span>
                                            <span>{characterCount} characters</span>
                                            <span>•</span>
                                            <span className="capitalize">{campaign.postType} posts</span>
                                            {daysOfWeek.length === 7 ? (
                                                <>
                                                    <span>•</span>
                                                    <span>Daily posts</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>•</span>
                                                    <span>{daysOfWeek.length}x per week</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem
                                                    onClick={() => handleCampaignAction(campaign, 'view')}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span>View</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => handleCampaignAction(campaign, 'archive')}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <Archive className="h-4 w-4" />
                                                    <span>Archive</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => handleCampaignAction(campaign, 'unpublish')}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <PauseCircle className="h-4 w-4" />
                                                    <span>Unpublish</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => handleCampaignAction(campaign, 'delete')}
                                                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 focus:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </CardContent>
    </Card>
    );
};
export default DashboardCampaignOverview;
