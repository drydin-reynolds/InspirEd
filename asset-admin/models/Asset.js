const mongoose = require('mongoose')

const assetSchema = new mongoose.Schema({

  // ── Auto-generated ──────────────────────────────────────────
  asset_id:             { type: String },
  schema_version:       { type: String, default: '1.0' },
  transcript_available: { type: Boolean, default: false },
  date_created:         { type: Date },

  // ── Step 1: File Upload & Basics ────────────────────────────
  file_path:            { type: String },
  original_filename:    { type: String },
  title:                { type: String, required: true, maxlength: 200 },
  content_type: {
    type: String,
    required: true,
    enum: [
      'animation','video_segment','diagram','text_explanation',
      'analogy','glossary_entry','case_example','procedural_demo'
    ]
  },
  module_id:            { type: Number, required: true, min: 1, max: 99 },
  lesson_id:            { type: String, required: true },
  author_source:        { type: String, default: '' },
  clinical_reviewed:    { type: Boolean, default: false },
  version:              { type: String, default: 'v1.0' },
  language_versions: {
    type: [String],
    enum: ['en','es','fr','pt','zh','other'],
    default: ['en']
  },
  plain_language_version: { type: Boolean, default: false },

  // ── Step 2: Content Classification ──────────────────────────
  disease_relevance_tags: {
    type: [String],
    required: true,
    enum: ['SFTPC mutation','SFTPB deficiency','ABCA3 deficiency','general chILD']
  },
  concept_domain: {
    type: String,
    required: true,
    enum: ['lung_biology','genetics','treatment','diagnosis','home_care','psychosocial']
  },
  primary_concept:    { type: String, required: true },
  secondary_concepts: { type: [String], default: [] },
  explains_symptom:   { type: [String], default: [] },
  explains_procedure: { type: [String], default: [] },

  // ── Step 3: Learning Pathway ─────────────────────────────────
  explanation_role: {
    type: String,
    enum: ['definition','mechanism','analogy','visual_example','clinical_application','summary','follow_up'],
    default: 'definition'
  },
  sequence_position:  { type: Number, min: 1, default: 1 },
  learning_objective: { type: String, default: '' },
  bloom_level: {
    type: String,
    enum: ['remember','understand','apply','analyze','evaluate','create'],
    default: 'understand'
  },
  object_granularity: {
    type: String,
    enum: ['micro','meso','macro'],
    default: 'meso'
  },
  can_stand_alone:          { type: Boolean, required: true },
  prerequisite_concept_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
  next_concept_ids:         [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
  instructional_strategy: {
    type: [String],
    enum: ['segmenting','spatial_contiguity','personalization','modality','coherence','signaling'],
    default: []
  },

  // ── Step 4: Audience & Literacy ──────────────────────────────
  target_audience: {
    type: [String],
    required: true,
    enum: ['caregiver_parent','teen_patient','adult_patient','extended_family','school_staff']
  },
  health_literacy_level: {
    type: String,
    required: true,
    enum: ['foundational','functional','interactive','critical','contributory']
  },
  medical_terminology_level: {
    type: String,
    required: true,
    enum: ['none','minimal','moderate','clinical']
  },
  reading_level_grade: { type: Number, min: 1, max: 16 },
  modality_type: {
    type: String,
    enum: ['visual_only','audio_only','audio_visual','text_only','interactive'],
    default: 'audio_visual'
  },

  // ── Step 5: Adaptive Delivery ────────────────────────────────
  stress_state_compatibility: {
    type: [String],
    required: true,
    enum: ['baseline_calm','mild_concern','moderate_stress','acute_crisis','post_bad_news','post_hospitalization']
  },
  parent_expertise_stage: {
    type: [String],
    required: true,
    enum: ['novice','emerging','developing','proficient','expert_contributor']
  },
  care_journey_stage: {
    type: [String],
    required: true,
    enum: ['pre_diagnosis','diagnosis','acute_management','home_management','advanced_planning']
  },
  cognitive_load_rating: {
    type: String,
    enum: ['low','medium','high'],
    default: 'medium'
  },
  element_interactivity: {
    type: String,
    enum: ['low','medium','high'],
    default: 'medium'
  },
  appropriate_after_event:     { type: [String], default: [] },
  contraindicated_after_event: { type: [String], default: [] },
  just_in_time_trigger:        { type: String },

  // ── Step 6: Psychosocial ─────────────────────────────────────
  emotional_tone: {
    type: String,
    enum: ['reassuring','matter_of_fact','empowering','cautionary','validating'],
    default: 'reassuring'
  },
  emotional_sensitivity_level: {
    type: String,
    enum: ['low','medium','high','critical'],
    default: 'medium'
  },
  includes_reassurance:     { type: Boolean, default: false },
  addresses_guilt_or_blame: { type: Boolean, default: false },
  decision_support_context: { type: Boolean, default: false },
  isolation_acknowledgment: { type: Boolean, default: false },

  // ── Step 7: NLP & Searchability ──────────────────────────────
  parent_question_patterns: { type: [String], required: true },
  query_synonyms:           { type: [String], default: [] },
  intent_type: {
    type: String,
    enum: ['explain','reassure','define','compare','decide','procedure_how_to','prognosis'],
    default: 'explain'
  },
  response_type: {
    type: String,
    enum: ['explanation','definition','analogy','reassurance','decision_support','step_by_step'],
    default: 'explanation'
  },
  keyword_triggers: { type: [String], required: true },

  // ── Step 8: Accessibility ────────────────────────────────────
  closed_captions:          { type: Boolean },
  alt_text:                 { type: String, maxlength: 500 },
  audio_narration:          { type: Boolean, default: false },
  screen_reader_compatible: { type: Boolean, default: true },
  mobile_optimized:         { type: Boolean, default: true },
  transcript_file_path:     { type: String },

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

// ── Pre-save hook (async — throw errors, never call next) ─────
assetSchema.pre('save', async function () {

  // Set date_created on first save
  if (!this.date_created) this.date_created = new Date()

  // Auto-generate asset_id
  if (!this.asset_id && this.module_id && this.lesson_id && this.content_type) {
    const abbrev = {
      animation:'ANI', video_segment:'VID', diagram:'DIA',
      text_explanation:'TXT', analogy:'ANA', glossary_entry:'GLS',
      case_example:'CAS', procedural_demo:'PRO'
    }
    const type  = abbrev[this.content_type] || 'UNK'
    const mod   = String(this.module_id).padStart(2, '0')
    const les   = this.lesson_id.replace('.', '')
    const count = await mongoose.model('Asset').countDocuments() + 1
    const seq   = String(count).padStart(3, '0')
    this.asset_id = `${type}_M${mod}_L${les}_${seq}`
  }

  // Block: can_stand_alone = false but no prerequisites
  if (this.can_stand_alone === false &&
      (!this.prerequisite_concept_ids || this.prerequisite_concept_ids.length === 0)) {
    throw new Error('You indicated this cannot stand alone. Please add at least one prerequisite asset.')
  }

  // Block: NLP minimums
  if (!this.parent_question_patterns || this.parent_question_patterns.length < 2) {
    throw new Error('Please add at least 2 parent question patterns.')
  }
  if (!this.keyword_triggers || this.keyword_triggers.length < 3) {
    throw new Error('Please add at least 3 keyword triggers.')
  }

  // Block: disease relevance tags empty
  if (!this.disease_relevance_tags || this.disease_relevance_tags.length === 0) {
    throw new Error('At least one diagnosis tag is required.')
  }

  // Block: at least one target audience (Minimum Tags.md)
  if (!this.target_audience || this.target_audience.length === 0) {
    throw new Error('At least one target audience is required.')
  }
})

module.exports = mongoose.model('Asset', assetSchema)
