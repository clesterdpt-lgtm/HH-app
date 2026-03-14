# CareNote

Clinical documentation assistant for home health care workers. Record, transcribe, and generate professional clinical notes from visit observations.

## Tech Stack

- **Frontend**: Single-page HTML/CSS/JS (`index.html`) — no build step
- **Hosting**: GitHub Pages
- **Backend**: Supabase (Auth, PostgreSQL, Edge Functions)
- **AI**: Anthropic Claude API (`claude-sonnet-4-20250514`) for note generation + assist
- **Transcription**: OpenAI Whisper API for audio-to-text
- **PDF**: jsPDF (client-side PDF generation via CDN)
- **Offline**: IndexedDB for local persistence, service worker for caching

## Features

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
- **Dim screen mode**: After 8 seconds of inactivity during recording, the screen dims to near-black showing a recording timer — saves battery and adds privacy. Requires double-tap to dismiss (prevents pocket wakes)
- Pending Recordings tab for retry after failures

### Editable Templates
- **Built-in types**: Configure section headings and custom AI instructions on standard note types (Initial Evaluation, Routine Visit, etc.)
- **Custom templates**: Create fully custom note types with their own sections and AI instructions
- **Smart Phrases**: Save abbreviation/expansion pairs (e.g., `.bp` → "Blood pressure within normal limits"). Type `.abbreviation` in the note textarea to trigger inline suggestions
- **Help tooltips**: Each template section has a ? button explaining the feature
- Template sections flow into both note generation (for structure) and the assist feature (for gap tracking)

### Export
- Combined Export button (dropdown on desktop, popup on mobile)
- Email notes via mailto link
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

### History
- All generated notes saved to Supabase
- Grouped by date with expandable items
- Search and filter by label
- Copy, email, or PDF export any note
- **Unified Edit**: Edit note text, change note type, and manage labels all in one inline editor via the ⋮ overflow menu
- **3-dot overflow menu**: Consolidates all note actions (Copy, Edit, Email, PDF, Delete) into a clean ⋮ button
- Mobile-optimized: text preview hidden on narrow screens for compact list view

## Project Structure

```
index.html                          # Entire app (HTML + CSS + JS)
manifest.json                       # PWA manifest
service-worker.js                   # Offline caching
icons/                              # App icons (SVG + PNGs)
supabase/
  config.toml                       # Supabase project config
  functions/
    generate-note/index.ts          # Note generation edge function
    assist-note/index.ts            # Assist chat edge function
    transcribe/index.ts             # Whisper transcription edge function
  migrations/                       # Database migration SQL files
```

## Database Tables

- **notes**: Generated notes (id, user_id, note_type, raw_notes, generated_note, labels, template_id, output_format)
- **note_templates**: Custom and built-in type templates (name, custom_prompt, sections, sort_order, builtin_key)
- **user_preferences**: Per-user settings (hidden_builtin_types, default_output_format)
- **smart_phrases**: User-defined text expansions (abbreviation, expansion, user_id)

## Edge Functions

| Function | Purpose |
|----------|---------|
| `generate-note` | Takes raw notes + note type + output format + optional sections/custom prompt, returns formatted clinical note via Claude API |
| `assist-note` | Chat mode (category-aware review/clarify notes) and rewrite mode (update notes with new details). Tracks required sections and prioritizes missing ones. |
| `transcribe` | Accepts audio blob, sends to OpenAI Whisper, returns transcript |

## Deployment

**Frontend**: Push to `master` branch deploys to GitHub Pages automatically.

**Edge Functions**:
```
supabase functions deploy generate-note
supabase functions deploy assist-note
supabase functions deploy transcribe
```

**Database migrations**: Run SQL files in Supabase Dashboard > SQL Editor.

## Key Design Decisions

- **Single HTML file**: No build step, no framework — keeps deployment simple via GitHub Pages
- **Supabase Edge Functions**: Keeps API keys server-side (Anthropic, OpenAI)
- **IndexedDB v4**: Four stores — `pendingRecordings`, `templateCache`, `pendingNotes`, `drafts`
- **Audio-first safety**: Recordings always persist to IndexedDB before transcription attempts, preventing data loss on network or API failures
- **Chunked transcription**: Large recordings auto-split client-side to stay under Whisper's 25MB file limit
- **Built-in type customizations**: Stored in the same `note_templates` table with a `builtin_key` column to distinguish from custom templates
- **Category-aware assist**: When templates define required sections, the assist system prompt instructs Claude to evaluate each section individually and prioritize missing ones in follow-up questions
- **Position: fixed dropdowns**: Export dropdowns use fixed positioning to escape parent `overflow: hidden` on cards/history items
- **Loose equality for ID lookups**: Supabase IDs compared with `==` not `===` to handle potential type differences
