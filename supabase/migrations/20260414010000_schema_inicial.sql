-- ============================================================
-- Calendario Compliance — Schema Inicial
-- Migración: 20260414_001
-- Estructura: tablas primero, policies al final
-- ============================================================

-- ── Helper: updated_at automático ───────────────────────────
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ════════════════════════════════════════════════════════════
-- TABLAS
-- ════════════════════════════════════════════════════════════

-- ── 1. organizaciones ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizaciones (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_cuenta      TEXT NOT NULL,
  plan_actual        VARCHAR(20) NOT NULL DEFAULT 'gratis',
  stripe_customer_id TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE organizaciones ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_organizaciones_id ON organizaciones(id);
DROP TRIGGER IF EXISTS trg_updated_at_organizaciones ON organizaciones;
CREATE TRIGGER trg_updated_at_organizaciones
  BEFORE UPDATE ON organizaciones
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


-- ── 2. usuarios_organizacion ────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios_organizacion (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organizacion_id UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
  rol             VARCHAR(20) NOT NULL CHECK (rol IN ('owner', 'manager', 'viewer')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, organizacion_id)
);
ALTER TABLE usuarios_organizacion ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_usuarios_org_user_id         ON usuarios_organizacion(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_org_organizacion_id ON usuarios_organizacion(organizacion_id);


-- ── 3. empresas ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS empresas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacion_id   UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
  rfc               TEXT NOT NULL,
  razon_social      TEXT NOT NULL,
  programas_activos JSONB NOT NULL DEFAULT '[]',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organizacion_id, rfc)
);
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_empresas_organizacion_id ON empresas(organizacion_id);
DROP TRIGGER IF EXISTS trg_updated_at_empresas ON empresas;
CREATE TRIGGER trg_updated_at_empresas
  BEFORE UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


