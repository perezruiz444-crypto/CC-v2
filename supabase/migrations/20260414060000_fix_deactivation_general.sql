-- ============================================================
-- Fix: activar_programa_empresa — deactivation of a program
-- must NOT deactivate 'general' obligations that are still
-- required by another active program of the same company.
-- ============================================================

CREATE OR REPLACE FUNCTION activar_programa_empresa(
  p_empresa_id        UUID,
  p_programa          TEXT,
  p_fecha_autorizacion DATE,
  p_activar           BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id       UUID;
  v_cat_id        UUID;
  v_oe_id         UUID;
  v_proyectados   INT := 0;
  v_limpiados     INT := 0;
  v_current_programs JSONB;
  v_new_programs     JSONB;
  v_still_needed  BOOLEAN;
  v_other_prog    TEXT;
  -- Categorías por programa
  v_cat_map JSONB := '{
    "immex":    ["immex","general"],
    "prosec":   ["prosec","general"],
    "iva_ieps": ["iva_ieps","general"],
    "padron":   ["general"]
  }';
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'No autenticado'; END IF;

  -- Verificar permisos
  IF NOT EXISTS (
    SELECT 1 FROM empresas e
    JOIN usuarios_organizacion uo ON uo.organizacion_id = e.organizacion_id
    WHERE e.id = p_empresa_id
      AND uo.user_id = v_user_id
      AND uo.rol IN ('owner', 'manager')
  ) THEN
    RAISE EXCEPTION 'Sin permisos para modificar esta empresa';
  END IF;

  -- Programas actuales de la empresa
  SELECT programas_activos INTO v_current_programs
  FROM empresas WHERE id = p_empresa_id;

  IF p_activar THEN
    -- ── ACTIVAR ─────────────────────────────────────────────

    -- Agregar al array si no está ya
    IF NOT (v_current_programs ? p_programa) THEN
      v_new_programs := v_current_programs || jsonb_build_array(p_programa);
      UPDATE empresas SET programas_activos = v_new_programs WHERE id = p_empresa_id;
    END IF;

    -- Crear/reactivar obligaciones_empresa para las categorías del programa
    IF v_cat_map ? p_programa THEN
      FOR v_cat_id IN
        SELECT oc.id
        FROM obligaciones_catalogo oc
        WHERE oc.categoria = ANY(
          SELECT jsonb_array_elements_text(v_cat_map->p_programa)
        )
        AND oc.activa = true
      LOOP
        INSERT INTO obligaciones_empresa
          (empresa_id, catalogo_id, estado, activa_desde, fecha_autorizacion)
        VALUES
          (p_empresa_id, v_cat_id, true, CURRENT_DATE, p_fecha_autorizacion)
        ON CONFLICT (empresa_id, catalogo_id) DO UPDATE
          SET estado = true,
              activa_hasta = NULL,
              motivo_inactiva = NULL,
              fecha_autorizacion = COALESCE(EXCLUDED.fecha_autorizacion, obligaciones_empresa.fecha_autorizacion);
      END LOOP;
    END IF;

    -- Proyectar vencimientos año actual y siguiente
    v_proyectados := proyectar_vencimientos(p_empresa_id, EXTRACT(YEAR FROM CURRENT_DATE)::INT);
    v_proyectados := v_proyectados + proyectar_vencimientos(p_empresa_id, EXTRACT(YEAR FROM CURRENT_DATE)::INT + 1);

  ELSE
    -- ── DESACTIVAR ──────────────────────────────────────────

    -- Quitar del array de programas
    SELECT jsonb_agg(elem)
    INTO v_new_programs
    FROM jsonb_array_elements_text(v_current_programs) AS elem
    WHERE elem <> p_programa;

    UPDATE empresas
    SET programas_activos = COALESCE(v_new_programs, '[]'::JSONB)
    WHERE id = p_empresa_id;

    -- Desactivar sólo las obligaciones cuya categoría exclusiva pertenece
    -- a este programa y NO es compartida por otro programa aún activo.
    IF v_cat_map ? p_programa THEN
      FOR v_oe_id IN
        SELECT oe.id
        FROM obligaciones_empresa oe
        JOIN obligaciones_catalogo oc ON oc.id = oe.catalogo_id
        WHERE oe.empresa_id = p_empresa_id
          AND oe.estado = true
          AND oc.categoria = ANY(
            SELECT jsonb_array_elements_text(v_cat_map->p_programa)
          )
      LOOP
        -- Para cada obligación, verificar si algún otro programa activo
        -- también requiere su categoría. Si es así, no la desactivamos.
        SELECT oc2.categoria INTO v_other_prog
        FROM obligaciones_empresa oe2
        JOIN obligaciones_catalogo oc2 ON oc2.id = oe2.catalogo_id
        WHERE oe2.id = v_oe_id
        LIMIT 1;

        v_still_needed := EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(COALESCE(v_new_programs, '[]'::JSONB)) AS prog
          WHERE v_cat_map ? prog
            AND v_other_prog = ANY(
              SELECT jsonb_array_elements_text(v_cat_map->prog)
            )
        );

        IF NOT v_still_needed THEN
          UPDATE obligaciones_empresa
          SET estado = false, activa_hasta = CURRENT_DATE
          WHERE id = v_oe_id;

          v_limpiados := v_limpiados + limpiar_vencimientos_futuros(v_oe_id);
        END IF;
      END LOOP;
    END IF;

  END IF;

  RETURN jsonb_build_object(
    'programa',    p_programa,
    'activado',    p_activar,
    'proyectados', v_proyectados,
    'limpiados',   v_limpiados
  );
END;
$$;

REVOKE ALL ON FUNCTION activar_programa_empresa(UUID, TEXT, DATE, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION activar_programa_empresa(UUID, TEXT, DATE, BOOLEAN) TO authenticated;
