import { GoogleGenAI } from "@google/genai";
import * as FileSystem from "expo-file-system/legacy";
import Constants from "expo-constants";
import { Platform } from "react-native";

const getApiKey = (): string => {
  const apiKey = 
    process.env.GEMINI_API_KEY || 
    Constants.expoConfig?.extra?.GEMINI_API_KEY ||
    Constants.manifest2?.extra?.expoClient?.extra?.GEMINI_API_KEY;
  
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
    if (Platform.OS === "web") {
      throw new Error(
        "Audio transcription is not available on web. Please use the Expo Go app on your phone to record and transcribe visits."
      );
    }

    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
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

export async function askQuestionWithGemini(
  question: string,
  visitContext: {
    summary?: string | null;
    transcription?: string | null;
    keyPoints?: string[];
    diagnoses?: string[];
    actions?: string[];
    medicalTerms?: { term: string; explanation: string }[];
  },
  readingLevel: number = 8
): Promise<string> {
  try {
    const contextParts: string[] = [];
    
    if (visitContext.summary) {
      contextParts.push(`VISIT SUMMARY:\n${visitContext.summary}`);
    }
    
    if (visitContext.transcription) {
      contextParts.push(`FULL TRANSCRIPTION:\n${visitContext.transcription}`);
    }
    
    if (visitContext.keyPoints && visitContext.keyPoints.length > 0) {
      contextParts.push(`KEY POINTS:\n${visitContext.keyPoints.map(p => `- ${p}`).join('\n')}`);
    }
    
    if (visitContext.diagnoses && visitContext.diagnoses.length > 0) {
      contextParts.push(`DIAGNOSES:\n${visitContext.diagnoses.map(d => `- ${d}`).join('\n')}`);
    }
    
    if (visitContext.actions && visitContext.actions.length > 0) {
      contextParts.push(`ACTION ITEMS:\n${visitContext.actions.map(a => `- ${a}`).join('\n')}`);
    }
    
    if (visitContext.medicalTerms && visitContext.medicalTerms.length > 0) {
      contextParts.push(`MEDICAL TERMS EXPLAINED:\n${visitContext.medicalTerms.map(t => `- ${t.term}: ${t.explanation}`).join('\n')}`);
    }

    const context = contextParts.join('\n\n');
    
    if (!context.trim()) {
      return "I don't have enough information about this visit to answer your question. Please make sure the visit has been transcribed and summarized first.";
    }

    const prompt = `You are a helpful medical information assistant for parents of children with chronic pulmonary conditions. A parent has asked a question about a recent doctor visit.

IMPORTANT GUIDELINES:
1. Answer based ONLY on the visit information provided below
2. Use clear, simple language appropriate for a ${readingLevel}th grade reading level
3. Be empathetic and supportive - these parents are managing a child's chronic condition
4. If the answer isn't in the visit notes, say so honestly and suggest they ask their doctor
5. Never give specific medical advice - always encourage discussing important decisions with their healthcare provider
6. Explain any medical terms in simple language
7. Keep your response concise but complete

VISIT INFORMATION:
${context}

PARENT'S QUESTION:
${question}

Please provide a helpful, accurate response:`;

    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt],
    });

    const answer = response.text || "";
    
    if (!answer) {
      return "I'm sorry, I couldn't generate a response. Please try asking your question again.";
    }

    return answer;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Gemini Q&A error:", errorMessage);
    return "I'm having trouble answering your question right now. Please try again in a moment.";
  }
}

export interface LessonSection {
  title: string;
  content: string;
  keyTakeaway?: string;
}

export interface GeneratedLesson {
  introduction: string;
  sections: LessonSection[];
  summary: string;
  practicalTips: string[];
}

