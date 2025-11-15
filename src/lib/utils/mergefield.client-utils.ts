import type { MergeField } from '@/src/lib/zod/campaign.schema';

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
