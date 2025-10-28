let assetSystemAvailable: boolean | null = null;

export const isAssetSystemAvailable = () => assetSystemAvailable === true;
export const markAssetSystemUnavailable = () => { assetSystemAvailable = false; };
export const markAssetSystemAvailable = () => { assetSystemAvailable = true; };
export const resetAssetSystemAvailability = () => { assetSystemAvailable = null; };
