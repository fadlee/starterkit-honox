export type Todo = {
  id: number
  title: string
  completed: boolean
}

const seed: Todo[] = [
  { id: 1, title: 'Learn HonoX', completed: true },
  { id: 2, title: 'Build SSR page', completed: false },
  { id: 3, title: 'Build SPA island', completed: false },
]

let todos: Todo[] = [...seed]
let nextId = 4

export function getTodos(): Todo[] {
  return todos
}

export function addTodo(title: string): Todo {
  const trimmed = title.trim()
  if (!trimmed) throw new Error('title is required')

  const todo: Todo = {
    id: nextId,
    title: trimmed,
    completed: false,
  }

  todos = [...todos, todo]
  nextId += 1
  return todo
}

export function toggleTodo(id: number): Todo | null {
  const idx = todos.findIndex((t) => t.id === id)
  if (idx === -1) return null

  const existing = todos[idx]
  const updated: Todo = { ...existing, completed: !existing.completed }
  todos = [...todos.slice(0, idx), updated, ...todos.slice(idx + 1)]
  return updated
}
