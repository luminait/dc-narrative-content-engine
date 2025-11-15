import { MergeField } from '@/src/lib/zod/campaign.schema';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Converts a Prisma Decimal or other numeric type to a string.
 * Returns null if the value is null or undefined.
 */
export function toStringOrNull(value: any): string | null {
    if (value === null || value === undefined) return null;

    // Handle Prisma Decimal objects
    if (value instanceof Decimal) {
        return value.toString();
    }

    // Handle regular numbers
    if (typeof value === 'number') {
        return value.toString();
    }

    // Handle strings (already in correct format)
    if (typeof value === 'string') {
        return value;
    }

    return null;
}

/**
 * Calculates the length (duration) from startTime and endTime.
 * Both times should be in seconds (or same unit).
 * Returns null if either time is missing.
 */
export function calculateLength(startTime: string | null, endTime: string | null): string | null {
    if (!startTime || !endTime) return null;

    const start = parseFloat(startTime);
    const end = parseFloat(endTime);

    if (isNaN(start) || isNaN(end)) return null;

    const duration = end - start;
    return duration > 0 ? duration.toString() : null;
}

/**
 * Sanitizes merge fields from Prisma to ensure they match the schema.
 * Computes the 'length' property from startTime and endTime.
 * Handles Prisma Decimal conversion to strings.
 */
export function sanitizeMergeFields(fields: any[]): MergeField[] {
    return fields.map((field) => {
        const startTime = toStringOrNull(field.startTime);
        const endTime = toStringOrNull(field.endTime);

        return {
            id: field.id,
            name: field.name,
            description: field.description || null,
            mediaValueType: field.mediaValueType || undefined,
            value: field.value || null,
            type: field.type || undefined,
            startTime,
            endTime,
            // Computed property: calculate length from startTime and endTime
            length: calculateLength(startTime, endTime),
            shouldRefreshOnRegenerate: field.shouldRefreshOnRegenerate || undefined,
        };
    });
}




// Local interface mirroring the editing state used by MergeFieldsTab
export interface EditingStateLike {
    fieldId: string;
    name: string;
    description: string;
    value: string; // For media, this must be the asset_ref (UUID). For text, plain string.
    characterId?: string;
}

// Helper to coerce Decimal-like or object-y numerics to plain numbers for serialization
export const toNumber = (v: unknown): number | null => {
    if (v === null || v === undefined) return null;
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    }
    if (typeof (v as any)?.toNumber === 'function') {
        try { return (v as any).toNumber(); } catch {/* noop */}
    }
    const n = Number((v as any)?.valueOf?.() ?? v);
    return Number.isFinite(n) ? n : null;
};

/**
 * Build a strictly-serializable payload for updateMergeFieldAction.
 * Rules:
 * - Text-type fields store the free-text value.
 * - Media-type fields (image, image_or_video, video, audio_music, audio_voice, gen_ai_voice, luma_matte, character, environment, music, voiceover)
 *   must store the asset_ref UUID in `value`.
 * - Start/end times are coerced to numbers (seconds) when provided.
 * - shouldRefreshOnRegenerate is preserved if present, else false.
 */
export function buildMergeFieldUpdatePayload(field: MergeField, editing: EditingStateLike) {
    // Determine the stored value: for media-like fields, use asset_ref from editing.value.
    const mediaTypes = new Set([
        'image', 'image_or_video', 'video', 'audio_music', 'audio_voice', 'gen_ai_voice',
    ]);
    const semanticTypes = new Set([
        'character', 'environment', 'music', 'voiceover', 'luma_matte',
    ]);

    const isMedia = mediaTypes.has(field.mediaValueType as any) || semanticTypes.has((field.type as any) ?? '');

    const valueToPersist = isMedia
        ? (editing.value ?? '').trim() // expected to be asset_ref
        : (editing.value ?? '');

    return {
        name: editing.name ?? '',
        description: editing.description ?? '',
        mediaValueType: field.mediaValueType,
        value: valueToPersist,
        type: field.type ?? null,
        startTime: toNumber((field as any).startTime),
        endTime: toNumber((field as any).endTime),
        shouldRefreshOnRegenerate:
            typeof (field as any).shouldRefreshOnRegenerate === 'boolean'
                ? (field as any).shouldRefreshOnRegenerate
                : false,
    } as const;
}

