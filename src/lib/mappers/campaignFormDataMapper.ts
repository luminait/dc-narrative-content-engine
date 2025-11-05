import type { Prisma } from '@/src/server/db/generated/prisma';
import {
  CaptionLength,
  EventCadence,
  PostType,
  VideoLengthSeconds,
  Weekdays,
} from '@/src/server/db/generated/prisma';
import type { CampaignFormData } from '@/src/features/campaigns/campaign.schema';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Converts a number (of seconds) to its corresponding VideoLengthSeconds enum.
 * Example: 30 -> VideoLengthSeconds.S_30
 */
const numberToVideoLengthEnum = (
  seconds?: number,
): VideoLengthSeconds | undefined => {
  if (seconds === undefined || seconds === null) return undefined;
  const enumKey = `S_${seconds}` as keyof typeof VideoLengthSeconds;
  if (Object.values(VideoLengthSeconds).includes(enumKey as any)) {
    return enumKey as VideoLengthSeconds;
  }
  console.warn(`No matching VideoLengthSeconds enum for value: ${seconds}`);
  return undefined;
};

/**
 * Safely maps a string to a Prisma enum.
 * @param enumObj The Prisma enum object (e.g., CaptionLength).
 * @param value The string value from the form (e.g., 'short').
 * @returns The corresponding enum member (e.g., CaptionLength.SHORT).
 */
function mapToEnum<T extends object>(enumObj: T, value: string): T[keyof T] {
  const upperValue = value.toUpperCase().replace('-', '_') as keyof T;
  if (upperValue in enumObj) {
    return enumObj[upperValue];
  }
  throw new Error(`Invalid enum value: ${value} for enum ${Object.keys(enumObj)}`);
}

// ============================================================================
// Form Data → Prisma Input (Outbound: UI → Database)
// ============================================================================

/**
 * Maps form data to Prisma create input.
 */
export function formDataToPrismaInput(
  formData: CampaignFormData,
  userId: string,
): Prisma.CampaignCreateInput {
  return {
    title: formData.title,
    campaignObjective: formData.objective,
    narrativeContext: formData.narrativeContext || null,
    postCaptionLength: mapToEnum(CaptionLength, formData.postLength),
    startDate: formData.startDate,
    endDate: formData.endDate,
    daysOfWeek: formData.cadence.daysOfWeek.map((day) => mapToEnum(Weekdays, day)),
    frequency: mapToEnum(EventCadence, formData.cadence.frequency),
    postType: mapToEnum(PostType, formData.postType),
    postVideoLength: numberToVideoLengthEnum(formData.videoLength),
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
