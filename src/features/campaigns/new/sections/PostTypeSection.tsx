'use client';

import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/shadcn/collapsible';
import { FieldError, FieldLabel, FieldSet } from '@/ui/shadcn/field';
import { RadioGroup, RadioGroupItem } from '@/ui/shadcn/radio-group';
import { ChevronDown, ChevronRight, Image, Images, Video } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
  const { control } = useFormContext<CampaignFormData>();
  const [isOpen, setIsOpen] = useState(true);

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
            <Controller
              name="postType"
              control={control}
              render={({ field, fieldState }) => (
                <FieldSet>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-1 gap-4 md:grid-cols-3 w-full items-stretch"
                  >
                    {postTypeOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <div key={option.id} className={"flex-1"}>
                          <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                          <FieldLabel
                            htmlFor={option.id}
                            className="block h-full cursor-pointer rounded-lg border bg-transparent p-4 text-gray-400 transition-colors peer-data-[state=checked]:border-blue-300 peer-data-[state=checked]:bg-blue-50 peer-data-[state=checked]:text-blue-600 dark:peer-data-[state=checked]:border-blue-700 dark:peer-data-[state=checked]:bg-blue-950"
                          >
                            <div className="text-center">
                              <IconComponent className="mx-auto mb-2 h-8 w-8" />
                              <h3 className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {option.label}
                              </h3>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {option.description}
                              </p>
                            </div>
                          </FieldLabel>
                        </div>
                      );
                    })}
                  </RadioGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldSet>
              )}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
