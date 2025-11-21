'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCharacters } from '@/app/api/characters';
import { 
  type CampaignData,
  type CharacterData,
  type PersonaData,
  type MergeField,
  safeParseCampaignForm,
  validateCampaignForm,
} from '@/src/lib/zod/campaign.schema';
import { charactersToFormData } from '@/src/lib/mappers/campaignFormDataMapper';

// NOTE: You would create these API services similarly to getCharacters
// import { getPersonas } from '@/lib/api/personas';
// import { createCampaign } from '@/lib/api/campaigns';


// TODO: Delete this file after next commit


export function useCampaignForm() {
    const router = useRouter();

    // Form Input State - Using Zod types
    const [formData, setFormData] = useState<Partial<CampaignData>>({
        title: '',
        objective: '',
        narrativeContext: '',
        postLength: '',
        startDate: '',
        endDate: '',
        cadence: {
            daysOfWeek: [],
            frequency: 'weekly',
        },
        postType: 'single_image',
        personas: [],
        characters: [],
        mergeFields: [],
    });

    // Data & Selection State - Using Zod form types
    const [characters, setCharacters] = useState<CharacterData[]>([]);
    const [personas, setPersonas] = useState<PersonaData[]>([]);
    const [characterSearch, setCharacterSearch] = useState('');

    // Loading & Error State
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Debounced search effect
    useEffect(() => {
        const fetchDebouncedCharacters = setTimeout(() => {
            setIsLoading(true);
            getCharacters(characterSearch)
                .then(response => {
                    // Map Prisma types to Zod form types
                    const formCharacters = charactersToFormData(response.characters);
                    setCharacters(formCharacters);
                    
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
                const formCharacters = charactersToFormData(response.characters);
                setCharacters(formCharacters);
                
                if (response.source === 'fallback') {
                    setError(response.message || 'Using fallback character data.');
                }
            })
            .catch(err => setError((err as Error).message))
            .finally(() => setIsLoading(false));
    }, []);

    const handleCharacterToggle = useCallback((characterId: string) => {
        setFormData(prev => {
            const currentCharacters = prev.characters || [];
            const newCharacters = currentCharacters.includes(characterId)
                ? currentCharacters.filter(c => c !== characterId)
                : [...currentCharacters, characterId];
            
            return {
                ...prev,
                characters: newCharacters,
            };
        });
    }, []);

    const handlePersonaToggle = useCallback((personaId: string) => {
        setFormData(prev => {
            const currentPersonas = prev.personas || [];
            const newPersonas = currentPersonas.includes(personaId)
                ? currentPersonas.filter(p => p !== personaId)
                : [...currentPersonas, personaId];
            
            return {
                ...prev,
                personas: newPersonas,
            };
        });
    }, []);

    const handleFieldChange = useCallback(<K extends keyof CampaignData>(
        field: K,
        value: CampaignData[K]
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
        
        // Clear validation error for this field
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setValidationErrors({});

        try {
            // Validate with Zod
            const validatedData = validateCampaignForm(formData);
            
            // TODO: Send to server action or API route
            // const newCampaign = await createCampaign(validatedData);
            // router.push(`/campaigns/${newCampaign.id}`);
            
            console.log("Form submitted with validated data!", validatedData);
            alert("Campaign created successfully! (Simulation)");
            router.push('/');
        } catch (err) {
            if (err instanceof Error && 'errors' in err) {
                // Zod validation errors
                const zodErrors = (err as any).errors;
                const errorMap: Record<string, string> = {};
                zodErrors.forEach((error: any) => {
                    const path = error.path.join('.');
                    errorMap[path] = error.message;
                });
                setValidationErrors(errorMap);
                setError('Please fix the validation errors above.');
            } else {
                setError(`Failed to create campaign: ${(err as Error).message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Safe validation for real-time feedback (optional)
    const validateField = useCallback((field: keyof CampaignData) => {
        const result = safeParseCampaignForm(formData);
        if (!result.success) {
            const fieldError = result.error.issues.find(
                (err) => err.path[0] === field
            );
            return fieldError?.message;
        }
        return undefined;
    }, [formData]);

    return {
        // State
        formData,
        characters,
        personas,
        characterSearch,
        isLoading,
        isSubmitting,
        error,
        validationErrors,

        // Handlers
        setFormData,
        setCharacterSearch,
        handleCharacterToggle,
        handlePersonaToggle,
        handleFieldChange,
        handleSubmit,
        validateField,
    };
}
