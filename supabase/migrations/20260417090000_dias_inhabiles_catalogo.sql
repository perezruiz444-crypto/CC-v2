-- FASE 1: Tabla de Días Inhábiles (Festivos)
-- Catalogo centralizado de fechas que no son dias hábiles (fin de semana se maneja en función)

CREATE TABLE dias_inhabiles_catalogo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL UNIQUE,
  descripcion TEXT,
  aplica_sat BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_fecha_not_null CHECK (fecha IS NOT NULL)
);

-- Índice para búsqueda rápida por fecha
CREATE INDEX idx_dias_inhabiles_fecha ON dias_inhabiles_catalogo(fecha);

-- RLS: Tabla de datos públicos estáticos
ALTER TABLE dias_inhabiles_catalogo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leer dias inhabiles (publico)"
  ON dias_inhabiles_catalogo FOR SELECT
  USING (true);

-- Solo anónimo (servicio) puede insertar/actualizar/eliminar
CREATE POLICY "Insertar dias inhabiles (admin only)"
  ON dias_inhabiles_catalogo FOR INSERT
  WITH CHECK (false);  -- Bloqueado por defecto, permitir via function

CREATE POLICY "Actualizar dias inhabiles (admin only)"
  ON dias_inhabiles_catalogo FOR UPDATE
  USING (false);

CREATE POLICY "Eliminar dias inhabiles (admin only)"
  ON dias_inhabiles_catalogo FOR DELETE
  USING (false);

-- SEED DATA: Días inhábiles 2026 en México
INSERT INTO dias_inhabiles_catalogo (fecha, descripcion, aplica_sat)
VALUES
  ('2026-05-01', 'Día del Trabajo', true),
  ('2026-09-16', 'Día de Independencia', true),
  ('2026-11-02', 'Día de Muertos', true),
  ('2026-11-16', 'Aniversario de la Revolución Mexicana', true),
  ('2026-12-12', 'Día del Empleado Bancario', true),
  ('2026-12-24', 'Nochebuena', true),
  ('2026-12-25', 'Navidad', true),
  ('2026-12-31', 'Fin de Año', true)
ON CONFLICT DO NOTHING;
