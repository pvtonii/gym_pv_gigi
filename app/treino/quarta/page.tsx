import { getSession } from '@/lib/auth'
import { DAYS_MAP } from '@/lib/workout-data'
import { getLastLogPerExercise, getPRPerExercise } from '@/lib/actions/get-logs'
import { WorkoutDayClient } from '@/components/WorkoutDayClient'
import type { UserId } from '@/types'

export default async function QuartaPage() {
  const session = await getSession()
  if (!session) return null

  const otherId: UserId = session.id === 'pv' ? 'gi' : 'pv'
  const otherName = otherId.toUpperCase()

  const [myLastLogs, otherLastLogs, myPRs, otherPRs] = await Promise.all([
    getLastLogPerExercise('quarta', session.id),
    getLastLogPerExercise('quarta', otherId),
    getPRPerExercise(session.id),
    getPRPerExercise(otherId),
  ])

  return (
    <WorkoutDayClient
      workoutDay={DAYS_MAP['quarta']}
      myLastLogs={myLastLogs}
      otherLastLogs={otherLastLogs}
      myPRs={myPRs}
      otherPRs={otherPRs}
      otherName={otherName}
    />
  )
}
