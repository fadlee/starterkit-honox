import { useState } from 'hono/jsx'
import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

export type ToggleProps = Omit<JSX.IntrinsicElements['button'], 'onChange'> & {
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  size?: 'default' | 'sm' | 'lg'
}

const sizeClass: Record<NonNullable<ToggleProps['size']>, string> = {
  default: 'h-10 px-3',
  sm: 'h-8 px-2',
  lg: 'h-11 px-5',
}

export function Toggle(props: ToggleProps) {
  const {
    class: className,
    pressed,
    defaultPressed = false,
    onPressedChange,
    size = 'default',
    disabled,
    type,
    ...rest
  } = props

  const [internalPressed, setInternalPressed] = useState(defaultPressed)
  const isControlled = typeof pressed === 'boolean'
  const isPressed = isControlled ? pressed : internalPressed

  return (
    <button
      type={type ?? 'button'}
      aria-pressed={isPressed}
      data-state={isPressed ? 'on' : 'off'}
      disabled={disabled}
      class={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-[hsl(var(--muted))] data-[state=on]:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]/70',
        sizeClass[size],
        className
      )}
      onClick={() => {
        if (disabled) return
        const next = !isPressed
        if (!isControlled) {
          setInternalPressed(next)
        }
        onPressedChange?.(next)
      }}
      {...rest}
    />
  )
}
