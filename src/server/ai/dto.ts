export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type EventCadence = 'daily' | 'weekly' | 'monthly';
export type PostType = 'single_image' | 'video' | 'carousel';
export type CaptionLength = 'short' | 'medium' | 'long';
export type VideoLengthSeconds = 'THIRTY' | 'FORTY_FIVE' | 'SIXTY';
export type MergeFieldMediaValueType = 'image' | 'text' | 'video' | 'audio_voice' | 'audio_music' | 'gen_ai_image' | 'gen_ai_text' | 'gen_ai_video' | 'gen_ai_voice' | 'gen_ai_music' | 'image_or_video';
export type MergeFieldType = 'text' | 'character' | 'environment' | 'music' | 'voiceover' | 'sfx' | 'luma_matte';
export type MoralAlignment = 'LawfulGood' | 'NeutralGood' | 'ChaoticGood' | 'LawfulNeutral' | 'TrueNeutral' | 'ChaoticNeutral' | 'LawfulEvil' | 'NeutralEvil' | 'ChaoticEvil';

export interface AiCharacterAsset {
  id: string;
  name?: string | null;
  isPrimary: boolean;
  url: string;
  attributes?: Record<string, unknown>;
}

export interface AiCharacter {
  id: string;
  name: string;
  personality?: string | null;
  moralAlignment?: MoralAlignment | null;
  characterTypes?: string | null;
  isHuman?: boolean | null;
  isTrainer?: boolean | null;
  heightCentimeters?: number | null;
  weightGrams?: number | null;
  narrativeRole?: string | null;
  recommendedScene?: string | null;
  notes?: string | null;
  assets: AiCharacterAsset[];
}

export interface AiPersona {
  id: string;
  name: string | null;
  description?: string | null;
  isPrimary: boolean;
}

export interface AiNarrativeContext {
  characters: AiCharacter[];
  personas: AiPersona[];
}

export interface AiTimingConfig {
  start?: number | 'auto';
  length?: number;
}

export interface AiMergeFieldConfig {
  id: string;
  name: string;
  description?: string | null;
  mediaValueType: MergeFieldMediaValueType;
  mergeFieldType?: MergeFieldType | null;
  value?: string | null;
  timing?: AiTimingConfig;
  shouldRefreshOnRegenerate: boolean;
  resolvedAssetUrl?: string | null;
  resolvedAssetLabel?: string | null;
  characterId?: string | null;
  personaId?: string | null;
}

export interface AiCampaignContext {
  id: string;
  title: string;
  objective: string;
  narrativeContext?: string | null;
  platforms?: ('instagram' | 'whatnot' | 'tiktok' | 'youtube_shorts')[];
  isActive: boolean;
  isArchived: boolean;
  isDraft: boolean;
}

export interface AiScheduleContext {
  campaignDateRange: {
    startDate?: string;
    endDate?: string;
  };
  cadence: {
    daysOfWeek: Weekday[];
    frequency: EventCadence;
  };
  targetPostTime?: string;
}

export interface AiPostConfig {
  postType: PostType;
  captionLength: CaptionLength;
  videoLengthSeconds?: VideoLengthSeconds | null;
  customInstructions?: string | null;
  existingPostId?: string;
  preferredHashtags?: string[];
}

export interface AiGenerationJob {
  schemaVersion: 'v1';
  jobId: string;
  campaign: AiCampaignContext;
  narrative: AiNarrativeContext;
  schedule: AiScheduleContext;
  postConfig: AiPostConfig;
  mergeFields?: AiMergeFieldConfig[];
}
