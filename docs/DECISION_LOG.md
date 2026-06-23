# PMBaseline Decision Log

## 2026-06-13 — Choose canonical repository

**Decision:** Use `peterpielaetstrayer/PMBaselineMVP` as the canonical repository moving forward.

**Why:** It has the most complete working product surface from prior iterations: onboarding, baseline setup, reminders, daily check-ins, home, progress, milestone concepts, auth/storage scaffolding, and an existing mobile-oriented UX. Other repositories contained useful ideas but were either mostly empty shells or had architectural implementation issues.

**Rejected alternatives:**

- `peterpielaetstrayer/pmbaseline`: mostly shell code.
- `peterpielaetstrayer/baseline-app`: mostly shell code.
- `peterpielaetstrayer/pmbaseline-reset`: useful AI reset concept, but the current implementation contains API/UI mismatches and unfinished route code.

**Implications:** Future work happens in `PMBaselineMVP`. Ideas may be migrated from the other repositories, but those repos are no longer the source of truth.

## 2026-06-13 — Reframe PMBaseline as adaptive baseline learning

**Decision:** PMBaseline is not primarily a habit tracker, fitness dashboard, AI therapist, or reset chatbot. It is an AI-supported behavior-change and self-regulation system for helping users identify their current mode, choose the next meaningful action, and learn from outcomes.

**Why:** Prior iterations captured useful fragments, but the strongest product insight is that the right action depends on the user's current state. A skipped workout can still be a successful day if the user protects sobriety, sleep, food, or an urgent obligation.

**Rejected alternatives:**

- Fixed daily minimums as the whole product.
- AI reset chat as the whole product.
- Wearable dashboard as the whole product.
- General-purpose AI life coach.

**Implications:** The MVP must center the check-in → interpretation → action → reflection loop. Gamification, integrations, and analytics are secondary.

## 2026-06-13 — Use adaptive baseline modes

**Decision:** Use four working modes: Stabilize, Rebuild, Maintain, and Expand.

**Why:** These modes let the system adjust recommendations to capacity instead of prescribing the same standard every day. They also support a user who is far off baseline, someone rebuilding, someone maintaining, and someone ready for growth.

**Rejected alternatives:**

- Single baseline score only.
- Binary on/off baseline state.
- Fixed habit completion model.
- Clinical labels.

**Implications:** The deterministic mode engine and AI interpretation endpoint must both output one of these modes and explain that it is a working interpretation, not a diagnosis.

## 2026-06-13 — Build deterministic fallback before AI dependency

**Decision:** Implement deterministic baseline mode logic and choice menus before relying on OpenAI output.

**Why:** The app should remain useful if AI is unavailable, and hard product logic should be testable. AI should interpret and personalize, not be the only thing making the app function.

**Rejected alternatives:**

- Chatbot-first architecture.
- OpenAI call as the only source of recommendations.
- Adding embeddings before the core loop works.

**Implications:** Phase 2 precedes the AI interpretation endpoint. The AI result must be validated and safely replaceable by fallback logic.

## 2026-06-13 — Start retrieval with relational context, not vectors

**Decision:** Begin with relational retrieval from Supabase: profile, recent check-ins, actions, reflections, and confirmed memories. Add vector embeddings later only if needed.

**Why:** The MVP needs structured, inspectable context more than semantic search. Most useful early personalization can come from recent records and confirmed profile data.

**Rejected alternatives:**

- Embedding every raw interaction immediately.
- Treating RAG as the first architecture task.
- Storing opaque chat history as memory.

**Implications:** The first AI context assembler should use SQL queries and compact summaries. Vector search is a later v0.3+ feature.

## 2026-06-13 — Make user correction first-class

**Decision:** Users must be able to accept, edit, or reject interpretations and proposed memories.

**Why:** AI inferences can be wrong. Corrections create better personalization and protect user autonomy.

**Rejected alternatives:**

- Silent permanent memory.
- Treating AI interpretations as truth.
- Hiding why recommendations were made.

**Implications:** The database includes fields for user disposition, corrected mode, memory status, and source record IDs.

## 2026-06-14 — Canonical loop is Supabase-first

**Decision:** The canonical PMBaseline loop (check-in → interpretation → action → reflection) persists exclusively through Supabase server actions and RLS-protected tables.

**Why:** Real multi-device use, inspectable records, and a clear boundary before AI and memory features.

**Implications:** Canonical routes must not read or write legacy `localStorage`, `hybridStorage`, or legacy `AppState`.

## 2026-06-14 — Legacy app isolated at `/legacy`

**Decision:** The old habit/minimum app remains available at `/legacy` with a retirement notice. Root `/` redirects to `/today` or `/login`.

**Why:** Preserve temporary access without letting the legacy surface remain the primary product entry.

**Implications:** New feature work targets canonical routes only. Legacy code is not deleted until explicitly retired.

## 2026-06-14 — Deterministic engine is permanent fallback

**Decision:** The deterministic interpretation engine remains the default provider and permanent fallback. Stored interpretations are never recomputed on read paths.

**Why:** The product must work without AI; AI output must be safely replaceable.

**Implications:** Result, reflect, and history pages load stored records only. Phase 3 adds a bounded AI provider, not a chatbot replacement for the engine.

## 2026-06-14 — No AI until the non-AI loop is stable

**Decision:** Phase 3 AI work starts only after Phase 2.5 polish confirms the non-AI MVP is stable for daily personal use.

**Why:** AI on an unstable loop creates untrustworthy recommendations and hard-to-debug failures.

**Implications:** Phase 3 is AI-readiness and a structured adapter layer — not immediate random AI injection.

## 2026-06-14 — Reflection completes the first MVP loop

**Decision:** A check-in loop is considered complete when the user accepts a right-sized action and saves a reflection. History surfaces partial loops with links to continue.

**Why:** Reflection closes the learning loop without requiring analytics, streaks, or AI synthesis in MVP.

**Implications:** Action records mark `completed` after reflection submit. One reflection per check-in; idempotent replay returns the existing reflection.

## 2026-06-14 — Improve non-AI ease-of-use before AI

**Decision:** Phase 2.6 prioritizes a faster, lower-friction canonical loop (command-center Today, quick pulse check-in, simplified result/reflect) before Phase 3 AI work.

**Why:** Real use showed the product is close to the vision but still too heavy for daily repetition. AI on a clunky loop would amplify confusion.

**Implications:** Phase 3 starts only after the non-AI loop feels easy enough to use repeatedly. No new persistence or engine changes required for ease-of-use passes.
