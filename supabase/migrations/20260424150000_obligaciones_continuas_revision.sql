-- Agregar campos para tracking de cumplimiento en obligaciones continuas
ALTER TABLE obligaciones_empresa
  ADD COLUMN IF NOT EXISTS ultima_revision    DATE,
  ADD COLUMN IF NOT EXISTS estado_revision    VARCHAR(20)
    DEFAULT 'sin_revisar'
    CHECK (estado_revision IN ('vigente', 'en_riesgo', 'incumplimiento', 'sin_revisar')),
  ADD COLUMN IF NOT EXISTS notas_revision     TEXT;

-- Índice para consultas de estado
CREATE INDEX IF NOT EXISTS idx_oe_estado_revision
  ON obligaciones_empresa(empresa_id, estado_revision)
  WHERE estado_revision IS NOT NULL;
