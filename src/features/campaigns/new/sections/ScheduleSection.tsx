'use client';

import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/shadcn/collapsible';
import { Checkbox } from '@/ui/shadcn/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/shadcn/select';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/ui/shadcn/field';
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
  const { control, watch } = useFormContext<CampaignFormData>();
  const [isOpen, setIsOpen] = useState(true);

  const selectedDays = watch('cadence.daysOfWeek');
  const frequency = watch('cadence.frequency');

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-slate-900/50">
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
          <CardContent className="space-y-6 pt-6">
            <Controller
              name="cadence.daysOfWeek"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Days of the Week *</FieldLabel>
                  <FieldGroup className="grid grid-cols-2 gap-4 pt-2 md:grid-cols-4">
                    {daysOptions.map((day) => (
                      <Field key={day.id} orientation="horizontal">
                        <Checkbox
                          id={`day-${day.id}`}
                          aria-invalid={fieldState.invalid}
                          checked={field.value.includes(day.id)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...field.value, day.id]
                              : field.value.filter((value) => value !== day.id);
                            field.onChange(newValue);
                          }}
                        />
                        <FieldLabel htmlFor={`day-${day.id}`} className="font-normal">
                          {day.label}
                        </FieldLabel>
                      </Field>
                    ))}
                  </FieldGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="cadence.frequency"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Frequency</FieldLabel>
                  <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid} className="max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {selectedDays?.length > 0 && (
              <div className="mt-4 text-sm text-slate-500">
                <strong>Schedule Preview:</strong> Posts will be published{' '}
                {selectedDays.length === 7 ? 'daily' : `on ${selectedDays.join(', ')}`}{' '}
                {frequency === 'bi-weekly' ? 'every two weeks' : 'every week'}.
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
