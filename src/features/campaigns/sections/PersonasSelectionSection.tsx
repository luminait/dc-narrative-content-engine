'use client';

import { useState } from 'react';
import type { Persona } from '@/src/server/db/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/shadcn/collapsible';
import { Checkbox } from '@/ui/shadcn/checkbox';
import { Label } from '@/ui/shadcn/label';
import { Badge } from '@/ui/shadcn/badge';
import { Users, ChevronDown, ChevronRight, X } from 'lucide-react';

interface PersonasSectionProps {
  personas: Persona[];
  selectedPersonas: string[];
  setSelectedPersonas: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function PersonaSelection( {
  personas,
  selectedPersonas,
  setSelectedPersonas,
}: PersonasSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (personaId: string) => {
    setSelectedPersonas((prev) =>
      prev.includes(personaId) ? prev.filter((id) => id !== personaId) : [...prev, personaId]
    );
  };

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
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {personas.map((persona) => (
                <div
                  key={persona.id}
                  className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                    selectedPersonas.includes(persona.id)
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                  }`}
                  onClick={() => handleToggle(persona.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox checked={selectedPersonas.includes(persona.id)} />
                    <h3 className="text-sm font-medium">{persona.label}</h3>
                  </div>
                  {persona.description && (
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">{persona.description}</p>
                  )}
                </div>
              ))}
            </div>

            {selectedPersonas.length > 0 && (
              <div className="mt-4">
                <Label>Selected Personas ({selectedPersonas.length})</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedPersonas.map((personaId) => {
                    const persona = personas.find((p) => p.id === personaId);
                    return (
                      <Badge key={personaId} variant="secondary" className="flex items-center space-x-1">
                        <span>{persona?.label || personaId}</span>
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggle(personaId);
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
