import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

export type CheckboxProps = Omit<JSX.IntrinsicElements['input'], 'type' | 'onChange'> & {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function Checkbox(props: CheckboxProps) {
  const { class: className, checked, onCheckedChange, ...rest } = props

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => {
        const target = event.target as HTMLInputElement
        onCheckedChange?.(target.checked)
      }}
      class={cn(
        'h-4 w-4 rounded border border-[hsl(var(--border))] accent-black outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...rest}
    />
  )
}
