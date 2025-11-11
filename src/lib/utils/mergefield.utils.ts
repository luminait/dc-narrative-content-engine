import { MergeField } from "@/src/lib/zod/campaign.schema";

export const sanitizeMergeFields = (mergeFields: Array<any>): MergeField[] => {
    const sanitizedMergeFields = mergeFields.map((field) => {
        if (!field) return null;
        const newField = {
            name: field.name,
            description: field.description,
            mediaValueType: field.mediaValueType,
            value: field.value,
            startTime: field.startTime,
            endTime: field.endTime,
            length: field.length,
        }
        return field;
    })

    return sanitizedMergeFields;
}
