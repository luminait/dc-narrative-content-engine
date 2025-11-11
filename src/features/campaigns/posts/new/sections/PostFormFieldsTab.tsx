'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/ui/shadcn/input';
import { Textarea } from '@/ui/shadcn/textarea';
import { Label } from '@/ui/shadcn/label';
import type { CampaignData } from '@/src/lib/zod/campaign.schema';
import type { PostFormData } from '@/src/lib/zod/postForm.schema';

interface PostFormFieldsProps {
    campaign: CampaignData;
}

export default function PostFormFieldsTab( { campaign }: PostFormFieldsProps) {
    const { register, formState: { errors } } = useFormContext<PostFormData>();

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    {...register('title')}
                    placeholder="Enter post title"
                />
                {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
            </div>

            <div>
                <Label htmlFor="customInstructions">Custom Instructions (Optional)</Label>
                <Textarea
                    id="customInstructions"
                    {...register('customInstructions')}
                    placeholder="Add specific instructions for this post (e.g., 'Focus on rare card highlights', 'Include pricing information', etc.)"
                    rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                    These instructions will guide the AI when generating content for this specific post
                </p>
                {errors.customInstructions && (
                    <p className="text-sm text-red-600 mt-1">{errors.customInstructions.message}</p>
                )}
            </div>

            <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                    id="content"
                    {...register('content')}
                    placeholder="Enter post content"
                    rows={8}
                />
                {errors.content && (
                    <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
                )}
            </div>

            <div>
                <Label htmlFor="hashtags">Hashtags</Label>
                <Input
                    id="hashtags"
                    placeholder="#Pokemon #TradingCards"
                />
                <p className="text-sm text-gray-500 mt-1">
                    Separate hashtags with commas
                </p>
            </div>
        </div>
    );
}
