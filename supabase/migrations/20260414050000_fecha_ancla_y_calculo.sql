-- ============================================================
-- Calendario Compliance — Fecha Ancla y Motor de Cálculo
-- Migración: 20260414_005
--
-- Cambios:
-- 1. obligaciones_catalogo: agrega tipo_calculo, meses_sumar_al_ancla,
--    dias_restar_aviso, dia_vencimiento y mes_vencimiento con datos
-- 2. obligaciones_empresa: agrega fecha_autorizacion (fecha ancla)
-- 3. Función proyectar_vencimientos(p_empresa_id, p_anio)
-- 4. Función limpiar_vencimientos_futuros(p_obligacion_empresa_id)
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- PARTE 1: Columnas nuevas en obligaciones_catalogo
-- ════════════════════════════════════════════════════════════

ALTER TABLE obligaciones_catalogo
  ADD COLUMN IF NOT EXISTS tipo_calculo       VARCHAR(20)  NOT NULL DEFAULT 'estatico'
    CHECK (tipo_calculo IN ('estatico', 'dinamico_ancla')),
  ADD COLUMN IF NOT EXISTS meses_sumar_al_ancla INT,
  ADD COLUMN IF NOT EXISTS dias_restar_aviso    INT;

-- dia_vencimiento y mes_vencimiento ya existen en el schema inicial,
-- sólo actualizamos los valores con un UPDATE masivo abajo.


-- ════════════════════════════════════════════════════════════
-- PARTE 2: Columna fecha_autorizacion en obligaciones_empresa
-- ════════════════════════════════════════════════════════════

ALTER TABLE obligaciones_empresa
  ADD COLUMN IF NOT EXISTS fecha_autorizacion DATE;


-- ════════════════════════════════════════════════════════════
-- PARTE 3: Poblar dia_vencimiento / mes_vencimiento en catálogo
--          para las obligaciones estáticas con fecha conocida
-- ════════════════════════════════════════════════════════════

-- General — Opinión positiva SAT: mensual día 21
UPDATE obligaciones_catalogo SET dia_vencimiento = 21
  WHERE nombre = 'Opinión positiva (SAT)';

-- General — Art 69 CFF: mensual día 21-23 → usamos 21
UPDATE obligaciones_catalogo SET dia_vencimiento = 21
  WHERE nombre = 'Artículo 69 CFF — No estar en listados SAT';

-- General — Buzón tributario: mensual, cada viernes → usamos día 7 como proxy semanal
UPDATE obligaciones_catalogo SET dia_vencimiento = 7
  WHERE nombre = 'Buzón tributario — Medios de contacto actualizados';

-- General — Reporte SENER: anual, 10 días hábiles tras cierre → 15 enero
UPDATE obligaciones_catalogo SET dia_vencimiento = 15, mes_vencimiento = 1
  WHERE nombre = 'Reporte SENER';

-- IMMEX — Ventas anuales al exterior: marzo
UPDATE obligaciones_catalogo SET dia_vencimiento = 31, mes_vencimiento = 3
  WHERE nombre = 'IMMEX — Ventas anuales al exterior';

-- IMMEX — Requisitos de obtención y reporte anual: abril
UPDATE obligaciones_catalogo SET dia_vencimiento = 30, mes_vencimiento = 4
  WHERE nombre = 'IMMEX — Requisitos de obtención y reporte anual';

-- IMMEX — Reporte anual de ventas y exportaciones: 31 mayo (límite)
UPDATE obligaciones_catalogo SET dia_vencimiento = 31, mes_vencimiento = 5
  WHERE nombre = 'IMMEX — Reporte anual de ventas y exportaciones';

-- IMMEX — Información estadística INEGI (mensual): día 20
UPDATE obligaciones_catalogo SET dia_vencimiento = 20
  WHERE nombre = 'IMMEX — Información estadística INEGI';

-- IMMEX — Constancia Autopartes Apartado A: día 15 de cada mes
UPDATE obligaciones_catalogo SET dia_vencimiento = 15
  WHERE nombre = 'IMMEX — Constancia de transferencia Autopartes (Apartado A)';

