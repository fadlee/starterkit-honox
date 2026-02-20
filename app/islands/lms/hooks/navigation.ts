export function go(path: string) {
  if (typeof window === 'undefined') return
  window.location.href = path
}

export function replace(path: string) {
  if (typeof window === 'undefined') return
  window.location.replace(path)
}

export function replaceUrl(path: string) {
  if (typeof window === 'undefined') return
  window.history.replaceState(null, '', path)
}
