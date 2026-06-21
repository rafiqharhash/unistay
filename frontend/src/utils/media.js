/**
 * Returns true if the given URL points to a video file.
 */
export const isVideo = (url) => {
  if (!url) return false;
  if (url.match(/\.(mp4|webm|mov|mkv)(\?.*)?$/i)) return true;
  if (url.includes('res.cloudinary.com') && url.includes('/video/')) return true;
  return false;
};

/**
 * Returns the first image URL from an array of media URLs,
 * skipping any video files. Returns null if no image is found.
 */
export const getThumbnail = (images) => {
  if (!images || images.length === 0) return null;
  return images.find((url) => !isVideo(url)) || null;
};
