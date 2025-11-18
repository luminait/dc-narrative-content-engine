"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@/packages/ui/shadcn/button'
import { Input } from '@/packages/ui/shadcn/input'
import { Label } from '@/packages/ui/shadcn/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/packages/ui/shadcn/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/packages/ui/shadcn/popover'
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/packages/ui/shadcn/dropzone'
import { toast } from 'sonner'
import { useSupabaseUpload } from '@/src/lib/hooks/use-supabase-upload'
import { ASSET_CATEGORIES, AssetCategory, categoryAllowedMimeTypes, categoryToFolder, slugify } from './categories'
import { registerUploadedAssetAction } from '@/src/server/actions/assetLibrary.actions'
import { useRouter } from 'next/navigation'

type CharacterForm = {
  isHuman?: boolean
  isTrainer?: boolean
  characterTypes?: string | null
  personality?: string | null
  heightCentimeters?: number | null
  weightGrams?: number | null
  moralAlignment?: string | null
}

const MORAL_ALIGNMENTS = [
  'Lawful Good',
  'Neutral Good',
  'Chaotic Good',
  'Lawful Neutral',
  'True Neutral',
  'Chaotic Neutral',
  'Lawful Evil',
  'Neutral Evil',
  'Chaotic Evil',
] as const

export function AddAssetPopover({ campaignNames = [] as string[] }: { campaignNames?: string[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<AssetCategory>('cards')
  const [characterForm, setCharacterForm] = useState<CharacterForm>({})
  const [musicFolder, setMusicFolder] = useState('')
  // Environments-specific fields
  const [envCampaign, setEnvCampaign] = useState('')
  const [envLayer, setEnvLayer] = useState('')
  const [envIsLuma, setEnvIsLuma] = useState(false)

  const allowed = useMemo(() => categoryAllowedMimeTypes[category], [category])

  const pathPrefix = useMemo(() => {
    if (category === 'music') {
      const folder = musicFolder?.trim() ? slugify(musicFolder) : slugify(name || 'asset')
      return `${categoryToFolder[category]}/${folder}`
    }
    if (category === 'environments') {
      const campaign = envCampaign?.trim() ? slugify(envCampaign) : slugify(name || 'asset')
      const layerRaw = envLayer?.trim() ? envLayer : 'background'
      const layer = slugify(layerRaw)
      const lumaSegment = envIsLuma ? '/luma_mattes' : ''
      return `${categoryToFolder[category]}/${campaign}/${layer}${lumaSegment}`
    }
    return `${categoryToFolder[category]}/${slugify(name || 'asset')}`
  }, [category, musicFolder, name, envCampaign, envLayer, envIsLuma])

  const upload = useSupabaseUpload({
    bucketName: 'pokemon-assets',
    path: pathPrefix,
    allowedMimeTypes: allowed,
    maxFiles: 1,
    maxFileSize: 100 * 1024 * 1024,
    upsert: true,
  })

  // Helper to fully reset the form and the upload state
  const resetFormAndUpload = () => {
    // Clear Dropzone/upload state so it doesn't stay in success mode
    upload.setFiles([])
    upload.setErrors([])

    // Clear form fields
    setName('')
    setCharacterForm({})
    setMusicFolder('')
    setEnvCampaign('')
    setEnvLayer('')
    setEnvIsLuma(false)
  }

  useEffect(() => {
    if (upload.isSuccess && upload.files.length > 0) {
      const file = upload.files[0]
      const objectName = `${pathPrefix}/${file.name}`
      ;(async () => {
        try {
          const res = await registerUploadedAssetAction({
            displayName: name || file.name,
            category,
            objectName,
            character: category === 'characters' ? {
              name,
              isHuman: !!characterForm.isHuman,
              isTrainer: !!characterForm.isTrainer,
              characterTypes: characterForm.characterTypes ?? null,
              personality: characterForm.personality ?? null,
              heightCentimeters: characterForm.heightCentimeters ?? null,
              weightGrams: characterForm.weightGrams ?? null,
              moralAlignment: characterForm.moralAlignment ?? null,
            } : undefined,
          })
          if (res?.success) {
            toast.success('Asset uploaded')
            // Reset state so the next time the popover opens it's fresh
            resetFormAndUpload()
            setOpen(false)
            router.refresh()
          } else {
            toast.error('Failed to register asset')
          }
        } catch (e: any) {
          toast.error('Failed to register asset', { description: e?.message })
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upload.isSuccess, pathPrefix])

  // When the popover closes, also reset the upload state so success UI doesn't persist
  useEffect(() => {
    if (!open) {
      resetFormAndUpload()
    }
    // We intentionally do not reset when opening to avoid clearing a user-typed name
    // before they close. Closing resets everything.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // If the user changes category after selecting a file, clear selected files
  useEffect(() => {
    if (upload.files.length > 0) {
      upload.setFiles([])
      upload.setErrors([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) {
      toast.error('Please enter a name')
      return
    }
    if (upload.files.length === 0) {
      toast.error('Please select a file to upload')
      return
    }
    await upload.onUpload()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="default">Add Asset</Button>
      </PopoverTrigger>
      <PopoverContent className="w-[480px]">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="asset-name">Name</Label>
            <Input id="asset-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Asset name" />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as AssetCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {ASSET_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {category === 'music' && (
            <div className="space-y-2">
              <Label htmlFor="music-folder">Folder</Label>
              <Input
                id="music-folder"
                list="campaign-name-suggestions"
                value={musicFolder}
                onChange={(e) => setMusicFolder(e.target.value)}
                placeholder="Select or type a folder name (e.g. campaign name)"
              />
              <datalist id="campaign-name-suggestions">
                {campaignNames?.map((title) => (
                  <option key={title} value={title} />
                ))}
              </datalist>
            </div>
          )}

          {category === 'environments' && (
            <div className="space-y-4">
              {/* Campaign name combo (datalist) */}
              <div className="space-y-2">
                <Label htmlFor="env-campaign">Campaign</Label>
                <Input
                  id="env-campaign"
                  list="campaign-name-suggestions-env"
                  value={envCampaign}
                  onChange={(e) => setEnvCampaign(e.target.value)}
                  placeholder="Select or type a campaign name"
                />
                <datalist id="campaign-name-suggestions-env">
                  {campaignNames?.map((title) => (
                    <option key={title} value={title} />
                  ))}
                </datalist>
              </div>

              {/* Layer type combo (datalist) */}
              <div className="space-y-2">
                <Label htmlFor="env-layer">Layer Type</Label>
                <Input
                  id="env-layer"
                  list="env-layer-suggestions"
                  value={envLayer}
                  onChange={(e) => setEnvLayer(e.target.value)}
                  placeholder="background | midground | foreground (or type your own)"
                />
                <datalist id="env-layer-suggestions">
                  {['background', 'midground', 'foreground'].map((opt) => (
                    <option key={opt} value={opt} />
                  ))}
                </datalist>
              </div>

              {/* Luma matte checkbox */}
              <div className="flex items-center gap-2">
                <input
                  id="env-luma"
                  type="checkbox"
                  checked={envIsLuma}
                  onChange={(e) => setEnvIsLuma(e.target.checked)}
                />
                <Label htmlFor="env-luma">Is Luma Matte</Label>
              </div>
            </div>
          )}

          {category === 'characters' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2">
                <Label>Character types</Label>
                <Input value={characterForm.characterTypes ?? ''} onChange={(e) => setCharacterForm((s) => ({ ...s, characterTypes: e.target.value }))} placeholder="e.g. water, ninja" />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Personality</Label>
                <Input value={characterForm.personality ?? ''} onChange={(e) => setCharacterForm((s) => ({ ...s, personality: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Height (cm)</Label>
                <Input type="number" value={characterForm.heightCentimeters ?? ''} onChange={(e) => setCharacterForm((s) => ({ ...s, heightCentimeters: e.target.value ? Number(e.target.value) : null }))} />
              </div>
              <div className="space-y-1">
                <Label>Weight (g)</Label>
                <Input type="number" value={characterForm.weightGrams ?? ''} onChange={(e) => setCharacterForm((s) => ({ ...s, weightGrams: e.target.value ? Number(e.target.value) : null }))} />
              </div>
              <div className="space-y-1">
                <Label>Moral alignment</Label>
                <Select value={characterForm.moralAlignment ?? ''} onValueChange={(v) => setCharacterForm((s) => ({ ...s, moralAlignment: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select alignment" />
                  </SelectTrigger>
                  <SelectContent>
                    {MORAL_ALIGNMENTS.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Human?</Label>
                <Select value={String(!!characterForm.isHuman)} onValueChange={(v) => setCharacterForm((s) => ({ ...s, isHuman: v === 'true' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Trainer?</Label>
                <Select value={String(!!characterForm.isTrainer)} onValueChange={(v) => setCharacterForm((s) => ({ ...s, isTrainer: v === 'true' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div>
            <Dropzone {...upload}>
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={upload.loading}>Upload</Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
