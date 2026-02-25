# InspirEd - Design Decisions

This document captures the key architectural, technical, and UX decisions made during the development of InspirEd, along with the rationale behind each choice.

---

## 1. Architecture Decisions

### 1.1 Local-First, No Backend
**Decision:** Store all data locally on the device using AsyncStorage instead of a cloud backend.

**Rationale:**
- **Privacy:** Medical information is highly sensitive. Parents need confidence their child's health data isn't stored on external servers.
- **Offline Access:** Parents can review visit summaries anytime, even without internet.
- **Simplicity:** No server infrastructure to maintain, secure, or scale.
- **Speed:** No network latency for data retrieval.

**Tradeoff:** No cross-device sync or backup (could be added later via optional cloud integration).

---

### 1.2 Pure Frontend Stack (Expo)
**Decision:** Build as a React Native app using Expo without a custom backend.

**Rationale:**
- **Cross-platform:** Single codebase for iOS, Android, and web.
- **Rapid development:** Expo's managed workflow accelerates iteration.
- **Expo Go testing:** Users can test on real devices without app store deployment.
- **AI as a service:** Gemini API handles heavy lifting (transcription, summarization) without needing custom ML infrastructure.

**Tradeoff:** Limited to Expo-compatible libraries; some native features require development builds.

---

### 1.3 Local RAG System (JSON-Based Vector Store)
**Decision:** Implement retrieval-augmented generation using a local JSON file instead of a cloud vector database.

**Rationale:**
- **Scale:** Only ~25 chunks from 3 curated PDFs - no need for enterprise vector DB.
- **Cost:** Zero infrastructure cost vs. $10-100+/month for hosted solutions.
- **Latency:** In-memory search is faster than network calls to external databases.
- **Curated sources:** Admin-vetted medical PDFs don't change frequently, so real-time updates aren't needed.

**Tradeoff:** Adding new knowledge requires re-running the processing script. Acceptable for curated medical content that needs expert review anyway.

---

## 2. AI/ML Decisions

### 2.1 Gemini as Primary AI
**Decision:** Use Google's Gemini API for all AI operations (transcription, summarization, Q&A, embeddings).

**Rationale:**
- **Multimodal:** Gemini handles audio transcription AND text generation in one API.
- **Quality:** Gemini 2.5 Flash offers strong performance at lower cost than GPT-4.
- **Native PDF support:** Can process PDF documents directly for knowledge extraction.
- **Embedding model:** text-embedding-004 provides high-quality embeddings for RAG.

**Alternative considered:** OpenAI for structured extraction. Decided single-provider approach reduces complexity and API key management.

---

### 2.2 Communication Style Adaptation
**Decision:** Adapt AI response complexity based on user-selected "Communication Style" rather than asking for reading level.

**Rationale:**
- **Respectful framing:** "Communication Style" is empowering; "reading level" can feel condescending.
- **User control:** Parents choose how much detail they want, not a judgment of capability.
- **Flexibility:** Same parent might want "Essential" for quick reference but "Comprehensive" when researching.

**Levels:**
| Style | Description |
|-------|-------------|
| Essential | Simple, key points only |
| Balanced | Clear explanations with context |
| Detailed | Comprehensive information |
| Comprehensive | Full medical terminology |

---

### 2.3 RAG for Educational Content Only
**Decision:** Use RAG grounding for the Education chat, not for visit-specific Q&A.

**Rationale:**
- **Visit Q&A:** Already grounded in the specific visit's transcription and summary - no need for external knowledge.
- **Education chat:** General medical questions benefit from vetted sources to prevent hallucination.
- **Separation of concerns:** Clear distinction between "your visit" and "general knowledge."

---

## 3. UX Decisions

### 3.1 Privacy-First Consent Flow
**Decision:** Require explicit consent during onboarding and before each recording.

**Rationale:**
- **HIPAA awareness:** Even for a personal-use app, establishing good data practices builds trust.
- **Transparency:** Parents understand exactly what happens to recordings (local storage, AI processing).
- **Control:** Easy access to delete all data at any time.

