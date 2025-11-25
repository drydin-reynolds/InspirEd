import { GoogleGenAI } from "@google/genai";
import * as FileSystem from "expo-file-system";
import Constants from "expo-constants";
import { Platform } from "react-native";

const getApiKey = (): string => {
  const apiKey = 
    process.env.GEMINI_API_KEY || 
    Constants.expoConfig?.extra?.GEMINI_API_KEY ||
    Constants.manifest2?.extra?.expoClient?.extra?.GEMINI_API_KEY;
  
  console.log("Checking API key sources:", {
    processEnv: !!process.env.GEMINI_API_KEY,
    expoConfig: !!Constants.expoConfig?.extra?.GEMINI_API_KEY,
    manifest2: !!Constants.manifest2?.extra?.expoClient?.extra?.GEMINI_API_KEY,
  });
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Please add it to your secrets.");
  }
  return apiKey;
};

let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: getApiKey() });
  }
  return ai;
};

export interface TranscriptionResult {
  transcription: string;
  summary: string;
}

export async function transcribeAndSummarizeAudio(
  audioUri: string,
  mimeType: string = "audio/webm",
  readingLevel?: number
): Promise<TranscriptionResult> {
  try {
    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: "base64",
    });

    const transcriptionContents = [
      {
        inlineData: {
          data: audioBase64,
          mimeType: mimeType,
        },
      },
      `Transcribe this audio file from a medical visit. Provide a complete, accurate transcription of everything that was said. 
Do not add any commentary or additional text - just the transcription.`,
    ];

    const transcriptionResponse = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: transcriptionContents,
    });

    const transcription = transcriptionResponse.text || "";

    if (!transcription) {
      throw new Error("No transcription generated");
    }

    const readingLevelGuidance = readingLevel
      ? `Adapt the summary to a ${readingLevel}th grade reading level using clear, simple language appropriate for that level.`
      : "Use clear, accessible language appropriate for general audiences.";

    const summaryContents = [
      `This is a transcription from a medical visit for a child with a chronic pulmonary condition. Analyze this transcription and provide a concise, helpful summary that includes:

- Main topics discussed during the visit
- Key medical findings or observations
- Diagnosis or condition updates (if mentioned)
- Medications prescribed or changed (if any)
- Action items for the parent/caregiver
- Follow-up instructions or next steps
- Important questions to ask at the next visit (if applicable)

${readingLevelGuidance}

Format the summary in a clear, readable way with proper paragraphs and bullet points where appropriate. Remember this is for a parent managing their child's care, so be empathetic and clear.

TRANSCRIPTION:
${transcription}`,
    ];

    const summaryResponse = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: summaryContents,
    });

    const summary = summaryResponse.text || "";

    return {
      transcription,
      summary,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Gemini API error:", errorMessage);
    if (errorStack) {
      console.error("Error stack:", errorStack);
    }
    throw new Error(`Failed to process audio: ${errorMessage}`);
  }
}
