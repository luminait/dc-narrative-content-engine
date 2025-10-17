
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/shadcn/collapsible';
import { Label } from '@/ui/shadcn/label';
import { Checkbox } from '@/ui/shadcn/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/shadcn/select';
import { Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import type { Cadence } from '../campaign.schema';

interface ScheduleSectionProps {
  cadence: Cadence;
  setCadence: React.Dispatch<React.SetStateAction<Cadence>>;
}

const daysOptions = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

export default function ScheduleSection({ cadence, setCadence }: ScheduleSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDayToggle = (dayId: string, checked: boolean) => {
    if (checked) {
      setCadence((prev) => ({ ...prev, daysOfWeek: [...prev.daysOfWeek, dayId] }));
    } else {
      setCadence((prev) => ({
        ...prev,
        daysOfWeek: prev.daysOfWeek.filter((d) => d !== dayId),
      }));
    }
  };

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
          <CardContent className="space-y-4">
            <div>
              <Label>Days of the Week *</Label>
              <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
                {daysOptions.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.id}
                      checked={cadence.daysOfWeek.includes(day.id)}
                      onCheckedChange={(checked) => handleDayToggle(day.id, checked as boolean)}
                    />
                    <Label htmlFor={day.id} className="text-sm font-normal">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Frequency</Label>
              <Select
                value={cadence.frequency}
                onValueChange={(value: 'weekly' | 'bi-weekly') =>
                  setCadence((prev) => ({ ...prev, frequency: value }))
                }
              >
                <SelectTrigger className="mt-1 max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {cadence.daysOfWeek.length > 0 && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <strong>Schedule Preview:</strong> Posts will be published{' '}
                {cadence.daysOfWeek.length === 7
                  ? 'daily'
                  : `on ${cadence.daysOfWeek.join(', ')}`}{' '}
                {cadence.frequency === 'bi-weekly' ? 'every two weeks' : 'every week'}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
