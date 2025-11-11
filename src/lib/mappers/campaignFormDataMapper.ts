import type { Prisma } from '@/src/server/db/generated/prisma';
import {
  CaptionLength,
  EventCadence,
  PostType,
  VideoLengthSeconds,
  Weekdays,
} from '@/src/server/db/generated/prisma';
import type { CampaignFormData } from '@/src/lib/zod/campaign.schema';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Converts a number (of seconds) to its corresponding VideoLengthSeconds enum.
 */
const numberToVideoLengthEnum = (
  seconds?: number,
): VideoLengthSeconds | undefined => {
  if (seconds === undefined || seconds === null) return undefined;
  switch (seconds) {
    case 30:
      return VideoLengthSeconds.THIRTY;
    case 45:
      return VideoLengthSeconds.FORTY_FIVE;
    case 60:
      return VideoLengthSeconds.SIXTY;
    default:
      console.warn(`No matching VideoLengthSeconds enum for value: ${seconds}`);
      return undefined;
  }
};

/**
 * Safely maps a string to a Prisma enum.
 * @param enumObj The Prisma enum object (e.g., CaptionLength).
 * @param value The string value from the form (e.g., 'short').
 * @returns The corresponding enum member (e.g., CaptionLength.SHORT).
 */
function mapToEnum<T extends object>(enumObj: T, value: string): T[keyof T] {
  const normalizedValue = value.toUpperCase().replace('-', '_'); // e.g., "MEDIUM"

  // Iterate over the *values* of the enum to find a match
  for (const key in enumObj) {
    // Ensure it's a string enum member, not a reverse mapping from numeric enums
    if (typeof enumObj[key] === 'string') {
      const enumMemberValue = enumObj[key] as string;
      if (enumMemberValue.toUpperCase() === normalizedValue) {
        return enumObj[key]; // Return the actual enum value (e.g., 'MEDIUM')
      }
    }
  }

  // If no match found, throw an error with clearer enum values
  const validEnumValues = Object.values(enumObj)
    .filter((v) => typeof v === 'string') // Filter out numeric keys from numeric enums
    .map((v) => (v as string).toLowerCase()); // Present valid options in lowercase for user
  throw new Error(`Invalid enum value: "${value}" for enum. Valid options are: ${validEnumValues.join(', ')}`);
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
          })),
        }
      : undefined,
  };
}
