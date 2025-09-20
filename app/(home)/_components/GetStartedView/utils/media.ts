/**
 * Utility functions for handling media assets in the GetStartedView component
 * All assets are stored in /public/media/getstarted/ for easy organization and removal
 */

/**
 * Get the media path for assets stored in the GetStartedView media directory
 * @param filename - The filename of the media asset
 * @returns The full path to the media asset
 */
export const getMediaPath = (filename: string): string => {
  return `/media/getstarted/${filename}`;
};

/**
 * Media asset configuration - update these filenames to match your actual assets
 */
export const mediaAssets = {
  // Add your media assets here for easy management
  heroImageStatic: "hero-image.png",
  heroImageDynamic: "hero-image.gif",
  heroVideo: "hero-video.mp4",

} as const;

/**
 * Get a specific media asset path
 * @param assetKey - Key from mediaAssets configuration
 * @returns Full path to the media asset
 */
export const getMediaAsset = (assetKey: keyof typeof mediaAssets): string => {
  return getMediaPath(mediaAssets[assetKey]);
};

/**
 * Check if a media asset exists (for fallback handling)
 * @param filename - The filename to check
 * @returns Promise that resolves to boolean indicating if asset exists
 */
export const checkMediaExists = async (filename: string): Promise<boolean> => {
  try {
    const response = await fetch(getMediaPath(filename), { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};
