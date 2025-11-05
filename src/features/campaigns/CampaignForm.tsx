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
} from '@/src/features/campaigns/campaign.schema';
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
    valueTypes: string[];
}

export default function CampaignForm( {
                                          personas,
                                          characters,
                                          valueTypes,
                                      }: CampaignFormProps ) {
    const router = useRouter();
    const [ isPending, startTransition ] = useTransition();

    const form = useForm<CampaignFormData>( {
        resolver: zodResolver( campaignFormSchema ),
        defaultValues: {
            title: '',
            objective: '',
            narrativeContext: '',
            postLength: '',
            cadence: {
                daysOfWeek: [],
                frequency: 'weekly',
            },
            postType: 'single_image',
            personas: [],
            characters: [],
            mergeFields: [],
        },
    } );

    const { handleSubmit, watch } = form;
    const postType = watch( 'postType' );

    const onSubmit = ( values: CampaignFormData ) => {
        startTransition( async () => {
            const result = await createCampaignAction( values );

            if (result.success) {
                toast.success( 'Campaign created successfully!' );
                router.push( `/campaigns/${result.campaignId}` );
            } else {
                toast.error( 'Please check the form for errors.' );
                // Handle and display specific field errors from result.error
                console.error( 'Validation errors:', result.error );
            }
        } );
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
                <CampaignDetails/>
                <ScheduleSection/>
                <PersonasSection personas={personas}/>
                <CharactersSection characters={characters} />
                <PostTypeSection/>

                {postType === 'video' && (
                    <>
                        <VideoLengthSection/>
                        <MergeFieldsSection valueTypes={valueTypes}/>
                    </>
                )}

                <FormActionsSection
                    isPending={isPending}
                    onCancel={() => router.push('/campaigns')}
                />
            </form>
        </FormProvider>
    );
}
