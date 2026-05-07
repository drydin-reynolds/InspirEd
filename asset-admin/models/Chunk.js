const mongoose = require('mongoose')

const chunkSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true
    },
    /** Human-readable asset_id from Asset (e.g. ANI_M01_L11_001) */
    sourceAssetId: { type: String, required: true, index: true },
    chunkIndex: { type: Number, required: true, min: 0 },
    text: { type: String, required: true },
    /** text-embedding-004 vector (768 dims) */
    embedding: { type: [Number], default: [] },
    sourceTitle: { type: String, required: true },
    contentType: { type: String },
    clinicallyReviewed: { type: Boolean, default: false },
    diseaseTags: { type: [String], default: [] },
    healthLiteracyLevel: { type: String },
    /** Monotonic ingest version for invalidation */
    ingestVersion: { type: String, default: '1.0' }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

chunkSchema.index({ asset: 1, chunkIndex: 1 }, { unique: true })
chunkSchema.index({ clinicallyReviewed: 1 })
chunkSchema.index({ diseaseTags: 1 })

module.exports = mongoose.model('Chunk', chunkSchema)
