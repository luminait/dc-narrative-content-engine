'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/shadcn/collapsible';
import { Checkbox } from '@/ui/shadcn/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/shadcn/select';
import {
  Field, 
  FieldContent, 
  FieldLabel, 
  FieldError,
  FieldSet
} from '@/ui/shadcn/field'; // Assuming new components are here
import { Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import type { CampaignFormData } from '../../campaign.schema';

const daysOptions = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
] as const;

export default function ScheduleSection() {
  const { watch } = useFormContext<CampaignFormData>();
  const [isOpen, setIsOpen] = useState(true);
  const selectedDays = watch('cadence.daysOfWeek');
  const frequency = watch('cadence.frequency');

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span>Posting Schedule</span>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CardTitle>
            <CardDescription>Set when and how often your content will be published</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-4">
            <FieldSet name="cadence.daysOfWeek">
              <FieldLabel>Days of the Week *</FieldLabel>
              <div className="grid grid-cols-2 gap-3 pt-2 md:grid-cols-4">
                {daysOptions.map((day) => (
                  <Field title="cadence.daysOfWeek"  defaultValue={day.id} key={day.id}>
                     <FieldContent>
                        <Checkbox />
                     </FieldContent>
                     <FieldLabel className="font-normal">{day.label}</FieldLabel>
                  </Field>
                ))}
              </div>
              <FieldError />
            </FieldSet>

            <Field title="cadence.frequency">
              <FieldLabel>Frequency</FieldLabel>
              <FieldContent>
                <Select>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
              <FieldError />
            </Field>

            {selectedDays.length > 0 && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <strong>Schedule Preview:</strong> Posts will be published{' '}
                {selectedDays.length === 7 ? 'daily' : `on ${selectedDays.join(', ')}`}{' '}
                {frequency === 'bi-weekly' ? 'every two weeks' : 'every week'}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
