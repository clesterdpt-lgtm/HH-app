# CareNote

Clinical documentation assistant for home health care workers. Record, transcribe, and generate professional clinical notes from visit observations.

## Tech Stack

- **Frontend**: Single-page HTML/CSS/JS (`index.html`) — no build step
- **Hosting**: GitHub Pages
- **Backend**: Supabase (Auth, PostgreSQL, Edge Functions)
- **AI**: Anthropic Claude API (`claude-sonnet-4-20250514`) for note generation + assist
- **Transcription**: OpenAI Whisper API for audio-to-text
- **Storage**: Supabase Storage (exercise photo uploads)
- **PDF**: jsPDF (client-side PDF generation via CDN)
- **Offline**: IndexedDB for local persistence, service worker for caching

## Features

### Modular Architecture
- Sidebar navigation with collapsible module menu
- **Dashboard**: Home screen with recent activity feed (notes, meds, HEPs, mileage) and quick-action buttons to each module
- **Clinical Notes (CareNote)**: Primary documentation module
- **Medication Manager**: Medication tracking and history
- **Home Exercise Program (HEP)**: Exercise library and program builder
- **Patient Education**: Condition-specific education modules with list builder and export
- **Vehicle Tracker**: Mileage logging, expense tracking, and IRS deduction reports
- **Calendar**: Unified date-based view across all modules
- **Label Search**: Cross-module search by label across notes, meds, HEPs, and education lists
- Active module and tab persist across page refreshes
- **Browser history support**: Back/forward buttons navigate between modules and tabs
- **Profile dropdown** in header with account email and sign-out
- **Settings** accessible from both sidebar and profile dropdown
- Clickable CareNote logo navigates back to Dashboard

### Note Generation
- Record audio or type notes manually
- Select from built-in note types: Initial Evaluation, Start of Care, Discharge, Reassessment, Recertification, Routine Visit
- Create custom templates with custom AI instructions and sections
- Configure built-in note types with custom sections and AI instructions
- AI generates properly formatted clinical documentation from raw notes
- HIPAA-aware: automatically strips patient-identifying information

### Output Formats
- **Full Documentation**: Structured clinical note with all standard sections
- **Clinical Summary**: Concise 2-3 paragraph narrative (for users who document vitals, pain, plan, etc. separately in their EMR)
- Default format set in Settings, with per-note override toggle

### Assist (AI Chat)
- Pre-generation review: AI reviews raw notes, asks clarifying questions, flags gaps
- **Category-aware tracking**: When a template has required sections (e.g., Living Environment, Functional Mobility), the assist evaluates each section individually and prioritizes asking about missing ones
- Flags potential HIPAA issues (patient identifiers in notes)
- "Update My Note" rewrites raw notes with new details from the conversation
- Undo button to restore original notes
- In-chat mic recording for voice responses

### Audio Recording
- In-browser audio recording using MediaRecorder API (WebM format)
- Transcription via OpenAI Whisper
- **Chunked transcription**: Recordings exceeding 24MB are automatically split into chunks to stay within Whisper's 25MB limit
- **Audio preservation**: Recordings are always saved to IndexedDB before transcription, so audio is never lost if transcription fails
- Screen Wake Lock to prevent recording from stopping when screen turns off
- **Dim screen mode**: After 8 seconds of inactivity during recording, the screen dims to near-black showing a recording timer — saves battery and adds privacy. "Go Dark" button allows instant dimming without waiting. Requires double-tap to dismiss (prevents pocket wakes)
- Pending Recordings tab for retry after failures

### Settings
- **Default Email**: Set a default recipient address for all email exports
- **Built-in types**: Configure section headings and custom AI instructions on standard note types (Initial Evaluation, Routine Visit, etc.)
- **Custom templates**: Create fully custom note types with their own sections and AI instructions
- **Smart Phrases**: Save abbreviation/expansion pairs (e.g., `.bp` → "Blood pressure within normal limits"). Type `.abbreviation` in the note textarea to trigger inline suggestions
- **Help tooltips**: Each settings section has a ? button explaining the feature
- Template sections flow into both note generation (for structure) and the assist feature (for gap tracking)

### Care Plan Goals
- AI generates 3-5 SMART goals based on the generated clinical note
- Goals include timeframes and measurable milestones
- Editable inline after generation
- Goals persist with notes in Supabase

