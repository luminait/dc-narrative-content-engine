/**
 * UI-specific types that extend or transform database types.
 * These types are safe for client-side use and add computed/display fields.
 */

import type { CampaignData, PersonaData, CharacterData } from "@/src/features/campaigns/campaign.schema";
import type { PostWithImages } from '@/src/features/campaigns/posts/post.schema';
import type { PostImageRecord } from '@/src/features/campaigns/posts/postImages.schema';

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

/**
 * Character with computed default image for UI display.
 */
export type CharacterWithImage = CharacterData & {
  defaultImage?: string;
  type?: string; // Legacy compatibility for filtering
};

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

export interface PostGeneratorProps {
  onNavigate: (view: View, campaign?: CampaignData) => void;
  onSavePost: (post: Post) => void;
}

export type PostStatus = 'draft' | 'active' | 'archived';

/**
 * Post type alias derived from Zod schema to avoid redefinition.
 * Note: Uses snake_case and Date types as defined in the schema.
 */
export type Post = PostWithImages;

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
