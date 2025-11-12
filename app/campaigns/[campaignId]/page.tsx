import { getCampaignById } from "@/src/server/queries/campaigns.queries";
import { Badge } from "@/ui/shadcn/badge";
import { getStatusColor } from "@/ui/src/utils";
import { buildCampaign } from "@/src/lib/utils/campaigns.utils";
import { CampaignData, campaignSchema } from "@/src/lib/zod/campaign.schema";
import { Campaign, Character, Persona, Post } from "@/src/lib/types/ui";
import CampaignDetails from "@/src/features/campaigns/details/sections/CampaignDetails";
import CampaignDetailTabSwitcher from "@/src/features/campaigns/details/sections/CampaignDetailTabSwitcher";
import { getPostsForCampaign } from "@/src/server/queries/posts.queries";
import { getCharactersForCampaign } from "@/src/server/queries/characters.queries";
import { getPersonasForCampaign } from "@/src/server/queries/personas.queries";
import { toUiPosts } from "@/src/lib/utils/posts.utils";
import { getAssetUrlFromAssetRef } from "@/src/server/actions/assets";
import type { MergeField } from "@/src/lib/zod/campaign.schema";
import type { AssetData } from "@/src/lib/zod/assets.schema";
import { isMediaAssetType } from "@/src/features/assets";

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
    const response = await getCampaignById( campaignId );

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

    type MergeFieldAsset = { type: string } & AssetData;

    async function resolveMergeFieldValues(
        fields: MergeField[]
    ): Promise<Record<string, MergeFieldAsset>> {
        const entries = await Promise.all(
            fields.map(async (f) => {
                if (!f.value || !f.mediaValueType) return null;

                const isUrl = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(f.value);

                if (isMediaAssetType(f.mediaValueType)) {
                    if (isUrl) {
                        // If the value is already a URL, construct the AssetData directly
                        return [f.value, {
                            type: String(f.mediaValueType),
                            asset_ref: f.value, // Use the URL as the ref for keying
                            name: f.name,
                            asset_url: f.value,
                            path_tokens: null,
                            bucket_id: null,
                        }] as const;
                    } else {
                        // Otherwise, assume it's a UUID and resolve it
                        const assetData = await getAssetUrlFromAssetRef(f.value);
                        return [f.value, { type: String(f.mediaValueType), ...assetData }] as const;
                    }
                }

                // Handle non-media types
                return [f.value, {
                    type: String(f.mediaValueType),
                    asset_ref: null,
                    name: f.name,
                    path_tokens: null,
                    bucket_id: null,
                    asset_url: null
                } as const];
            })
        );
        return Object.fromEntries(entries.filter((e): e is readonly [string, MergeFieldAsset] => !!e));
    }

    // Fetch raw data. The return types are now strictly enforced in the query functions.
    const [rawPosts, characters, rawPersonas] = await Promise.all([
        getPostsForCampaign( campaign.id ),
        getCharactersForCampaign( campaign.id ),
        getPersonasForCampaign( campaign.id ),
    ]);

    const mergeFieldValues = await resolveMergeFieldValues(campaignData.mergeFields ?? []);

    // Ensure each post has an `images` array as required by toUiPosts' RawPostFromQuery
    const posts: Post[] = toUiPosts(
        (rawPosts as any[]).map(p => ({
            ...p,
            images: (p as any).images ?? [],
        })) as any
    );

    // TODO: Consider sourcing `isPrimaryPersona` from the campaign-persona join if available in the query
    const personas: Persona[] = (rawPersonas as any[]).map((persona: any) => {
        const name = persona?.name ?? 'hardcore_collector';
        const personaKey =
            persona?.personaKey ??
            (typeof name === 'string' ? name.toLowerCase().replace(/\s+/g, '_') : 'hardcore_collector');
        const isPrimaryPersona =
            typeof persona?.isPrimaryPersona === 'boolean' ? persona.isPrimaryPersona : false;

        return {
            id: String(persona?.id ?? crypto.randomUUID?.() ?? `persona_${Math.random().toString(36).slice(2)}`),
            name,
            description: persona?.description ?? 'A hardcore collector',
            personaKey,
            isPrimaryPersona,
            createdAt: persona?.createdAt?.toString?.() ?? new Date().toISOString(),
            updatedAt: persona?.updatedAt?.toString?.() ?? new Date().toISOString(),
            deletedAt: persona?.deletedAt?.toString?.() ?? undefined,
        } as Persona;
    });

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
                characters={characters as Character[]}
                campaignMergeFields={campaignData.mergeFields ?? []}
                campaignMergeFieldValues={mergeFieldValues}
            />
        </div>
    );
};

export default CampaignDetailsPage;
