import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

export type ToastViewportProps = JSX.IntrinsicElements['div']

export function ToastViewport(props: ToastViewportProps) {
  const { class: className, ...rest } = props
  return (
    <div
      data-ui-toast-viewport
      class={cn('fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2', className)}
      {...rest}
    />
  )
}
