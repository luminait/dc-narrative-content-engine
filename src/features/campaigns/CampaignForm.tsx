'use client';

import { SetStateAction, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { Persona, Character } from '@/src/server/db/types';
import { createCampaignAction } from '@/src/server/actions/campaign.actions';
import {
    campaignFormSchema,
    type CampaignFormData,
} from '@/src/features/campaigns/campaign.schema';
import CampaignDetails from '@/src/features/campaigns/new/sections/CampaignDetails';
import ScheduleSection from '@/src/features/campaigns/new/sections/ScheduleSection';
import PersonasSection from '@/src/features/campaigns/new/sections/PersonasSection';
import CharactersSection from '@/src/features/campaigns/new/sections/CharactersSelection';
import PostTypeSection from '@/src/features/campaigns/new/sections/PostTypeSection';
import VideoLengthSection from '@/src/features/campaigns/new/sections/VideoLengthSection';
import MergeFieldsSection from '@/src/features/campaigns/new/sections/MergeFieldsSection';
import FormActionsSection from '@/src/features/campaigns/new/sections/FormActionsSection';

interface CampaignFormProps {
    personas: Persona[];
    characters: Character[];
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

    const { handleSubmit, control, watch } = form;
    const postType = watch( 'postType' );

    const onSubmit = ( values: CampaignFormData ) => {
        startTransition( async () => {
            const result = await createCampaignAction( values );

            if ( result.success ) {
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
        <form onSubmit={handleSubmit( onSubmit )} className="space-y-6 mt-6">
            <CampaignDetails/>
            <ScheduleSection/>
            <PersonasSection personas={personas}/>
            <CharactersSection characters={characters} selectedCharacters={[]}
                               setSelectedCharacters={function ( value: SetStateAction<string[]> ): void {
                                   throw new Error( "Function not implemented." );
                               }} />
      <PostTypeSection  />

      {postType === 'video' && (
        <>
          <VideoLengthSection />
          <MergeFieldsSection valueTypes={valueTypes} />
        </>
      )}

      <FormActionsSection
        isPending={isPending}
        onCancel={() => router.push('/campaigns')}
      />
    </form>
  );
}
