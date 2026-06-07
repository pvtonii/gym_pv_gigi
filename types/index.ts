export type UserId = 'pv' | 'gi'

export type Day = 'terca' | 'quarta' | 'quinta'

export interface User {
  id: UserId
  name: string
}

export interface Exercise {
  key: string
  name: string
  muscle: string
  description: string
  imageUrl: string
  tips?: string
}

export interface WorkoutDay {
  day: Day
  label: string
  split: string
  muscles: string
  exercises: Exercise[]
}

export interface WorkoutLog {
  id: string
  user_id: UserId
  day: Day
  exercise_key: string
  weight: number | null
  reps: number | null
  sets: number | null
  logged_at: string
}

export interface BodyWeight {
  id: string
  user_id: UserId
  weight_kg: number
  logged_at: string
}

export interface SessionUser {
  id: UserId
  name: string
  expiresAt: number
}
