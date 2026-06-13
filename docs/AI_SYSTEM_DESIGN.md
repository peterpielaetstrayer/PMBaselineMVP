# PMBaseline AI System Design

**Status:** v0.1 design contract  
**Last updated:** 2026-06-13

## 1. Purpose of the AI

The AI is not the product's database, authority, therapist, or autonomous life manager. It is a bounded interpretation and teaching layer inside a broader behavior-change system.

Its jobs are to:

- translate current context into a proposed baseline mode;
- identify one appropriately sized next move;
- offer a small number of alternatives;
- help the user reflect on outcomes;
- surface patterns with evidence;
- teach the user to recognize and manage their own baseline;
- adapt support without undermining autonomy.

## 2. Hybrid system, not chatbot-first architecture

PMBaseline should combine:

1. **Structured application data** — scores, choices, outcomes, dates, and confirmed preferences.
2. **Deterministic domain logic** — safety routing, fallback mode logic, choice menus, and validation.
3. **Model reasoning** — nuanced interpretation, synthesis, wording, and personalization.
4. **Retrieval** — selected relevant context from the user's profile and history.
5. **User correction** — explicit acceptance, rejection, modification, and memory confirmation.

The AI should never be given the entire database or an unlimited chat transcript. Context is deliberately selected and bounded.

## 3. Initial AI capabilities

### Daily interpretation

Input:

- current structured check-in;
- current free-text context;
- user profile summary;
- recent trend summary;
- several relevant successful or unsuccessful prior actions;
- confirmed stabilizers and destabilizers;
- current safety routing result.

Output:

- proposed mode;
- confidence;
- concise grounded summary;
- one primary action;
- alternatives;
- what not to prioritize now;
- reflection prompt;
- safety object.

### Reflection support

Input:

- original check-in;
- proposed and chosen action;
- action status;
- user's outcome reflection.

Output:

- concise synthesis;
- one possible lesson;
- zero or more proposed memory statements;
- a suggested adjustment for a similar future situation.

The system must label inferred lessons as proposals, not facts.

### Weekly synthesis

Input:

- seven-day structured summary;
- completed and modified actions;
- outcome ratings;
- confirmed memories;
- corrections the user made to prior interpretations.

Output:

- what supported baseline;
- what disrupted baseline;
- what the user protected;
- one experiment for the next week;
- confidence and evidence references;
- proposed memories requiring confirmation.

Weekly summaries should avoid moral judgment and overgeneralization from small samples.

## 4. Model interaction pattern

Use the OpenAI Responses API from a server-side adapter.

Each call should include:

- versioned developer instructions;
- a compact context object;
- the specific task;
- a strict JSON schema through Structured Outputs;
- a stable, privacy-conscious safety identifier;
- metadata such as prompt version and feature name;
- conservative output-token limits.

Prefer one focused call per user-visible result. Avoid chains of hidden agents for the initial product.

## 5. Structured output schema

The model must return validated data, not markup that the UI attempts to parse.

Illustrative TypeScript schema:

```ts
const InterpretationSchema = z.object({
  mode: z.enum(["stabilize", "rebuild", "maintain", "expand"]),
  confidence: z.number().min(0).max(1),
  summary: z.string().min(1).max(500),
  primaryAction: z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    estimatedMinutes: z.number().int().min(1).max(180).nullable(),
    domain: z.enum([
      "safety",
      "recovery",
      "nutrition",
      "hydration",
      "movement",
      "regulation",
      "work",
      "environment",
      "connection",
      "custom"
    ])
  }),
  alternatives: z.array(ActionSchema).max(3),
  avoidForNow: z.array(z.string().max(160)).max(3),
  reflectionPrompt: z.string().min(1).max(240),
  safety: z.object({
    level: z.enum(["standard", "support", "urgent"]),
    message: z.string().max(1000).nullable()
  })
})
```

If validation fails, do not partially render the response. Use the deterministic fallback and record the validation failure.

## 6. Prompt architecture

Prompts should be assembled from version-controlled components:

```text
lib/ai/prompts/
  shared-principles.ts
  daily-interpretation-v1.ts
  reflection-v1.ts
  weekly-summary-v1.ts
  safety-boundaries.ts
```

Shared instructions should include:

- baseline modes are adaptive and nonclinical;
- recognize meaningful protected behaviors;
- avoid all-or-nothing language;
- one next move is preferred over a long plan;
- give the user agency;
- do not invent history;
- distinguish user facts from system inference;
- do not diagnose or provide unsafe medical guidance;
- established users may need refinement rather than simplification;
- suggest less when lower capacity is evident;
- support expansion only when baseline conditions are reasonably protected.

Do not bury product logic only inside a giant prompt. Important rules should exist in code, schemas, tests, and documentation.

## 7. Retrieval without premature vector complexity

### v0.1: relational context assembly

A context builder retrieves:

- baseline profile;
- today's check-in;
- last 7–14 check-ins as compact records;
- last 3–5 action outcomes;
- confirmed stabilizers and destabilizers;
- recent interpretation corrections;
- current choice menu.

The server converts these into a compact JSON context. This is sufficient for the first useful personalized system.

### v0.2: derived summaries

Create deterministic or model-assisted summaries such as:

