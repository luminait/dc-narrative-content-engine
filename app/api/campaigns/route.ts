import { NextResponse } from 'next/server';
import { getCampaignsWithCounts } from '@/src/server/queries/campaigns.queries';

// This line is crucial for preventing Next.js from caching the response.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('[API - GET_CAMPAIGNS] Fetching campaigns...'); // This should now log on every request
    // In a real app, you would get the current user's ID here
    // and pass it to the query function.
    const campaigns = await getCampaignsWithCounts();
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('[API - GET_CAMPAIGNS]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
