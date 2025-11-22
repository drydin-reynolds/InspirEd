# InspirEd Cloud Functions

Firebase Cloud Functions that securely proxy Gemini API calls for the InspirEd mobile app.

## Setup & Deployment

### 1. Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase Functions (if not already done)

```bash
# From the root directory of your project
firebase init functions
# Select your existing Firebase project: capstone-87b51
# Choose JavaScript
# Do NOT overwrite existing files
```

### 4. Set Environment Variable

The Cloud Function needs your Gemini API key:

```bash
firebase functions:config:set studio.gemini_key="YOUR_GEMINI_API_KEY_HERE"
```

**Important:** Use the same key value from your Replit `STUDIO_GEMINI_KEY` secret.

### 5. Install Dependencies

```bash
cd functions
npm install
```

### 6. Deploy Functions

```bash
# From the functions directory
npm run deploy

# Or from the root directory
firebase deploy --only functions
```

After deployment, you'll see URLs like:
```
https://transcribeandsummarize-XXXXXXX.cloudfunctions.net
https://answerquestion-XXXXXXX.cloudfunctions.net
https://suggestquestions-XXXXXXX.cloudfunctions.net
```

### 7. Update App Configuration

Copy the base Cloud Function URL and add it to your Replit secrets:

1. In Replit, go to Secrets (padlock icon)
2. Add a new secret:
   - Key: `EXPO_PUBLIC_CLOUD_FUNCTION_BASE_URL`
   - Value: `https://us-central1-capstone-87b51.cloudfunctions.net` (use your actual base URL from step 6, WITHOUT the function name)

**Note:** Use only the base URL (e.g., `https://us-central1-capstone-87b51.cloudfunctions.net`), not the full function URL. The app will append function names like `/transcribeAndSummarize`.

## Functions Overview

### `transcribeAndSummarize`
- **Purpose:** Transcribes audio recordings and generates reading-level-adapted summaries
- **Method:** POST
- **Body:**
  ```json
  {
    "audioData": "base64-encoded-audio",
    "mimeType": "audio/mp4",
    "readingLevel": 8
  }
  ```

### `answerQuestion`
- **Purpose:** Answers questions about specific visits
- **Method:** POST
- **Body:**
  ```json
  {
    "question": "What does pulmonary function mean?",
    "visitContext": "Visit summary text...",
    "readingLevel": 8
  }
  ```

### `suggestQuestions`
- **Purpose:** Generates suggested questions for next visit based on history
- **Method:** POST
- **Body:**
  ```json
  {
    "visitHistory": [
      { "summary": "Visit 1 summary..." },
      { "summary": "Visit 2 summary..." }
    ]
  }
  ```

## Testing Locally

```bash
cd functions
firebase emulators:start
```

## Security Notes

- ✅ API key stays secure on the server
- ✅ CORS enabled for your Expo app
- ✅ Automatic scaling
- ✅ Request validation

## Monitoring

View logs in Firebase Console:
https://console.firebase.google.com/project/capstone-87b51/functions/logs
