import { z } from "zod"
import { PersonalPathInputSchema } from "@/lib/baseline/personal-path"

export const GUEST_STORAGE_KEY = "pmb:guest:v1"
export const GUEST_FORMAT = "pmb-guest-backup"
export const MAX_GUEST_FILE_BYTES = 512 * 1024
export const MAX_GUEST_ENTRIES = 500

export const GuestModeSchema = z.enum(["stabilize", "rebuild", "maintain", "expand"])
export const GuestStatusSchema = z.enum(["done", "not_now"])
export const GuestFeedbackSchema = z.enum(["helped", "neutral", "not_fit"])

const DateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const d = new Date(value + "T12:00:00Z")
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value
  }, "Use a real date formatted YYYY-MM-DD.")

export const GuestEntrySchema = z.object({
  id: z.string().uuid(),
  date: DateStringSchema,
  mode: GuestModeSchema,
  action: z.string().trim().min(1).max(160),
  status: GuestStatusSchema,
  feedback: GuestFeedbackSchema.nullable(),
  note: z.string().trim().max(500),
}).strict()

export const GuestDataSchema = z.object({
  format: z.literal(GUEST_FORMAT),
  version: z.literal(1),
  path: PersonalPathInputSchema,
  entries: z.array(GuestEntrySchema).max(MAX_GUEST_ENTRIES),
}).strict()

export type GuestData = z.infer<typeof GuestDataSchema>
export type GuestEntry = z.infer<typeof GuestEntrySchema>
export type GuestMode = z.infer<typeof GuestModeSchema>
export type GuestStatus = z.infer<typeof GuestStatusSchema>
export type GuestFeedback = z.infer<typeof GuestFeedbackSchema>

export function emptyGuestData(): GuestData {
  return {
    format: GUEST_FORMAT,
    version: 1,
    path: { baseline: "", priorities: [] },
    entries: [],
  }
}

export function validateGuestData(value: unknown): GuestData {
  const candidate = GuestDataSchema.parse(value)
  if (new Set(candidate.entries.map((entry) => entry.id)).size !== candidate.entries.length) {
    throw new Error("This backup contains duplicate record IDs.")
  }
  return candidate
}

export function parseGuestBackup(text: string): GuestData {
  if (text.length > MAX_GUEST_FILE_BYTES) {
    throw new Error("This file is too large for the guest prototype.")
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error("This isn't a valid JSON file.")
  }
  try {
    return validateGuestData(parsed)
  } catch {
    throw new Error("This isn't a compatible PMBaseline guest backup. No data was changed.")
  }
}

/**
 * CSV is a small, explicit activity import, not a general health/wearable decoder.
 * Format: date,action,status,feedback,mode,note
 * Status: done / not_now. Feedback: helped / neutral / not_fit / blank.
 */
export function parseGuestCsv(text: string): GuestEntry[] {
  if (text.length > MAX_GUEST_FILE_BYTES) throw new Error("CSV file is too large.")

  const table: string[][] = []
  let row: string[] = []
  let value = ""
  let quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        value += '"'
        i += 1
      } else if (c === '"') {
        quoted = false
      } else {
        value += c
      }
    } else if (c === '"' && value.length === 0) {
      quoted = true
    } else if (c === ",") {
      row.push(value)
      value = ""
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i += 1
      row.push(value)
      if (row.some((item) => item.trim() !== "")) table.push(row)
      row = []
      value = ""
    } else {
      value += c
    }
  }
  if (quoted) throw new Error("CSV contains an unclosed quote.")
  row.push(value)
  if (row.some((item) => item.trim() !== "")) table.push(row)

  if (!table.length) throw new Error("CSV has no rows.")
  const header = table.shift()!.map((part) => part.trim().toLowerCase().replace(/^\uFEFF/, ""))
  const expected = ["date", "action", "status", "feedback", "mode", "note"]
  if (header.length !== expected.length || header.some((part, i) => part !== expected[i])) {
    throw new Error("CSV columns must be: date,action,status,feedback,mode,note. Other exports need their own importer.")
  }
  if (table.length === 0) throw new Error("CSV has no activity rows.")
  if (table.length > 200) throw new Error("Import up to 200 CSV rows at a time.")

  return table.map((values, index) => {
    if (values.length !== 6) throw new Error("CSV row " + (index + 2) + " has the wrong number of columns.")
    const trimmed = values.map((x) => x.trim())
    const record = {
      id: makeGuestId(),
      date: trimmed[0],
      action: trimmed[1],
      status: trimmed[2],
      feedback: trimmed[3] || null,
      mode: trimmed[4],
      note: trimmed[5],
    }
    const result = GuestEntrySchema.safeParse(record)
    if (!result.success) throw new Error("CSV row " + (index + 2) + " contains an unsupported value.")
    return result.data
  })
}

export function makeGuestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  throw new Error("This browser cannot create local records safely.")
}

export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return y + "-" + m + "-" + d
}

export function mergeGuestCsv(current: GuestData, incoming: GuestEntry[]): GuestData {
  // Identical activity content is considered a duplicate even when source IDs differ.
  const key = (entry: GuestEntry) =>
    [entry.date, entry.action.toLowerCase(), entry.mode, entry.status, entry.feedback ?? "", entry.note].join("\u001f")
  const seen = new Set(current.entries.map(key))
  const additions = incoming.filter((entry) => {
    const k = key(entry)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  return validateGuestData({
    ...current,
    entries: [...current.entries, ...additions],
  })
}
