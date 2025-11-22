# InspirEd Cloud Functions Deployment Guide

This guide walks you through deploying the secure Gemini API proxy to Firebase Cloud Functions.

## Prerequisites

- Firebase project: `capstone-87b51` (already created)
- Google Gemini API key (STUDIO_GEMINI_KEY from Replit secrets)
- Firebase CLI installed on your computer

## Step-by-Step Deployment

### 1. Install Firebase CLI (One-Time Setup)

Open your terminal/command prompt and run:

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

This will open a browser window for you to authenticate with your Google account.

### 3. Initialize Firebase in Your Project

From your Replit project directory, run:

```bash
firebase init
```

When prompted:
- **Select features:** Choose "Functions" (use space to select, enter to confirm)
- **Select project:** Choose your existing project `capstone-87b51`
- **Language:** JavaScript
- **ESLint:** No (we already have linting configured)
- **Install dependencies:** Yes

**IMPORTANT:** If asked to overwrite files, select **NO** - we've already created the functions code.

### 4. Set Your Gemini API Key as Environment Variable

Replace `YOUR_GEMINI_API_KEY` with your actual key from Replit secrets (STUDIO_GEMINI_KEY):

```bash
firebase functions:config:set studio.gemini_key="YOUR_GEMINI_API_KEY"
```

To verify it was set correctly:

```bash
firebase functions:config:get
```

### 5. Install Cloud Function Dependencies

```bash
cd functions
npm install
cd ..
```

### 6. Deploy the Cloud Functions

```bash
firebase deploy --only functions
```

This will take 2-5 minutes. You'll see output like:

```
✔  functions[transcribeAndSummarize] Successful create operation.
Function URL: https://us-central1-capstone-87b51.cloudfunctions.net/transcribeAndSummarize

✔  functions[answerQuestion] Successful create operation.
Function URL: https://us-central1-capstone-87b51.cloudfunctions.net/answerQuestion

✔  functions[suggestQuestions] Successful create operation.
Function URL: https://us-central1-capstone-87b51.cloudfunctions.net/suggestQuestions
```

**COPY the base URL** (e.g., `https://us-central1-capstone-87b51.cloudfunctions.net`)

### 7. Configure Replit Environment Variable

1. In Replit, click the **Secrets** tab (padlock icon) in the left sidebar
2. Add a new secret:
   - **Key:** `EXPO_PUBLIC_CLOUD_FUNCTION_BASE_URL`
   - **Value:** `https://us-central1-capstone-87b51.cloudfunctions.net` (use your actual base URL from step 6)
3. Click "Add Secret"

### 8. Restart the Expo App

The app will automatically pick up the new environment variable. If not, restart the workflow:
- In Replit, stop the current workflow
- Click "Run" to start it again

## Testing the Integration

### Test 1: Record a Visit

1. Open the app in Expo Go on your phone (scan QR code from Replit)
2. Tap the "Record Visit" button
3. Record a short test message (e.g., "This is a test recording for Dr. Smith")
4. Tap "Stop Recording"
5. Wait for the transcription and summary to appear

**Expected:** You should see a real transcription and AI-generated summary based on your recording.

### Test 2: Ask a Question

1. Go to the "History" tab
2. Tap on a visit with a summary
3. Tap "Ask a Question"
4. Type a question about the visit
5. Submit

**Expected:** The AI should answer based on the visit context.

### Test 3: Planner Suggestions

1. Go to the "Planner" tab
2. Tap "Get AI Suggestions"

**Expected:** AI-generated questions based on your visit history.

## Troubleshooting

### "Cloud Function URL not configured" Error

**Problem:** The app can't find the Cloud Function URL.

**Solution:**
1. Verify `EXPO_PUBLIC_CLOUD_FUNCTION_BASE_URL` is set in Replit Secrets
2. Restart the Expo dev server
3. Hard reload the app in Expo Go

### "Failed to process audio" Error

**Problem:** Cloud Function can't access Gemini API.

**Solution:**
1. Verify your Gemini API key is correct:
   ```bash
   firebase functions:config:get
   ```
2. If wrong, reset it:
   ```bash
   firebase functions:config:set studio.gemini_key="CORRECT_KEY_HERE"
   firebase deploy --only functions
   ```

### "CORS Error" in Browser Console

**Problem:** Cloud Functions are blocking requests from your app.

**Solution:** The functions already have `cors: true` configured. If you still see this:
1. Check that you're using the exact base URL from deployment
2. Ensure you're not mixing HTTP/HTTPS

### Functions Deployment Failed

**Problem:** Deployment errors during `firebase deploy`.

**Solution:**
1. Check that billing is enabled in your Google Cloud project (required for Cloud Functions)
2. Verify you have the correct permissions in the Firebase project
3. Try deploying one function at a time:
   ```bash
   firebase deploy --only functions:transcribeAndSummarize
   ```

### Check Function Logs

View real-time logs to debug issues:

```bash
firebase functions:log
```

Or view in Firebase Console:
https://console.firebase.google.com/project/capstone-87b51/functions/logs

## Security Notes

⚠️ **TESTING ONLY:** This setup is for development and testing. See `functions/SECURITY.md` for production requirements.

✅ **API Key Protection:** Your Gemini API key stays on the server - never exposed to clients  
✅ **Request Validation:** Size limits and error codes protect against basic abuse  
⚠️ **CORS Open:** Functions accept requests from any origin (testing only)  
❌ **No Authentication:** Anyone with the Cloud Function URL can call endpoints (add Firebase Auth for production)  

**For production deployment with real patient data, you MUST implement additional security measures outlined in `functions/SECURITY.md`.**

## Next Steps

Once the basic integration is working, you can:
1. Add Firebase Firestore to replace AsyncStorage
2. Implement vector search for PDF grounding
3. Add user authentication for admin features
4. Store audio files in Firebase Storage

## Cost Estimation

**Free Tier Includes:**
- 2M Cloud Function invocations/month
- 400,000 GB-seconds compute time
- 200,000 GHz-seconds compute time
- 5GB network egress

**Typical Usage for InspirEd:**
- 1 visit recording = 3 function calls (transcribe, answer question, suggest questions)
- ~100 visits/month = 300 invocations
- Well within free tier limits

**Gemini API Costs:**
- Flash model: $0.000075/1K characters (very cheap)
- ~1000 characters per visit = $0.000075 per visit
- 100 visits = ~$0.01/month

Total estimated cost for moderate usage: **Free (under free tier limits)**

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Firebase Console logs
3. Verify all environment variables are set correctly
4. Check that billing is enabled in Google Cloud (required even for free tier)
