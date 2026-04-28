-- ============================================================================
-- Migración: crear_organizacion_inicial v2 (con perfil de empresa)
-- Reemplaza la función para aceptar el perfil completo del wizard y sembrar
-- únicamente las obligaciones que aplican según condicion_activacion.
-- Mantiene compatibilidad con la firma anterior creando una NUEVA función
-- con firma extendida; la firma vieja se mantiene para no romper deployments
-- en transición.
-- ============================================================================

CREATE OR REPLACE FUNCTION crear_organizacion_inicial(
  p_nombre_cuenta   TEXT,
  p_rfc             TEXT,
  p_razon_social    TEXT,
  p_programas       JSONB,
  p_perfil          JSONB DEFAULT NULL
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
  v_proyectados INT;
  v_perfil_efectivo JSONB;
  v_modalidad   TEXT;
  v_opera_ctm   BOOLEAN;
  v_rol_ctm     TEXT;
  v_submaquila  BOOLEAN;
  v_sensibles   BOOLEAN;
BEGIN
  -- Usuario autenticado
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  IF EXISTS (SELECT 1 FROM usuarios_organizacion WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'El usuario ya tiene una organización';
  END IF;

  -- Construye perfil efectivo: si no viene p_perfil, usa solo programas
  IF p_perfil IS NOT NULL THEN
    v_perfil_efectivo := p_perfil;
  ELSE
    v_perfil_efectivo := jsonb_build_object(
      'programas_activos', p_programas,
      'modalidad_immex', NULL,
      'opera_ctm', false,
      'rol_ctm', NULL,
      'opera_submaquila', false,
      'importa_sensibles', false
    );
  END IF;

  v_modalidad  := NULLIF(v_perfil_efectivo->>'modalidad_immex','');
  v_opera_ctm  := COALESCE((v_perfil_efectivo->>'opera_ctm')::BOOLEAN, false);
  v_rol_ctm    := CASE WHEN v_opera_ctm THEN NULLIF(v_perfil_efectivo->>'rol_ctm','') ELSE NULL END;
  v_submaquila := COALESCE((v_perfil_efectivo->>'opera_submaquila')::BOOLEAN, false);
  v_sensibles  := COALESCE((v_perfil_efectivo->>'importa_sensibles')::BOOLEAN, false);

  -- 1. Organización
  INSERT INTO organizaciones (nombre_cuenta, plan_actual)
  VALUES (p_nombre_cuenta, 'gratis')
  RETURNING id INTO v_org_id;

  -- 2. Membership
  INSERT INTO usuarios_organizacion (user_id, organizacion_id, rol)
  VALUES (v_user_id, v_org_id, 'owner');

  -- 3. Empresa con perfil completo
  INSERT INTO empresas (
    organizacion_id, rfc, razon_social, programas_activos,
    modalidad_immex, opera_ctm, rol_ctm, opera_submaquila, importa_sensibles
  )
  VALUES (
    v_org_id, upper(trim(p_rfc)), trim(p_razon_social),
    COALESCE(v_perfil_efectivo->'programas_activos', p_programas),
    v_modalidad, v_opera_ctm, v_rol_ctm, v_submaquila, v_sensibles
  )
  RETURNING id INTO v_empresa_id;

  -- 4. Sembrar obligaciones aplicables según condicion_activacion.
  --    Si el catálogo aún no tiene condicion_activacion seteada (NULL),
  --    obligacion_aplica devuelve TRUE — se preserva el comportamiento previo.
  INSERT INTO obligaciones_empresa (empresa_id, catalogo_id, estado, activa_desde)
  SELECT v_empresa_id, oc.id, true, CURRENT_DATE
    FROM obligaciones_catalogo oc
   WHERE oc.activa = true
     AND oc.organizacion_id IS NULL
     AND obligacion_aplica(oc.condicion_activacion, v_perfil_efectivo)
  ON CONFLICT DO NOTHING;

  -- 5. Proyectar vencimientos
  SELECT proyectar_vencimientos(v_empresa_id, NULL) INTO v_proyectados;

  RETURN jsonb_build_object(
    'organizacion_id', v_org_id,
    'empresa_id',      v_empresa_id,
    'vencimientos_proyectados', v_proyectados
  );
END;
$$;

REVOKE ALL ON FUNCTION crear_organizacion_inicial(TEXT, TEXT, TEXT, JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION crear_organizacion_inicial(TEXT, TEXT, TEXT, JSONB, JSONB) TO authenticated;

COMMENT ON FUNCTION crear_organizacion_inicial(TEXT, TEXT, TEXT, JSONB, JSONB) IS
'Crea organización + usuario + empresa con perfil de cumplimiento.
Siembra automáticamente las obligaciones del catálogo que apliquen según el perfil.';
