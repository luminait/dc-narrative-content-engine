'use client';

import { useState } from 'react';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import Papa from 'papaparse';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/shadcn/collapsible';
import { Button } from '@/ui/shadcn/button';
import { Input } from '@/ui/shadcn/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/shadcn/select';
import { Alert, AlertDescription } from '@/ui/shadcn/alert';
import { Field, FieldContent, FieldLabel, FieldError } from '@/ui/shadcn/field';
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Upload,
  AlertCircle,
  Copy,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/shadcn/dropdown-menu';
import type { CampaignFormData, MediaValueType, MergeField } from '../../../../lib/zod/campaign.schema';
import { MERGE_FIELD_VALUE_TYPES, mergeFieldSchema } from '../../../../lib/zod/campaign.schema';

export default function MergeFieldsSection() {
  const { control } = useFormContext<CampaignFormData>();
  const { fields, append, remove, insert, replace } = useFieldArray({
    control,
    name: 'mergeFields',
  });
  const [isOpen, setIsOpen] = useState(true);
  const [csvError, setCsvError] = useState<string | null>(null);

  const valueTypes = MERGE_FIELD_VALUE_TYPES as unknown as MediaValueType[];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvError(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedFields = results.data.map((row): MergeField => {
            if (!row['Merge Field'] || !row['Value Type']) {
              throw new Error('Each CSV row must have "Merge Field" and "Value Type" columns.');
            }

            const valueType = row['Value Type'].toLowerCase();
            let mediaValueType: MediaValueType | undefined;

            if (valueType === 'audio') {
              if (row['Merge Field']?.toUpperCase().startsWith('VO_')) {
                mediaValueType = 'audio_voice';
              } else if (row['Merge Field']?.toUpperCase() === 'MUSIC') {
                mediaValueType = 'audio_music';
              }
            } else if (MERGE_FIELD_VALUE_TYPES.includes(valueType as any)) {
              mediaValueType = valueType as MediaValueType;
            }

            if (!mediaValueType) {
              throw new Error(
                `Could not determine mediaValueType for merge field "${row['Merge Field']}" with value type "${row['Value Type']}".`,
              );
            }

            const field: MergeField = {
              name: row['Merge Field'],
              description: row['Description'] || null,
              mediaValueType,
              value: row['Value'] || null,
              startTime: row['Start Time'] || null,
              endTime: row['End Time'] || null,
              length: row['Length'] || null,
            };

            const name = field.name.toUpperCase();
            if (name.startsWith('HEADER_') || name.startsWith('FINAL_CTA') || name.startsWith('FOOTER_')) {
              field.type = 'text';
            } else if (name.startsWith('CHAR_')) {
              field.type = 'character';
            } else if (name.startsWith('ENV_')) {
              field.type = 'environment';
            } else if (name.startsWith('MUSIC')) {
              field.type = 'music';
            } else if (name.startsWith('VO_')) {
              field.type = 'voiceover';
            }

            return mergeFieldSchema.parse(field);
          });

          replace(parsedFields);
        } catch (error) {
          const message =
            error instanceof z.ZodError
              ? `CSV data validation failed: ${error.issues.map((issue) => issue.message).join(', ')}`
              : error instanceof Error
                ? `Error processing CSV: ${error.message}`
                : 'An unknown error occurred while processing the CSV.';
          setCsvError(message);
        }
      },
      error: (error: any) => {
        setCsvError(`CSV parsing error: ${error.message}`);
      },
    });

    // Reset file input
    event.target.value = '';
  };

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
            <CardDescription>
              Define dynamic content fields for your video posts. You can add fields manually or
              bulk-import from a CSV file.
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-4">
            {csvError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{csvError}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <FieldLabel htmlFor="csv-upload" className="text-xs">
                  Upload CSV for Bulk Import
                </FieldLabel>
                <div className="relative mt-1">
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="pl-10"
                  />
                  <Upload className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    append({
                      name: '',
                      description: '',
                      mediaValueType: valueTypes[0] || 'text',
                    })
                  }
                  className="flex w-full items-center space-x-2 sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Field</span>
                </Button>
              </div>
            </div>

            {fields.length > 0 && (
              <div className="space-y-3">
                <FieldLabel>Merge Fields ({fields.length})</FieldLabel>
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <FieldLabel className="text-sm font-medium">Field #{index + 1}</FieldLabel>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              const currentField = control._formValues.mergeFields[index];
                              insert(index + 1, { ...currentField, name: `${currentField.name}_copy` });
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => remove(index)}
                            className="text-red-600 focus:bg-red-50 focus:text-red-700"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <Field title={`mergeFields.${index}.name`}>
                        <FieldLabel className="text-xs">Merge Field Name</FieldLabel>
                        <FieldContent>
                          <Controller
                            name={`mergeFields.${index}.name`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                value={field.value || ''}
                                placeholder="e.g., CHARACTER_NAME"
                              />
                            )}
                          />
                        </FieldContent>
                        <FieldError />
                      </Field>

                      <Field title={`mergeFields.${index}.description`}>
                        <FieldLabel className="text-xs">Description</FieldLabel>
                        <FieldContent>
                          <Controller
                            name={`mergeFields.${index}.description`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                value={field.value || ''}
                                placeholder="Field description"
                              />
                            )}
                          />
                        </FieldContent>
                        <FieldError />
                      </Field>

                      <Field title={`mergeFields.${index}.mediaValueType`}>
                        <FieldLabel className="text-xs">Value Type</FieldLabel>
                        <FieldContent>
                          <Controller
                            name={`mergeFields.${index}.mediaValueType`}
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {valueTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </FieldContent>
                        <FieldError />
                      </Field>

                      <Field title={`mergeFields.${index}.value`}>
                        <FieldLabel className="text-xs">Value</FieldLabel>
                        <FieldContent>
                          <Controller
                            name={`mergeFields.${index}.value`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                value={field.value || ''}
                                placeholder="URL or text content"
                              />
                            )}
                          />
                        </FieldContent>
                        <FieldError />
                      </Field>

                      <Field title={`mergeFields.${index}.startTime`}>
                        <FieldLabel className="text-xs">Start Time (sec)</FieldLabel>
                        <FieldContent>
                          <Controller
                            name={`mergeFields.${index}.startTime`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                value={field.value || ''}
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                              />
                            )}
                          />
                        </FieldContent>
                        <FieldError />
                      </Field>

                      <Field title={`mergeFields.${index}.endTime`}>
                        <FieldLabel className="text-xs">End Time (sec)</FieldLabel>
                        <FieldContent>
                          <Controller
                            name={`mergeFields.${index}.endTime`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                value={field.value || ''}
                                type="number"
                                step="0.1"
                                placeholder="5.0"
                              />
                            )}
                          />
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
