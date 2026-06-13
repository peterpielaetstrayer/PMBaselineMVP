# PMBaseline Technical Architecture

**Status:** Proposed architecture for v0.1–v0.3  
**Last updated:** 2026-06-13

## 1. Architectural goal

Build the smallest reliable system that supports the full PMBaseline learning loop while preserving a clear path to personalization, retrieval, integrations, and research.

The system should remain understandable to a solo builder working primarily in Cursor. Avoid infrastructure that cannot be tested, explained, or maintained.

## 2. Canonical stack

### Application

- Next.js App Router
- TypeScript
- React
- Tailwind CSS and the existing component system
- Zod for request, database-boundary, and AI-output validation

### Backend

- Supabase Postgres
- Supabase Auth
- Supabase Row Level Security
- Supabase Storage only when attachments are introduced
- SQL migrations committed to the repository

### AI

- OpenAI Responses API called only from server-side code
- Structured Outputs for mode interpretation and action recommendations
- Embeddings and vector retrieval only after sufficient user data and evaluation evidence exist

### Deployment and operations

- Vercel for application deployment
- GitHub for source control, issues, pull requests, and decision history
- Separate development and production Supabase projects before external testing
- Error monitoring and privacy-conscious analytics before public alpha

## 3. Repository structure

```text
app/
  (auth)/
  (app)/
    today/
    check-in/
    reflection/
    history/
    learn/
    settings/
  api/
    ai/
      interpret/
      reflect/
      weekly-summary/
    export/
    delete-account/
components/
  baseline/
  check-in/
  reflection/
  history/
  safety/
  ui/
lib/
  ai/
    client.ts
    schemas.ts
    prompts/
    retrieval.ts
    fallbacks.ts
    safety.ts
  baseline/
    modes.ts
    choice-menus.ts
    state-engine.ts
  supabase/
    client.ts
    server.ts
    middleware.ts
  validation/
  analytics/
  constants/
supabase/
  migrations/
  seed.sql
docs/
tests/
  unit/
  integration/
  e2e/
```

The exact route grouping can change, but business rules should not live inside large page components.

## 4. Responsibility boundaries

### React components

Responsible for:

- rendering state;
- collecting user input;
- accessibility and interaction behavior;
- optimistic feedback;
- displaying validated server results.

Not responsible for:

- calling OpenAI directly;
- storing secrets;
- deciding safety outcomes;
- enforcing authorization;
- constructing raw SQL.

### Next.js server routes and server actions

Responsible for:

- authenticating requests;
- validating inputs;
- enforcing authorization;
- retrieving context;
- calling the AI service;
- validating AI outputs;
- applying fallbacks;
- persisting results;
- returning minimal response objects.

### Baseline domain layer

Responsible for:

- mode definitions;
- deterministic fallback logic;
- choice menus;
- action shrinking rules;
- interpretation correction behavior;
- domain-specific validation.

This logic should be usable without an AI model.

### AI layer

Responsible for:

- context-sensitive interpretation;
- concise explanation;
- selecting and adapting actions;
- generating reflection and weekly synthesis;
- proposing, not silently asserting, new memories.

The AI does not own the truth. The database and user-confirmed data remain the source of truth.

## 5. Request flow: daily interpretation

```text
Browser
  -> POST /api/ai/interpret
  -> authenticate Supabase user
  -> validate check-in payload with Zod
  -> run deterministic urgent-risk screen
  -> persist raw check-in
  -> retrieve profile + recent records + confirmed memories
  -> assemble bounded context object
  -> call OpenAI Responses API with versioned instructions and schema
  -> validate structured output
  -> if invalid/error: use deterministic fallback
  -> persist interpretation and provenance
  -> return result to browser
```

No client-supplied user ID should be trusted. Derive ownership from the authenticated session.

## 6. Database and authorization

### Row Level Security

Every user-owned table must enable RLS. Policies should restrict read, insert, update, and delete operations to rows whose `user_id` equals the authenticated user's ID.

Tables related through a parent record must still have explicit ownership enforcement. Do not assume a hidden UI route protects data.

### Migration policy

- Every schema change is a committed SQL migration.
- No production-only manual schema edits.
- Seed data contains no personal or production information.
- Indexes are added for user/date queries and retrieval paths.
- Destructive migrations require a documented rollback or backup plan.

### Sensitive fields

Free text, substance-related information, mood information, inferred patterns, and safety outcomes should be treated as sensitive even if the product is not legally classified as a healthcare provider.

Collect only what the current feature needs.

## 7. State engine and fallback

The application should contain a deterministic state engine that can:

- map validated scores and context tags into a provisional mode;
- identify missing data;
- provide a small mode-appropriate choice menu;
- shrink an action;
- return safe default copy when AI is unavailable.

The engine is not intended to perfectly classify the user. It provides reliability, testability, and a comparison point for AI evaluation.

Example provisional rules may consider:

- high stress plus low energy;
- very poor sleep;
- inability to meet basic needs;
- urgent obligations;
- recent repeated destabilization;
- high current capacity and stable recent trend.

