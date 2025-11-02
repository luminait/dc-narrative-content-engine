'use client';

import { useState, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/shadcn/collapsible';
import { Input } from '@/ui/shadcn/input';
import { Badge } from '@/ui/shadcn/badge';
import ImageWithFallback from '@/ui/common/ImageWithFallback';
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldError,
  FieldSet
} from '@/ui/shadcn/field'; // Assuming new components are here
import { Users, ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import type { CampaignFormData, CharacterSelectionData } from '../../campaign.schema';

interface CharactersSectionProps {
  characters: CharacterSelectionData[];
}

interface CharacterCardProps {
  character: CharacterSelectionData;
}

function CharacterCard({ character }: CharacterCardProps) {
  return (
    <div className="text-center">
      <div className="relative mx-auto mb-2 h-20 w-20 overflow-hidden rounded">
        <ImageWithFallback
          src={character.imageUrl ?? ''}
          alt={character.name}
          className="h-full w-full object-cover"
        />
        <FieldControl>
          <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-20 data-[state=unchecked]:hidden">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
              <X className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
          </div>
        </FieldControl>
      </div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{character.name}</h3>
      {character.characterTypes && (
        <p className="text-xs text-gray-600 dark:text-gray-400">{character.characterTypes}</p>
      )}
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
      <FieldLabel>Selected Characters ({selectedIds.length})</FieldLabel>
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

export default function CharactersSection({ characters }: CharactersSectionProps) {
  const { watch, setValue } = useFormContext<CampaignFormData>();
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedCharacters = watch('characters');

  const filteredCharacters = useMemo(() => {
    if (!searchTerm) return characters;
    const lower = searchTerm.toLowerCase();
    return characters.filter(
      (char) =>
        char.name.toLowerCase().includes(lower) ||
        (char.characterTypes?.toLowerCase().includes(lower) ?? false),
    );
  }, [characters, searchTerm]);

  const handleToggle = (characterId: string) => {
    const newValue = selectedCharacters?.includes(characterId)
      ? selectedCharacters?.filter((id) => id !== characterId)
      : [...(selectedCharacters || []), characterId];
    setValue('characters', newValue);
  };

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
            <CardDescription>Select the Pokémon characters to feature in your campaign</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-4">
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
            <FieldSet name="characters">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {filteredCharacters.map((character) => (
                  <Field
                    key={character.id}
                    name="characters"
                    type="checkbox"
                    value={character.id}
                    className="cursor-pointer rounded-lg border p-3 transition-colors data-[state=checked]:border-blue-300 data-[state=checked]:bg-blue-50 dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-950"
                  >
                    <CharacterCard character={character} />
                  </Field>
                ))}
              </div>
              <FieldError />
            </FieldSet>
            <SelectedBadges
              selectedIds={selectedCharacters}
              characters={characters}
              onRemove={handleToggle}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
