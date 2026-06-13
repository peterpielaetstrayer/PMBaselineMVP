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
