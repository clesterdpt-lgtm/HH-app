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
- AI generates properly formatted clinical documentation from raw notes
- HIPAA-aware: automatically strips patient-identifying information

### Output Formats
- **Full Documentation**: Structured clinical note with all standard sections
- **Clinical Summary**: Concise 2-3 paragraph narrative (for users who document vitals, pain, plan, etc. separately in their EMR)
- Default format set in Settings, with per-note override toggle

### Assist (AI Chat)
- Pre-generation review: AI reviews raw notes, asks clarifying questions, flags gaps
- Flags potential HIPAA issues (patient identifiers in notes)
- "Update My Note" rewrites raw notes with new details from the conversation
- Undo button to restore original notes
- In-chat mic recording for voice responses

### Audio Recording
- In-browser audio recording using MediaRecorder API (WebM format)
- Transcription via OpenAI Whisper
- Screen Wake Lock to prevent recording from stopping when screen turns off

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
- Edit saved notes in place
- Summary badge on notes generated with clinical summary format

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
- **note_templates**: Custom templates (name, custom_prompt, sections, sort_order)
- **user_preferences**: Per-user settings (hidden_builtin_types, default_output_format)

## Edge Functions

| Function | Purpose |
|----------|---------|
| `generate-note` | Takes raw notes + note type + output format, returns formatted clinical note via Claude API |
| `assist-note` | Chat mode (review/clarify notes) and rewrite mode (update notes with new details) |
| `transcribe` | Accepts audio blob, sends to OpenAI Whisper, returns transcript |

## Deployment

**Frontend**: Push to `master` branch deploys to GitHub Pages automatically.

**Edge Functions**:
```
npx supabase functions deploy generate-note --project-ref bctqzflbykwozbanyamp
npx supabase functions deploy assist-note --project-ref bctqzflbykwozbanyamp
npx supabase functions deploy transcribe --project-ref bctqzflbykwozbanyamp
```

**Database migrations**: Run SQL files in Supabase Dashboard > SQL Editor.

## Key Design Decisions

- **Single HTML file**: No build step, no framework — keeps deployment simple via GitHub Pages
- **Supabase Edge Functions**: Keeps API keys server-side (Anthropic, OpenAI)
- **IndexedDB v4**: Four stores — `pendingRecordings`, `templateCache`, `pendingNotes`, `drafts`
- **Position: fixed dropdowns**: Export dropdowns use fixed positioning to escape parent `overflow: hidden` on cards/history items
- **Loose equality for ID lookups**: Supabase IDs compared with `==` not `===` to handle potential type differences
