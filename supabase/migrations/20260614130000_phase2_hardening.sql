-- Phase 2.0 hardening follow-up (safe to apply after 20260614120000)
-- Does not modify the already-applied Phase 2 migration.

-- ---------------------------------------------------------------------------
-- check_ins: require submission_id for idempotency
-- ---------------------------------------------------------------------------

update public.check_ins
set submission_id = gen_random_uuid()
where submission_id is null;

alter table public.check_ins
  alter column submission_id set not null;

drop index if exists public.check_ins_user_submission_id_unique;

create unique index check_ins_user_submission_id_unique
  on public.check_ins (user_id, submission_id);

-- ---------------------------------------------------------------------------
-- interpretations: one interpretation per check-in (Phase 2 v0.1)
-- Phase 3 may replace this with explicit interpretation versioning.
-- ---------------------------------------------------------------------------

do $$
declare
  duplicate_check_in_count int;
begin
  select count(*)
  into duplicate_check_in_count
  from (
    select check_in_id
    from public.interpretations
    group by check_in_id
    having count(*) > 1
  ) duplicates;

  if duplicate_check_in_count > 0 then
    raise exception
      'Cannot add interpretations_check_in_id_unique: % check_in_id value(s) have multiple interpretations. Resolve duplicates manually before applying this migration.',
      duplicate_check_in_count;
  end if;
end;
$$;

create unique index if not exists interpretations_check_in_id_unique
  on public.interpretations (check_in_id);

-- ---------------------------------------------------------------------------
-- action_records: structured action persistence
-- ---------------------------------------------------------------------------

alter table public.action_records
  add column if not exists action_key text,
  add column if not exists action_payload jsonb;

update public.action_records ar
set
  action_key = coalesce(
    ar.action_key,
    'legacy-' || ar.id::text
  ),
  action_payload = coalesce(
    ar.action_payload,
    jsonb_build_object(
      'id', coalesce(ar.action_key, 'legacy-' || ar.id::text),
      'title', case
        when position(': ' in ar.action_text) > 0
          then left(ar.action_text, position(': ' in ar.action_text) - 1)
        else ar.action_text
      end,
      'description', case
        when position(': ' in ar.action_text) > 0
          then substring(ar.action_text from position(': ' in ar.action_text) + 2)
        else ar.action_text
      end,
      'estimatedMinutes', null,
      'domain', ar.action_domain
    )
  )
where ar.action_key is null
   or ar.action_payload is null;

alter table public.action_records
  alter column action_key set not null,
  alter column action_payload set not null;

-- ---------------------------------------------------------------------------
-- submit_check_in_with_interpretation: deterministic single interpretation replay
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
    -- One interpretation per check_in_id (see interpretations_check_in_id_unique).
    select i.id
    into v_interpretation_id
    from public.interpretations i
    where i.check_in_id = v_check_in_id
      and i.user_id = v_user_id;

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
      and i.user_id = v_user_id;

    return jsonb_build_object(
      'check_in_id', v_check_in_id,
      'interpretation_id', v_interpretation_id,
      'idempotent_replay', true
    );
end;
$$;

comment on index public.interpretations_check_in_id_unique is
  'Phase 2 v0.1: one interpretation per check-in. Phase 3 may introduce explicit interpretation versioning and replace this constraint.';

-- Restrict RPC execution to authenticated users only.
revoke all on function public.submit_check_in_with_interpretation(
  uuid, int, int, int, int, int, text, text, text, text, text[], text, text, text,
  text, numeric, text, jsonb, jsonb, text[], text, jsonb, text, text, text[], text[]
) from public;

revoke all on function public.submit_check_in_with_interpretation(
  uuid, int, int, int, int, int, text, text, text, text, text[], text, text, text,
  text, numeric, text, jsonb, jsonb, text[], text, jsonb, text, text, text[], text[]
) from anon;

grant execute on function public.submit_check_in_with_interpretation(
  uuid, int, int, int, int, int, text, text, text, text, text[], text, text, text,
  text, numeric, text, jsonb, jsonb, text[], text, jsonb, text, text, text[], text[]
) to authenticated;
