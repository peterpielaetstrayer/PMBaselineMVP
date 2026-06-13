# Cursor and Git Workflow for PMBaseline

**Status:** working agreement  
**Last updated:** 2026-06-13

## Canonical repository

Use this repository:

```text
peterpielaetstrayer/PMBaselineMVP
```

Primary foundation branch:

```text
foundation-baseline-v0-1
```

Do not work in `pmbaseline`, `baseline-app`, or `pmbaseline-reset` unless explicitly migrating specific ideas or files.

## First setup in Cursor

If the repo is not cloned locally:

```bash
git clone https://github.com/peterpielaetstrayer/PMBaselineMVP.git
cd PMBaselineMVP
```

Then fetch the latest remote branches:

```bash
git fetch origin
```

Check out the foundation branch:

```bash
git checkout foundation-baseline-v0-1
```

Pull the latest changes:

```bash
git pull origin foundation-baseline-v0-1
```

Install dependencies:

```bash
npm install
```

Run checks:

```bash
npm run type-check
npm run build
```

If `type-check` is not available in the current package scripts, use:

```bash
npx tsc --noEmit
npm run build
```

## Important rule: Cursor does not auto-sync

If ChatGPT makes changes through GitHub, Cursor will not automatically see them.

Before editing in Cursor after ChatGPT has changed files, run:

```bash
git fetch origin
git pull
```

If you are on a specific branch:

```bash
git pull origin foundation-baseline-v0-1
```

## Working pattern

### 1. Pull first

Before every coding session:

```bash
git status
git fetch origin
git pull
```

If you have uncommitted local changes, do not pull blindly. Commit or stash first.

### 2. Create a feature branch

Example:

```bash
git checkout -b feature/deterministic-mode-engine
```

Use small branches:

- `feature/supabase-schema`
- `feature/check-in-flow`
- `feature/mode-engine`
- `feature/action-selection`
- `feature/reflection-flow`
- `feature/ai-interpretation-endpoint`

### 3. Give Cursor bounded tasks

Bad Cursor prompt:

> Build the whole PMBaseline app.

Good Cursor prompt:

> Read `docs/PROJECT_CANON.md`, `docs/MVP_SPEC.md`, `docs/TECHNICAL_ARCHITECTURE.md`, and `docs/DATABASE_SCHEMA.md`. Implement only the deterministic mode engine described in Phase 2 of `docs/BUILD_ROADMAP.md`. Do not add AI, Supabase migrations, or UI changes yet. Create typed functions under `lib/baseline/`, add unit tests if the project already has a test setup, and update only files necessary for this task.

### 4. Commit often

Use small commits:

```bash
git add .
git commit -m "feat: add deterministic baseline mode engine"
```

### 5. Push branch

```bash
git push origin feature/deterministic-mode-engine
```

### 6. Ask ChatGPT to review

Tell ChatGPT:

> Review branch `feature/deterministic-mode-engine` in `peterpielaetstrayer/PMBaselineMVP` against the docs and tell me what to fix before merging.

ChatGPT can inspect branches, files, commits, and pull requests through GitHub.

## Project control documents

Read these before major implementation:

```text
docs/PROJECT_CANON.md
docs/MVP_SPEC.md
docs/TECHNICAL_ARCHITECTURE.md
docs/AI_SYSTEM_DESIGN.md
docs/DATABASE_SCHEMA.md
docs/BUILD_ROADMAP.md
docs/CURSOR_WORKFLOW.md
```

## Decision log rule

When an architectural decision is made, add it to:

```text
docs/DECISION_LOG.md
```

Use this format:

```md
## YYYY-MM-DD — Decision title

**Decision:** What was decided.

**Why:** Why it was chosen.

**Rejected alternatives:** What we considered but did not choose.

**Implications:** What this affects later.
```

## Cursor safety rules

Cursor should not:

- commit secrets;
- expose OpenAI keys or Supabase service role keys;
- bypass RLS;
- call OpenAI from client components;
- remove user memory controls;
- create broad autonomous agent behavior;
- add wearable integrations before core loop works;
- replace the documented architecture without updating docs.

## Best first Cursor prompt

Use this after pulling the foundation branch:

```text
You are working in the PMBaseline repository. First read:
- docs/PROJECT_CANON.md
- docs/MVP_SPEC.md
- docs/TECHNICAL_ARCHITECTURE.md
- docs/AI_SYSTEM_DESIGN.md
- docs/DATABASE_SCHEMA.md
- docs/BUILD_ROADMAP.md
- docs/CURSOR_WORKFLOW.md

Do not start coding yet. Summarize the current architecture, identify what code already exists, identify gaps between the code and the docs, and propose the first three small implementation tasks. Keep the plan aligned with the docs. Do not modify files until I approve the task list.
```

This prompt prevents Cursor from rushing into broad, uncontrolled changes.

## Best first coding task

After Cursor summarizes the repo, the first coding task should probably be:

```text
Implement the deterministic baseline mode engine under lib/baseline/. It should classify a check-in into stabilize, rebuild, maintain, or expand using clear, tested rules. It should not use OpenAI. It should export typed functions that the future API and UI can call. Follow docs/PROJECT_CANON.md, docs/MVP_SPEC.md, and docs/TECHNICAL_ARCHITECTURE.md.
```

Reason:

The deterministic mode engine creates the safe fallback and core product logic before AI is added.