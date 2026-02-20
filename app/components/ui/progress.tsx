import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

export type ProgressProps = JSX.IntrinsicElements['div'] & {
  value?: number
  max?: number
}

export function Progress(props: ProgressProps) {
  const { class: className, value = 0, max = 100, ...rest } = props
  const clamped = Math.max(0, Math.min(max, value))
  const percentage = max <= 0 ? 0 : (clamped / max) * 100

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(clamped)}
      class={cn('relative h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]', className)}
      {...rest}
    >
      <div class='h-full bg-black transition-all' style={{ width: `${percentage}%` }} />
    </div>
  )
}
