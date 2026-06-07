'use server'

import { login } from '@/lib/auth'
import type { UserId } from '@/types'

export async function loginAction(
  userId: UserId,
  pin: string
): Promise<{ success: boolean; error?: string }> {
  return login(userId, pin)
}
