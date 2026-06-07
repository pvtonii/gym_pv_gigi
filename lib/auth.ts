'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import type { UserId, SessionUser } from '@/types'

const SESSION_COOKIE = 'gym_session'
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 dias

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function login(
  userId: UserId,
  pin: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const pinHash = await sha256(pin)

  const { data, error } = await supabase
    .from('users')
    .select('id, name, pin')
    .eq('id', userId)
    .single()

  if (error || !data) return { success: false, error: 'Usuário não encontrado.' }
  if (data.pin !== pinHash) return { success: false, error: 'PIN incorreto.' }

  const session: SessionUser = {
    id: data.id,
    name: data.name,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS / 1000,
    path: '/',
  })

  return { success: true }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(SESSION_COOKIE)?.value
  if (!raw) return null

  try {
    const session = JSON.parse(raw) as SessionUser
    if (Date.now() > session.expiresAt) return null
    return session
  } catch {
    return null
  }
}
