# PMBaseline Build Roadmap

**Status:** v0.1 alpha roadmap  
**Last updated:** 2026-06-13

## Strategic rule

Do not build a giant wellness app. Build the smallest complete loop that proves PMBaseline helps a user make a better next decision and learn from the result.

## Phase 0 — Foundation

Status: complete on `master`. The branch `foundation-baseline-v0-1` has served its purpose and is retired.

Deliverables:

- project canon;
- functional MVP spec;
- technical architecture;
- AI system design;
- database schema plan;
- build roadmap;
- Cursor workflow;
- initial implementation issues.

Success condition:

- The project has a single canonical repository and a coherent plan before major coding resumes.

## Phase 1 — Repository and backend foundation

Goal: make the codebase ready for real persistence and AI integration.

Tasks:

1. clean up branch structure and merge foundation docs;
2. create `.env.example`;
3. confirm package versions and build health;
4. set up Supabase client/server helpers;
5. add initial SQL migrations;
6. enable RLS policies;
7. create typed data access functions;
8. add minimal tests for schema and domain logic.

Success condition:

- A signed-in user can have a profile and protected user-owned records in Supabase.

## Phase 2 — Core baseline loop without AI

Goal: prove the product can work even if AI is unavailable.

Tasks:

1. implement quick check-in screen;
2. implement deterministic mode engine;
3. implement mode-specific choice menus;
4. implement action selection and action shrinking;
5. implement reflection capture;
6. implement simple history view;
7. implement fallback result UI.

Success condition:

- User can complete check-in → receive fallback mode/action → choose/modify action → reflect → view history.

## Phase 3 — AI interpretation layer

Goal: add bounded, structured AI interpretation without turning the app into an uncontrolled chatbot.

Tasks:

1. create AI adapter;
2. define Zod schemas;
3. create versioned prompts;
4. build context assembler using relational retrieval;
5. call OpenAI from server route only;
6. validate model output;
7. store model metadata, prompt version, and source context IDs;
8. fall back safely when AI fails;
9. allow user to accept, edit, or reject mode/action.

Success condition:

- AI-generated result is structured, stored, editable, and safely replaceable by fallback logic.

## Phase 4 — Reflection and memory

Goal: make PMBaseline begin learning from repeated use.

Tasks:

1. improve reflection flow;
2. generate optional reflection synthesis;
3. propose memory statements;
4. build memory review UI;
5. allow confirm, edit, reject, delete;
6. use confirmed memories in future interpretation context;
7. track when a memory was used.

Success condition:

- The app can say, in a user-controlled way, “This pattern may be worth remembering,” and use confirmed patterns later.

## Phase 5 — Weekly synthesis

Goal: convert daily records into learning.

Tasks:

1. generate weekly summaries;
2. identify what supported baseline;
3. identify what disrupted baseline;
4. identify what the user protected;
5. propose one next-week experiment;
6. link claims to supporting records;
7. allow user correction.

Success condition:

- User gets a weekly learning summary that feels useful, not judgmental.

## Phase 6 — Learn layer / Baseline Method

Goal: teach the method, not just operate the app.

Tasks:

1. add Learn landing page;
2. create short lessons for baseline modes;
3. add Minimum Viable Action lesson;
4. add Hard Day Method;
5. add Reset Method;
6. add Weekly Rhythm method;
7. link lessons contextually from user flows.

Success condition:

- User understands why the app suggests less, more, or different action depending on their current state.

## Phase 7 — Integrations and advanced retrieval

Do not begin until the core loop is useful.

Potential additions:

- embeddings for confirmed memory and compact reflections;
- Whoop or wearable summary import;
- Apple Health / Google Fit summary import;
- calendar context;
- reminders/notifications;
- specialized modules such as Alcohol Reset and Walk Instead;
- private accountability features.

Success condition:

- Integrations improve recommendations without overwhelming the user or compromising privacy.

## Current recommended next engineering move

After pulling `master` in Cursor:

1. run the app locally;
2. verify build health;
3. inspect current Supabase/auth state;
4. create the first migration from `DATABASE_SCHEMA.md`;
5. implement the deterministic mode engine before the AI endpoint.

Reason:

A reliable non-AI baseline loop gives the AI a safe place to live.