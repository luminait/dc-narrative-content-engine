import {CheckCircle, Clock} from "lucide-react";
import {Campaign, CampaignWithCounts} from "@/lib/types";

export const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
        case 'active':
            return <CheckCircle className="w-4 h-4 text-green-600" />;
        case 'draft':
            return <Clock className="w-4 h-4 text-yellow-600" />;
        case 'completed':
            return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
};

export const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'draft':
            return 'bg-yellow-100 text-yellow-800';
        case 'completed':
            return 'bg-gray-100 text-gray-800';
    }
};

// Normalize campaign data to ensure required properties exist
const normalizeCampaign = (campaign: any): Campaign => {
    return {
        ...campaign,
        characters: Array.isArray(campaign.characters) ? campaign.characters : [],
        personas: Array.isArray(campaign.personas) ? campaign.personas : [],
        cadence: campaign.cadence || { daysOfWeek: [], frequency: 'weekly' },
        mergeFields: Array.isArray(campaign.mergeFields) ? campaign.mergeFields : [],
        status: campaign.status || 'draft',
        postType: campaign.postType || 'image',
        postLength: campaign.postLength || 'short'
    };
};

// Fetch campaigns from Supabase
export const fetchCampaigns = async ({
                                         setCampaigns,
                                         setCampaignsLoading,
                                         setCampaignsError
} : {
    setCampaigns: React.Dispatch<React.SetStateAction<CampaignWithCounts[]>>,
    setCampaignsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setCampaignsError: React.Dispatch<React.SetStateAction<string | null>>
}) => {
    const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
    const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
    try {
        console.log('=== FRONTEND CAMPAIGNS FETCH DEBUG ===');
        setCampaignsError(null);

        // Validate configuration before making request
        if (!projectId || !publicAnonKey) {
            throw new Error('Supabase configuration missing');
        }

        const url = `https://${projectId}.supabase.co/functions/v1/make-server-da4e929c/campaigns`;

        console.log('Fetching campaigns from:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
            },
            mode: 'cors',
        });

        console.log('Campaigns response status:', response.status);
        console.log('Campaigns response ok:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response error:', response.status, errorText);
            throw new Error(`Server error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Campaigns response data:', data);

        if (data.error) {
            console.error('Server returned error:', data.error);
            throw new Error(data.error);
        }

        const fetchedCampaigns = data.campaigns || [];
        console.log('Extracted campaigns array:', fetchedCampaigns);

        // Normalize and fetch persona/character counts for each campaign
        const campaignsWithCounts = await Promise.all(
            fetchedCampaigns.map(async (rawCampaign: any) => {
                const campaign = normalizeCampaign(rawCampaign);
                console.log(`Processing campaign ${campaign.id} for persona and character counts...`);

                // For sample campaigns, use the arrays directly if available
                if (campaign.id.startsWith('sample-')) {
                    const personaCount = Array.isArray(campaign.personas) ? campaign.personas.length : 0;
                    const characterCount = Array.isArray(campaign.characters) ? campaign.characters.length : 0;
                    console.log(`Sample campaign ${campaign.id} has ${personaCount} personas and ${characterCount} characters from static data`);
                    return {
                        ...campaign,
                        personaCount,
                        characterCount
                    };
                }

                try {
                    // Fetch both persona and character counts in parallel
                    const [personaCount, characterCount] = await Promise.all([
                        fetchCampaignPersonaCount(campaign.id),
                        fetchCampaignCharacterCount(campaign.id)
                    ]);

                    console.log(`Fetched counts for campaign ${campaign.id}: ${personaCount} personas, ${characterCount} characters`);
                    return {
                        ...campaign,
                        personaCount,
                        characterCount
                    };
                } catch (error) {
                    console.warn(`Failed to fetch counts for campaign ${campaign.id}:`, error);
                    return {
                        ...campaign,
                        personaCount: 0,
                        characterCount: 0
                    };
                }
            })
        );

        setCampaigns(campaignsWithCounts);

        console.log('Final campaigns with counts:', campaignsWithCounts);

        if (data.source === 'fallback') {
            setCampaignsError(data.message || 'Using sample campaign data');
        } else {
            setCampaignsError(null);
        }
    } catch (error) {
        console.error('Error fetching campaigns:', error);

        let errorMessage = 'Failed to load campaigns';
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            errorMessage = 'Cannot connect to server';
        } else if (error.message.includes('Supabase configuration missing')) {
            errorMessage = 'Server configuration issue';
        } else if (error.message.includes('Server error')) {
            errorMessage = `Server error: ${error.message}`;
        }

        setCampaignsError(errorMessage);
        setCampaigns([]);
    } finally {
        setCampaignsLoading(false);
    }
};


// Fetch character count for a specific campaign
const fetchCampaignCharacterCount = async (campaignId: string): Promise<number> => {
    const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
    const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

    try {
        console.log(`=== FETCHING CHARACTER COUNT FOR CAMPAIGN ${campaignId} ===`);

        const url = `https://${projectId}.supabase.co/functions/v1/make-server-da4e929c/fetch-campaigns-characters`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ campaign_id: campaignId })
        });

        console.log(`Character count response status for campaign ${campaignId}:`, response.status);

        if (!response.ok) {
            console.warn(`Failed to fetch character count for campaign ${campaignId}: ${response.status}`);
            return 0; // Return 0 instead of throwing
        }

        const result = await response.json();
        console.log(`Character count result for campaign ${campaignId}:`, result);

        // Handle different possible response structures
        let count = 0;
        if (typeof result.count === 'number') {
            count = result.count;
            console.log(`Using count field: ${count}`);
        } else if (Array.isArray(result.characters)) {
            count = result.characters.length;
            console.log(`Using characters array length: ${count}`);
        } else if (result.error) {
            console.warn(`Server returned error for character count: ${result.error}`);
            count = 0;
        } else {
            console.warn(`Unexpected character count response structure:`, result);
            count = 0;
        }

        console.log(`=== FINAL CHARACTER COUNT FOR CAMPAIGN ${campaignId}: ${count} ===`);
        return count;
    } catch (error) {
        console.warn(`Error fetching character count for campaign ${campaignId}:`, error);
        return 0; // Return 0 instead of throwing
    }
};



