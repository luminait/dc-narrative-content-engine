import { getCampaignById } from "@/src/server/queries/campaigns.queries";
import { Badge } from "@/ui/shadcn/badge";
import { getStatusColor } from "@/ui/src/utils";
import { buildCampaign } from "@/src/lib/utils/campaigns.utils";
import { CampaignData, campaignSchema } from "@/src/features/campaigns/campaign.schema";
import { Campaign, Character, Persona, Post } from "@/src/lib/types/ui";
import CampaignDetails from "@/src/features/campaigns/details/sections/CampaignDetails";
import CampaignDetailTabSwitcher from "@/src/features/campaigns/details/sections/CampaignDetailTabSwitcher";
import { getPostsForCampaign } from "@/src/server/queries/posts.queries";
import { getCharactersForCampaign } from "@/src/server/queries/characters.queries";
import { getPersonasForCampaign } from "@/src/server/queries/personas.queries";
import { toUiPosts } from "@/src/lib/utils/posts.utils";
import { toUiCharacters } from "@/src/lib/utils/characters.utils";

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
    console.log( 'campaignId: ', campaignId );


    // Fetch the campaign data
    const response = await getCampaignById( campaignId );

    console.log('response: ', response);

    // Handle case where campaign is not found
    if ( !response ) {
        return <div>Campaign not found</div>;
    }

    // Validate the raw data against the Zod schema
    const parsedResult = campaignSchema.safeParse( response );

    if ( !parsedResult.success ) {
        console.error( "Campaign data validation failed:", parsedResult.error );
        return <div>Invalid campaign data.</div>;
    }

    // At this point, we have type-safe data conforming to CampaignData
    const campaignData: CampaignData = parsedResult.data;

    const campaign: Campaign = buildCampaign( campaignData );

    // Fetch raw data. The return types are now strictly enforced in the query functions.
    const rawPosts = await getPostsForCampaign( campaign.id );
    const rawCharacters = await getCharactersForCampaign( campaign.id );
    const rawPersonas = await getPersonasForCampaign( campaign.id );

    // Convert to UI types using the centralized utility functions
    const posts: Post[] = toUiPosts( rawPosts );
    const characters: Character[] = toUiCharacters( rawCharacters );
    // TODO: Find a cleaner way to convert rawPersonas to type of Persona[]
    const personas: Persona[] = rawPersonas.map( persona => {
            return {
                ...persona,
                name: persona.name || 'hardcore_collector',
                createdAt: persona.createdAt?.toString() || Date.now().toString(),
                updatedAt: persona.updatedAt?.toString() || Date.now().toString(),
                deletedAt: persona.deletedAt?.toString() || undefined,
                description: persona.description || 'A hardcore collector',
            }
        }
    ); // Direct assignment

    // Render the campaign details
    return (

        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl">{campaign.title}</h1>
                        <Badge className={getStatusColor( campaign.status )}>
                            {campaign.status}
                        </Badge>
                    </div>
                    <p className="text-gray-600">{campaign.objective}</p>
                    {campaign.narrativeContext && (
                        <p className="text-sm text-gray-500 italic">
                            {campaign.narrativeContext}
                        </p>
                    )}
                </div>
            </div>
            <CampaignDetails/>
            <CampaignDetailTabSwitcher
                campaign={campaign}
                posts={posts}
                campaignPersonas={personas}
                characters={characters}
            />
        </div>
    );
};

export default CampaignDetailsPage;
