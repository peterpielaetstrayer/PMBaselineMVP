import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'

const html = readFileSync(
  join(process.cwd(), 'public/labs/health-reset/index.html'),
  'utf8'
)
const inlineScript = html.match(/<script>([\s\S]*?)<\/script>/)?.[1]
if (!inlineScript) throw new Error('Foundation Lab inline script was not found')

class MockNode {
  readonly id: string
  readonly dataset: Record<string, string>
  readonly attributes: Record<string, string> = {}
  readonly listeners: Record<string, () => void> = {}
  readonly children: MockNode[] = []
  readonly style: Record<string, string> = {}
  textContent = ''
  checked = false
  disabled = false

  constructor(id: string, dataset: Record<string, string> = {}) {
    this.id = id
    this.dataset = dataset
  }

  addEventListener(event: string, listener: () => void) {
    this.listeners[event] = listener
  }

  setAttribute(name: string, value: string) {
    this.attributes[name] = value
  }

  appendChild(child: MockNode) {
    this.children.push(child)
  }

  replaceChildren(...children: MockNode[]) {
    this.children.splice(0, this.children.length, ...children)
  }

  click() {
    if (!this.disabled) this.listeners.click?.()
  }

  change(checked: boolean) {
    this.checked = checked
    this.listeners.change?.()
  }
}

const IDS = [
  'phase', 'action-title', 'action-detail', 'make-smaller', 'action-status',
  'progress', 'progress-bar', 'anchor-count', 'history', 'history-count',
  'storage-status', 'mark-done', 'alternative', 'not-now', 'export', 'clear',
  'reflection-context',
]
const MODE_KEYS = ['stabilize', 'rebuild', 'maintain', 'expand']
const ANCHORS = ['movement', 'nourishment', 'recovery']
const FEEDBACK = ['helped', 'neutral', 'unhelpful']

function mount(storage = new Map<string, string>()) {
  const nodes = Object.fromEntries(IDS.map(id => [id, new MockNode(id)]))
  const modes = Object.fromEntries(
    MODE_KEYS.map(mode => [mode, new MockNode(mode, { mode })])
  )
  const anchors = Object.fromEntries(
    ANCHORS.map(anchor => [anchor, new MockNode(anchor, { anchor })])
  )
  const feedback = Object.fromEntries(
    FEEDBACK.map(kind => [kind, new MockNode(kind, { feedback: kind })])
  )

  const document = {
    getElementById: (id: string) => nodes[id],
    querySelectorAll: (selector: string) =>
      selector === '[data-mode]' ? Object.values(modes) :
      selector === '[data-anchor]' ? Object.values(anchors) :
      selector === '[data-feedback]' ? Object.values(feedback) : [],
    querySelector: (selector: string) =>
      Object.values(anchors).find(node =>
        selector === '[data-anchor="' + node.dataset.anchor + '"]'
      ),
    createElement: (tag: string) => {
      const node = new MockNode(tag)
      // Anchor created for JSON export: no browser download in this harness.
      if (tag === 'a') node.click = () => {}
      return node
    },
  }

  const localStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  }
  const fakeURL = {
    createObjectURL: () => 'blob:mock',
    revokeObjectURL: () => {},
  }
  runInNewContext(inlineScript, {
    document,
    localStorage,
    window: { confirm: () => true, addEventListener: () => {} },
    navigator: {},
    location: { protocol: 'file:' },
    URL: fakeURL,
    Blob: class { constructor(_parts: string[], _options: unknown) {} },
    console,
    Date,
  })

  function dailyRecord() {
    const raw = Array.from(storage.values())[0]
    if (!raw) return null
    return Object.values(JSON.parse(raw) as Record<string, Record<string, unknown>>)[0] ?? null
  }

  return { nodes, modes, anchors, feedback, storage, dailyRecord }
}

describe('Foundation Lab local-only founder flow', () => {
  it('starts with one action and can change modes, shrink, and choose another', () => {
    const page = mount()
    expect(page.nodes['action-title'].textContent).toBe('Find a small foothold')

    for (const name of MODE_KEYS) {
      page.modes[name].click()
      expect(page.modes[name].attributes['aria-pressed']).toBe('true')
    }

    page.modes.rebuild.click()
    const original = page.nodes['action-detail'].textContent
    page.nodes['make-smaller'].click()
    expect(page.nodes['action-detail'].textContent).not.toBe(original)
    page.nodes['make-smaller'].click()
    expect(page.nodes['action-detail'].textContent).toBe(original)
    page.nodes.alternative.click()
    expect(page.nodes['action-title'].textContent).toBe('Make your next meal easy')
  })

  it('does not imply that a different suggestion was already completed', () => {
    const page = mount()
    page.modes.stabilize.click()
    page.nodes['mark-done'].click()
    expect(page.nodes['action-status'].textContent).toBe('Done: Take care of the basics')
    expect(page.dailyRecord()?.actionLabel).toBe('Take care of the basics')

    page.modes.maintain.click()
    expect(page.nodes['action-title'].textContent).toBe('Keep your rhythm')
    expect(page.nodes['action-status'].textContent).toContain(
      'Earlier today: you completed Take care of the basics'
    )

    const reloaded = mount(page.storage)
    expect(reloaded.nodes['action-status'].textContent).toContain(
      'Earlier today: you completed Take care of the basics'
    )
  })

  it('ties a reflection to a recorded choice and shows it in history', () => {
    const page = mount()
    expect(page.feedback.helped.disabled).toBe(true)
    page.nodes['mark-done'].click()
    expect(page.feedback.helped.disabled).toBe(false)
    page.feedback.helped.click()
    expect(page.dailyRecord()?.feedback).toBe('helped')

    const historyText = page.nodes.history.children.flatMap(
      row => row.children.flatMap(child => child.children.map(part => part.textContent))
    ).join(' ')
    expect(historyText).toContain('Did: Find a small foothold · helped')

    page.nodes.alternative.click()
    page.nodes['mark-done'].click()
    expect(page.dailyRecord()?.actionLabel).toBe('Make your next meal easy')
    expect(page.dailyRecord()?.feedback).toBe('')
  })

  it('persists anchors, supports the not-now choice, and clears all local records', () => {
    const page = mount()
    Object.values(page.anchors).forEach(anchor => anchor.change(true))
    expect(page.nodes.progress.attributes['aria-valuenow']).toBe('3')
    expect(page.dailyRecord()?.movement).toBe(true)

    page.nodes['not-now'].click()
    expect(page.dailyRecord()?.action).toBe('not-now')

    page.nodes.clear.click()
    expect(page.storage.size).toBe(0)
    expect(page.nodes.progress.attributes['aria-valuenow']).toBe('0')
    expect(page.feedback.helped.disabled).toBe(true)
  })

  it('keeps individual medical details out of the generic daily screen', () => {
    expect(html).not.toMatch(/\bchest\b|\bwithdrawal\b|\bclinician\b|\bdiagnosis\b/i)
    expect(html).toContain('For urgent health or safety concerns')
    expect(inlineScript).not.toMatch(/\bfetch\s*\(|XMLHttpRequest/)
  })
})
