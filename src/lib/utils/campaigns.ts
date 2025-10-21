import { Campaign } from "@/src/server/db/types";
import { CampaignWithStatus } from "@/src/lib/types/ui";
import { CampaignStatus } from "@/src/lib/types/ui";


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


export const getCampaignWithStatus = (campaign: Campaign): CampaignWithStatus => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = campaign.startDate ? new Date(campaign.startDate) : null;
    if (startDate) startDate.setHours(0, 0, 0, 0);

    const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
    if (endDate) endDate.setHours(0, 0, 0, 0);

    let status: CampaignStatus;

    // The order of these checks is important to determine the status correctly.
    if (campaign.isArchived) {
        // Archived status takes precedence over all others.
        status = 'archived';
    } else if (campaign.isActive && endDate && today > endDate) {
        // An active campaign is 'completed' if its end date has passed.
        status = 'completed';
    } else if (campaign.isActive && startDate && endDate && today >= startDate && today <= endDate) {
        // It's 'active' only if it's marked as active and we are within its date range.
        status = 'active';
    } else {
        // Any other state (e.g., not active, or active but outside date range) is considered a 'draft'.
        status = 'draft';
    }

    return { ...campaign, status };
};
