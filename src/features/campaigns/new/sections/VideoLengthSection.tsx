'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/shadcn/collapsible';
import { Video, ChevronDown, ChevronRight } from 'lucide-react';
import {
  Field,
  FieldControl,
  FieldError,
  FieldSet
} from '@/ui/shadcn/field'; // Assuming new components are here
import type { CampaignFormData } from '../../campaign.schema';

const videoLengthOptions = [
  { value: 30, label: '30 seconds', description: 'Short, quick content' },
  { value: 45, label: '45 seconds', description: 'Medium-length content' },
  { value: 60, label: '60 seconds', description: 'Longer, detailed content' },
];

export default function VideoLengthSection() {
  const [isOpen, setIsOpen] = useState(true);

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
          <CardContent className="pt-4">
            <FieldSet name="videoLength">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {videoLengthOptions.map((option) => (
                  <Field
                    key={option.value}
                    name="videoLength"
                    type="radio"
                    value={option.value}
                    className={`cursor-pointer rounded-lg border p-4 transition-colors data-[state=checked]:border-blue-300 data-[state=checked]:bg-blue-50 dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-950`}
                  >
                    <FieldControl>
                      <div className="text-center">
                        <h3 className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {option.label}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{option.description}</p>
                      </div>
                    </FieldControl>
                  </Field>
                ))}
              </div>
              <FieldError />
            </FieldSet>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
