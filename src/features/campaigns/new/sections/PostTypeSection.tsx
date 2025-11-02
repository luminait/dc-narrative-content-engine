'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/shadcn/collapsible';
import { Image, Images, Video, ChevronDown, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Field,
  FieldControl,
  FieldError,
  FieldSet
} from '@/ui/shadcn/field'; // Assuming new components are here
import type { CampaignFormData } from '../../campaign.schema';

interface PostTypeOption {
  id: 'single_image' | 'carousel' | 'video';
  icon: LucideIcon;
  label: string;
  description: string;
}

const postTypeOptions: PostTypeOption[] = [
  { id: 'single_image', icon: Image, label: 'Single Image', description: 'Single photo posts' },
  { id: 'carousel', icon: Images, label: 'Image Carousel', description: 'Multiple image slides' },
  { id: 'video', icon: Video, label: 'Video', description: 'Video content' },
];

export default function PostTypeSection() {
  const { watch } = useFormContext<CampaignFormData>();
  const [isOpen, setIsOpen] = useState(true);
  const postType = watch('postType');

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Image className="h-5 w-5 text-pink-600" />
                <span>Post Type</span>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CardTitle>
            <CardDescription>Choose the format for your social media posts</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-4">
            <FieldSet name="postType">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {postTypeOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <Field
                      key={option.id}
                      name="postType"
                      type="radio"
                      value={option.id}
                      className={`cursor-pointer rounded-lg border p-4 transition-colors data-[state=checked]:border-blue-300 data-[state=checked]:bg-blue-50 dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-950`}
                    >
                      <FieldControl>
                        <div className="text-center">
                          <IconComponent
                            className={`mx-auto mb-2 h-8 w-8 data-[state=checked]:text-blue-600 text-gray-400`}
                          />
                          <h3 className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {option.label}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{option.description}</p>
                        </div>
                      </FieldControl>
                    </Field>
                  );
                })}
              </div>
              <FieldError />
            </FieldSet>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
