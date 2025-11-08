import { notFound } from 'next/navigation';
import { getCampaignById } from '@/src/server/queries/campaigns.queries';
import PostGeneratorClient from '@/src/features/campaigns/posts/new/PostGeneratorClient';

interface PageProps {
    params: Promise<{ campaignId: string }>;
}

export default async function PostGeneratorPage({ params }: PageProps) {
    const { campaignId } = await params;

    // Fetch campaign with RLS on server
    const campaign = await getCampaignById(campaignId);

    if (!campaign) {
        notFound();
    }

    return <PostGeneratorClient campaign={campaign} />;
}
