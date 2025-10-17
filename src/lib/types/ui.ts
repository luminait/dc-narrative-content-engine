/**
 * UI-specific types that extend or transform database types.
 * These types are safe for client-side use and add computed/display fields.
 */

import type { Campaign, Character, Persona } from '@/src/server/db/types';

/**
 * Campaign with computed status field for UI display.
 */
export type CampaignWithStatus = Campaign & {
  status: 'draft' | 'active' | 'completed' | 'archived';
};

/**
 * Campaign with relation counts for list views.
 */
export type CampaignWithCounts = Campaign & {
  personaCount: number;
  characterCount: number;
};

/**
 * Character with computed default image for UI display.
 */
export type CharacterWithImage = Character & {
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
  onNavigate: (view: View, campaign?: Campaign) => void;
  onDeleteCampaign: (campaignId: string) => void;
}

export interface CampaignGeneratorProps {
  onNavigate: (view: View, campaign?: Campaign) => void;
  onSaveCampaign: (campaign: Campaign) => void;
}

export interface CampaignDetailsProps {
  campaign: Campaign;
  onNavigate: (view: View) => void;
  onDeleteCampaign: (campaignId: string) => void;
}

export interface PostGeneratorProps {
  onNavigate: (view: View, campaign?: Campaign) => void;
  onSavePost: (post: Post) => void;
}

/**
 * Post type for social media content.
 */
export interface Post {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  hashtags: string[];
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt?: string;
  imageUrl?: string;
  mergeFieldValues?: Record<string, string>;
}

/**
 * Webhook settings type.
 */
export interface WebhookSettings {
  environment: 'testing' | 'production';
  testingUrl: string;
  productionUrl: string;
}
