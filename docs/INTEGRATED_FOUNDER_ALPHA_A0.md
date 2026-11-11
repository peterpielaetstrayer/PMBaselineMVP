# Integrated Founder Alpha — A0 scope and acceptance

**Status:** Active development experiment on work/integrated-founder-alpha-2026-11; not released.
**Source of truth:** Canonical PMBaselineMVP master plus this branch. Standalone Foundation Lab is preserved on its own experimental branch.

## Concrete first user task

A signed-in person can express **what a workable baseline looks like** and **up to three current priorities** in their own words, save them privately to their existing account, and see that direction again on Today.

This is the first Plan → Today bridge, *not* a complete personalized plan, training program, weekly review, AI mentor or metric dashboard.

## Implementation contract

- Add authenticated **My Path** page to existing app shell and navigation; quiet, nonclinical plain-language UI.
- Reuse existing per-user baseline_profiles.current_priorities and user_defined_baseline only. Do not change known stabilizers, constraints or preferred minimum actions.
- Server-side bounded validation; derive user ID from authenticated Supabase session; protect via existing baseline_profiles RLS. Insert missing parent profile and baseline profile only after the user's explicit Save action.
- Render compact Path summary on Today without changing current deterministic interpretation/check-in behavior.
- Allow blank entries and saving an empty Path; user may edit later.
- Do not seed personal health or substance-use data in app, tests, examples or documentation.
- Errors must not leak raw SQL details or falsely claim a save succeeded.

## Acceptance

1. Anonymous users cannot load My Path or save; existing app layout redirects to login.
2. Save and refresh shows correct personal baseline statement and at most three current priorities.
3. Existing baseline-profile fields outside these two are preserved.
4. Duplicate/blank priorities are normalized; overlong/invalid payloads are rejected.
5. Today shows actual saved priorities without pretending they affect recommendations yet.
6. Existing Today → check-in → action → reflection → history remains unchanged.
7. Manual preview validation, keyboard/320px accessibility, multi-user RLS and browser E2E remain gates; a successful Vercel build is not release readiness.

## A1 entry condition

Run a real-device and authenticated data test for A0, triage inherited dependency vulnerabilities, then choose a narrow Path-aware action experiment. Show how new context improves action fit and preserves correction/override, not just more tracking.
