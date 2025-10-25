import { prisma } from '@/src/server/db/prisma';
import { unstable_cache } from 'next/cache';
import { campaignWithAllSelect, DbCampaignWithAll } from "@/src/server/db/selects/campaign";
import { toUiCampaign } from "@/src/lib/utils/campaigns";






/**
 * Fetches all campaigns with related data.
 */
export const getCampaigns = unstable_cache(
    async () => {
        return prisma.campaign.findMany( {
            where: { deletedAt: null },
            include: {
                personas: { include: { persona: true } },
                characters: { include: { character: true } },
            },
            orderBy: { updatedAt: 'desc' },
        } );
    },
    [ 'campaigns' ],
    { tags: [ 'campaigns' ], revalidate: 3600 }
);

/**
 * Fetches a single campaign by ID.
 */
export const getCampaignById = unstable_cache(
    async ( id: string ) => {
        const dbCampaign = await prisma.campaign.findFirst( {
            where: { id, deletedAt: null },
            select: campaignWithAllSelect,
        } );

        return dbCampaign ? toUiCampaign(dbCampaign as DbCampaignWithAll) : null;
    },
    [ 'campaign-by-id' ],
    { tags: [ 'campaigns' ], revalidate: 3600 }
);

/**
 * Fetches a single campaign by ID.
 */
export const getCampaignByIdWithCharacters = unstable_cache(
    async ( id: string ) => {
        return prisma.campaign.findUnique( {
            where: { id, deletedAt: null },
            include: {
                personas: { include: { persona: true } },
                characters: { include: { character: true } },
                mergeFields: true,
            },
        } );
    },
    [ 'campaign-by-id-with-characters' ],
    { tags: [ 'campaigns' ], revalidate: 3600 }
);


export async function getCampaignsWithCounts() {
    try {
        const campaigns = await prisma.campaign.findMany( {
            include: {
                personas: true, // Include the join table for personas
                characters: true, // Include the join table for characters
            },
            orderBy: {
                updatedAt: 'desc',
            },
        } );

        // Map over the results to add the counts
        return campaigns.map( ( campaign ) => ( {
            ...campaign,
            personaCount: campaign.personas.length ?? 0,
            characterCount: campaign.characters.length ?? 0,
            cadence: {
                daysOfWeek: campaign.daysOfWeek,
                frequency: campaign.frequency,
            }
        } ) );
    } catch ( error ) {
        console.error( 'Failed to fetch campaigns with counts:', error );
        throw new Error( 'Could not fetch campaigns.' );
    }
}
