'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Character, MergeField, Persona } from '@/lib/types';
import { getCharacters } from '@/api/characters';
// NOTE: You would create these API services similarly to getCharacters
// import { getPersonas } from '@/lib/api/personas';
// import { createCampaign, CreateCampaignPayload } from '@/lib/api/campaigns';

export function useCampaignForm() {
    const router = useRouter();

    // Form Input State
    const [formData, setFormData] = useState({
        title: '',
        campaignObjective: '',
        narrativeContext: '',
        postLength: '',
        postCaptionLength: '',
        startDate: '',
        endDate: ''
    });
    const [cadence, setCadence] = useState({
        daysOfWeek: [] as string[],
        frequency: 'weekly' as 'weekly' | 'bi-weekly'
    });
    const [postType, setPostType] = useState<'image' | 'carousel' | 'video'>('image');

    // Data & Selection State
    const [characters, setCharacters] = useState<Character[]>([]);
    const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
    const [characterSearch, setCharacterSearch] = useState('');

    // Loading & Error State
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Debounced search effect
    useEffect(() => {
        const fetchDebouncedCharacters = setTimeout(() => {
            setIsLoading(true);
            getCharacters(characterSearch)
                .then(response => {
                    setCharacters(response.characters);
                    if (response.source === 'fallback') {
                        setError(response.message || 'Using fallback character data.');
                    } else {
                        setError(null);
                    }
                })
                .catch(err => setError((err as Error).message))
                .finally(() => setIsLoading(false));
        }, 300);

        return () => clearTimeout(fetchDebouncedCharacters);
    }, [characterSearch]);

    // Initial data load
    useEffect(() => {
        setIsLoading(true);
        // In a real app, you'd fetch personas and other data here too
        // Promise.all([getCharacters(), getPersonas()])
        getCharacters()
            .then(response => {
                setCharacters(response.characters);
                if (response.source === 'fallback') {
                    setError(response.message || 'Using fallback character data.');
                }
            })
            .catch(err => setError((err as Error).message))
            .finally(() => setIsLoading(false));
    }, []);

    const handleCharacterToggle = useCallback((characterName: string) => {
        setSelectedCharacters(prev =>
            prev.includes(characterName)
                ? prev.filter(c => c !== characterName)
                : [...prev, characterName]
        );
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // const payload: CreateCampaignPayload = { ... };
        try {
            // const newCampaign = await createCampaign(payload);
            // router.push(`/campaigns/${newCampaign.id}`);
            console.log("Form submitted!", { formData, selectedCharacters });
            alert("Campaign created successfully! (Simulation)");
            router.push('/');
        } catch (err) {
            setError(`Failed to create campaign: ${(err as Error).message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        // State
        formData,
        characters,
        selectedCharacters,
        characterSearch,
        isLoading,
        isSubmitting,
        error,
        postType,

        // Handlers
        setFormData,
        setCharacterSearch,
        handleCharacterToggle,
        setPostType,
        handleSubmit,
    };
}
