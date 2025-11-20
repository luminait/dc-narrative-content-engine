import { AiGenerationJob, AiMergeFieldConfig } from '../ai/dto';

const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY || process.env.SHOTSTACK_SANDBOX_API_KEY || 'PFUViJEH36JzEWTKAQ0OIkGoOPYCOkCJ5SDhbZfA';
const SHOTSTACK_ENV = process.env.SHOTSTACK_ENV || 'stage';
const SHOTSTACK_API_URL = process.env.SHOTSTACK_API_URL || `https://api.shotstack.io/edit/${SHOTSTACK_ENV}/render`;

interface ShotstackAsset {
    type: 'video' | 'image' | 'title' | 'audio';
    src?: string;
    text?: string;
    style?: string;
    volume?: number;
}

interface ShotstackClip {
    asset: ShotstackAsset;
    start: number;
    length: number;
    fit?: 'cover' | 'contain' | 'crop' | 'none';
    scale?: number;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    effect?: 'zoomIn' | 'zoomOut' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown';
}

interface ShotstackTrack {
    clips: ShotstackClip[];
}

interface ShotstackTimeline {
    soundtrack?: {
        src: string;
        effect?: 'fadeIn' | 'fadeOut' | 'fadeInOut';
        volume?: number;
    };
    background?: string;
    tracks: ShotstackTrack[];
}

interface ShotstackOutput {
    format: 'mp4' | 'gif' | 'jpg' | 'png' | 'bmp' | 'mp3';
    resolution: 'sd' | 'hd' | 'fhd' | '4k';
    aspectRatio?: '16:9' | '9:16' | '1:1' | '4:5';
}

interface ShotstackEdit {
    timeline: ShotstackTimeline;
    output: ShotstackOutput;
}

import { prisma } from '@/src/server/db';
import { WebhookSettings } from '@/src/lib/zod/settings.schema';

// ... (previous interfaces remain unchanged)

export class ShotstackService {

    private async getConfig(): Promise<{ apiKey: string; apiUrl: string }> {
        // Fetch settings from DB
        const settingsRecord = await prisma.appSettings.findUnique({
            where: { key: 'webhook_settings' },
        });

        const settings = settingsRecord?.value as WebhookSettings | undefined;
        const env = settings?.shotstackEnvironment || 'sandbox';

        let apiKey: string;
        let apiUrl: string;

        if (env === 'production') {
            apiKey = process.env.SHOTSTACK_PRODUCTION_API_KEY || '';
            apiUrl = 'https://api.shotstack.io/edit/v1/render';
        } else {
            apiKey = process.env.SHOTSTACK_SANDBOX_API_KEY || 'PFUViJEH36JzEWTKAQ0OIkGoOPYCOkCJ5SDhbZfA';
            apiUrl = 'https://api.shotstack.io/edit/stage/render';
        }

        return { apiKey, apiUrl };
    }

