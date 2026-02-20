import { useState } from 'hono/jsx'
import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

export type SwitchProps = Omit<JSX.IntrinsicElements['button'], 'onChange'> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function Switch(props: SwitchProps) {
  const {
    class: className,
    checked,
    defaultChecked = false,
    onCheckedChange,
    disabled,
    type,
    ...rest
  } = props

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultChecked)
  const isControlled = typeof checked === 'boolean'
  const isChecked = isControlled ? checked : uncontrolledValue

  return (
    <button
      type={type ?? 'button'}
      role="switch"
      aria-checked={isChecked}
      disabled={disabled}
      data-state={isChecked ? 'checked' : 'unchecked'}
      class={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-black data-[state=unchecked]:bg-[hsl(var(--muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]',
        className
      )}
      onClick={() => {
        if (disabled) return
        const next = !isChecked
        if (!isControlled) {
          setUncontrolledValue(next)
        }
        onCheckedChange?.(next)
      }}
      {...rest}
    >
      <span
        data-state={isChecked ? 'checked' : 'unchecked'}
        class='pointer-events-none block h-5 w-5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
      />
    </button>
  )
}
