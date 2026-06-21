# PMBaseline Smoke Test Checklist

**Purpose:** Manual verification of the canonical non-AI MVP before Phase 3 AI work.  
**Last updated:** 2026-06-14

Run against a local build with Supabase configured (`.env.local`).

## Auth

- [ ] **Sign up** — create account; if confirmation required, see “Check your email” state
- [ ] **Sign up confirmation** — confirm email link; `/login?confirmed=1` shows confirmation message
- [ ] **Sign in** — valid credentials reach `/today`
- [ ] **Sign out** — button disables briefly; returns to `/login`
- [ ] **Double sign-in click** — second click ignored while pending

## Routing

- [ ] **`/` authenticated** — redirects to `/today`
- [ ] **`/` unauthenticated** — redirects to `/login` (try incognito)
- [ ] **`/login` authenticated** — redirects to `/today`
- [ ] **Protected routes unauthenticated** — `/today`, `/check-in`, `/history` redirect to `/login`
- [ ] **`/legacy`** — loads old app with retirement banner and link to Today

## Today workspace

- [ ] **`/today`** — greeting, Check in CTA, View history link
- [ ] **Latest loop** — after a check-in, shows mode/status with continue link
- [ ] **Profile settling message** — shows calmly when profile rows missing (new users)

## Check-in → result

- [ ] **`/check-in`** — sliders usable on mobile; optional details expand/collapse
- [ ] **Submit check-in** — button disables; lands on `/result/[checkInId]`
- [ ] **Double submit** — second click ignored while pending
- [ ] **Result page** — shows stored mode, summary, avoid-for-now when present
- [ ] **Safety banner** — appears when support/urgent signals checked

## Action accept

- [ ] **Accept primary/alternative** — shows accepted card; reflect CTA appears
- [ ] **Custom action** — title + description required; accepts successfully
- [ ] **Refresh result after accept** — still shows accepted action (no duplicate choice UI)
- [ ] **Double accept click** — only one accepted action; no duplicate errors

## Reflection

- [ ] **`/reflect/[checkInId]`** — requires accepted action; otherwise friendly not-found
- [ ] **Submit reflection** — saves and returns to `/today`
- [ ] **Refresh reflect after submit** — shows reflection complete card, not form again
- [ ] **Double reflection submit** — idempotent; no duplicate or raw error

## History

- [ ] **`/history`** — lists recent loops with date, mode, status
- [ ] **Partial loop** — links to result or reflect appropriately
- [ ] **Empty history** — invites check-in
- [ ] **Complete loop** — shows action, effect, score when saved

## Error / edge cases

- [ ] **Invalid result ID** — friendly not-found with links to check-in and today
- [ ] **Reflect without action** — friendly not-found with history link
- [ ] **Form errors** — readable messages, not raw database text

## Canonical isolation

- [ ] **Canonical routes** — no legacy localStorage reads in network tab for `/today`, `/check-in`, `/history`
- [ ] **No legacy console noise** — canonical routes do not log hybridStorage initialization
- [ ] **`/legacy` only** — legacy storage/reminder initialization acceptable here only

## Build health

- [ ] `npx tsc --noEmit` passes
- [ ] `npm run test` passes
- [ ] `npm run build` passes
