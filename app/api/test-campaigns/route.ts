import { NextResponse } from 'next/server';
import { getCampaignsWithCounts } from '@/src/server/queries/campaigns.queries';

/**
 * Test endpoint to verify campaign data fetching
 * GET /api/test-campaigns
 */
export async function GET() {
    try {
        const campaigns = await getCampaignsWithCounts();

        return NextResponse.json({
            success: true,
            count: campaigns.length,
            data: campaigns,
            timestamp: new Date().toISOString(),
        }, { status: 200 });
    } catch (error) {
        console.error('Test campaigns API error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
