'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { z } from 'zod';
import { characterSelectionSchema, type CharacterSelectionData } from '@/src/lib/zod/campaign.schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/shadcn/collapsible';
import { Input } from '@/ui/shadcn/input';
import { Label } from '@/ui/shadcn/label';
import { Badge } from '@/ui/shadcn/badge';
import ImageWithFallback from '@/ui/common/ImageWithFallback';
import { Users, ChevronDown, ChevronRight, Search, X } from 'lucide-react';

// ============================================================================
// Props Types
// ============================================================================

const charactersSectionPropsSchema = z.object({
    characters: z.array(characterSelectionSchema),
    initialSelection: z.array(z.string().uuid()).optional(),
    selectionMode: z.enum(['single', 'multiple']).default('multiple'),
    onSelectionChange: z.function().optional(),
    collapsible: z.boolean().default(true),
});

type CharactersSectionProps = z.infer<typeof charactersSectionPropsSchema> & {
    onSelectionChange?: (selectedIds: string[]) => void;
};

// ============================================================================
// Sub-Components
// ============================================================================

interface CharacterCardProps {
    character: CharacterSelectionData;
    isSelected: boolean;
    onToggle: (id: string) => void;
}

function CharacterCard({ character, isSelected, onToggle }: CharacterCardProps) {
    const imgSrc = character.imageUrl ?? '';
    if (!imgSrc) {
        // Debug: surface empty/missing image URLs
        console.warn('[CharactersSelection] Empty imageUrl for character', {
            id: character.id,
            name: character.name,
            characterTypes: character.characterTypes
        });
    }
    return (
        <div
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`${isSelected ? 'Deselect' : 'Select'} ${character.name}`}
            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                isSelected
                    ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
            }`}
            onClick={() => onToggle(character.id)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggle(character.id);
                }
            }}
            title={imgSrc || 'No image URL'}
            data-img-src={imgSrc}
        >
            <div className="text-center">
                <div className="relative mx-auto mb-2 h-20 w-20 overflow-hidden rounded">
                    <ImageWithFallback
                        src={imgSrc}
                        alt={character.name}
                        className="h-full w-full object-cover"
                        onError={() => {
                            console.error('[CharactersSelection] Image failed to load', {
                                id: character.id,
                                name: character.name,
                                imgSrc,
                            });
                        }}
                    />
                    {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-20">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                                <X className="h-4 w-4 text-white" aria-hidden="true" />
                            </div>
                        </div>
                    )}
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {character.name}
                </h3>
                {character.characterTypes && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        {character.characterTypes}
                    </p>
                )}
            </div>
        </div>
    );
}

interface SelectedBadgesProps {
    selectedIds: string[];
    characters: CharacterSelectionData[];
    onRemove: (id: string) => void;
}

function SelectedBadges({ selectedIds, characters, onRemove }: SelectedBadgesProps) {
    if (selectedIds.length === 0) return null;

    return (
        <div className="mt-4">
            <Label>Selected Characters ({selectedIds.length})</Label>
            <div className="mt-2 flex flex-wrap gap-2">
                {selectedIds.map((charId) => {
                    const character = characters.find((c) => c.id === charId);
                    return (
                        <Badge key={charId} variant="secondary" className="flex items-center space-x-1">
                            <span>{character?.name ?? 'Unknown'}</span>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(charId);
                                }}
                                aria-label={`Remove ${character?.name ?? charId}`}
                                className="ml-1"
                            >
                                <X className="h-3 w-3 cursor-pointer" />
                            </button>
                        </Badge>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export default function CharactersSection({
    characters,
    initialSelection = [],
    onSelectionChange,
    selectionMode = 'multiple',
    collapsible = true,
}: CharactersSectionProps) {
    const [selectedCharacters, setSelectedCharacters] = useState<string[]>(initialSelection);
    const [isOpen, setIsOpen] = useState(!collapsible);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        onSelectionChange?.(selectedCharacters);
    }, [selectedCharacters, onSelectionChange]);

    const filteredCharacters = useMemo(() => {
        if (!searchTerm) return characters;
        const lower = searchTerm.toLowerCase();
        return characters.filter(
            (char) =>
                char.name.toLowerCase().includes(lower) ||
                (char.characterTypes?.toLowerCase().includes(lower) ?? false)
        );
    }, [characters, searchTerm]);

    const handleToggle = useCallback(
        (characterId: string) => {
            setSelectedCharacters((prev) => {
                if (selectionMode === 'single') {
                    return prev.includes(characterId) ? [] : [characterId];
                }
                // Multiple selection mode
                return prev.includes(characterId)
                    ? prev.filter((id) => id !== characterId)
                    : [...prev, characterId];
            });
        },
        [selectionMode]
    );

    const content = (
        <>
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" aria-hidden="true" />
                <Input
                    type="search"
                    placeholder="Search characters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    aria-label="Search characters"
                />
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {filteredCharacters.map((character) => (
                    <CharacterCard
                        key={character.id}
                        character={character}
                        isSelected={selectedCharacters.includes(character.id)}
                        onToggle={handleToggle}
                    />
                ))}
            </div>
            {selectionMode === 'multiple' && (
                <SelectedBadges
                    selectedIds={selectedCharacters}
                    characters={characters}
                    onRemove={handleToggle}
                />
            )}
        </>
    );

    if (!collapsible) {
        return <div className="space-y-4">{content}</div>;
    }

    return (
        <Card>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Users className="h-5 w-5 text-orange-600" aria-hidden="true" />
                                <span>Featured Characters</span>
                            </div>
                            {isOpen ? (
                                <ChevronDown className="h-4 w-4" aria-hidden="true" />
                            ) : (
                                <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            )}
                        </CardTitle>
                        <CardDescription>
                            Select the Pokémon characters to feature in your campaign
                        </CardDescription>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="space-y-4">{content}</CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
