# InspirEd Mobile App

## Overview

InspirEd is a React Native mobile application designed to assist parents of children with chronic pulmonary conditions in managing medical visits. It enables recording doctor visits, generating AI-powered summaries in plain language, asking questions, and accessing curated educational content from trusted medical sources. The core purpose is to empower parents with accessible medical information, reducing stress during healthcare interactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application is built with React Native and Expo SDK 54, utilizing the new React Native architecture and React 19.1.0 with the experimental React Compiler. It supports iOS, Android, and Web platforms. Navigation is stack-based using React Navigation 7, featuring a tab-based main interface and modal presentations for new visit recordings. State management primarily uses the Context API for global state and AsyncStorage for local data persistence.

**UI/UX Design:** Emphasizes medical-grade accessibility with high contrast, minimum 16pt font size, and a light mode. The color palette includes Primary Teal (#4DB6AC) and Accent Green (#A4D65E). Animations are handled by Reanimated 4, and the design incorporates safe area handling and platform-specific visual elements like translucent tab bars on iOS.

### Authentication & Authorization
The app supports Parent and Admin roles. Parents have full access to core features without authentication (local-first approach). Admin features, which include managing trusted PDF sources, will require authentication.

### Privacy & Consent System
The system is designed with a privacy-first approach, requiring explicit consent during onboarding and before recording. Data is stored locally on the device, with clear explanations of AI processing. Users have full control, including the ability to delete all personal data.

### AI & Knowledge Management
All AI-generated content is grounded in administrator-vetted PDF sources to ensure medical accuracy.
- **Gemini API (Google):** The primary AI engine (Gemini 2.5 Flash) handles audio transcription from m4a recordings and generates medical summaries from these transcriptions. Summaries are tailored to the parent's communication style (Essential, Balanced, Detailed, Comprehensive) and focus on pediatric pulmonary care terminology.
- **OpenAI API (Planned):** Will be used for structured extraction of key points, diagnoses, action items, and medical terms from Gemini transcripts, not for summary generation.
- **AI Features:** Include visit summarization, contextual Q&A for clarifying questions, and an educational chat based on the PDF knowledge base. Communication style adaptation is automatic during onboarding and customizable.

### Local RAG System
The app implements a local Retrieval-Augmented Generation (RAG) system for grounding AI educational responses in trusted medical sources:

**Architecture:**
- **Knowledge Base:** Pre-processed PDF content stored in `assets/medical-knowledge.json` (485KB, 23 chunks from 3 PDFs)
- **Processing Script:** `scripts/process-pdfs.js` extracts text, chunks content, and generates embeddings using Gemini API
- **RAG Service:** `utils/rag.ts` provides vector similarity search using cosine similarity
- **Integration:** Educational AI functions automatically retrieve relevant context before generating responses

**Current Sources:**
1. Serrano & Pérez-Gil (2006) - Pulmonary surfactant structure and function
2. Whitsett et al. - Surfactant proteins and lung biology
3. Nogee (1998) - Genetic disorders of surfactant metabolism

**RAG Flow:**
1. User asks a question in the Education chat
2. System generates an embedding for the query using Gemini
3. Cosine similarity search finds the 3 most relevant chunks
4. Retrieved context is added to the AI prompt as "TRUSTED MEDICAL SOURCES"
5. Gemini generates a response grounded in the retrieved medical information

**Future Enhancements:**
- Citation tracking for transparency (per-section source mapping)
- Retry logic with exponential backoff in PDF processor
- Admin interface for managing PDF sources

### Data Storage
Local data is stored using AsyncStorage, including user profiles, visit recordings, AI summaries, chat history, planner questions, and learning module progress. Planned backend integration will include a vector database for PDF content and potentially cloud storage for backups.

### Recording & Audio Processing
The app allows users to record, pause, and stop audio, saving recordings locally as m4a files with metadata. Background processing leverages the Gemini API for transcription and summarization. The system provides real-time status updates during processing and ensures visits are saved even if AI processing fails.

### Educational Content System
Features learning modules categorized by topic and difficulty, with progress tracking. AI-generated lessons, dynamically created using the Gemini API, are adapted to the user's communication style and offer section-by-section navigation and module-specific Q&A. A separate education chat addresses broader medical questions, grounded in trusted PDF sources.

**Videos Embedded in Lessons:**
The primary video experience is integrated directly into learning modules. Videos appear at strategic points within lessons (after_intro, after_section_N, or before_summary) with a dedicated "Watch" section in the lesson flow. This keeps parents on a guided learning path while incorporating visual content exactly when it's most relevant.

- Modules can include a `video` property with placement metadata
- VideoPlayerScreen handles both embedded module videos and standalone library videos
- Watch progress is tracked and displayed with a checkmark badge

### Educational Video Library (Secondary)
The "Explore Videos" option provides a secondary way to browse all educational videos:

**Architecture:**
- **Google Drive Service:** `utils/googleDrive.ts` handles authentication and video fetching from a designated Drive folder
- **Video Library Screen:** `screens/VideoLibraryScreen.tsx` displays categorized videos with progress tracking
- **Video Player Screen:** `screens/VideoPlayerScreen.tsx` provides full-screen playback using expo-av
- **Watch History:** Persisted in AsyncStorage to track viewing progress

**Configuration (Optional - Demo Mode Available):**
To connect to Google Drive for real video content:
1. Create a Google Cloud service account with Drive API access
2. Share the video folder with the service account email
3. Add `GOOGLE_SERVICE_ACCOUNT_JSON` secret with the service account credentials
4. Add `GOOGLE_DRIVE_VIDEO_FOLDER_ID` environment variable with the folder ID

**Video Naming Convention:**
- Prefix with category: `[Surfactant Basics] What is Surfactant.mp4`
- Or use file properties for metadata

**Demo Mode:**
When Google Drive is not configured, the app displays sample videos using public test content for development and demonstration purposes.

**Platform Notes:**
- Web: Full Google Drive integration supported with service account authentication
- iOS/Android (Expo Go): Uses demo videos (JWT signing requires Web Crypto APIs not available in React Native)
- For production native apps, consider moving Drive authentication to a cloud function

### Error Handling & Reliability
The application includes an error boundary for graceful degradation, with a custom fallback UI and app restart functionality. Platform-specific fallbacks ensure consistent user experience across devices.

## External Dependencies

### Core Frameworks
- **Expo SDK 54:** Development platform.
- **React Native 0.81.5:** Core framework.
- **React Navigation 7:** Navigation.
- **React 19.1.0:** UI library.

### UI & Animation
- **Reanimated 4:** Animations.
- **Gesture Handler 2.28:** Touch interactions.
- **Expo Blur:** iOS blur effects.
- **Expo Haptics:** Tactile feedback.
- **Expo Image:** Optimized image component.

### Data & Storage
- **AsyncStorage 2.2.0:** Local persistence.

### Development Tools
- **TypeScript 5.9.2:** Type safety.
- **ESLint 9 + Prettier:** Code quality.
- **Babel Module Resolver:** Path aliasing.

### AI & Media Processing
- **@google/genai 1.5.0:** Gemini API client for audio transcription and summarization.
- **Expo AV:** Audio recording (planned migration to `expo-audio`).
- **Expo FileSystem:** Base64 encoding for audio.

### Active Integrations
- **Gemini API (Google):** Production audio transcription and medical summarization, requiring `GEMINI_API_KEY`.