'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/shadcn/collapsible';
import { Image, Images, Video, ChevronDown, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface PostTypeSectionProps {
  postType: 'image' | 'carousel' | 'video';
  setPostType: React.Dispatch<React.SetStateAction<'image' | 'carousel' | 'video'>>;
}

interface PostTypeOption {
  id: 'image' | 'carousel' | 'video';
  icon: LucideIcon;
  label: string;
  description: string;
}

const postTypeOptions: PostTypeOption[] = [
  { id: 'image', icon: Image, label: 'Single Image', description: 'Single photo posts' },
  { id: 'carousel', icon: Images, label: 'Image Carousel', description: 'Multiple image slides' },
  { id: 'video', icon: Video, label: 'Video', description: 'Video content' },
];

export default function PostTypeSection({ postType, setPostType }: PostTypeSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

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
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {postTypeOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <div
                    key={option.id}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                      postType === option.id
                        ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                    }`}
                    onClick={() => setPostType(option.id)}
                  >
                    <div className="text-center">
                      <IconComponent
                        className={`mx-auto mb-2 h-8 w-8 ${
                          postType === option.id ? 'text-blue-600' : 'text-gray-400'
                        }`}
                      />
                      <h3 className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {option.label}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{option.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
