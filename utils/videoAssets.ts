import { Platform } from "react-native";

const localAssetModule = require("@/assets/videos/surfactant-intro.mp4");

const webFallbackUrls: { [key: string]: string } = {
  "surfactant-intro-video": "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
};

export function getLocalVideoSource(videoId: string): { uri: string } | number | null {
  if (Platform.OS === "web") {
    const fallbackUrl = webFallbackUrls[videoId];
    if (fallbackUrl) {
      console.log(`[VideoAssets] Web platform - using fallback URL for ${videoId}`);
      return { uri: fallbackUrl };
    }
    const webAsset = localAssetModule;
    if (typeof webAsset === "string" && webAsset.trim() !== "") {
      console.log(`[VideoAssets] Web platform - using bundled asset for ${videoId}: ${webAsset}`);
      return { uri: webAsset };
    }
    return null;
  }
  
  console.log(`[VideoAssets] Native platform - using module ID for ${videoId}`);
  return localAssetModule;
}

export function isLocalVideoAvailable(videoId: string): boolean {
  return videoId === "surfactant-intro-video";
}
