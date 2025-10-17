'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/shadcn/collapsible';
import { Video, ChevronDown, ChevronRight } from 'lucide-react';

interface VideoLengthSectionProps {
  videoLength: 30 | 45 | 60;
  setVideoLength: React.Dispatch<React.SetStateAction<30 | 45 | 60>>;
}

const videoLengthOptions = [
  { value: 30, label: '30 seconds', description: 'Short, quick content' },
  { value: 45, label: '45 seconds', description: 'Medium-length content' },
  { value: 60, label: '60 seconds', description: 'Longer, detailed content' },
];

export default function VideoLengthSection({ videoLength, setVideoLength }: VideoLengthSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Video className="h-5 w-5 text-red-600" />
                <span>Video Length</span>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CardTitle>
            <CardDescription>Choose the duration for your video content</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {videoLengthOptions.map((option) => (
                <div
                  key={option.value}
                  className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                    videoLength === option.value
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                  }`}
                  onClick={() => setVideoLength(option.value as 30 | 45 | 60)}
                >
                  <div className="text-center">
                    <h3 className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {option.label}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
