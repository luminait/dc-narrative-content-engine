'use client';

import { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/shadcn/collapsible';
import { Button } from '@/ui/shadcn/button';
import { Input } from '@/ui/shadcn/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/shadcn/select';
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldError,
} from '@/ui/shadcn/field'; // Assuming new components are here
import { FileText, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import type { CampaignFormData } from '../../campaign.schema';

interface MergeFieldsSectionProps {
  valueTypes: string[];
}

export default function MergeFieldsSection({ valueTypes }: MergeFieldsSectionProps) {
  const { control } = useFormContext<CampaignFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'mergeFields',
  });
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                <span>Merge Fields</span>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CardTitle>
            <CardDescription>Define dynamic content fields for your video posts</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({ name: '', description: '', mediaValueType: valueTypes[0] || 'text' })
              }
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Field</span>
            </Button>

            {fields.length > 0 && (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <FieldLabel className="text-sm font-medium">Field #{index + 1}</FieldLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <Field title={`mergeFields.${index}.name`}>
                        <FieldLabel className="text-xs">Merge Field Name</FieldLabel>
                        <FieldContent>
                          <Input placeholder="e.g., character_name" />
                        </FieldContent>
                        <FieldError />
                      </Field>

                      <Field title={`mergeFields.${index}.mediaValueType`}>
                        <FieldLabel className="text-xs">Value Type</FieldLabel>
                        <FieldContent>
                          <Select>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {valueTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FieldContent>
                        <FieldError />
                      </Field>

                      <Field title={`mergeFields.${index}.value`}>
                        <FieldLabel className="text-xs">Value</FieldLabel>
                        <FieldContent>
                          <Input placeholder="Field value" />
                        </FieldContent>
                        <FieldError />
                      </Field>

                      <Field title={`mergeFields.${index}.startTime`}>
                        <FieldLabel className="text-xs">Start Time (seconds)</FieldLabel>
                        <FieldContent>
                          <Input type="number" step="0.1" />
                        </FieldContent>
                        <FieldError />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
