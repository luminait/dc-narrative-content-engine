
import { Suspense } from 'react';
import Header from '@/ui/layout/Header';
import CampaignForm from "@/src/features/campaigns/CampaignForm";
import { getPersonas, getCharacters, getValueTypes } from '@/src/server/dataFetchingCaches';
import { Skeleton } from '@/ui/shadcn/skeleton';

export default async function NewCampaignPage() {
    return (
        <div className="flex flex-1 flex-col">
            <Header
                title="Create a new campaign"
                subtitle="Build a comprehensive narrative social media campaign."
            />
            <Suspense fallback={<CampaignFormSkeleton />}>
                <CampaignFormData />
            </Suspense>
        </div>
    );
}

async function CampaignFormData() {
    const [personas, characters, valueTypes] = await Promise.all([
        getPersonas(),
        getCharacters(),
        getValueTypes(),
    ]);

    return (
        <CampaignForm
            personas={personas}
            characters={characters}
            valueTypes={valueTypes}
        />
    );
}

function CampaignFormSkeleton() {
    return (
        <div className="space-y-6 p-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
}
