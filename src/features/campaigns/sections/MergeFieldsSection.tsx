'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/shadcn/collapsible';
import { Button } from '@/ui/shadcn/button';
import { Input } from '@/ui/shadcn/input';
import { Label } from '@/ui/shadcn/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/shadcn/select';
import { FileText, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import type { MergeField } from '../campaign.schema';

interface MergeFieldsSectionProps {
  mergeFields: MergeField[];
  setMergeFields: React.Dispatch<React.SetStateAction<MergeField[]>>;
  valueTypes: string[];
}

export default function MergeFieldsSection({
  mergeFields,
  setMergeFields,
  valueTypes,
}: MergeFieldsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const addField = () => {
    const newField: MergeField = {
      id: `field-${Date.now()}`,
      mergeField: '',
      description: '',
      valueType: valueTypes[0] || 'text',
      value: '',
      startTime: '0',
      endTime: '5',
    };
    setMergeFields((prev) => [...prev, newField]);
  };

  const removeField = (id: string) => {
    setMergeFields((prev) => prev.filter((field) => field.id !== id));
  };

  const updateField = (id: string, updates: Partial<MergeField>) => {
    setMergeFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...updates } : field))
    );
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                <span>Merge Fields</span>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CardTitle>
            <CardDescription>Define dynamic content fields for your video posts</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <Button type="button" variant="outline" onClick={addField} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Field</span>
            </Button>

            {mergeFields.length > 0 && (
              <div className="space-y-3">
                {mergeFields.map((field, index) => (
                  <div key={field.id} className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Field #{index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(field.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <Label htmlFor={`merge-field-${field.id}`} className="text-xs">
                          Merge Field Name
                        </Label>
                        <Input
                          id={`merge-field-${field.id}`}
                          value={field.mergeField}
                          onChange={(e) => updateField(field.id, { mergeField: e.target.value })}
                          placeholder="e.g., character_name"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`value-type-${field.id}`} className="text-xs">
                          Value Type
                        </Label>
                        <Select
                          value={field.valueType}
                          onValueChange={(value) => updateField(field.id, { valueType: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {valueTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`value-${field.id}`} className="text-xs">
                          Value
                        </Label>
                        <Input
                          id={`value-${field.id}`}
                          value={field.value}
                          onChange={(e) => updateField(field.id, { value: e.target.value })}
                          placeholder="Field value"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`start-time-${field.id}`} className="text-xs">
                          Start Time (seconds)
                        </Label>
                        <Input
                          id={`start-time-${field.id}`}
                          type="number"
                          step="0.1"
                          value={field.startTime}
                          onChange={(e) => updateField(field.id, { startTime: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
