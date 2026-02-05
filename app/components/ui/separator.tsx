import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

export type SeparatorProps = JSX.IntrinsicElements['div'] & {
  orientation?: 'horizontal' | 'vertical'
}

export function Separator(props: SeparatorProps) {
  const { class: className, orientation = 'horizontal', ...rest } = props
  return (
    <div
      class={cn('shrink-0 bg-[hsl(var(--border))]', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)}
      {...rest}
    />
  )
}
