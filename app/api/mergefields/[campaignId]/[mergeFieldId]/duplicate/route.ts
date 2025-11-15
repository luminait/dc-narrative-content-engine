import 'server-only';
import { NextResponse } from 'next/server';
import { duplicateMergeFieldAction } from '@/src/server/actions/mergefield.actions';

// In Next.js 15, dynamic route params are async and must be awaited.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ campaignId: string; mergeFieldId: string }> }
) {
  try {
    const { campaignId, mergeFieldId } = await params;
    const result = await duplicateMergeFieldAction(mergeFieldId, campaignId);
    const status = result.success ? 200 : 400;
    return NextResponse.json(result, { status });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message ?? 'Unknown error' }, { status: 500 });
  }
}
