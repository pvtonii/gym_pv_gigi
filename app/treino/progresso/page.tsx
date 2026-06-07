import { getSession } from '@/lib/auth'
import { getAllLogs } from '@/lib/actions/get-logs'
import { WORKOUT_DAYS } from '@/lib/workout-data'
import { ProgressClient } from '@/components/ProgressClient'
import { logout } from '@/lib/auth'
import type { UserId } from '@/types'
import { LogOut } from 'lucide-react'

export default async function ProgressoPage() {
  const session = await getSession()
  if (!session) return null

  const otherId: UserId = session.id === 'pv' ? 'gi' : 'pv'

  const [pvLogs, giLogs] = await Promise.all([
    getAllLogs(undefined, 'pv'),
    getAllLogs(undefined, 'gi'),
  ])

  return (
    <>
      {/* Topbar */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-4 h-14"
        style={{
          background: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black" style={{ color: 'var(--accent)' }}>
              GYM
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(0,229,255,0.12)', color: 'var(--accent)' }}
            >
              Progresso
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Histórico & Comparativo
          </p>
        </div>
        <form
          action={async () => {
            'use server'
            await logout()
          }}
        >
          <button
            type="submit"
            className="p-2 rounded-full"
            style={{ color: 'var(--text-muted)' }}
          >
            <LogOut size={16} />
          </button>
        </form>
      </header>

      <ProgressClient
        workoutDays={WORKOUT_DAYS}
        pvLogs={pvLogs}
        giLogs={giLogs}
        currentUserId={session.id}
      />
    </>
  )
}
