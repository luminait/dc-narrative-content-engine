import { apiClient } from './client';
import { Character } from '@/src/lib/types/ui';
import fallbackCharacters from '@/src/data/fallbackCharacters.json'; // <-- add this import

type CharacterApiResponse = {
    characters: Character[];
    source?: 'fallback' | 'live';
    message?: string;
    error?: string;
};

export const getCharacters = async (searchQuery = ''): Promise<CharacterApiResponse> => {
    try {
        const endpoint = searchQuery
            ? `/characters/search?q=${encodeURIComponent(searchQuery)}`
            : '/characters';

        const data = await apiClient<CharacterApiResponse>(endpoint);
        if (data.error) throw new Error(data.error);

        if (!data.characters || data.characters.length === 0) {
            return {
                characters: fallbackCharacters as unknown as Character[],
                source: 'fallback',
                message: 'Server returned no characters; using fallback.',
            };
        }
        return data;
    } catch (error) {
        console.error('Failed to fetch characters, using fallback.', error);
        return {
            characters: fallbackCharacters as unknown as Character[],
            source: 'fallback',
            message: (error as Error).message,
        };
    }
};
