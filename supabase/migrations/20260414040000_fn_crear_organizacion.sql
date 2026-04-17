-- ============================================================
-- Función: crear_organizacion_inicial
-- SECURITY DEFINER: bypasea RLS para el flujo de onboarding
-- Crea org + membership + empresa en una sola transacción
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
  v_org_id     UUID;
  v_empresa_id UUID;
  v_user_id    UUID;
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

  RETURN jsonb_build_object(
    'organizacion_id', v_org_id,
    'empresa_id',      v_empresa_id
  );
END;
$$;

-- Solo usuarios autenticados pueden llamarla
REVOKE ALL ON FUNCTION crear_organizacion_inicial(TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION crear_organizacion_inicial(TEXT, TEXT, TEXT, JSONB) TO authenticated;
