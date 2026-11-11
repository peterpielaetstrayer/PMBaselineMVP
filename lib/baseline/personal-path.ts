import { z } from "zod"
import type { BaselineProfile } from "@/lib/data/baseline-profiles"

export const MAX_PATH_PRIORITIES = 3

export const PersonalPathInputSchema = z
  .object({
    baseline: z.string().trim().max(600, "Keep this to 600 characters or fewer."),
    priorities: z
      .array(z.string().trim().max(120, "Keep each priority to 120 characters or fewer."))
      .max(MAX_PATH_PRIORITIES, "Choose up to three priorities."),
  })
  .strict()
  .transform(({ baseline, priorities }) => {
    const seen = new Set<string>()
    const unique = priorities.filter((value) => {
      if (!value) return false
      const key = value.toLocaleLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    return { baseline, priorities: unique }
  })

export type PersonalPath = z.infer<typeof PersonalPathInputSchema>

export const EMPTY_PERSONAL_PATH: PersonalPath = {
  baseline: "",
  priorities: [],
}

export function personalPathFromProfile(
  profile: Pick<BaselineProfile, "user_defined_baseline" | "current_priorities"> | null | undefined
): PersonalPath {
  return {
    baseline: profile?.user_defined_baseline ?? "",
    priorities: profile?.current_priorities ?? [],
  }
}

export function isPathEmpty(path: PersonalPath): boolean {
  return !path.baseline.trim() && path.priorities.length === 0
}
