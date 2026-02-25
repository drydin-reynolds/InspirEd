import { Platform } from "react-native";

/**
 * VIDEO URL CONFIGURATION
 * 
 * To use your own educational videos:
 * 1. Upload your video to a hosting service (YouTube, Vimeo, Google Drive, etc.)
 * 2. Get the direct video URL (for Google Drive: use the format below)
 * 3. Replace the placeholder URL with your actual video URL
 * 
 * Google Drive format: https://drive.google.com/uc?export=download&id=YOUR_FILE_ID
 * YouTube won't work directly - you need a direct MP4 URL
 * 
 * For now, placeholder videos are used so the feature works during development.
 */
const videoUrls: { [key: string]: string } = {
  // Your Lungs' Secret Helper video from Google Drive
  "surfactant-intro-video": "https://drive.google.com/uc?export=download&id=1XXlILsl-askIsK0IJaLbNRlhRsjXIZOS",
};

export function getLocalVideoSource(videoId: string): { uri: string } | null {
  const videoUrl = videoUrls[videoId];
  if (videoUrl) {
    console.log(`[VideoAssets] Using video URL for ${videoId} on ${Platform.OS}`);
    return { uri: videoUrl };
  }
  console.log(`[VideoAssets] No video source found for ${videoId}`);
  return null;
}

export function isLocalVideoAvailable(videoId: string): boolean {
  return videoId in videoUrls;
}
