-- ═══════════════════════════════════════════════════════════════════
-- SCHEMA — Dashboard Quadratín Morelos
-- Proyecto: uwcazgeemwspebmhntcm.supabase.co
-- Ejecutar en: Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. SEGUIDORES DIARIOS (Quadratín Morelos) ─────────────────────
-- Se llena cada día a las 7 AM via GitHub Actions + update_stats.py
CREATE TABLE IF NOT EXISTS daily_followers (
  id         bigserial PRIMARY KEY,
  date       date        NOT NULL UNIQUE,   -- una fila por día
  instagram  bigint,
  tiktok     bigint,
  facebook   bigint,
  twitter    bigint,
  youtube    bigint,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_daily_followers_date ON daily_followers(date);

-- ── 2. COMPETENCIA LOCAL (Medios de Morelos) ──────────────────────
-- Se llena cada lunes via GitHub Actions + update_competition.js
CREATE TABLE IF NOT EXISTS competition_local (
  id           bigserial PRIMARY KEY,
  fetched_date date        NOT NULL,
  name         text        NOT NULL,        -- 'Diario de Morelos', '24 Morelos', etc.
  facebook     bigint,
  instagram    bigint,
  tiktok       bigint,
  twitter      bigint,
  created_at   timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comp_local_date ON competition_local(fetched_date);
CREATE INDEX IF NOT EXISTS idx_comp_local_name ON competition_local(name);

-- ── 3. COMPETENCIA ESTADOS (Red Quadratín Nacional) ───────────────
-- Se llena cada lunes via GitHub Actions + update_competition.js
CREATE TABLE IF NOT EXISTS competition_estados (
  id           bigserial PRIMARY KEY,
  fetched_date date        NOT NULL,
  estado       text        NOT NULL,        -- 'Michoacán', 'CDMX', etc.
  facebook     bigint,
  instagram    bigint,
  tiktok       bigint,
  twitter      bigint,
  created_at   timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comp_estados_date ON competition_estados(fetched_date);
CREATE INDEX IF NOT EXISTS idx_comp_estados_name ON competition_estados(estado);

-- ── 4. ANÁLISIS IA (Generado por Claude API) ──────────────────────
-- Se llena cada día junto con los seguidores diarios
CREATE TABLE IF NOT EXISTS analysis_log (
  id         bigserial PRIMARY KEY,
  date       date        NOT NULL,
  type       text        NOT NULL,          -- 'redes' | 'competencia' | 'semanal'
  content    jsonb       NOT NULL,          -- objeto completo del análisis
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_analysis_date ON analysis_log(date);
CREATE INDEX IF NOT EXISTS idx_analysis_type ON analysis_log(type);

-- ── 5. CIERRES MENSUALES (Quadratín Morelos) ──────────────────────
-- Se llena automáticamente el último día de cada mes
CREATE TABLE IF NOT EXISTS monthly_closes (
  id         bigserial PRIMARY KEY,
  year       integer     NOT NULL,
  month      integer     NOT NULL,
  facebook   bigint,
  instagram  bigint,
  twitter    bigint,
  tiktok     bigint,
  youtube    bigint,
  created_at timestamptz DEFAULT now(),
  UNIQUE(year, month)
);

-- ── 6. TAREAS / DEPENDENCIAS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id           bigserial PRIMARY KEY,
  title        text        NOT NULL,
  status       text        NOT NULL DEFAULT 'pending',   -- 'pending' | 'completed'
  completed_at timestamptz,
  created_at   timestamptz DEFAULT now()
);

-- ── RLS: permitir acceso anon (clave pública del dashboard) ───────
ALTER TABLE daily_followers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_local   ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_closes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks               ENABLE ROW LEVEL SECURITY;

-- Políticas: lectura y escritura con anon key
DO $$ BEGIN
  -- daily_followers
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='daily_followers' AND policyname='anon_all') THEN
    CREATE POLICY anon_all ON daily_followers FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;
  -- competition_local
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='competition_local' AND policyname='anon_all') THEN
    CREATE POLICY anon_all ON competition_local FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;
  -- competition_estados
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='competition_estados' AND policyname='anon_all') THEN
    CREATE POLICY anon_all ON competition_estados FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;
  -- analysis_log
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='analysis_log' AND policyname='anon_all') THEN
    CREATE POLICY anon_all ON analysis_log FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;
  -- monthly_closes
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='monthly_closes' AND policyname='anon_all') THEN
    CREATE POLICY anon_all ON monthly_closes FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;
  -- tasks
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tasks' AND policyname='anon_all') THEN
    CREATE POLICY anon_all ON tasks FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── Verificar tablas creadas ───────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