### Export
- Combined Export button (dropdown on desktop, popup on mobile)
- Email notes via mailto link with optional **default email recipient** (set in Settings)
- PDF download: single note, day's notes, or all notes
- Professional PDF layout with navy header, page numbers, auto-pagination

### Auto-Save Drafts
- Debounced auto-save every 2 seconds to IndexedDB
- Persists textarea content, note type selections, labels, and output format
- Restores on page load
- Clears after successful generation

### Labels
- Tag notes with clinical labels (diagnoses, visit types, etc.)
- Autocomplete suggestions from previously used labels
- Filter history by label

### Offline Support
- Notes queued in IndexedDB when offline
- Pending tab shows queued items
- Auto-processes queue when back online
- Templates cached locally for offline use

### Medication Manager
- Add/edit medications (name, dose, frequency, route, notes)
- **Bulk voice recording**: Read full medication list aloud; Claude AI parses all medications from the transcript
- Medication review modal before saving
- **Pending sub-tab**: Offline queue for bulk recordings with auto-retry
- **History tab**: Date-grouped medication snapshots with labels
- Syncs to Supabase for cross-device access
- Print medication list

### Home Exercise Program (HEP)
- **Exercise Library**: 34 built-in exercises across 7 categories (Upper Body, Lower Body, Core, Balance, Stretching, Breathing, General)
- Each exercise has a semi-realistic cartoon SVG illustration, detailed instructions, and category badge
- **Search and filter** by name, keyword, or category
- **Inline add confirmation**: Adding an exercise shows "✓ Added" on the card without leaving the Library tab; duplicate adds show "✓ Already Added"
- **Custom exercises**: Create and save custom exercises with optional photo upload to your library (syncs via Supabase)
- **Edit exercises**: Edit both custom and built-in exercises; built-in edits are stored as per-user override rows
- **Current HEP builder**: Add exercises, set per-exercise sets/reps/hold time/frequency, reorder or remove
- **Export**: PDF (single-column list or two-column grid layout), email via mailto, or print — buttons in a clean symmetrical grid layout (3-column desktop, 2-column mobile)
- **EMR Documentation**: Generate structured clinical documentation from current or saved HEPs for pasting into EMR systems, with copy, email, and PDF options. Exercises grouped by category with dosage, frequency, and standard patient education footer
- **History tab**: Saved HEPs with labels, search, sort, expandable detail view, load-to-current, and per-entry export via **3-dot kebab menu** (Load, EMR Doc, PDF List/Grid, Email, Delete)
- Integrated into Calendar with purple dot indicators

### Calendar
- Monthly grid view with prev/next/today navigation
- **Colored dot indicators** on days with activity: teal for notes, orange for medications, purple for HEPs, red for pending items
- Click any day to see all items for that date grouped by type
- Day detail shows type badges, timestamps, labels, and text previews
- **Day export**: Email, copy, or PDF all items for a specific date
- Aggregates data from Supabase notes, medication history, HEP history, and IndexedDB pending recordings/notes

### Patient Education
- **Built-in condition modules**: CHF, COPD, Orthostatic Hypotension, and more — each with overview, key points, when-to-call-doctor guidance, and resources
- **Custom modules**: Create and edit your own education modules with title, category, icon, and overview content
- **Edit built-in modules**: Customize any built-in module with revert-to-default option
- **List builder**: Assemble patient-specific education packets from available modules
- **History tab**: Saved education lists with labels, search, sort, and expandable detail
- **Export**: PDF, email, and print — consistent with HEP export workflow
- Integrated into Calendar (green dot indicators) and Label Search

### Vehicle Tracker
- **Mileage Log**: Record daily mileage with date, total miles, and purpose
- **Expenses tab**: Track vehicle-related expenses
- **IRS deduction calculator**: Automatic mileage deduction at the standard IRS rate ($0.67/mile)
- **Year summary**: Annual mileage and expense totals with monthly breakdown
- Data stored locally in IndexedDB

### Label Search
- Cross-module search by label across notes, medications, HEPs, and patient education lists
- Case-insensitive label autocomplete
- Results grouped by module type with export options (copy, email, PDF)
- Redesigned toggle buttons for search type clarity

### History
- All generated notes saved to Supabase
- Grouped by date with expandable items
- Search and filter by label
- **Sort order toggle**: Switch between newest-first and oldest-first in both pending and history sections (persists via localStorage)
- Copy, email, or PDF export any note
- **Unified Edit**: Edit note text, change note type, and manage labels all in one inline editor via the ⋮ overflow menu
- **3-dot overflow menu**: Consolidates all note actions (Copy, Edit, Email, PDF, Delete) into a clean ⋮ button
- Mobile-optimized: text preview hidden on narrow screens for compact list view

