
import { z } from 'zod';

export const cadenceSchema = z.object({
  daysOfWeek: z.array(z.string()).min(1, 'Select at least one day'),
  frequency: z.enum(['weekly', 'bi-weekly']),
});

export const mergeFieldSchema = z.object({
  id: z.string(),
  mergeField: z.string().min(1),
  description: z.string().optional(),
  valueType: z.string(),
  value: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  length: z.string().optional(),
});

export const campaignFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  objective: z.string().min(1, 'Objective is required'),
  narrativeContext: z.string().optional(),
  postLength: z.string().min(1, 'Post length is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  cadence: cadenceSchema,
  postType: z.enum(['image', 'carousel', 'video']),
  videoLength: z.union([z.literal(30), z.literal(45), z.literal(60)]).optional(),
  personas: z.array(z.string()).min(1, 'Select at least one persona'),
  characters: z.array(z.string()).min(1, 'Select at least one character'),
  mergeFields: z.array(mergeFieldSchema).optional(),
});

export type CampaignFormData = z.infer<typeof campaignFormSchema>;
export type Cadence = z.infer<typeof cadenceSchema>;
export type MergeField = z.infer<typeof mergeFieldSchema>;
