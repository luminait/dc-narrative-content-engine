import type { Campaign, Prisma } from '@/src/server/db/types';
import type { CampaignFormData } from '@/src/features/campaigns/campaign.schema';
import type { CampaignWithStatus } from '@/src/lib/types/ui';

/**
 * Maps form data to Prisma create input.
 */
export function formDataToPrismaInput(
  formData: CampaignFormData,
  userId: string
): Prisma.CampaignCreateInput {
  return {
    title: formData.title,
    campaignObjective: formData.objective,
    narrativeContext: formData.narrativeContext || null,
    postCaptionLength: formData.postLength as any, // Enum mapping
    startDate: formData.startDate ? new Date(formData.startDate) : null,
    endDate: formData.endDate ? new Date(formData.endDate) : null,
    daysOfWeek: formData.cadence.daysOfWeek as any[],
    frequency: formData.cadence.frequency === 'weekly' ? 'weekly' : 'monthly',
    postType: formData.postType === 'image' ? 'single_image' : (formData.postType as any),
    postVideoLength: formData.videoLength as any,
    creator: {
      connect: { userId },
    },
    personas: {
      create: formData.personas.map((personaId) => ({
        persona: { connect: { id: personaId } },
      })),
    },
    characters: {
      create: formData.characters.map((characterId) => ({
        character: { connect: { id: characterId } },
      })),
    },
    mergeFields: formData.mergeFields
      ? {
          create: formData.mergeFields.map((field) => ({
            mergeField: field.mergeField,
            description: field.description,
            mediaValueType: field.valueType as any,
            startTime: field.startTime,
            endTime: field.endTime,
          })),
        }
      : undefined,
  };
}

/**
 * Computes campaign status from database fields.
 */
export function getCampaignStatus(
  campaign: Campaign
): 'draft' | 'active' | 'completed' | 'archived' {
  if (campaign.isArchived) return 'archived';
  if (!campaign.isActive) return 'draft';
  if (campaign.endDate && new Date(campaign.endDate) < new Date()) return 'completed';
  return 'active';
}

/**
 * Adds computed status to campaign.
 */
export function addStatusToCampaign(campaign: Campaign): CampaignWithStatus {
  return {
    ...campaign,
    status: getCampaignStatus(campaign),
  };
}