-- ── 4. obligaciones_catalogo ────────────────────────────────
CREATE TABLE IF NOT EXISTS obligaciones_catalogo (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre            TEXT NOT NULL,
  descripcion       TEXT,
  categoria         VARCHAR(50) NOT NULL CHECK (
    categoria IN ('immex', 'prosec', 'padron', 'iva_ieps', 'general')
  ),
  periodicidad      VARCHAR(30) CHECK (
    periodicidad IN ('mensual', 'bimestral', 'trimestral', 'anual', 'bianual', 'continua', 'unica')
  ),
  dia_vencimiento   INT CHECK (dia_vencimiento BETWEEN 1 AND 31),
  mes_vencimiento   INT CHECK (mes_vencimiento BETWEEN 1 AND 12),
  fundamento_legal  TEXT,
  url_fundamento    TEXT,
  notas_importantes TEXT,
  aplica_solo_si    TEXT,
  multa_minima_mxn  NUMERIC,
  multa_maxima_mxn  NUMERIC,
  activa            BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE obligaciones_catalogo ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_catalogo_categoria ON obligaciones_catalogo(categoria);
CREATE INDEX IF NOT EXISTS idx_catalogo_activa    ON obligaciones_catalogo(activa);
DROP TRIGGER IF EXISTS trg_updated_at_catalogo ON obligaciones_catalogo;
CREATE TRIGGER trg_updated_at_catalogo
  BEFORE UPDATE ON obligaciones_catalogo
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


-- ── 5. obligaciones_empresa ─────────────────────────────────
CREATE TABLE IF NOT EXISTS obligaciones_empresa (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  catalogo_id     UUID NOT NULL REFERENCES obligaciones_catalogo(id),
  estado          BOOLEAN NOT NULL DEFAULT true,
  activa_desde    DATE NOT NULL DEFAULT CURRENT_DATE,
  activa_hasta    DATE,
  motivo_inactiva TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(empresa_id, catalogo_id)
);
ALTER TABLE obligaciones_empresa ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_oblig_empresa_empresa_id  ON obligaciones_empresa(empresa_id);
CREATE INDEX IF NOT EXISTS idx_oblig_empresa_catalogo_id ON obligaciones_empresa(catalogo_id);
CREATE INDEX IF NOT EXISTS idx_oblig_empresa_estado      ON obligaciones_empresa(estado);
DROP TRIGGER IF EXISTS trg_updated_at_oblig_empresa ON obligaciones_empresa;
CREATE TRIGGER trg_updated_at_oblig_empresa
  BEFORE UPDATE ON obligaciones_empresa
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


-- ── 6. vencimientos_calendario ──────────────────────────────
CREATE TABLE IF NOT EXISTS vencimientos_calendario (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id           UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  obligacion_origen_id UUID NOT NULL REFERENCES obligaciones_empresa(id),
  titulo_instancia     TEXT NOT NULL,
  periodo_key          TEXT NOT NULL,
  fecha_limite         DATE NOT NULL,
  estado_cumplimiento  VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (
    estado_cumplimiento IN ('pendiente', 'completado', 'vencido', 'omitido', 'prorrogado')
  ),
  asignado_a           UUID REFERENCES auth.users(id),
  completado_por       UUID REFERENCES auth.users(id),
  completado_en        TIMESTAMPTZ,
  notas                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(obligacion_origen_id, periodo_key)
);
ALTER TABLE vencimientos_calendario ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_vencimientos_empresa_id   ON vencimientos_calendario(empresa_id);
CREATE INDEX IF NOT EXISTS idx_vencimientos_fecha_limite ON vencimientos_calendario(fecha_limite);
CREATE INDEX IF NOT EXISTS idx_vencimientos_estado       ON vencimientos_calendario(estado_cumplimiento);
CREATE INDEX IF NOT EXISTS idx_vencimientos_periodo_key  ON vencimientos_calendario(periodo_key);
DROP TRIGGER IF EXISTS trg_updated_at_vencimientos ON vencimientos_calendario;
CREATE TRIGGER trg_updated_at_vencimientos
  BEFORE UPDATE ON vencimientos_calendario
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


-- ── 7. vencimientos_excepciones ─────────────────────────────
CREATE TABLE IF NOT EXISTS vencimientos_excepciones (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vencimiento_id     UUID NOT NULL REFERENCES vencimientos_calendario(id) ON DELETE CASCADE,
  tipo               VARCHAR(20) NOT NULL CHECK (tipo IN ('omitido', 'prorrogado')),
  motivo             TEXT NOT NULL,
  nueva_fecha_limite DATE,
  creado_por         UUID NOT NULL REFERENCES auth.users(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE vencimientos_excepciones ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_excepciones_vencimiento_id ON vencimientos_excepciones(vencimiento_id);


-- ════════════════════════════════════════════════════════════
-- RLS POLICIES (todas al final, tablas ya existen)
-- ════════════════════════════════════════════════════════════

-- organizaciones
DROP POLICY IF EXISTS "organizaciones_select_own" ON organizaciones;
CREATE POLICY "organizaciones_select_own" ON organizaciones FOR SELECT
  USING (id IN (
    SELECT organizacion_id FROM usuarios_organizacion WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "organizaciones_insert_own" ON organizaciones;
CREATE POLICY "organizaciones_insert_own" ON organizaciones FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "organizaciones_update_own" ON organizaciones;
CREATE POLICY "organizaciones_update_own" ON organizaciones FOR UPDATE
  USING (id IN (
    SELECT organizacion_id FROM usuarios_organizacion WHERE user_id = auth.uid() AND rol = 'owner'
  ));

-- usuarios_organizacion
DROP POLICY IF EXISTS "usuarios_org_select" ON usuarios_organizacion;
CREATE POLICY "usuarios_org_select" ON usuarios_organizacion FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "usuarios_org_insert" ON usuarios_organizacion;
CREATE POLICY "usuarios_org_insert" ON usuarios_organizacion FOR INSERT
  WITH CHECK (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios_organizacion
      WHERE user_id = auth.uid() AND rol = 'owner'
    )
    OR user_id = auth.uid()
  );

-- empresas
DROP POLICY IF EXISTS "empresas_select_org" ON empresas;
CREATE POLICY "empresas_select_org" ON empresas FOR SELECT
  USING (organizacion_id IN (
    SELECT organizacion_id FROM usuarios_organizacion WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "empresas_insert_org" ON empresas;
CREATE POLICY "empresas_insert_org" ON empresas FOR INSERT
  WITH CHECK (organizacion_id IN (
    SELECT organizacion_id FROM usuarios_organizacion
    WHERE user_id = auth.uid() AND rol IN ('owner', 'manager')
  ));

DROP POLICY IF EXISTS "empresas_update_org" ON empresas;
CREATE POLICY "empresas_update_org" ON empresas FOR UPDATE
  USING (organizacion_id IN (
    SELECT organizacion_id FROM usuarios_organizacion
    WHERE user_id = auth.uid() AND rol IN ('owner', 'manager')
  ));

-- obligaciones_catalogo
DROP POLICY IF EXISTS "catalogo_select_authenticated" ON obligaciones_catalogo;
CREATE POLICY "catalogo_select_authenticated" ON obligaciones_catalogo FOR SELECT
  TO authenticated
  USING (activa = true);

-- obligaciones_empresa
DROP POLICY IF EXISTS "oblig_empresa_select" ON obligaciones_empresa;
CREATE POLICY "oblig_empresa_select" ON obligaciones_empresa FOR SELECT
  USING (empresa_id IN (
    SELECT e.id FROM empresas e
    JOIN usuarios_organizacion uo ON uo.organizacion_id = e.organizacion_id
    WHERE uo.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "oblig_empresa_insert" ON obligaciones_empresa;
CREATE POLICY "oblig_empresa_insert" ON obligaciones_empresa FOR INSERT
  WITH CHECK (empresa_id IN (
    SELECT e.id FROM empresas e
    JOIN usuarios_organizacion uo ON uo.organizacion_id = e.organizacion_id
    WHERE uo.user_id = auth.uid() AND uo.rol IN ('owner', 'manager')
  ));

DROP POLICY IF EXISTS "oblig_empresa_update" ON obligaciones_empresa;
CREATE POLICY "oblig_empresa_update" ON obligaciones_empresa FOR UPDATE
  USING (empresa_id IN (
    SELECT e.id FROM empresas e
    JOIN usuarios_organizacion uo ON uo.organizacion_id = e.organizacion_id
    WHERE uo.user_id = auth.uid() AND uo.rol IN ('owner', 'manager')
  ));

-- vencimientos_calendario
DROP POLICY IF EXISTS "vencimientos_select" ON vencimientos_calendario;
CREATE POLICY "vencimientos_select" ON vencimientos_calendario FOR SELECT
  USING (empresa_id IN (
    SELECT e.id FROM empresas e
    JOIN usuarios_organizacion uo ON uo.organizacion_id = e.organizacion_id
    WHERE uo.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "vencimientos_update" ON vencimientos_calendario;
CREATE POLICY "vencimientos_update" ON vencimientos_calendario FOR UPDATE
  USING (empresa_id IN (
    SELECT e.id FROM empresas e
    JOIN usuarios_organizacion uo ON uo.organizacion_id = e.organizacion_id
    WHERE uo.user_id = auth.uid() AND uo.rol IN ('owner', 'manager')
  ));

-- vencimientos_excepciones
DROP POLICY IF EXISTS "excepciones_select" ON vencimientos_excepciones;
CREATE POLICY "excepciones_select" ON vencimientos_excepciones FOR SELECT
  USING (vencimiento_id IN (
    SELECT vc.id FROM vencimientos_calendario vc
    JOIN empresas e ON e.id = vc.empresa_id
    JOIN usuarios_organizacion uo ON uo.organizacion_id = e.organizacion_id
    WHERE uo.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "excepciones_insert" ON vencimientos_excepciones;
CREATE POLICY "excepciones_insert" ON vencimientos_excepciones FOR INSERT
  WITH CHECK (
    creado_por = auth.uid()
    AND vencimiento_id IN (
      SELECT vc.id FROM vencimientos_calendario vc
      JOIN empresas e ON e.id = vc.empresa_id
      JOIN usuarios_organizacion uo ON uo.organizacion_id = e.organizacion_id
      WHERE uo.user_id = auth.uid() AND uo.rol IN ('owner', 'manager')
    )
  );
