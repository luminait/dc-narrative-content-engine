'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Clock, FileText, Plus } from 'lucide-react';
import { Button } from '@/ui/shadcn/button';
import { Card, CardContent } from '@/ui/shadcn/card';
import { Badge } from '@/ui/shadcn/badge';
import type { Campaign, Post } from '@/src/lib/types/ui';
import { formatDate } from '@/src/lib/utils/utils';
import { getStatusColor } from '@/ui/src/utils';
import { getPostStatusIcon } from '@/packages/ui/src/utils'

interface PostsTabProps {
    campaign: Campaign;
    posts: Post[];
}

export function PostsTab( { campaign, posts }: PostsTabProps ) {
    const router = useRouter();

    const handleCreatePost = () => {
        router.push(`/campaigns/${campaign.id}/posts/new`);
    };

    const handlePostClick = (post: Post) => {
        router.push(`/campaigns/${campaign.id}/posts/${post.id}`);
    };

    return (
        <div className="space-y-4">
            {posts.length > 0 && (
                <div className="flex justify-end">
                    <Button onClick={handleCreatePost} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create Post
                    </Button>
                </div>
            )}
            {posts.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mb-4"/>
                        <h3 className="text-lg mb-2">No posts yet</h3>
                        <p className="text-gray-600 text-center mb-4">
                            Create your first post to get started with this campaign.
                        </p>
                        <Button
                            onClick={handleCreatePost}
                            className="flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4"/>
                            Create First Post
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                posts.map( ( post ) => {
                    return (
                        <Card
                            key={post.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handlePostClick(post)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg">{post.title}</h3>
                                            <div className="flex items-center gap-2">
                                                {getPostStatusIcon( post.status )}
                                                <Badge className={getStatusColor( post.status )}>
                                                    {post.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 line-clamp-2">{post.content}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {post.hashtags?.map( ( tag, tagIndex ) => (
                                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ) )}
                                        </div>
                                        {post.scheduledAt && (
                                            <p className="text-sm text-gray-500">
                                                Scheduled for {formatDate( post.scheduledAt?.toISOString() )}
                                            </p>
                                        )}
                                    </div>
                                    {
                                        post.images.map( ( image, index ) => (
                                            <div
                                                key={index}
                                                className="w-20 h-20 ml-4 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                <img
                                                    src={image.url}
                                                    alt="Post preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))
                                    }
                                </div>
                            </CardContent>
                        </Card>
                    );
                } )
            )}
        </div>
    );
}
