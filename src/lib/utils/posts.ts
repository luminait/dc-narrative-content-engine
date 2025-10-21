import { Post } from "@/src/lib/types/ui";

/// Filter posts by derived status based on Zod-backed fields
/// - published: is_active && !is_archived && (no future scheduled_at)
/// - scheduled: scheduled_at in future and not archived
/// - draft: is_draft and not archived
/// @param posts - Array of posts to filter
/// @returns An object containing filtered posts by status `published`, `scheduled`, and `draft`
export const filterPostsByStatus = (posts: Post[]) => {
    const now = new Date();

    const published = posts.filter((post) => {
        const scheduledAt = post.scheduled_at ?? null;
        const scheduledInFuture = scheduledAt ? scheduledAt.getTime() > now.getTime() : false;
        return post.is_active === true && post.is_archived !== true && !scheduledInFuture;
    });

    const scheduled = posts.filter((post) => {
        const scheduledAt = post.scheduled_at ?? null;
        return post.is_archived !== true && !!scheduledAt && scheduledAt.getTime() > now.getTime();
    });

    const draft = posts.filter((post) => post.is_draft === true && post.is_archived !== true);

    return { published, scheduled, draft };
};
