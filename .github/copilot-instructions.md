# AI Coding Agent Instructions

Concise, project-specific guidance for agents working on this repository. Focus on preserving current lightweight, static architecture (pure client + optional local dev server).

## 1. Project Overview
- Static browser app for private voice notes. No backend / network persistence; everything stored in `localStorage` under key `notes` (array of note objects: `{ title, content, timestamp }`).
- Speech input via `webkitSpeechRecognition` (Chrome-centric). If unsupported, mic UI is hidden.
- UI built with vanilla JS + Bootstrap 4 + Font Awesome; no build step or bundler; ES module structure under `js/`.
- Export/Import uses CSV (simple quoting with double quotes, no escaping beyond surrounding quotes). Individual note export uses plain `.txt`.
- A Python helper script `start.py` serves the static site locally on `http://localhost:8000/index.html` and auto-opens browser.

## 2. Key Files & Modules
- `index.html`: Single entry point; loads external CDN assets then `js/app.js` as a module. Defines modal + note list + controls.
- `js/app.js`: App bootstrap on `DOMContentLoaded`: disclaimer persistence, search wiring, keyboard Enter shortcut, delegates to other modules.
- `js/modules/dom.js`: Central DOM element lookups. Add new frequently used elements here to avoid scattered `getElementById` calls.
- `js/modules/speech.js`: Manages speech recognition lifecycle; exposes `setupSpeechRecognition`, `startRecording`, `stopRecording`, `setShouldSaveAfterStop`, `getIsRecording`.
- `js/modules/note.js`: CRUD & rendering logic. Renders note cards, dynamic Read More toggle, modal expand view, share/copy/export/import logic, search filter, CSV handling.
- `css/style.css`: Layout (CSS grid for notes), clamped preview (`-webkit-line-clamp: 5`), modal styles, responsive button text hiding.

## 3. Data & State Patterns
- Single source of persisted truth: `localStorage['notes']` (JSON array). Always read fresh before mutating (`getNotes()`), then overwrite via `saveNotes()`.
- Note identity: timestamp ISO string (`new Date().toISOString()`). Deletion uses timestamp match.
- Derived / transient UI state (expanded modal, interim speech transcript) is *not* persisted.
- Search: in-memory filter at render time (case-insensitive substring across title OR content). No indexing; keep code simple.

## 4. Rendering & DOM Conventions
- `renderNotes(searchTerm?)` clears `#notes-list`, sorts notes newest-first, appends card DOM nodes.
- Card preview truncation logic decides whether to show Read More: heuristic includes content length, line count, and an off-DOM measurement.
- Buttons cluster (`.note-buttons`) only fully visible on hover; expand button always present (first in order). Maintain accessibility: ensure button has appropriate `title` attributes.
- Modal (`#note-modal`) toggled by adding/removing `active` class; basic focus trap implemented inside `openNoteModal`.

## 5. Speech Recognition Flow
- Start: `recognition.start()` sets `isRecording=true`, swaps mic button icon/text + adds `btn-danger`.
- Results: final segments appended to `noteContent.value`; interim transcript currently not displayed (could be enhancement).
- Stop: resets UI; if `shouldSaveAfterStop` flag set (triggered by Enter key when recording) then programmatically clicks save.
- Unsupported browsers: hide mic button; do not attempt polyfills.

## 6. Keyboard Shortcut Logic
- Global `keydown` for Enter (when not inside a `<textarea>`):
  - If recording: set "save after stop" then stop recognition (auto-saves once `onend` fires).
  - Else: invoke `handleSaveNote()` directly (starts recording if both title & content empty, otherwise saves).

## 7. Import / Export Details
- Export All: Generates CSV header `timestamp,title,content` and naïvely wraps each field in quotes; embedded quotes in content are not escaped beyond removal upon import (`replace(/"/g, '')`). Be cautious adding commas or quotes—it is not a robust CSV implementation.
- Import: Splits lines after first, splits by comma into exactly three parts; simple, not RFC-compliant. Keep compatibility if refactoring; consider adding safer parsing only if adding escape logic simultaneously.

## 8. Sharing & Clipboard
- Native Web Share API used when available (`navigator.share` with title + text). Fallback copies `Title: ...\n\nContent: ...` to clipboard.
- `copyNoteToClipboard` copies only `note.content` (not title). Maintain existing behavior when adding features.

## 9. Adding Features Safely
When extending:
- Keep zero-build simplicity (avoid introducing bundlers unless absolutely necessary; if added, document build commands here).
- Preserve local-only privacy; avoid adding network calls or external storage without explicit requirement.
- Reuse `dom.js` for new element refs; export functions from feature modules instead of creating hidden cross-module globals.
- For data model changes (e.g., tags), ensure backward compatibility reading legacy notes.

## 10. Dev Workflow
- No dependency install required for core usage (CDN assets). Local preview options:
  1. Run `python start.py` (Python 3) to serve & auto-open.
  2. Or open `index.html` directly (speech + clipboard features may require secure context; prefer local server).
- No tests currently. If adding tests, consider lightweight browser-based harness or Jest + jsdom; document added tooling here.

## 11. Accessibility & UX Notes
- Focus restoration after modal close attempts to return user context; maintain this if modal logic altered.
- Read More toggle rewrites `content.textContent`; reattach Read More element each toggle. Mind potential XSS—content is plain text only (no innerHTML injection from notes), keep it that way.

## 12. Potential Pitfalls
- CSV parsing fragile with commas/newlines inside content.
- Speech API prefix `webkitSpeechRecognition`; Firefox/others won't show mic button.
- Timestamp-based identity could collide if multiple saves in same ms (rare). If adding editing support, consider adding a UUID.

---
If you introduce a build step, more robust CSV handling, or note metadata, append concise docs here. Please ask for clarification if a behavior appears ambiguous before rewriting core flows.
