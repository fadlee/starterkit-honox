import { useEffect } from 'hono/jsx'

import { positionFloating, type Align, type Side } from '@/lib/floating'

type AnyEl = HTMLElement

const KEY = '__cf_ui_tooltip_controller__'

function getTrigger(id: string): AnyEl | null {
  return document.querySelector(`[data-ui-tooltip-trigger][data-tooltip-id="${CSS.escape(id)}"]`) as AnyEl | null
}

function getContent(id: string): AnyEl | null {
  return document.querySelector(`[data-ui-tooltip-content][data-tooltip-id="${CSS.escape(id)}"]`) as AnyEl | null
}

function setState(id: string, open: boolean) {
  const content = getContent(id)
  const trigger = getTrigger(id)
  if (!content || !trigger) return
  if (open) {
    content.dataset.state = 'open'
    content.classList.remove('hidden')
    positionFloating({
      content,
      trigger,
      side: (content.dataset.side as Side) || 'top',
      align: (content.dataset.align as Align) || 'center',
      gap: 10
    })
  } else {
    content.dataset.state = 'closed'
    content.classList.add('hidden')
  }
}

export default function TooltipController() {
  useEffect(() => {
    const g = globalThis as any
    if (g[KEY]) return
    g[KEY] = true

    const timers = new Map<string, number>()

    const schedule = (id: string, open: boolean) => {
      const prev = timers.get(id)
      if (typeof prev === 'number') window.clearTimeout(prev)
      const delay = open ? 250 : 80
      const t = window.setTimeout(() => setState(id, open), delay)
      timers.set(id, t)
    }

    const onEnter = (el: AnyEl) => {
      const id = el.getAttribute('data-tooltip-id')
      if (!id) return
      schedule(id, true)
    }

    const onLeave = (el: AnyEl) => {
      const id = el.getAttribute('data-tooltip-id')
      if (!id) return
      schedule(id, false)
    }

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as Element | null
      const trigger = target?.closest('[data-ui-tooltip-trigger][data-tooltip-id]') as AnyEl | null
      if (trigger) onEnter(trigger)
    }

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as Element | null
      const trigger = target?.closest('[data-ui-tooltip-trigger][data-tooltip-id]') as AnyEl | null
      if (trigger) onLeave(trigger)
    }

    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as Element | null
      const trigger = target?.closest('[data-ui-tooltip-trigger][data-tooltip-id]') as AnyEl | null
      if (trigger) onEnter(trigger)
    }

    const onFocusOut = (e: FocusEvent) => {
      const target = e.target as Element | null
      const trigger = target?.closest('[data-ui-tooltip-trigger][data-tooltip-id]') as AnyEl | null
      if (trigger) onLeave(trigger)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const open = Array.from(document.querySelectorAll('[data-ui-tooltip-content][data-state="open"]')) as AnyEl[]
      for (const c of open) {
        const id = c.dataset.tooltipId
        if (id) setState(id, false)
      }
    }

    const onReflow = () => {
      const open = Array.from(document.querySelectorAll('[data-ui-tooltip-content][data-state="open"]')) as AnyEl[]
      for (const c of open) {
        const id = c.dataset.tooltipId
        if (!id) continue
        const trigger = getTrigger(id)
        if (!trigger) continue
        positionFloating({
          content: c,
          trigger,
          side: (c.dataset.side as Side) || 'top',
          align: (c.dataset.align as Align) || 'center',
          gap: 10
        })
      }
    }

    document.addEventListener('mouseover', onMouseOver)
    document.addEventListener('mouseout', onMouseOut)
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onReflow)
    window.addEventListener('scroll', onReflow, true)
    return
  }, [])

  return null
}
