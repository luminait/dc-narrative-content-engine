'use client';

import DashboardInfoCard from "@/ui/dashboard/DashboardInfoCard";
import { CheckCircle, Plus } from "lucide-react";
import { Button } from "@/ui/shadcn/button";
import DashboardCampaignOverview from "@/ui/dashboard/DashboardCampaignOverview";
import { useRouter } from "next/navigation";
import Header from "@/ui/layout/Header";
import { useMemo } from "react";
import { useCampaign } from "@/src/features/campaigns/providers/CampaignProvider"; // adjust path if different

const Dashboard = () => {
  const router = useRouter();

  // Pull the current campaign context (must be wrapped by <CampaignProvider>)
  const { campaigns } = useCampaign();

  console.log('campaigns: ', campaigns);

  // Derive counts from the single campaign in context.
  // If you plan to support multiple campaigns later, lift this state into a CampaignsProvider.
  const { activeCount, draftCount, totalCount } = useMemo(() => {
    if (!campaigns) {
      return { activeCount: 0, draftCount: 0, totalCount: 0 };
    }

    const isActive = Boolean(campaigns.isActive);
    const isDraft = !campaigns.isActive && !campaigns.isArchived;

    return {
      activeCount: isActive ? 1 : 0,
      draftCount: isDraft ? 1 : 0,
      totalCount: 1,
    };
  }, [campaigns]);

  return (
    <div className="flex flex-1 flex-col justify-between items-start">
      <Header
        title={"Campaign Dashboard"}
        subtitle={"Create and manage your Pokémon social media campaigns"}
        actionButton={
          <Button
            onClick={() => router.push("/campaigns/new/")}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </Button>
        }
      />

      <div className="mt-6 flex-1 w-full flex flex-col gap-12">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-6">
          <DashboardInfoCard
            title={"Active Campaigns"}
            isLoading={false}
            count={activeCount.toString()}
            message={"Currently active campaigns"}
            icon={<CheckCircle />}
          />
          <DashboardInfoCard
            title={"Draft Campaigns"}
            isLoading={false}
            count={draftCount.toString()}
            message={"Campaigns in draft (not archived)"}
            icon={<CheckCircle />}
          />
          <DashboardInfoCard
            title={"Total Campaigns"}
            isLoading={false}
            count={totalCount.toString()}
            message={"Total campaigns in context"}
            icon={<CheckCircle />}
          />
        </div>

        {/* DashboardCampaignOverview previously accepted an array of campaigns.
            We pass the single campaign from context as an array for compatibility. */}
        <DashboardCampaignOverview
          campaigns={campaigns ? campaigns : []}
          isLoading={false}
          error={undefined}
          refetch={undefined}
        />
      </div>
    </div>
  );
};

export default Dashboard;
