import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

export type RadioGroupProps = JSX.IntrinsicElements['div'] & {
  value?: string
  onValueChange?: (value: string) => void
}

export function RadioGroup(props: RadioGroupProps) {
  const { class: className, value, onValueChange, onChange, ...rest } = props

  return (
    <div
      role="radiogroup"
      data-value={value ?? ''}
      class={cn('grid gap-2', className)}
      onChange={(event) => {
        const target = event.target as HTMLInputElement
        if (target?.type === 'radio') {
          onValueChange?.(target.value)
        }
        onChange?.(event)
      }}
      {...rest}
    />
  )
}

export type RadioGroupItemProps = Omit<JSX.IntrinsicElements['input'], 'type' | 'onChange'> & {
  onCheckedChange?: (checked: boolean) => void
}

export function RadioGroupItem(props: RadioGroupItemProps) {
  const { class: className, onCheckedChange, ...rest } = props

  return (
    <input
      type="radio"
      class={cn(
        'h-4 w-4 rounded-full border border-[hsl(var(--border))] accent-black outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onChange={(event) => {
        const target = event.target as HTMLInputElement
        onCheckedChange?.(target.checked)
      }}
      {...rest}
    />
  )
}
