# PMBaseline Functional MVP Specification

**Version:** v0.1 alpha  
**Status:** Build specification  
**Last updated:** 2026-06-13

## 1. MVP objective

Build a functional, mobile-first web application that proves the core PMBaseline hypothesis:

> A low-friction check-in, adaptive interpretation, and context-aware next action can help a user make a better decision on a difficult or ordinary day.

The MVP should be useful enough for daily personal use, instrumented enough to learn from, and architected so that memory, integrations, and deeper behavior-change systems can be added without rebuilding the product.

## 2. Primary hypotheses

### H1 — State awareness

A brief check-in can help the user recognize their current condition before acting automatically.

### H2 — Adaptive support

Recommendations based on current capacity are more useful than a fixed habit checklist.

### H3 — Minimum viable action

One appropriately sized action is more likely to produce movement than a large list of ideal behaviors.

### H4 — Reflection improves personalization

A lightweight outcome reflection can create useful data about the user's stabilizers, destabilizers, and successful patterns.

### H5 — The user can learn the method

Repeated use can improve the user's ability to self-assess and choose actions without permanent dependence on the AI.

## 3. MVP user journey

### A. Account and onboarding

The user can:

1. create an account or sign in;
2. read a concise explanation of a personal baseline;
3. identify their current reason for using the product;
4. name a small number of known stabilizers and destabilizers;
5. choose a preferred coaching tone;
6. review privacy and memory controls;
7. complete the first check-in immediately.

Onboarding must be resumable and should not require a complete life inventory.

### B. Daily check-in

The default check-in should take approximately 15–45 seconds, with an optional deeper path.

Required inputs:

- physical state: 0–10;
- mental/emotional state: 0–10;
- energy: 0–10;
- stress: 0–10;
- sleep quality: 0–10 or unknown;
- primary context: short selection or free text;
- one open prompt: “What feels most important or heavy right now?”

Optional inputs:

- food and hydration status;
- movement;
- alcohol or substance urge/use;
- social connection;
- urgent obligation;
- free-form note.

The interface should provide a “Tap & Go” path and a deeper conversational path. The fast path must remain usable when the user is stressed, tired, or half-awake.

### C. Interpretation result

After submission, the user receives:

- a proposed mode: Stabilize, Rebuild, Maintain, or Expand;
- a one- or two-sentence explanation grounded in the current check-in;
- one recommended next move;
- two or three alternatives from an appropriate choice menu;
- the ability to reject or edit the interpretation;
- an optional “talk it through” conversational path.

The mode is a working interpretation, not a diagnosis.

### D. Action commitment

The user can:

- choose the primary recommendation;
- choose an alternative;
- define their own action;
- shrink the action through a “make this easier” control;
- set an optional reminder;
- mark the action complete, modified, skipped, or no longer relevant.

The app should not make completion the only positive outcome. Modifying an unrealistic action is a successful act of self-regulation.

### E. Reflection

Later the same day, the user can record:

- whether the action helped, had no effect, or hurt;
- what changed afterward;
- what they protected or prevented;
- what they learned;
- a final baseline rating;
- an optional note.

The reflection should usually take under one minute.

### F. History and patterns

The user can view:

- recent check-ins;
- modes over time;
- selected actions and outcomes;
- baseline ratings;
- emerging stabilizers and destabilizers;
- a weekly AI-assisted summary once enough data exists.

The history view should emphasize understandable patterns rather than a single punitive score.

## 4. Core screens

1. **Landing / Sign in**
2. **Onboarding**
3. **Today dashboard**
4. **Quick check-in**
5. **Deeper check-in**
6. **Mode and next move result**
7. **Action detail / modify action**
8. **Evening reflection**
9. **History**
10. **Weekly insight**
11. **Baseline profile and memory controls**
12. **Learn**
13. **Settings / privacy / export / delete**

For the first coded milestone, Today, Quick Check-In, Result, Reflection, History, and Settings are mandatory. Other screens may begin as minimal versions.

## 5. Functional requirements

### Authentication and identity

- Email authentication through Supabase.
- Protected application routes.
- Row Level Security on all user-owned data.
- No service-role key exposed to the browser.

### Data persistence

- Check-ins, recommendations, chosen actions, outcomes, reflections, and user-confirmed memories persist in Postgres.
- Local optimistic state may be used, but local storage is not the system of record after backend migration.
- A user can export and delete their records.

### AI response

- The server calls the OpenAI Responses API.
- The model returns validated structured output rather than unconstrained prose.
- The result is stored with prompt version, model identifier, retrieved context identifiers, and user edits.
- The product must degrade gracefully when AI is unavailable by using a deterministic mode-and-choice-menu fallback.

### Safety

- User input is checked for urgent risk before ordinary coaching.
- The app clearly states that it is not emergency, medical, or therapeutic care.
- The product must not offer ordinary self-help coaching when a situation requires immediate human or medical support.
- Alcohol withdrawal warning signs, self-harm language, severe physical symptoms, and immediate danger require dedicated escalation messaging.

