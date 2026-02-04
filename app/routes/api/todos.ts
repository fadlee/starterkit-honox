import { createRoute } from 'honox/factory'

import { addTodo, getTodos } from '@/lib/todos'

export default createRoute(async (c) => {
  c.header('cache-control', 'no-store')
  return c.json(getTodos(), 200)
})

export const POST = createRoute(async (c) => {
  const body = await c.req.json()
  const title = typeof body?.title === 'string' ? body.title.trim() : ''

  c.header('cache-control', 'no-store')
  if (!title) {
    return c.json({ error: 'title is required' }, 400)
  }

  const todo = addTodo(title)
  return c.json(todo, 201)
})
