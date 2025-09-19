import { apiClient } from './client';
import { Character } from '@/lib/types';

// In a real app, this fallback data would likely live in a separate file.
const fallbackCharacters: Character[] = [
    { id: 1, name: 'Pikachu', type: 'Electric', is_human: false, is_trainer: false },
    { id: 2, name: 'Charmander', type: 'Fire', is_human: false, is_trainer: false },
];

type CharacterApiResponse = {
    characters: Character[];
    source?: 'fallback' | 'live';
    message?: string;
    error?: string;
};

export const getCharacters = async (searchQuery = ''): Promise<CharacterApiResponse> => {
    try {
        const endpoint = searchQuery ? `/characters/search?q=${encodeURIComponent(searchQuery)}` : '/characters';
        const data = await apiClient<CharacterApiResponse>(endpoint);

        if (data.error) throw new Error(data.error);

        // If the API returns no characters, provide the local fallback
        if (!data.characters || data.characters.length === 0) {
            return { characters: fallbackCharacters, source: 'fallback', message: 'Server returned no characters; using fallback.' };
        }

        return data;
    } catch (error) {
        console.error('Failed to fetch characters, using fallback.', error);
        // Return fallback data on any network or server error
        return { characters: fallbackCharacters, source: 'fallback', message: (error as Error).message };
    }
};