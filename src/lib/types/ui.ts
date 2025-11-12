/**
 * UI-specific types that extend or transform database types.
 * These types are safe for client-side use and add computed/display fields.
 */

import type { CampaignData, PersonaData } from "@/src/lib/zod/campaign.schema";
import type { CharacterData } from "@/src/lib/zod/character.schema";
import type { PostBase, PostWithImages } from '@/src/lib/zod/post.schema';
import type { PostImageRecord } from '@/src/lib/zod/postImages.schema';

/*********************************************************************************************************************
 * CAMPAIGNS
 *********************************************************************************************************************/

/**
 * Campaign with computed status field for UI display.
 */
export type CampaignStatus = 'draft' | 'active' | 'completed' | 'archived' | 'scheduled';

export type CampaignWithStatus = CampaignData & {
  status: CampaignStatus;
};

/**
 * Campaign with relation counts for list views.
 */
export type CampaignWithCounts = CampaignData & {
  personaCount: number;
  characterCount: number;
};

export type Campaign = CampaignWithStatus & CampaignWithCounts;


/*********************************************************************************************************************
* CHARACTERS
*********************************************************************************************************************/


/**
 * Character with computed default image for UI display.
 */
export type CharacterWithImage = CharacterData & {
  defaultImage?: string;
  imageUrl?: string | null;
  type?: string; // Legacy compatibility for filtering
};


/**
 * Character with Image and Character data
 */
export type Character = CharacterWithImage;


/*********************************************************************************************************************
 * PERSONAS
 *********************************************************************************************************************/
export type Persona = PersonaData;

/*********************************************************************************************************************
 * POSTS
 *********************************************************************************************************************/

export interface PostGeneratorProps {
  onNavigate: (view: View, campaign?: CampaignData) => void;
  onSavePost: (post: Post) => void;
}

export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived';

/**
 * Computes the status of a post based on its properties.
 * @param post The post object containing status-related fields.
 * @returns The computed PostStatus.
 */
export const getPostStatus = (
  post: Pick<PostBase, 'isDraft' | 'isActive' | 'isArchived' | 'scheduledAt'>
): PostStatus => {
  if (post.isDraft) {
    return 'draft';
  }
  if (post.isArchived) {
    return 'archived';
  }
  if (post.scheduledAt && new Date(post.scheduledAt) > new Date()) {
    return 'scheduled';
  }
  if (post.isActive) {
    return 'published';
  }
  // Default fallback status
  return 'draft';
};


export type PostWithStatus = PostBase & {
    status: PostStatus
};

/**
 * Post type alias derived from Zod schema to avoid redefinition.
 */
export type Post = PostWithImages & PostWithStatus;

/**
 * Post image relationship type alias derived from Zod schema.
 */
export type PostImage = PostImageRecord;

/**
 * Webhook settings type.
 */
export interface WebhookSettings {
  environment: 'testing' | 'production';
  testingUrl: string;
  productionUrl: string;
}


/*********************************************************************************************************************
 * DASHBOARD
 *********************************************************************************************************************/

/**
 * Navigation view types for the application.
 */
export type View =
    | 'dashboard'
    | 'campaign-generator'
    | 'campaign-details'
    | 'post-generator'
    | 'post-details'
    | 'settings';

/**
 * Component props types.
 */
export interface DashboardProps {
    onNavigate: (view: View, campaign?: CampaignData) => void;
    onDeleteCampaign: (campaignId: string) => void;
}

export interface CampaignGeneratorProps {
    onNavigate: (view: View, campaign?: CampaignData) => void;
    onSaveCampaign: (campaign: CampaignData) => void;
}

export interface CampaignDetailsProps {
    campaign: CampaignData;
    onNavigate: (view: View) => void;
    onDeleteCampaign: (campaignId: string) => void;
}

/*********************************************************************************************************************
 * MERGE FIELDS
 *********************************************************************************************************************/

export type MediaValueType = 'image' | 'text' | 'video' | 'audio_voice' | 'audio_music' | 'gen_ai_image' | 'gen_ai_text' | 'gen_ai_video' | 'gen_ai_voice' | 'gen_ai_music' | 'image_or_video';

export type MergeFieldType = 'text' | 'character' | 'environment' | 'music' | 'voiceover' | 'sfx' | 'luma_matte';
