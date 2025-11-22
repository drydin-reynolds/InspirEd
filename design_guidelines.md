# InspirEd Mobile App - Design Guidelines

## Brand Identity
**Color Palette:**
- Primary Teal: `#4DB6AC` (from logo, use for primary actions, active states)
- Accent Green: `#A4D65E` (from logo, use for success states, highlights)
- Background: `#FFFFFF` (clean, medical-grade white)
- Secondary Background: `#F5F9F9` (very light teal tint for cards/sections)
- Text Primary: `#1A1A1A` (high contrast for accessibility)
- Text Secondary: `#666666` (for metadata, timestamps)
- Error/Alert: `#E57373` (soft red for medical warnings)
- Border: `#E0E0E0` (subtle dividers)

**Typography:**
- Headings: SF Pro Display (iOS) / Roboto (Android), Bold, sizes 24-32pt
- Body: SF Pro Text (iOS) / Roboto (Android), Regular, 16pt (minimum for medical readability)
- Metadata: 14pt Regular for timestamps, labels
- Line height: 1.5x for all body text (improved readability for stressed parents)

**Tagline:** "Learn to Empower. Empower to Hope." - Display on launch screen and empty states

## Architecture Decisions

### Authentication
**No authentication required** - This is a local-first, single-user app with AsyncStorage.

**Profile/Settings Screen Required:**
- User-customizable avatar (generate 3 preset avatars: parent with child, stethoscope icon, heart-with-lungs icon - all in teal/green palette)
- Display name field for personalization
- App preferences:
  - Recording quality (High/Medium for storage management)
  - Auto-save summaries (toggle)
  - Theme: Light mode only (medical context requires high clarity)

### Navigation Structure
**Tab Navigation (4 tabs + Floating Action Button):**

1. **Home Tab** (house icon) - Dashboard/overview
2. **History Tab** (clock icon) - Past visits list
3. **Planner Tab** (calendar icon) - Next visit preparation
4. **Profile Tab** (user icon) - Settings and preferences

**Floating Action Button (FAB):** 
- Position: Bottom-right, above tab bar
- Icon: Microphone (recording is the core action)
- Color: Primary Teal background with white icon
- Action: Opens "Record Visit" modal screen
- Shadow: `shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2`

## Screen Specifications

### 1. Home/Dashboard Screen
**Stack:** Home Tab
**Purpose:** Overview of recent activity and quick access to key features

**Layout:**
- Header: Transparent, left button: InspirEd logo (small), right button: None
- Top inset: `headerHeight + Spacing.xl`
- Bottom inset: `tabBarHeight + Spacing.xl`
- Main content: ScrollView with sections

**Components:**
- Welcome card: "Hello, [Name]" with motivational quote related to empowerment
- Recent visit summary card (if exists): Shows last visit date, doctor name, 2-line summary preview
- Quick stats: Total visits recorded, questions asked count
- Quick action buttons:
  - "Ask a Question" (opens chat if visits exist)
  - "Prepare Next Visit" (navigates to Planner)
- Empty state (no visits): Illustration with "Record your first visit" CTA pointing to FAB

### 2. Record Visit Modal Screen
**Type:** Native Modal (full screen)
**Purpose:** Record audio of doctor visits

**Layout:**
- Header: Custom, non-transparent, teal background
  - Left button: "Cancel" (with confirmation alert if recording in progress)
  - Center: "Recording Visit"
  - Right button: None
- Bottom inset: `insets.bottom + Spacing.xl`

**Components:**
- Large circular waveform visualization (teal gradient based on audio levels)
- Timer display (MM:SS format, 28pt, centered)
- Doctor name input field (above recording controls, optional)
- Recording controls (centered, large touch targets 64x64pt minimum):
  - Record button (red circle when inactive, pulsing red when recording)
  - Pause button (shows only when recording)
  - Stop/Save button (checkmark icon, teal)
- Instruction text: "Find a quiet spot and tap to start recording" (empty state)

### 3. Visit History Screen
**Stack:** History Tab
**Purpose:** Browse past recorded visits

**Layout:**
- Header: Default, non-transparent, teal background
  - Title: "Visit History"
  - Right button: Search icon (opens search bar overlay)
- Main content: FlatList with pull-to-refresh
- Top inset: `Spacing.xl`
- Bottom inset: `tabBarHeight + Spacing.xl`

**Components:**
- List items (cards with subtle shadow):
  - Date (large, bold)
  - Doctor name (if provided)
  - Duration badge
  - 2-line summary preview (AI-generated)
  - Status indicator: "Summarized" (green dot) or "Processing" (amber dot)
- Empty state: Illustration with "No visits yet" and CTA to record

### 4. Visit Detail Screen
**Stack:** Pushed from History
**Purpose:** View full visit summary, transcript, and ask questions

**Layout:**
- Header: Default with back button
  - Left: Back arrow
  - Title: Date of visit
  - Right: Share icon (native share sheet for summary text)
