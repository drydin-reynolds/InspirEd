# Mongo-backed RAG (setup guide)

This describes the **optional** path where educational **chunks** live in **MongoDB** and retrieval runs on the **`asset-admin`** server. The chat-style answers still come from **Gemini** in the mobile app (`utils/gemini.ts`); only **which passages are retrieved** can come from the API instead of the bundled JSON.

## What runs where

| Piece | Location |
|--------|-----------|
| Chunk storage (text + vectors) | MongoDB collection **`ragchunks`** (via Mongoose model `RagChunk`) |
| “Find relevant chunks for this question” | `POST /api/rag/search` on **asset-admin** |
| Load JSON → Mongo (one-off / after PDF rebuild) | `npm run sync-rag` in **asset-admin** |
| Build `assets/medical-knowledge.json` from PDFs | `node scripts/process-pdfs.js` (repo **root**, needs `GEMINI_API_KEY` in env) |
| Turn chunks + question into a **chat reply** | **Expo app** — `utils/rag.ts` → `utils/gemini.ts` |

If **`EXPO_PUBLIC_RAG_API_URL`** is **not** set, the app keeps using **local** `medical-knowledge.json` only (previous behavior).

## Prerequisites

- **MongoDB Atlas** (or other Mongo) — connection string ready
- **Google Gemini API key** (AI Studio / project key with embedding + generate access)
- Node 18+

## 1. Configure `asset-admin`

From `asset-admin/`:

1. Copy `.env.example` → `.env` (do **not** commit `.env`).
2. Set:
   - **`MONGO_URI`** — Atlas connection string
   - **`GEMINI_API_KEY`** — required for **`POST /api/rag/search`** (embeds the user’s question)
   - **`PORT`** — optional, default `3000`

## 2. Install and start the server

```bash
cd asset-admin
npm install
npm start
```

You should see `Connected to MongoDB` and the listening URL.

## 3. Fill `RagChunk` from the knowledge JSON

After `assets/medical-knowledge.json` exists (from `process-pdfs` or repo checkout):

```bash
cd asset-admin
npm run sync-rag
```

This **replaces** all documents in `RagChunk` with the contents of that file.

## 4. Smoke-test the API

- **Chunk count:** `GET http://localhost:3000/api/rag/stats`  
  Expect `totalChunks` > 0 after sync.

- **Search:**  
  ```bash
  curl -s -X POST http://localhost:3000/api/rag/search \
    -H "Content-Type: application/json" \
    -d '{"query":"pulmonary surfactant","topK":3,"minSimilarity":0.3}'
  ```  
  Response is **`{ "results": [ { "chunk": {...}, "similarity": ... }, ... ] }`** — structured passages, not a chat paragraph. The app builds the chat message separately.

## 5. Point the Expo app at the server (optional)

1. Phone/simulator and laptop on the **same Wi‑Fi**.
2. Use your machine’s **LAN IP** (not `localhost` on the device).

```bash
export EXPO_PUBLIC_RAG_API_URL=http://YOUR_LAN_IP:3000
npx expo start
```

(`app.config.js` passes this through as `extra.RAG_API_URL`.)

**iOS:** plain `http://` to a local IP may require App Transport Security exceptions in a dev build.

## Rebuilding the knowledge JSON (PDFs)

From the **repository root** (not `asset-admin`):

```bash
export GEMINI_API_KEY=your_key
node scripts/process-pdfs.js
```

Then sync again:

```bash
cd asset-admin && npm run sync-rag
```

See **`scripts/process-pdfs.js`** — PDF text uses **`gemini-2.5-flash`**; chunk embeddings use **`gemini-embedding-001`** (768 dimensions). Query embeddings use the same model so scores stay meaningful.

## Troubleshooting

| Issue | Things to check |
|--------|------------------|
| `Cannot GET /api/rag/...` | Request **asset-admin** (e.g. port **3000**), not the Expo/Metro port. |
| `results: []` | Run **`sync-rag`**; try lowering **`minSimilarity`** in the POST body; ensure query/chunk embeddings use the **same** model (re-run **`process-pdfs`** + **`sync-rag`** after model changes). |
| Gemini **404** on embed | Old `text-embedding-004` URLs are deprecated; server and app should use **`gemini-embedding-001`** (see `asset-admin/lib/ragSearch.js` and `utils/rag.ts`). |
| CORS errors in web Expo | **`cors`** is enabled on asset-admin for dev (`origin: true`). |

## Security

- Never commit **`asset-admin/.env`** or real API keys.
- Rotate keys if they are ever pushed to git.
