-- GYM Tracker — Schema Supabase
-- Rodar no SQL Editor do Supabase (https://supabase.com/dashboard)

-- ============================================================
-- TABELAS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id    TEXT PRIMARY KEY,   -- 'pv' | 'gi'
  name  TEXT NOT NULL,
  pin   TEXT NOT NULL        -- SHA-256 do PIN (sem salt para simplicidade)
);

CREATE TABLE IF NOT EXISTS workout_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day          TEXT        NOT NULL CHECK (day IN ('terca', 'quarta', 'quinta')),
  exercise_key TEXT        NOT NULL,
  weight       DECIMAL(5,1),
  reps         INTEGER,
  sets         INTEGER,
  logged_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workout_logs_lookup
  ON workout_logs (user_id, day, exercise_key, logged_at DESC);

CREATE TABLE IF NOT EXISTS body_weight (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight_kg  DECIMAL(4,1) NOT NULL,
  logged_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_body_weight_lookup
  ON body_weight (user_id, logged_at DESC);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_weight  ENABLE ROW LEVEL SECURITY;

-- Todos podem ler (PV vê treino da GI e vice-versa)
CREATE POLICY "read_all_logs"
  ON workout_logs FOR SELECT USING (true);

CREATE POLICY "read_all_bodyweight"
  ON body_weight FOR SELECT USING (true);

-- Apenas anon key sem restrição extra (app pessoal de 2 usuários)
-- A segurança de edição é feita no front: campos disabled para o outro usuário.
-- Para produção: usar Supabase Auth + JWT claim com user_id.
CREATE POLICY "insert_logs"
  ON workout_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "update_logs"
  ON workout_logs FOR UPDATE USING (true);

CREATE POLICY "delete_logs"
  ON workout_logs FOR DELETE USING (true);

CREATE POLICY "insert_bodyweight"
  ON body_weight FOR INSERT WITH CHECK (true);

CREATE POLICY "delete_bodyweight"
  ON body_weight FOR DELETE USING (true);

-- ============================================================
-- SEED — 2 usuários fixos
-- ============================================================
-- PIN padrão: PV = 1234  |  GI = 5678
-- SHA-256 calculado: echo -n "1234" | shasum -a 256
--
-- IMPORTANTE: Troque os hashes pelos PINs que vocês quiserem usar!
-- Para gerar: https://emn178.github.io/online-tools/sha256.html

INSERT INTO users (id, name, pin) VALUES
  ('pv', 'PV', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'),
  ('gi', 'GI', 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f')
ON CONFLICT (id) DO NOTHING;

-- PIN PV = 1234 → hash acima
-- PIN GI = 5678 → hash acima
