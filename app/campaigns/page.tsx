'use client'

import DashboardInfoCard from "@/ui/dashboard/DashboardInfoCard";
import { CheckCircle, Plus } from "lucide-react";
import { Button } from "@/ui/shadcn/button";
import DashboardCampaignOverview from "@/ui/dashboard/DashboardCampaignOverview";
import Link from "next/link";  // Add this import
import Header from "@/ui/layout/Header";

const Dashboard = () => {
    return (
        <div className="flex flex-1 flex-col justify-between items-start">
            <Header
                title={"Campaign Dashboard"}
                subtitle={"Create and manage your Pokémon social media campaigns"}
                actionButton={(
                    <Link href="/campaigns/new/">
                        <Button className="flex items-center space-x-2">
                            <Plus className="w-4 h-4"/>
                            <span>New Campaign</span>
                        </Button>
                    </Link>
                )}
            />
            {/* Rest of the component remains the same */}
            <div className="mt-6 flex-1 w-full flex flex-col gap-12">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-6">
                    <DashboardInfoCard
                        title={"Active Campaigns"}
                        isLoading={false}
                        count={"12"}
                        message={"Total active campaigns"}
                        icon={<CheckCircle/>}
                    />
                    <DashboardInfoCard
                        title={"Active Campaigns"}
                        isLoading={false}
                        count={"12"}
                        message={"Total active campaigns"}
                        icon={<CheckCircle/>}
                    />
                    <DashboardInfoCard
                        title={"Active Campaigns"}
                        isLoading={false}
                        count={"12"}
                        message={"Total active campaigns"}
                        icon={<CheckCircle/>}
                    />
                </div>
                <DashboardCampaignOverview/>
            </div>
        </div>
    );
};
export default Dashboard;
