-- Tabla de días inhábiles personalizados por organización
-- Solo disponible para planes de pago (equipo, agencia, enterprise)
-- El frontend controla el acceso por plan; la BD aplica RLS por organización

CREATE TABLE dias_inhabiles_org (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacion_id  UUID NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
  fecha            DATE NOT NULL,
  descripcion      TEXT,
  created_by       UUID REFERENCES auth.users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organizacion_id, fecha)
);

CREATE INDEX idx_dias_inhabiles_org_org_fecha ON dias_inhabiles_org(organizacion_id, fecha);

-- ─── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE dias_inhabiles_org ENABLE ROW LEVEL SECURITY;

-- Leer: cualquier miembro de la organización
CREATE POLICY "Leer dias_inhabiles_org propios"
  ON dias_inhabiles_org FOR SELECT
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios_organizacion
      WHERE user_id = auth.uid()
    )
  );

-- Insertar: solo owner o manager de la org
CREATE POLICY "Insertar dias_inhabiles_org (owner/manager)"
  ON dias_inhabiles_org FOR INSERT
  WITH CHECK (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios_organizacion
      WHERE user_id = auth.uid()
        AND rol IN ('owner', 'manager')
    )
  );

-- Eliminar: solo owner o manager de la org
CREATE POLICY "Eliminar dias_inhabiles_org (owner/manager)"
  ON dias_inhabiles_org FOR DELETE
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios_organizacion
      WHERE user_id = auth.uid()
        AND rol IN ('owner', 'manager')
    )
  );

-- ─── Función: siguiente_dia_habiles con días org ─────────────────────────────
-- Versión extendida que considera días globales + días de la organización
CREATE OR REPLACE FUNCTION siguiente_dia_habiles_org(
  p_fecha        DATE,
  p_org_id       UUID
)
RETURNS DATE
LANGUAGE plpgsql
STABLE
PARALLEL SAFE
AS $$
DECLARE
  v_resultado  DATE := p_fecha;
  v_iter       INT  := 0;
BEGIN
  LOOP
    v_iter := v_iter + 1;
    IF v_iter > 30 THEN RETURN v_resultado; END IF;

    -- Fin de semana
    IF EXTRACT(DOW FROM v_resultado)::INT IN (0, 6) THEN
      v_resultado := v_resultado + INTERVAL '1 day';
      CONTINUE;
    END IF;

    -- Festivo global
    IF EXISTS(SELECT 1 FROM dias_inhabiles_catalogo WHERE fecha = v_resultado LIMIT 1) THEN
      v_resultado := v_resultado + INTERVAL '1 day';
      CONTINUE;
    END IF;

    -- Festivo de la organización
    IF p_org_id IS NOT NULL AND EXISTS(
      SELECT 1 FROM dias_inhabiles_org
      WHERE fecha = v_resultado AND organizacion_id = p_org_id
      LIMIT 1
    ) THEN
      v_resultado := v_resultado + INTERVAL '1 day';
      CONTINUE;
    END IF;

    RETURN v_resultado;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION siguiente_dia_habiles_org(DATE, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION siguiente_dia_habiles_org(DATE, UUID) TO authenticated;
