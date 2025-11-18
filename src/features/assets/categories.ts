export const ASSET_CATEGORIES = [
  'cards',
  'characters',
  'environments',
  'music',
  'voiceover',
] as const;

export type AssetCategory = typeof ASSET_CATEGORIES[number];

export const categoryToFolder: Record<AssetCategory, string> = {
  cards: 'cards',
  characters: 'characters',
  environments: 'environments',
  music: 'music',
  voiceover: 'voiceover',
};

export const categoryAllowedMimeTypes: Record<AssetCategory, string[]> = {
  cards: ['image/*', 'video/*'],
  characters: ['image/*', 'video/*'],
  environments: ['image/*', 'video/*'],
  music: ['audio/*'],
  voiceover: ['audio/*'],
};

export function isAssetCategory(value: string): value is AssetCategory {
  return (ASSET_CATEGORIES as readonly string[]).includes(value);
}

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-');
}
