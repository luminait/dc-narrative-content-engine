'use client';

import { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ExternalLink, Save } from 'lucide-react';
import { Button } from '@/ui/shadcn/button';
import { Card, CardContent } from '@/ui/shadcn/card';
import { Input } from '@/ui/shadcn/input';
import { Label } from '@/ui/shadcn/label';
import { RadioGroup, RadioGroupItem } from '@/ui/shadcn/radio-group';
import { settingsAction } from '@/src/server/actions/settings.actions';
import { settingsSchema, type WebhookSettings, } from '@/src/lib/zod/settings.schema';

interface SettingsClientProps {
  initialSettings: WebhookSettings;
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, watch, formState, reset } = useForm<WebhookSettings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      ...initialSettings,
      shotstackEnvironment: initialSettings.shotstackEnvironment || 'sandbox',
    },
    mode: 'onChange',
  });

  const testingUrl = watch('testingUrl');
  const productionUrl = watch('productionUrl');

  const onSubmit = (values: WebhookSettings) => {
    startTransition(async () => {
      const result = await settingsAction(values);

      if (result.success) {
        toast.success('Settings saved successfully');
        // Reset the form's dirty state by updating default values to the saved values
        reset(values, { keepValues: true });
      } else {
        toast.error(result.error || 'Failed to save settings');
      }
    });
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Environment Selection */}
          <div className="space-y-4">
            <Label>Active Environment</Label>
            <Controller
              name="environment"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="testing" id="testing" />
                    <Label htmlFor="testing" className="cursor-pointer font-normal">
                      Testing Environment
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="production" id="production" />
                    <Label htmlFor="production" className="cursor-pointer font-normal">
                      Production Environment
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          {/* Testing Webhook URL */}
          <div className="space-y-2">
            <Label htmlFor="testingUrl">Testing Webhook URL</Label>
            <Controller
              name="testingUrl"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <div className="flex space-x-2">
                    <Input
                      {...field}
                      id="testingUrl"
                      placeholder="https://luminait.app.n8n.cloud/webhook-test/..."
                      onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                      className={fieldState.error ? 'border-red-500' : ''}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(testingUrl, '_blank')}
                      disabled={!isValidUrl(testingUrl)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  {fieldState.error && (
                    <p className="text-sm text-red-600">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>

          {/* Production Webhook URL */}
          <div className="space-y-2">
            <Label htmlFor="productionUrl">Production Webhook URL</Label>
            <Controller
              name="productionUrl"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <div className="flex space-x-2">
                    <Input
                      {...field}
                      id="productionUrl"
                      placeholder="https://luminait.app.n8n.cloud/webhook/..."
                      onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                      className={fieldState.error ? 'border-red-500' : ''}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(productionUrl, '_blank')}
                      disabled={!isValidUrl(productionUrl)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  {fieldState.error && (
                    <p className="text-sm text-red-600">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <Label>Shotstack Configuration</Label>
            <p className="text-sm text-muted-foreground">
              Select which Shotstack environment to use for video generation.
            </p>
            <Controller
              name="shotstackEnvironment"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sandbox" id="shotstack-sandbox" />
                    <Label htmlFor="shotstack-sandbox" className="cursor-pointer font-normal">
                      Sandbox (Testing)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="production" id="shotstack-production" />
                    <Label htmlFor="shotstack-production" className="cursor-pointer font-normal">
                      Production (Live)
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          disabled={!formState.isDirty || isPending}
          className="flex items-center space-x-2"
        >
          {isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </>
          )}
        </Button>
      </div>
    </form >
  );
}
