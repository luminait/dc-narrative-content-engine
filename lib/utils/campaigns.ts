import { VideoLengthSeconds } from '@/app/generated/prisma';

/**
 * A mapping from the VideoLengthSeconds enum to its numerical value in seconds.
 */
export const videoLengthMap: Record<VideoLengthSeconds, number> = {
    THIRTY: 30,
    FORTY_FIVE: 45,
    SIXTY: 60,
};

/**
 * Converts a VideoLengthSeconds enum value to its corresponding number of seconds.
 * @param videoLength The VideoLengthSeconds enum value.
 * @returns The number of seconds, or null if the input is null/undefined.
 */
export function videoLengthEnumToSeconds(
    videoLength: VideoLengthSeconds | null | undefined
): number | null {
    if (!videoLength) {
        return null;
    }
    return videoLengthMap[videoLength];
}

/**
 * Converts a number of seconds back to its corresponding VideoLengthSeconds enum value.
 * @param seconds The number of seconds (e.g., 30, 45, 60).
 * @returns The matching VideoLengthSeconds enum value, or undefined if no match is found.
 */
export function secondsToVideoLengthEnum(
    seconds: number | null | undefined
): VideoLengthSeconds | undefined {
    if (seconds === null || seconds === undefined) {
        return undefined;
    }
    // Find the key in the map whose value matches the seconds
    return (Object.keys(videoLengthMap) as VideoLengthSeconds[]).find(
        (key) => videoLengthMap[key] === seconds
    );
}
