"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  GUEST_STORAGE_KEY,
  MAX_GUEST_ENTRIES,
  MAX_GUEST_FILE_BYTES,
  emptyGuestData,
  localDateKey,
  makeGuestId,
  mergeGuestCsv,
  parseGuestBackup,
  parseGuestCsv,
  validateGuestData,
  type GuestData,
  type GuestEntry,
  type GuestFeedback,
  type GuestMode,
} from "@/lib/baseline/guest-data"
import { PersonalPathInputSchema } from "@/lib/baseline/personal-path"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Section = "today" | "path" | "history" | "data"
type ImportPreview =
  | { kind: "backup"; name: string; payload: GuestData }
  | { kind: "csv"; name: string; entries: GuestEntry[] }

const MODES: { key: GuestMode; title: string; hint: string }[] = [
  { key: "stabilize", title: "Stabilize", hint: "Take care of the basics" },
  { key: "rebuild", title: "Rebuild", hint: "Find your footing" },
  { key: "maintain", title: "Maintain", hint: "Keep it going" },
  { key: "expand", title: "Expand", hint: "Try a little more" },
]

const FEEDBACK: { key: GuestFeedback; title: string }[] = [
  { key: "helped", title: "Helped" },
  { key: "neutral", title: "No change" },
  { key: "not_fit", title: "Didn't fit" },
]

function suggestedMove(mode: GuestMode, priority: string): string {
  if (mode === "stabilize") return "Take care of one basic need"
  if (mode === "rebuild") return priority
    ? "Take one small step toward " + priority.slice(0, 125)
    : "Choose one manageable next step"
  if (mode === "maintain") return priority
    ? "Keep a useful routine that supports " + priority.slice(0, 114)
    : "Keep one helpful routine going"
  return priority
    ? "Make focused progress on " + priority.slice(0, 133)
    : "Choose one meaningful challenge"
}

