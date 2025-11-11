import { Suspense } from 'react';
import { getWebhookSettings } from '@/src/server/queries/settings.queries';
import SettingsClient from '@/src/features/settings/SettingsClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Settings as SettingsIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const webhookSettings = await getWebhookSettings();

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <SettingsIcon className="w-5 h-5" />
                        <span>Application Settings</span>
                    </CardTitle>
                    <CardDescription>
                        Configure webhook endpoints and other application settings
                    </CardDescription>
                </CardHeader>
            </Card>

            <Suspense fallback={<SettingsLoadingSkeleton />}>
                <SettingsClient initialSettings={webhookSettings} />
            </Suspense>
        </div>
    );
}

function SettingsLoadingSkeleton() {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-10 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-10 bg-gray-200 rounded" />
                </div>
            </CardContent>
        </Card>
    );
}
