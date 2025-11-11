'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Edit2, Wand2, Zap } from 'lucide-react';
import { Button } from '@/ui/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { createPostAction, generatePostContentAction } from '@/src/server/actions/posts.actions';
import {
    type GeneratedContent,
    type PostFormData,
    postFormSchema
} from '@/src/lib/zod/postForm.schema';
import type { CampaignData } from '@/src/lib/zod/campaign.schema';
import PostPreview from './sections/PostPreview';
import { Separator } from "@/ui/shadcn/separator";
import PostCustomizationDetailsTabSwitcher from './sections/PostCustomizationDetailsTabSwitcher';

interface PostGeneratorClientProps {
    campaign: CampaignData;
}

export default function PostGeneratorClient( { campaign }: PostGeneratorClientProps ) {
    const router = useRouter();
    const [ isPending, startTransition ] = useTransition();
    const [ isGenerating, setIsGenerating ] = useState( false );
    const [ generatedContent, setGeneratedContent ] = useState<GeneratedContent | null>( null );
    const [ isCustomizing, setIsCustomizing ] = useState( false );


    const form = useForm<PostFormData>( {
        resolver: zodResolver( postFormSchema ),
        mode: 'onChange',
        defaultValues: {
            title: '',
            content: '',
            customInstructions: '',
            hashtags: [],
            isDraft: true,
            isActive: false,
            isArchived: false,
            scheduledAt: undefined,
            mergeFieldValues: {},
            images: [],
        },
    } );

    const { handleSubmit, reset } = form;

    const handleGenerate = async () => {
        setIsGenerating( true );
        const result = await generatePostContentAction( campaign.id );

        if ( result.success && result.content ) {
            setGeneratedContent( result.content );
            reset( {
                title: result.content.title,
                content: result.content.content,
                customInstructions: '', // Preserve user's custom instructions
                hashtags: result.content.hashtags,
                mergeFieldValues: result.content.mergeFieldValues,
                isDraft: true,
                isActive: false,
                isArchived: false,
                scheduledAt: undefined,
            } );
            toast.success( 'Content generated successfully!' );
        } else {
            toast.error( result.error || 'Failed to generate content' );
        }
        setIsGenerating( false );
    };

    const onSubmit = ( values: PostFormData ) => {
        startTransition( async () => {
            const result = await createPostAction( campaign.id, values );

            if ( result.success ) {
                toast.success( 'Post created successfully!' );
                router.push( `/campaigns/${campaign.id}/posts/${result.postId}` );
            } else {
                toast.error( 'Please check the form for errors.' );
                console.error( 'Validation errors:', result.error );
            }
        } );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Wand2 className="w-5 h-5"/>
                        <span>Post Generator</span>
                    </CardTitle>
                    <CardDescription>
                        Generate engaging content for &quot;{campaign.title}&quot; campaign
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Generation Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Content Generation</CardTitle>
                        <CardDescription>
                            Let AI create the initial content based on your campaign settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!generatedContent && (
                            <div className="text-center space-y-4">
                                <div
                                    className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                    <Zap className="w-8 h-8 text-blue-600"/>
                                </div>
                                <div>
                                    <h3 className="text-lg text-gray-900">Ready to generate</h3>
                                    <p className="text-gray-600">
                                        Click the button below to generate AI-powered content for this post
                                    </p>
                                </div>
                                <div className="flex justify-center space-x-2">

                                    <Button
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className="flex items-center space-x-2"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div
                                                    className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"/>
                                                <span>Generating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-4 h-4"/>
                                                <span>Generate Content</span>
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={() => setIsCustomizing( !isCustomizing )}
                                        variant={"outline"}
                                    >
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Customize
                                    </Button>
                                </div>

                                {isCustomizing && (
                                    <div>
                                        <Separator className="my-6" />
                                        <CardHeader>
                                            <CardTitle>Customize the Post</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <FormProvider {...form}>
                                                <form onSubmit={handleSubmit( onSubmit )} className="space-y-6">
                                                    <PostCustomizationDetailsTabSwitcher campaign={campaign} />
                                                </form>
                                            </FormProvider>
                                        </CardContent>
                                    </div>

                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Preview */}
                {generatedContent && <PostPreview content={generatedContent}/>}
            </div>
        </div>
    );
}
