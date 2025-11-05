'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { Persona } from '@/src/server/db/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/shadcn/collapsible';
import { Checkbox } from '@/ui/shadcn/checkbox';
import { Badge } from '@/ui/shadcn/badge';
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldError,
  FieldSet
} from '@/ui/shadcn/field'; // Assuming new components are here
import { Users, ChevronDown, ChevronRight, X } from 'lucide-react';
import type { CampaignFormData } from '../../campaign.schema';

interface PersonasSectionProps {
  personas: Persona[];
}

export default function PersonaSelection({ personas }: PersonasSectionProps) {
  const { watch, setValue } = useFormContext<CampaignFormData>();
  const [isOpen, setIsOpen] = useState(true);
  const selectedPersonas = watch('personas');

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <span>Target Audience</span>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CardTitle>
            <CardDescription>Choose the audience personas for your campaign</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-4">
            <FieldSet name="personas">
              <FieldLabel>Personas *</FieldLabel>
              <div className="space-y-3 pt-2">
                {personas.map((persona) => (
                  <Field
                    key={persona.id}
                    title="personas"

                    defaultValue={persona.id}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors data-[checked]:border-blue-300 data-[checked]:bg-blue-50 dark:data-[checked]:border-blue-700 dark:data-[checked]:bg-blue-950`}
                  >
                    <div className="flex items-center space-x-3">
                      <FieldContent>
                        <Checkbox />
                      </FieldContent>
                      <h3 className="text-sm font-medium">{persona.name}</h3>
                    </div>
                    {persona.description && (
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        {persona.description}
                      </p>
                    )}
                  </Field>
                ))}
              </div>
              <FieldError />
            </FieldSet>

            {selectedPersonas.length > 0 && (
              <div className="mt-4">
                <FieldLabel>Selected Personas ({selectedPersonas.length})</FieldLabel>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedPersonas.map((personaId) => {
                    const persona = personas.find((p) => p.id === personaId);
                    return (
                      <Badge key={personaId} variant="secondary" className="flex items-center space-x-1">
                        <span>{persona?.name || personaId}</span>
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newValue = selectedPersonas?.filter((id) => id !== personaId);
                            setValue('personas', newValue);
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
