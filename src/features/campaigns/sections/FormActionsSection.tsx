'use client';

import { Button } from '@/ui/shadcn/button';
import { Loader2, Zap } from 'lucide-react';

interface FormActionsSectionProps {
  isValid: boolean;
  isPending: boolean;
  onCancel: () => void;
}

export default function FormActionsSection({ isValid, isPending, onCancel }: FormActionsSectionProps) {
  return (
    <div className="flex flex-col items-start justify-between space-y-4 border-t pt-6 sm:flex-row sm:items-center sm:space-y-0">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
        Cancel
      </Button>
      <Button type="submit" disabled={!isValid || isPending} className="flex items-center space-x-2">
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Creating Campaign...</span>
          </>
        ) : (
          <>
            <Zap className="h-4 w-4" />
            <span>Create Campaign</span>
          </>
        )}
      </Button>
    </div>
  );
}
