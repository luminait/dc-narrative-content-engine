import { getCampaignById } from "@/src/server/queries/campaigns.queries";
import { Badge } from "@/ui/shadcn/badge";
import { getStatusColor } from "@/ui/src/utils";
import { getCampaignWithStatus } from "@/src/lib/utils/campaigns";
import { CampaignWithStatus } from "@/src/lib/types/ui";
import CampaignDetails from "@/src/features/campaigns/details/sections/CampaignDetails";
import CampaignDetailTabSwitcher from "@/src/features/campaigns/details/sections/CampaignDetailTabSwitcher";


// In Next.js 15, dynamic APIs like `params` are asynchronous.
// Typing `params` as a Promise keeps TypeScript correct for the new behavior.
type CampaignDetailsPageProps = {
    params: Promise<{
        campaignId: string;
    }>;
};



// Make the component async to fetch data on the server
const CampaignDetailsPage = async ( { params }: CampaignDetailsPageProps ) => {
    // Destructure campaignId from params to make access explicit
    const { campaignId } = await params;

    // Fetch the campaign data
    const campaign = await getCampaignById( campaignId );

    // Handle case where campaign is not found
    if ( !campaign ) {
        return <div>Campaign not found</div>;
    }

    // Convert this into a CampaignWithStatus

    const campaignWithStatus: CampaignWithStatus = getCampaignWithStatus( campaign );

    // Render the campaign details
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl">{campaign.title}</h1>
                        <Badge className={getStatusColor( campaignWithStatus.status )}>
                            {campaignWithStatus.status}
                        </Badge>
                    </div>
                    <p className="text-gray-600">{campaign.campaignObjective}</p>
                    {campaign.narrativeContext && (
                        <p className="text-sm text-gray-500 italic">
                            {campaign.narrativeContext}
                        </p>
                    )}
                </div>
            </div>
            <CampaignDetails />
            <CampaignDetailTabSwitcher />
        </div>
    );
};

export default CampaignDetailsPage;
