import type { User } from '@/types/lms'

const USERS_KEY = 'lms_users'
const SESSION_KEY = 'lms_current_user'

function storage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function getUsers(): User[] {
  const store = storage()
  if (!store) return []
  try {
    const raw = store.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as User[]) : []
  } catch {
    return []
  }
}

function saveUsers(users: User[]) {
  const store = storage()
  if (!store) return
  try {
    store.setItem(USERS_KEY, JSON.stringify(users))
  } catch {
    // ignore localStorage write failures
  }
}

export function initDefaultAdmin() {
  const users = getUsers()
  if (!users.find((u) => u.username === 'admin')) {
    users.push({
      id: 'admin-001',
      username: 'admin',
      password: 'admin123',
      displayName: 'Administrator',
      role: 'admin',
      createdAt: new Date().toISOString(),
    })
    saveUsers(users)
  }
}

export function login(username: string, password: string): User | null {
  initDefaultAdmin()
  const store = storage()
  const users = getUsers()
  const user = users.find((u) => u.username === username && u.password === password)
  if (user && store) {
    try {
      store.setItem(SESSION_KEY, JSON.stringify(user))
    } catch {
      // ignore localStorage write failures
    }
    return user
  }
  return user ?? null
}

export function logout() {
  const store = storage()
  if (!store) return
  try {
    store.removeItem(SESSION_KEY)
  } catch {
    // ignore localStorage write failures
  }
}

export function getCurrentUser(): User | null {
  const store = storage()
  if (!store) return null
  try {
    const raw = store.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function createUser(data: {
  username: string
  password: string
  displayName: string
}): User | null {
  const users = getUsers()
  if (users.find((u) => u.username === data.username)) return null
  const user: User = {
    id:
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 11)}`,
    username: data.username,
    password: data.password,
    displayName: data.displayName,
    role: 'user',
    createdAt: new Date().toISOString(),
  }
  users.push(user)
  saveUsers(users)
  return user
}

export function deleteUser(id: string) {
  const users = getUsers().filter((u) => u.id !== id)
  saveUsers(users)
}

export function updateUserRole(id: string, role: 'admin' | 'user') {
  const users = getUsers().map((u) => (u.id === id ? { ...u, role } : u))
  saveUsers(users)
}
