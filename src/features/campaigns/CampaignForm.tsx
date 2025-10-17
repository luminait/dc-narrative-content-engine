'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Persona, Character } from '@/src/server/db/types';
import { createCampaignAction } from '@/src/server/actions/campaign.actions';
import type { CampaignFormData, MergeField, Cadence } from './campaign.schema';
import CampaignDetails from './sections/CampaignDetails';
import ScheduleSection from './sections/ScheduleSection';
import PersonasSection from './sections/PersonasSection';
import CharactersSection from './sections/CharactersSection';
import PostTypeSection from './sections/PostTypeSection';
import VideoLengthSection from './sections/VideoLengthSection';
import MergeFieldsSection from './sections/MergeFieldsSection';
import FormActionsSection from './sections/FormActionsSection';

interface CampaignFormProps {
  personas: Persona[];
  characters: Character[];
  valueTypes: string[];
}

export default function CampaignForm({ personas, characters, valueTypes }: CampaignFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    objective: '',
    narrativeContext: '',
    postLength: '',
    startDate: '',
    endDate: '',
  });

  const [cadence, setCadence] = useState<Cadence>({
    daysOfWeek: [],
    frequency: 'weekly',
  });

  const [postType, setPostType] = useState<'image' | 'carousel' | 'video'>('image');
  const [videoLength, setVideoLength] = useState<30 | 45 | 60>(30);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [mergeFields, setMergeFields] = useState<MergeField[]>([]);

  const isFormValid = () => {
    return (
      formData.title.trim() !== '' &&
      formData.objective.trim() !== '' &&
      formData.postLength.trim() !== '' &&
      cadence.daysOfWeek.length > 0 &&
      selectedPersonas.length > 0 &&
      selectedCharacters.length > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast.error('Please fill in all required fields');
      return;
    }

    startTransition(async () => {
      try {
        const payload: CampaignFormData = {
          ...formData,
          cadence,
          postType,
          videoLength: postType === 'video' ? videoLength : undefined,
          personas: selectedPersonas,
          characters: selectedCharacters,
          mergeFields: postType === 'video' ? mergeFields : undefined,
        };

        const result = await createCampaignAction(payload);

        if (result.success) {
          toast.success('Campaign created successfully!');
          router.push(`/campaigns/${result.campaignId}`);
        }
      } catch (error) {
        console.error('Campaign creation error:', error);
        toast.error('Failed to create campaign. Please try again.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      <CampaignDetails formData={formData} setFormData={setFormData} />
      
      <ScheduleSection cadence={cadence} setCadence={setCadence} />
      
      <PersonasSection
        personas={personas}
        selectedPersonas={selectedPersonas}
        setSelectedPersonas={setSelectedPersonas}
      />
      
      <CharactersSection
        characters={characters}
        selectedCharacters={selectedCharacters}
        setSelectedCharacters={setSelectedCharacters}
      />
      
      <PostTypeSection postType={postType} setPostType={setPostType} />
      
      {postType === 'video' && (
        <>
          <VideoLengthSection videoLength={videoLength} setVideoLength={setVideoLength} />
          <MergeFieldsSection
            mergeFields={mergeFields}
            setMergeFields={setMergeFields}
            valueTypes={valueTypes}
          />
        </>
      )}

      <FormActionsSection
        isValid={isFormValid()}
        isPending={isPending}
        onCancel={() => router.push('/campaigns')}
      />
    </form>
  );
}
