'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/ui/shadcn/input';
import { Textarea } from '@/ui/shadcn/textarea';
import { Label } from '@/ui/shadcn/label';
import type { CampaignData } from '@/src/features/campaigns/campaign.schema';
import type { PostFormData } from '@/src/features/campaigns/posts/postForm.schema';

interface PostFormFieldsProps {
    campaign: CampaignData;
}

export default function PostFormFields({ campaign }: PostFormFieldsProps) {
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
