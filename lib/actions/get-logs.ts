'use server'

import { createClient } from '@/lib/supabase/server'
import type { Day, UserId, WorkoutLog } from '@/types'

export async function getLogsForDay(
  day: Day,
  userId?: UserId
): Promise<WorkoutLog[]> {
  const supabase = await createClient()

  let query = supabase
    .from('workout_logs')
    .select('*')
    .eq('day', day)
    .order('logged_at', { ascending: false })

  if (userId) query = query.eq('user_id', userId)

  const { data, error } = await query
  if (error) return []
  return data as WorkoutLog[]
}

export async function getLastLogPerExercise(
  day: Day,
  userId: UserId
): Promise<Record<string, WorkoutLog>> {
  const logs = await getLogsForDay(day, userId)
  const result: Record<string, WorkoutLog> = {}

  for (const log of logs) {
    if (!result[log.exercise_key]) {
      result[log.exercise_key] = log
    }
  }

  return result
}

export async function getPRPerExercise(
  userId: UserId
): Promise<Record<string, number>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('workout_logs')
    .select('exercise_key, weight')
    .eq('user_id', userId)
    .not('weight', 'is', null)

  if (error || !data) return {}

  const prs: Record<string, number> = {}
  for (const row of data) {
    const current = prs[row.exercise_key] ?? 0
    if ((row.weight ?? 0) > current) prs[row.exercise_key] = row.weight ?? 0
  }

  return prs
}

export async function getAllLogs(
  exerciseKey?: string,
  userId?: UserId
): Promise<WorkoutLog[]> {
  const supabase = await createClient()

  let query = supabase
    .from('workout_logs')
    .select('*')
    .order('logged_at', { ascending: true })

  if (exerciseKey) query = query.eq('exercise_key', exerciseKey)
  if (userId) query = query.eq('user_id', userId)

  const { data, error } = await query
  if (error) return []
  return data as WorkoutLog[]
}
