'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Input } from '@/ui/shadcn/input';
import { Textarea } from '@/ui/shadcn/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/shadcn/select';
import {
  Field, 
  FieldContent,
  FieldLabel, 
  FieldError
} from '@/ui/shadcn/field'; // Assuming new components are here
import { Target } from 'lucide-react';
import type { CampaignFormData } from '@/src/features/campaigns/campaign.schema';

const postLengthOptions = [
  { value: 'short', label: 'Short (50-100 words)' },
  { value: 'medium', label: 'Medium (100-200 words)' },
  { value: 'long', label: 'Long (200+ words)' },
];

export default function CampaignDetails() {
  const { control } = useFormContext<CampaignFormData>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-600" />
          <span>Campaign Details</span>
        </CardTitle>
        <CardDescription>Define the core objective and messaging for your campaign</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field title="title">
          <FieldLabel>Campaign Title *</FieldLabel>
          <FieldContent>
            <Input placeholder="e.g., Holiday Pokémon Card Collection Showcase" />
          </FieldContent>
          <FieldError />
        </Field>

        <Field title="objective">
          <FieldLabel>Campaign Objective *</FieldLabel>
          <FieldContent>
            <Textarea
              placeholder="What do you want to achieve with this campaign?"
              rows={3}
            />
          </FieldContent>
          <FieldError />
        </Field>

        <Field title="narrativeContext">
          <FieldLabel>Narrative Context (Optional)</FieldLabel>
          <FieldContent>
            <Textarea
              placeholder="Additional context or storytelling elements"
              rows={2}
            />
          </FieldContent>
          <FieldError />
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field title="postLength">
            <FieldLabel>Post Length *</FieldLabel>
            <FieldContent>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select post length" />
                </SelectTrigger>
                <SelectContent>
                  {postLengthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
            <FieldError />
          </Field>

          <Field title="startDate">
            <FieldLabel>Start Date (Optional)</FieldLabel>
            <FieldContent>
              <Input type="date" />
            </FieldContent>
            <FieldError />
          </Field>

          <Field title="endDate">
            <FieldLabel>End Date (Optional)</FieldLabel>
            <FieldContent>
              <Input type="date" />
            </FieldContent>
            <FieldError />
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}
