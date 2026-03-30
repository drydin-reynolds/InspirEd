require('dotenv').config()
const express  = require('express')
const mongoose = require('mongoose')
const multer   = require('multer')
const path     = require('path')
const Asset    = require('./models/Asset')

const app = express()
app.use(express.json())
app.use(express.static('public'))
app.use('/uploads', express.static('uploads'))

// ── File upload config ────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /mp4|mov|png|jpg|jpeg|pdf|txt|html|vtt|srt/
    const ext = path.extname(file.originalname).toLowerCase().slice(1)
    allowed.test(ext) ? cb(null, true) : cb(new Error('File type not allowed'))
  }
})

// ── Upload route ──────────────────────────────────────────────
app.post('/upload', upload.fields([
  { name: 'file',       maxCount: 1 },
  { name: 'transcript', maxCount: 1 }
]), async (req, res) => {
  try {
    const b = req.body

    const arr = (key) => {
      const v = b[key + '[]'] || b[key]
      if (!v) return []
      return Array.isArray(v) ? v : [v]
    }

    const boolField = (key) => {
      const v = b[key]
      if (v === 'true'  || v === true)  return true
      if (v === 'false' || v === false) return false
      return undefined
    }

    const asset = new Asset({
      title:                  b.title,
      content_type:           b.content_type,
      module_id:              parseInt(b.module_id),
      lesson_id:              b.lesson_id,
      author_source:          b.author_source,
      version:                b.version || 'v1.0',
      clinical_reviewed:      boolField('clinical_reviewed'),
      plain_language_version: boolField('plain_language_version'),
      language_versions:      arr('language_versions'),

      disease_relevance_tags: arr('disease_relevance_tags'),
      concept_domain:         b.concept_domain,
      primary_concept:        b.primary_concept,
      secondary_concepts:     arr('secondary_concepts'),
      explains_symptom:       arr('explains_symptom'),
      explains_procedure:     arr('explains_procedure'),

      explanation_role:       b.explanation_role,
      sequence_position:      parseInt(b.sequence_position),
      learning_objective:     b.learning_objective,
      bloom_level:            b.bloom_level,
      object_granularity:     b.object_granularity,
      can_stand_alone:        boolField('can_stand_alone'),
      prerequisite_concept_ids: arr('prerequisite_concept_ids'),
      next_concept_ids:         arr('next_concept_ids'),
      instructional_strategy:   arr('instructional_strategy'),

      target_audience:           arr('target_audience'),
      health_literacy_level:     b.health_literacy_level,
      medical_terminology_level: b.medical_terminology_level,
      reading_level_grade:       b.reading_level_grade ? parseInt(b.reading_level_grade) : undefined,
      modality_type:             b.modality_type,

      stress_state_compatibility: arr('stress_state_compatibility'),
      parent_expertise_stage:     arr('parent_expertise_stage'),
      care_journey_stage:         arr('care_journey_stage'),
      cognitive_load_rating:      b.cognitive_load_rating,
      element_interactivity:      b.element_interactivity,
      appropriate_after_event:    arr('appropriate_after_event'),
      contraindicated_after_event: arr('contraindicated_after_event'),
      just_in_time_trigger:       b.just_in_time_trigger,

      emotional_tone:              b.emotional_tone,
      emotional_sensitivity_level: b.emotional_sensitivity_level,
      includes_reassurance:        boolField('includes_reassurance'),
      addresses_guilt_or_blame:    boolField('addresses_guilt_or_blame'),
      decision_support_context:    boolField('decision_support_context'),
      isolation_acknowledgment:    boolField('isolation_acknowledgment'),

      parent_question_patterns: arr('parent_question_patterns'),
      query_synonyms:           arr('query_synonyms'),
      intent_type:              b.intent_type,
      response_type:            b.response_type,
      keyword_triggers:         arr('keyword_triggers'),

      closed_captions:          boolField('closed_captions'),
      alt_text:                 b.alt_text,
      audio_narration:          boolField('audio_narration'),
      screen_reader_compatible: boolField('screen_reader_compatible') ?? true,
      mobile_optimized:         boolField('mobile_optimized') ?? true,

      file_path:            req.files?.file?.[0]
                              ? `/uploads/${req.files.file[0].filename}` : null,
      original_filename:    req.files?.file?.[0]?.originalname || null,
      transcript_file_path: req.files?.transcript?.[0]
                              ? `/uploads/${req.files.transcript[0].filename}` : null,
    })

    await asset.save()
    res.json({ success: true, asset_id: asset.asset_id, asset })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

// ── Fetch all assets (used by typeahead) ──────────────────────
app.get('/assets', async (req, res) => {
  try {
    const assets = await Asset.find({}, 'asset_id title').sort({ created_at: -1 })
    res.json(assets)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})





// ── Get single asset ──────────────────────────────────────────
app.get('/assets/:id', async (req, res) => {
    try {
      const asset = await Asset.findById(req.params.id)
      if (!asset) return res.status(404).json({ error: 'Asset not found' })
      res.json(asset)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
  
  // ── Search + filter assets ────────────────────────────────────
  app.get('/assets/search/query', async (req, res) => {
    try {
      const { q, content_type, disease_tag, concept_domain } = req.query
      const filter = {}
      if (q) {
        filter.$or = [
          { title:    { $regex: q, $options: 'i' } },
          { asset_id: { $regex: q, $options: 'i' } }
        ]
      }
      if (content_type)  filter.content_type          = content_type
      if (disease_tag)   filter.disease_relevance_tags = disease_tag
      if (concept_domain) filter.concept_domain        = concept_domain
  
      const assets = await Asset.find(filter)
        .sort({ created_at: -1 })
        .limit(200)
      res.json(assets)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
  
  // ── Delete asset ──────────────────────────────────────────────
  app.delete('/assets/:id', async (req, res) => {
    try {
      await Asset.findByIdAndDelete(req.params.id)
      res.json({ success: true })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })
  
  // ── Update asset ──────────────────────────────────────────────
  app.patch('/assets/:id', upload.fields([
    { name: 'file',       maxCount: 1 },
    { name: 'transcript', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const b = req.body
      const arr = (key) => {
        const v = b[key + '[]'] || b[key]
        if (!v) return undefined
        return Array.isArray(v) ? v : [v]
      }
      const boolField = (key) => {
        const v = b[key]
        if (v === 'true'  || v === true)  return true
        if (v === 'false' || v === false) return false
        return undefined
      }
  
      const updates = {}
      const simpleFields = [
        'title','content_type','module_id','lesson_id','author_source','version',
        'concept_domain','primary_concept','explanation_role','sequence_position',
        'learning_objective','bloom_level','object_granularity','health_literacy_level',
        'medical_terminology_level','reading_level_grade','modality_type',
        'cognitive_load_rating','element_interactivity','just_in_time_trigger',
        'emotional_tone','emotional_sensitivity_level','intent_type','response_type','alt_text'
      ]
      simpleFields.forEach(f => { if (b[f] !== undefined) updates[f] = b[f] })
  
      const arrayFields = [
        'language_versions','disease_relevance_tags','secondary_concepts',
        'explains_symptom','explains_procedure','prerequisite_concept_ids',
        'next_concept_ids','instructional_strategy','target_audience',
        'stress_state_compatibility','parent_expertise_stage','care_journey_stage',
        'appropriate_after_event','contraindicated_after_event',
        'parent_question_patterns','query_synonyms','keyword_triggers'
      ]
      arrayFields.forEach(f => {
        const v = arr(f)
        if (v !== undefined) updates[f] = v
      })
  
      const boolFields = [
        'clinical_reviewed','plain_language_version','can_stand_alone',
        'includes_reassurance','addresses_guilt_or_blame','decision_support_context',
        'isolation_acknowledgment','audio_narration','screen_reader_compatible',
        'mobile_optimized','closed_captions'
      ]
      boolFields.forEach(f => {
        const v = boolField(f)
        if (v !== undefined) updates[f] = v
      })
  
      if (req.files?.file?.[0]) {
        updates.file_path         = `/uploads/${req.files.file[0].filename}`
        updates.original_filename = req.files.file[0].originalname
      }
      if (req.files?.transcript?.[0]) {
        updates.transcript_file_path = `/uploads/${req.files.transcript[0].filename}`
      }
  
      const asset = await Asset.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      )
      if (!asset) return res.status(404).json({ error: 'Asset not found' })
      res.json({ success: true, asset })
    } catch (err) {
      res.status(400).json({ success: false, error: err.message })
    }
  })





/*

// ── Quick test route (remove before going to production) ─────
app.get('/test-save', async (req, res) => {
    try {
      const asset = new Asset({
        title:                  'Test asset — pulmonary surfactant intro',
        content_type:           'animation',
        module_id:              1,
        lesson_id:              '1.1',
        author_source:          'Test Author',
        version:                'v1.0',
        clinical_reviewed:      true,
        plain_language_version: false,
        language_versions:      ['en'],
  
        disease_relevance_tags: ['general chILD'],
        concept_domain:         'lung_biology',
        primary_concept:        'pulmonary surfactant',
        secondary_concepts:     ['alveoli', 'surface tension'],
  
        explanation_role:       'definition',
        sequence_position:      1,
        learning_objective:     'Explain how surfactant keeps alveoli open',
        bloom_level:            'understand',
        object_granularity:     'meso',
        can_stand_alone:        true,
  
        target_audience:           ['caregiver_parent'],
        health_literacy_level:     'functional',
        medical_terminology_level: 'minimal',
        modality_type:             'audio_visual',
  
        stress_state_compatibility: ['baseline_calm','mild_concern'],
        parent_expertise_stage:     ['novice','emerging'],
        care_journey_stage:         ['diagnosis','home_management'],
        cognitive_load_rating:      'low',
        element_interactivity:      'low',
  
        emotional_tone:              'reassuring',
        emotional_sensitivity_level: 'low',
        includes_reassurance:        false,
        addresses_guilt_or_blame:    false,
        decision_support_context:    false,
        isolation_acknowledgment:    false,
  
        parent_question_patterns: [
          'Why does my child need oxygen?',
          'What is surfactant?'
        ],
        intent_type:      'explain',
        response_type:    'explanation',
        keyword_triggers: ['surfactant','oxygen','alveoli'],
  
        closed_captions:          true,
        alt_text:                 'Animated diagram showing surfactant molecules lining alveoli',
        audio_narration:          false,
        screen_reader_compatible: true,
        mobile_optimized:         true,
      })
  
      await asset.save()
      res.json({ success: true, asset_id: asset.asset_id, asset })
    } catch (err) {
      res.status(400).json({ success: false, error: err.message })
    }
  })
 

*/
















// ── Connect to MongoDB then start server ──────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(process.env.PORT || 3000, () =>
      console.log(`Server running at http://localhost:${process.env.PORT || 3000}`)
    )
  })
  .catch(err => console.error('Connection error:', err))
