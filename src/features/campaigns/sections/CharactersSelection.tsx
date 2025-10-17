
'use client';

import { useState, useMemo } from 'react';
import type { Character } from '@/src/server/db/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/shadcn/collapsible';
import { Input } from '@/ui/shadcn/input';
import { Label } from '@/ui/shadcn/label';
import { Badge } from '@/ui/shadcn/badge';
import ImageWithFallback from '@/ui/common/ImageWithFallback';
import { Users, ChevronDown, ChevronRight, Search, X } from 'lucide-react';

interface CharactersSectionProps {
  characters: Character[];
  selectedCharacters: string[];
  setSelectedCharacters: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function CharactersSection({
  characters,
  selectedCharacters,
  setSelectedCharacters,
}: CharactersSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCharacters = useMemo(() => {
    if (!searchTerm) return characters;
    const lower = searchTerm.toLowerCase();
    return characters.filter(
      (char) =>
        char.name.toLowerCase().includes(lower) ||
        (char.type && char.type.toLowerCase().includes(lower))
    );
  }, [characters, searchTerm]);

  const handleToggle = (characterId: string) => {
    setSelectedCharacters((prev) =>
      prev.includes(characterId) ? prev.filter((id) => id !== characterId) : [...prev, characterId]
    );
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-600" />
                <span>Featured Characters</span>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CardTitle>
            <CardDescription>Select the Pokémon characters to feature in your campaign</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search characters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {filteredCharacters.map((character) => (
                <div
                  key={character.id}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    selectedCharacters.includes(character.id)
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                  }`}
                  onClick={() => handleToggle(character.id)}
                >
                  <div className="text-center">
                    <div className="relative mx-auto mb-2 h-20 w-20 overflow-hidden rounded">
                      <ImageWithFallback
                        src={character.defaultImage || ''}
                        alt={character.name}
                        className="h-full w-full object-cover"
                      />
                      {selectedCharacters.includes(character.id) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-20">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                            <X className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{character.name}</h3>
                    {character.type && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">{character.type}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedCharacters.length > 0 && (
              <div className="mt-4">
                <Label>Selected Characters ({selectedCharacters.length})</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedCharacters.map((charId) => {
                    const character = characters.find((c) => c.id === charId);
                    return (
                      <Badge key={charId} variant="secondary" className="flex items-center space-x-1">
                        <span>{character?.name || charId}</span>
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggle(charId);
                          }}
                        />
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
