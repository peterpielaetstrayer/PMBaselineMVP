import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  GUEST_FORMAT,
  MAX_GUEST_ENTRIES,
  emptyGuestData,
  localDateKey,
  mergeGuestCsv,
  parseGuestBackup,
  parseGuestCsv,
  validateGuestData,
  type GuestEntry,
} from "@/lib/baseline/guest-data"

beforeEach(() => {
  let n = 0
  vi.stubGlobal("crypto", {
    randomUUID: () => "00000000-0000-4000-8000-" + String(++n).padStart(12, "0"),
  })
})

function record(partial: Partial<GuestEntry> = {}): GuestEntry {
  return {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    date: "2026-11-11",
    mode: "rebuild",
    action: "Read for a few minutes",
    status: "done",
    feedback: null,
    note: "",
    ...partial,
  }
}

describe("guest data format", () => {
  it("starts empty and can round-trip a versioned backup", () => {
    const data = emptyGuestData()
    expect(data.format).toBe(GUEST_FORMAT)
    expect(parseGuestBackup(JSON.stringify(data))).toEqual(data)
  })

  it("does not accept arbitrary JSON, extra keys or unsupported versions", () => {
    expect(() => parseGuestBackup('{"untrusted":"file"}')).toThrow(/compatible/)
    expect(() => parseGuestBackup(JSON.stringify({ ...emptyGuestData(), version: 2 }))).toThrow(/compatible/)
    expect(() => parseGuestBackup(JSON.stringify({ ...emptyGuestData(), admin: true }))).toThrow(/compatible/)
  })

  it("rejects duplicate IDs and invalid or excessive entries", () => {
    const x = record()
    expect(() => validateGuestData({ ...emptyGuestData(), entries: [x, x] })).toThrow(/duplicate/)
    expect(() => validateGuestData({
      ...emptyGuestData(), entries: [record({ date: "2026-02-31" })],
    })).toThrow()
    expect(() => validateGuestData({
      ...emptyGuestData(), entries: Array(MAX_GUEST_ENTRIES + 1).fill(x),
    })).toThrow()
  })

  it("protects against oversized and malformed JSON", () => {
    expect(() => parseGuestBackup("{")).toThrow(/valid JSON/)
    expect(() => parseGuestBackup("x".repeat(512 * 1024 + 1))).toThrow(/large/)
  })
})

describe("guest CSV importer", () => {
  it("parses the documented activity CSV, including quoted commas", () => {
    const csv = [
      "date,action,status,feedback,mode,note",
      '2026-11-11,"Read, then write",done,helped,rebuild,"A useful, short session"',
      "2026-11-10,Protect recovery,not_now,,stabilize,",
    ].join("\r\n")
    const records = parseGuestCsv(csv)
    expect(records).toHaveLength(2)
    expect(records[0].action).toBe("Read, then write")
    expect(records[0].note).toBe("A useful, short session")
    expect(records[1].feedback).toBeNull()
  })

  it("rejects unrelated service exports, invalid values, and broken quotes", () => {
    expect(() => parseGuestCsv("start,sleep_end,recovery\n1,2,3")).toThrow(/columns/)
    expect(() => parseGuestCsv("date,action,status,feedback,mode,note\n2026-11-11,X,invalid,,rebuild,")).toThrow(/row 2/)
    expect(() => parseGuestCsv('date,action,status,feedback,mode,note\n2026-11-11,"unclosed,done,,rebuild,')).toThrow(/quote/)
  })

  it("does not silently truncate existing data when importing too many rows", () => {
    const current = { ...emptyGuestData(), entries: Array.from({ length: MAX_GUEST_ENTRIES }, (_, n) =>
      record({ id: "123e4567-e89b-42d3-a456-" + String(n + 1).padStart(12, "0"), action: "Step " + n })
    ) }
    const additions = [record({ id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", action: "Another action" })]
    expect(() => mergeGuestCsv(current, additions)).toThrow()
  })

  it("merges only distinct activity records and leaves the saved Path intact", () => {
    const current = { ...emptyGuestData(), path: { baseline: "Steady routine", priorities: ["Learning"] }, entries: [record()] }
    const merged = mergeGuestCsv(current, [
      record({ id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd" }),
      record({ id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee", action: "Talk to a friend" }),
    ])
    expect(merged.entries).toHaveLength(2)
    expect(merged.path).toEqual(current.path)
  })

  it("uses a local calendar date key", () => {
    expect(localDateKey(new Date(2026, 10, 11, 23, 59))).toBe("2026-11-11")
  })
})
