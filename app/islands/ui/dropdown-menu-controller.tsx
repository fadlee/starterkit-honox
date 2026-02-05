import { useEffect } from 'hono/jsx'

import { positionFloating, type Align, type Side } from '@/lib/floating'
import { toast } from '@/lib/toast'

type AnyEl = HTMLElement

const KEY = '__cf_ui_dropdown_controller__'

function getTrigger(id: string): AnyEl | null {
  return document.querySelector(`[data-ui-dropdown-trigger][data-dropdown-id="${CSS.escape(id)}"]`) as AnyEl | null
}

function getContent(id: string): AnyEl | null {
  return document.querySelector(`[data-ui-dropdown-content][data-dropdown-id="${CSS.escape(id)}"]`) as AnyEl | null
}

function getItems(content: AnyEl): AnyEl[] {
  return Array.from(content.querySelectorAll('[data-ui-dropdown-item]')).filter(
    (el): el is AnyEl => el instanceof HTMLElement && el.dataset.disabled !== 'true'
  )
}

function closeAllExcept(keepId: string | null) {
  const contents = Array.from(document.querySelectorAll('[data-ui-dropdown-content][data-dropdown-id]')) as AnyEl[]
  for (const c of contents) {
    const id = c.dataset.dropdownId
    if (!id) continue
    if (keepId && id === keepId) continue
    c.dataset.state = 'closed'
    c.classList.add('hidden')
  }
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
      side: (content.dataset.side as Side) || 'bottom',
      align: (content.dataset.align as Align) || 'start'
    })
    const items = getItems(content)
    queueMicrotask(() => (items[0] ?? content).focus())
  } else {
    content.dataset.state = 'closed'
    content.classList.add('hidden')
    queueMicrotask(() => trigger.focus())
  }
}

export default function DropdownMenuController() {
  useEffect(() => {
    const g = globalThis as any
    if (g[KEY]) return
    g[KEY] = true

    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null
      if (!target) return

      const trigger = target.closest('[data-ui-dropdown-trigger][data-dropdown-id]') as AnyEl | null
      if (trigger) {
        const id = trigger.getAttribute('data-dropdown-id')
        if (!id) return
        const content = getContent(id)
        if (!content) return
        const isOpen = content.dataset.state === 'open'
        closeAllExcept(null)
        setState(id, !isOpen)
        return
      }

      const item = target.closest('[data-ui-dropdown-item]') as AnyEl | null
      if (item) {
        const title = (item.getAttribute('data-toast-title') || '').trim()
        if (title) {
          toast({
            title,
            description: (item.getAttribute('data-toast-description') || '').trim() || undefined
          })
        }
        const href = (item.getAttribute('data-href') || '').trim()
        if (href) {
          window.location.href = href
        }
        const content = item.closest('[data-ui-dropdown-content][data-dropdown-id]') as AnyEl | null
        const id = content?.dataset.dropdownId
        if (id) setState(id, false)
        return
      }

      const content = target.closest('[data-ui-dropdown-content][data-dropdown-id]') as AnyEl | null
      if (content) return

      closeAllExcept(null)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as Element | null
      if (target) {
        const trigger = target.closest('[data-ui-dropdown-trigger][data-dropdown-id]') as AnyEl | null
        if (trigger && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
          const id = trigger.getAttribute('data-dropdown-id')
          if (!id) return
          e.preventDefault()
          closeAllExcept(null)
          setState(id, true)
          return
        }
      }

      const openContent = document.querySelector('[data-ui-dropdown-content][data-state="open"]') as AnyEl | null
      if (!openContent) {
        if (e.key === 'Escape') closeAllExcept(null)
        return
      }

      const id = openContent.dataset.dropdownId
      if (!id) return
      const items = getItems(openContent)
      const active = document.activeElement
      const idx = items.findIndex((el) => el === active)

      if (e.key === 'Escape') {
        e.preventDefault()
        setState(id, false)
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const next = items[Math.min(items.length - 1, (idx < 0 ? -1 : idx) + 1)]
        next?.focus()
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        const next = items[Math.max(0, (idx < 0 ? items.length : idx) - 1)]
        next?.focus()
        return
      }

      if (e.key === 'Home') {
        e.preventDefault()
        items[0]?.focus()
        return
      }

      if (e.key === 'End') {
        e.preventDefault()
        items[items.length - 1]?.focus()
        return
      }

      if (e.key.length === 1 && /\S/.test(e.key)) {
        const q = e.key.toLowerCase()
        const match = items.find((it) => (it.textContent || '').trim().toLowerCase().startsWith(q))
        if (match) match.focus()
      }
    }

    const onReflow = () => {
      const open = document.querySelector('[data-ui-dropdown-content][data-state="open"]') as AnyEl | null
      if (!open) return
      const id = open.dataset.dropdownId
      if (!id) return
      const trigger = getTrigger(id)
      if (!trigger) return
      positionFloating({
        content: open,
        trigger,
        side: (open.dataset.side as Side) || 'bottom',
        align: (open.dataset.align as Align) || 'start'
      })
    }

    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onReflow)
    window.addEventListener('scroll', onReflow, true)
    return
  }, [])

  return null
}
