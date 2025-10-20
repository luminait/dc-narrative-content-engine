import { getCampaignsWithCounts } from '@/src/server/queries/campaigns.queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Badge } from '@/ui/shadcn/badge';
import { CheckCircle, XCircle, Database, Users, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TestCampaignsPage() {
    let campaigns;
    let error: string | null = null;
    let fetchTime: number = 0;

    const startTime = Date.now();

    try {
        campaigns = await getCampaignsWithCounts();
        fetchTime = Date.now() - startTime;
    } catch (err) {
        error = err instanceof Error ? err.message : 'Unknown error occurred';
        fetchTime = Date.now() - startTime;
    }

    return (
        <div className="container mx-auto py-8">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">Campaign Data Test Page</h1>
                    <p className="text-muted-foreground">
                        Testing server-side campaign data fetching from Prisma/Database
                    </p>
                </div>

                {/* Status Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {error ? (
                                <>
                                    <XCircle className="h-5 w-5 text-destructive" />
                                    Connection Failed
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    Connection Successful
                                </>
                            )}
                        </CardTitle>
                        <CardDescription>
                            Fetch completed in {fetchTime}ms
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                <span className="text-sm font-medium">Database Status:</span>
                                <Badge variant={error ? 'destructive' : 'default'}>
                                    {error ? 'Error' : 'Connected'}
                                </Badge>
                            </div>

                            {!error && campaigns && (
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span className="text-sm font-medium">Campaigns Found:</span>
                                    <Badge variant="secondary">{campaigns.length}</Badge>
                                </div>
                            )}

                            {error && (
                                <div className="mt-4 p-4 bg-destructive/10 rounded-md">
                                    <p className="text-sm text-destructive font-mono">{error}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Campaign List */}
                {!error && campaigns && campaigns.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Campaigns Data</h2>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {campaigns.map((campaign) => (
                                <Card key={campaign.id}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{campaign.title}</CardTitle>
                                        <CardDescription>
                                            {campaign.campaignObjective || 'No description'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">ID:</span>
                                                <span className="font-mono text-xs">{campaign.id.slice(0, 8)}...</span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Personas:</span>
                                                <Badge variant="outline">{campaign.personaCount}</Badge>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Characters:</span>
                                                <Badge variant="outline">{campaign.characterCount}</Badge>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Created:</span>
                                                <span className="text-xs flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                                                    {campaign.createdAt?.toLocaleDateString()}
                        </span>
                                            </div>

                                            {campaign.postType && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Post Type:</span>
                                                    <Badge>{campaign.postType}</Badge>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!error && campaigns && campaigns.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Campaigns Found</h3>
                            <p className="text-sm text-muted-foreground">
                                The database connection is working, but no campaigns exist yet.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Raw JSON Data (for debugging) */}
                {!error && campaigns && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Raw JSON Response</CardTitle>
                            <CardDescription>
                                For debugging purposes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-xs">
                {JSON.stringify(campaigns, null, 2)}
              </pre>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
