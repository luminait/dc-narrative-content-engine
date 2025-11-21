'use server'
import 'server-only'

import { prisma } from '@/src/server/db'
import { createSupabaseServerClient } from '@/src/server/supabase/server'

async function requireAuth(): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    throw new Error('User not authenticated')
  }
  return data.user.id
}

/**
 * Returns a sorted list of campaign titles owned by the current user.
 */
export async function listCampaignNamesForUser(): Promise<string[]> {
  const userId = await requireAuth()
  const rows = await prisma.campaign.findMany({
    where: { createdBy: userId },
    select: { title: true },
    orderBy: { title: 'asc' },
  })
  return rows.map((r: { title: any }) => r.title).filter(Boolean)
}
