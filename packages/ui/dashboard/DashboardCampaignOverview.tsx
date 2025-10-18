
'use client'

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/ui/shadcn/card";
import {Archive, Calendar, Eye, MoreVertical, PauseCircle, Plus, Trash2} from "lucide-react";
import {Button} from "@/ui/shadcn/button";
import {Skeleton} from "@/ui/shadcn/skeleton";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/ui/shadcn/dropdown-menu";
import { CampaignAction, handleCampaignAction } from "@/src/server/actions/campaign.actions";
import { formatDate } from "@/src/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Campaign } from "@/src/server/db/generated/prisma";
import { useRouter } from "next/navigation";

// Define the extended Campaign type with counts
interface CampaignWithCounts extends Campaign {
    personaCount: number;
    characterCount: number;
}

// API fetching function using Next.js API route
const fetchCampaigns = async (): Promise<CampaignWithCounts[]> => {
    const response = await fetch('/api/campaigns', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'no-store', // Ensure fresh data on each request
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to fetch campaigns');
    }

    return response.json();
};

const DashboardCampaignOverview = () => {
    const router = useRouter();

    const {
        data: campaigns,
        isLoading: campaignsLoading,
        error: campaignsError,
        refetch
    } = useQuery<CampaignWithCounts[], Error>({
        queryKey: ['campaigns'],
        queryFn: fetchCampaigns,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: true,
    });

    const handleNavigateToCampaignGenerator = () => {
        router.push('/campaigns/new');
    };

    const handleViewCampaign = (campaignId: string) => {
        router.push(`/campaigns/${campaignId}`);
    };

    const  handleCampaignActionWithRefetch = async (campaign: Campaign, action: CampaignAction) => {
        await handleCampaignAction(campaign.id, action);
        // Refetch campaigns after action to update the list
        refetch();
    };

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
                ) : campaignsError ? (
                    <div className="text-center py-12 text-red-600">
                        <p className="font-medium mb-2">Error loading campaigns</p>
                        <p className="text-sm text-gray-600">{campaignsError.message}</p>
                        <Button
                            onClick={() => refetch()}
                            variant="outline"
                            className="mt-4"
                        >
                            Try Again
                        </Button>
                    </div>
                ) : (campaigns ?? []).length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg text-gray-900 mb-2">No campaigns yet</h3>
                        <p className="text-gray-600 mb-6">Get started by creating your first Pokémon campaign</p>
                        <Button onClick={handleNavigateToCampaignGenerator}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Campaign
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {(campaigns ?? []).map((campaign) => (
                            <div
                                key={campaign.id}
                                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => handleViewCampaign(campaign.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
                                        </div>

                                        <p className="text-gray-600 text-sm max-w-2xl line-clamp-2">
                                            {campaign.campaignObjective}
                                        </p>

                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                            <span>Created {formatDate(campaign.createdAt?.toString() || Date.now().toString())}</span>
                                            <span>•</span>
                                            <span>{campaign.personaCount} {campaign.personaCount === 1 ? 'persona' : 'personas'}</span>
                                            <span>•</span>
                                            <span>{campaign.characterCount} {campaign.characterCount === 1 ? 'character' : 'characters'}</span>
                                            <span>•</span>
                                            <span className="capitalize">{campaign.postType.replace('_', ' ')} posts</span>
                                            {campaign.daysOfWeek.length === 7 ? (
                                                <>
                                                    <span>•</span>
                                                    <span>Daily posts</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>•</span>
                                                    <span>{campaign.daysOfWeek.length}x per week</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
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
                                                    onClick={() => handleViewCampaign(campaign.id)}
                                                    className="flex items-center space-x-2 cursor-pointer"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span>View</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => handleCampaignActionWithRefetch(campaign, 'archive')}
                                                    className="flex items-center space-x-2 cursor-pointer"
                                                >
                                                    <Archive className="h-4 w-4" />
                                                    <span>Archive</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => handleCampaignActionWithRefetch(campaign, 'unpublish')}
                                                    className="flex items-center space-x-2 cursor-pointer"
                                                >
                                                    <PauseCircle className="h-4 w-4" />
                                                    <span>Unpublish</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => handleCampaignActionWithRefetch(campaign, 'delete')}
                                                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 focus:text-red-700 cursor-pointer"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DashboardCampaignOverview;
