# Health Reset Founder Lab — isolated v0.1

**Status:** implementation experiment, unvalidated; November 11, 2026.
**Branch:** `work/health-reset-founder-lab-2026-11`.
**Route:** `/labs/health-reset/index.html` on a preview build.
**Purpose:** test whether one right-sized daily action and three foundational anchors are useful on a phone, without altering the canonical PMBaseline product flow.

## What is implemented

- A self-contained, mobile-first, standalone static HTML experience under `public/labs/health-reset/`.
- Four user-selected modes (Stabilize, Rebuild, Maintain, Expand), two authored options per mode, and an action-shrinking control.
- Daily anchor completion (comfortable movement *if appropriate*, nourishment, recovery), action status, and simple feedback.
- A seven-day local history, export JSON, and delete-local-records control.
- Dedicated PWA manifest and scoped service worker for the static shell. Installation and offline behavior **require device QA**.

## Critical boundaries

- No new database schema, AI calls, OAuth connections, clinical interpretation, or real-time wearable import.
- No copied personal health records or seeded medical data in the app or repository.
- Only local device storage: the records will not sync across devices and may be deleted by the browser.
- The mode selection itself is intentionally not persisted.
- This is an everyday self-regulation experiment, not a clinical tool. Urgent or concerning health and safety needs require real-world support, not routine habit recommendations.
- The suggestions intentionally avoid strenuous workout prescriptions. This does not establish that walking is safe for a symptomatic user.
- This standalone lab path is outside the app's authenticated `/(app)` route group; preview access must be restricted at the platform level before live personal use, even though the branch contains no sensitive data.
- Offline, service worker, Android add-to-home-screen, browser history, screen readers, and security have not yet been browser-tested. Do not claim this is an installed, validated app.

## Founder acceptance gate (not yet run)

1. Run HTML/script syntax checks; inspect branch diff and no-secrets condition.
2. Verify preview is protected before personal testing; check iOS/Android Chrome and accessibility.
3. On Android, open the lab URL over HTTPS and test add-to-home-screen; do not assume the manifest alone guarantees installability.
4. Test each mode, shrinking and alternative, action mark/not now, all three anchors, feedback, week history, export and erase.
5. Test on 320px/390px and tablet widths; keyboard focus and reduced motion.
6. Run at least 5 actual low-friction sessions and note time-to-next-move, interpretation fit and unwanted friction. Treat outcomes as founder feedback, not efficacy proof.
7. Decide keep/revise/stop. No merge or production release without separate review.

## Product relationship

The existing canonical PMBaseline user path remains unchanged. This lab tests a **personal health-program experience slice**, not a rebrand or evidence of a new general-purpose fitness tracking product. The 30-day plan and current goal negotiations remain owned by Peter OS.

## November 11 — founder feedback / voice revision v0.1.1

Peter found the first screen's health warnings and medical language intrusive. Removed the specific symptom warning from the primary action flow, replaced clinical conditions and action phrasing with plain, friendly everyday language, and kept one small, non-specific help reminder in the About section. Do not hard-code private user health context into product UI. No changes to app data storage, behavior logic, or production paths. Browser-level QA is still required.

## November 11 — QA corrective changes (v0.1.2, pending device validation)

A controlled DOM exercise exposed a state-integrity defect: the original check-in stored only `action: done/not-now` without recording the selected mode/action. After changing modes, the UI continued displaying completion for an unrelated action. Added an action label to the local daily record and display; switching to another option now identifies the earlier completed/skipped choice rather than attributing completion to the current suggestion. Reflections are unavailable until a choice is recorded and are tied to the recorded choice. Added a concise choice/result line to each applicable seven-day history row. Existing local records without labels show a generic earlier-choice fallback. No additional personal data categories or network operations were introduced.

**QA still pending:** authenticated preview-browser navigation, Android install and service worker/offline, visual 320px/390px tablet review, keyboard/screen-reader checks, storage and export behavior in real Chrome, and security advisory triage (Nov 11 Vercel install output: 15 advisories, including 4 critical). Do not claim full release readiness.