---

### 3.2 Pause/Resume Recording
**Decision:** Allow pausing during visit recordings instead of only start/stop.

**Rationale:**
- **Real-world usage:** Waiting rooms, private conversations, interruptions are common during appointments.
- **Battery/storage:** No need to record silence.
- **Privacy:** Parents can pause during sensitive moments they don't want transcribed.

---

### 3.3 Tab-Based Navigation with Modal Recording
**Decision:** Use bottom tabs for main sections, with new visit recording as a full-screen modal.

**Rationale:**
- **Discoverability:** Core features (Visits, Plan, Learn) always accessible.
- **Focus:** Recording modal removes distractions during appointments.
- **Platform conventions:** Matches iOS/Android navigation patterns.

---

### 3.4 Markdown Rendering for AI Responses
**Decision:** Render AI responses with basic Markdown formatting (bold, italics, bullets).

**Rationale:**
- **Readability:** Structured responses are easier to scan than plain text walls.
- **Emphasis:** Important terms and action items stand out.
- **Consistency:** Same rendering across summaries, chat, and lessons.

---

## 4. Technical Decisions

### 4.1 AsyncStorage for Persistence
**Decision:** Use AsyncStorage instead of SQLite or other local databases.

**Rationale:**
- **Simplicity:** Key-value storage is sufficient for visits, settings, and chat history.
- **Expo compatibility:** Works out of the box with Expo Go.
- **JSON-native:** Data structures map directly to storage format.

**Tradeoff:** No complex queries or relationships. Acceptable for this app's data model.

---

### 4.2 Reanimated for Keyboard Handling
**Decision:** Use react-native-reanimated for keyboard animations instead of default behavior.

**Rationale:**
- **Android compatibility:** Default KeyboardAvoidingView is unreliable on Android.
- **Smooth animations:** 60fps animations on the UI thread.
- **Control:** Precise positioning of input containers above keyboard.

---

### 4.3 No Authentication for Core Features
**Decision:** Core features work without user accounts or login.

**Rationale:**
- **Friction reduction:** Parents can start recording immediately - no signup barrier.
- **Privacy:** No account means no server-side data.
- **Local-first:** All data tied to device, not identity.

**Future consideration:** Optional cloud backup could require authentication.

---

### 4.4 Embedding Processing as Batch Script
**Decision:** Process PDFs and generate embeddings via a Node.js script rather than in-app.

**Rationale:**
- **Performance:** Heavy processing happens once, not on every app launch.
- **Quality control:** Admin reviews processed content before shipping.
- **Bundle size:** Pre-computed embeddings ship with the app.

**Usage:** Run `node scripts/process-pdfs.js` when adding new medical sources.

---

## 5. Decisions Deferred

### 5.1 Cloud Backup
**Status:** Not implemented
**Future approach:** Optional encrypted backup to user's own cloud storage (iCloud/Google Drive).

### 5.2 Multi-Device Sync
**Status:** Not implemented
**Future approach:** Would require user accounts and conflict resolution strategy.

### 5.3 Admin Interface for PDF Management
**Status:** Not implemented
**Future approach:** Web-based admin panel for uploading and processing new medical sources.

### 5.4 Offline AI
**Status:** Not feasible currently
**Barrier:** On-device LLMs not yet practical for mobile; would require significant model size and processing.

---

## 6. Lessons Learned

1. **Start with privacy requirements** - Healthcare apps need consent flows designed upfront, not retrofitted.

2. **Local RAG is viable** - For curated knowledge bases under ~500 documents, cloud vector DBs are overkill.

3. **Communication matters** - Terminology like "reading level" vs "communication style" significantly impacts user perception.

4. **Gemini multimodal simplifies architecture** - One API for audio, text, and embeddings reduces integration complexity.

5. **Test on real devices early** - Web version differs from native; keyboard handling especially varies by platform.

---

*Last updated: December 2024*
