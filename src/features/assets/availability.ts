let assetSystemAvailable: boolean | null = null;

export const isAssetSystemAvailable = () : boolean => assetSystemAvailable === true;
export const markAssetSystemUnavailable = () => { assetSystemAvailable = false; };
export const markAssetSystemAvailable = () => { assetSystemAvailable = true; };
export const resetAssetSystemAvailability = () => { assetSystemAvailable = null; };
