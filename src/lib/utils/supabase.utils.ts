/**
 * Supabase-related utility functions.
 */

/**
 * Constructs the public URL for a Supabase Storage object.
 *
 * @param bucketName - The name of the Supabase Storage bucket (e.g., 'images').
 * @param objectId - The ID or path of the object within the bucket.
 * @returns The full public URL for the object.
 */
export const getPublicUrl = (bucketName: string, objectId: string): string => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
        console.error("Supabase URL is not configured.");
        return "";
    }
    return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${objectId}`;
};
