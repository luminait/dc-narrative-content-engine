import {LucideIcon} from "lucide-react";

export type MergeField = {
    id: string;
    merge_field: string;
    description: string;
    media_value_type: string;
    start_time: string;
    end_time: string;
    campaign_id: string;
    merge_field_type: string;
    default_value?: string;

    // Computed/UI fields
    length?: string; // calculated field for UI display
    value?: string; // current value for UI forms
    resolved_filename?: string; // resolved filename for media asset types
    resolved_asset_url?: string; // resolved asset URL for media asset types
    is_resolving?: boolean; // indicates if asset reference is being resolved
};

export type Campaign = {
    id: string;
    title: string;
    objective: string;
    narrativeContext?: string; // Optional narrative context field
    status: 'draft' | 'active' | 'completed';
    createdAt: string;
    cadence: {
        daysOfWeek: string[]; // ['monday', 'tuesday', etc.]
        frequency: 'weekly' | 'bi-weekly'; // how often the pattern repeats
    };
    postType: 'image' | 'carousel' | 'video';
    videoLength?: 30 | 45 | 60; // only relevant when postType is 'video'
    personas: string[];
    characters: string[]; // Legacy: character names for backward compatibility
    postLength: string;
    mergeFields: MergeField[]; // Updated to use structured merge fields
    startDate?: string;
    endDate?: string;

    // New database-driven fields
    featuredCharacters?: Character[]; // Full character objects from database
    featuredPersonas?: Persona[]; // Full persona objects from database
};

export interface CampaignWithCounts extends Campaign {
    personaCount: number;
    characterCount: number;
}

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

export type Character = {
    // Database fields (primary)
    id: number; // Primary key from database
    name: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
    is_human: boolean;
    is_trainer: boolean;
    character_types?: string; // JSON string or comma-separated types
    personality?: string;
    height_centimeters?: number;
    weight_grams?: number;
    moral_alignment?: string;

    // Computed/UI fields
    imageAssets?: string[]; // Will be populated from character_assets table
    defaultImage?: string; // Will be computed from imageAssets

    // Legacy compatibility fields (deprecated, but kept for backward compatibility)
    type?: string; // Maps to character_types for backward compatibility
    isTrainer?: boolean; // Maps to is_trainer
    isHuman?: boolean; // Maps to is_human
    character_id?: number; // Alias for id
    default_image?: string; // Alias for defaultImage
};

export type Persona = {
    // Database fields (primary)
    key: string; // Primary key from database
    label: string;
    description: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;

    // Computed/compatibility fields
    persona_key?: string; // Alias for key
    persona_label?: string; // Alias for label
    persona_description?: string; // Alias for description
};

export type WebhookSettings = {
    environment: 'testing' | 'production';
    testingUrl: string;
    productionUrl: string;
};

export type View = 'dashboard' | 'campaign-generator' | 'campaign-details' | 'post-generator' | 'post-details' | 'settings';


export interface DashboardProps {
    onNavigate: (view: View, campaign?: Campaign) => void;
    onDeleteCampaign: (campaignId: string) => void;
}
