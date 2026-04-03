const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
    assetId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    content_type: { type: String, enum: ['animation', 'video_segment', 'diagram', 'text_explanation', 'analogy', 'glossary_entry', 'case_example', 'procedural_demo'], required: true },
    module_id: {type: int, min: 1, max: 99, required: true},
    lesson_id: { type: String, match: [/^\d\.\d$/, 'Id must be in M.L format'], required: true },
    file_path: { type: String, required: true },
    duration_seconds: { type: int, required: function () { return this.content_type===videoSegment;}, default: null },
    transcript_available: { type: Boolean, default: false },
    author_source: { type: String, required: true },
    date_created: { type: Date, default: Date.now },
    version: { type: String, match: [/^v\d\.\d$/, 'Id must be in vX.Y format'], required: true },
    clinical_reviewed: {type: Boolean, default: false},
    tags: {
        type: Map,
        of: mongoose.Schema.Types.Mixed, // supports string, array, object
        default: {
            primary_concept: null,             // String
            secondary_concepts: [],            // [String]
            prerequisite_concept_ids: [],      // [String]
            next_concept_ids: [],               // [String]
            disease_relevance_tags: [],         // [String]
            concept_domain: null,               // String
            explains_symptom: [],               // [String]
            explains_procedure: []              // [String]
        }
    }
}, { timestamps: true });

module.exports = mongoose.model("Asset", assetSchema);