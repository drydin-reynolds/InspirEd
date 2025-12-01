# InspirEd

**Learn to Empower. Empower to Hope.**

A mobile healthcare companion app for parents of children with rare pulmonary conditions. Built with React Native and Expo.

## Features

### Visit Recording & AI Summaries
- Record doctor visits with pause/resume controls
- AI-powered transcription using Google's Gemini API
- Plain-language summaries adapted to your communication style
- Extract key points, diagnoses, action items, and medical terms

### Ask Questions
- Get answers about your recorded visits
- AI explains medical terminology in simple terms
- Context-aware responses based on visit content

### Visit Planner
- Plan questions for upcoming appointments
- AI-suggested questions based on previous visits
- Organize and prioritize what to discuss

### Education Center
- Learning modules on pulmonary conditions
- AI-generated lessons tailored to your communication style
- Educational video library
- Chat with AI about medical topics (grounded in trusted sources)

### Communication Styles
The app adapts content complexity based on your preference:
- **Essential** - Simple, key points only
- **Balanced** - Clear explanations with some detail
- **Detailed** - Comprehensive information
- **Comprehensive** - Full medical detail

## Tech Stack

- **Framework:** React Native with Expo SDK 54
- **Navigation:** React Navigation 7
- **AI:** Google Gemini API (transcription, summaries, Q&A)
- **Storage:** AsyncStorage (local-first approach)
- **Animations:** Reanimated 4
- **UI:** iOS liquid glass design principles

## Getting Started

### Prerequisites
- Node.js 18+
- Expo Go app on your mobile device (for testing)

### Environment Variables
Create a `.env` file or add these secrets in Replit:

```
GEMINI_API_KEY=your_gemini_api_key
```

Optional (for video library):
```
GOOGLE_SERVICE_ACCOUNT_JSON=your_service_account_credentials
GOOGLE_DRIVE_VIDEO_FOLDER_ID=your_drive_folder_id
```

### Installation

```bash
npm install
```

### Running the App

```bash
npm run dev
```

Scan the QR code with Expo Go to run on your device.

## Project Structure

```
├── assets/              # Images, fonts, knowledge base
├── components/          # Reusable UI components
├── constants/           # Theme, colors, spacing
├── contexts/            # React Context providers
├── hooks/               # Custom hooks
├── navigation/          # Navigation configuration
├── screens/             # App screens
├── types/               # TypeScript definitions
└── utils/               # Utilities (AI, storage, RAG)
```

## Knowledge Base (RAG System)

The app uses a local RAG (Retrieval-Augmented Generation) system to ground AI responses in trusted medical sources. PDF documents are processed into embeddings and stored in `assets/medical-knowledge.json`.

To update the knowledge base:
```bash
node scripts/process-pdfs.js
```

## License

Private project - All rights reserved.
