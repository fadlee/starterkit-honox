import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

export type InputProps = JSX.IntrinsicElements['input']

export function Input(props: InputProps) {
  const { class: className, type = 'text', ...rest } = props
  return (
    <input
      type={type}
      class={cn(
        'flex h-10 w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm outline-none transition-shadow placeholder:text-[hsl(var(--muted-foreground))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...rest}
    />
  )
}
