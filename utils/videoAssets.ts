import { Platform } from "react-native";

const videoUrls: { [key: string]: string } = {
  "surfactant-intro-video": "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
};

export function getLocalVideoSource(videoId: string): { uri: string } | null {
  const videoUrl = videoUrls[videoId];
  if (videoUrl) {
    console.log(`[VideoAssets] Using remote URL for ${videoId} on ${Platform.OS}`);
    return { uri: videoUrl };
  }
  console.log(`[VideoAssets] No video source found for ${videoId}`);
  return null;
}

export function isLocalVideoAvailable(videoId: string): boolean {
  return videoId in videoUrls;
}
