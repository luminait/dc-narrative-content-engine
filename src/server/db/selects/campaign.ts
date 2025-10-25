// Single place to define the SELECT for Campaign queries
import { Prisma } from "@/src/server/db/generated/prisma";

// Base select for fields stored on campaigns
export const campaignSelect = Prisma.validator<Prisma.CampaignSelect>()({
    id: true,
    title: true,
    campaignObjective: true,
    narrativeContext: true,
    postCaptionLength: true,
    startDate: true,
    endDate: true,
    daysOfWeek: true,
    frequency: true,
    postType: true,
    postVideoLength: true,
    isActive: true,
    isArchived: true,
    isDraft: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
});

// Optional relation fragments (compose as needed)
export const campaignCharactersSelect = Prisma.validator<Prisma.CampaignSelect>()({
    characters: {
        select: {
            character: { select: { name: true } },
        },
    },
});

export const campaignPersonasSelect = Prisma.validator<Prisma.CampaignSelect>()({
    personas: { include: { persona: true } },
});

export const campaignMergeFieldsSelect = Prisma.validator<Prisma.CampaignSelect>()({
    mergeFields: { select: { name: true } },
});

// Ready-to-use composite shapes
export const campaignWithAllSelect = Prisma.validator<Prisma.CampaignSelect>()({
    ...campaignSelect,
    ...campaignCharactersSelect,
    ...campaignPersonasSelect,
    ...campaignMergeFieldsSelect,
});

// Inferred types from each shape
export type DbCampaignBase = Prisma.CampaignGetPayload<{ select: typeof campaignSelect }>;
export type DbCampaignWithAll = Prisma.CampaignGetPayload<{ select: typeof campaignWithAllSelect }>;
