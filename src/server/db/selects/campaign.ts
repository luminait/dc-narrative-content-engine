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
    personas: {
        select: {
            id: true,
            campaignId: true,
            personaKey: true,
            isPrimaryPersona: true, // <-- join-table scalar
            persona: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    createdAt: true,
                    updatedAt: true,
                    deletedAt: true,
                },
            },
        },
    },
});

/// Used when selected the mergefields directly from the Campaign object.
export const campaignMergeFieldsSelect = Prisma.validator<Prisma.CampaignSelect>()({
    mergeFields: { select: {
            name: true,
            description: true,
            mediaValueType: true,
            startTime: true,
            endTime: true,
            type: true,
            value: true,
            campaignId: true,
        } },
});

/// Used to select MergeField fields directly.
export const mergeFieldSelect = Prisma.validator<Prisma.ShotstackMergeFieldSelect>()({
    id: true,
    name: true,
    description: true,
    mediaValueType: true,
    startTime: true,
    endTime: true,
    campaignId: true,
    type: true,
    value: true,
})

// Manually constructed composite shape to avoid spread operator issues with Prisma validators.
export const campaignWithAllSelect = Prisma.validator<Prisma.CampaignSelect>()({
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
    characters: {
        select: {
            character: { select: { name: true } },
        },
    },
    personas: {
        select: {
            id: true,
            campaignId: true,
            personaKey: true,
            isPrimaryPersona: true,
            persona: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    createdAt: true,
                    updatedAt: true,
                    deletedAt: true,
                },
            },
        },
    },
    mergeFields: {
        select: {
            name: true,
            description: true,
            mediaValueType: true,
            startTime: true,
            endTime: true,
            type: true,
            value: true,
            campaignId: true,
        }
    },
});


// Inferred types from each shape
export type DbCampaignBase = Prisma.CampaignGetPayload<{ select: typeof campaignSelect }>;
export type DbCampaignWithAll = Prisma.CampaignGetPayload<{ select: typeof campaignWithAllSelect }>;
