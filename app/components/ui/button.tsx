import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

type Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
type Size = 'default' | 'sm' | 'lg' | 'icon'

export type ButtonProps = JSX.IntrinsicElements['button'] & {
  variant?: Variant
  size?: Size
}

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  default:
    'bg-black text-white hover:bg-black/90',
  secondary:
    'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]/80',
  outline:
    'border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--muted))]',
  ghost:
    'bg-transparent hover:bg-[hsl(var(--muted))]',
  destructive:
    'bg-red-600 text-white hover:bg-red-600/90'
}

const sizes: Record<Size, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10'
}

export function Button(props: ButtonProps) {
  const { class: className, variant = 'default', size = 'default', type, ...rest } = props
  return (
    <button
      type={type ?? 'button'}
      class={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    />
  )
}
