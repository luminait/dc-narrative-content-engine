import type { Campaign } from "@/src/server/db/types";

/**
 * Normalizes raw campaign data to ensure all required properties exist,
 * providing default values for optional fields.
 * @param campaign - The raw campaign object.
 * @returns A normalized Campaign object.
 */
export const normalizeCampaign = (campaign: any): Campaign => {
    return {
        ...campaign,
        characters: Array.isArray(campaign.characters) ? campaign.characters : [],
        personas: Array.isArray(campaign.personas) ? campaign.personas : [],
        cadence: campaign.cadence || { daysOfWeek: [], frequency: 'weekly' },
        mergeFields: Array.isArray(campaign.mergeFields) ? campaign.mergeFields : [],
        status: campaign.status || 'draft',
        postType: campaign.postType || 'image',
        postLength: campaign.postLength || 'short'
    };
};
