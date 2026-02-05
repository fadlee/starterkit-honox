import { useEffect } from 'hono/jsx'

type AnyEl = HTMLElement

const KEY = '__cf_ui_dialog_controller__'

function getFocusable(container: AnyEl): AnyEl[] {
  const selector =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  return Array.from(container.querySelectorAll(selector)).filter((el): el is AnyEl => el instanceof HTMLElement)
}

function lockScroll(lock: boolean) {
  const body = document.body
  if (!body) return
  if (lock) {
    if (body.dataset.uiScrollLocked === 'true') return
    body.dataset.uiScrollLocked = 'true'
    body.style.overflow = 'hidden'
  } else {
    if (body.dataset.uiScrollLocked !== 'true') return
    delete body.dataset.uiScrollLocked
    body.style.overflow = ''
  }
}

function setDialogState(dialogId: string, open: boolean, trigger?: AnyEl) {
  const wrapper = document.querySelector(`[data-ui-dialog-wrapper][data-dialog-id="${CSS.escape(dialogId)}"]`) as AnyEl | null
  if (!wrapper) return

  if (open) {
    if (trigger) {
      ;(wrapper as AnyEl).dataset.uiRestoreFocus = 'true'
      ;(wrapper as AnyEl).dataset.uiLastTriggerId = trigger.id || ''
    }
    wrapper.dataset.state = 'open'
    wrapper.classList.remove('hidden')
    lockScroll(true)
    const panel = wrapper.querySelector('[data-ui-dialog-content]') as AnyEl | null
    if (panel) {
      const focusables = getFocusable(panel)
      const target = focusables[0] ?? panel
      queueMicrotask(() => target.focus())
    }
    return
  }

  wrapper.dataset.state = 'closed'
  wrapper.classList.add('hidden')
  const anyOpen = document.querySelector('[data-ui-dialog-wrapper][data-state="open"]')
  if (!anyOpen) lockScroll(false)

  const lastTriggerId = wrapper.dataset.uiLastTriggerId
  if (lastTriggerId) {
    const el = document.getElementById(lastTriggerId)
    if (el instanceof HTMLElement) queueMicrotask(() => el.focus())
  }
}

function setAlertDialogState(dialogId: string, open: boolean, trigger?: AnyEl) {
  const wrapper = document.querySelector(
    `[data-ui-alert-dialog-wrapper][data-alert-dialog-id="${CSS.escape(dialogId)}"]`
  ) as AnyEl | null
  if (!wrapper) return

  if (open) {
    if (trigger) {
      ;(wrapper as AnyEl).dataset.uiLastTriggerId = trigger.id || ''
    }
    wrapper.dataset.state = 'open'
    wrapper.classList.remove('hidden')
    lockScroll(true)
    const panel = wrapper.querySelector('[data-ui-alert-dialog-content]') as AnyEl | null
    if (panel) {
      const focusables = getFocusable(panel)
      const target = focusables[0] ?? panel
      queueMicrotask(() => target.focus())
    }
    return
  }

  wrapper.dataset.state = 'closed'
  wrapper.classList.add('hidden')
  const anyOpen =
    document.querySelector('[data-ui-dialog-wrapper][data-state="open"]') ||
    document.querySelector('[data-ui-alert-dialog-wrapper][data-state="open"]')
  if (!anyOpen) lockScroll(false)

  const lastTriggerId = wrapper.dataset.uiLastTriggerId
  if (lastTriggerId) {
    const el = document.getElementById(lastTriggerId)
    if (el instanceof HTMLElement) queueMicrotask(() => el.focus())
  }
}

function topmostOpenDialogId(): string | null {
  const open = Array.from(document.querySelectorAll('[data-ui-dialog-wrapper][data-state="open"]'))
  const last = open[open.length - 1]
  if (!last) return null
  const dialogId = (last as AnyEl).dataset.dialogId
  return dialogId || null
}

function topmostOpenAlertDialogId(): string | null {
  const open = Array.from(document.querySelectorAll('[data-ui-alert-dialog-wrapper][data-state="open"]'))
  const last = open[open.length - 1]
  if (!last) return null
  const dialogId = (last as AnyEl).dataset.alertDialogId
  return dialogId || null
}

function trapTabIn(wrapper: AnyEl, contentSelector: string, e: KeyboardEvent) {
  if (e.key !== 'Tab') return
  const panel = wrapper.querySelector(contentSelector) as AnyEl | null
  if (!panel) return

  const focusables = getFocusable(panel)
  if (focusables.length === 0) {
    e.preventDefault()
    panel.focus()
    return
  }

  const active = document.activeElement
  const currentIndex = focusables.findIndex((el) => el === active)
  const first = focusables[0]
  const last = focusables[focusables.length - 1]

  if (e.shiftKey) {
    if (active === first || currentIndex === -1) {
      e.preventDefault()
      last.focus()
    }
    return
  }

  if (active === last) {
    e.preventDefault()
    first.focus()
  }
}

