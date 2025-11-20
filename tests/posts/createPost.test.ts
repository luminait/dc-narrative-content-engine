import { createPostAction } from '@/src/server/actions/posts.actions';
import { prisma } from '@/src/server/db';
import { createSupabaseServerClient } from '@/src/server/supabase/server';
import { revalidateTag } from 'next/cache';

// Mock dependencies
jest.mock('@/src/server/db', () => ({
    prisma: {
        post: {
            create: jest.fn(),
        },
    },
}));

jest.mock('@/src/server/supabase/server', () => ({
    createSupabaseServerClient: jest.fn(),
}));

jest.mock('next/cache', () => ({
    revalidateTag: jest.fn(),
}));

describe('createPostAction', () => {
    const mockCampaignId = 'campaign-123';
    const validPostData = {
        title: 'Test Post',
        content: 'This is a test post content.',
        hashtags: ['#test', '#jest'],
        isDraft: true,
        isActive: false,
        isArchived: false,
        scheduledAt: null,
        images: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a post successfully when authenticated and data is valid', async () => {
        // Mock Supabase auth success
        (createSupabaseServerClient as jest.Mock).mockResolvedValue({
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: { id: 'user-123' } },
                    error: null,
                }),
            },
        });

        // Mock Prisma create success
        const mockCreatedPost = {
            id: 'post-123',
            ...validPostData,
            campaignId: mockCampaignId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        (prisma.post.create as jest.Mock).mockResolvedValue(mockCreatedPost);

        const result = await createPostAction(mockCampaignId, validPostData);

        expect(result.success).toBe(true);
        expect(result.postId).toBe('post-123');
        expect(result.error).toBeNull();
        expect(prisma.post.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                title: validPostData.title,
                campaignId: mockCampaignId,
            }),
        }));
        expect(revalidateTag).toHaveBeenCalledWith('posts');
        expect(revalidateTag).toHaveBeenCalledWith(`campaign-${mockCampaignId}-posts`);
    });

    it('should return validation error when data is invalid', async () => {
        // Mock Supabase auth success
        (createSupabaseServerClient as jest.Mock).mockResolvedValue({
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: { id: 'user-123' } },
                    error: null,
                }),
            },
        });

        const invalidData = { ...validPostData, title: '' }; // Empty title is invalid

        const result = await createPostAction(mockCampaignId, invalidData as any);

        expect(result.success).toBe(false);
        expect(result.postId).toBeNull();
        expect(result.error).toBeDefined();
    });

    it('should return error when user is not authenticated', async () => {
        // Mock Supabase auth failure
        (createSupabaseServerClient as jest.Mock).mockResolvedValue({
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: null },
                    error: { message: 'Not authenticated' },
                }),
            },
        });

        const result = await createPostAction(mockCampaignId, validPostData);

        expect(result.success).toBe(false);
        expect(result.error).toBe('User not authenticated');
        expect(prisma.post.create).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
        // Mock Supabase auth success
        (createSupabaseServerClient as jest.Mock).mockResolvedValue({
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: { id: 'user-123' } },
                    error: null,
                }),
            },
        });

        // Mock Prisma error
        (prisma.post.create as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

        const result = await createPostAction(mockCampaignId, validPostData);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Database connection failed');
    });
});
