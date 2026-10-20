import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service role: bypassa RLS. Só usar no servidor (Server Actions / route handlers).
// A anon key fica sem acesso nenhum — RLS ligado sem policies em todas as tabelas.
export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
