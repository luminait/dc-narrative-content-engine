'use client';

import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/shadcn/collapsible';
import { FieldError, FieldLabel, FieldSet } from '@/ui/shadcn/field';
import { RadioGroup, RadioGroupItem } from '@/ui/shadcn/radio-group';
import { ChevronDown, ChevronRight, Video } from 'lucide-react';
import type { CampaignFormData } from '../../campaign.schema';

const videoLengthOptions = [
  { value: 30, label: '30 seconds', description: 'Short, quick content' },
  { value: 45, label: '45 seconds', description: 'Medium-length content' },
  { value: 60, label: '60 seconds', description: 'Longer, detailed content' },
];

export default function VideoLengthSection() {
  const { control } = useFormContext<CampaignFormData>();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Video className="h-5 w-5 text-red-600" />
                <span>Video Length</span>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CardTitle>
            <CardDescription>Choose the duration for your video content</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-4">
            <Controller
              name="videoLength"
              control={control}
              render={({ field, fieldState }) => (
                <FieldSet>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={String(field.value)}
                    className="grid grid-cols-1 gap-4 md:grid-cols-3"
                  >
                    {videoLengthOptions.map((option) => (
                      <div key={option.value}>
                        <RadioGroupItem
                          value={String(option.value)}
                          id={`videoLength-${option.value}`}
                          className="peer sr-only"
                        />
                        <FieldLabel
                          htmlFor={`videoLength-${option.value}`}
                          className="block cursor-pointer rounded-lg border bg-transparent p-4 text-center transition-colors peer-data-[state=checked]:border-blue-300 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:border-blue-700 dark:peer-data-[state=checked]:bg-blue-950"
                        >
                          <h3 className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {option.label}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{option.description}</p>
                        </FieldLabel>
                      </div>
                    ))}
                  </RadioGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldSet>
              )}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
