'use server';

import { shotstackService, ShotstackTemplate } from '../shotstack/shotstack.service';

export interface GetShotstackTemplatesResult {
    success: boolean;
    templates?: ShotstackTemplate[];
    error?: string;
}

export async function getShotstackTemplatesAction(): Promise<GetShotstackTemplatesResult> {
    try {
        const templates = await shotstackService.getTemplates();
        return { success: true, templates };
    } catch (error) {
        console.error('Error fetching Shotstack templates:', error);
        return { success: false, error: 'Failed to fetch templates' };
    }
}

export interface GetShotstackTemplateResult {
    success: boolean;
    template?: ShotstackTemplate;
    error?: string;
}

export async function getShotstackTemplateAction(id: string): Promise<GetShotstackTemplateResult> {
    try {
        const template = await shotstackService.getTemplate(id);
        if (!template) {
            return { success: false, error: 'Template not found' };
        }
        return { success: true, template };
    } catch (error) {
        console.error(`Error fetching Shotstack template ${id}:`, error);
        return { success: false, error: 'Failed to fetch template details' };
    }
}
