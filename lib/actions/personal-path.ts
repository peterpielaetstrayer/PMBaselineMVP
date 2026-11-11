"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  PersonalPathInputSchema,
  type PersonalPath,
} from "@/lib/baseline/personal-path"
import { actionError, actionSuccess, type ActionResult } from "@/lib/validation/result"

/**
 * Persists user-authored direction only. This never stores an inferred state,
 * changes unrelated baseline preferences, or seeds a fitness plan.
 */
export async function savePersonalPath(input: unknown): Promise<ActionResult<PersonalPath>> {
  const parsed = PersonalPathInputSchema.safeParse(input)
  if (!parsed.success) {
    return actionError("VALIDATION_ERROR", "Please keep your description brief and choose up to three short priorities.")
  }

  let client
  try {
    client = await createClient()
  } catch {
    return actionError("NOT_CONFIGURED", "Saving is unavailable right now.")
  }

  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser()

  if (authError || !user) {
    return actionError("NOT_AUTHENTICATED", "Please sign in again to save your path.")
  }

  // Ensure the parent row exists for older accounts, without updating existing preferences.
  const parent = await client
    .from("profiles")
    .upsert({ id: user.id }, { onConflict: "id", ignoreDuplicates: true })

  if (parent.error) {
    return actionError("DATABASE_ERROR", "We couldn't save your path right now.")
  }

  const { data, error } = await client
    .from("baseline_profiles")
    .upsert(
      {
        user_id: user.id,
        user_defined_baseline: parsed.data.baseline || null,
        current_priorities: parsed.data.priorities,
      },
      { onConflict: "user_id" }
    )
    .select("user_defined_baseline,current_priorities")
    .single()

  if (error || !data) {
    return actionError("DATABASE_ERROR", "We couldn't save your path right now.")
  }

  revalidatePath("/my-path")
  revalidatePath("/today")

  return actionSuccess({
    baseline: data.user_defined_baseline ?? "",
    priorities: data.current_priorities,
  })
}
