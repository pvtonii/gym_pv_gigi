-- GYM Tracker — Fix RLS (alerta Supabase rls_disabled_in_public, out/2026)
-- Rodar no SQL Editor DEPOIS do deploy que troca o server client pra service role.
--
-- O app acessa o banco só pelo servidor com a service role key (bypassa RLS).
-- Então: RLS ligado em tudo e NENHUMA policy → anon key não lê nem escreve nada.

ALTER TABLE users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_weight  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_all_logs"       ON workout_logs;
DROP POLICY IF EXISTS "insert_logs"         ON workout_logs;
DROP POLICY IF EXISTS "update_logs"         ON workout_logs;
DROP POLICY IF EXISTS "delete_logs"         ON workout_logs;
DROP POLICY IF EXISTS "read_all_bodyweight" ON body_weight;
DROP POLICY IF EXISTS "insert_bodyweight"   ON body_weight;
DROP POLICY IF EXISTS "delete_bodyweight"   ON body_weight;

-- Conferir: todas as tabelas do schema public devem ter rowsecurity = true
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