    private mapJobToTimeline(job: AiGenerationJob): ShotstackTimeline {
        // ... (implementation remains same)
        const tracks: ShotstackTrack[] = [];
        const visualClips: ShotstackClip[] = [];
        const audioClips: ShotstackClip[] = []; // For voiceovers if we want them as tracks
        let soundtrack: ShotstackTimeline['soundtrack'] | undefined;

        let currentTime = 0;
        const defaultClipLength = 5;

        // Sort merge fields by start time if available, otherwise preserve order
        const sortedFields = [...(job.mergeFields || [])].sort((a, b) => {
            const startA = typeof a.timing?.start === 'number' ? a.timing.start : Infinity;
            const startB = typeof b.timing?.start === 'number' ? b.timing.start : Infinity;
            return startA - startB;
        });

        for (const field of sortedFields) {
            // Determine start time and length
            const startTime = typeof field.timing?.start === 'number' ? field.timing.start : currentTime;
            const length = field.timing?.length || defaultClipLength;

            if (field.mediaValueType === 'audio_music' || field.mergeFieldType === 'music') {
                if (field.resolvedAssetUrl) {
                    soundtrack = {
                        src: field.resolvedAssetUrl,
                        effect: 'fadeInOut',
                        volume: 0.5,
                    };
                }
                continue;
            }

            if (field.mediaValueType === 'audio_voice' || field.mergeFieldType === 'voiceover' || field.mediaValueType === 'gen_ai_voice') {
                // TODO: Handle voiceover tracks specifically if needed. 
                // For now, we can add them to a separate audio track or just ignore if not supported by simple logic
                continue;
            }

            // Visual Assets
            let asset: ShotstackAsset | undefined;

            if (field.resolvedAssetUrl) {
                if (['image', 'gen_ai_image', 'image_or_video'].includes(field.mediaValueType)) {
                    asset = { type: 'image', src: field.resolvedAssetUrl };
                } else if (['video', 'gen_ai_video'].includes(field.mediaValueType)) {
                    asset = { type: 'video', src: field.resolvedAssetUrl };
                }
            } else if (field.value) {
                // Text fallback if no asset URL but has text value
                if (field.mediaValueType === 'text' || field.mediaValueType === 'gen_ai_text') {
                    asset = { type: 'title', text: field.value, style: 'minimal' };
                }
            }

            if (asset) {
                visualClips.push({
                    asset,
                    start: startTime,
                    length: length,
                    fit: 'cover',
                    effect: 'zoomIn' // Add some movement by default
                });

                // Advance current time if we are in auto-sequencing mode (start was not explicit)
                if (typeof field.timing?.start !== 'number') {
                    currentTime += length;
                } else {
                    // If explicit start, ensure currentTime is at least past this clip for next auto items
                    currentTime = Math.max(currentTime, startTime + length);
                }
            }
        }

        tracks.push({ clips: visualClips });

        return {
            soundtrack,
            tracks,
        };
    }

    async renderVideo(job: AiGenerationJob): Promise<{ id: string; message: string }> {
        const { apiKey, apiUrl } = await this.getConfig();
        const timeline = this.mapJobToTimeline(job);

        const edit: ShotstackEdit = {
            timeline,
            output: {
                format: 'mp4',
                resolution: 'hd',
                aspectRatio: '9:16', // Default to vertical for social
            },
        };

        console.log('Sending payload to Shotstack:', JSON.stringify(edit, null, 2));

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'x-api-key': apiKey,
            },
            body: JSON.stringify(edit),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Shotstack API Error: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        const data = await response.json();
        return data.response;
    }

    async getRenderStatus(renderId: string): Promise<any> {
        const { apiKey, apiUrl } = await this.getConfig();
        const response = await fetch(`${apiUrl}/${renderId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'x-api-key': apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Shotstack API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;
    }

    async getTemplates(): Promise<ShotstackTemplate[]> {
        const { apiKey, apiUrl } = await this.getConfig();

        // Note: The templates endpoint is on the base API URL, not the render URL
        // We need to strip '/render' or '/edit/stage/render' to get to the base
        // Based on docs: GET https://api.shotstack.io/{env}/templates

        // Construct the templates URL based on the current API URL
        // If apiUrl is https://api.shotstack.io/edit/stage/render, we want https://api.shotstack.io/edit/stage/templates
        const baseUrl = apiUrl.replace('/render', '');
        const templatesUrl = `${baseUrl}/templates`;

        const response = await fetch(templatesUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'x-api-key': apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Shotstack API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        // API returns { success: true, message: 'OK', response: { templates: [...] } }
        const templates = data.response?.templates || [];

        return templates.map((t: any) => ({
            id: t.id,
            name: t.name,
            isDirectory: false, // API doesn't seem to return this in the list
            createdAt: t.created,
            updatedAt: t.updated,
        }));
    }

    async getTemplate(id: string): Promise<ShotstackTemplate | null> {
        const { apiKey, apiUrl } = await this.getConfig();
        const baseUrl = apiUrl.replace('/render', '');
        const templateUrl = `${baseUrl}/templates/${id}`;

        const response = await fetch(templateUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'x-api-key': apiKey,
            },
        });

        if (!response.ok) {
            console.error(`Failed to fetch template ${id}: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        const template = data.response;

        return {
            id: template.id,
            name: template.name,
            isDirectory: false,
            createdAt: template.created,
            updatedAt: template.updated,
            template: template.template,
        };
    }
}

export interface ShotstackTemplate {
    id: string;
    name: string;
    isDirectory: boolean;
    createdAt: string;
    updatedAt: string;
    template?: any; // The raw template JSON
}

export interface ShotstackTemplateMergeField {
    find: string;
    replace: string;
}

export const shotstackService = new ShotstackService();
