'use client';

import DashboardInfoCard from "@/ui/dashboard/DashboardInfoCard";
import { CheckCircle, Plus } from "lucide-react";
import { Button } from "@/ui/shadcn/button";
import DashboardCampaignOverview from "@/ui/dashboard/DashboardCampaignOverview";
import { useRouter } from "next/navigation";
import Header from "@/ui/layout/Header";
import { useQuery } from "@tanstack/react-query";
import { Campaign } from "@/src/server/db/generated/prisma";
import { useEffect, useState } from "react";

// Define the extended Campaign type with counts
interface CampaignWithCounts extends Campaign {
    personaCount: number;
    characterCount: number;
}

// API fetching function using Next.js API route
const fetchCampaigns = async (): Promise<CampaignWithCounts[]> => {
    console.log('preparing to fetch campaigns client-side ....');
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

    // console.log(`campaigns: ${await response.json()}`);
    return response.json();
};

const Dashboard = () => {
    const router = useRouter();
    const [activeCampaigns, setActiveCampaigns] = useState(0);
    const [draftCampaigns, setDraftCampaigns] = useState(0);

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

    useEffect(() => {
        if (campaigns) {
            const activeCount = campaigns.filter(campaign => campaign.isActive).length;
            const draftCount = campaigns.filter(campaign => !campaign.isActive && !campaign.isArchived).length;
            setActiveCampaigns(activeCount);
            setDraftCampaigns(draftCount);
        }
    }, [campaigns, setActiveCampaigns, setDraftCampaigns]);

    return (
        <div className="flex flex-1 flex-col justify-between items-start">
            <Header
                title={"Campaign Dashboard"}
                subtitle={"Create and manage your Pokémon social media campaigns"}
                actionButton={(
                    <Button
                        onClick={() => router.push("/campaigns/new/")}
                        className="flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Campaign</span>
                    </Button>
                )}
            />
            <div className="mt-6 flex-1 w-full flex flex-col gap-12">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-6">
                    <DashboardInfoCard
                        title={"Active Campaigns"}
                        isLoading={false}
                        count={activeCampaigns.toString()}
                        message={"Total active campaigns"}
                        icon={<CheckCircle />}
                    />
                    <DashboardInfoCard
                        title={"Draft Campaigns"}
                        isLoading={false}
                        count={draftCampaigns.toString()}
                        message={"Total active campaigns"}
                        icon={<CheckCircle />}
                    />
                    <DashboardInfoCard
                        title={"Total Campaigns"}
                        isLoading={false}
                        count={(activeCampaigns + draftCampaigns).toString() ?? '0'}
                        message={"Total active campaigns"}
                        icon={<CheckCircle />}
                    />
                </div>
                <DashboardCampaignOverview
                    campaigns={campaigns}
                    isLoading={campaignsLoading}
                    error={campaignsError}
                    refetch={refetch}
                />
            </div>
        </div>
    );
};

export default Dashboard;
