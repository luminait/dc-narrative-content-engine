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
import { toUiCharacters } from "@/src/lib/utils/characters.utils";
import { getMergeFieldsForCampaignId } from "@/src/server/queries/mergefields.queries";
import { isMediaAssetType } from "@/src/features/assets";
// helper on the server
import { getAssetUrlFromAssetRef } from "@/src/server/actions/assets";
import type { MergeField } from "@/src/lib/zod/campaign.schema";
import type { AssetData } from "@/src/lib/zod/assets.schema";
import { prisma } from "@/src/server/db";


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

    // Handle case where the campaign is not found
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
                try {
                    if (!f.value || !f.mediaValueType) return null;

                    const isUrl = /^(https?|ftp):\/\/[^\s\/$.?#].\S*$/i.test(f.value);

                    if (isMediaAssetType(f.mediaValueType)) {
                        if (isUrl) {
                            return [
                                f.value,
                                {
                                    type: String(f.mediaValueType),
                                    asset_ref: f.value,
                                    name: f.name,
                                    asset_url: f.value,
                                    path_tokens: null,
                                    bucket_id: null,
                                },
                            ] as const;
                        } else {
                            const assetData = await getAssetUrlFromAssetRef(f.value);

                            if (!assetData) {
                                console.warn(
                                    `[resolveMergeFieldValues] No asset found for merge field`,
                                    { fieldId: f.id, name: f.name, value: f.value }
                                );
                                return null;
                            }

                            return [f.value, { type: String(f.mediaValueType), ...assetData }] as const;
                        }
                    }

                    // Non-media types: just treat as a plain string value
                    return [
                        f.value,
                        {
                            type: String(f.mediaValueType),
                            asset_ref: null,
                            name: f.name,
                            path_tokens: null,
                            bucket_id: null,
                            asset_url: null,
                        },
                    ] as const;
                } catch (err) {
                    console.error(
                        `[resolveMergeFieldValues] Failed to resolve merge field`,
                        { fieldId: f.id, name: f.name, value: f.value },
                        err
                    );
                    return null;
                }
            })
        );

        return Object.fromEntries(
            entries.filter((e): e is readonly [string, MergeFieldAsset] => !!e)
        );
    }

    // Fetch raw data. The return types are now strictly enforced in the query functions.
    const [rawPosts, rawCharacters, rawPersonas, mergeFields] = await Promise.all([
        getPostsForCampaign( campaign.id ),
        getCharactersForCampaign( campaign.id ),
        getPersonasForCampaign( campaign.id ),
        getMergeFieldsForCampaignId( campaign.id )
    ]);

    // 🔍 DEBUG: what does the app *actually* see for CHAR_FG2?
    const debugFieldId = "48854e28-1419-4d06-8c66-2326136a3a13";

    console.log("=== mergeFields from getMergeFieldsForCampaignId ===");
    console.log(
        JSON.stringify(
            mergeFields.filter((f) => f.id === debugFieldId),
            null,
            2
        )
    );

    // it Prisma directly to compare with the Supabase UI
    const prismaRow = await prisma.shotstackMergeField.findUnique({
        where: { id: debugFieldId },
    });
    console.log("=== Prisma.shotstackMergeField row ===");
    console.log(JSON.stringify(prismaRow, null, 2));


    const mergeFieldValues = await resolveMergeFieldValues(mergeFields);

    // // Sanitize mergeFields to convert Decimal objects to numbers before passing to the client component
    // const serializableMergeFields = mergeFields.map(field => ({
    //     ...field,
    //     startTime: field.startTime ? Number(field.startTime) : null,
    //     endTime: field.endTime ? Number(field.endTime) : null,
    // }));

    // Convert to UI types using the centralized utility functions
    // Ensure each post has an `images` array as required by `toUiPosts` RawPostFromQuery
    const posts: Post[] = toUiPosts(
        (rawPosts as any[]).map(p => ({
            ...p,
            images: (p as any).images ?? [],
        })) as any
    );
    const characters: Character[] = toUiCharacters( rawCharacters );
    // TODO: Find a cleaner way to convert rawPersonas to type of Persona[]
    // TODO: Find a way to immediately get the value of `isPrimaryPersona`
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
    // const refNames = mergeFields.map( field => field.mediaValueType );
    // const refUrls = mergeFields.map( field => await canOpenAsset( field ) && await buildAssetUrl(field.value, field, campaign.title, {}) );
    // const [assetRefNames, setAssetRefNames, setAssetUrls, setLoadingAssetRefs] = useAssetResolution()

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
                campaignMergeFields={mergeFields}
                campaignMergeFieldValues={mergeFieldValues}
            />
        </div>
    );
};

export default CampaignDetailsPage;
