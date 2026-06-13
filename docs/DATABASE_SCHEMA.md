# PMBaseline Database Schema Plan

**Status:** v0.1 planning draft  
**Canonical repo:** `peterpielaetstrayer/PMBaselineMVP`  
**Last updated:** 2026-06-13

## Purpose

This document defines the first Supabase/Postgres schema for the PMBaseline alpha. The database should support the full baseline loop:

1. profile and onboarding;
2. daily check-in;
3. mode interpretation;
4. next action selection/modification;
5. reflection;
6. history;
7. memory inspection and correction.

The database is the source of truth. The AI interprets selected context from the database; it does not replace the database.

## Design principles

- Every user-owned row has a `user_id`.
- Row Level Security is enabled on all user-owned tables.
- AI inferences are stored separately from user-stated facts.
- Raw daily events are not collapsed into permanent personality claims.
- Memory has a lifecycle: proposed, confirmed, rejected, superseded, expired.
- Deletion and export must be possible from the beginning.
- Schema should support future retrieval and embeddings without requiring them in v0.1.

## Core tables

### profiles

One row per authenticated user.

- `id uuid primary key references auth.users(id) on delete cascade`
- `display_name text`
- `timezone text not null default 'America/New_York'`
- `onboarding_status text not null default 'not_started'`
- `coaching_tone text not null default 'warm_direct'`
- `memory_consent boolean not null default false`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### baseline_profiles

User-confirmed baseline context.

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references profiles(id) on delete cascade`
- `known_stabilizers text[] not null default '{}'`
- `known_destabilizers text[] not null default '{}'`
- `current_priorities text[] not null default '{}'`
- `constraints text[] not null default '{}'`
- `preferred_minimum_actions jsonb not null default '[]'::jsonb`
- `user_defined_baseline text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### check_ins

A timestamped user state snapshot.

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references profiles(id) on delete cascade`
- `physical_score int check (physical_score between 0 and 10)`
- `mental_score int check (mental_score between 0 and 10)`
- `energy_score int check (energy_score between 0 and 10)`
- `stress_score int check (stress_score between 0 and 10)`
- `sleep_score int check (sleep_score between 0 and 10)`
- `food_status text`
- `hydration_status text`
- `movement_status text`
- `alcohol_or_substance_context text`
- `context_tags text[] not null default '{}'`
- `heavy_or_important_text text`
- `optional_note text`
- `safety_level text not null default 'standard'`
- `created_at timestamptz not null default now()`

### interpretations

The system's proposed meaning of a check-in.

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references profiles(id) on delete cascade`
- `check_in_id uuid not null references check_ins(id) on delete cascade`
- `proposed_mode text not null`
- `confidence numeric check (confidence >= 0 and confidence <= 1)`
- `summary text not null`
- `primary_action jsonb not null`
- `alternative_actions jsonb not null default '[]'::jsonb`
- `avoid_for_now text[] not null default '{}'`
- `reflection_prompt text`
- `safety jsonb not null default '{"level":"standard","message":null}'::jsonb`
- `source text not null default 'ai'` -- ai, fallback, hybrid
- `model_id text`
- `prompt_version text`
- `retrieved_context jsonb not null default '[]'::jsonb`
- `user_disposition text` -- accepted, edited, rejected
- `user_corrected_mode text`
- `created_at timestamptz not null default now()`

### action_records

The user's selected, edited, or completed next move.

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references profiles(id) on delete cascade`
- `check_in_id uuid references check_ins(id) on delete set null`
- `interpretation_id uuid references interpretations(id) on delete set null`
- `action_text text not null`
- `action_domain text not null default 'custom'`
- `action_source text not null default 'user'` -- primary, alternative, user, fallback
- `status text not null default 'accepted'`
- `modified_from text`
- `scheduled_for timestamptz`
- `completed_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### reflections

Outcome and learning record.

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references profiles(id) on delete cascade`
- `check_in_id uuid references check_ins(id) on delete set null`
- `action_record_id uuid references action_records(id) on delete set null`
- `effect text` -- helped, neutral, hurt, unknown
- `what_changed text`
- `what_was_protected text`
- `lesson text`
- `final_baseline_score int check (final_baseline_score between 0 and 10)`
- `created_at timestamptz not null default now()`

### memories

User-confirmed and AI-proposed memory statements.

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references profiles(id) on delete cascade`
- `memory_type text not null` -- stabilizer, destabilizer, preference, pattern, constraint, value
- `statement text not null`
- `source_record_ids uuid[] not null default '{}'`
- `status text not null default 'proposed'`
- `confidence numeric check (confidence >= 0 and confidence <= 1)`
- `embedding vector` -- add when pgvector is introduced
- `last_used_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

## Indexes

Recommended early indexes:

- `profiles(id)`
- `baseline_profiles(user_id)`
- `check_ins(user_id, created_at desc)`
- `interpretations(user_id, created_at desc)`
- `interpretations(check_in_id)`
- `action_records(user_id, created_at desc)`
- `reflections(user_id, created_at desc)`
- `memories(user_id, status, memory_type)`

## RLS policy pattern

Every user-owned table should follow this pattern:

```sql
alter table public.check_ins enable row level security;

create policy "Users can read own check_ins"
on public.check_ins for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own check_ins"
on public.check_ins for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own check_ins"
on public.check_ins for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own check_ins"
on public.check_ins for delete
to authenticated
using (auth.uid() = user_id);
```

Repeat for all user-owned tables.

## Future additions

Not required in v0.1:

- wearable summary tables;
- calendar context tables;
- shared accountability spaces;
- paid subscription tables;
- long-form journal attachments;
- semantic search across Learn content;
- native notification delivery tables.

These should be added only after the daily check-in → interpretation → action → reflection loop is working.