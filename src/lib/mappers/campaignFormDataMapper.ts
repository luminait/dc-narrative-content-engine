import type { Campaign, Prisma, Character, Persona } from '@/src/server/db/types';
import type {
    CampaignFormData,
    CharacterFormData,
    CharacterSelectionData,
    PersonaFormData
} from '@/src/features/campaigns/campaign.schema';
import type { CampaignWithStatus } from '@/src/lib/types/ui';
import { getDefaultImage } from '@/src/server/db/helpers/character';

// ============================================================================
// Form Data → Prisma Input (Outbound: UI → Database)
// ============================================================================

/**
 * Maps form data to Prisma create input.
 * Transforms Zod-validated form data into database-compatible format.
 *
 * @param formData - Validated form data from Zod schema
 * @param userId - User ID for creator relationship
 * @returns Prisma input for campaign creation
 */
export function formDataToPrismaInput(
    formData: CampaignFormData,
    userId: string
): Prisma.CampaignCreateInput {
    return {
        title: formData.title,
        campaignObjective: formData.objective,
        narrativeContext: formData.narrativeContext || null,
        postCaptionLength: formData.postLength as any, // TODO: Map to proper enum
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        daysOfWeek: formData.cadence.daysOfWeek as any[], // TODO: Map to Weekdays enum
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

// ============================================================================
// Prisma Types → Form Types (Inbound: Database → UI)
// ============================================================================

/**
 * Maps Prisma Character to form-friendly CharacterFormData.
 * Extracts only the fields needed for the campaign form.
 *
 * @param character - Full Prisma Character type from database
 * @returns Simplified character data for form consumption
 */
export function characterToFormData(character: Character): CharacterFormData {
    return {
        id: character.id,
        name: character.name,
        // tagline: character.tagline || undefined,
        // imageUrl: character.imageUrl || undefined,
    };
}

/**
 * Maps array of Prisma Characters to form-friendly data.
 */
export function charactersToFormData(characters: Character[]): CharacterFormData[] {
    return characters.map(characterToFormData);
}

/**
 * Maps Prisma Persona to form-friendly PersonaFormData.
 * Extracts only the fields needed for the campaign form.
 *
 * @param persona - Full Prisma Persona type from database
 * @returns Simplified persona data for form consumption
 */
export function personaToFormData(persona: Persona): PersonaFormData {
    return {
        id: persona.id,
        name: persona.label || 'persona',
        description: persona.description || undefined,
    };
}

/**
 * Maps array of Prisma Personas to form-friendly data.
 */
export function personasToFormData(personas: Persona[]): PersonaFormData[] {
    return personas.map(personaToFormData);
}

/**
 * Maps Prisma Campaign (with relations) to form data for editing.
 * Useful when loading an existing campaign for editing.
 *
 * @param campaign - Campaign with relations from database
 * @returns Form data structure
 */
export function campaignToFormData(campaign: Campaign & {
    personas?: Array<{ personaId: string }>;
    characters?: Array<{ characterId: string }>;
    mergeFields?: Array<any>;
}): Partial<CampaignFormData> {
    return {
        title: campaign.title,
        objective: campaign.campaignObjective,
        narrativeContext: campaign.narrativeContext || undefined,
        postLength: campaign.postCaptionLength as any,
        startDate: campaign.startDate?.toISOString().split('T')[0],
        endDate: campaign.endDate?.toISOString().split('T')[0],
        cadence: {
            daysOfWeek: campaign.daysOfWeek as string[],
            frequency: campaign.frequency === 'weekly' ? 'weekly' : 'bi-weekly',
        },
        postType: campaign.postType === 'single_image' ? 'image' : campaign.postType as any,
        videoLength: campaign.postVideoLength as any,
        personas: campaign.personas?.map(p => p.personaId) || [],
        characters: campaign.characters?.map(c => c.characterId) || [],
        mergeFields: campaign.mergeFields?.map(field => ({
            id: field.id,
            mergeField: field.mergeField,
            description: field.description || undefined,
            valueType: field.mediaValueType,
            value: '', // Not stored in DB
            startTime: field.startTime,
            endTime: field.endTime,
        })) || [],
    };
}

// ============================================================================
// Campaign Status Utilities
// ============================================================================

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


/**
 * Maps Prisma Character (with assets) to UI-safe CharacterSelectionData.
 * Pre-computes the default image URL for client consumption.
 * SERVER-SIDE ONLY - Call this in Server Components or API routes.
 *
 * @param character - Full Prisma Character with assets
 * @returns Client-safe character data with pre-computed image URL
 */
export function characterToSelectionData(
    character: Character & { assets?: Array<{ id: string; assetRef: string; isPrimary?: boolean | null }> }
): CharacterSelectionData {
    const defaultAsset = getDefaultImage(character.assets as any);
    const imageUrl = defaultAsset?.assetRef
        ? `/api/storage/${defaultAsset.assetRef}`
        : undefined;

    return {
        id: character.id,
        name: character.name,
        characterTypes: character.characterTypes,
        imageUrl,
    };
}

/**
 * Maps array of Prisma Characters to UI-safe selection data.
 * SERVER-SIDE ONLY.
 */
export function charactersToSelectionData(
    characters: Array<Character & { assets?: Array<any> }>
): CharacterSelectionData[] {
    return characters.map(characterToSelectionData);
}
