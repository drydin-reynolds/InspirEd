# InspirEd - Frequently Asked Questions

## General

### What is InspirEd?
InspirEd is a mobile app designed to help parents of children with chronic pulmonary conditions manage medical visits. It records doctor appointments, creates easy-to-understand summaries, and provides educational resources about your child's condition.

### Who is this app for?
Parents and caregivers of children with rare pulmonary conditions, such as surfactant protein deficiencies or other chronic lung diseases. It's designed to reduce stress during healthcare interactions by making medical information more accessible.

### Is the app free?
The app itself is free to use. However, AI features require a Gemini API key, which may have associated costs depending on usage.

### What devices does it work on?
InspirEd works on iPhone, Android, and web browsers. For the best experience, we recommend using it on your mobile device through the Expo Go app.

---

## Recording Visits

### How do I record a doctor visit?
1. Tap the "Visits" tab
2. Tap "New Visit" (the plus button)
3. Enter visit details (doctor name, date, notes)
4. Tap the microphone button to start recording
5. Use pause/resume as needed during the appointment
6. Tap stop when finished

### Can I pause the recording?
Yes! You can pause and resume the recording at any time. This is helpful during waiting periods or private moments.

### How long can I record?
There's no strict time limit, but longer recordings take more time to process. Most doctor visits (15-60 minutes) work well.

### What happens to my recording?
Your recording is saved locally on your device. When you finish, the app uses AI to transcribe the audio and create a summary. The original audio file stays on your phone.

### Can I record without internet?
You can record without internet, but you'll need an internet connection for the AI to transcribe and summarize the visit.

---

## AI Summaries

### How does the AI summary work?
After you finish recording, the app sends the audio to Google's Gemini AI, which:
1. Transcribes the spoken words to text
2. Creates a plain-language summary
3. Extracts key points, diagnoses, and action items
4. Identifies and explains medical terms

### How accurate are the summaries?
The AI provides helpful summaries, but they should not replace your own notes or official medical records. Always verify important information with your healthcare provider.

### What are Communication Styles?
The app adapts how it explains things based on your preference:
- **Essential** - Simple, brief explanations
- **Balanced** - Clear with moderate detail
- **Detailed** - More comprehensive information
- **Comprehensive** - Full medical terminology and detail

You set this during onboarding, and you can change it anytime in Settings.

### Can I ask questions about my visit?
Yes! Each visit has a "Chat" feature where you can ask the AI questions like:
- "What did the doctor say about the medication?"
- "What does [medical term] mean?"
- "What are the next steps?"

---

## Privacy & Data

### Where is my data stored?
All your data (recordings, summaries, chat history) is stored locally on your device. We don't have servers that store your personal health information.

### Is my data private?
Yes. Your recordings and health information stay on your phone. When the AI processes your audio, it's sent securely to Google's Gemini API, which doesn't retain your data after processing.

### Can I delete my data?
Yes. You can delete individual visits, or go to Settings to delete all your data at once.

### Do you sell my data?
No. We never sell, share, or monetize your personal health information.

---

## Education Features

### What's in the Education section?
The Education tab includes:
- **Learning Modules** - Lessons about pulmonary conditions, treatments, and terminology
- **Videos** - Educational videos about medical concepts
- **Chat** - Ask general questions about medical topics

### Where does the educational information come from?
Educational content is grounded in trusted medical sources - peer-reviewed research papers that have been reviewed by medical professionals. The app uses these sources to ensure accuracy.

### Can I trust the medical information?
The app uses vetted medical sources and clearly cites where information comes from. However, it's meant to supplement - not replace - advice from your child's healthcare team. Always consult your doctor for medical decisions.

---

## Visit Planner

### What is the Visit Planner?
The Planner helps you prepare questions for upcoming doctor appointments. You can:
- Add your own questions
- Get AI-suggested questions based on previous visits
- Organize questions by priority

### How do AI-suggested questions work?
Based on your previous visits, the AI suggests relevant questions you might want to ask. For example, if a medication was mentioned, it might suggest asking about side effects or dosing.

---

## Troubleshooting

### The app isn't transcribing my recording
- Check your internet connection
- Make sure your Gemini API key is valid
- Try recording in a quieter environment
- Ensure the microphone was close enough to capture speech

### The AI gave an incorrect summary
AI summaries are helpful but not perfect. You can:
- Use the chat feature to ask clarifying questions
- Edit visit notes manually
- Always verify important details with your healthcare provider

### The app crashed
The app includes an automatic restart feature. If it crashes, tap the restart button that appears. If problems persist, try closing and reopening the app.

### I can't hear audio playback
- Check your device volume
- Make sure your phone isn't on silent mode
- Try using headphones

---

## Technical

### What AI does the app use?
InspirEd uses Google's Gemini 2.5 Flash for:
- Audio transcription
- Summary generation
- Question answering
- Educational content

### Do I need an API key?
Yes. The app requires a Gemini API key to use AI features. You can get one from Google AI Studio.

### Does it work offline?
Basic features (viewing saved visits, reading notes) work offline. AI features (transcription, summaries, chat) require an internet connection.

---

## Contact & Support

### How do I get help?
For technical issues or questions about the app, please contact the development team through the app's feedback feature or your designated support channel.

### Can I suggest new features?
Absolutely! We welcome feedback and feature suggestions from parents and caregivers. Your real-world experience helps us improve the app.
