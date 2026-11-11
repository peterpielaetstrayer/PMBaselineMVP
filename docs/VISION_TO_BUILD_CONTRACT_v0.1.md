# PMBaseline — Vision-to-Build Contract v0.1

**Status:** Product north star and engineering guardrail, not efficacy evidence.
**Established:** November 11, 2026.
**Sources:** Project Canon, MVP Spec, AI System Design, Build Roadmap, and October 27 Peter OS reassessment.

## Enduring human outcome

PMBaseline helps people recognize actual capacity and context, decide what matters, take an appropriately sized action, and learn enough from experience to increasingly make good decisions independently. Less app use can be a success when accompanied by better independent decisions.

## Product architecture

1. **The Baseline Method:** Notice → Orient → Choose → Act → Reflect → Learn → Adapt. Teachable without software.
2. **PMBaseline focused companion:** Helps users apply the Method through a simple personal Path, contextual next moves, recorded choices, evidence-linked reviews, user correction, and controlled memory.
3. **Optional programs:** A personal health/fitness transformation is one use case, not the product identity. Other bounded pathways may be evaluated later; do not mix projects or private details.
4. **Everything Baseline:** A possible editorial and educational umbrella, not a mandate to build an all-in-one dashboard.
5. **Peter OS:** Separate authority for portfolio priorities and commitments. No automatic import, export or data sharing.

## The full user cycle

**Path** (choose direction and achievable baseline) → **Today** (one relevant, editable, smaller-or-skippable next move) → **Experience** (record what was actually chosen) → **Review** (cite observations, distinguish uncertainty) → **Adjust** (user confirms any lasting change) → **Teach** (improve the person's own decision-making).

The current standalone Foundation Lab covers only fragments of Today and Experience. It is not the full application.

## Six non-negotiable quality principles

- **Agency:** Every inference, recommendation and persistent plan change can be refused or corrected.
- **Context, not clinical scores:** Numeric signals are subjective and partial, never diagnoses.
- **Evidence:** Pattern statements reference specific observations, sample sizes and uncertainty. No invented progress or autonomous memories.
- **Relevance:** A suggested move addresses stated priorities and real constraints; never merely cycles generic advice.
- **Privacy:** Minimal collection, per-user authorization, export and deletion, transparent data use; no personal medical details in source or generic copy.
- **Robustness:** Useful with no AI, integration, streak or perfect-day performance. Safety handling is separate from normal coaching.

## Traceability (the product must improve all rows)

| Vision element | Existing technical foundation | Missing evidence and next work |
| --- | --- | --- |
| Notice and orient | Authenticated check-in, deterministic mode engine | Low-friction contextual entry; usability and correction evidence |
| Own meaningful direction | baseline_profiles and user controls | **A0: My Path editor and Today readback** |
| Take a right-sized move | Suggestions, shrinking, action records | **A1: tie suggestions to Path, record accept/change/skip correctly** |
| Learn | Reflection/history data | **A2: honest evidence-linked weekly reviews and user adjustments** |
| Personalize safely | AI system and memory schemas planned | **A3: bounded AI, validated output, confirmed memories and fallback** |
| Teach self-regulation | Baseline Method canon | **A4: contextual lessons and evidence of increasing autonomy** |
| Be dependable | Next.js/Supabase/Vercel/PWA experiments | Accessibility, mobile, RLS, account privacy, dependency-audit gates |

**Traceability rule:** Each pull request must name the human outcome, user task, implementation, source of truth, safety/privacy effect, evidence gained, limitation, and next verification gate. UI expansion without improvement to the decision-and-learning cycle is not sufficient progress.

## Development order — conditional, not a commitment to dates

**A0 (activated founder alpha):** Authenticated My Path edit/read using existing baseline profile priority and definition fields. No schema migration and no impact on other profile fields. An honest Today link/snapshot, not pretend personalization.

**A1:** Plan-aware Today. Selected goals and context genuinely influence next actions; support user-defined actions, correction and no-action. Track whether grounded suggestions outperform generic advice.

**A2:** Close-the-week learning review, explicit evidence, corrections and a user-approved adjustment to My Path.

**A3:** Structured server-side AI interpretation with relevant opt-in context, deterministic fallback, transparent provenance, evaluation cases, and off switch; never unconfirmed memory.

**A4:** Method lessons and optional integrations only after demonstrating their value. Health data and wearable connections are separate permissions.

**A5:** Foundational evaluation: can a user make better decisions and need less prompting over time?

## Release and stop gates

Inherited dependency audit reports 15 advisories, including four critical. Triage before broader use. Verify RLS with two accounts, auth, browser/mobile QA, accessibility, home-screen reliability and privacy controls before sensitive records or outside beta. No production promotion, public claims, personal data imports or cross-app sync without separate approval.

Stop or revise if users feel judged or pressured, recommendations remain generic, data claims exceed evidence, personal data crosses boundaries, or the app becomes a generic everything manager.



## Guest mode and data-portability invariant

**User decision (November 11, 2026):** PMBaseline should be usable without registration, with genuinely local-only records and manual data import/export. A disabled Supabase backend should not prevent a guest from practicing the Baseline Method. The standalone HTML lab was a precursor; this must live in the integrated application.

**Implemented founder slice:** The /guest route covers My Path, Today (self-chosen mode/next action), brief reflection, History, and Data. Local browser storage has a versioned JSON backup format and explicit download/restore confirmation. A narrow CSV activity importer is supported with preview, validation and duplicate prevention; it is not a general health-file decoder.

**Long-view architecture:** Guest and signed-in experiences are **two storage contexts for one underlying Baseline Method**, not separate products. The present guest UI duplicates some signed-in interface logic as an expedient test, so shared domain components and a storage-adapter boundary are a priority before expanding plan-aware recommendations or AI. Do not silently migrate guest records to cloud accounts. A future migration requires consent, source provenance, conflict handling, backups and verification.

**Data import vision:** Distinguish (1) PMBaseline backups, (2) known CSV schemas, (3) explicitly supported wearable/app exports, and (4) arbitrary attachments requiring separately designed on-device file storage and safe interpretation. Never assert that an arbitrary upload has been understood; preview mappings and let the person confirm. For larger files/long-term attachments, a governed IndexedDB-based library may be preferable to localStorage.

**Current limitations:** Browser storage is origin-specific, unencrypted, limited, and can be cleared by the browser or user. Use the stable branch-preview hostname during founder QA. Vercel SSO protection is separate from PMBaseline guest sign-in. No production migration or external beta authorization.