// Fetch persona count for a specific campaign
const fetchCampaignPersonaCount = async (campaignId: string): Promise<number> => {
    const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
    const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

    try {
        console.log(`=== FETCHING PERSONA COUNT FOR CAMPAIGN ${campaignId} ===`);

        const url = `https://${projectId}.supabase.co/functions/v1/make-server-da4e929c/fetch-campaigns-personas`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ campaign_id: campaignId })
        });

        console.log(`Persona count response status for campaign ${campaignId}:`, response.status);

        if (!response.ok) {
            console.warn(`Failed to fetch persona count for campaign ${campaignId}: ${response.status}`);
            return 0; // Return 0 instead of throwing
        }

        const result = await response.json();
        console.log(`Persona count result for campaign ${campaignId}:`, result);

        // Handle different possible response structures
        let count = 0;
        if (typeof result.count === 'number') {
            count = result.count;
            console.log(`Using count field: ${count}`);
        } else if (Array.isArray(result.personas)) {
            count = result.personas.length;
            console.log(`Using personas array length: ${count}`);
        } else if (result.error) {
            console.warn(`Server returned error for persona count: ${result.error}`);
            count = 0;
        } else {
            console.warn(`Unexpected persona count response structure:`, result);
            count = 0;
        }

        console.log(`=== FINAL PERSONA COUNT FOR CAMPAIGN ${campaignId}: ${count} ===`);
        return count;
    } catch (error) {
        console.warn(`Error fetching persona count for campaign ${campaignId}:`, error);
        return 0; // Return 0 instead of throwing
    }
};


// Update campaign status (archive/unpublish)
export const updateCampaignStatus = async (campaignId: string, action: 'archive' | 'unpublish', setCampaignError:  React.Dispatch<React.SetStateAction<string | null>>) => {
    const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
    const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

    try {
        console.log(`=== FRONTEND ${action.toUpperCase()} CAMPAIGN DEBUG ===`);
        console.log(`${action === 'archive' ? 'Archiving' : 'Unpublishing'} campaign:`, campaignId);

        const url = `https://${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/make-server-da4e929c/campaigns/${campaignId}/status`;

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY}}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action })
        });

        console.log(`${action} response status:`, response.status);
        console.log(`${action} response ok:`, response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Server response error for ${action}:`, response.status, errorText);
            throw new Error(`Failed to ${action} campaign: ${response.status}`);
        }

        const result = await response.json();
        console.log(`${action} response data:`, result);

        if (result.error) {
            console.error(`Server returned error for ${action}:`, result.error);
            throw new Error(result.error);
        }

        console.log(`Successfully ${action === 'archive' ? 'archived' : 'unpublished'} campaign`);

        // Refresh campaigns list to show updated status
        await fetchCampaigns();

        return result;
    } catch (error) {
        console.error(`Error ${action === 'archive' ? 'archiving' : 'unpublishing'} campaign:`, error);

        let errorMessage = `Failed to ${action} campaign`;
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            errorMessage = 'Cannot connect to server';
        } else if (error.message.includes('Server response error')) {
            errorMessage = `Server error: ${error.message}`;
        }

        setCampaignsError(errorMessage);
        throw error;
    }
};



// Handle campaign actions
export const handleCampaignAction = async (campaign: CampaignWithCounts, action: 'view' | 'delete' | 'archive' | 'unpublish') => {
    switch (action) {
        case 'view':
            try {
                // Fetch full campaign data including characters before navigation
                const fullCampaign = await fetchFullCampaign(campaign.id);
                onNavigate('campaign-details', fullCampaign);
            } catch (error) {
                console.error('Failed to load campaign details:', error);
                // Fallback to basic campaign data if full fetch fails
                onNavigate('campaign-details', campaign);
            }
            break;
        case 'delete':
            onDeleteCampaign(campaign.id);
            break;
        case 'archive':
            await updateCampaignStatus(campaign.id, 'archive');
            break;
        case 'unpublish':
            await updateCampaignStatus(campaign.id, 'unpublish');
            break;
    }
};
