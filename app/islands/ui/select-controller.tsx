import { useEffect } from 'hono/jsx'

import { positionFloating, type Align, type Side } from '@/lib/floating'

type AnyEl = HTMLElement

const KEY = '__cf_ui_select_controller__'

function root(id: string): AnyEl | null {
  return document.querySelector(`[data-ui-select-root][data-select-id="${CSS.escape(id)}"]`) as AnyEl | null
}

function trigger(id: string): AnyEl | null {
  return document.querySelector(`[data-ui-select-trigger][data-select-id="${CSS.escape(id)}"]`) as AnyEl | null
}

function valueEl(id: string): AnyEl | null {
  return document.querySelector(`[data-ui-select-value][data-select-id="${CSS.escape(id)}"]`) as AnyEl | null
}

function content(id: string): AnyEl | null {
  return document.querySelector(`[data-ui-select-content][data-select-id="${CSS.escape(id)}"]`) as AnyEl | null
}

function items(c: AnyEl): AnyEl[] {
  return Array.from(c.querySelectorAll('[data-ui-select-item]')).filter(
    (el): el is AnyEl => el instanceof HTMLElement && el.dataset.disabled !== 'true'
  )
}

function ensureHiddenInput(id: string) {
  const r = root(id)
  if (!r) return
  const name = (r.dataset.name || '').trim()
  if (!name) return
  let input = r.querySelector('input[type="hidden"][data-ui-select-hidden]') as HTMLInputElement | null
  if (!input) {
    input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.setAttribute('data-ui-select-hidden', 'true')
    r.appendChild(input)
  }
  input.value = r.dataset.value || ''
}

function closeAllExcept(keepId: string | null) {
  const contents = Array.from(document.querySelectorAll('[data-ui-select-content][data-select-id]')) as AnyEl[]
  for (const c of contents) {
    const id = c.dataset.selectId
    if (!id) continue
    if (keepId && id === keepId) continue
    c.dataset.state = 'closed'
    c.classList.add('hidden')
  }
}

function setOpen(id: string, open: boolean) {
  const c = content(id)
  const t = trigger(id)
  if (!c || !t) return
  if (open) {
    c.dataset.state = 'open'
    c.classList.remove('hidden')
    positionFloating({
      content: c,
      trigger: t,
      side: (c.dataset.side as Side) || 'bottom',
      align: (c.dataset.align as Align) || 'start'
    })
    const its = items(c)
    queueMicrotask(() => (its[0] ?? c).focus())
  } else {
    c.dataset.state = 'closed'
    c.classList.add('hidden')
  }
}

function setValue(id: string, value: string) {
  const r = root(id)
  const c = content(id)
  if (!r || !c) return
  r.dataset.value = value
  ensureHiddenInput(id)

  for (const it of items(c)) {
    const active = it.dataset.value === value
    it.setAttribute('aria-selected', active ? 'true' : 'false')
    it.dataset.state = active ? 'active' : 'inactive'
  }

  const chosen = c.querySelector(`[data-ui-select-item][data-value="${CSS.escape(value)}"]`) as AnyEl | null
  const v = valueEl(id)
  if (v && chosen) v.textContent = (chosen.textContent || '').trim()
}

function initAll() {
  const roots = Array.from(document.querySelectorAll('[data-ui-select-root][data-select-id]')) as AnyEl[]
  for (const r of roots) {
    const id = r.dataset.selectId
    if (!id) continue
    ensureHiddenInput(id)
    const c = content(id)
    if (!c) continue
    const its = items(c)
    if (its.length === 0) continue
    const current = (r.dataset.value || '').trim()
    const first = its[0].dataset.value || ''
    setValue(id, current || first)
  }
}

export default function SelectController() {
  useEffect(() => {
    const g = globalThis as any
    if (g[KEY]) return
    g[KEY] = true

    initAll()

    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null
      if (!target) return

      const t = target.closest('[data-ui-select-trigger][data-select-id]') as AnyEl | null
      if (t) {
        const id = t.getAttribute('data-select-id')
        if (!id) return
        const c = content(id)
        if (!c) return
        const isOpen = c.dataset.state === 'open'
        closeAllExcept(null)
        setOpen(id, !isOpen)
        return
      }

      const it = target.closest('[data-ui-select-item][data-value]') as AnyEl | null
      if (it) {
        const c = it.closest('[data-ui-select-content][data-select-id]') as AnyEl | null
        const id = c?.dataset.selectId
        const value = it.dataset.value
        if (id && value) {
          setValue(id, value)
          setOpen(id, false)
          queueMicrotask(() => trigger(id)?.focus())
        }
        return
      }

      const c = target.closest('[data-ui-select-content][data-select-id]') as AnyEl | null
      if (c) return
      closeAllExcept(null)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as Element | null
      if (target) {
        const t = target.closest('[data-ui-select-trigger][data-select-id]') as AnyEl | null
        if (t && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
          const id = t.getAttribute('data-select-id')
          if (!id) return
          e.preventDefault()
          closeAllExcept(null)
          setOpen(id, true)
          return
        }
      }

      const open = document.querySelector('[data-ui-select-content][data-state="open"]') as AnyEl | null
      if (!open) {
        if (e.key === 'Escape') closeAllExcept(null)
        return
      }
      const id = open.dataset.selectId
      if (!id) return

      const its = items(open)
      const active = document.activeElement
      const idx = its.findIndex((el) => el === active)

      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(id, false)
        trigger(id)?.focus()
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        its[Math.min(its.length - 1, (idx < 0 ? -1 : idx) + 1)]?.focus()
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        its[Math.max(0, (idx < 0 ? its.length : idx) - 1)]?.focus()
        return
      }

      if (e.key === 'Enter' || e.key === ' ') {
        const el = active as AnyEl | null
        const value = el?.dataset?.value
        if (value) {
          e.preventDefault()
          setValue(id, value)
          setOpen(id, false)
          trigger(id)?.focus()
        }
      }
    }

    const onReflow = () => {
      const open = document.querySelector('[data-ui-select-content][data-state="open"]') as AnyEl | null
      if (!open) return
      const id = open.dataset.selectId
      if (!id) return
      const t = trigger(id)
      if (!t) return
      positionFloating({
        content: open,
        trigger: t,
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
