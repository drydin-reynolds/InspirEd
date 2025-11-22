# Security Considerations

## Current Security Status: TESTING ONLY

⚠️ **WARNING:** This implementation is suitable for testing and development only. For production use with real patient data, additional security measures are required.

### What's Implemented

✅ **CORS Enabled:** Functions accept requests from any origin (testing only - lock down for production)
✅ **Request Size Limits:** 50MB maximum to prevent abuse
✅ **Error Correlation IDs:** For debugging without exposing sensitive details
✅ **Structured Error Codes:** Client can handle specific error types gracefully
✅ **Resource Limits:** Memory and timeout caps per function

### Security Gaps (Testing Only)

❌ **No Authentication:** Anyone with the Cloud Function URL can call endpoints  
❌ **Public URL:** EXPO_PUBLIC_CLOUD_FUNCTION_BASE_URL is visible in the compiled app bundle  
❌ **No Rate Limiting:** Malicious actors could exhaust Gemini API quota  
❌ **No Audit Logging:** No tracking of who called what, when  
❌ **No Data Encryption:** Request/response bodies are not encrypted beyond HTTPS

## Production Security Roadmap

Before handling real patient data (PHI/HIPAA compliance), implement:

### Phase 1: Authentication & Authorization

1. **Firebase Authentication**
   ```javascript
   // Require authenticated users
   const user = req.auth;
   if (!user) {
     return res.status(401).json({ error: 'UNAUTHORIZED' });
   }
   ```

2. **Firebase App Check**
   ```javascript
   // Verify requests come from your actual app, not cloned/stolen keys
   const { onCall } = require('firebase-functions/v2/https');
   exports.transcribeAndSummarize = onCall({ ... }, async (request) => {
     // App Check automatically verified
   });
   ```

3. **Role-Based Access Control (RBAC)**
   - Parents can only access their own visit data
   - Admins can manage PDF sources
   - Implement Firestore security rules

### Phase 2: Data Protection

1. **Encrypt Audio at Rest**
   - Store audio files in Firebase Storage with encryption
   - Use signed URLs for temporary access

2. **Audit Logging**
   - Log all API calls with user ID, timestamp, action
   - Store in Firestore for compliance reporting

3. **Rate Limiting**
   ```javascript
   // Use Firebase Realtime Database for rate limiting
   const rateLimiter = require('express-rate-limit');
   ```

### Phase 3: Compliance (HIPAA/PHI)

1. **Business Associate Agreement (BAA)**
   - Sign BAA with Google Cloud for HIPAA compliance
   - Enable Google Cloud Healthcare API

2. **Data Residency**
   - Configure function regions for compliance (e.g., `us-central1` only)
   - Ensure Firestore data is stored in approved regions

3. **Access Controls**
   - Multi-factor authentication for admin accounts
   - Automatic session timeout
   - IP allowlisting for admin functions

## Immediate Actions for Production

If you need to deploy this now with better security:

### Quick Security Upgrade (1 hour)

1. **Add Firebase Auth to Cloud Functions:**
   ```bash
   # In functions/index.js, replace onRequest with onCall
   const { onCall } = require('firebase-functions/v2/https');
   
   exports.transcribeAndSummarize = onCall(options, async (request) => {
     // request.auth is automatically populated
     if (!request.auth) {
       throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
     }
     // ... rest of function
   });
   ```

2. **Enable Firebase App Check:**
   ```bash
   # In Firebase Console
   # 1. Go to App Check
   # 2. Register your app
   # 3. Enable enforcement for Cloud Functions
   ```

3. **Move URL to Server Config:**
   - Remove `EXPO_PUBLIC_CLOUD_FUNCTION_BASE_URL` from client
   - Use Firebase SDK to call functions directly (no URLs needed)
   ```typescript
   import { getFunctions, httpsCallable } from 'firebase/functions';
   const functions = getFunctions();
   const transcribe = httpsCallable(functions, 'transcribeAndSummarize');
   const result = await transcribe({ audioData, mimeType, readingLevel });
   ```

## Cost Implications of Current Setup

**Risk:** Malicious actors could:
- Drain your Gemini API quota ($$ if over free tier)
- Exhaust Cloud Function invocations (2M free, then $0.40/million)
- Use your compute resources for unrelated tasks

**Mitigation:**
- Set up billing alerts in Google Cloud Console
- Monitor Cloud Function logs for unusual patterns
- Implement Phase 1 authentication ASAP

## Testing vs Production Checklist

| Feature | Testing (Current) | Production (Required) |
|---------|-------------------|----------------------|
| Authentication | ❌ None | ✅ Firebase Auth |
| App Check | ❌ Disabled | ✅ Enforced |
| CORS | ⚠️ Replit domains | ✅ Your domain only |
| Rate Limiting | ❌ None | ✅ Per-user limits |
| Audit Logs | ❌ None | ✅ Full audit trail |
| Data Encryption | ⚠️ HTTPS only | ✅ At rest + in transit |
| URL Exposure | ⚠️ Public in bundle | ✅ SDK-based calls |
| HIPAA Compliance | ❌ Not compliant | ✅ BAA signed |

## Next Steps

1. **For Testing (Now):** Current implementation is fine - just don't share the URL publicly
2. **For MVP Launch:** Implement Phase 1 (Authentication) before onboarding real users
3. **For Production:** Complete all phases before handling actual patient data

## Questions?

Contact your security team or refer to:
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase App Check](https://firebase.google.com/docs/app-check)
- [Google Cloud HIPAA Compliance](https://cloud.google.com/security/compliance/hipaa)
