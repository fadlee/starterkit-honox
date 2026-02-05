export type ToastVariant = 'default' | 'success' | 'error'

export type ToastDetail = {
  title: string
  description?: string
  variant?: ToastVariant
  durationMs?: number
  actionLabel?: string
  onAction?: () => void
}

export function toast(detail: ToastDetail) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<ToastDetail>('ui:toast', { detail }))
}