export default function DialogController() {
  useEffect(() => {
    const g = globalThis as any
    if (g[KEY]) return
    g[KEY] = true

    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null
      if (!target) return

      const trigger = target.closest('[data-ui-dialog-trigger][data-dialog-id]') as AnyEl | null
      if (trigger) {
        const dialogId = trigger.getAttribute('data-dialog-id')
        if (!dialogId) return
        if (!trigger.id) trigger.id = `dlg-trigger-${dialogId}-${Math.random().toString(16).slice(2)}`
        setDialogState(dialogId, true, trigger)
        return
      }

      const close = target.closest('[data-ui-dialog-close][data-dialog-id]') as AnyEl | null
      if (close) {
        const dialogId = close.getAttribute('data-dialog-id')
        if (!dialogId) return
        setDialogState(dialogId, false)
        return
      }

      const overlay = target.closest('[data-ui-dialog-overlay][data-dialog-id]') as AnyEl | null
      if (overlay) {
        const dialogId = overlay.getAttribute('data-dialog-id')
        if (!dialogId) return
        const wrapper = document.querySelector(
          `[data-ui-dialog-wrapper][data-dialog-id="${CSS.escape(dialogId)}"]`
        ) as AnyEl | null
        if (wrapper?.dataset.closeOnOverlay === 'false') return
        setDialogState(dialogId, false)
        return
      }

      const alertTrigger = target.closest('[data-ui-alert-dialog-trigger][data-alert-dialog-id]') as AnyEl | null
      if (alertTrigger) {
        const dialogId = alertTrigger.getAttribute('data-alert-dialog-id')
        if (!dialogId) return
        if (!alertTrigger.id) alertTrigger.id = `adlg-trigger-${dialogId}-${Math.random().toString(16).slice(2)}`
        setAlertDialogState(dialogId, true, alertTrigger)
        return
      }

      const alertAction = target.closest('[data-ui-alert-dialog-action][data-alert-dialog-id]') as AnyEl | null
      if (alertAction) {
        const dialogId = alertAction.getAttribute('data-alert-dialog-id')
        if (!dialogId) return
        setAlertDialogState(dialogId, false)
        return
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as Element | null
      if (target) {
        const trigger = target.closest('[data-ui-dialog-trigger][data-dialog-id]') as AnyEl | null
        if (trigger && (e.key === 'Enter' || e.key === ' ')) {
          const dialogId = trigger.getAttribute('data-dialog-id')
          if (dialogId) {
            e.preventDefault()
            setDialogState(dialogId, true, trigger)
            return
          }
        }
        const close = target.closest('[data-ui-dialog-close][data-dialog-id]') as AnyEl | null
        if (close && (e.key === 'Enter' || e.key === ' ')) {
          const dialogId = close.getAttribute('data-dialog-id')
          if (dialogId) {
            e.preventDefault()
            setDialogState(dialogId, false)
            return
          }
        }

        const alertTrigger = target.closest('[data-ui-alert-dialog-trigger][data-alert-dialog-id]') as AnyEl | null
        if (alertTrigger && (e.key === 'Enter' || e.key === ' ')) {
          const dialogId = alertTrigger.getAttribute('data-alert-dialog-id')
          if (dialogId) {
            e.preventDefault()
            if (!alertTrigger.id) alertTrigger.id = `adlg-trigger-${dialogId}-${Math.random().toString(16).slice(2)}`
            setAlertDialogState(dialogId, true, alertTrigger)
            return
          }
        }

        const alertAction = target.closest('[data-ui-alert-dialog-action][data-alert-dialog-id]') as AnyEl | null
        if (alertAction && (e.key === 'Enter' || e.key === ' ')) {
          const dialogId = alertAction.getAttribute('data-alert-dialog-id')
          if (dialogId) {
            e.preventDefault()
            setAlertDialogState(dialogId, false)
            return
          }
        }
      }
      if (e.key !== 'Escape') return

      const alertDialogId = topmostOpenAlertDialogId()
      if (alertDialogId) {
        const wrapper = document.querySelector(
          `[data-ui-alert-dialog-wrapper][data-alert-dialog-id="${CSS.escape(alertDialogId)}"]`
        ) as AnyEl | null
        if (wrapper?.dataset.closeOnEsc === 'true') {
          e.preventDefault()
          setAlertDialogState(alertDialogId, false)
        }
        return
      }

      const dialogId = topmostOpenDialogId()
      if (!dialogId) return
      const wrapper = document.querySelector(
        `[data-ui-dialog-wrapper][data-dialog-id="${CSS.escape(dialogId)}"]`
      ) as AnyEl | null
      if (wrapper?.dataset.dismissible === 'false') return
      if (wrapper?.dataset.closeOnEsc === 'false') return
      e.preventDefault()
      setDialogState(dialogId, false)
    }

    const onKeyDownCapture = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const alertId = topmostOpenAlertDialogId()
      if (alertId) {
        const wrapper = document.querySelector(
          `[data-ui-alert-dialog-wrapper][data-alert-dialog-id="${CSS.escape(alertId)}"]`
        ) as AnyEl | null
        if (wrapper) trapTabIn(wrapper, '[data-ui-alert-dialog-content]', e)
        return
      }

      const dialogId = topmostOpenDialogId()
      if (!dialogId) return
      const wrapper = document.querySelector(
        `[data-ui-dialog-wrapper][data-dialog-id="${CSS.escape(dialogId)}"]`
      ) as AnyEl | null
      if (!wrapper) return
      trapTabIn(wrapper, '[data-ui-dialog-content]', e)
    }

    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keydown', onKeyDownCapture, true)
    return
  }, [])

  return null
}
