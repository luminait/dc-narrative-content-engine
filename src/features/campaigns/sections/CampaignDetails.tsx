'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Input } from '@/ui/shadcn/input';
import { Label } from '@/ui/shadcn/label';
import { Textarea } from '@/ui/shadcn/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/shadcn/select';
import { Target } from 'lucide-react';

interface FormData {
  title: string;
  objective: string;
  narrativeContext: string;
  postLength: string;
  startDate: string;
  endDate: string;
}

interface CampaignDetailsSectionProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const postLengthOptions = [
  { value: 'short', label: 'Short (50-100 words)' },
  { value: 'medium', label: 'Medium (100-200 words)' },
  { value: 'long', label: 'Long (200+ words)' },
];

export default function CampaignDetails( { formData, setFormData }: CampaignDetailsSectionProps) {
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
        <div>
          <Label htmlFor="title">Campaign Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Holiday Pokémon Card Collection Showcase"
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="objective">Campaign Objective *</Label>
          <Textarea
            id="objective"
            value={formData.objective}
            onChange={(e) => setFormData((prev) => ({ ...prev, objective: e.target.value }))}
            placeholder="What do you want to achieve with this campaign?"
            className="mt-1"
            rows={3}
            required
          />
        </div>

        <div>
          <Label htmlFor="narrativeContext">Narrative Context (Optional)</Label>
          <Textarea
            id="narrativeContext"
            value={formData.narrativeContext}
            onChange={(e) => setFormData((prev) => ({ ...prev, narrativeContext: e.target.value }))}
            placeholder="Additional context or storytelling elements"
            className="mt-1"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="postLength">Post Length *</Label>
            <Select
              value={formData.postLength}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, postLength: value }))}
            >
              <SelectTrigger className="mt-1">
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
          </div>

          <div>
            <Label htmlFor="startDate">Start Date (Optional)</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
              className="mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
