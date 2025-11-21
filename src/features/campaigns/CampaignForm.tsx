'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { Persona } from '@/src/server/db/types';
import { createCampaignAction } from '@/src/server/actions/campaign.actions';
import {
    campaignFormSchema,
    type CampaignFormData,
} from '@/src/lib/zod/campaign.schema';
import CampaignDetails from '@/src/features/campaigns/new/sections/CampaignDetails';
import ScheduleSection from '@/src/features/campaigns/new/sections/ScheduleSection';
import PersonasSection from '@/src/features/campaigns/new/sections/PersonasSection';
import CharactersSection from '@/src/features/campaigns/new/sections/CharactersSection';
import PostTypeSection from '@/src/features/campaigns/new/sections/PostTypeSection';
import VideoLengthSection from '@/src/features/campaigns/new/sections/VideoLengthSection';
import MergeFieldsSection from '@/src/features/campaigns/new/sections/MergeFieldsSection';
import FormActionsSection from '@/src/features/campaigns/new/sections/FormActionsSection';
import { CharacterWithImage } from "@/src/lib/types/ui";

interface CampaignFormProps {
    personas: Persona[];
    characters: CharacterWithImage[];
}

export default function CampaignForm({
    personas,
    characters,
}: CampaignFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<CampaignFormData>({
        resolver: zodResolver(campaignFormSchema),
        mode: 'onChange',
        defaultValues: {
            title: 'New Campaign',
            objective: 'A great campaign objective.',
            narrativeContext: '',
            postLength: 'short',
            startDate: undefined,
            endDate: undefined,
            cadence: {
                daysOfWeek: ['monday'],
                frequency: 'weekly',
            },
            postType: 'single_image',
            videoLength: undefined,
            personas: [],
            characters: [],
            mergeFields: [],
        },
    });

    const { handleSubmit, watch, formState } = form;
    const postType = watch('postType');

    const onSubmit = (values: CampaignFormData) => {
        startTransition(async () => {
            const result = await createCampaignAction(values);

            if (result.success) {
                toast.success('Campaign created successfully!');
                router.push(`/campaigns/${result.campaignId}`);
            } else {
                toast.error('Please check the form for errors.');
                // Handle and display specific field errors from result.error
                console.error('Validation errors:', result.error);
            }
        });
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
                <CampaignDetails />
                <ScheduleSection />
                <PersonasSection personas={personas} />
                <CharactersSection characters={characters} />
                <PostTypeSection />

                {postType === 'video' && (
                    <>
                        <VideoLengthSection />
                        <MergeFieldsSection characters={characters} />
                    </>
                )}

                {/* --- START DEBUGGING BLOCK --- */}
                <div className="mt-6 p-4 bg-slate-900 border border-slate-700 rounded-lg text-slate-300">
                    <h3 className="font-mono font-bold text-lg text-white">Debug Output</h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                            <label className="block text-sm font-medium text-slate-400">formState.isValid</label>
                            <pre className="mt-1 text-lg font-bold text-white">{JSON.stringify(formState.isValid)}</pre>
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-400">formState.errors</label>
                        <pre className="mt-1 p-2 bg-black rounded-md text-sm whitespace-pre-wrap">
                            {JSON.stringify(formState.errors, null, 2)}
                        </pre>
                    </div>
                </div>
                {/* --- END DEBUGGING BLOCK --- */}

                <FormActionsSection
                    isPending={isPending}
                    onCancel={() => router.push('/campaigns')}
                />
            </form>
        </FormProvider>
    );
}
