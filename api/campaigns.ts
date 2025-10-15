import { apiClient } from './client';
import { Campaign } from '@/lib/types';

export type CreateCampaignPayload = Omit<Campaign, 'id' | 'createdAt' | 'status'>;

const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

/**
 * Creates a new campaign in the database.
 * @param campaignData The campaign data to save.
 */
export const createCampaign = async (campaignData: CreateCampaignPayload): Promise<Campaign> => {
    return apiClient<Campaign>('/campaigns', { // Assuming a '/campaigns' endpoint
        method: 'POST',
        body: JSON.stringify(campaignData),
    });
};


// Fetch a full campaign with characters
export const fetchFullCampaign = async (campaignId: string) => {

    try {
        console.log('=== FETCHING FULL CAMPAIGN FROM DASHBOARD ===');

        const url = `https://${projectId}/functions/v1/make-server-da4e929c/campaigns/${campaignId}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response error:', response.status, errorText);
            throw new Error(`Server error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
            console.error('Server returned error:', data.error);
            throw new Error(data.error);
        }

        console.log('Full campaign loaded:', data.campaign);
        return data.campaign;
    } catch (error) {
        console.error('Error fetching full campaign:', error);
        throw error;
    }
};
