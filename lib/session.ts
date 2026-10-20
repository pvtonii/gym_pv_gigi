import type { SessionUser } from '@/types'

// Cookie de sessão assinado com HMAC-SHA256: "<payload base64url>.<assinatura base64url>".
// Chave = service role key (secreta, só no servidor). Usado por lib/auth.ts e proxy.ts.

export const SESSION_COOKIE = 'gym_session'

const encoder = new TextEncoder()

function toBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function fromBase64Url(str: string): Uint8Array<ArrayBuffer> {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error('SUPABASE_SERVICE_ROLE_KEY não definida')
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function signSession(session: SessionUser): Promise<string> {
  const payload = toBase64Url(encoder.encode(JSON.stringify(session)))
  const sig = await crypto.subtle.sign('HMAC', await getKey(), encoder.encode(payload))
  return `${payload}.${toBase64Url(new Uint8Array(sig))}`
}

export async function verifySession(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null

  try {
    const valid = await crypto.subtle.verify(
      'HMAC',
      await getKey(),
      fromBase64Url(sig),
      encoder.encode(payload)
    )
    if (!valid) return null

    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as SessionUser
    if (Date.now() > session.expiresAt) return null
    return session
  } catch {
    return null
  }
}
