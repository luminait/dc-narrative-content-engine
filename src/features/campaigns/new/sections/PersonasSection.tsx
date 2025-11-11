'use client';

import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { Persona } from '@/src/server/db/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/shadcn/collapsible';
import { Checkbox } from '@/ui/shadcn/checkbox';
import { Badge } from '@/ui/shadcn/badge';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/ui/shadcn/field';
import { Users, ChevronDown, ChevronRight, X } from 'lucide-react';
import type { CampaignFormData } from '../../../../lib/zod/campaign.schema';

interface PersonasSectionProps {
  personas: Persona[];
}

export default function PersonasSection({ personas }: PersonasSectionProps) {
  const { control, watch } = useFormContext<CampaignFormData>();
  const [isOpen, setIsOpen] = useState(true);
  const selectedPersonas = watch('personas');

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-slate-900/50">
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
          <CardContent className="space-y-6 pt-6">
            <Controller
              name="personas"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Personas *</FieldLabel>
                  <FieldGroup className="space-y-3 pt-2">
                    {personas.map((persona) => (
                      <Field
                        key={persona.id}
                        asChild
                        className={`cursor-pointer rounded-lg border p-4 transition-colors data-[invalid]:border-red-500 data-[checked]:border-blue-500 data-[checked]:bg-blue-950/50`}
                      >
                        <label>
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              aria-invalid={fieldState.invalid}
                              checked={field.value.includes(persona.id)}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...field.value, persona.id]
                                  : field.value.filter((id) => id !== persona.id);
                                field.onChange(newValue);
                              }}
                            />
                            <h3 className="text-sm font-medium">{persona.name}</h3>
                          </div>
                          {persona.description && (
                            <p className="mt-2 pl-7 text-xs text-slate-500">
                              {persona.description}
                            </p>
                          )}
                        </label>
                      </Field>
                    ))}
                  </FieldGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {selectedPersonas?.length > 0 && (
              <div className="mt-4">
                <FieldLabel>Selected Personas ({selectedPersonas.length})</FieldLabel>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedPersonas.map((personaId) => {
                    const persona = personas.find((p) => p.id === personaId);
                    return (
                      <Badge key={personaId} variant="secondary" className="flex items-center space-x-1">
                        <span>{persona?.name || personaId}</span>
                        <Controller
                          name="personas"
                          control={control}
                          render={({ field }) => (
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => {
                                const newValue = field.value.filter((id) => id !== personaId);
                                field.onChange(newValue);
                              }}
                            />
                          )}
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
