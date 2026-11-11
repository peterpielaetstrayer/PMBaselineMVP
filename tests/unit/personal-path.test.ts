import { describe, expect, it } from "vitest"
import {
  EMPTY_PERSONAL_PATH,
  PersonalPathInputSchema,
  isPathEmpty,
  personalPathFromProfile,
} from "@/lib/baseline/personal-path"

describe("My Path input", () => {
  it("accepts an empty, optional path", () => {
    expect(PersonalPathInputSchema.parse({ baseline: "", priorities: ["", "  "] }))
      .toEqual(EMPTY_PERSONAL_PATH)
    expect(isPathEmpty(EMPTY_PERSONAL_PATH)).toBe(true)
  })

  it("trims and deduplicates priorities without changing user intent", () => {
    expect(
      PersonalPathInputSchema.parse({
        baseline: "  I can handle my priorities  ",
        priorities: [" Movement ", "movement", " rest "],
      })
    ).toEqual({
      baseline: "I can handle my priorities",
      priorities: ["Movement", "rest"],
    })
  })

  it("rejects extra fields, too many priorities, and overlong values", () => {
    expect(PersonalPathInputSchema.safeParse({
      baseline: "", priorities: [], userId: "someone-else",
    }).success).toBe(false)
    expect(PersonalPathInputSchema.safeParse({
      baseline: "", priorities: ["a", "b", "c", "d"],
    }).success).toBe(false)
    expect(PersonalPathInputSchema.safeParse({
      baseline: "x".repeat(601), priorities: [],
    }).success).toBe(false)
    expect(PersonalPathInputSchema.safeParse({
      baseline: "", priorities: ["x".repeat(121)],
    }).success).toBe(false)
  })

  it("maps the existing baseline profile without inventing plans or goals", () => {
    const result = personalPathFromProfile({
      user_defined_baseline: "Steady mornings",
      current_priorities: ["Learning", "Time outside"],
    })
    expect(result).toEqual({
      baseline: "Steady mornings",
      priorities: ["Learning", "Time outside"],
    })
    expect(isPathEmpty(result)).toBe(false)
  })
})
