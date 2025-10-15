import {Videos} from "next/dist/lib/metadata/types/metadata-types";

/** ********************************************************************************************************************
 * 
 * CAMPAIGN CLASS TYPES
 *
 **********************************************************************************************************************/

/**
 * Represents a dynamic field for video generation, aligned with the `ShotstackMergeField` Prisma model.
 */
export type MergeField = {
  id: string;
  mergeField: string;
  description?: string | null;
  mediaValueType: string; // Corresponds to MergeFieldValueType enum
  startTime?: string | null;
  endTime?: string | null;
  campaignId: string;
  mergeFieldType?: string | null; // Corresponds to MergeFieldType enum
  defaultValue?: string | null;

  // UI-only fields for form state
  length?: string;
  value?: string;
};

/**
 * Represents a campaign, aligned with the `Campaign` Prisma model.
 * Note: Some fields are simplified for frontend use (e.g., enums as strings).
 */
export type Campaign = {
  id: string;
  title: string;
  campaignObjective: string;
  narrativeContext?: string | null;
  createdAt?: string;
  daysOfWeek: string[]; // Corresponds to Weekdays[] enum
  frequency?: string | null; // Corresponds to EventCadence? enum
  postType: string; // Corresponds to PostType enum
  postCaptionLength: string; // Corresponds to CaptionLength enum
  postVideoLength?: VideoLengthSeconds | null; // Corresponds to VideoLengthSeconds enum
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  isArchived: boolean;

  // UI-related or computed fields
  status: 'draft' | 'active' | 'completed' | 'archived'; // Derived from isActive/isArchived
  characters?: Character[];
  personas?: Persona[];
  mergeFields?: MergeField[];
};

export interface CampaignWithCounts extends Campaign {
  personaCount: number;
  characterCount: number;
}

/**
 * Represents a social media post, aligned with the `Post` Prisma model.
 */
export type Post = {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  hashtags: string[];
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt?: string;
  imageUrl?: string;
  mergeFieldValues?: Record<string, string>;
};

/**
 * Represents a character, aligned with the `Character` Prisma model.
 */
export type Character = {
  id: string; // Changed from number to string to match UUID
  name: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  isHuman?: boolean | null;
  isTrainer?: boolean | null;
  characterTypes?: string | null;
  personality?: string | null;
  heightCentimeters?: number | null;
  weightGrams?: number | null;
  moralAlignment?: string | null;

  // UI/Computed fields
  assets?: { isPrimary: boolean | null; storageObject: { id: string } }[];
  defaultImage?: string; // UI computed field
  type?: string; // Legacy compatibility for filtering
};

/**
 * Represents a persona, aligned with the `Persona` Prisma model.
 */
export type Persona = {
  id: string; // Changed from key to id to match Prisma
  label?: string | null;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
};

export type WebhookSettings = {
  environment: 'testing' | 'production';
  testingUrl: string;
  productionUrl: string;
};

export type View = 'dashboard' | 'campaign-generator' | 'campaign-details' | 'post-generator' | 'post-details' | 'settings';



//region Campaign enums
/** ********************************************************************************************************************
 * 
 * Enums for the different types of Campaign and Social Media Post data.
 *
 **********************************************************************************************************************/

/**
 * Enum for the days of the week.
 */
export type Weekdays = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

/**
 * Enum for the event cadence.
 */
export type EventCadence = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type PostType = 'text' | 'image' | 'video';

export type CaptionLength = 'short' | 'medium' | 'long';

export type VideoLengthSeconds = 'THIRTY' | 'FORTY_FIVE' | 'SIXTY';

export type MergeFieldType = 'text' | 'image' | 'video';

export type MergeFieldValueType = 'text' | 'image' | 'video';

//endregion

/**
 * Props for the Dashboard component.
 * @param onNavigate A function to handle navigation.
 * @param onDeleteCampaign A function to handle deleting a campaign.
 */
export interface DashboardProps {
    onNavigate: (view: View, campaign?: Campaign) => void;
    onDeleteCampaign: (campaignId: string) => void;
}

/**
 * Props for the PostGenerator component.
 * @param onNavigate A function to handle navigation. Example, `onNavigate: (view: View) => { // Navigate to another view };`
 * @param onSavePost A function to handle saving a post. Example, `onSavePost: (post: Post) => { // Save post logic };`
 */
export type PostGeneratorProps = {
    onNavigate: (view: View, campaign?: Campaign) => void;
    onSavePost: (post: Post) => void;
};

/**
 * Props for the CampaignGenerator component.
 * @param onNavigate A function to handle navigation. Example, `onNavigate: (view: View) => { // Navigate to another view };`
 * @param onSaveCampaign A function to handle saving a campaign. Example, `onSaveCampaign: (campaign: Campaign) => { // Save campaign logic };`
 */
export type CampaignGeneratorProps = {
    onNavigate: (view: View, campaign?: Campaign) => void;
    onSaveCampaign: (campaign: Campaign) => void;
};

/**
 * Props for the CampaignDetails component.
 * @param campaign The campaign to display details for.
 * @param onNavigate A function to handle navigation. Example, `onNavigate: (view: View) => { // Navigate to another view };`
 * @param onDeleteCampaign A function to handle deleting a campaign. Example, `onDeleteCampaign: (campaignId: string) => { // Delete campaign logic };`
 */
export type CampaignDetailsProps = {
    campaign: Campaign;
    onNavigate: (view: View) => void;
    onDeleteCampaign: (campaignId: string) => void;
};
