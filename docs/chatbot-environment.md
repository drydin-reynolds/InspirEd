# Chatbot (Learn → Ask AI) — environment variables & secrets

This document lists what must be configured for the **educational RAG chatbot** (`askEducationalQuestion` in `utils/gemini.ts` → `/api/rag/chat` on **asset-admin** when configured), and what **must not** be committed to a public repository.

For full Mongo/RAG setup steps, see **[rag-mongodb-setup.md](./rag-mongodb-setup.md)**. For asset-admin, copy **`asset-admin/.env.example`** → **`asset-admin/.env`** (gitignored).

---

## Do not commit these

| Item | Why |
|------|-----|
| **`GEMINI_API_KEY`** (real value) | Grants paid API access; treat like a password. |
| **`MONGO_URI`** | Contains cluster host + credentials. |
| **`app.json` / `app.config.js` values** with real keys or private LAN URLs | Expo bundles `expo.extra`; keys end up in the client build. |
| **`asset-admin/.env`** | Should stay local; use `.env.example` as a template only. |

Use placeholders in any committed config (e.g. `YOUR_GEMINI_API_KEY_HERE`, `http://YOUR_LAN_IP:3000`). Prefer **EAS Secrets** or CI env vars for production builds.

---

## Expo app (mobile client)

Used when you open **Learn → Ask AI** and other Gemini-powered flows.

| Variable / config | Source | Purpose |
|-------------------|--------|---------|
| **`GEMINI_API_KEY`** | `app.json` → `expo.extra`, or shell `GEMINI_API_KEY` / `EXPO_PUBLIC_GEMINI_API_KEY` (see `app.config.js`) | Required to call Gemini from the app (RAG chat request headers, fallback local RAG embeddings, non-RAG AI features). |
| **`EXPO_PUBLIC_RAG_API_URL`** or **`RAG_API_URL` in `expo.extra`** | Same | Base URL of **asset-admin** (no trailing slash), e.g. `http://192.168.x.x:3000`. If **unset**, the app falls back to bundled `medical-knowledge.json` + on-device retrieval (no Mongo server). |

**Important:** Any name starting with **`EXPO_PUBLIC_`** is inlined into the client bundle. It is **not** a secret channel—do not put sensitive tokens there. The Gemini key in `expo.extra` is likewise recoverable from the app binary; the README already flags prototype behavior.

---

## asset-admin server (RAG API + PDF ingestion)

Required when you want **Mongo-backed chunks** and **`/api/rag/chat`**.

| Variable | Typical location | Purpose |
|----------|------------------|---------|
| **`MONGO_URI`** | `asset-admin/.env` | MongoDB connection string for `Chunk`, `Asset`, etc. |
| **`GEMINI_API_KEY`** | `asset-admin/.env` | PDF text extraction, chunk embeddings, RAG chat generation when the request does not override the key. |
| **`PORT`** | Optional in `.env` | Listen port (default **3000**). |

The chat route accepts **`x-gemini-api-key`** / **`geminiApiKey`** in the JSON body (prototype); production should rely on server-side **`GEMINI_API_KEY`** only.

---

## Quick checklist

1. **asset-admin:** `.env` with **`MONGO_URI`** + **`GEMINI_API_KEY`**; server running and reachable from the device (LAN URL).
2. **Expo:** **`GEMINI_API_KEY`** configured (see README).
3. **Expo:** **`EXPO_PUBLIC_RAG_API_URL`** or **`expo.extra.RAG_API_URL`** set to the asset-admin base URL **if** you use Mongo RAG (omit for JSON-only fallback).

---

## Related docs

- **[README.md](../README.md)** — Gemini key setup for Expo  
- **[rag-mongodb-setup.md](./rag-mongodb-setup.md)** — End-to-end Mongo RAG wiring  
- **[rag-evaluation-checklist.md](./rag-evaluation-checklist.md)** — Smoke-test checklist  
- **`asset-admin/.env.example`** — Server env template  
