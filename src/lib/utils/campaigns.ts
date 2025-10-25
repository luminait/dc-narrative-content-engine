import { Campaign, CampaignWithStatus, CampaignStatus } from "@/src/lib/types/ui";
import type { CampaignData } from "@/src/features/campaigns/campaign.schema";
import type { DbCampaignWithAll } from "@/src/server/db/selects/campaign";

const VIDEO_LENGTH_MAP = { THIRTY: 30, FORTY_FIVE: 45, SIXTY: 60 } as const;

export function toUiCampaign(c: DbCampaignWithAll): CampaignData {
    const characters = c.characters.map(cc => cc.character?.name).filter(Boolean) as string[];
    const personas = c.personas.map(p => p.personaKey ?? p.persona?.id).filter(Boolean) as string[];

    return {
        id: c.id,
        title: c.title,
        objective: c.campaignObjective ?? "",
        narrativeContext: c.narrativeContext ?? undefined,
        postCaptionLength: c.postCaptionLength,
        startDate: c.startDate ?? undefined,
        endDate: c.endDate ?? undefined,
        cadence: { daysOfWeek: c.daysOfWeek ?? [], frequency: c.frequency },
        postType: c.postType,
        videoLength: c.postVideoLength ? VIDEO_LENGTH_MAP[c.postVideoLength as keyof typeof VIDEO_LENGTH_MAP] : undefined,
        personas,
        characters,
        mergeFields: (c.mergeFields ?? []).map(m => ({ name: m.name ?? "" })),
        isActive: c.isActive,
        isArchived: c.isArchived,
        isDraft: c.isDraft,
        createdAt: c.createdAt ?? undefined,
        updatedAt: c.updatedAt ?? undefined,
        deletedAt: c.deletedAt ?? undefined,
    };
}

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


export const getCampaignWithStatus = (campaign: CampaignData): CampaignWithStatus => {
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

/**
 * Constructs a complete `Campaign` object from `CampaignData`.
 * This function computes derived UI fields like `status` and relation counts.
 *
 * @param campaignData - The base campaign data, typically from a form or database query.
 * @returns A `Campaign` object with `status`, `personaCount`, and `characterCount`.
 */
export const buildCampaign = (campaignData: CampaignData): Campaign => {
    const campaignWithStatus = getCampaignWithStatus(campaignData);

    const personaCount = campaignData.personas?.length ?? 0;
    const characterCount = campaignData.characters?.length ?? 0;

    return {
        ...campaignWithStatus,
        personaCount,
        characterCount,
    };
};
