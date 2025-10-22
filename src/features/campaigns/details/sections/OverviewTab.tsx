import React from 'react';
import { Users, Target, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Badge } from '@/ui/shadcn/badge';
import { Skeleton } from '@/ui/shadcn/skeleton';
import { Alert, AlertDescription } from '@/ui/shadcn/alert';
import  { CampaignWithStatus, Post, PostImage, Character } from "@/src/lib/types/ui";
import { getStatusColor } from '@/ui/src/utils';
import { filterPostsByStatus } from "@/src/lib/utils/posts";
import { CampaignData } from "@/src/features/campaigns/campaign.schema";

interface OverviewTabProps {
    campaign: CampaignData;
    posts: Post[];
    campaignCharacters: Character[];
    campaignPersonas: any[];
    charactersLoading: boolean;
    personasLoading: boolean;
    charactersError: string | null;
    personasError: string | null;
}

export function OverviewTab({
                                campaign,
                                posts,
                                campaignCharacters,
                                campaignPersonas,
                                charactersLoading,
                                personasLoading,
                                charactersError,
                                personasError
                            }: OverviewTabProps) {
    const { published: publishedPosts, scheduled: scheduledPosts, draft: draftPosts } = filterPostsByStatus(posts);

    return (
        <div className="space-y-6">
            {/* Campaign Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm">Total Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl">{posts.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {publishedPosts.length} published, {scheduledPosts.length} scheduled, {draftPosts.length} drafts
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm">Characters</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl">{charactersLoading ? '-' : campaignCharacters.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Featured in campaign
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm">Personas</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl">{personasLoading ? '-' : campaignPersonas.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Target audiences
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Campaign Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Characters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Characters</CardTitle>
                        <CardDescription>Characters featured in this campaign</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {charactersLoading ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-4 w-full" />
                                ))}
                            </div>
                        ) : charactersError ? (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{charactersError}</AlertDescription>
                            </Alert>
                        ) : campaignCharacters.length > 0 ? (
                            <div className="space-y-2">
                                {campaignCharacters.map((character, index) => (
                                    <div key={character.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{character.name}</span>
                                                <Badge variant="outline">
                                                    {character.characterTypes || character.isTrainer || 'Unknown'}
                                                </Badge>
                                            </div>
                                            {character.personality && (
                                                <p className="text-sm text-gray-600 mt-1">{character.personality}</p>
                                            )}
                                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                                {character.isHuman && (
                                                    <Badge variant="outline" className="text-xs">Human</Badge>
                                                )}
                                                {character.isTrainer && (
                                                    <Badge variant="outline" className="text-xs">Trainer</Badge>
                                                )}
                                                {character.moralAlignment && (
                                                    <span>Alignment: {character.moralAlignment}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No characters assigned to this campaign.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Personas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personas</CardTitle>
                        <CardDescription>Target audience personas for this campaign</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {personasLoading ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-4 w-full" />
                                ))}
                            </div>
                        ) : personasError ? (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{personasError}</AlertDescription>
                            </Alert>
                        ) : campaignPersonas.length > 0 ? (
                            <div className="space-y-2">
                                {campaignPersonas.map((persona, index) => (
                                    <div key={persona.key || persona.persona_key || index} className="p-3 bg-gray-50 rounded">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium">{persona.label || persona.persona_label}</span>
                                            <Badge variant="outline">{persona.key || persona.persona_key}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">{persona.description || persona.persona_description}</p>
                                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-2">
                                            <span>Key: {persona.key || persona.persona_key}</span>
                                            {persona.created_at && (
                                                <span>Created: {new Date(persona.createdAt).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No personas assigned to this campaign.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Post Cadence */}
            <Card>
                <CardHeader>
                    <CardTitle>Posting Schedule</CardTitle>
                    <CardDescription>When and how often posts are published</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm text-gray-600">Days of Week</label>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {campaign.cadence.daysOfWeek.map((day) => (
                                    <Badge key={day} variant="outline" className="text-xs">
                                        {day.charAt(0).toUpperCase() + day.slice(1)}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Frequency</label>
                            <p className="text-sm mt-1 capitalize">{campaign.cadence.frequency}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600">Post Type</label>
                            <p className="text-sm mt-1 capitalize">{campaign.postType}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
