-- ============================================================================
-- Migración: RPCs de Perfil de Empresa
--   1. calcular_diff_perfil(p_empresa_id, p_perfil_nuevo) - read-only
--   2. actualizar_perfil_empresa(p_empresa_id, p_perfil) - aplica cambios
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper interno: construye el JSONB de perfil a partir de columnas de empresa
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION _perfil_a_jsonb(p_empresa_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'programas_activos',  COALESCE(programas_activos, '[]'::jsonb),
    'modalidad_immex',    modalidad_immex,
    'opera_ctm',          COALESCE(opera_ctm, false),
    'rol_ctm',            rol_ctm,
    'opera_submaquila',   COALESCE(opera_submaquila, false),
    'importa_sensibles',  COALESCE(importa_sensibles, false)
  )
  FROM empresas
  WHERE id = p_empresa_id;
$$;

-- ----------------------------------------------------------------------------
-- Helper interno: verifica que el caller sea owner de la organización
-- de la empresa indicada. Lanza excepción si no.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION _verificar_owner_empresa(p_empresa_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id UUID;
  v_es_owner BOOLEAN;
BEGIN
  SELECT organizacion_id INTO v_org_id FROM empresas WHERE id = p_empresa_id;
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Empresa no existe' USING ERRCODE = 'P0002';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM usuarios_organizacion
     WHERE user_id = auth.uid()
       AND organizacion_id = v_org_id
       AND rol = 'owner'
  ) INTO v_es_owner;

  IF NOT v_es_owner THEN
    RAISE EXCEPTION 'Solo el owner puede modificar el perfil de la empresa' USING ERRCODE = '42501';
  END IF;
END;
$$;

-- ============================================================================
-- RPC 1: calcular_diff_perfil
-- Devuelve { aAgregar:[], aDesactivar:[], sinCambios:[] } sin modificar nada.
-- ============================================================================
CREATE OR REPLACE FUNCTION calcular_diff_perfil(
  p_empresa_id   UUID,
  p_perfil_nuevo JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_org_id UUID;
  v_a_agregar    JSONB;
  v_a_desactivar JSONB;
  v_sin_cambios  JSONB;
BEGIN
  -- Verifica que el usuario tenga acceso a la empresa (cualquier rol puede leer)
  SELECT e.organizacion_id INTO v_org_id
    FROM empresas e
    JOIN usuarios_organizacion uo ON uo.organizacion_id = e.organizacion_id
   WHERE e.id = p_empresa_id AND uo.user_id = auth.uid()
   LIMIT 1;
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'No tienes acceso a esta empresa' USING ERRCODE = '42501';
  END IF;

  -- Conjunto de obligaciones del catálogo que aplican al perfil nuevo
  WITH catalogo_aplica AS (
    SELECT id, nombre, fundamento_legal, nivel_riesgo, periodicidad
      FROM obligaciones_catalogo
     WHERE activa = true
       AND (organizacion_id IS NULL OR organizacion_id = v_org_id)
       AND obligacion_aplica(condicion_activacion, p_perfil_nuevo)
  ),
  empresa_actual AS (
    SELECT oe.catalogo_id, oe.estado, oc.nombre, oc.fundamento_legal,
           oc.nivel_riesgo, oc.periodicidad
      FROM obligaciones_empresa oe
      JOIN obligaciones_catalogo oc ON oc.id = oe.catalogo_id
     WHERE oe.empresa_id = p_empresa_id
  )
  SELECT
    -- A AGREGAR: en catálogo aplicable, NO en empresa o estado=false
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', ca.id, 'nombre', ca.nombre,
        'fundamento_legal', ca.fundamento_legal,
        'nivel_riesgo', ca.nivel_riesgo,
        'periodicidad', ca.periodicidad
      ) ORDER BY ca.nivel_riesgo, ca.nombre)
      FROM catalogo_aplica ca
      LEFT JOIN empresa_actual ea ON ea.catalogo_id = ca.id
      WHERE ea.catalogo_id IS NULL OR ea.estado = false
    ), '[]'::jsonb),

    -- A DESACTIVAR: en empresa con estado=true pero ya no aplica
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', ea.catalogo_id, 'nombre', ea.nombre,
        'fundamento_legal', ea.fundamento_legal,
        'nivel_riesgo', ea.nivel_riesgo,
        'periodicidad', ea.periodicidad
      ) ORDER BY ea.nombre)
      FROM empresa_actual ea
      LEFT JOIN catalogo_aplica ca ON ca.id = ea.catalogo_id
      WHERE ea.estado = true AND ca.id IS NULL
    ), '[]'::jsonb),

    -- SIN CAMBIOS: aplican en ambos lados
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', ca.id, 'nombre', ca.nombre,
        'nivel_riesgo', ca.nivel_riesgo
      ) ORDER BY ca.nombre)
      FROM catalogo_aplica ca
      JOIN empresa_actual ea ON ea.catalogo_id = ca.id AND ea.estado = true
    ), '[]'::jsonb)
  INTO v_a_agregar, v_a_desactivar, v_sin_cambios;

  RETURN jsonb_build_object(
    'aAgregar',    v_a_agregar,
    'aDesactivar', v_a_desactivar,
    'sinCambios',  v_sin_cambios
  );
END;
$$;

