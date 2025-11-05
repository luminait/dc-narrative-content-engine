import type { Prisma } from '@/src/server/db/generated/prisma';
import type { CampaignFormData } from '@/src/features/campaigns/campaign.schema';

// ============================================================================
// Form Data → Prisma Input (Outbound: UI → Database)
// ============================================================================

/**
 * Maps form data to Prisma create input.
 * Transforms Zod-validated form data into a database-compatible format.
 *
 * @param formData - Validated form data from Zod schema.
 * @param userId - User ID for creator relationship.
 * @returns Prisma input for campaign creation.
 */
export function formDataToPrismaInput(
  formData: CampaignFormData,
  userId: string,
): Prisma.CampaignCreateInput {
  return {
    title: formData.title,
    campaignObjective: formData.objective,
    narrativeContext: formData.narrativeContext || null,
    postCaptionLength: formData.postLength,  // TODO: Validate and map post caption length to enum by creating an enum constuctor
    startDate: formData.startDate,
    endDate: formData.endDate,
    daysOfWeek: formData.cadence.daysOfWeek,
    frequency: formData.cadence.frequency,
    postType: formData.postType,
    postVideoLength: formData.videoLength,
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
            name: field.name,
            description: field.description,
            mediaValueType: field.mediaValueType,
            value: field.value,
            type: field.type,
            startTime: field.startTime,
            endTime: field.endTime,
            length: field.length,
          })),
        }
      : undefined,
  };
}

/**
 *
 * export type CampaignCreateInput = {
 *     id?: string
 *     versionNumber?: number
 *     title: string
 *     campaignObjective: string
 *     createdAt?: Date | string | null
 *     updatedAt?: Date | string | null
 *     deletedAt?: Date | string | null
 *     daysOfWeek?: CampaignCreatedaysOfWeekInput | $Enums.Weekdays[]
 *     frequency?: $Enums.EventCadence
 *     postType?: $Enums.PostType
 *     postCaptionLength?: $Enums.CaptionLength
 *     postVideoLength?: $Enums.VideoLengthSeconds | null
 *     startDate?: Date | string | null
 *     endDate?: Date | string | null
 *     narrativeContext?: string | null
 *     isActive?: boolean
 *     isArchived?: boolean
 *     isDraft?: boolean
 *     creator?: UserCreateNestedOneWithoutCampaignsInput
 *     characters?: CampaignsCharactersCreateNestedManyWithoutCampaignInput
 *     personas?: CampaignsPersonasCreateNestedManyWithoutCampaignInput
 *     mergeFields?: ShotstackMergeFieldCreateNestedManyWithoutCampaignInput
 *     renders?: ShotstackRenderCreateNestedManyWithoutCampaignInput
 *     posts?: PostCreateNestedManyWithoutCampaignInput
 *   }
 */
