import { useEffect, useState } from 'hono/jsx'

interface Todo {
  id: number
  title: string
  completed: boolean
}

export default function TodosSpa() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTodos = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/todos')

      if (!response.ok) {
        throw new Error(`Failed to fetch todos: ${response.status}`)
      }

      const data = await response.json() as Todo[]
      setTodos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  if (loading) {
    return <div class="p-4">Loading todos...</div>
  }

  if (error) {
    return (
      <div class="p-4">
        <div class="text-red-600 mb-2">Error: {error}</div>
        <button
          type="button"
          onClick={fetchTodos}
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div class="p-4 border">
      <h2 class="text-xl font-bold mb-4">Todos</h2>
      {todos.length === 0 ? (
        <div class="text-gray-500">No todos found</div>
      ) : (
        <ul class="space-y-2">
          {todos.map(todo => (
            <li
              key={todo.id}
              class={`p-3 border rounded ${todo.completed ? 'bg-gray-50 line-through' : 'bg-white'}`}
            >
              <span class={todo.completed ? 'text-gray-500' : 'text-gray-900'}>
                {todo.title}
              </span>
              <span class="ml-2 text-sm text-gray-500">
                {todo.completed ? '(completed)' : '(pending)'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
