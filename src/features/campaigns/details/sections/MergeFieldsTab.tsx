'use client';

import React, { useState, useCallback } from 'react';
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
import CharactersSection from '@/src/features/campaigns/new/sections/CharactersSelection';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/ui/shadcn/dropzone';
import { useSupabaseUpload } from '@/src/lib/hooks/use-supabase-upload';
import { updateMergeFieldAction, duplicateMergeFieldAction, deleteMergeFieldAction } from '@/src/server/actions/mergefield.actions';
import { toast } from 'sonner';

// Mapping of merge field types to their corresponding asset types and values
type MergeFieldEntry = [string, MergeFieldAsset];
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

    // Handle edit mode
    const startEditing = (field: MergeField) => {
        setEditingField({
            fieldId: field.id || '',
            name: field.name,
            description: field.description || '',
            value: field.value || '',
            characterId: field.type === 'character' ? field.value || undefined : undefined,
        });
    };

    const cancelEditing = () => {
        setEditingField(null);
    };

    const saveEdit = async (field: MergeField) => {
        if (!editingField || !field.id) return;

        // Helper to coerce Decimal-like or object-y numerics to plain numbers
        const toNumber = (v: unknown): number | null => {
            if (v === null || v === undefined) return null;
            if (typeof v === 'number') return v;
            if (typeof v === 'string') {
                const n = Number(v);
                return Number.isFinite(n) ? n : null;
            }
            // Prisma Decimal or similar: try toNumber() then valueOf()/Number()
            if (typeof (v as any)?.toNumber === 'function') {
                try { return (v as any).toNumber(); } catch {/* noop */}
            }
            const n = Number((v as any)?.valueOf?.() ?? v);
            return Number.isFinite(n) ? n : null;
        };

        setSavingFieldId(field.id);
        try {
            // Build a strictly serializable payload expected by the server action schema.
            // Do NOT spread `field` (it may contain Decimal instances or functions).
            const payload = {
                name: editingField.name ?? '',
                description: editingField.description ?? '',
                mediaValueType: field.mediaValueType,   // enum/string
                value: editingField.value ?? '',
                type: field.type ?? null,
                startTime: toNumber((field as any).startTime),
                endTime: toNumber((field as any).endTime),
                shouldRefreshOnRegenerate:
                    typeof (field as any).shouldRefreshOnRegenerate === 'boolean'
                        ? (field as any).shouldRefreshOnRegenerate
                        : false,
            } as const;

            const result = await updateMergeFieldAction(field.id, campaign.id, payload as any);

            if (result.success) {
                toast.success('Merge field updated successfully');
                setEditingField(null);
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
            const result = await duplicateMergeFieldAction(fieldId, campaign.id);
            if (result.success) {
                toast.success('Merge field duplicated successfully');
            } else {
                toast.error(result.error || 'Failed to duplicate merge field');
            }
        } catch (error) {
            toast.error('An error occurred while duplicating the merge field');
            console.error(error);
        }
    };

    const handleDelete = async (fieldId: string) => {
        if (!confirm('Are you sure you want to delete this merge field?')) return;

        try {
            const result = await deleteMergeFieldAction(fieldId, campaign.id);
            if (result.success) {
                toast.success('Merge field deleted successfully');
            } else {
                toast.error(result.error || 'Failed to delete merge field');
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
            const characterId = characterIds[0] || '';
            return {
                ...prev,
                value: characterId,
                characterId,
            };
        });
    }, []);

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
                    {(!mergeFieldsLoading && isAssetSystemAvailable() === false) && (
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
                                                        ? campaignCharacters.find((c) => c.id === editingState.characterId)
                                                        ?.name || 'Select Character'
                                                        : 'Select Character'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[600px] p-4" align="start">
                                                <CharactersSection
                                                    characters={campaignCharacters.map((c) => ({
                                                        id: c.id,
                                                        name: c.name,
                                                        characterTypes: c.characterTypes || null,
                                                        imageUrl: c.imageUrl || null,
                                                    }))}
                                                    initialSelection={
                                                        editingState.characterId ? [editingState.characterId] : []
                                                    }
                                                    onSelectionChange={onCharacterSelect}
                                                    selectionMode="single"
                                                    collapsible={false}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}

                                    {(field.mediaValueType === 'video' ||
                                        field.mediaValueType === 'audio_music' ||
                                        field.mediaValueType === 'audio_voice') && (
                                        <MediaUploadField
                                            campaignId={campaignId}
                                            fieldType={field.mediaValueType}
                                            onUploadSuccess={(assetUrl) => {
                                                onUpdateEditState({ ...editingState, value: assetUrl });
                                            }}
                                        />
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
    onUploadSuccess: (assetUrl: string) => void;
}

function MediaUploadField({ campaignId, fieldType, onUploadSuccess }: MediaUploadFieldProps) {
    // Determine allowed MIME types based on field type
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
            // Get the uploaded file URL from Supabase
            const uploadedFile = uploadProps.files[0];
            const assetPath = `campaigns/${campaignId}/merge-fields/${uploadedFile.name}`;
            onUploadSuccess(assetPath);
            toast.success('File uploaded successfully');
        }
    }, [uploadProps.isSuccess, uploadProps.files, campaignId, onUploadSuccess]);

    return (
        <div className="mt-2">
            <Dropzone {...uploadProps}>
                <DropzoneEmptyState />
                <DropzoneContent />
            </Dropzone>
        </div>
    );
}
