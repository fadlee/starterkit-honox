import { useEffect, useMemo, useState } from 'hono/jsx'

import type { ToastDetail, ToastVariant } from '@/lib/toast'
import { cn } from '@/lib/cn'
import { ToastViewport as ToastViewportShell } from '@/components/ui/toast'

type ToastItem = ToastDetail & {
  id: string
  createdAt: number
  timeoutId?: number
}

type Subscriber = (detail: ToastDetail) => void

const KEY = '__cf_ui_toast_bus__'

function getBus(): { inited: boolean; subs: Set<Subscriber> } {
  const g = globalThis as any
  if (!g[KEY]) {
    g[KEY] = { inited: false, subs: new Set<Subscriber>() }
  }
  return g[KEY]
}

function variantClasses(variant: ToastVariant | undefined) {
  if (variant === 'success') return 'border-emerald-200 bg-emerald-50'
  if (variant === 'error') return 'border-red-200 bg-red-50'
  return 'border-[hsl(var(--border))] bg-white'
}

export default function ToastViewport() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = (id: string) => {
    setToasts((prev) => {
      const found = prev.find((t) => t.id === id)
      if (found && typeof found.timeoutId === 'number') window.clearTimeout(found.timeoutId)
      return prev.filter((t) => t.id !== id)
    })
  }

  useEffect(() => {
    const bus = getBus()

    if (!bus.inited) {
      bus.inited = true
      window.addEventListener('ui:toast', ((e: Event) => {
        const ce = e as CustomEvent<ToastDetail>
        const detail = ce.detail
        if (!detail || !detail.title) return
        for (const sub of Array.from(bus.subs)) sub(detail)
      }) as EventListener)
    }

    const sub: Subscriber = (detail) => {
      const durationMs = typeof detail.durationMs === 'number' ? detail.durationMs : 3500
      setToasts((prev) => {
        const key = `${detail.variant || 'default'}::${detail.title}::${detail.description || ''}`
        const existingIndex = prev.findIndex(
          (t) => `${t.variant || 'default'}::${t.title}::${t.description || ''}` === key
        )

        const now = Date.now()
        const id =
          existingIndex >= 0
            ? prev[existingIndex].id
            : `t_${now.toString(36)}_${Math.random().toString(16).slice(2)}`

        if (existingIndex >= 0) {
          const existing = prev[existingIndex]
          if (typeof existing.timeoutId === 'number') window.clearTimeout(existing.timeoutId)
        }

        const timeoutId = window.setTimeout(() => removeToast(id), durationMs)
        const nextItem: ToastItem = {
          id,
          createdAt: now,
          title: detail.title,
          description: detail.description,
          variant: detail.variant,
          durationMs,
          actionLabel: detail.actionLabel,
          onAction: detail.onAction,
          timeoutId
        }

        const without = existingIndex >= 0 ? prev.filter((t) => t.id !== id) : prev
        const trimmed = [nextItem, ...without].slice(0, 5)
        return trimmed
      })
    }

    bus.subs.add(sub)
    return () => {
      bus.subs.delete(sub)
    }
  }, [])

  const items = useMemo(() => toasts, [toasts])

  useEffect(() => {
    return () => {
      for (const t of items) {
        if (typeof t.timeoutId === 'number') window.clearTimeout(t.timeoutId)
      }
    }
  }, [])

  return (
    <ToastViewportShell>
      {items.map((t) => (
        <output
          key={t.id}
          class={cn(
            'rounded-[var(--radius)] border p-4 shadow-sm',
            variantClasses(t.variant)
          )}
          aria-live="polite"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-semibold leading-5">{t.title}</p>
              {t.description && (
                <p class="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{t.description}</p>
              )}
              {(t.actionLabel || t.onAction) && (
                <div class="mt-3">
                  <button
                    type="button"
                    class="inline-flex items-center rounded-md border border-[hsl(var(--border))] bg-white px-2.5 py-1.5 text-sm hover:bg-black/5"
                    onClick={() => {
                      try {
                        t.onAction?.()
                      } finally {
                        removeToast(t.id)
                      }
                    }}
                  >
                    {t.actionLabel ?? 'Action'}
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              class="shrink-0 rounded-md px-2 py-1 text-sm hover:bg-black/5"
              onClick={() => {
                removeToast(t.id)
              }}
              aria-label="Dismiss"
              title="Dismiss"
            >
              ×
            </button>
          </div>
        </output>
      ))}
    </ToastViewportShell>
  )
}
