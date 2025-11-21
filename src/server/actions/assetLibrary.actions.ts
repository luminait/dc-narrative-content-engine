'use server'
import 'server-only'

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { prisma } from '@/src/server/db'
import { createSupabaseServerClient } from '@/src/server/supabase/server'
import { ASSET_CATEGORIES, AssetCategory, categoryToFolder, isAssetCategory } from '@/src/features/assets/categories'
import { z } from 'zod'
import type { Prisma } from '@/src/server/db/generated/prisma';

const DEFAULT_BUCKET = 'pokemon-assets'

type StorageAsset = {
  id: string
  bucket_id: string | null
  name: string | null
  created_at: Date | null
  metadata: unknown | null
}

export type LibraryAsset = {
  id: string
  bucketId: string
  name: string
  url: string
  category: AssetCategory
}

function toPublicUrl(bucketId: string, objectName: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) throw new Error('NEXT_PUBLIC_SUPABASE_URL not configured')
  return `${base}/storage/v1/object/public/${bucketId}/${objectName}`
}

async function requireAuth(): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    throw new Error('User not authenticated')
  }
  return data.user.id
}

// List all assets across known categories with minimal queries (cached by tag)
const getAssetsGrouped = unstable_cache(
  async (): Promise<Record<AssetCategory, LibraryAsset[]>> => {
    // Single query filtered by bucket and category prefixes
    const prefixFilters: Prisma.StorageObjectWhereInput[] = ASSET_CATEGORIES.map((c) => ({
      name: { startsWith: `${categoryToFolder[c]}/` },
    }))

    const objects = await prisma.storageObject.findMany({
      where: {
        // Use relation filter to avoid field name drift issues in stale Prisma clients
        buckets: { id: DEFAULT_BUCKET },
        OR: prefixFilters,
      },
      // Note: some environments generate different field casings; omit orderBy/select to avoid TS drift
      // orderBy: { created_at: 'desc' },
      // select: { id: true, bucket_id: true, name: true, created_at: true, metadata: true },
    })

    const grouped = Object.fromEntries(
      ASSET_CATEGORIES.map((c) => [c, [] as LibraryAsset[]])
    ) as Record<AssetCategory, LibraryAsset[]>

    for (const obj of objects as StorageAsset[]) {
      if (!obj.bucket_id || !obj.name) continue
      const category = ASSET_CATEGORIES.find((c) => obj.name!.startsWith(`${categoryToFolder[c]}/`))
      if (!category) continue
      grouped[category].push({
        id: obj.id,
        bucketId: obj.bucket_id,
        name: obj.name,
        url: toPublicUrl(obj.bucket_id, obj.name),
        category,
      })
    }

    return grouped
  },
  ['assets-list'],
  { tags: ['assets'] }
)

export async function listAssetsGroupedAction(): Promise<Record<AssetCategory, LibraryAsset[]>> {
  // Note: Do not call revalidateTag here; this function is invoked during render.
  return await getAssetsGrouped()
}

// Schema for character registration inputs
const characterRegistrationSchema = z.object({
  name: z.string().min(1),
  isHuman: z.boolean().optional(),
  isTrainer: z.boolean().optional(),
  characterTypes: z.string().optional().nullable(),
  personality: z.string().optional().nullable(),
  heightCentimeters: z.number().int().optional().nullable(),
  weightGrams: z.number().int().optional().nullable(),
  moralAlignment: z.string().optional().nullable(),
})

const MoralAlignmentMap: Record<string, string> = {
  'Lawful Good': 'LawfulGood',
  'Neutral Good': 'NeutralGood',
  'Chaotic Good': 'ChaoticGood',
  'Lawful Neutral': 'LawfulNeutral',
  'True Neutral': 'TrueNeutral',
  'Chaotic Neutral': 'ChaoticNeutral',
  'Lawful Evil': 'LawfulEvil',
  'Neutral Evil': 'NeutralEvil',
  'Chaotic Evil': 'ChaoticEvil',
}

