import type { User, UserRole } from '@/types/lms'
import { apiFetch, ApiHttpError } from '@/lib/api-client'

export async function getUsers(): Promise<User[]> {
  try {
    return await apiFetch<User[]>('/api/users')
  } catch {
    return []
  }
}

export async function initDefaultAdmin(): Promise<void> {
  // no-op: seeding now happens in the server in-memory store.
}

export async function login(username: string, password: string): Promise<User | null> {
  try {
    return await apiFetch<User>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  } catch (error) {
    if (error instanceof ApiHttpError && error.status === 401) {
      return null
    }
    throw error
  }
}

export async function logout(): Promise<void> {
  await apiFetch<{ ok: boolean }>('/api/auth/logout', {
    method: 'POST',
  })
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    return await apiFetch<User | null>('/api/auth/session')
  } catch {
    return null
  }
}

export async function createUser(data: {
  username: string
  password: string
  displayName: string
}): Promise<User | null> {
  try {
    return await apiFetch<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  } catch (error) {
    if (error instanceof ApiHttpError && error.status === 409) {
      return null
    }
    throw error
  }
}

export async function deleteUser(id: string): Promise<void> {
  await apiFetch<{ ok: boolean }>(`/api/users/${id}`, {
    method: 'DELETE',
  })
}

export async function updateUserRole(id: string, role: UserRole): Promise<void> {
  await apiFetch<User>(`/api/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
}

export async function changePassword(id: string, newPassword: string): Promise<void> {
  await apiFetch<{ ok: boolean }>(`/api/users/${id}/password`, {
    method: 'PATCH',
    body: JSON.stringify({ newPassword }),
  })
}