- Main content: ScrollView
- Top inset: `Spacing.xl`
- Bottom inset: `insets.bottom + Spacing.xl`

**Components:**
- Audio playback card: Waveform, play/pause, timestamp scrubber
- AI Summary section:
  - "Visit Summary" heading
  - Key points as bulleted list
  - Diagnoses/conditions mentioned (if any)
  - Prescribed actions/medications (highlighted in accent green box)
  - Medical terms explained (expandable accordion items)
- "Ask Questions" button (large, full-width, teal) - navigates to chat
- Transcript section (expandable, collapsed by default)

### 5. Chat/Questions Screen
**Stack:** Pushed from Visit Detail
**Purpose:** Ask AI questions about a specific visit

**Layout:**
- Header: Default with back button
  - Left: Back arrow
  - Title: "Ask Questions"
  - Right: Info icon (explains how the AI works)
- Main content: Chat interface
- Top inset: `Spacing.xl`
- Bottom inset: `insets.bottom + Spacing.xl` (above keyboard)

**Components:**
- Message bubbles:
  - User messages: Teal background, white text, right-aligned
  - AI responses: Light gray background, dark text, left-aligned
  - System messages: Centered, small, italic (e.g., "This is AI-generated medical information. Always consult your doctor.")
- Input bar (fixed to bottom):
  - Text input field with placeholder "Ask about this visit..."
  - Send button (paper plane icon, teal)
- Suggested questions (show before first message): "What should I watch for?" "Explain [medical term]"

### 6. Next Visit Planner Screen
**Stack:** Planner Tab
**Purpose:** Prepare questions and checklist for upcoming appointment

**Layout:**
- Header: Default, non-transparent, teal background
  - Title: "Next Visit Planner"
  - Right: "Add" button (adds question to list)
- Main content: Scrollable form
- Top inset: `Spacing.xl`
- Bottom inset: `tabBarHeight + Spacing.xl`

**Components:**
- Appointment date picker (optional, for reminder context)
- "Questions to Ask" section:
  - Checklist-style list with checkboxes
  - Each item editable/deletable
  - Reorderable (drag handles)
- "Things to Bring" checklist (insurance card, medications list, etc.)
- AI suggestion button: "Help me think of questions" (uses past visits to suggest)
- "Save" button (sticky at bottom, above tab bar)

### 7. Profile/Settings Screen
**Stack:** Profile Tab
**Purpose:** User personalization and app settings

**Layout:**
- Header: Default, transparent
  - Title: "Profile"
- Main content: ScrollView with sections
- Top inset: `headerHeight + Spacing.xl`
- Bottom inset: `tabBarHeight + Spacing.xl`

**Components:**
- Avatar selection (3 presets, centered at top)
- Display name input field
- Settings sections:
  - Reading Level: SMOG index preference (6th, 8th, 10th, 12th grade) - default 8th grade
  - Recording: Quality preference
  - Privacy: Auto-save toggle, data export button
  - About: App version, "Learn to Empower. Empower to Hope." tagline
  - Help: Tutorial replay, support email link

## Visual Design Principles

**Accessibility Requirements:**
- Minimum touch target: 44x44pt (WCAG AAA)
- Color contrast ratio: 4.5:1 for all text (medical context requires clarity)
- Support Dynamic Type (iOS) and font scaling (Android)
- VoiceOver/TalkBack labels on all interactive elements
- Audio recording must show visual feedback for users with hearing challenges

**Interaction Patterns:**
- All buttons: Press scales to 0.95, teal buttons darken 10% on press
- Cards: No shadow by default, add subtle shadow on press for feedback
- Floating Action Button: Bounce animation on first app launch (one-time tutorial)
- Recording button: Continuous pulsing animation when active
- Loading states: Use teal spinner, never block UI completely

**Critical Assets:**
- **3 preset avatars** for profile (parent-child, stethoscope, heart-lungs - all in brand colors)
- **Empty state illustrations** (max 3): First visit, no questions, planner empty - all should feel hopeful, not clinical
- **InspirEd logo** (small version for header, provided in branding)
- **Waveform visualization** (procedurally generated, not an asset)

**Content Tone:**
- Empowering, never condescending
- Plain language explanations (default 8th-grade reading level, adjustable via SMOG index in settings)
- Acknowledge stress: "Take a breath. We're here to help."
- Celebrate small wins: "Great job recording your 5th visit!"

**SMOG Index & Readability:**
- Track user's preferred reading level (SMOG index) in settings
- All AI-generated content (summaries, explanations, chat responses) must be adjusted to match user's literacy level
- Calculate SMOG index for AI responses and adjust complexity if needed
- Display reading level indicator in settings to help users understand accessibility
- Default to 8th grade (SMOG score ~8) for medical content accessibility
- Formula: SMOG = 1.0430 × √(polysyllables × 30/sentences) + 3.1291
  - Polysyllables = words with 3+ syllables
  - Target: 6th grade (6-7), 8th grade (8-9), 10th grade (10-11), 12th grade (12+)