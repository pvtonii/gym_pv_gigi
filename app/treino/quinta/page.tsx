import { getSession } from '@/lib/auth'
import { DAYS_MAP } from '@/lib/workout-data'
import { WorkoutDayClient } from '@/components/WorkoutDayClient'

export default async function QuintaPage() {
  const session = await getSession()
  if (!session) return null
  return <WorkoutDayClient workoutDay={DAYS_MAP['quinta']} />
}