### Authentication
- Email/password sign-up and sign-in
- **Forgot password** flow with email reset link

## Project Structure

```
index.html                          # Landing page
app/
  index.html                        # Main application (HTML + CSS + JS)
landing/
  index.html                        # Marketing landing page
manifest.json                       # PWA manifest
service-worker.js                   # Offline caching
icons/                              # App icons (SVG + PNGs)
docs/                               # Product documentation
supabase/
  config.toml                       # Supabase project config
  functions/
    generate-note/index.ts          # Note generation edge function
    assist-note/index.ts            # Assist chat edge function
    transcribe/index.ts             # Whisper transcription edge function
    generate-goals/index.ts         # Care plan goals edge function
    parse-medication/index.ts       # Medication extraction from audio
  migrations/                       # Database migration SQL files
.github/
  workflows/
    pages.yml                       # GitHub Pages auto-deploy workflow
```

## Database Tables

- **notes**: Generated notes (id, user_id, note_type, raw_notes, generated_note, labels, template_id, output_format)
- **note_templates**: Custom and built-in type templates (name, custom_prompt, sections, sort_order, builtin_key)
- **user_preferences**: Per-user settings (hidden_builtin_types, default_output_format, default_email)
- **smart_phrases**: User-defined text expansions (abbreviation, expansion, user_id)
- **care_plan_goals**: AI-generated goals per note (id, note_id, goal_text, timeframe, user_id)
- **med_history**: Medication recording snapshots (id, user_id, title, medications, labels, saved_at)
- **exercise_library**: User-created custom exercises and per-user built-in overrides (id, user_id, name, category, instructions, svg_key, photo_url, builtin_id)
- **hep_history**: Saved home exercise programs (id, user_id, title, exercises, labels, saved_at)
- **edu_custom_modules**: User-created patient education modules (id, user_id, title, category, icon, overview)

## Edge Functions

| Function | Purpose |
|----------|---------|
| `generate-note` | Takes raw notes + note type + output format + optional sections/custom prompt, returns formatted clinical note via Claude API |
| `assist-note` | Chat mode (category-aware review/clarify notes) and rewrite mode (update notes with new details). Tracks required sections and prioritizes missing ones. |
| `transcribe` | Accepts audio blob, sends to OpenAI Whisper, returns transcript |
| `generate-goals` | Takes a clinical note and generates 3-5 SMART care plan goals via Claude API |
| `parse-medication` | Extracts structured medication data from audio transcripts (single or bulk) via Claude API |

## Deployment

**Frontend**: Push to `master` branch deploys to GitHub Pages automatically.

**Edge Functions**:
```
supabase functions deploy generate-note
supabase functions deploy assist-note
supabase functions deploy transcribe
supabase functions deploy generate-goals
supabase functions deploy parse-medication
```

**Database migrations**: Run SQL files in Supabase Dashboard > SQL Editor.

## Key Design Decisions

- **Single HTML file**: No build step, no framework — keeps deployment simple via GitHub Pages
- **Supabase Edge Functions**: Keeps API keys server-side (Anthropic, OpenAI)
- **IndexedDB v10**: Eleven stores — `pendingRecordings`, `templateCache`, `pendingNotes`, `drafts`, `medLists`, `medHistory`, `hepCurrent`, `eduListCurrent`, `mileageLogs`, `vehicleExpenses`, `eduModuleOverrides`
- **Audio-first safety**: Recordings always persist to IndexedDB before transcription attempts, preventing data loss on network or API failures
- **Chunked transcription**: Large recordings auto-split client-side to stay under Whisper's 25MB file limit
- **Built-in type customizations**: Stored in the same `note_templates` table with a `builtin_key` column to distinguish from custom templates
- **Category-aware assist**: When templates define required sections, the assist system prompt instructs Claude to evaluate each section individually and prioritize missing ones in follow-up questions
- **Position: fixed dropdowns**: Export dropdowns use fixed positioning to escape parent `overflow: hidden` on cards/history items
- **Loose equality for ID lookups**: Supabase IDs compared with `==` not `===` to handle potential type differences
- **Per-user exercise overrides**: Editing a built-in exercise creates a user-specific row in `exercise_library` with `builtin_id` referencing the original, preserving the built-in for other users