-- IMMEX — Constancia Autopartes Apartado C: día 28 (max 60 días, proxy)
UPDATE obligaciones_catalogo SET dia_vencimiento = 28
  WHERE nombre = 'IMMEX — Constancia de transferencia Autopartes (Apartado C)';

-- IMMEX — Expedición constancias Automotriz (C3): último día del mes → 28
UPDATE obligaciones_catalogo SET dia_vencimiento = 28
  WHERE nombre = 'IMMEX — Expedición constancias Automotriz (C3)';

-- IMMEX — Informe anual inventarios Automotriz: marzo
UPDATE obligaciones_catalogo SET dia_vencimiento = 31, mes_vencimiento = 3
  WHERE nombre = 'IMMEX — Informe anual inventarios Automotriz';

-- IMMEX — Ajuste anual de inventarios (Autopartes): mayo último día hábil
UPDATE obligaciones_catalogo SET dia_vencimiento = 31, mes_vencimiento = 5
  WHERE nombre = 'IMMEX — Ajuste anual de inventarios (Autopartes)';

-- IMMEX — Registros automatizados Autopartes: mensual día 28
UPDATE obligaciones_catalogo SET dia_vencimiento = 28
  WHERE nombre = 'IMMEX — Registros automatizados Autopartes';

-- IMMEX — Registros Automotriz por empresa de autopartes: mensual día 28
UPDATE obligaciones_catalogo SET dia_vencimiento = 28
  WHERE nombre = 'IMMEX — Registros Automotriz por empresa de autopartes';

-- PROSEC — Reporte anual de operaciones: 30 de abril
UPDATE obligaciones_catalogo SET dia_vencimiento = 30, mes_vencimiento = 4
  WHERE nombre = 'PROSEC — Reporte anual de operaciones';

-- IVA/IEPS — Reportes mensuales de modificaciones: día 17
UPDATE obligaciones_catalogo SET dia_vencimiento = 17
  WHERE nombre = 'CERTIVA — Reportes mensuales de modificaciones';

-- IVA/IEPS — Pago cuotas IMSS: día 17
UPDATE obligaciones_catalogo SET dia_vencimiento = 17
  WHERE nombre = 'CERTIVA — Pago de cuotas IMSS';

-- IVA/IEPS — Transmisión Anexo 30: mensual día 30
UPDATE obligaciones_catalogo SET dia_vencimiento = 30
  WHERE nombre = 'CERTIVA — Transmisión Anexo 30 (Descargos)';

-- Renovación Certificación IVA/IEPS: dinámica — 1 año antes del vencimiento
-- La fecha ancla es la fecha de autorización original
UPDATE obligaciones_catalogo SET
  tipo_calculo = 'dinamico_ancla',
  meses_sumar_al_ancla = 12,
  dias_restar_aviso = 60
  WHERE nombre ILIKE '%renovaci%certificaci%'
     OR (nombre ILIKE '%certiva%' AND periodicidad = 'anual');

-- Fallback para anuales sin mes_vencimiento: asignar mayo (mes típico de reportes)
UPDATE obligaciones_catalogo
SET mes_vencimiento = 5
WHERE periodicidad = 'anual'
  AND mes_vencimiento IS NULL
  AND tipo_calculo = 'estatico';

-- Fallback para mensuales sin dia_vencimiento: día 17 (fecha SAT por defecto)
UPDATE obligaciones_catalogo
SET dia_vencimiento = 17
WHERE periodicidad IN ('mensual', 'bimestral', 'trimestral')
  AND dia_vencimiento IS NULL
  AND tipo_calculo = 'estatico';