// After client uploads an object to storage, register it as needed
export async function registerUploadedAssetAction(input: {
  displayName: string
  category: string
  bucketId?: string
  objectName: string // e.g. "characters/greninja/file.png"
  character?: z.infer<typeof characterRegistrationSchema>
}) {
  const userId = await requireAuth()

  const bucketId = input.bucketId ?? DEFAULT_BUCKET
  if (!isAssetCategory(input.category)) {
    throw new Error('Invalid category')
  }

  // For most categories, nothing to do beyond acknowledging upload
  if (input.category !== 'characters') {
    // Ensure the object exists (optional validation)
    const storageObj = await prisma.storageObject.findFirst({
      where: { name: input.objectName, buckets: { id: bucketId } },
      select: { id: true },
    })

    if (!storageObj) {
      throw new Error('Uploaded object not found in storage database')
    }

    revalidateTag('assets')
    revalidatePath('/assets')
    return { success: true as const, category: input.category, id: storageObj.id }
  }

  // Characters: create Character + CharacterAsset in a single transaction
  const characterData = characterRegistrationSchema.parse(input.character ?? {})

  const result = await prisma.$transaction(async (tx: { storageObject: { findFirst: (arg0: { where: { name: string; buckets: { id: string } }; select: { id: boolean } }) => any }; character: { create: (arg0: { data: { name: string; isHuman: boolean; isTrainer: boolean; characterTypes: string | null; personality: string | null; heightCentimeters: number | null; weightGrams: number | null; moralAlignment: any }; select: { id: boolean; name: boolean } }) => any }; characterAsset: { create: (arg0: { data: { assetRef: any; name: string; characterId: any; isPrimary: boolean } }) => any } }) => {
    const storageObj = await tx.storageObject.findFirst({
      where: { name: input.objectName, buckets: { id: bucketId } },
      select: { id: true },
    })
    if (!storageObj) throw new Error('Uploaded object not found in storage database')

    const character = await tx.character.create({
      data: {
        name: input.displayName,
        isHuman: characterData.isHuman ?? false,
        isTrainer: characterData.isTrainer ?? false,
        characterTypes: characterData.characterTypes ?? null,
        personality: characterData.personality ?? null,
        heightCentimeters: characterData.heightCentimeters ?? null,
        weightGrams: characterData.weightGrams ?? null,
        moralAlignment: characterData.moralAlignment ? (MoralAlignmentMap[characterData.moralAlignment] as any) : null,
      },
      select: { id: true, name: true },
    })

    await tx.characterAsset.create({
      data: {
        assetRef: storageObj.id,
        name: input.displayName,
        characterId: character.id,
        isPrimary: true,
      },
    })

    return character
  })

  revalidateTag('assets')
  revalidatePath('/assets')

  return { success: true as const, category: input.category, character: result }
}

// Delete an asset object from Supabase Storage (and storage.objects)
export async function deleteAssetAction(input: { bucketId: string; objectName: string }) {
  const userId = await requireAuth()
  if (!input?.bucketId || !input?.objectName) {
    return { success: false as const, error: 'Missing bucketId or objectName' }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.storage.from(input.bucketId).remove([input.objectName])
  if (error) {
    console.error('[deleteAssetAction] remove failed', { error, input, userId })
    return { success: false as const, error: error.message }
  }

  // Invalidate cache for assets list
  revalidateTag('assets')
  revalidatePath('/assets')
  return { success: true as const }
}

// Rename or move an asset within the same bucket (by moving path)
export async function renameAssetAction(input: { bucketId: string; fromObjectName: string; toObjectName: string }) {
  const userId = await requireAuth()
  if (!input?.bucketId || !input?.fromObjectName || !input?.toObjectName) {
    return { success: false as const, error: 'Missing required parameters' }
  }
  if (input.fromObjectName === input.toObjectName) {
    return { success: true as const }
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.storage.from(input.bucketId).move(input.fromObjectName, input.toObjectName)
  if (error) {
    console.error('[renameAssetAction] move failed', { error, input, userId })
    return { success: false as const, error: error.message }
  }

  revalidateTag('assets')
  revalidatePath('/assets')
  return { success: true as const }
}
