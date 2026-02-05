import { useEffect } from 'hono/jsx'

type AnyEl = HTMLElement

const KEY = '__cf_ui_tabs_controller__'

function getRoot(tabsId: string): AnyEl | null {
  return document.querySelector(`[data-ui-tabs-root][data-tabs-id="${CSS.escape(tabsId)}"]`) as AnyEl | null
}

function getTriggers(tabsId: string): AnyEl[] {
  return Array.from(
    document.querySelectorAll(`[data-ui-tabs-trigger][data-tabs-id="${CSS.escape(tabsId)}"]`)
  ).filter((el): el is AnyEl => el instanceof HTMLElement)
}

function getPanels(tabsId: string): AnyEl[] {
  return Array.from(
    document.querySelectorAll(`[data-ui-tabs-content][data-tabs-id="${CSS.escape(tabsId)}"]`)
  ).filter((el): el is AnyEl => el instanceof HTMLElement)
}

function activate(tabsId: string, value: string) {
  const root = getRoot(tabsId)
  if (!root) return
  root.dataset.value = value

  for (const t of getTriggers(tabsId)) {
    const active = t.dataset.value === value
    t.dataset.state = active ? 'active' : 'inactive'
    t.setAttribute('aria-selected', active ? 'true' : 'false')
    t.tabIndex = active ? 0 : -1
  }

  for (const p of getPanels(tabsId)) {
    const active = p.dataset.value === value
    p.hidden = !active
  }
}

function initAll() {
  const roots = Array.from(document.querySelectorAll('[data-ui-tabs-root][data-tabs-id]')).filter(
    (el): el is AnyEl => el instanceof HTMLElement
  )
  for (const root of roots) {
    const tabsId = root.dataset.tabsId
    if (!tabsId) continue
    const triggers = getTriggers(tabsId)
    if (triggers.length === 0) continue
    const current = (root.dataset.value || '').trim()
    const first = triggers[0].dataset.value || ''
    activate(tabsId, current || first)
  }
}

function focusMove(tabsId: string, nextIndex: number) {
  const triggers = getTriggers(tabsId)
  if (triggers.length === 0) return
  const idx = ((nextIndex % triggers.length) + triggers.length) % triggers.length
  triggers[idx].focus()
}

export default function TabsController() {
  useEffect(() => {
    const g = globalThis as any
    if (g[KEY]) return
    g[KEY] = true

    initAll()

    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null
      if (!target) return
      const trigger = target.closest('[data-ui-tabs-trigger][data-tabs-id][data-value]') as AnyEl | null
      if (!trigger) return
      const tabsId = trigger.dataset.tabsId
      const value = trigger.dataset.value
      if (!tabsId || !value) return
      activate(tabsId, value)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as Element | null
      if (!target) return
      const trigger = target.closest('[data-ui-tabs-trigger][data-tabs-id][data-value]') as AnyEl | null
      if (!trigger) return
      const tabsId = trigger.dataset.tabsId
      if (!tabsId) return
      const triggers = getTriggers(tabsId)
      const currentIndex = triggers.indexOf(trigger)
      if (currentIndex === -1) return

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        focusMove(tabsId, currentIndex + 1)
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        focusMove(tabsId, currentIndex - 1)
        return
      }
      if (e.key === 'Home') {
        e.preventDefault()
        focusMove(tabsId, 0)
        return
      }
      if (e.key === 'End') {
        e.preventDefault()
        focusMove(tabsId, triggers.length - 1)
        return
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const value = trigger.dataset.value
        if (!value) return
        activate(tabsId, value)
      }
    }

    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKeyDown)
    return
  }, [])

  return null
}
