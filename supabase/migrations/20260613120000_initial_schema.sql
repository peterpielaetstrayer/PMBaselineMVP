-- PMBaseline initial schema (Phase A)
-- Canonical reference: docs/DATABASE_SCHEMA.md

-- ---------------------------------------------------------------------------
-- Utility: updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Utility: apply owner-based RLS policies (user_id column)
-- ---------------------------------------------------------------------------

create or replace function public.apply_user_rls(table_name text)
returns void
language plpgsql
as $$
begin
  execute format('alter table public.%I enable row level security', table_name);

  execute format(
    'create policy "Users can read own %1$s" on public.%1$I for select to authenticated using (auth.uid() = user_id)',
    table_name
  );
  execute format(
    'create policy "Users can insert own %1$s" on public.%1$I for insert to authenticated with check (auth.uid() = user_id)',
    table_name
  );
  execute format(
    'create policy "Users can update own %1$s" on public.%1$I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)',
    table_name
  );
  execute format(
    'create policy "Users can delete own %1$s" on public.%1$I for delete to authenticated using (auth.uid() = user_id)',
    table_name
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  timezone text not null default 'America/New_York',
  onboarding_status text not null default 'not_started',
  coaching_tone text not null default 'warm_direct',
  memory_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can delete own profile"
  on public.profiles for delete
  to authenticated
  using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- baseline_profiles
-- ---------------------------------------------------------------------------

create table public.baseline_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  known_stabilizers text[] not null default '{}',
  known_destabilizers text[] not null default '{}',
  current_priorities text[] not null default '{}',
  constraints text[] not null default '{}',
  preferred_minimum_actions jsonb not null default '[]'::jsonb,
  user_defined_baseline text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint baseline_profiles_user_id_unique unique (user_id)
);

create trigger baseline_profiles_set_updated_at
  before update on public.baseline_profiles
  for each row execute function public.set_updated_at();

select public.apply_user_rls('baseline_profiles');

-- ---------------------------------------------------------------------------
-- check_ins
-- ---------------------------------------------------------------------------

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  physical_score int check (physical_score between 0 and 10),
  mental_score int check (mental_score between 0 and 10),
  energy_score int check (energy_score between 0 and 10),
  stress_score int check (stress_score between 0 and 10),
  sleep_score int check (sleep_score between 0 and 10),
  food_status text,
  hydration_status text,
  movement_status text,
  alcohol_or_substance_context text,
  context_tags text[] not null default '{}',
  heavy_or_important_text text,
  optional_note text,
  safety_level text not null default 'standard',
  created_at timestamptz not null default now()
);

select public.apply_user_rls('check_ins');

-- ---------------------------------------------------------------------------
-- interpretations
-- ---------------------------------------------------------------------------

create table public.interpretations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  check_in_id uuid not null references public.check_ins (id) on delete cascade,
  proposed_mode text not null,
  confidence numeric check (confidence >= 0 and confidence <= 1),
  summary text not null,
  primary_action jsonb not null,
  alternative_actions jsonb not null default '[]'::jsonb,
  avoid_for_now text[] not null default '{}',
  reflection_prompt text,
  safety jsonb not null default '{"level":"standard","message":null}'::jsonb,
  source text not null default 'ai',
  model_id text,
  prompt_version text,
  retrieved_context jsonb not null default '[]'::jsonb,
  user_disposition text,
  user_corrected_mode text,
  created_at timestamptz not null default now()
);

select public.apply_user_rls('interpretations');

-- ---------------------------------------------------------------------------
-- action_records
-- ---------------------------------------------------------------------------

create table public.action_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  check_in_id uuid references public.check_ins (id) on delete set null,
  interpretation_id uuid references public.interpretations (id) on delete set null,
  action_text text not null,
  action_domain text not null default 'custom',
  action_source text not null default 'user',
  status text not null default 'accepted',
  modified_from text,
  scheduled_for timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger action_records_set_updated_at
  before update on public.action_records
  for each row execute function public.set_updated_at();

select public.apply_user_rls('action_records');

-- ---------------------------------------------------------------------------
-- reflections
-- ---------------------------------------------------------------------------

create table public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  check_in_id uuid references public.check_ins (id) on delete set null,
  action_record_id uuid references public.action_records (id) on delete set null,
  effect text,
  what_changed text,
  what_was_protected text,
  lesson text,
  final_baseline_score int check (final_baseline_score between 0 and 10),
  created_at timestamptz not null default now()
);

select public.apply_user_rls('reflections');

-- ---------------------------------------------------------------------------
-- memories
-- embedding column deferred until pgvector is enabled
-- ---------------------------------------------------------------------------

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  memory_type text not null,
  statement text not null,
  source_record_ids uuid[] not null default '{}',
  status text not null default 'proposed',
  confidence numeric check (confidence >= 0 and confidence <= 1),
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger memories_set_updated_at
  before update on public.memories
  for each row execute function public.set_updated_at();

select public.apply_user_rls('memories');

-- ---------------------------------------------------------------------------
-- weekly_summaries
-- Supports AI weekly synthesis (docs/AI_SYSTEM_DESIGN.md)
-- ---------------------------------------------------------------------------

create table public.weekly_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  week_start date not null,
  week_end date not null,
  what_supported_baseline text,
  what_disrupted_baseline text,
  what_was_protected text,
  next_week_experiment text,
  confidence numeric check (confidence >= 0 and confidence <= 1),
  evidence_references jsonb not null default '[]'::jsonb,
  proposed_memories jsonb not null default '[]'::jsonb,
  summary jsonb not null default '{}'::jsonb,
  source text not null default 'ai',
  model_id text,
  prompt_version text,
  user_disposition text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_summaries_week_range check (week_end >= week_start),
  constraint weekly_summaries_user_week_unique unique (user_id, week_start)
);

create trigger weekly_summaries_set_updated_at
  before update on public.weekly_summaries
  for each row execute function public.set_updated_at();

select public.apply_user_rls('weekly_summaries');

-- ---------------------------------------------------------------------------
-- ai_runs
-- AI call provenance and observability (server-side writes)
-- ---------------------------------------------------------------------------

create table public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  feature_name text not null,
  related_record_type text,
  related_record_id uuid,
  model_id text,
  prompt_version text,
  input_context jsonb not null default '{}'::jsonb,
  output jsonb,
  status text not null default 'success',
  error_message text,
  latency_ms int,
  input_tokens int,
  output_tokens int,
  created_at timestamptz not null default now()
);

select public.apply_user_rls('ai_runs');

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index baseline_profiles_user_id_idx on public.baseline_profiles (user_id);

create index check_ins_user_id_created_at_idx
  on public.check_ins (user_id, created_at desc);

create index interpretations_user_id_created_at_idx
  on public.interpretations (user_id, created_at desc);

create index interpretations_check_in_id_idx
  on public.interpretations (check_in_id);

create index action_records_user_id_created_at_idx
  on public.action_records (user_id, created_at desc);

create index reflections_user_id_created_at_idx
  on public.reflections (user_id, created_at desc);

create index memories_user_id_status_memory_type_idx
  on public.memories (user_id, status, memory_type);

create index weekly_summaries_user_id_week_start_idx
  on public.weekly_summaries (user_id, week_start desc);

create index ai_runs_user_id_created_at_idx
  on public.ai_runs (user_id, created_at desc);

create index ai_runs_related_record_idx
  on public.ai_runs (related_record_type, related_record_id);

-- ---------------------------------------------------------------------------
-- Cleanup helper (keep tables; function only used during migration setup)
-- ---------------------------------------------------------------------------

drop function public.apply_user_rls(text);
