export type Align = 'start' | 'center' | 'end'
export type Side = 'bottom' | 'top'

export function positionFloating(opts: {
  content: HTMLElement
  trigger: HTMLElement
  side: Side
  align: Align
  gap?: number
}) {
  const { content, trigger, side, align, gap = 8 } = opts
  const t = trigger.getBoundingClientRect()
  const c = content.getBoundingClientRect()

  let top = side === 'top' ? t.top - c.height - gap : t.bottom + gap
  let left = t.left

  if (align === 'center') left = t.left + t.width / 2 - c.width / 2
  if (align === 'end') left = t.right - c.width

  const vw = window.innerWidth
  const vh = window.innerHeight
  left = Math.max(8, Math.min(left, vw - c.width - 8))
  top = Math.max(8, Math.min(top, vh - c.height - 8))

  content.style.left = `${Math.round(left)}px`
  content.style.top = `${Math.round(top)}px`
}
