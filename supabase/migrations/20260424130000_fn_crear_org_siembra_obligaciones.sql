-- ============================================================
-- Fix: crear_organizacion_inicial — siembra obligaciones_empresa
-- y proyecta vencimientos tras el onboarding.
--
-- El comentario en Onboarding.tsx asumía que esto ya ocurría,
-- pero la función original solo creaba org + usuario + empresa.
-- Esta migración actualiza la función para completar ese flujo.
-- ============================================================

CREATE OR REPLACE FUNCTION crear_organizacion_inicial(
  p_nombre_cuenta   TEXT,
  p_rfc             TEXT,
  p_razon_social    TEXT,
  p_programas       JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id      UUID;
  v_empresa_id  UUID;
  v_user_id     UUID;
  v_categorias  TEXT[];
  v_proyectados INT;
BEGIN
  -- Usuario autenticado
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  -- Verificar que el usuario no tenga ya una organización
  IF EXISTS (
    SELECT 1 FROM usuarios_organizacion WHERE user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'El usuario ya tiene una organización';
  END IF;

  -- 1. Crear organización
  INSERT INTO organizaciones (nombre_cuenta, plan_actual)
  VALUES (p_nombre_cuenta, 'gratis')
  RETURNING id INTO v_org_id;

  -- 2. Vincular usuario como owner
  INSERT INTO usuarios_organizacion (user_id, organizacion_id, rol)
  VALUES (v_user_id, v_org_id, 'owner');

  -- 3. Crear primera empresa
  INSERT INTO empresas (organizacion_id, rfc, razon_social, programas_activos)
  VALUES (v_org_id, upper(trim(p_rfc)), trim(p_razon_social), p_programas)
  RETURNING id INTO v_empresa_id;

  -- 4. Construir lista de categorías según programas seleccionados.
  --    'general' siempre se incluye; cada programa agrega su categoría.
  v_categorias := ARRAY['general'];

  IF p_programas ? 'immex' THEN
    v_categorias := v_categorias || ARRAY['immex'];
  END IF;
  IF p_programas ? 'prosec' THEN
    v_categorias := v_categorias || ARRAY['prosec'];
  END IF;
  IF p_programas ? 'iva_ieps' THEN
    v_categorias := v_categorias || ARRAY['iva_ieps'];
  END IF;
  IF p_programas ? 'padron' THEN
    v_categorias := v_categorias || ARRAY['padron'];
  END IF;

  -- 5. Sembrar obligaciones_empresa para todas las obligaciones activas
  --    del catálogo que pertenezcan a las categorías del cliente.
  --    ON CONFLICT DO NOTHING por si la función se llama más de una vez.
  INSERT INTO obligaciones_empresa (empresa_id, catalogo_id, estado, activa_desde)
  SELECT
    v_empresa_id,
    oc.id,
    true,
    CURRENT_DATE
  FROM obligaciones_catalogo oc
  WHERE oc.activa = true
    AND oc.categoria = ANY(v_categorias)
    AND oc.organizacion_id IS NULL   -- solo obligaciones del catálogo global
  ON CONFLICT DO NOTHING;

  -- 6. Proyectar vencimientos del año en curso
  SELECT proyectar_vencimientos(v_empresa_id, NULL) INTO v_proyectados;

  RETURN jsonb_build_object(
    'organizacion_id', v_org_id,
    'empresa_id',      v_empresa_id,
    'vencimientos_proyectados', v_proyectados
  );
END;
$$;

-- Mantener los mismos permisos
REVOKE ALL ON FUNCTION crear_organizacion_inicial(TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION crear_organizacion_inicial(TEXT, TEXT, TEXT, JSONB) TO authenticated;