### Accessibility

- Keyboard operable.
- Semantic labels and focus states.
- Sufficient contrast.
- Screen-reader friendly status messaging.
- No essential meaning communicated by color alone.
- Motion can be reduced.
- Plain-language copy.

### Observability

Track product events without storing unnecessary sensitive content:

- onboarding started/completed;
- check-in started/completed;
- interpretation accepted/edited/rejected;
- recommendation selected/modified;
- action outcome recorded;
- reflection completed;
- weekly insight viewed;
- AI error/fallback used.

## 6. Initial data entities

### profiles

- `id`
- `display_name`
- `timezone`
- `onboarding_status`
- `coaching_tone`
- `memory_consent`
- timestamps

### baseline_profiles

- `user_id`
- `known_stabilizers`
- `known_destabilizers`
- `current_priorities`
- `constraints`
- `preferred_minimum_actions`
- `user_defined_baseline`
- timestamps

### check_ins

- `id`
- `user_id`
- `physical_score`
- `mental_score`
- `energy_score`
- `stress_score`
- `sleep_score`
- `context_tags`
- `heavy_or_important_text`
- `optional_note`
- `safety_status`
- timestamps

### interpretations

- `id`
- `check_in_id`
- `proposed_mode`
- `explanation`
- `primary_action`
- `alternative_actions`
- `confidence`
- `model_id`
- `prompt_version`
- `user_disposition`
- `user_corrected_mode`
- timestamps

### action_records

- `id`
- `user_id`
- `check_in_id`
- `interpretation_id`
- `action_text`
- `action_source`
- `status`
- `modified_from`
- `scheduled_for`
- `completed_at`
- timestamps

### reflections

- `id`
- `user_id`
- `check_in_id`
- `action_record_id`
- `effect`
- `what_changed`
- `what_was_protected`
- `lesson`
- `final_baseline_score`
- timestamps

### memories

- `id`
- `user_id`
- `memory_type`
- `statement`
- `source_record_ids`
- `status` (`proposed`, `confirmed`, `rejected`, `superseded`)
- `confidence`
- `embedding` (added only when semantic retrieval is introduced)
- timestamps

## 7. AI output contract

The initial interpretation endpoint should return an object shaped like:

```json
{
  "mode": "stabilize",
  "confidence": 0.82,
  "summary": "You completed an important obligation but are carrying high stress and limited energy.",
  "primary_action": {
    "title": "Protect the evening",
    "description": "Eat, hydrate, avoid alcohol, complete a short calming routine, and prepare for sleep.",
    "estimated_minutes": 20,
    "domain": "recovery"
  },
  "alternatives": [
    {
      "title": "Five-minute reset",
      "description": "Drink water and complete five minutes of slow breathing.",
      "estimated_minutes": 5,
      "domain": "regulation"
    }
  ],
  "avoid_for_now": ["Adding multiple new goals", "Treating a skipped workout as failure"],
  "reflection_prompt": "What would make tomorrow easier?",
  "safety": {
    "level": "standard",
    "message": null
  }
}
```

The exact schema should be implemented with Zod and mirrored in the model's Structured Output schema.

## 8. MVP non-goals

Do not include in the first functional alpha:

- Whoop, Apple Health, Google Fit, or wearable integrations;
- public social feeds;
- competitive leaderboards;
- payments or premium tiers;
- autonomous continuous monitoring;
- diagnosis or treatment recommendations;
- broad life-planning agents;
- complex multi-agent orchestration;
- fine-tuning;
- embeddings for every raw interaction;
- native mobile applications.

These may be evaluated later, but none are required to validate the core behavior-change loop.

## 9. Acceptance criteria for v0.1 alpha

A signed-in user can:

1. complete a check-in on mobile;
2. receive a mode and next-move result;
3. edit or reject the result;
4. choose or modify an action;
5. return later and record the outcome;
6. view the saved day in history;
7. see at least a basic weekly pattern summary;
8. inspect and delete user-confirmed memories;
9. continue using the app when the AI call fails;
10. receive appropriate escalation messaging in defined high-risk test cases.

Engineering acceptance:

- TypeScript passes.
- Production build passes.
- Core flow has automated tests.
- RLS policies are tested.
- Environment variables are documented.
- No secret is committed.
- AI response schema validation and fallback behavior are tested.
- Accessibility smoke test passes.

## 10. Alpha evaluation

Begin with the creator as the first daily user, then recruit a small test group representing the three starting conditions in the Project Canon.

For each test day, capture:

- Was the proposed mode accurate?
- Was the next move realistic?
- Did the recommendation reduce or add pressure?
- Did the user change the recommendation?
- Did the action help?
- What did the system misunderstand?
- Did the user learn something they could use without the app?

The MVP should be revised from observed use, not expanded solely from imagined feature completeness.
