'use client';

import React, { useEffect, useState } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/shadcn/popover';
import CharacterPicker from '@/src/features/campaigns/components/CharacterPicker';
import type { CharacterWithImage } from '@/src/lib/types/ui';
import type { CampaignFormData, MediaValueType, MergeField } from '../../../../lib/zod/campaign.schema';
import { MERGE_FIELD_VALUE_TYPES, mergeFieldSchema } from '../../../../lib/zod/campaign.schema';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/ui/shadcn/dropzone';
import { useSupabaseUpload } from '@/src/lib/hooks/use-supabase-upload';
import { toast } from 'sonner';

interface MergeFieldsSectionProps {
  characters?: CharacterWithImage[];
}

export default function MergeFieldsSection({ characters = [] }: MergeFieldsSectionProps) {
  const { control } = useFormContext<CampaignFormData>();
  const { fields, append, remove, insert, replace } = useFieldArray({
    control,
    name: 'mergeFields',
  });
  const [isOpen, setIsOpen] = useState(true);
  const [csvError, setCsvError] = useState<string | null>(null);

  const valueTypes = MERGE_FIELD_VALUE_TYPES as unknown as MediaValueType[];
  const semanticTypes = ['text', 'character', 'environment', 'music', 'voiceover', 'sfx', 'luma_matte'];

  const isHttpUrl = (val?: string | null) => !!val && /^(https?:)?\/\//i.test(val);

  // Helper: small upload component (mirrors Details tab) for the NEW campaign flow
  function MediaUploadFieldForNew({ fieldType }: { fieldType: string }) {
    // Determine allowed MIME types based on the field type
    const getAllowedMimeTypes = () => {
      if (fieldType === 'video') return ['video/*'];
      if (fieldType === 'audio_music' || fieldType === 'audio_voice') return ['audio/*'];
      return [];
    };

    const uploadProps = useSupabaseUpload({
      bucketName: 'campaign-assets',
      path: `campaigns/new/merge-fields`,
      allowedMimeTypes: getAllowedMimeTypes(),
      maxFiles: 1,
      maxFileSize: 100 * 1000 * 1000, // 100MB
    });

    // Inform the user when upload completes
    // Note: Actual asset_ref registration still required post-upload
    useEffect(() => {
      if (uploadProps.isSuccess && uploadProps.files.length > 0) {
        const uploadedFile = uploadProps.files[0];
        const assetPath = `campaigns/new/merge-fields/${uploadedFile.name}`;
        toast.success('File uploaded to storage. Register it to obtain an asset_ref, then paste it above.');
        // Reset success to avoid repeated toasts on re-render if hook exposes a reset
        // @ts-expect-error Optional reset method in hook
        if (typeof uploadProps.reset === 'function') uploadProps.reset();
        console.info('[Upload complete] Stored at:', assetPath);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadProps.isSuccess, uploadProps.files]);

    return (
      <div className="mt-2">
        <Dropzone {...uploadProps}>
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
      </div>
    );
  }


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

                      <Field title={`mergeFields.${index}.type`}>
                        <FieldLabel className="text-xs">Semantic Type</FieldLabel>
                        <FieldContent>
                          <Controller
                            name={`mergeFields.${index}.type`}
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {semanticTypes.map((type) => (
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
                            render={({ field }) => {
                              const currentType = control._formValues.mergeFields[index]?.type;
                              const currentMediaValueType = control._formValues.mergeFields[index]?.mediaValueType;

                              // Character Picker
                              if (currentType === 'character') {
                                // Resolve character ID from the asset ref value if possible
                                const resolvedCharacterId = characters.find(
                                  (c) => c.primaryAssetRef && c.primaryAssetRef === field.value
                                )?.id;

                                return (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" className="w-full justify-start font-normal">
                                        {resolvedCharacterId
                                          ? characters.find((c) => c.id === resolvedCharacterId)?.name || 'Select Character'
                                          : 'Select Character'}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[600px] max-w-[80vw] max-h-[80vh] overflow-auto p-4" align="start">
                                      <CharacterPicker
                                        characters={characters.map((c) => ({
                                          id: c.id,
                                          name: c.name,
                                          characterTypes: c.characterTypes || null,
                                          imageUrl: c.imageUrl ?? c.defaultImage ?? null,
                                        }))}
                                        selectedIds={resolvedCharacterId ? [resolvedCharacterId] : []}
                                        onChange={(ids) => {
                                          const selectedId = ids[0];
                                          const selectedChar = characters.find((c) => c.id === selectedId);
                                          const assetRef = selectedChar?.primaryAssetRef || null;

                                          if (selectedId && !assetRef) {
                                            toast.error('Selected character has no registered asset_ref. Please register an asset for this character.');
                                            return; // keep current value unchanged
                                          }

                                          field.onChange(assetRef || '');
                                        }}
                                        allowMultiple={false}
                                        showSearch
                                        showSelectedBadges={false}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                );
                              }

                              // Media Asset Ref Input
                              if (
                                currentMediaValueType &&
                                [
                                  'video',
                                  'audio_music',
                                  'audio_voice',
                                  'image',
                                  'image_or_video',
                                  'gen_ai_voice',
                                ].includes(currentMediaValueType)
                              ) {
                                return (
                                  <div className="space-y-2">
                                    <FieldLabel className="text-xs">Asset Ref (UUID)</FieldLabel>
                                    <Input
                                      {...field}
                                      value={field.value || ''}
                                      placeholder="Paste asset_ref (UUID) or direct media URL for preview"
                                    />

                                    {/* Media Upload (optional) */}
                                    <MediaUploadFieldForNew fieldType={currentMediaValueType} />

                                    {/* Audio preview if a direct URL is provided */}
                                    {['audio_music', 'audio_voice', 'gen_ai_voice'].includes(currentMediaValueType) && (
                                      isHttpUrl(field.value) ? (
                                        <audio controls className="w-full mt-2">
                                          <source src={field.value as string} />
                                          Your browser does not support the audio element.
                                        </audio>
                                      ) : (
                                        (field.value ? (
                                          <p className="text-xs text-gray-500">Audio preview is available only when a direct URL is provided. Asset refs will preview later in the details tab.</p>
                                        ) : null)
                                      )
                                    )}
                                  </div>
                                );
                              }

                              // Default Text Input
                              return (
                                <Input
                                  {...field}
                                  value={field.value || ''}
                                  placeholder="URL or text content"
                                />
                              );
                            }}
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
