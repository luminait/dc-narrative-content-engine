import { z } from "zod";

export const campaignCharacterPoolSchema = z.object ({
    id: z.uuid(),
    campaignId: z.uuid(),
    characterId: z.uuid(),
    narrativeRole: z.string().nullable().optional(),
    recommendedScene: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
});

export type CampaignCharacterPool = z.infer<typeof campaignCharacterPoolSchema>;
