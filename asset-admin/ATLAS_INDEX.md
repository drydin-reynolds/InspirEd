# MongoDB Atlas: RAG chunk indexes (prototype)

## Vector Search (optional but recommended at scale)

1. In Atlas, open your cluster → **Search** → **Create Search Index**.
2. Choose **JSON Editor** and paste the contents of [`atlas-vector-index.example.json`](./atlas-vector-index.example.json) (adjust `numDimensions` if you change embedding model).
3. Target collection: `chunks` (database name from your `MONGO_URI`).

The Node server can still run **without** this index: retrieval falls back to in-process cosine similarity over stored `embedding` arrays (fine for small chunk counts; upgrade to `$vectorSearch` for large corpora).

## Standard indexes

Mongoose creates indexes declared on [`models/Chunk.js`](./models/Chunk.js) at startup when supported. For production, verify in Atlas:

- Compound unique: `{ asset: 1, chunkIndex: 1 }`
- `embedding_status` on `assets` for Browse filters
