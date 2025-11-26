/**
 * Google Drive Service for Educational Videos
 * 
 * Fetches curated medical educational videos from a designated Google Drive folder.
 * Uses service account authentication for secure access without requiring parent sign-in.
 */

import Constants from "expo-constants";

export interface EducationalVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  category: string;
  order: number;
  createdAt: string;
}

interface DriveFile {
  id: string;
  name: string;
  description?: string;
  thumbnailLink?: string;
  webContentLink?: string;
  videoMediaMetadata?: {
    durationMillis?: string;
  };
  createdTime?: string;
  properties?: {
    category?: string;
    order?: string;
  };
}

interface DriveListResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

const getServiceAccountCredentials = (): object | null => {
  const credentialsJson = 
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON || 
    Constants.expoConfig?.extra?.GOOGLE_SERVICE_ACCOUNT_JSON ||
    Constants.manifest2?.extra?.expoClient?.extra?.GOOGLE_SERVICE_ACCOUNT_JSON;
  
  if (!credentialsJson) {
    console.log("Google Service Account not configured - using demo videos");
    return null;
  }
  
  try {
    return JSON.parse(credentialsJson);
  } catch (error) {
    console.error("Failed to parse service account credentials:", error);
    return null;
  }
};

const getVideoFolderId = (): string | null => {
  return (
    process.env.GOOGLE_DRIVE_VIDEO_FOLDER_ID || 
    Constants.expoConfig?.extra?.GOOGLE_DRIVE_VIDEO_FOLDER_ID ||
    Constants.manifest2?.extra?.expoClient?.extra?.GOOGLE_DRIVE_VIDEO_FOLDER_ID ||
    null
  );
};

let accessToken: string | null = null;
let tokenExpiry: number = 0;

function isCryptoAvailable(): boolean {
  try {
    return typeof btoa === 'function' && 
           typeof atob === 'function' && 
           typeof crypto !== 'undefined' && 
           typeof crypto.subtle !== 'undefined';
  } catch {
    return false;
  }
}

async function getAccessToken(): Promise<string | null> {
  const credentials = getServiceAccountCredentials();
  if (!credentials) return null;
  
  if (!isCryptoAvailable()) {
    console.log("Crypto APIs not available (running on native) - using demo videos");
    return null;
  }
  
  const now = Date.now();
  if (accessToken && tokenExpiry > now + 60000) {
    return accessToken;
  }
  
  try {
    const creds = credentials as any;
    const header = { alg: "RS256", typ: "JWT" };
    const now_seconds = Math.floor(now / 1000);
    const claim = {
      iss: creds.client_email,
      scope: "https://www.googleapis.com/auth/drive.readonly",
      aud: "https://oauth2.googleapis.com/token",
      exp: now_seconds + 3600,
      iat: now_seconds,
    };
    
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedClaim = base64UrlEncode(JSON.stringify(claim));
    const signatureInput = `${encodedHeader}.${encodedClaim}`;
    
    const signature = await signRS256(signatureInput, creds.private_key);
    const jwt = `${signatureInput}.${signature}`;
    
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });
    
    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }
    
    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = now + (data.expires_in * 1000);
    return accessToken;
  } catch (error) {
    console.error("Failed to get access token:", error);
    return null;
  }
}

function base64UrlEncode(str: string): string {
  const base64 = btoa(unescape(encodeURIComponent(str)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signRS256(input: string, privateKey: string): Promise<string> {
  const pemContents = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
  
  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(input)
  );
  
  const signatureArray = new Uint8Array(signatureBuffer);
  const base64Signature = btoa(String.fromCharCode(...signatureArray));
  return base64Signature.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function formatDuration(milliseconds: string | undefined): string {
  if (!milliseconds) return "Unknown";
  const ms = parseInt(milliseconds, 10);
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function extractCategoryFromName(name: string): string {
  const match = name.match(/^\[([^\]]+)\]/);
  if (match) return match[1];
  
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes("surfactant")) return "Surfactant Basics";
  if (lowercaseName.includes("breathing") || lowercaseName.includes("respiratory")) return "Breathing & Lungs";
  if (lowercaseName.includes("treatment") || lowercaseName.includes("therapy")) return "Treatments";
  if (lowercaseName.includes("daily") || lowercaseName.includes("care")) return "Daily Care";
  
  return "General";
}

function cleanVideoTitle(name: string): string {
  return name
    .replace(/^\[([^\]]+)\]\s*/, "")
    .replace(/\.(mp4|mov|avi|mkv|webm)$/i, "")
    .trim();
}

export async function fetchEducationalVideos(): Promise<EducationalVideo[]> {
  const token = await getAccessToken();
  const folderId = getVideoFolderId();
  
  if (!token || !folderId) {
    console.log("Using demo educational videos");
    return getDemoVideos();
  }
  
  try {
    const query = `'${folderId}' in parents and mimeType contains 'video/' and trashed = false`;
    const fields = "files(id,name,description,thumbnailLink,webContentLink,videoMediaMetadata,createdTime,properties)";
    
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&orderBy=name`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Drive API error: ${response.status}`);
    }
    
    const data: DriveListResponse = await response.json();
    
    return data.files.map((file, index) => ({
      id: file.id,
      title: cleanVideoTitle(file.name),
      description: file.description || "Educational video about pediatric pulmonary health.",
      thumbnailUrl: file.thumbnailLink || "",
      videoUrl: `https://drive.google.com/uc?export=download&id=${file.id}`,
      duration: formatDuration(file.videoMediaMetadata?.durationMillis),
      category: file.properties?.category || extractCategoryFromName(file.name),
      order: parseInt(file.properties?.order || String(index), 10),
      createdAt: file.createdTime || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch videos from Drive:", error);
    return getDemoVideos();
  }
}

export async function getVideoStreamUrl(videoId: string): Promise<string> {
  const token = await getAccessToken();
  
  if (!token) {
    const demoVideo = getDemoVideos().find(v => v.id === videoId);
    return demoVideo?.videoUrl || "";
  }
  
  return `https://www.googleapis.com/drive/v3/files/${videoId}?alt=media&access_token=${token}`;
}

function getDemoVideos(): EducationalVideo[] {
  return [
    {
      id: "demo-1",
      title: "Understanding Your Child's Lungs",
      description: "A gentle introduction to how healthy lungs work and what makes them special in growing children.",
      thumbnailUrl: "",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      duration: "3:45",
      category: "Breathing & Lungs",
      order: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-2",
      title: "What is Surfactant?",
      description: "Learn about surfactant - the special substance that helps keep your child's air sacs open and healthy.",
      thumbnailUrl: "",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      duration: "4:20",
      category: "Surfactant Basics",
      order: 2,
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-3",
      title: "Daily Care Routines",
      description: "Practical tips for daily care routines that support your child's respiratory health.",
      thumbnailUrl: "",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      duration: "5:15",
      category: "Daily Care",
      order: 3,
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-4",
      title: "Breathing Exercises for Children",
      description: "Fun and gentle breathing exercises you can do with your child to strengthen their respiratory system.",
      thumbnailUrl: "",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      duration: "6:00",
      category: "Daily Care",
      order: 4,
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-5",
      title: "When to Call the Doctor",
      description: "Important signs and symptoms to watch for, and when it's time to seek medical attention.",
      thumbnailUrl: "",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      duration: "4:45",
      category: "Treatments",
      order: 5,
      createdAt: new Date().toISOString(),
    },
  ];
}

export function getVideoCategories(videos: EducationalVideo[]): string[] {
  const categories = new Set(videos.map(v => v.category));
  return Array.from(categories).sort();
}