REVOKE ALL ON FUNCTION calcular_diff_perfil(UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION calcular_diff_perfil(UUID, JSONB) TO authenticated;

-- ============================================================================
-- RPC 2: actualizar_perfil_empresa
-- Aplica el nuevo perfil + reasigna obligaciones + proyecta vencimientos.
-- ============================================================================
CREATE OR REPLACE FUNCTION actualizar_perfil_empresa(
  p_empresa_id UUID,
  p_perfil     JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id UUID;
  v_anio_actual INT := EXTRACT(YEAR FROM CURRENT_DATE)::INT;
  v_programas JSONB;
  v_modalidad TEXT;
  v_opera_ctm BOOLEAN;
  v_rol_ctm TEXT;
  v_submaquila BOOLEAN;
  v_sensibles BOOLEAN;
  v_agregadas INT := 0;
  v_desactivadas INT := 0;
  v_sin_cambios INT := 0;
BEGIN
  -- 1. Validar permisos (owner)
  PERFORM _verificar_owner_empresa(p_empresa_id);

  SELECT organizacion_id INTO v_org_id FROM empresas WHERE id = p_empresa_id;

  -- 2. Extraer campos del JSONB
  v_programas  := COALESCE(p_perfil->'programas_activos', '[]'::jsonb);
  v_modalidad  := NULLIF(p_perfil->>'modalidad_immex', '');
  v_opera_ctm  := COALESCE((p_perfil->>'opera_ctm')::BOOLEAN, false);
  v_rol_ctm    := CASE WHEN v_opera_ctm THEN NULLIF(p_perfil->>'rol_ctm','') ELSE NULL END;
  v_submaquila := COALESCE((p_perfil->>'opera_submaquila')::BOOLEAN, false);
  v_sensibles  := COALESCE((p_perfil->>'importa_sensibles')::BOOLEAN, false);

  -- 3. UPDATE empresa
  UPDATE empresas
     SET programas_activos  = v_programas,
         modalidad_immex    = v_modalidad,
         opera_ctm          = v_opera_ctm,
         rol_ctm            = v_rol_ctm,
         opera_submaquila   = v_submaquila,
         importa_sensibles  = v_sensibles,
         updated_at         = NOW()
   WHERE id = p_empresa_id;

  -- 4. Calcular el set de obligaciones aplicables
  WITH set_aplica AS (
    SELECT id
      FROM obligaciones_catalogo
     WHERE activa = true
       AND (organizacion_id IS NULL OR organizacion_id = v_org_id)
       AND obligacion_aplica(condicion_activacion, p_perfil)
  ),
  -- 5. INSERT nuevas (que aplican y no existen)
  insertadas AS (
    INSERT INTO obligaciones_empresa (empresa_id, catalogo_id, estado, activa_desde)
    SELECT p_empresa_id, sa.id, true, CURRENT_DATE
      FROM set_aplica sa
      LEFT JOIN obligaciones_empresa oe
        ON oe.empresa_id = p_empresa_id AND oe.catalogo_id = sa.id
     WHERE oe.id IS NULL
    RETURNING 1
  ),
  -- 5b. Reactivar las que ya existían pero estaban desactivadas
  reactivadas AS (
    UPDATE obligaciones_empresa oe
       SET estado = true,
           activa_hasta = NULL,
           motivo_inactiva = NULL,
           updated_at = NOW()
      FROM set_aplica sa
     WHERE oe.empresa_id = p_empresa_id
       AND oe.catalogo_id = sa.id
       AND oe.estado = false
    RETURNING 1
  ),
  -- 6. UPDATE estado=false en obligaciones que YA NO aplican
  desactivadas AS (
    UPDATE obligaciones_empresa
       SET estado = false,
           activa_hasta = CURRENT_DATE,
           motivo_inactiva = 'Perfil actualizado: ya no aplica',
           updated_at = NOW()
     WHERE empresa_id = p_empresa_id
       AND estado = true
       AND catalogo_id NOT IN (SELECT id FROM set_aplica)
    RETURNING 1
  )
  SELECT
    (SELECT COUNT(*) FROM insertadas) + (SELECT COUNT(*) FROM reactivadas),
    (SELECT COUNT(*) FROM desactivadas)
  INTO v_agregadas, v_desactivadas;

  v_sin_cambios := (
    SELECT COUNT(*)
      FROM obligaciones_empresa oe
     WHERE oe.empresa_id = p_empresa_id AND oe.estado = true
  ) - v_agregadas;

  -- 7. Reproyectar vencimientos del año actual y siguiente
  PERFORM proyectar_vencimientos(p_empresa_id, v_anio_actual);
  PERFORM proyectar_vencimientos(p_empresa_id, v_anio_actual + 1);

  RETURN jsonb_build_object(
    'agregadas',    v_agregadas,
    'desactivadas', v_desactivadas,
    'sin_cambios',  GREATEST(v_sin_cambios, 0)
  );
END;
$$;

REVOKE ALL ON FUNCTION actualizar_perfil_empresa(UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION actualizar_perfil_empresa(UUID, JSONB) TO authenticated;

COMMENT ON FUNCTION actualizar_perfil_empresa(UUID, JSONB) IS
'Actualiza el perfil de cumplimiento de una empresa y reasigna obligaciones automáticamente.
Solo el owner puede ejecutarla. Preserva historial: las obligaciones que ya no aplican
quedan con estado=false en lugar de eliminarse.';

COMMENT ON FUNCTION calcular_diff_perfil(UUID, JSONB) IS
'Calcula el diff entre el perfil actual y un perfil propuesto SIN modificar datos.
Devuelve listas de obligaciones a agregar, a desactivar y sin cambios.';
