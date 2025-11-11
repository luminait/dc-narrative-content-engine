// server-only mapper: Prisma → UI DTOs
import type { DbCampaignWithAll } from '@/src/server/db/selects/campaign';
import type { PersonaData, CampaignData } from '@/src/lib/zod/campaign.schema';

type PersonaJoin = DbCampaignWithAll['personas'][number];

export function toUIPersona(p: PersonaJoin): PersonaData {
    return {
        id: p.persona?.id ?? p.personaKey ?? '',
        name: p.persona?.name ?? '',
        description: p.persona?.description ?? '',
        personaKey: p.personaKey ?? '',
        isPrimaryPersona: p.isPrimaryPersona,
        createdAt: (p.persona?.createdAt ?? new Date(0)).toISOString(),
        updatedAt: (p.persona?.updatedAt ?? new Date(0)).toISOString(),
        deletedAt: p.persona?.deletedAt?.toISOString(),
    };
}

export function toUICampaign(c: DbCampaignWithAll): CampaignData {
    const personas = c.personas
        .map(p => p.persona?.id ?? p.personaKey)
        .filter((x): x is string => Boolean(x));

    const primaryPersonaKey =
        c.personas.find(p => p.isPrimaryPersona)?.personaKey
        ?? undefined;

    return {
        id: c.id,
        title: c.title,
        objective: c.campaignObjective,
        narrativeContext: c.narrativeContext ?? '',
        postCaptionLength: c.postCaptionLength,
        startDate: c.startDate ?? undefined,
        endDate: c.endDate ?? undefined,
        cadence: {
            daysOfWeek: c.daysOfWeek,
            frequency: c.frequency,
        },
        postType: c.postType,
        videoLength: c.postVideoLength ? (
            c.postVideoLength === 'THIRTY' ? 30 :
                c.postVideoLength === 'FORTY_FIVE' ? 45 :
                    c.postVideoLength === 'SIXTY' ? 60 : undefined
        ) : undefined,

        // Personas: UI currently expects array<string> of persona IDs.
        // If/when you switch to full PersonaData, replace this with c.personas.map(toUIPersona)
        personas,
        primaryPersonaKey,

        // Characters: array of character names
        characters: c.characters.map(cc => cc.character.name),

        // Merge field names (adjust if you later need full fields)
        mergeFields: c.mergeFields.map(m => ({ name: m.name })) as any,

        isActive: c.isActive,
        isArchived: c.isArchived,
        isDraft: c.isDraft,
        createdAt: c.createdAt ?? undefined,
        updatedAt: c.updatedAt ?? undefined,
        deletedAt: c.deletedAt ?? undefined,
    };
}