Rules should be documented, tested, and adjusted from evidence. They must not be presented as medical conclusions.

## 8. AI model abstraction

Use a single server-side adapter such as:

```ts
interface BaselineAIService {
  interpret(input: InterpretationInput): Promise<InterpretationResult>
  generateReflection(input: ReflectionInput): Promise<ReflectionResult>
  generateWeeklySummary(input: WeeklySummaryInput): Promise<WeeklySummaryResult>
}
```

Benefits:

- model names remain configuration rather than page logic;
- prompts can be versioned;
- mock implementations can power tests;
- alternative providers can be evaluated later without rewriting the application;
- AI can be disabled while retaining the baseline domain loop.

## 9. Memory architecture

Use three distinct categories.

### Explicit profile memory

Facts and preferences entered or confirmed directly by the user, such as known stabilizers, preferred routines, constraints, goals, and coaching tone.

### Episodic records

Timestamped check-ins, actions, outcomes, and reflections. These are historical events, not permanent claims about the person.

### Inferred pattern memory

Patterns proposed by the system, such as “delaying food often appears alongside increased anxiety.” Inferences must include evidence references, confidence, status, and user confirmation controls.

Do not collapse these categories into a single opaque chat history.

## 10. Retrieval phases

### Phase A — relational retrieval

For the MVP, retrieve:

- current profile;
- last 7–14 check-ins;
- last several action outcomes;
- user-confirmed stabilizers and destabilizers;
- relevant mode-specific choice menu.

Use ordinary SQL queries. This is retrieval-augmented generation even without vectors: the model receives selected external context.

### Phase B — semantic retrieval

Introduce embeddings only when:

- enough reflections exist to create retrieval value;
- evaluation shows that relational retrieval misses relevant prior situations;
- memory controls and deletion behavior are working;
- cost and latency are understood.

Embed compact summaries or memory statements, not every raw conversational turn by default. Store embeddings in a vector column and filter by user before similarity ranking.

### Phase C — richer retrieval

Potential future sources:

- user-authored baseline plans;
- Learn content;
- calendar context;
- wearable summaries;
- user-selected documents.

Each integration requires explicit permission, visible provenance, and revocation.

## 11. Safety architecture

Safety checks occur before ordinary coaching and again after model output validation.

### Pre-model layer

- detect defined urgent-risk language and severe symptom patterns;
- bypass standard recommendation generation when required;
- display appropriate immediate-support guidance;
- log only the minimum needed safety event data.

### Model instructions

- no diagnosis;
- no medication changes;
- no treatment claims;
- no encouragement to manage dangerous withdrawal alone;
- no replacement for emergency or professional care;
- concise and nonjudgmental language.

### Post-model layer

- schema validation;
- forbidden-content checks;
- required escalation field consistency;
- safe fallback when output is missing or contradictory.

Safety policy changes must be reviewed and versioned separately from ordinary copy changes.

## 12. Privacy and consent

Required controls:

- memory off/on setting;
- inspect confirmed and proposed memories;
- reject or correct an inference;
- export user data;
- delete records and account;
- disconnect integrations;
- explain why a recommendation was generated;
- disclose which context was used at a useful level.

Avoid dark patterns around consent. The application should remain useful with optional memory features disabled, though personalization may be reduced.

## 13. Testing strategy

### Unit tests

- Zod schemas;
- deterministic mode engine;
- choice menu selection;
- action shrinking;
- safety routing;
- memory status transitions.

### Integration tests

- authenticated data access;
- RLS policies;
- check-in persistence;
- AI adapter with mocked output;
- invalid output fallback;
- export and deletion.

### End-to-end tests

- onboarding to first result;
- daily check-in to reflection;
- AI unavailable path;
- interpretation correction;
- urgent-risk test scenarios;
- mobile keyboard and focus flow.

### AI evaluations

Maintain a versioned dataset of fictional and de-identified scenarios covering:

- each baseline mode;
- conflicting signals;
- low-information check-ins;
- unrealistic goal pressure;
- substance urges;
- skipped habits without failure;
- established users who do not need simplification;
- safety escalation cases.

Evaluate mode fit, action realism, pressure/shame, grounding, autonomy, safety, and schema validity.

## 14. Development workflow

- `master` remains protected conceptually even if GitHub protection is not yet enabled.
- Work occurs on feature branches.
- Every pull request references an issue or documented milestone.
- Cursor may generate code, but generated changes must be reviewed, type-checked, built, and tested.
- Architectural decisions are recorded in the repository.
- Environment variables are documented in `.env.example`; secrets never enter commits or prompts.

## 15. Official technical references

- OpenAI Responses API: https://platform.openai.com/docs/api-reference/responses
- OpenAI Structured Outputs: https://platform.openai.com/docs/guides/structured-outputs
- OpenAI Retrieval: https://platform.openai.com/docs/guides/retrieval
- Supabase Next.js server-side auth: https://supabase.com/docs/guides/auth/server-side/nextjs
- Supabase vector columns: https://supabase.com/docs/guides/ai/vector-columns
- Next.js route handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
