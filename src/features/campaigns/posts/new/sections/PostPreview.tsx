'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { Eye } from 'lucide-react';
import type { GeneratedContent } from '@/src/lib/zod/postForm.schema';

interface PostPreviewProps {
    content: GeneratedContent;
}

export default function PostPreview({ content }: PostPreviewProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>Preview</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg">{content.title}</h3>
                    </div>
                    <div>
                        <p className="text-gray-700 whitespace-pre-wrap">{content.content}</p>
                    </div>
                    {content.hashtags && content.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {content.hashtags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="text-blue-600 text-sm"
                                >
                  #{tag}
                </span>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
