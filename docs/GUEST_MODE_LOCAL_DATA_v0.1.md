# PMBaseline Guest Mode — local-first alpha

**Status:** Development experiment, not a replacement for encrypted personal health records.
**Canonical route:** /guest, outside authenticated route group.
**User job:** Continue the Baseline Method without Supabase or an account, with user-owned backups and intentional file import.

## v1 contract

- Guest Mode is an independent, explicitly labeled data scope. It is not an anonymous Supabase user.
- A guest can edit their Path, choose a support mode, define/do/defer a next action, record brief feedback, and view recent choices.
- Only local browser storage is used for PMBaseline guest data. No background upload or account synchronization.
- JSON export downloads a whole versioned guest backup. JSON import validates schema and previews the prospective replacement, requiring explicit confirmation.
- CSV import supports a narrow, plainly documented activity format: date,action,status,feedback,mode,note. It previews and merges nonduplicate rows with confirmation. It does **not** understand WHOOP, Apple Health, medical lab exports, or arbitrary files.
- File contents never leave the browser via this feature; HTML/JS source remains delivered by the website. Browser storage is not encrypted, may be cleared, and is accessible to scripts on the same origin; this is a **small private-use prototype**, not a secure health-data vault.
- Deliberately do not silently copy local data into an authenticated account or vice versa. Later migration requires a separate reviewed tool.
- The existing AuthProvider and Supabase session middleware should not run for /guest; /login and all signed-in routes retain their current behavior. Vercel platform preview protection is separate.

## Guardrails

- No open-ended file ingestion, hidden NLP interpretation, AI, or medical record processing.
- Preserve all current guest data when import validation fails.
- Export before replacing a guest backup; explicit confirmation to replace or delete.
- File limits and strict input schema prevent unbounded import and unexpected fields.
- No personally identifying or sensitive example data in source/test files.
- Validate the browser path, storage, file reader, CSV quoting, JSON backup restore and delete on real Android Chrome before encouraging personal use.

## Next architecture decision

For much larger personal datasets or attachments, use a properly governed IndexedDB layer with versioned adapters, user-facing provenance, file-by-file consent and export/delete controls. If cloud account sync later becomes valuable, test it separately and never assume ChatGPT user context is available to the web app.
