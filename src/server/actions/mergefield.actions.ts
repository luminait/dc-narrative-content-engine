'use server';
import 'server-only';

import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/src/server/db';
import { mergeFieldSchema } from '@/src/lib/zod/campaign.schema';
import { createSupabaseServerClient } from '@/src/server/supabase/server';
import { convertDecimalsToStrings } from '@/src/lib/utils/serialization';

// --- Shared auth/authorization helpers to keep Server Actions DRY ---
async function requireAuth(): Promise<string> {
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if ( authError || !authData?.user ) {
        throw new Error( 'User not authenticated' );
    }
    return authData.user.id;
}

async function assertCampaignOwner( campaignId: string, userId: string ): Promise<void> {
    const campaign = await prisma.campaign.findUnique( {
        where: { id: campaignId },
        select: { createdBy: true },
    } );

    if ( !campaign ) {
        throw new Error( 'Campaign not found' );
    }

    if ( campaign.createdBy !== userId ) {
        throw new Error( 'Unauthorized: You do not own this campaign' );
    }
}

// -------------------------------------------------------------------

/**
 * Updates a merge field.
 * Server Action for merge field updates with validation and cache revalidation.
 */
export async function updateMergeFieldAction(
    mergeFieldId: string,
    campaignId: string,
    values: z.infer<typeof mergeFieldSchema>
) {
    try {
        // 1-2. Auth and authorization
        const userId = await requireAuth();
        await assertCampaignOwner( campaignId, userId );

        // 3. Validate with Zod
        const validatedData = mergeFieldSchema.parse( values );

        // 4. Update the merge field (excluding 'length' as it's computed)
        const updatedField = await prisma.shotstackMergeField.update( {
            where: { id: mergeFieldId },
            data: {
                name: validatedData.name,
                description: validatedData.description,
                mediaValueType: validatedData.mediaValueType,
                value: validatedData.value,
                // Only set optional fields when they are provided; otherwise omit so we don't clobber with nulls
                ...( validatedData.type !== undefined && validatedData.type !== null
                    ? { type: validatedData.type }
                    : {} ),
                ...( validatedData.startTime !== undefined && validatedData.startTime !== null
                    ? { startTime: validatedData.startTime }
                    : {} ),
                ...( validatedData.endTime !== undefined && validatedData.endTime !== null
                    ? { endTime: validatedData.endTime }
                    : {} ),
                // Note: 'length' is computed from startTime - endTime and must not be written.
                shouldRefreshOnRegenerate: validatedData.shouldRefreshOnRegenerate,
            },
        } );

        // 5. Revalidate caches
        revalidateTag( `campaign-${campaignId}` );
        revalidateTag( 'campaigns' );
        // Ensure the campaign details page is revalidated server-side
        revalidatePath( `/campaigns/${campaignId}` );

        // 6. Serialize Decimals before returning to the client
        const serializedData = convertDecimalsToStrings( updatedField );

        return { success: true, data: serializedData, error: null };
    } catch ( error ) {
        if ( error instanceof z.ZodError ) {
            return {
                success: false,
                data: null,
                error: z.treeifyError( error ),
            };
        }
        console.error( 'Merge field update error:', error );
        return {
            success: false,
            data: null,
            error:
                error instanceof Error ? error.message : 'Failed to update merge field',
        };
    }
}

/**
 * Duplicates a merge field.
 * Server Action for merge field duplication.
 */
export async function duplicateMergeFieldAction(
    mergeFieldId: string,
    campaignId: string
) {
    // 1-2. Auth and authorization
    const userId = await requireAuth();
    await assertCampaignOwner( campaignId, userId );
    // 3. Get the existing merge field
    const existingField = await prisma.shotstackMergeField.findUnique( {
        where: { id: mergeFieldId },
    } );

    if ( !existingField ) {
        return {
            success: false,
            data: null,
            error: 'Merge field not found',
        };
    }

    try {


        // 4. Create a duplicate (excluding 'length' as it's computed)
        const duplicatedField = await prisma.shotstackMergeField.create( {
            data: {
                campaignId,
                name: `${existingField.name} (Copy)`,
                description: existingField.description,
                mediaValueType: existingField.mediaValueType,
                value: existingField.value,
                type: existingField.type,
                startTime: existingField.startTime,
                endTime: existingField.endTime,
                // Note: 'length' is NOT included - it's computed from startTime - endTime
                shouldRefreshOnRegenerate: existingField.shouldRefreshOnRegenerate,
            },
        } );

        // 5. Revalidate caches
        revalidateTag( `campaign-${campaignId}` );
        revalidateTag( 'campaigns' );
        // Ensure the campaign details page is revalidated server-side
        revalidatePath( `/campaigns/${campaignId}` );

        // 6. Serialize Decimals before returning to the client
        const serializedData = convertDecimalsToStrings( duplicatedField );

        return { success: true, data: serializedData, error: null };
    } catch ( error ) {
        console.error( 'Merge field duplication error:', error );
        return {
            success: false,
            data: null,
            error:
                error instanceof Error ? error.message : 'Failed to duplicate merge field',
        };
    }
}

/**
 * Deletes a merge field.
 * Server Action for merge field deletion.
 */
export async function deleteMergeFieldAction(
    mergeFieldId: string,
    campaignId: string
) {
    try {
        // 1-2. Auth and authorization
        const userId = await requireAuth();
        await assertCampaignOwner( campaignId, userId );

        // 3. Delete merge field
        await prisma.shotstackMergeField.delete( {
            where: { id: mergeFieldId },
        } );

        // 4. Revalidate caches
        revalidateTag( `campaign-${campaignId}` );
        revalidateTag( 'campaigns' );
        // Ensure the campaign details page is revalidated server-side
        revalidatePath( `/campaigns/${campaignId}` );

        return { success: true, error: null };
    } catch ( error ) {
        console.error( 'Merge field deletion error:', error );
        return {
            success: false,
            error:
                error instanceof Error ? error.message : 'Failed to delete merge field',
        };
    }
}
