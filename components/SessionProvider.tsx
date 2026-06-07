'use client'

import { createContext, useContext } from 'react'
import type { SessionUser } from '@/types'

const SessionContext = createContext<SessionUser | null>(null)

export function SessionProvider({
  session,
  children,
}: {
  session: SessionUser
  children: React.ReactNode
}) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession(): SessionUser {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}
