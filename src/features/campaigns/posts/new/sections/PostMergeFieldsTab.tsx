 'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from "@/ui/shadcn/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/shadcn/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/shadcn/select";
import { Alert, AlertDescription, AlertTitle } from "@/ui/shadcn/alert";
import { AlertCircle, CheckCircle2, Loader2, MoreVertical, Pencil, Copy, Trash2, Check, X } from "lucide-react";
import type { CampaignData, MergeField } from "@/src/lib/zod/campaign.schema";
import type { Character } from '@/src/lib/types/ui';
import type { AssetData } from '@/src/lib/zod/assets.schema';
import { isAssetSystemAvailable } from '@/src/features/assets';
import { Button } from '@/ui/shadcn/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/ui/shadcn/dropdown-menu';
import { Input } from '@/ui/shadcn/input';
import { Textarea } from '@/ui/shadcn/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/shadcn/popover';
import { Label } from '@/ui/shadcn/label';
import CharacterPicker from '@/src/features/campaigns/components/CharacterPicker';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/ui/shadcn/dropzone';
import { useSupabaseUpload } from '@/src/lib/hooks/use-supabase-upload';
import { toast } from 'sonner';
import { buildMergeFieldUpdatePayload } from '@/src/lib/utils/mergefield.client-utils';
import { getShotstackTemplatesAction, getShotstackTemplateAction } from "@/src/server/actions/shotstack.actions";
import type { ShotstackTemplate } from "@/src/server/shotstack/shotstack.service";
import { isAudioUrl, guessAudioMime } from '@/src/lib/utils/mediaDetection';

interface PostMergeFieldsTabProps {
    campaign: CampaignData;
    // Prefer passing these from the server for parity and performance
    campaignCharacters?: Character[];
    campaignMergeFieldValues?: Record<string, { type: string; objectName?: string | null; contentType?: string | null; isAudio?: boolean } & AssetData>;
}

interface ValidationResult {
    type: 'error' | 'warning' | 'success';
    message: string;
}

// Audio helpers centralized in mediaDetection.ts

// Media Upload Component using Dropzone (hoisted to module scope so nested components can use it)
interface MediaUploadFieldProps {
    campaignId: string;
    fieldType: string;
}

