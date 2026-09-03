import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Upsert numa linha fixa — não cresce a tabela, confirma escrita no banco
  const { error } = await supabase
    .from('workout_logs')
    .upsert(
      {
        id: '00000000-0000-0000-0000-000000000001',
        user_id: 'pv',
        day: 'terca',
        exercise_key: '_keepalive',
        weight: null,
        logged_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, ts: new Date().toISOString() })
}
