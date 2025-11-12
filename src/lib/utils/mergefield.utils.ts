import { MergeField } from '@/src/lib/zod/campaign.schema';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Converts a Prisma Decimal or other numeric type to a string.
 * Returns null if the value is null or undefined.
 */
function toStringOrNull(value: any): string | null {
    if (value === null || value === undefined) return null;

    // Handle Prisma Decimal objects
    if (value instanceof Decimal) {
        return value.toString();
    }

    // Handle regular numbers
    if (typeof value === 'number') {
        return value.toString();
    }

    // Handle strings (already in correct format)
    if (typeof value === 'string') {
        return value;
    }

    return null;
}

/**
 * Calculates the length (duration) from startTime and endTime.
 * Both times should be in seconds (or same unit).
 * Returns null if either time is missing.
 */
function calculateLength(startTime: string | null, endTime: string | null): string | null {
    if (!startTime || !endTime) return null;

    const start = parseFloat(startTime);
    const end = parseFloat(endTime);

    if (isNaN(start) || isNaN(end)) return null;

    const duration = end - start;
    return duration > 0 ? duration.toString() : null;
}

/**
 * Sanitizes merge fields from Prisma to ensure they match the schema.
 * Computes the 'length' property from startTime and endTime.
 * Handles Prisma Decimal conversion to strings.
 */
export function sanitizeMergeFields(fields: any[]): MergeField[] {
    return fields.map((field) => {
        const startTime = toStringOrNull(field.startTime);
        const endTime = toStringOrNull(field.endTime);

        return {
            id: field.id,
            name: field.name,
            description: field.description || null,
            mediaValueType: field.mediaValueType || undefined,
            value: field.value || null,
            type: field.type || undefined,
            startTime,
            endTime,
            // Computed property: calculate length from startTime and endTime
            length: calculateLength(startTime, endTime),
            shouldRefreshOnRegenerate: field.shouldRefreshOnRegenerate || undefined,
        };
    });
}
