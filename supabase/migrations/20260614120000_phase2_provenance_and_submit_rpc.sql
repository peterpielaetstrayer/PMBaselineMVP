-- Phase 2.0: interpretation provenance, domain constraints, idempotency, atomic submit RPC

-- ---------------------------------------------------------------------------
-- check_ins: idempotency + safety constraint
-- ---------------------------------------------------------------------------

alter table public.check_ins
  add column if not exists submission_id uuid;

create unique index if not exists check_ins_user_submission_id_unique
  on public.check_ins (user_id, submission_id)
  where submission_id is not null;

alter table public.check_ins
  drop constraint if exists check_ins_safety_level_check;

alter table public.check_ins
  add constraint check_ins_safety_level_check
  check (safety_level in ('standard', 'support', 'urgent'));

-- ---------------------------------------------------------------------------
-- interpretations: provenance columns + constraints
-- ---------------------------------------------------------------------------

alter table public.interpretations
  add column if not exists engine_version text,
  add column if not exists reason_codes text[] not null default '{}',
  add column if not exists factors text[] not null default '{}';

alter table public.interpretations
  alter column source set default 'fallback';

alter table public.interpretations
  drop constraint if exists interpretations_proposed_mode_check;

alter table public.interpretations
  add constraint interpretations_proposed_mode_check
  check (proposed_mode in ('stabilize', 'rebuild', 'maintain', 'expand'));

alter table public.interpretations
  drop constraint if exists interpretations_source_check;

alter table public.interpretations
  add constraint interpretations_source_check
  check (source in ('fallback', 'ai', 'hybrid'));

alter table public.interpretations
  drop constraint if exists interpretations_user_disposition_check;

alter table public.interpretations
  add constraint interpretations_user_disposition_check
  check (
    user_disposition is null
    or user_disposition in ('accepted', 'edited', 'rejected')
  );

-- ---------------------------------------------------------------------------
-- action_records: source + status constraints
-- ---------------------------------------------------------------------------

alter table public.action_records
  drop constraint if exists action_records_action_source_check;

alter table public.action_records
  add constraint action_records_action_source_check
  check (action_source in ('primary', 'alternative', 'user', 'fallback'));

alter table public.action_records
  drop constraint if exists action_records_status_check;

alter table public.action_records
  add constraint action_records_status_check
  check (status in ('accepted', 'modified', 'completed', 'skipped', 'cancelled'));

-- ---------------------------------------------------------------------------
-- reflections: effect constraint
-- ---------------------------------------------------------------------------

alter table public.reflections
  drop constraint if exists reflections_effect_check;

alter table public.reflections
  add constraint reflections_effect_check
  check (
    effect is null
    or effect in ('helped', 'neutral', 'hurt', 'unknown')
  );

-- ---------------------------------------------------------------------------
-- Atomic check-in + interpretation submit (transactional, idempotent)
-- ---------------------------------------------------------------------------

create or replace function public.submit_check_in_with_interpretation(
  p_submission_id uuid,
  p_physical_score int,
  p_mental_score int,
  p_energy_score int,
  p_stress_score int,
  p_sleep_score int,
  p_food_status text,
  p_hydration_status text,
  p_movement_status text,
  p_alcohol_or_substance_context text,
  p_context_tags text[],
  p_heavy_or_important_text text,
  p_optional_note text,
  p_safety_level text,
  p_proposed_mode text,
  p_confidence numeric,
  p_summary text,
  p_primary_action jsonb,
  p_alternative_actions jsonb,
  p_avoid_for_now text[],
  p_reflection_prompt text,
  p_safety jsonb,
  p_source text,
  p_engine_version text,
  p_reason_codes text[],
  p_factors text[]
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid;
  v_check_in_id uuid;
  v_interpretation_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'NOT_AUTHENTICATED';
  end if;

  if p_submission_id is null then
    raise exception using errcode = '22023', message = 'submission_id is required';
  end if;

  select ci.id
  into v_check_in_id
  from public.check_ins ci
  where ci.user_id = v_user_id
    and ci.submission_id = p_submission_id;

  if v_check_in_id is not null then
    select i.id
    into v_interpretation_id
    from public.interpretations i
    where i.check_in_id = v_check_in_id
      and i.user_id = v_user_id
    order by i.created_at desc
    limit 1;

    return jsonb_build_object(
      'check_in_id', v_check_in_id,
      'interpretation_id', v_interpretation_id,
      'idempotent_replay', true
    );
  end if;

  insert into public.check_ins (
    user_id,
    submission_id,
    physical_score,
    mental_score,
    energy_score,
    stress_score,
    sleep_score,
    food_status,
    hydration_status,
    movement_status,
    alcohol_or_substance_context,
    context_tags,
    heavy_or_important_text,
    optional_note,
    safety_level
  )
  values (
    v_user_id,
    p_submission_id,
    p_physical_score,
    p_mental_score,
    p_energy_score,
    p_stress_score,
    p_sleep_score,
    p_food_status,
    p_hydration_status,
    p_movement_status,
    p_alcohol_or_substance_context,
    coalesce(p_context_tags, '{}'::text[]),
    p_heavy_or_important_text,
    p_optional_note,
    p_safety_level
  )
  returning id into v_check_in_id;

  insert into public.interpretations (
    user_id,
    check_in_id,
    proposed_mode,
    confidence,
    summary,
    primary_action,
    alternative_actions,
    avoid_for_now,
    reflection_prompt,
    safety,
    source,
    engine_version,
    reason_codes,
    factors
  )
  values (
    v_user_id,
    v_check_in_id,
    p_proposed_mode,
    p_confidence,
    p_summary,
    p_primary_action,
    coalesce(p_alternative_actions, '[]'::jsonb),
    coalesce(p_avoid_for_now, '{}'::text[]),
    p_reflection_prompt,
    coalesce(p_safety, '{"level":"standard","message":null}'::jsonb),
    coalesce(p_source, 'fallback'),
    p_engine_version,
    coalesce(p_reason_codes, '{}'::text[]),
    coalesce(p_factors, '{}'::text[])
  )
  returning id into v_interpretation_id;

  return jsonb_build_object(
    'check_in_id', v_check_in_id,
    'interpretation_id', v_interpretation_id,
    'idempotent_replay', false
  );
exception
  when unique_violation then
    select ci.id
    into v_check_in_id
    from public.check_ins ci
    where ci.user_id = v_user_id
      and ci.submission_id = p_submission_id;

    select i.id
    into v_interpretation_id
    from public.interpretations i
    where i.check_in_id = v_check_in_id
      and i.user_id = v_user_id
    order by i.created_at desc
    limit 1;

    return jsonb_build_object(
      'check_in_id', v_check_in_id,
      'interpretation_id', v_interpretation_id,
      'idempotent_replay', true
    );
end;
$$;

grant execute on function public.submit_check_in_with_interpretation(
  uuid, int, int, int, int, int, text, text, text, text, text[], text, text, text,
  text, numeric, text, jsonb, jsonb, text[], text, jsonb, text, text, text[], text[]
) to authenticated;
