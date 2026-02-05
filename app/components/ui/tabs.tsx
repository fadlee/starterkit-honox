import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

export type TabsProps = JSX.IntrinsicElements['div'] & {
  id: string
  defaultValue?: string
}

export function Tabs(props: TabsProps) {
  const { id, defaultValue, class: className, ...rest } = props
  const css = defaultValue
    ? `[data-ui-tabs-root][data-tabs-id="${id}"] [data-ui-tabs-content]{display:none;}\n` +
      `[data-ui-tabs-root][data-tabs-id="${id}"] [data-ui-tabs-content][data-value="${defaultValue}"]{display:block;}`
    : ''
  return (
    <>
      {css && <style>{css}</style>}
      <div
        data-ui-tabs-root
        data-tabs-id={id}
        data-value={defaultValue ?? ''}
        class={cn('w-full', className)}
        {...rest}
      />
    </>
  )
}

export function TabsList(props: JSX.IntrinsicElements['div']) {
  const { class: className, ...rest } = props
  return (
    <div
      role="tablist"
      class={cn(
        'inline-flex h-10 items-center justify-center rounded-[var(--radius)] bg-[hsl(var(--muted))] p-1 text-[hsl(var(--muted-foreground))]',
        className
      )}
      {...rest}
    />
  )
}

export type TabsTriggerProps = JSX.IntrinsicElements['button'] & {
  tabsId: string
  value: string
}

export function TabsTrigger(props: TabsTriggerProps) {
  const { tabsId, value, class: className, type, ...rest } = props
  const id = `${tabsId}-tab-${value}`
  const controls = `${tabsId}-panel-${value}`
  return (
    <button
      id={id}
      type={type ?? 'button'}
      role="tab"
      aria-controls={controls}
      aria-selected={false}
      tabIndex={-1}
      data-ui-tabs-trigger
      data-tabs-id={tabsId}
      data-value={value}
      class={cn(
        'inline-flex h-8 items-center justify-center whitespace-nowrap rounded-[calc(var(--radius)-0.25rem)] px-3 text-sm font-medium text-[hsl(var(--foreground))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:shadow-sm',
        className
      )}
      {...rest}
    />
  )
}

export type TabsContentProps = JSX.IntrinsicElements['div'] & {
  tabsId: string
  value: string
}

export function TabsContent(props: TabsContentProps) {
  const { tabsId, value, class: className, ...rest } = props
  const id = `${tabsId}-panel-${value}`
  const labelledby = `${tabsId}-tab-${value}`
  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={labelledby}
      data-ui-tabs-content
      data-tabs-id={tabsId}
      data-value={value}
      class={cn('mt-4 outline-none', className)}
      {...rest}
    />
  )
}
