import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

export type TextareaProps = JSX.IntrinsicElements['textarea']

export function Textarea(props: TextareaProps) {
  const { class: className, ...rest } = props
  return (
    <textarea
      class={cn(
        'flex min-h-20 w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm outline-none transition-shadow placeholder:text-[hsl(var(--muted-foreground))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...rest}
    />
  )
}
