
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Recursively processes an object to convert Decimal types to strings.
 * This is necessary for client/server data serialization.
 *
 * @param obj - The object to be processed.
 * @returns A new object with Decimal values converted to strings.
 */
export function convertDecimalsToStrings<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Decimal) {
        return obj.toString() as unknown as T;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => convertDecimalsToStrings(item)) as unknown as T;
    }

    const newObj = {} as T;
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            newObj[key] = convertDecimalsToStrings(value);
        }
    }
    return newObj;
}
