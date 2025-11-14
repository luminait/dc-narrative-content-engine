'use client';

import { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/shadcn/collapsible';
import { FieldError, FieldLabel, FieldSet } from '@/ui/shadcn/field';
import { Users, ChevronDown, ChevronRight } from 'lucide-react';
import type { CampaignFormData, CharacterSelectionData } from '@/src/lib/zod/campaign.schema';
import CharacterPicker, {
  CharacterOption,
} from '@/src/features/campaigns/components/CharacterPicker';

// ============================================================================
// Props
// ============================================================================

interface CharactersSectionProps {
  characters: CharacterSelectionData[];
}

// ============================================================================
// Main Component
// ============================================================================

export default function CharactersSection({ characters }: CharactersSectionProps) {
  const { control } = useFormContext<CampaignFormData>();
  const [isOpen, setIsOpen] = useState(true);

  const characterOptions: CharacterOption[] = characters.map((c) => ({
    id: c.id,
    name: c.name,
    characterTypes: c.characterTypes ?? null,
    imageUrl: c.imageUrl ?? null,
  }));

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
          <CardContent className="space-y-4 pt-4">
            <Controller
              name="characters"
              control={control}
              render={({ field, fieldState }) => {
                const selectedIds: string[] = field.value || [];

                return (
                  <>
                    <FieldSet>
                      <FieldLabel>Characters</FieldLabel>
                      <CharacterPicker
                        characters={characterOptions}
                        selectedIds={selectedIds}
                        onChange={(ids) => field.onChange(ids)}
                        allowMultiple
                        showSearch
                        showSelectedBadges
                      />
                      {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
                    </FieldSet>
                  </>
                );
              }}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
