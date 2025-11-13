import { prisma } from '@/src/server/db/prisma';
import { unstable_cache } from 'next/cache';
import { MergeField } from "@/src/lib/zod/campaign.schema";
import { campaignMergeFieldsSelect, mergeFieldSelect } from "@/src/server/db/selects/campaign.schema.selects";
import { sanitizeMergeFields } from "@/src/lib/utils/mergefield.utils";

export const getMergeFieldsForCampaignId: (id: string) => Promise<MergeField[]> =  unstable_cache(
    async (id: string) => {
        const mergeFields = await prisma.shotstackMergeField.findMany({
            where: { campaignId: id, },
            select: mergeFieldSelect,
        });

        // Debug once:
        // console.log(
        //     '[getMergeFieldsForCampaignId] raw rows',
        //     JSON.stringify(
        //         mergeFields.filter(r => r.id === '48854e28-1419-4d06-8c66-2326136a3a13'),
        //         null,
        //         2
        //     )
        // );

        const sanitizedMergeFields =  sanitizeMergeFields(mergeFields);
        return sanitizedMergeFields;
    }
)
