import { Post, PostStatus, PostWithStatus } from "@/src/lib/types/ui";
import {
    PostBase,
    PostImage,
    PostWithImages,
} from "@/src/features/campaigns/posts/post.schema";
import { getPublicUrl } from "./supabase.utils";

// Type representing the raw image relation returned by Prisma
export type RawPostImageFromPrisma = {
    postId: string;
    objectId: string;
    createdAt: Date;
    position: number;
};

// Type representing the entire post object returned by the campaign posts query
export type RawPostFromQuery = PostBase & {
    images: RawPostImageFromPrisma[];
};

/// Filter posts by derived status based on Zod-backed fields
export const filterPostsByStatus = (posts: Post[]) => {
    const now = new Date();

    const published = posts.filter(post => {
        const scheduledAt = post.scheduledAt ?? null;
        const scheduledInFuture = scheduledAt
            ? scheduledAt.getTime() > now.getTime()
            : false;
        return (
            post.isActive === true && post.isArchived !== true && !scheduledInFuture
        );
    });

    const scheduled = posts.filter(post => {
        const scheduledAt = post.scheduledAt ?? null;
        return (
            post.isArchived !== true &&
            !!scheduledAt &&
            scheduledAt.getTime() > now.getTime()
        );
    });

    const draft = posts.filter(
        post => post.isDraft === true && post.isArchived !== true,
    );

    return { published, scheduled, draft };
};

export const getPostWithStatus = (
    post: PostWithImages | PostBase,
): PostWithStatus => {
    let status: PostStatus = getPostStatus(post);

    return { ...post, status };
};

/**
 * Computes the status of a post based on its properties.
 * @param post The post object containing status-related fields.
 * @returns The computed PostStatus.
 */
export const getPostStatus = (
    post: Pick<PostBase, 'isDraft' | 'isActive' | 'isArchived' | 'scheduledAt'>
): PostStatus => {
    if (post.isDraft) {
        return 'draft';
    }
    if (post.isArchived) {
        return 'archived';
    }
    if (post.scheduledAt && new Date(post.scheduledAt) > new Date()) {
        return 'scheduled';
    }
    if (post.isActive) {
        return 'published';
    }
    // Default fallback status
    return 'draft';
};

/**
 * Transforms raw post data from a Prisma query into the UI-specific `Post` type.
 * This function computes the `status` and transforms the `images` array to include public URLs.
 *
 * @param rawPosts - The raw post data from the database query.
 * @returns An array of posts conforming to the UI `Post` type.
 */
export const toUiPosts = (rawPosts: RawPostFromQuery[]): Post[] => {
    return rawPosts.map(rawPost => {
        const uiImages: PostImage[] = rawPost.images.map(image => ({
            object_id: image.objectId,
            created_at: image.createdAt,
            position: image.position,
            url: getPublicUrl("posts", image.objectId),
        }));

        const postWithUiImages = {
            ...rawPost,
            images: uiImages,
        };

        return {
            ...postWithUiImages,
            status: getPostStatus(postWithUiImages),
        };
    });
};
