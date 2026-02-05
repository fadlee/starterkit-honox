import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

type Variant = 'default' | 'secondary' | 'outline'

export type BadgeProps = JSX.IntrinsicElements['span'] & {
  variant?: Variant
}

const variants: Record<Variant, string> = {
  default: 'bg-black text-white',
  secondary: 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]',
  outline: 'border border-[hsl(var(--border))] text-[hsl(var(--foreground))]'
}

export function Badge(props: BadgeProps) {
  const { class: className, variant = 'default', ...rest } = props
  return (
    <span
      class={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...rest}
    />
  )
}
