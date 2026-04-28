-- ============================================================================
-- Migración: Condición de Activación + obligacion_aplica()
-- Agrega un campo JSONB a obligaciones_catalogo que describe qué perfil de
-- empresa activa cada obligación. La función obligacion_aplica() evalúa los
-- filtros con AND lógico: NULL/ausente significa "el filtro no aplica".
-- ============================================================================

ALTER TABLE obligaciones_catalogo
  ADD COLUMN IF NOT EXISTS condicion_activacion JSONB,
  ADD COLUMN IF NOT EXISTS nivel_riesgo TEXT
    CHECK (nivel_riesgo IN ('CRITICO','ALTO','MEDIO','BAJO'));

CREATE INDEX IF NOT EXISTS idx_catalogo_nivel_riesgo
  ON obligaciones_catalogo(nivel_riesgo);

COMMENT ON COLUMN obligaciones_catalogo.nivel_riesgo IS
'Nivel de impacto regulatorio: CRITICO, ALTO, MEDIO, BAJO. Usado para priorizar alertas en dashboard.';

COMMENT ON COLUMN obligaciones_catalogo.condicion_activacion IS
'Filtro de aplicabilidad. Estructura: {
  "programas": ["IMMEX","PROSEC"],   -- al menos uno debe estar activo
  "modalidad": ["industrial"],        -- modalidad_immex debe estar en la lista
  "ctm_rol":   ["emisor","ambos"],    -- rol_ctm debe estar en la lista
  "submaquila": true,                 -- opera_submaquila debe ser true
  "sensibles":  true                  -- importa_sensibles debe ser true
}. Cada filtro es opcional; ausente = no se evalúa.';

-- ----------------------------------------------------------------------------
-- Función: obligacion_aplica(condicion, perfil) -> BOOLEAN
-- Evalúa si una obligación aplica al perfil de una empresa.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION obligacion_aplica(
  p_condicion JSONB,
  p_perfil    JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_programas_obl     JSONB;
  v_programas_emp     JSONB;
  v_modalidades       JSONB;
  v_modalidad_emp     TEXT;
  v_ctm_roles         JSONB;
  v_rol_emp           TEXT;
  v_submaquila_req    BOOLEAN;
  v_submaquila_emp    BOOLEAN;
  v_sensibles_req     BOOLEAN;
  v_sensibles_emp     BOOLEAN;
  v_match_programa    BOOLEAN := false;
BEGIN
  -- Sin condición = aplica a todos
  IF p_condicion IS NULL OR p_condicion = '{}'::jsonb THEN
    RETURN true;
  END IF;

  -- Filtro: programas (al menos uno del perfil debe estar en la lista)
  v_programas_obl := p_condicion->'programas';
  IF v_programas_obl IS NOT NULL AND jsonb_array_length(v_programas_obl) > 0 THEN
    v_programas_emp := COALESCE(p_perfil->'programas_activos', '[]'::jsonb);
    SELECT EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text(v_programas_obl) AS prog_obl
      WHERE prog_obl IN (
        SELECT jsonb_array_elements_text(v_programas_emp)
      )
    ) INTO v_match_programa;
    IF NOT v_match_programa THEN
      RETURN false;
    END IF;
  END IF;

  -- Filtro: modalidad IMMEX
  v_modalidades := p_condicion->'modalidad';
  IF v_modalidades IS NOT NULL AND jsonb_array_length(v_modalidades) > 0 THEN
    v_modalidad_emp := p_perfil->>'modalidad_immex';
    IF v_modalidad_emp IS NULL THEN
      RETURN false;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements_text(v_modalidades) AS m
      WHERE m = v_modalidad_emp
    ) THEN
      RETURN false;
    END IF;
  END IF;

  -- Filtro: rol CTM
  v_ctm_roles := p_condicion->'ctm_rol';
  IF v_ctm_roles IS NOT NULL AND jsonb_array_length(v_ctm_roles) > 0 THEN
    v_rol_emp := p_perfil->>'rol_ctm';
    IF v_rol_emp IS NULL THEN
      RETURN false;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements_text(v_ctm_roles) AS r
      WHERE r = v_rol_emp
    ) THEN
      RETURN false;
    END IF;
  END IF;

  -- Filtro: submaquila
  IF p_condicion ? 'submaquila' THEN
    v_submaquila_req := (p_condicion->>'submaquila')::BOOLEAN;
    v_submaquila_emp := COALESCE((p_perfil->>'opera_submaquila')::BOOLEAN, false);
    IF v_submaquila_req AND NOT v_submaquila_emp THEN
      RETURN false;
    END IF;
  END IF;

  -- Filtro: sensibles
  IF p_condicion ? 'sensibles' THEN
    v_sensibles_req := (p_condicion->>'sensibles')::BOOLEAN;
    v_sensibles_emp := COALESCE((p_perfil->>'importa_sensibles')::BOOLEAN, false);
    IF v_sensibles_req AND NOT v_sensibles_emp THEN
      RETURN false;
    END IF;
  END IF;

  RETURN true;
END;
$$;

COMMENT ON FUNCTION obligacion_aplica(JSONB, JSONB) IS
'Devuelve TRUE si la obligación con la condición dada aplica al perfil de empresa.
Cada filtro de la condición es opcional; ausencia significa que el filtro no se evalúa.';
