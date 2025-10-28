export const isMediaAssetType = (mediaType: string) =>
    ['image','video','audio_music','audio_voice','image_or_audio'].includes(mediaType);

export const isAssetReferenceId = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export const isAssetsTableMissingError = (error: unknown): boolean => {
    const code = (error as any)?.code;
    if (code === '42P01') return true;
    const msg = typeof error === 'string' ? error : (error as any)?.message || '';
    return msg.includes('relation "public.assets" does not exist') ||
        (msg.includes('assets') && msg.includes('does not exist'));
};
