const mongoose = require('mongoose')

const ragChunkSchema = new mongoose.Schema(
  {
    chunkId: { type: String, required: true, unique: true, index: true },
    text: { type: String, required: true },
    source: { type: String, required: true },
    chunkIndex: { type: Number, default: 0 },
    embedding: { type: [Number], required: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('RagChunk', ragChunkSchema)
