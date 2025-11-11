import { prisma } from '@/src/server/db/prisma';
import { unstable_cache } from 'next/cache';
import { MergeField } from "@/src/lib/zod/campaign.schema";
import { campaignMergeFieldsSelect, mergeFieldSelect } from "@/src/server/db/selects/campaign";
import { sanitizeMergeFields } from "@/src/lib/utils/mergefield.utils";

export const getMergeFieldsForCampaignId: (id: string) => Promise<MergeField[]> =  unstable_cache(
    async (id: string) => {
        const mergeFields = await prisma.shotstackMergeField.findMany({
            where: { campaignId: id, },
            select: mergeFieldSelect,
        });

        const sanitizedMergeFields =  sanitizeMergeFields(mergeFields);
        return sanitizedMergeFields;
    }
)