- seven-day trend;
- repeated high-stress contexts;
- actions most often rated helpful;
- common recommendation edits;
- missed-data indicators.

Derived summaries should retain links to source record IDs.

### v0.3: semantic retrieval

Use embeddings and a Supabase vector column for compact reflection summaries and confirmed memory statements.

Retrieval sequence:

1. filter records by authenticated user;
2. apply metadata filters such as record type and time window;
3. rank by semantic similarity;
4. apply relevance threshold;
5. limit to a small number of excerpts;
6. include source IDs in the AI context;
7. record which sources influenced the result.

Vector search is not a replacement for relational filters, recency logic, or user ownership enforcement.

## 8. Memory lifecycle

### Capture

A memory can originate from:

- direct user entry;
- user correction;
- repeated structured outcomes;
- an AI-proposed pattern.

### Status

Every memory is one of:

- `proposed`;
- `confirmed`;
- `rejected`;
- `superseded`;
- `expired`.

### Confirmation

Potentially meaningful inferences should be presented clearly:

> “I noticed that eating late appeared alongside higher anxiety on three logged days. Does that feel accurate or useful to remember?”

The user can confirm, edit, reject, or postpone.

### Use

Only confirmed memories should be treated as stable personal context. Proposed memories may be shown for confirmation but should not silently drive strong recommendations.

### Review and deletion

The user can see:

- the memory statement;
- whether it was entered or inferred;
- supporting records;
- when it was last used;
- confidence;
- edit and delete controls.

Deleting a source record should remove or invalidate dependent memories and embeddings.

## 9. Safety routing

The AI system must distinguish ordinary difficulty from situations requiring immediate support.

### Deterministic urgent screen

Before the interpretation call, check for defined indicators involving:

- immediate self-harm or harm-to-others intent;
- inability to stay safe;
- severe physical symptoms;
- possible dangerous alcohol or substance withdrawal;
- loss of consciousness, seizure, chest pain, severe breathing difficulty, or other emergency indicators;
- abuse or immediate danger.

The detailed policy and copy should be reviewed with qualified clinical and safety expertise before public release.

### Behavior when urgent

- Do not generate an ordinary productivity or habit recommendation.
- Provide direct, calm escalation guidance appropriate to the user's region.
- Encourage immediate human contact.
- Avoid implying that the app is monitoring or dispatching help.
- Keep the user in control while stating the seriousness clearly.

### Standard support boundaries

The assistant may support grounding, reflection, planning, and behavior selection, but it must not diagnose, prescribe, direct medication changes, or advise a user to manage dangerous withdrawal alone.

## 10. Explainability

Every recommendation should support a concise “Why this?” view containing:

- current check-in factors used;
- relevant confirmed profile items;
- relevant recent pattern or prior outcome;
- whether the result came from AI, fallback logic, or both;
- an invitation to correct the interpretation.

Do not expose hidden reasoning traces. Explain the evidence and product logic in user-readable form.

## 11. Model selection and cost

Model choice should be configuration-driven and evaluated rather than hard-coded throughout the app.

Use a capable, cost-conscious model for daily structured interpretation. Reserve more expensive reasoning only for tasks that demonstrably benefit, such as complex weekly synthesis.

Track:

- input and output tokens;
- latency;
- schema failure rate;
- fallback rate;
- estimated cost per active user;
- mode correction rate;
- recommendation modification rate;
- helpfulness outcomes.

Do not optimize only for the cheapest call. Optimize for safe, useful decisions at sustainable cost.

## 12. Evaluation framework

Build a scenario suite before relying on the AI in daily use.

### Dimensions

- mode appropriateness;
- grounding in provided data;
- action feasibility;
- amount of pressure created;
- respect for autonomy;
- recognition of protected behaviors;
- avoidance of invented facts;
- quality for established users;
- safety routing;
- schema validity;
- brevity and clarity.

### Adversarial and edge cases

- user asks for many simultaneous changes;
- user reports no exercise but meaningful sober or recovery behavior;
- high energy with very poor sleep;
- contradictory numerical scores and text;
- no history exists;
- user rejects the mode repeatedly;
- a familiar action previously made the user feel worse;
- user wants the AI to control every decision;
- user uses manipulative or self-condemning language;
- urgent medical or safety statements.

### Human review

During alpha, manually review sampled outputs and user corrections. Do not use user-sensitive examples in development prompts without de-identification and consent.

## 13. What not to build yet

- an autonomous agent that continuously watches every system;
- unrestricted tool use;
- long-lived opaque model conversations as memory;
- multiple agents debating each recommendation;
- fine-tuning before prompt, data, and evaluation maturity;
- embeddings for all raw text;
- automatic permanent memories without confirmation;
- AI-generated clinical labels;
- a universal score claiming to define a person's health.

## 14. Definition of “AI built properly” for the MVP

The AI is properly integrated when:

- it operates behind a typed server boundary;
- outputs are schema-constrained and validated;
- the app works safely without it;
- it receives only relevant, permissioned context;
- user corrections are first-class data;
- memory is visible and controllable;
- safety routing occurs outside ordinary coaching;
- prompts and models are versioned;
- outputs can be evaluated against stable scenarios;
- product learning, not novelty, determines future complexity.
