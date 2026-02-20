import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

export function Table(props: JSX.IntrinsicElements['table']) {
  const { class: className, ...rest } = props
  return (
    <div class='w-full overflow-auto'>
      <table class={cn('w-full caption-bottom text-sm', className)} {...rest} />
    </div>
  )
}

export function TableHeader(props: JSX.IntrinsicElements['thead']) {
  const { class: className, ...rest } = props
  return <thead class={cn('[&_tr]:border-b', className)} {...rest} />
}

export function TableBody(props: JSX.IntrinsicElements['tbody']) {
  const { class: className, ...rest } = props
  return <tbody class={cn('[&_tr:last-child]:border-0', className)} {...rest} />
}

export function TableRow(props: JSX.IntrinsicElements['tr']) {
  const { class: className, ...rest } = props
  return (
    <tr
      class={cn(
        'border-b border-[hsl(var(--border))] transition-colors hover:bg-[hsl(var(--muted))]/50 data-[state=selected]:bg-[hsl(var(--muted))]',
        className
      )}
      {...rest}
    />
  )
}

export function TableHead(props: JSX.IntrinsicElements['th']) {
  const { class: className, ...rest } = props
  return (
    <th
      class={cn(
        'h-10 px-3 text-left align-middle font-medium text-[hsl(var(--muted-foreground))] [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...rest}
    />
  )
}

export function TableCell(props: JSX.IntrinsicElements['td']) {
  const { class: className, ...rest } = props
  return (
    <td class={cn('p-3 align-middle [&:has([role=checkbox])]:pr-0', className)} {...rest} />
  )
}

export function TableCaption(props: JSX.IntrinsicElements['caption']) {
  const { class: className, ...rest } = props
  return <caption class={cn('mt-4 text-sm text-[hsl(var(--muted-foreground))]', className)} {...rest} />
}