function humanDate(date: string): string {
  const parsed = new Date(date + "T12:00:00")
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

function downloadFile(name: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = name
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function GuestWorkspace() {
  const [data, setData] = useState<GuestData | null>(null)
  const [section, setSection] = useState<Section>("today")
  const [mode, setMode] = useState<GuestMode>("rebuild")
  const [actionText, setActionText] = useState("")
  const [baseline, setBaseline] = useState("")
  const [priorities, setPriorities] = useState<string[]>(["", "", ""])
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [rawFailure, setRawFailure] = useState<string | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(GUEST_STORAGE_KEY)
      const initial = raw ? parseGuestBackup(raw) : emptyGuestData()
      setData(initial)
      setBaseline(initial.path.baseline)
      setPriorities([0, 1, 2].map((i) => initial.path.priorities[i] ?? ""))
      setActionText(suggestedMove("rebuild", initial.path.priorities[0] ?? ""))
    } catch {
      try {
        setRawFailure(window.localStorage.getItem(GUEST_STORAGE_KEY))
      } catch {
        setRawFailure(null)
      }
      setError("We couldn't open local records in this browser. Nothing was overwritten.")
    }
  }, [])

  function persist(next: GuestData): boolean {
    try {
      const safe = validateGuestData(next)
      window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(safe))
      setData(safe)
      setError("")
      return true
    } catch {
      setError("This browser couldn't save your changes. Export a backup and check browser storage.")
      return false
    }
  }

  const latest = (data?.entries ?? [])
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
  const todayEntries = latest.filter((entry) => entry.date === localDateKey())
  const suggestion = suggestedMove(mode, data?.path.priorities[0] ?? "")

  function savePath() {
    if (!data) return
    const parsed = PersonalPathInputSchema.safeParse({ baseline, priorities })
    if (!parsed.success) {
      setError("Please keep your description brief and choose up to three short priorities.")
      return
    }
    if (persist({ ...data, path: parsed.data })) {
      setPriorities([0, 1, 2].map((i) => parsed.data.priorities[i] ?? ""))
      setMessage("Your path is saved on this device.")
    }
  }

  function recordAction(status: "done" | "not_now") {
    if (!data) return
    const action = actionText.trim()
    if (!action || action.length > 160) {
      setError("Choose a next step of 1–160 characters before recording it.")
      return
    }
    if (data.entries.length >= MAX_GUEST_ENTRIES) {
      setError("Guest history is full. Export a backup before starting again.")
      return
    }
    const entry: GuestEntry = {
      id: makeGuestId(),
      date: localDateKey(),
      mode,
      action,
      status,
      feedback: null,
      note: "",
    }
    if (persist({ ...data, entries: [...data.entries, entry] })) {
      setMessage(status === "done" ? "Noted. You did it." : "Not now is a valid choice.")
      setActionText("")
    }
  }

  function setFeedback(id: string, value: GuestFeedback) {
    if (!data) return
    const entries = data.entries.map((entry) =>
      entry.id === id ? { ...entry, feedback: entry.feedback === value ? null : value } : entry
    )
    if (persist({ ...data, entries })) setMessage("Reflection updated.")
  }

  function exportData() {
    if (!data) return
    downloadFile(
      "pmbaseline-guest-" + localDateKey() + ".json",
      JSON.stringify(data, null, 2),
      "application/json"
    )
    setMessage("Backup downloaded. Keep it in a place you trust.")
  }

  async function onImportFile(file: File | undefined) {
    setPreview(null)
    setMessage("")
    setError("")
    if (!file) return
    if (file.size > MAX_GUEST_FILE_BYTES) {
      setError("This file is too large. Guest imports are limited to 512 KB.")
      return
    }
    try {
      const contents = await file.text()
      const lower = file.name.toLowerCase()
      if (lower.endsWith(".json")) {
        setPreview({ kind: "backup", name: file.name, payload: parseGuestBackup(contents) })
      } else if (lower.endsWith(".csv")) {
        setPreview({ kind: "csv", name: file.name, entries: parseGuestCsv(contents) })
      } else {
        setError("Choose a PMBaseline guest .json backup or a supported .csv activity file.")
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Couldn't read that file.")
    }
  }

  function confirmImport() {
    if (!preview || !data) return
    if (preview.kind === "backup") {
      if (!window.confirm(
        "Replace all guest data in this browser with this backup? Download your current backup first if you want to keep it."
      )) return
      if (persist(preview.payload)) {
        setBaseline(preview.payload.path.baseline)
        setPriorities([0, 1, 2].map((i) => preview.payload.path.priorities[i] ?? ""))
        setMessage("Guest backup restored locally.")
        setPreview(null)
      }
      return
    }
    let merged: GuestData
    try {
      merged = mergeGuestCsv(data, preview.entries)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "CSV couldn't be merged.")
      return
    }
    const added = merged.entries.length - data.entries.length
    if (!window.confirm(
      "Add " + added + " new activity records from this CSV? Nothing will be uploaded."
    )) return
    if (persist(merged)) {
      setMessage(added + " activity records imported to this browser.")
      setPreview(null)
    }
  }

  function clearData() {
    if (!data) return
    if (!window.confirm("Delete this browser's entire PMBaseline guest record? This cannot be undone without a backup.")) return
    try {
      window.localStorage.removeItem(GUEST_STORAGE_KEY)
      const empty = emptyGuestData()
      setData(empty)
      setBaseline("")
      setPriorities(["", "", ""])
      setActionText(suggestedMove("rebuild", ""))
      setPreview(null)
      setError("")
      setMessage("Guest records deleted from this browser.")
    } catch {
      setError("Unable to erase guest storage in this browser.")
    }
  }

  const card = "rounded-2xl border border-ocean-light/50 bg-white/90 p-5 shadow-sm"
  const fieldLabel = "text-sm font-semibold text-navy-text"
  const muted = "text-sm leading-relaxed text-navy-text/70"

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-navy-text">Guest mode</h1>
        <p className="mt-3 text-sm text-navy-text/75" role="alert">
          {error || "Opening your local workspace..."}
        </p>
        {rawFailure ? (
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => downloadFile("pmbaseline-unreadable-backup.json", rawFailure, "application/json")}
          >
            Download original unreadable data
          </Button>
        ) : null}
        <Link href="/login" className="mt-5 block text-sm text-ocean-deep underline">
          Go to account sign-in
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-light/10 to-sand-neutral/15">
      <header className="border-b border-ocean-light/40 bg-white/85">
        <div className="mx-auto max-w-3xl space-y-3 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <p className="font-semibold text-ocean-deep">PMBaseline <span className="font-normal text-navy-text/60">/ Guest</span></p>
            <p className="text-xs text-navy-text/70">Saved in this browser only · no account required</p>
          </div>
          <Link href="/login" className="inline-block text-sm font-medium text-ocean-deep underline underline-offset-4">
            Account sign-in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-7">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl text-navy-text sm:text-4xl">
            {section === "today" ? "Make today workable." :
              section === "path" ? "Your direction, your terms." :
              section === "history" ? "Look back, learn, adjust." : "Your data, your control."}
          </h1>
          <p className={muted}>
            {section === "today"
              ? "Choose one helpful next step. You don't need a perfect day."
              : section === "path"
                ? "What matters is yours to decide. Change your path whenever you need to."
                : section === "history"
                  ? "A record of real choices—not a streak to defend."
                  : "Make a backup, restore a guest backup, or import a simple activity file."}
          </p>
        </div>

        <nav className="grid grid-cols-4 gap-1 rounded-xl bg-white p-1 shadow-sm" aria-label="Guest workspace">
          {([
            ["today", "Today"],
            ["path", "My Path"],
            ["history", "History"],
            ["data", "Data"],
          ] as const).map(([key, label]) => (
            <button
              type="button"
              key={key}
              aria-current={section === key ? "page" : undefined}
              onClick={() => { setSection(key); setMessage(""); setError(""); }}
              className={
                "rounded-lg px-2 py-2.5 text-xs font-semibold sm:text-sm " +
                (section === key ? "bg-ocean-deep text-white" : "text-navy-text hover:bg-ocean-light/20")
              }
            >
              {label}
            </button>
          ))}
        </nav>

        {error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}
        {message ? <p role="status" className="rounded-lg border border-ocean-light bg-white px-4 py-3 text-sm text-ocean-deep">{message}</p> : null}

        {section === "today" ? (
          <div className="space-y-4">
            <section className={card}>
              <h2 className="text-lg font-semibold text-navy-text">What would help today?</h2>
              <p className={"mt-1 " + muted}>You know your day best. Pick a support level, then choose your own move.</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {MODES.map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    aria-pressed={mode === item.key}
                    onClick={() => { setMode(item.key); setActionText(suggestedMove(item.key, data.path.priorities[0] ?? "")); }}
                    className={"rounded-xl border px-3 py-3 text-left " + (mode === item.key ? "border-ocean-deep bg-ocean-light/25" : "border-ocean-light/50 bg-white")}
                  >
                    <strong className="block text-sm text-navy-text">{item.title}</strong>
                    <span className="block text-xs text-navy-text/70">{item.hint}</span>
                  </button>
                ))}
              </div>
              <div className="mt-5 space-y-2">
                <Label htmlFor="guest-action" className={fieldLabel}>One next move</Label>
                <Input
                  id="guest-action"
                  maxLength={160}
                  value={actionText}
                  onChange={(event) => setActionText(event.target.value)}
                  placeholder="Choose one thing that would help"
                />
                <p className="text-xs text-navy-text/60">Suggestion: {suggestion}</p>
                <button
                  type="button"
                  className="text-sm font-semibold text-ocean-deep underline underline-offset-4"
                  onClick={() => setActionText(suggestion)}
                >
                  Use suggestion
                </button>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button type="button" onClick={() => recordAction("done")}>I did this</Button>
                  <Button type="button" variant="outline" onClick={() => recordAction("not_now")}>Not right now</Button>
                </div>
              </div>
            </section>

            <section className={card}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-lg font-semibold text-navy-text">Your path</h2>
                <button type="button" onClick={() => setSection("path")} className="text-sm font-semibold text-ocean-deep underline">Edit path</button>
              </div>
              {data.path.baseline ? <p className="mt-2 whitespace-pre-wrap break-words text-sm text-navy-text/80">{data.path.baseline}</p> : null}
              {data.path.priorities.length > 0 ? (
                <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-navy-text/80">
                  {data.path.priorities.map((p, i) => <li key={i} className="break-words">{p}</li>)}
                </ul>
              ) : <p className={"mt-2 " + muted}>Add a direction when you're ready—no pressure to make a long plan.</p>}
              <p className="mt-3 text-xs text-navy-text/60">These suggestions are simple prompts, not AI-generated interpretations.</p>
            </section>

            {todayEntries.length > 0 ? (
              <section className={card}>
                <h2 className="text-lg font-semibold text-navy-text">Today's choices</h2>
                <div className="mt-3 space-y-4">
                  {todayEntries.map((entry) => (
                    <div key={entry.id} className="space-y-2 border-t border-ocean-light/30 pt-3">
                      <p className="break-words text-sm font-medium text-navy-text">
                        {entry.action}
                      </p>
                      <p className="text-xs text-navy-text/60">
                        {entry.status === "done" ? "Completed" : "Not now"} · {entry.mode}
                      </p>
                      <div className="flex flex-wrap gap-2" role="group" aria-label={"How did " + entry.action + " go?"}>
                        {FEEDBACK.map((feedback) => (
                          <button
                            key={feedback.key}
                            type="button"
                            aria-pressed={entry.feedback === feedback.key}
                            onClick={() => setFeedback(entry.id, feedback.key)}
                            className={"rounded-lg border px-3 py-2 text-xs font-medium " +
                              (entry.feedback === feedback.key ? "border-ocean-deep bg-ocean-light/25" : "border-ocean-light/50")}
                          >
                            {feedback.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}

        {section === "path" ? (
          <section className={card}>
            <h2 className="text-lg font-semibold text-navy-text">What does a workable baseline look like?</h2>
            <p className={"mt-1 " + muted}>A short description, in your own words.</p>
            <Label htmlFor="guest-baseline" className="mt-4 block">My baseline</Label>
            <Textarea
              id="guest-baseline"
              maxLength={600}
              rows={3}
              value={baseline}
              onChange={(event) => setBaseline(event.target.value)}
              placeholder="I leave time for what matters and enough room to recover."
              className="mt-2"
            />
            <h3 className="mt-6 text-lg font-semibold text-navy-text">Up to three priorities</h3>
            <p className={muted}>Not a checklist. Things you care about right now.</p>
            {priorities.map((p, index) => (
              <div key={index} className="mt-3 space-y-2">
                <Label htmlFor={"guest-priority-" + index}>Priority {index + 1}</Label>
                <Input
                  id={"guest-priority-" + index}
                  value={p}
                  maxLength={120}
                  onChange={(event) => setPriorities((all) => all.map((item, i) => i === index ? event.target.value : item))}
                  placeholder="What matters right now?"
                />
              </div>
            ))}
            <Button type="button" className="mt-5" onClick={savePath}>Save my path locally</Button>
            <p className="mt-3 text-xs text-navy-text/60">A saved path stays only in this browser. Guest records do not automatically move into an account.</p>
          </section>
        ) : null}

        {section === "history" ? (
          <section className={card}>
            <h2 className="text-lg font-semibold text-navy-text">Your activity history</h2>
            {latest.length === 0 ? <p className={"mt-3 " + muted}>No activity recorded yet. Start with a small choice on Today.</p> : null}
            <ul className="mt-4 space-y-3">
              {latest.slice(0, 40).map((entry) => (
                <li key={entry.id} className="space-y-1 rounded-lg border border-ocean-light/40 p-3">
                  <p className="text-xs text-navy-text/60">{humanDate(entry.date)} · {entry.mode}</p>
                  <p className="break-words text-sm font-medium text-navy-text">{entry.action}</p>
                  <p className="text-xs text-navy-text/70">
                    {entry.status === "done" ? "Done" : "Not now"}
                    {entry.feedback ? " · " + FEEDBACK.find((x) => x.key === entry.feedback)?.title : ""}
                  </p>
                  {entry.note ? <p className="break-words text-xs text-navy-text/70">{entry.note}</p> : null}
                </li>
              ))}
            </ul>
            {latest.length > 40 ? <p className="mt-3 text-xs text-navy-text/60">Showing the latest 40 of {latest.length} records. Export a backup to see all.</p> : null}
          </section>
        ) : null}

        {section === "data" ? (
          <div className="space-y-4">
            <section className={card}>
              <h2 className="text-lg font-semibold text-navy-text">Your local backup</h2>
              <p className={"mt-2 " + muted}>Download all your guest Path and activity records as a JSON file. You can restore it in another browser later.</p>
              <p className="mt-2 text-xs text-navy-text/60">{data.entries.length} activity records stored in this browser</p>
              <Button type="button" className="mt-4" onClick={exportData}>Download JSON backup</Button>
            </section>
            <section className={card}>
              <h2 className="text-lg font-semibold text-navy-text">Import a file</h2>
              <p className={"mt-2 " + muted}>
                Supported now: PMBaseline guest JSON backups and simple CSV activity logs.
                Files are read locally and reviewed before importing.
              </p>
              <Label className="mt-4 block" htmlFor="guest-import">Choose a JSON or CSV file</Label>
              <Input
                ref={inputRef}
                id="guest-import"
                type="file"
                accept=".json,.csv,application/json,text/csv"
                className="mt-2 h-auto py-2"
                onChange={(event) => { void onImportFile(event.target.files?.[0]); event.target.value = "" }}
              />
              <p className="mt-2 text-xs text-navy-text/60">CSV columns, in this order: date,action,status,feedback,mode,note. Dates use YYYY-MM-DD. Status: done or not_now. Feedback: helped, neutral, not_fit, or blank. Mode: stabilize, rebuild, maintain, or expand.</p>
              {preview ? (
                <div className="mt-4 space-y-3 rounded-xl border border-ocean-light bg-ocean-light/10 p-4">
                  <h3 className="font-semibold text-navy-text">Review before importing</h3>
                  <p className="break-all text-sm text-navy-text/75">
                    {preview.name}: {preview.kind === "backup"
                      ? preview.payload.entries.length + " records plus saved Path (replaces all guest data)"
                      : preview.entries.length + " CSV rows (adds nonduplicate activity records)"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={confirmImport}>Confirm import</Button>
                    <Button type="button" variant="outline" onClick={() => setPreview(null)}>Cancel</Button>
                  </div>
                </div>
              ) : null}
              <p className="mt-3 text-xs text-navy-text/60">WHOOP, medical records, raw health exports, and arbitrary CSV files are not yet understood by this importer. Don't upload sensitive files to this experimental version.</p>
            </section>
            <section className={card}>
              <h2 className="text-lg font-semibold text-navy-text">Clear this device</h2>
              <p className={"mt-2 " + muted}>Browser data can disappear if you clear your site data or change devices. Export a backup first. Local storage is not encrypted.</p>
              <Button type="button" variant="outline" className="mt-4" onClick={clearData}>Delete guest records</Button>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  )
}