export async function generateModuleLesson(
  moduleTitle: string,
  moduleDescription: string,
  topics: string[],
  difficulty: string,
  readingLevel: number = 8
): Promise<GeneratedLesson> {
  try {
    const prompt = `You are creating educational content for parents of children with chronic pulmonary conditions. Generate a comprehensive lesson for the following learning module:

MODULE: ${moduleTitle}
DESCRIPTION: ${moduleDescription}
TOPICS TO COVER: ${topics.join(", ")}
DIFFICULTY LEVEL: ${difficulty}

IMPORTANT GUIDELINES:
1. Use clear, simple language appropriate for a ${readingLevel}th grade reading level
2. Be empathetic - these parents are managing their child's chronic condition
3. Focus on practical, actionable information parents can use
4. Explain medical terms in simple, everyday language
5. NEVER provide specific medical advice - always encourage consulting with their healthcare provider
6. Make the content encouraging and supportive
7. Include real-world examples parents can relate to

Generate the lesson in the following JSON format (respond with ONLY valid JSON, no markdown):
{
  "introduction": "A welcoming 2-3 sentence introduction to the topic",
  "sections": [
    {
      "title": "Section title",
      "content": "2-4 paragraphs of educational content for this section",
      "keyTakeaway": "One sentence summarizing the key point"
    }
  ],
  "summary": "A brief summary of what was covered",
  "practicalTips": ["Tip 1", "Tip 2", "Tip 3"]
}

Create 3-4 sections covering the main topics. Each section should be informative but concise.`;

    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt],
    });

    const text = response.text || "";
    
    // Try to parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }
    
    const lesson = JSON.parse(jsonMatch[0]) as GeneratedLesson;
    return lesson;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Gemini lesson generation error:", errorMessage);
    
    // Return a fallback lesson structure
    return {
      introduction: "We're having trouble loading this lesson right now. Please try again in a moment, or use the AI Assistant below to ask questions about this topic.",
      sections: [
        {
          title: "Content Unavailable",
          content: "The lesson content couldn't be generated at this time. You can still learn about this topic by asking the AI Learning Assistant questions.",
          keyTakeaway: "Try refreshing or ask the AI Assistant for help with this topic.",
        },
      ],
      summary: "Please try again later or use the AI Assistant for help.",
      practicalTips: ["Ask the AI Assistant about specific topics you'd like to learn about"],
    };
  }
}

export async function askEducationalQuestion(
  question: string,
  conversationHistory: { text: string; isUser: boolean }[] = [],
  readingLevel: number = 8
): Promise<string> {
  try {
    const historyContext = conversationHistory.length > 0
      ? `PREVIOUS CONVERSATION:\n${conversationHistory.map(msg => 
          `${msg.isUser ? 'Parent' : 'Assistant'}: ${msg.text}`
        ).join('\n')}\n\n`
      : '';

    const prompt = `You are a caring and knowledgeable medical education assistant for parents of children with chronic pulmonary conditions. Your role is to help parents better understand medical concepts, treatments, and terminology related to their child's care.

IMPORTANT GUIDELINES:
1. Use clear, simple language appropriate for a ${readingLevel}th grade reading level
2. Be empathetic and supportive - these parents are managing a child's chronic condition
3. Focus on educational information about pulmonary health, treatments, medications, and medical procedures
4. Explain medical terms in simple, everyday language
5. NEVER provide specific medical advice or diagnosis - always encourage consulting with their healthcare provider for specific concerns
6. If asked about specific symptoms or treatments, provide general educational information and emphasize discussing with their doctor
7. Be encouraging and help parents feel more confident in understanding their child's care
8. Keep responses concise but informative

${historyContext}PARENT'S QUESTION:
${question}

Please provide a helpful, educational response:`;

    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt],
    });

    const answer = response.text || "";
    
    if (!answer) {
      return "I'm sorry, I couldn't generate a response. Please try asking your question again.";
    }

    return answer;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Gemini Education error:", errorMessage);
    return "I'm having trouble answering your question right now. Please try again in a moment.";
  }
}
