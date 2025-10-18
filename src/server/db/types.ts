/**
/**
 * Server-side Prisma types and database-related types.
 * These are the authoritative types for database models.
 */

// Re-export all Prisma-generated types
export type {
  Campaign,
  User,
  Character,
  Persona,
  CampaignsCharacters,
  CampaignsPersonas,
  CharacterAsset,
  ShotstackMergeField,
  ShotstackRender,
  Prisma,
  // Enums
  UserRole,
  Weekdays,
  EventCadence,
  PostType,
  CaptionLength,
  VideoLengthSeconds,
  MoralAlignment,
  MergeFieldValueType,
  MergeFieldType,
} from './generated/prisma';

export { PrismaClient } from './generated/prisma';

/** ********************************************************************************************************************
 *
 * Prisma input types for mutations
 *
 **********************************************************************************************************************/

import type { Prisma } from './generated/prisma';

export type CampaignCreateInput = Prisma.CampaignCreateInput;
export type CampaignUpdateInput = Prisma.CampaignUpdateInput;
export type CampaignWhereInput = Prisma.CampaignWhereInput;
export type CampaignOrderByInput = Prisma.CampaignOrderByWithRelationInput;

export type CharacterCreateInput = Prisma.CharacterCreateInput;
export type CharacterUpdateInput = Prisma.CharacterUpdateInput;
export type CharacterWhereInput = Prisma.CharacterWhereInput;

export type PersonaCreateInput = Prisma.PersonaCreateInput;
export type PersonaUpdateInput = Prisma.PersonaUpdateInput;
export type PersonaWhereInput = Prisma.PersonaWhereInput;



/** ********************************************************************************************************************
 *
 * Campaign Types
 *
 **********************************************************************************************************************/
// Types with relations (for queries that include related data)
export type CampaignWithRelations = Prisma.CampaignGetPayload<{
  include: {
    personas: { include: { persona: true } };
    characters: { include: { character: true } };
    mergeFields: true;
  };
}>;


// Computed types (add UI-specific fields)
import type { Campaign } from "./generated/prisma";
export type CampaignWithCounts = Campaign & {
  personaCount: number;
  characterCount: number;
} ;


/** ********************************************************************************************************************
 *
 * Character Types
 *
 **********************************************************************************************************************/

export type CharacterWithAssets = Prisma.CharacterGetPayload<{
    include: {
        assets: {
            include: {
                storageObject: true;
            };
        };
    };
}>;


// Helper type that includes the defaultImage getter
export type CharacterWithDefaultImage = CharacterWithAssets & {
    readonly defaultImage: ReturnType<typeof import('./helpers/character').getDefaultImage>;
};
