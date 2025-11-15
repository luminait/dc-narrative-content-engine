'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, MoreVertical, Pencil, Copy, Trash2, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Skeleton } from '@/ui/shadcn/skeleton';
import { Alert, AlertDescription } from '@/ui/shadcn/alert';
import type { Campaign, Character, Persona } from '@/src/lib/types/ui';
import { isAssetSystemAvailable } from '@/src/features/assets';
import { MergeField } from "@/src/lib/zod/campaign.schema";
import { Badge } from "@/ui/shadcn/badge";
import type { AssetData } from "@/src/lib/zod/assets.schema";
import { Button } from '@/ui/shadcn/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/ui/shadcn/dropdown-menu';
import { Input } from '@/ui/shadcn/input';
import { Textarea } from '@/ui/shadcn/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/shadcn/popover';
import { Label } from '@/ui/shadcn/label';
// Use the CharactersSection component which properly renders character images
// Use a form-agnostic CharacterPicker inside the Popover to avoid RHF context requirement
import CharacterPicker from '@/src/features/campaigns/components/CharacterPicker';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/ui/shadcn/dropzone';
import { useSupabaseUpload } from '@/src/lib/hooks/use-supabase-upload';
import { toast } from 'sonner';
import { buildMergeFieldUpdatePayload } from '@/src/lib/utils/mergefield.client-utils';

// Mapping of merge field types to their corresponding asset types and values
type MergeFieldAsset = { type: string } & AssetData;

interface MergeFieldsTabProps {
    campaign: Campaign;
    campaignMergeFields: MergeField[];
    campaignPersonas: Persona[];
    campaignCharacters: Character[];
    mergeFieldsLoading: boolean;
    mergeFieldsError: string | null;
    campaignMergeFieldValues: Record<string, MergeFieldAsset>;
}

// Edit mode state for individual merge field
interface EditingState {
    fieldId: string;
    name: string;
    description: string;
    value: string;
    characterId?: string;
}

