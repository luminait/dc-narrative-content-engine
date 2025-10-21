// zodSchemas/postsImages.ts
import { z } from "zod";

const uuid = z.uuid();

export const PostImageCreateSchema = z.object({
    post_id: uuid,
    object_id: uuid,
    position: z.number().int().min(1).default(1),
});

export const PostImageDeleteSchema = z.object({
    post_id: uuid,
    object_id: uuid,
});

export const PostImageUpdateSchema = z.object({
    post_id: uuid,
    object_id: uuid,
    position: z.number().int().min(1),
});

export const PostImageRecordSchema = z.object({
    post_id: uuid,
    object_id: uuid,
    position: z.number().int().min(1),
    created_at: z.date(),
});

export type PostImageCreate = z.infer<typeof PostImageCreateSchema>;
export type PostImageDelete = z.infer<typeof PostImageDeleteSchema>;
export type PostImageUpdate = z.infer<typeof PostImageUpdateSchema>;
export type PostImageRecord = z.infer<typeof PostImageRecordSchema>;
