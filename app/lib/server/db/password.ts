const HASH_PREFIX = 'pbkdf2_sha256'
const ITERATIONS = 210_000
const HASH_BITS = 256
const SALT_BYTES = 16

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function derivePbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations,
      salt: salt as BufferSource,
    },
    key,
    HASH_BITS
  )
  return new Uint8Array(bits)
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i]
  }
  return diff === 0
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const hash = await derivePbkdf2(password, salt, ITERATIONS)
  return `${HASH_PREFIX}$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [prefix, iterationsRaw, saltBase64, hashBase64] = storedHash.split('$')
  if (!prefix || !iterationsRaw || !saltBase64 || !hashBase64) return false
  if (prefix !== HASH_PREFIX) return false

  const iterations = Number(iterationsRaw)
  if (!Number.isInteger(iterations) || iterations <= 0) return false

  let salt: Uint8Array
  let expectedHash: Uint8Array
  try {
    salt = fromBase64(saltBase64)
    expectedHash = fromBase64(hashBase64)
  } catch {
    return false
  }

  const derived = await derivePbkdf2(password, salt, iterations)
  return constantTimeEqual(derived, expectedHash)
}
