import { prisma } from '@/src/server/db/prisma';
import { unstable_cache } from 'next/cache';
import { campaignSelect, campaignWithAllSelect, DbCampaignWithAll } from "@/src/server/db/selects/campaign";
import { toUiCampaign } from "@/src/lib/utils/campaigns.utils";
import { convertDecimalsToStrings } from "@/src/lib/utils/serialization";

export const getCampaignById = unstable_cache(
    async (id: string) => {
        const dbCampaign = await prisma.campaign.findFirst({
            where: { id, deletedAt: null },
            select: campaignWithAllSelect,
        });

        if (!dbCampaign) return null;

        // Convert any Decimal types to strings before returning
        const serialized = convertDecimalsToStrings(dbCampaign);
        return toUiCampaign(serialized as DbCampaignWithAll);
    },
    ['campaign-by-id'],
    { tags: ['campaigns'], revalidate: 3600 }
);

// Apply the same pattern to other query functions
export const getCampaigns = unstable_cache(
    async () => {
        const dbCampaigns = await prisma.campaign.findMany({
            where: { deletedAt: null },
            select: campaignWithAllSelect,
            orderBy: { updatedAt: 'desc' },
        });

        // Serialize before mapping
        const serialized = convertDecimalsToStrings(dbCampaigns);
        return serialized.map(c => toUiCampaign(c as DbCampaignWithAll));
    },
    ['campaigns'],
    { tags: ['campaigns'], revalidate: 3600 }
);
/**
 * Fetches a single campaign by ID with all related data.
 * Note: This is an alias for getCampaignById as campaignWithAllSelect now includes all relations.
 */
export const getCampaignByIdWithCharacters = getCampaignById;


/**
 * Fetches campaigns and formats them for UI display, including counts of related entities.
 */
export const getCampaignsForUI = unstable_cache(async () => {
    try {
        const campaigns = await prisma.campaign.findMany({
            where: { deletedAt: null },
            select: campaignWithAllSelect,
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return campaigns.map((campaign) => {
            return {
                ...campaign,
                personaCount: 0,
                characterCount: 0,
            };
        });
    } catch (error) {
        console.error('Failed to fetch campaigns for UI:', error);
        throw new Error('Could not fetch campaigns.');
    }
},
['campaigns-for-ui'],
{ tags: ['campaigns'], revalidate: 3600 }
);