function MediaUploadField({ campaignId, fieldType }: MediaUploadFieldProps) {
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

    React.useEffect(() => {
        if (uploadProps.isSuccess && uploadProps.files.length > 0) {
            const uploadedFile = uploadProps.files[0];
            const assetPath = `campaigns/${campaignId}/merge-fields/${uploadedFile.name}`;
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

// Local editing state (parity with MergeFieldsTab)
interface EditingState {
    fieldId: string;
    name: string;
    description: string;
    value: string;
    characterId?: string;
}

export default function PostMergeFieldsTab({ campaign, campaignCharacters = [], campaignMergeFieldValues = {} }: PostMergeFieldsTabProps) {
    const [templates, setTemplates] = useState<ShotstackTemplate[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [editingField, setEditingField] = useState<EditingState | null>(null);
    const [savingFieldId, setSavingFieldId] = useState<string | null>(null);
    const router = useRouter();

    // For now, we'll display the campaign's merge fields
    // Later, this will allow customization of merge field values for this specific post
    const campaignMergeFields = campaign.mergeFields || [];
    const isVideoCampaign = campaign.postType === 'video';

    // (Diagnostics removed) If needed again, we can re-enable a dev-only window.__dumpMergeFields helper.

    useEffect(() => {
        if (isVideoCampaign) {
            const fetchTemplates = async () => {
                setIsLoadingTemplates(true);
                const result = await getShotstackTemplatesAction();
                if (result.success && result.templates) {
                    setTemplates(result.templates);
                }
                setIsLoadingTemplates(false);
            };
            fetchTemplates();
        }
    }, [isVideoCampaign]);

    const handleTemplateChange = (templateId: string) => {
        setSelectedTemplateId(templateId);
        validateTemplate(templateId);
    };

    const validateTemplate = async (templateId: string) => {
        setIsValidating(true);
        setValidationResult(null);

        const result = await getShotstackTemplateAction(templateId);

        if (!result.success || !result.template || !result.template.template) {
            setValidationResult({
                type: 'error',
                message: 'Failed to fetch template details for validation.'
            });
            setIsValidating(false);
            return;
        }

        const rawTemplate = result.template.template;
        // Extract merge fields from the raw JSON string
        // Look for patterns like {{ FIELD_NAME }}
        const templateString = JSON.stringify(rawTemplate);
        const mergeFieldRegex = /{{ ?([A-Za-z0-9_]+) ?}}/g;
        const matches = [...templateString.matchAll(mergeFieldRegex)];
        const templateFieldNames = new Set(matches.map(m => m[1]));

        const campaignFieldNames = new Set(campaignMergeFields.map(f => f.name));

        const missingInCampaign = Array.from(templateFieldNames).filter(name => !campaignFieldNames.has(name));
        const unusedInCampaign = campaignMergeFields.filter(f => !templateFieldNames.has(f.name));

        if (missingInCampaign.length > 0) {
            setValidationResult({
                type: 'error',
                message: `Template requires fields not defined in campaign: ${missingInCampaign.join(', ')}`
            });
        } else if (unusedInCampaign.length > 0) {
            setValidationResult({
                type: 'warning',
                message: `Some campaign fields will not be used in this template: ${unusedInCampaign.map(f => f.name).join(', ')}`
            });
        } else {
            setValidationResult({
                type: 'success',
                message: 'All template fields match campaign merge fields.'
            });
        }
        setIsValidating(false);
    };

    // Edit mode handlers (parity with MergeFieldsTab)
    const startEditing = (field: MergeField) => {
        const resolvedCharacterId =
            field.type === 'character' && field.value
                ? (campaignCharacters.find((c) => c.primaryAssetRef && c.primaryAssetRef === field.value)?.id)
                : undefined;

        setEditingField({
            fieldId: field.id || '',
            name: field.name,
            description: field.description || '',
            value: (field.value as any) || '',
            characterId: resolvedCharacterId,
        });
    };

    const cancelEditing = () => setEditingField(null);

    const saveEdit = async (field: MergeField) => {
        if (!editingField || !field.id) return;
        setSavingFieldId(field.id);
        try {
            const payload = buildMergeFieldUpdatePayload(field as any, editingField);
            const res = await fetch(`/api/mergefields/${campaign.id}/${field.id}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await res.json();
            if (res.ok && result.success) {
                toast.success('Merge field updated successfully');
                setEditingField(null);
                router.refresh();
            } else {
                const err = (result as any)?.error;
                const message = typeof err === 'string'
                    ? err
                    : Array.isArray(err?.errors)
                        ? err.errors.join(', ')
                        : 'Failed to update merge field';
                toast.error(message);
            }
        } catch (e) {
            console.error(e);
            toast.error('An error occurred while updating the merge field');
        } finally {
            setSavingFieldId(null);
        }
    };

    const handleDuplicate = async (fieldId: string) => {
        try {
            const res = await fetch(`/api/mergefields/${campaign.id}/${fieldId}/duplicate`, { method: 'POST' });
            const result = await res.json();
            if (res.ok && result.success) {
                toast.success('Merge field duplicated successfully');
                router.refresh();
            } else {
                toast.error(result?.error || 'Failed to duplicate merge field');
            }
        } catch (e) {
            console.error(e);
            toast.error('An error occurred while duplicating the merge field');
        }
    };

    const handleDelete = async (fieldId: string) => {
        if (!confirm('Are you sure you want to delete this merge field?')) return;
        try {
            const res = await fetch(`/api/mergefields/${campaign.id}/${fieldId}/delete`, { method: 'POST' });
            const result = await res.json();
            if (res.ok && result.success) {
                toast.success('Merge field deleted successfully');
                router.refresh();
            } else {
                toast.error(result?.error || 'Failed to delete merge field');
            }
        } catch (e) {
            console.error(e);
            toast.error('An error occurred while deleting the merge field');
        }
    };

    const handleCharacterSelect = useCallback((characterIds: string[]) => {
        setEditingField((prev) => {
            if (!prev) return null;
            const selectedId = characterIds[0] || '';
            const selectedChar = campaignCharacters.find((c) => c.id === selectedId);
            const assetRef = selectedChar?.primaryAssetRef || null;
            if (!assetRef) {
                toast.error('Selected character has no registered asset_ref. Please register an asset for this character.');
                return { ...prev, characterId: selectedId || undefined };
            }
            return { ...prev, value: assetRef, characterId: selectedId };
        });
    }, [campaignCharacters]);

    return (
        <div className="space-y-6">
            {isVideoCampaign && (
                <Card>
                    <CardHeader>
                        <CardTitle>Select Video Template</CardTitle>
                        <CardDescription>
                            Choose a Shotstack template for your video post.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoadingTemplates ? (
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Loading templates...</span>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {templates.map((template) => (
                                            <SelectItem key={template.id} value={template.id}>
                                                {template.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {isValidating && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Validating template...</span>
                                    </div>
                                )}

                                {!isValidating && validationResult && (
                                    <Alert variant={validationResult.type === 'error' ? 'destructive' : 'default'} className={validationResult.type === 'success' ? 'border-green-500 text-green-700 bg-green-50' : validationResult.type === 'warning' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' : ''}>
                                        {validationResult.type === 'error' && <AlertCircle className="h-4 w-4" />}
                                        {validationResult.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                                        {validationResult.type === 'warning' && <AlertCircle className="h-4 w-4" />}
                                        <AlertTitle className="ml-2">
                                            {validationResult.type === 'error' ? 'Error' : validationResult.type === 'warning' ? 'Warning' : 'Success'}
                                        </AlertTitle>
                                        <AlertDescription className="ml-2">
                                            {validationResult.message}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Post Asset Customization</CardTitle>
                    <CardDescription>
                        Customize merge field values for this specific post. Default values are inherited from the campaign.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {(!isAssetSystemAvailable()) && (
                        <Alert className="border-orange-200 bg-orange-50 justify-start">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-800">
                                <strong>Asset resolution system is not available.</strong> Asset reference IDs will be
                                displayed as identifiers instead of resolved filenames or URLs.
                            </AlertDescription>
                        </Alert>
                    )}

                    {campaignMergeFields.length > 0 ? (
                        <div className="space-y-8">
                            {campaignMergeFields.map((field, fieldIndex) => (
                                <MergeFieldItem
                                    key={field.id || fieldIndex}
                                    field={field as any}
                                    campaignId={campaign.id}
                                    campaignMergeFieldValues={campaignMergeFieldValues}
                                    campaignCharacters={campaignCharacters}
                                    isEditing={editingField?.fieldId === field.id}
                                    editingState={editingField}
                                    onEdit={() => startEditing(field as any)}
                                    onCancelEdit={cancelEditing}
                                    onSaveEdit={() => saveEdit(field as any)}
                                    onDuplicate={() => handleDuplicate(field.id || '')}
                                    onDelete={() => handleDelete(field.id || '')}
                                    onUpdateEditState={setEditingField}
                                    onCharacterSelect={handleCharacterSelect}
                                    isSaving={savingFieldId === field.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No merge fields found for this campaign.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Item component mirrored from MergeFieldsTab with identical UX
type MergeFieldAsset = { type: string; objectName?: string | null; contentType?: string | null; isAudio?: boolean } & AssetData;

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
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor={`name-${field.id}`}>Name</Label>
                                <Input
                                    id={`name-${field.id}`}
                                    value={editingState.name}
                                    onChange={(e) => onUpdateEditState({ ...editingState, name: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor={`description-${field.id}`}>Description</Label>
                                <Textarea
                                    id={`description-${field.id}`}
                                    value={editingState.description}
                                    onChange={(e) => onUpdateEditState({ ...editingState, description: e.target.value })}
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label>Value</Label>
                                {field.mediaValueType === 'text' && (
                                    <Input
                                        value={editingState.value}
                                        onChange={(e) => onUpdateEditState({ ...editingState, value: e.target.value })}
                                        className="mt-1"
                                    />
                                )}

                                {field.type === 'character' && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="mt-1 w-full justify-start">
                                                {editingState.characterId
                                                    ? campaignCharacters.find((c) => c.id === editingState.characterId)?.name || 'Select Character'
                                                    : 'Select Character'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[600px] max-w-[80vw] max-h-[80vh] overflow-auto p-4" align="start">
                                            <CharacterPicker
                                                characters={campaignCharacters.map((c) => ({
                                                    id: c.id,
                                                    name: c.name,
                                                    characterTypes: c.characterTypes || null,
                                                    imageUrl: c.imageUrl ?? c.defaultImage ?? null,
                                                }))}
                                                selectedIds={editingState.characterId ? [editingState.characterId] : []}
                                                onChange={(ids) => onCharacterSelect(ids)}
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
                                        <MediaUploadField campaignId={campaignId} fieldType={field.mediaValueType} />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={onSaveEdit} size="sm" disabled={isSaving}>
                                    <Check className="h-4 w-4 mr-1" />
                                    {isSaving ? 'Saving...' : 'Save'}
                                </Button>
                                <Button onClick={onCancelEdit} size="sm" variant="outline">
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-medium text-lg">{field.name}</h4>
                                <Badge variant="outline" className="text-xs">{field.mediaValueType}</Badge>
                                {field.type && <Badge variant="secondary" className="text-xs">{field.type}</Badge>}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{field.description}</p>
                            {field.value && (
                                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                    <div className="grid grid-cols-1 gap-2 md:flex md:gap-4 md:items-start">
                                        <span className="text-sm font-medium text-gray-700">Value:</span>
                                        <div className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer break-all" title="Click to open asset in new tab">
                                            {field.mediaValueType === 'text' && (field.value as any)}
                                            {field.mediaValueType === 'image' && (
                                                <img src={campaignMergeFieldValues[field.value as string]?.asset_url}
                                                     alt={campaignMergeFieldValues[field.value as string]?.name || (field.value as any)} />
                                            )}
                                            {field.mediaValueType === 'video' && (
                                                <video controls width="480" className="rounded-md border border-gray-200">
                                                    <source src={campaignMergeFieldValues[field.value as string]?.asset_url} type="video/mp4" />
                                                    Your browser does not support the video tag.
                                                </video>
                                            )}
                                            {(() => {
                                                const valueKey = String(field.value);
                                                const mapping = campaignMergeFieldValues[valueKey];
                                                const mappingUrl = mapping?.asset_url;
                                                const directUrl = typeof field.value === 'string' && /^(https?:)?\/\//i.test(field.value as any) ? (field.value as string) : undefined;
                                                const url = mappingUrl || directUrl;
                                                const fromMappingIsAudio = mapping?.isAudio === true;
                                                const fromMime = mapping?.contentType || undefined;
                                                const mimeIsAudio = !!fromMime && fromMime.startsWith('audio/');
                                                const nameIsAudio = !!mapping?.objectName && /(\.(mp3|wav|m4a|aac|ogg))$/i.test(mapping.objectName);
                                                const isAudioType = !!field.mediaValueType && ['audio_music', 'audio_voice', 'gen_ai_voice'].includes(field.mediaValueType);
                                                const isAudioSemantic = field.type && ['voiceover', 'music', 'sfx'].includes(field.type as any);
                                                const urlLooksAudio = isAudioUrl(url);
                                                const shouldRenderAudio = !!url && (isAudioType || fromMappingIsAudio || mimeIsAudio || nameIsAudio || isAudioSemantic || urlLooksAudio);
                                                if (shouldRenderAudio && url) {
                                                    // Render audio in a neutral container (avoid inherited link styles) and force a minimal height
                                                    return (
                                                        <div className="mt-2 text-gray-900">
                                                            <audio controls className="block w-full h-10" src={url}>
                                                                Your browser does not support the audio element.
                                                            </audio>
                                                            <div className="mt-1 text-xs text-gray-500">
                                                                <a href={url} target="_blank" rel="noreferrer" className="underline">Open audio in new tab</a>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                            {field.mediaValueType === 'image_or_video' && (
                                                campaignMergeFieldValues[field.value as string]?.asset_url?.match(/\.(mp4|mov|webm)$/i)
                                                    ? (
                                                        <video controls width="480" className="rounded-md border border-gray-200">
                                                            <source src={campaignMergeFieldValues[field.value as string]?.asset_url} type="video/mp4" />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    ) : (
                                                        <img
                                                            src={campaignMergeFieldValues[field.value as string]?.asset_url}
                                                            alt={campaignMergeFieldValues[field.value as string]?.name || (field.value as any)}
                                                            className="rounded-md w-full object-contain"
                                                        />
                                                    )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

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