export function MergeFieldsTab({
                                   campaignMergeFieldValues,
                                   campaign,
                                   campaignMergeFields,
                                   mergeFieldsLoading,
                                   mergeFieldsError,
                                   campaignPersonas,
                                   campaignCharacters,
                               }: MergeFieldsTabProps) {
    const [editingField, setEditingField] = useState<EditingState | null>(null);
    const [savingFieldId, setSavingFieldId] = useState<string | null>(null);
    const router = useRouter();

    // Handle edit mode
    const startEditing = (field: MergeField) => {
        // For character fields, the stored value is an asset_ref (UUID), not the character id.
        // Try to resolve the characterId by matching the current value against each character's primaryAssetRef.
        const resolvedCharacterId =
            field.type === 'character' && field.value
                ? (campaignCharacters.find((c) => c.primaryAssetRef && c.primaryAssetRef === field.value)?.id)
                : undefined;

        setEditingField({
            fieldId: field.id || '',
            name: field.name,
            description: field.description || '',
            value: field.value || '', // keep the current value (asset_ref for media types)
            characterId: resolvedCharacterId,
        });
    };

    const cancelEditing = () => {
        setEditingField(null);
    };

    const saveEdit = async (field: MergeField) => {
        if (!editingField || !field.id) return;

        setSavingFieldId(field.id);
        try {
            // Build a strictly serializable payload expected by the server action schema.
            const payload = buildMergeFieldUpdatePayload(field, editingField);

            const res = await fetch(`/api/mergefields/${campaign.id}/${field.id}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await res.json();

            if (res.ok && result.success) {
                toast.success('Merge field updated successfully');
                setEditingField(null);
                // Force a refresh so the Server Components re-fetch fresh data
                router.refresh();
            } else {
                const err = (result as any)?.error;
                const message =
                    typeof err === 'string'
                        ? err
                        : Array.isArray(err?.errors)
                            ? err.errors.join(', ')
                            : 'Failed to update merge field';
                toast.error(message);
            }
        } catch (error) {
            toast.error('An error occurred while updating the merge field');
            console.error(error);
        } finally {
            setSavingFieldId(null);
        }
    };

    const handleDuplicate = async (fieldId: string) => {
        try {
            const res = await fetch(`/api/mergefields/${campaign.id}/${fieldId}/duplicate`, {
                method: 'POST',
            });
            const result = await res.json();
            if (res.ok && result.success) {
                toast.success('Merge field duplicated successfully');
                router.refresh();
            } else {
                toast.error(result?.error || 'Failed to duplicate merge field');
            }
        } catch (error) {
            toast.error('An error occurred while duplicating the merge field');
            console.error(error);
        }
    };

    const handleDelete = async (fieldId: string) => {
        if (!confirm('Are you sure you want to delete this merge field?')) return;

        try {
            const res = await fetch(`/api/mergefields/${campaign.id}/${fieldId}/delete`, {
                method: 'POST',
            });
            const result = await res.json();
            if (res.ok && result.success) {
                toast.success('Merge field deleted successfully');
                router.refresh();
            } else {
                toast.error(result?.error || 'Failed to delete merge field');
            }
        } catch (error) {
            toast.error('An error occurred while deleting the merge field');
            console.error(error);
        }
    };

    // Character selection handler for Popover
    const handleCharacterSelect = useCallback((characterIds: string[]) => {
        setEditingField((prev) => {
            if (!prev) return null;
            const selectedId = characterIds[0] || '';
            const selectedChar = campaignCharacters.find((c) => c.id === selectedId);
            const assetRef = selectedChar?.primaryAssetRef || null;

            if (!assetRef) {
                toast.error('Selected character has no registered asset_ref. Please register an asset for this character.');
                return {
                    ...prev,
                    characterId: selectedId || undefined,
                };
            }

            return {
                ...prev,
                // Persist the asset_ref (UUID) for character media fields
                value: assetRef,
                characterId: selectedId,
            };
        });
    }, [campaignCharacters]);

    return (
        <>
            {/* Merge Fields Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Merge Fields</CardTitle>
                    <CardDescription>
                        Manage asset pools for each merge field in this campaign
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Asset System Status Warning */}
                    {( !mergeFieldsLoading && !isAssetSystemAvailable() ) && (
                        <Alert className="border-orange-200 bg-orange-50 justify-start">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-800">
                                <strong>Asset resolution system is not available.</strong> Asset reference IDs will be
                                displayed as shortened identifiers instead of resolved filenames or URLs. <br />This is
                                expected if the assets database table hasn't been set up yet or if the asset management
                                system is not configured.
                            </AlertDescription>
                        </Alert>
                    )}
                    {mergeFieldsLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>
                    ) : mergeFieldsError ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{mergeFieldsError}</AlertDescription>
                        </Alert>
                    ) : campaignMergeFields.length > 0 ? (
                        <div className={"space-y-8"}>
                            {campaignPersonas.length > 0 && (
                                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                    <h5 className="font-medium text-blue-800 mb-2">Available Campaign Personas:</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {campaignPersonas.map((persona) => (
                                            <Badge
                                                key={persona.id}
                                                variant="secondary"
                                                className="bg-blue-100 text-blue-800"
                                            >
                                                {persona.name} ({persona.isPrimaryPersona ? 'Primary' : 'Secondary'})
                                            </Badge>
                                        ))}
                                    </div>
                                    <p className="text-sm text-blue-700 mt-2">
                                        These personas are associated with this campaign and can be used in merge
                                        fields.
                                    </p>
                                </div>
                            )}

                            {campaignMergeFields.map((field, fieldIndex) => (
                                <MergeFieldItem
                                    key={field.id || fieldIndex}
                                    field={field}
                                    campaignId={campaign.id}
                                    campaignMergeFieldValues={campaignMergeFieldValues}
                                    campaignCharacters={campaignCharacters}
                                    isEditing={editingField?.fieldId === field.id}
                                    editingState={editingField}
                                    onEdit={() => startEditing(field)}
                                    onCancelEdit={cancelEditing}
                                    onSaveEdit={() => saveEdit(field)}
                                    onDuplicate={() => handleDuplicate(field.id || '')}
                                    onDelete={() => handleDelete(field.id || '')}
                                    onUpdateEditState={setEditingField}
                                    onCharacterSelect={handleCharacterSelect}
                                    isSaving={savingFieldId === field.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No merge fields found for this campaign.</p>
                    )}
                </CardContent>
            </Card>
        </>
    );
}

// Individual Merge Field Item Component
interface MergeFieldItemProps {
    field: MergeField;
    campaignId: string;
    campaignMergeFieldValues: Record<string, MergeFieldAsset>;
    campaignCharacters: Character[];
    isEditing: boolean;
    editingState: EditingState | null;
    onEdit: () => void;
    onCancelEdit: () => void;
    onSaveEdit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onUpdateEditState: (state: EditingState) => void;
    onCharacterSelect: (characterIds: string[]) => void;
    isSaving: boolean;
}

function MergeFieldItem({
                            field,
                            campaignId,
                            campaignMergeFieldValues,
                            campaignCharacters,
                            isEditing,
                            editingState,
                            onEdit,
                            onCancelEdit,
                            onSaveEdit,
                            onDuplicate,
                            onDelete,
                            onUpdateEditState,
                            onCharacterSelect,
                            isSaving,
                        }: MergeFieldItemProps) {
    return (
        <div className="space-y-4 pb-6 border-b border-gray-100 last:border-b-0">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {isEditing && editingState ? (
                        <>
                            {/* Edit Mode */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor={`name-${field.id}`}>Name</Label>
                                    <Input
                                        id={`name-${field.id}`}
                                        value={editingState.name}
                                        onChange={(e) =>
                                            onUpdateEditState({ ...editingState, name: e.target.value })
                                        }
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor={`description-${field.id}`}>Description</Label>
                                    <Textarea
                                        id={`description-${field.id}`}
                                        value={editingState.description}
                                        onChange={(e) =>
                                            onUpdateEditState({ ...editingState, description: e.target.value })
                                        }
                                        className="mt-1"
                                        rows={3}
                                    />
                                </div>

                                {/* Value Input Based on Type */}
                                <div>
                                    <Label>Value</Label>
                                    {field.mediaValueType === 'text' && (
                                        <Input
                                            value={editingState.value}
                                            onChange={(e) =>
                                                onUpdateEditState({ ...editingState, value: e.target.value })
                                            }
                                            className="mt-1"
                                        />
                                    )}

                                    {field.type === 'character' && (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="mt-1 w-full justify-start">
                                                    {editingState.characterId
                                                        ? campaignCharacters.find((c) => c.id === editingState.characterId)?.name ||
                                                          'Select Character'
                                                        : 'Select Character'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                              className="w-[600px] max-w-[80vw] max-h-[80vh] overflow-auto p-4"
                                              align="start"
                                            >
                                              <CharacterPicker
                                                characters={campaignCharacters.map((c) => ({
                                                  id: c.id,
                                                  name: c.name,
                                                  characterTypes: c.characterTypes || null,
                                                  imageUrl: c.imageUrl ?? c.defaultImage ?? null,
                                                }))}
                                                selectedIds={editingState.characterId ? [editingState.characterId] : []}
                                                onChange={(ids) => {
                                                  // This will set editingState.value to the character's asset_ref and keep characterId for display
                                                  onCharacterSelect(ids);
                                                }}
                                                allowMultiple={false}
                                                showSearch
                                                showSelectedBadges={false}
                                              />
                                            </PopoverContent>
                                          </Popover>
                                    )}

                                    {(field.mediaValueType === 'video' ||
                                        field.mediaValueType === 'audio_music' ||
                                        field.mediaValueType === 'audio_voice' ||
                                        field.mediaValueType === 'image' ||
                                        field.mediaValueType === 'image_or_video' ||
                                        field.mediaValueType === 'gen_ai_voice') && (
                                        <div className="space-y-2 mt-2">
                                            <Label htmlFor={`asset-ref-${field.id}`}>Asset Ref (UUID)</Label>
                                            <Input
                                                id={`asset-ref-${field.id}`}
                                                placeholder="Paste the asset_ref (UUID) for this media"
                                                value={editingState.value}
                                                onChange={(e) => onUpdateEditState({ ...editingState, value: e.target.value })}
                                            />
                                            <MediaUploadField
                                                campaignId={campaignId}
                                                fieldType={field.mediaValueType}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Button
                                        onClick={onSaveEdit}
                                        size="sm"
                                        disabled={isSaving}
                                    >
                                        <Check className="h-4 w-4 mr-1" />
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </Button>
                                    <Button onClick={onCancelEdit} size="sm" variant="outline">
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* View Mode */}
                            <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium text-lg">{field.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                    {field.mediaValueType}
                                </Badge>
                                {field.type && (
                                    <Badge variant="secondary" className="text-xs">
                                        {field.type}
                                    </Badge>
                                )}
                            </div>
                            <p className={"text-sm text-gray-600 mb-3"}>{field.description}</p>
                            {/* Default Value Display */}
                            {field.value && (
                                <div className={"bg-gray-50 p-3 rounded-lg mb-4"}>
                                    <div className={"grid grid-cols-1 gap-2 md:flex md:gap-4 md:items-start"}>
                                        <span className={"text-sm font-medium text-gray-700"}>Value:</span>
                                        <div
                                            className={
                                                "text-sm text-blue-600 hover:text-blue-800 cursor-pointer break-all"
                                            }
                                            title={"Click to open asset in new tab"}
                                        >
                                            {field.mediaValueType === "text" && field.value}
                                            {field.mediaValueType === 'image' && (
                                                <img
                                                    src={campaignMergeFieldValues[field.value]?.asset_url}
                                                    alt={
                                                        campaignMergeFieldValues[field.value]?.name || field.value
                                                    }
                                                />
                                            )}
                                            {field.mediaValueType === 'video' && (
                                                <video
                                                    controls
                                                    width="480"
                                                    className="rounded-md border border-gray-200"
                                                >
                                                    <source
                                                        src={campaignMergeFieldValues[field.value]?.asset_url}
                                                        type="video/mp4"
                                                    />
                                                    Your browser does not support the video tag.
                                                </video>
                                            )}

                                            {field.mediaValueType &&
                                                ['audio_music', 'audio_voice', 'gen_ai_voice'].includes(
                                                    field.mediaValueType
                                                ) && (
                                                    <audio controls className="w-full mt-2">
                                                        <source
                                                            src={campaignMergeFieldValues[field.value]?.asset_url}
                                                            type="audio/mpeg"
                                                        />
                                                        Your browser does not support the audio element.
                                                    </audio>
                                                )}

                                            {field.mediaValueType === 'image_or_video' &&
                                                (campaignMergeFieldValues[field.value]?.asset_url?.match(
                                                    /\.(mp4|mov|webm)$/i
                                                ) ? (
                                                    <video
                                                        controls
                                                        width="480"
                                                        className="rounded-md border border-gray-200"
                                                    >
                                                        <source
                                                            src={campaignMergeFieldValues[field.value]?.asset_url}
                                                            type="video/mp4"
                                                        />
                                                        Your browser does not support the video tag.
                                                    </video>
                                                ) : (
                                                    <img
                                                        src={campaignMergeFieldValues[field.value]?.asset_url}
                                                        alt={
                                                            campaignMergeFieldValues[field.value]?.name ||
                                                            field.value
                                                        }
                                                        className="rounded-md w-full object-contain"
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Dropdown Menu for Actions */}
                {!isEditing && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onDuplicate}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onDelete} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
}

// Media Upload Component using Dropzone
interface MediaUploadFieldProps {
    campaignId: string;
    fieldType: string;
}

function MediaUploadField({ campaignId, fieldType }: MediaUploadFieldProps) {
    // Determine allowed MIME types based on the field type
    const getAllowedMimeTypes = () => {
        if (fieldType === 'video') return ['video/*'];
        if (fieldType === 'audio_music' || fieldType === 'audio_voice') return ['audio/*'];
        return [];
    };

    const uploadProps = useSupabaseUpload({
        bucketName: 'campaign-assets',
        path: `campaigns/${campaignId}/merge-fields`,
        allowedMimeTypes: getAllowedMimeTypes(),
        maxFiles: 1,
        maxFileSize: 100 * 1000 * 1000, // 100MB
    });

    // Watch for successful uploads
    React.useEffect(() => {
        if (uploadProps.isSuccess && uploadProps.files.length > 0) {
            const uploadedFile = uploadProps.files[0];
            const assetPath = `campaigns/${campaignId}/merge-fields/${uploadedFile.name}`;
            // We only upload to storage here. The registration to obtain an asset_ref must be handled
            // by an asset ingestion flow. Inform the user accordingly.
            toast.success('File uploaded to storage. Now register it to obtain an asset_ref, then paste it above.');
            console.info('[Upload complete] Stored at:', assetPath);
        }
    }, [uploadProps.isSuccess, uploadProps.files, campaignId]);

    return (
        <div className="mt-2">
            <Dropzone {...uploadProps}>
                <DropzoneEmptyState />
                <DropzoneContent />
            </Dropzone>
        </div>
    );
}
