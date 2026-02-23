import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

type Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
type Size = 'default' | 'sm' | 'lg' | 'icon'

export type ButtonProps = JSX.IntrinsicElements['button'] & {
  variant?: Variant
  size?: Size
}

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] text-sm font-medium transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  default:
    'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm hover:shadow-md hover:bg-[hsl(var(--primary))]/90',
  secondary:
    'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] shadow-sm hover:shadow-md hover:bg-[hsl(var(--secondary))]/80',
  outline:
    'border border-[hsl(var(--border))] bg-transparent shadow-sm hover:shadow-md hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
  ghost:
    'bg-transparent hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
  destructive:
    'bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] shadow-sm hover:shadow-md hover:bg-[hsl(var(--destructive))]/90'
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
