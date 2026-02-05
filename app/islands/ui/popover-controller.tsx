import { useEffect } from 'hono/jsx'

type AnyEl = HTMLElement

const KEY = '__cf_ui_popover_controller__'

function getTrigger(id: string): AnyEl | null {
  return document.querySelector(`[data-ui-popover-trigger][data-popover-id="${CSS.escape(id)}"]`) as AnyEl | null
}

function getContent(id: string): AnyEl | null {
  return document.querySelector(`[data-ui-popover-content][data-popover-id="${CSS.escape(id)}"]`) as AnyEl | null
}

function position(content: AnyEl, trigger: AnyEl) {
  const side = (content.dataset.side as 'bottom' | 'top') || 'bottom'
  const align = (content.dataset.align as 'start' | 'center' | 'end') || 'center'
  const t = trigger.getBoundingClientRect()
  const c = content.getBoundingClientRect()

  const gap = 8
  let top = side === 'top' ? t.top - c.height - gap : t.bottom + gap
  let left = t.left

  if (align === 'center') left = t.left + t.width / 2 - c.width / 2
  if (align === 'end') left = t.right - c.width

  const vw = window.innerWidth
  const vh = window.innerHeight
  left = Math.max(8, Math.min(left, vw - c.width - 8))
  top = Math.max(8, Math.min(top, vh - c.height - 8))

  content.style.left = `${Math.round(left)}px`
  content.style.top = `${Math.round(top)}px`
}

function setState(id: string, open: boolean) {
  const content = getContent(id)
  const trigger = getTrigger(id)
  if (!content || !trigger) return
  if (open) {
    content.dataset.state = 'open'
    content.classList.remove('hidden')
    // ensure measurable
    position(content, trigger)
    queueMicrotask(() => content.focus())
  } else {
    content.dataset.state = 'closed'
    content.classList.add('hidden')
  }
}

function closeAllExcept(keepId: string | null) {
  const contents = Array.from(document.querySelectorAll('[data-ui-popover-content][data-popover-id]')) as AnyEl[]
  for (const c of contents) {
    const id = c.dataset.popoverId
    if (!id) continue
    if (keepId && id === keepId) continue
    c.dataset.state = 'closed'
    c.classList.add('hidden')
  }
}

export default function PopoverController() {
  useEffect(() => {
    const g = globalThis as any
    if (g[KEY]) return
    g[KEY] = true

    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null
      if (!target) return

      const trigger = target.closest('[data-ui-popover-trigger][data-popover-id]') as AnyEl | null
      if (trigger) {
        const id = trigger.getAttribute('data-popover-id')
        if (!id) return
        const content = getContent(id)
        if (!content) return
        const isOpen = content.dataset.state === 'open'
        closeAllExcept(null)
        setState(id, !isOpen)
        return
      }

      const content = target.closest('[data-ui-popover-content][data-popover-id]') as AnyEl | null
      if (content) return

      // click outside
      closeAllExcept(null)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as Element | null
      if (target) {
        const trigger = target.closest('[data-ui-popover-trigger][data-popover-id]') as AnyEl | null
        if (trigger && (e.key === 'Enter' || e.key === ' ')) {
          const id = trigger.getAttribute('data-popover-id')
          if (!id) return
          e.preventDefault()
          const content = getContent(id)
          if (!content) return
          const isOpen = content.dataset.state === 'open'
          closeAllExcept(null)
          setState(id, !isOpen)
          return
        }
      }

      if (e.key !== 'Escape') return
      const open = Array.from(document.querySelectorAll('[data-ui-popover-content][data-state="open"]')) as AnyEl[]
      if (open.length === 0) return
      e.preventDefault()
      closeAllExcept(null)
    }

    const onResize = () => {
      const open = Array.from(document.querySelectorAll('[data-ui-popover-content][data-state="open"]')) as AnyEl[]
      for (const content of open) {
        const id = content.dataset.popoverId
        if (!id) continue
        const trigger = getTrigger(id)
        if (!trigger) continue
        position(content, trigger)
      }
    }

    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    return
  }, [])

  return null
}
