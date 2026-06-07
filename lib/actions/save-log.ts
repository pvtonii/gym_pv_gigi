'use server'

import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth'
import { z } from 'zod'
import type { Day } from '@/types'

const LogSchema = z.object({
  day: z.enum(['terca', 'quarta', 'quinta']),
  exercise_key: z.string().min(1),
  weight: z.number().positive().nullable(),
  reps: z.number().int().positive().nullable(),
  sets: z.number().int().positive().nullable(),
})

export async function saveLog(data: {
  day: Day
  exercise_key: string
  weight: number | null
  reps: number | null
  sets: number | null
}): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Não autenticado.' }

  const parsed = LogSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: 'Dados inválidos.' }

  const supabase = await createClient()

  const { error } = await supabase.from('workout_logs').insert({
    user_id: session.id,
    day: parsed.data.day,
    exercise_key: parsed.data.exercise_key,
    weight: parsed.data.weight,
    reps: parsed.data.reps,
    sets: parsed.data.sets,
    logged_at: new Date().toISOString(),
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}