-- ════════════════════════════════════════════════════════════
-- PARTE 4: Función limpiar_vencimientos_futuros
-- Elimina instancias futuras cuando se desactiva un programa
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION limpiar_vencimientos_futuros(
  p_obligacion_empresa_id UUID
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INT;
BEGIN
  DELETE FROM vencimientos_calendario
  WHERE obligacion_origen_id = p_obligacion_empresa_id
    AND fecha_limite > CURRENT_DATE
    AND estado_cumplimiento = 'pendiente';

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION limpiar_vencimientos_futuros(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION limpiar_vencimientos_futuros(UUID) TO authenticated;


-- ════════════════════════════════════════════════════════════
-- PARTE 5: Función proyectar_vencimientos
-- Motor matemático principal — Escenario A (estático) y B (ancla)
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION proyectar_vencimientos(
  p_empresa_id UUID,
  p_anio       INT DEFAULT NULL   -- NULL = año en curso
)
RETURNS INT   -- registros insertados
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_anio          INT;
  v_inserted      INT := 0;
  v_count         INT;
  rec             RECORD;
  v_fecha         DATE;
  v_periodo_key   TEXT;
  v_titulo        TEXT;
  v_mes           INT;
BEGIN
  -- Año de proyección
  v_anio := COALESCE(p_anio, EXTRACT(YEAR FROM CURRENT_DATE)::INT);

  -- Iterar sobre todas las obligaciones activas de la empresa
  -- que tengan al menos dia_vencimiento definido o sean dinámicas
  FOR rec IN
    SELECT
      oe.id                   AS oe_id,
      oe.fecha_autorizacion   AS ancla,
      oc.nombre,
      oc.periodicidad,
      oc.tipo_calculo,
      oc.dia_vencimiento      AS dia,
      oc.mes_vencimiento      AS mes,
      oc.meses_sumar_al_ancla AS meses_ancla,
      oc.dias_restar_aviso    AS dias_aviso
    FROM obligaciones_empresa oe
    JOIN obligaciones_catalogo oc ON oc.id = oe.catalogo_id
    WHERE oe.empresa_id = p_empresa_id
      AND oe.estado = true
      AND oc.activa = true
      AND oc.periodicidad NOT IN ('continua', 'unica')
  LOOP

    -- ── ESCENARIO B: Dinámico basado en fecha ancla ──────────
    IF rec.tipo_calculo = 'dinamico_ancla' THEN
      IF rec.ancla IS NULL OR rec.meses_ancla IS NULL THEN
        CONTINUE;  -- No se puede proyectar sin ancla
      END IF;

      -- Sumar meses al ancla hasta encontrar una fecha en el año objetivo
      -- (puede haber renovaciones cada 12, 24, 36 meses)
      DECLARE
        v_base DATE := rec.ancla;
        v_iter INT  := rec.meses_ancla;
      BEGIN
        LOOP
          v_fecha := v_base + (v_iter || ' months')::INTERVAL;
          EXIT WHEN EXTRACT(YEAR FROM v_fecha)::INT > v_anio;

          IF EXTRACT(YEAR FROM v_fecha)::INT = v_anio THEN
            -- Restar días de aviso si aplica
            IF rec.dias_aviso IS NOT NULL THEN
              v_fecha := v_fecha - (rec.dias_aviso || ' days')::INTERVAL;
            END IF;

            v_periodo_key := rec.oe_id || '_' || to_char(v_fecha, 'YYYY-MM');
            v_titulo      := rec.nombre || ' — ' || to_char(v_fecha, 'Mon YYYY');

            INSERT INTO vencimientos_calendario
              (empresa_id, obligacion_origen_id, titulo_instancia, periodo_key, fecha_limite, estado_cumplimiento)
            VALUES
              (p_empresa_id, rec.oe_id, v_titulo, v_periodo_key, v_fecha, 'pendiente')
            ON CONFLICT (obligacion_origen_id, periodo_key) DO NOTHING;

            GET DIAGNOSTICS v_count = ROW_COUNT;
            v_inserted := v_inserted + v_count;
          END IF;

          v_iter := v_iter + rec.meses_ancla;
        END LOOP;
      END;

      CONTINUE;
    END IF;

    -- ── ESCENARIO A: Estático — fechas fijas del catálogo ────

    IF rec.dia IS NULL THEN CONTINUE; END IF;

    CASE rec.periodicidad

      -- MENSUAL: un vencimiento por mes
      WHEN 'mensual' THEN
        FOR v_mes IN 1..12 LOOP
          BEGIN
            v_fecha := make_date(v_anio, v_mes, LEAST(rec.dia, (DATE_TRUNC('MONTH', make_date(v_anio, v_mes, 1)) + INTERVAL '1 month - 1 day')::DATE - (DATE_TRUNC('MONTH', make_date(v_anio, v_mes, 1)))::DATE + 1)::INT);
          EXCEPTION WHEN OTHERS THEN
            -- Día inválido para el mes (ej. 31 en febrero): usar último día del mes
            v_fecha := (DATE_TRUNC('MONTH', make_date(v_anio, v_mes, 1)) + INTERVAL '1 month - 1 day')::DATE;
          END;
          v_periodo_key := rec.oe_id || '_' || to_char(v_fecha, 'YYYY-MM');
          v_titulo      := rec.nombre || ' — ' || to_char(v_fecha, 'Mon YYYY');
          INSERT INTO vencimientos_calendario
            (empresa_id, obligacion_origen_id, titulo_instancia, periodo_key, fecha_limite, estado_cumplimiento)
          VALUES
            (p_empresa_id, rec.oe_id, v_titulo, v_periodo_key, v_fecha, 'pendiente')
          ON CONFLICT (obligacion_origen_id, periodo_key) DO NOTHING;
          GET DIAGNOSTICS v_count = ROW_COUNT;
          v_inserted := v_inserted + v_count;
        END LOOP;

      -- BIMESTRAL: meses pares (2,4,6,8,10,12)
      WHEN 'bimestral' THEN
        FOREACH v_mes IN ARRAY ARRAY[2,4,6,8,10,12] LOOP
          BEGIN
            v_fecha := make_date(v_anio, v_mes, rec.dia);
          EXCEPTION WHEN OTHERS THEN
            v_fecha := (DATE_TRUNC('MONTH', make_date(v_anio, v_mes, 1)) + INTERVAL '1 month - 1 day')::DATE;
          END;
          v_periodo_key := rec.oe_id || '_' || to_char(v_fecha, 'YYYY-MM');
          v_titulo      := rec.nombre || ' — ' || to_char(v_fecha, 'Mon YYYY');
          INSERT INTO vencimientos_calendario
            (empresa_id, obligacion_origen_id, titulo_instancia, periodo_key, fecha_limite, estado_cumplimiento)
          VALUES
            (p_empresa_id, rec.oe_id, v_titulo, v_periodo_key, v_fecha, 'pendiente')
          ON CONFLICT (obligacion_origen_id, periodo_key) DO NOTHING;
          GET DIAGNOSTICS v_count = ROW_COUNT;
          v_inserted := v_inserted + v_count;
        END LOOP;

      -- TRIMESTRAL: meses 3,6,9,12
      WHEN 'trimestral' THEN
        FOREACH v_mes IN ARRAY ARRAY[3,6,9,12] LOOP
          BEGIN
            v_fecha := make_date(v_anio, v_mes, rec.dia);
          EXCEPTION WHEN OTHERS THEN
            v_fecha := (DATE_TRUNC('MONTH', make_date(v_anio, v_mes, 1)) + INTERVAL '1 month - 1 day')::DATE;
          END;
          v_periodo_key := rec.oe_id || '_' || to_char(v_fecha, 'YYYY-MM');
          v_titulo      := rec.nombre || ' — ' || to_char(v_fecha, 'Mon YYYY');
          INSERT INTO vencimientos_calendario
            (empresa_id, obligacion_origen_id, titulo_instancia, periodo_key, fecha_limite, estado_cumplimiento)
          VALUES
            (p_empresa_id, rec.oe_id, v_titulo, v_periodo_key, v_fecha, 'pendiente')
          ON CONFLICT (obligacion_origen_id, periodo_key) DO NOTHING;
          GET DIAGNOSTICS v_count = ROW_COUNT;
          v_inserted := v_inserted + v_count;
        END LOOP;

      -- ANUAL: usa mes del catálogo, o mayo como fallback
      WHEN 'anual' THEN
        v_mes := COALESCE(rec.mes, 5);
        BEGIN
          v_fecha := make_date(v_anio, v_mes, rec.dia);
        EXCEPTION WHEN OTHERS THEN
          v_fecha := (DATE_TRUNC('MONTH', make_date(v_anio, v_mes, 1)) + INTERVAL '1 month - 1 day')::DATE;
        END;
        v_periodo_key := rec.oe_id || '_' || to_char(v_fecha, 'YYYY');
        v_titulo      := rec.nombre || ' — ' || to_char(v_fecha, 'YYYY');
        INSERT INTO vencimientos_calendario
          (empresa_id, obligacion_origen_id, titulo_instancia, periodo_key, fecha_limite, estado_cumplimiento)
        VALUES
          (p_empresa_id, rec.oe_id, v_titulo, v_periodo_key, v_fecha, 'pendiente')
        ON CONFLICT (obligacion_origen_id, periodo_key) DO NOTHING;
        GET DIAGNOSTICS v_count = ROW_COUNT;
        v_inserted := v_inserted + v_count;

      -- BIANUAL: enero y julio
      WHEN 'bianual' THEN
        FOREACH v_mes IN ARRAY ARRAY[1,7] LOOP
          BEGIN
            v_fecha := make_date(v_anio, v_mes, rec.dia);
          EXCEPTION WHEN OTHERS THEN
            v_fecha := (DATE_TRUNC('MONTH', make_date(v_anio, v_mes, 1)) + INTERVAL '1 month - 1 day')::DATE;
          END;
          v_periodo_key := rec.oe_id || '_' || to_char(v_fecha, 'YYYY-MM');
          v_titulo      := rec.nombre || ' — ' || to_char(v_fecha, 'Mon YYYY');
          INSERT INTO vencimientos_calendario
            (empresa_id, obligacion_origen_id, titulo_instancia, periodo_key, fecha_limite, estado_cumplimiento)
          VALUES
            (p_empresa_id, rec.oe_id, v_titulo, v_periodo_key, v_fecha, 'pendiente')
          ON CONFLICT (obligacion_origen_id, periodo_key) DO NOTHING;
          GET DIAGNOSTICS v_count = ROW_COUNT;
          v_inserted := v_inserted + v_count;
        END LOOP;

      ELSE
        -- continua / unica: no generan instancias de calendario
        NULL;
    END CASE;

  END LOOP;

  RETURN v_inserted;
END;
$$;

REVOKE ALL ON FUNCTION proyectar_vencimientos(UUID, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION proyectar_vencimientos(UUID, INT) TO authenticated;


-- ════════════════════════════════════════════════════════════
-- PARTE 6: Actualizar crear_organizacion_inicial
-- Llama a proyectar_vencimientos tras crear la empresa
-- ════════════════════════════════════════════════════════════

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
  v_programa   TEXT;
  v_cat_ids    UUID[];
  v_cat_id     UUID;
  v_proyectados INT;
  v_total_proyectados INT := 0;
  -- Mapa de programa → categorías del catálogo
  v_cat_map    JSONB := '{
    "immex":    ["immex","general"],
    "prosec":   ["prosec","general"],
    "iva_ieps": ["iva_ieps","general"],
    "padron":   ["general"]
  }';
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  IF EXISTS (SELECT 1 FROM usuarios_organizacion WHERE user_id = v_user_id) THEN
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

  -- 4. Crear obligaciones_empresa para cada programa activo
  FOR v_programa IN SELECT jsonb_array_elements_text(p_programas)
  LOOP
    -- Obtener categorías asociadas al programa
    IF v_cat_map ? v_programa THEN
      FOR v_cat_id IN
        SELECT oc.id
        FROM obligaciones_catalogo oc
        WHERE oc.categoria = ANY(
          SELECT jsonb_array_elements_text(v_cat_map->v_programa)
        )
        AND oc.activa = true
      LOOP
        INSERT INTO obligaciones_empresa (empresa_id, catalogo_id, estado, activa_desde)
        VALUES (v_empresa_id, v_cat_id, true, CURRENT_DATE)
        ON CONFLICT (empresa_id, catalogo_id) DO NOTHING;
      END LOOP;
    END IF;
  END LOOP;

  -- 5. Proyectar vencimientos del año en curso
  v_proyectados := proyectar_vencimientos(v_empresa_id, EXTRACT(YEAR FROM CURRENT_DATE)::INT);
  v_total_proyectados := v_proyectados;

  RETURN jsonb_build_object(
    'organizacion_id',  v_org_id,
    'empresa_id',       v_empresa_id,
    'vencimientos_proyectados', v_total_proyectados
  );
END;
$$;

REVOKE ALL ON FUNCTION crear_organizacion_inicial(TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION crear_organizacion_inicial(TEXT, TEXT, TEXT, JSONB) TO authenticated;


-- ════════════════════════════════════════════════════════════
-- PARTE 7: Función activar_programa_empresa
-- Activa un programa, crea sus obligaciones_empresa con ancla,
-- proyecta vencimientos y limpia si se desactiva
-- ════════════════════════════════════════════════════════════

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
  v_user_id    UUID;
  v_cat_id     UUID;
  v_oe_id      UUID;
  v_proyectados INT := 0;
  v_limpiados  INT := 0;
  v_current_programs JSONB;
  v_new_programs     JSONB;
  v_cat_map    JSONB := '{
    "immex":    ["immex","general"],
    "prosec":   ["prosec","general"],
    "iva_ieps": ["iva_ieps","general"],
    "padron":   ["general"]
  }';
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'No autenticado'; END IF;

  -- Verificar que el usuario pertenece a la empresa (owner o manager)
  IF NOT EXISTS (
    SELECT 1 FROM empresas e
    JOIN usuarios_organizacion uo ON uo.organizacion_id = e.organizacion_id
    WHERE e.id = p_empresa_id
      AND uo.user_id = v_user_id
      AND uo.rol IN ('owner', 'manager')
  ) THEN
    RAISE EXCEPTION 'Sin permisos para modificar esta empresa';
  END IF;

  -- Obtener programas actuales de la empresa
  SELECT programas_activos INTO v_current_programs
  FROM empresas WHERE id = p_empresa_id;

  IF p_activar THEN
    -- ── ACTIVAR PROGRAMA ────────────────────────────────────

    -- Actualizar array de programas
    IF NOT (v_current_programs ? p_programa) THEN
      v_new_programs := v_current_programs || jsonb_build_array(p_programa);
      UPDATE empresas SET programas_activos = v_new_programs WHERE id = p_empresa_id;
    END IF;

    -- Crear/actualizar obligaciones_empresa para las categorías del programa
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
              fecha_autorizacion = EXCLUDED.fecha_autorizacion;
      END LOOP;
    END IF;

    -- Proyectar vencimientos del año actual y siguiente
    v_proyectados := proyectar_vencimientos(p_empresa_id, EXTRACT(YEAR FROM CURRENT_DATE)::INT);
    v_proyectados := v_proyectados + proyectar_vencimientos(p_empresa_id, EXTRACT(YEAR FROM CURRENT_DATE)::INT + 1);

  ELSE
    -- ── DESACTIVAR PROGRAMA ─────────────────────────────────

    -- Quitar del array de programas
    SELECT jsonb_agg(elem)
    INTO v_new_programs
    FROM jsonb_array_elements_text(v_current_programs) AS elem
    WHERE elem <> p_programa;

    UPDATE empresas
    SET programas_activos = COALESCE(v_new_programs, '[]'::JSONB)
    WHERE id = p_empresa_id;

    -- Marcar obligaciones_empresa del programa como inactivas
    -- y limpiar vencimientos futuros pendientes
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
        UPDATE obligaciones_empresa
        SET estado = false, activa_hasta = CURRENT_DATE
        WHERE id = v_oe_id;

        v_limpiados := v_limpiados + limpiar_vencimientos_futuros(v_oe_id);
      END LOOP;
    END IF;

  END IF;

  RETURN jsonb_build_object(
    'programa',      p_programa,
    'activado',      p_activar,
    'proyectados',   v_proyectados,
    'limpiados',     v_limpiados
  );
END;
$$;

REVOKE ALL ON FUNCTION activar_programa_empresa(UUID, TEXT, DATE, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION activar_programa_empresa(UUID, TEXT, DATE, BOOLEAN) TO authenticated;
