-- FASE 2: Función para Ajustar Fechas según Laborabilidad + Motor Actualizado
-- Implementa la lógica de "siguiente día hábil" (no fin de semana, no festivo)

-- Función auxiliar: obtener el siguiente día hábil
CREATE OR REPLACE FUNCTION siguiente_dia_habiles(p_fecha DATE)
RETURNS DATE
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
AS $$
DECLARE
  v_resultado DATE := p_fecha;
  v_iteraciones INT := 0;
BEGIN
  -- Máximo 30 iteraciones (evita loop infinito por errores)
  LOOP
    v_iteraciones := v_iteraciones + 1;
    IF v_iteraciones > 30 THEN
      -- Si después de 30 intentos no se encuentró día hábil, retornar como está
      RETURN v_resultado;
    END IF;

    -- Verificar si es fin de semana (DOW: 0=domingo, 6=sábado)
    IF EXTRACT(DOW FROM v_resultado)::INT IN (0, 6) THEN
      v_resultado := v_resultado + INTERVAL '1 day';
      CONTINUE;
    END IF;

    -- Verificar si es día festivo (exists en catalogo)
    IF EXISTS(
      SELECT 1 FROM dias_inhabiles_catalogo
      WHERE fecha = v_resultado
      LIMIT 1
    ) THEN
      v_resultado := v_resultado + INTERVAL '1 day';
      CONTINUE;
    END IF;

    -- Si llegamos aquí, es un día hábil ✓
    RETURN v_resultado;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION siguiente_dia_habiles(DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION siguiente_dia_habiles(DATE) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- Actualizar la función proyectar_vencimientos() para usar siguiente_dia_habiles()
-- ─────────────────────────────────────────────────────────────────────────────

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

            -- ✨ AJUSTE CRÍTICO: Garantizar que cae en día hábil
            v_fecha := siguiente_dia_habiles(v_fecha);

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

          -- ✨ AJUSTE CRÍTICO: Garantizar que cae en día hábil
          v_fecha := siguiente_dia_habiles(v_fecha);

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

          -- ✨ AJUSTE CRÍTICO: Garantizar que cae en día hábil
          v_fecha := siguiente_dia_habiles(v_fecha);

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

          -- ✨ AJUSTE CRÍTICO: Garantizar que cae en día hábil
          v_fecha := siguiente_dia_habiles(v_fecha);

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

        -- ✨ AJUSTE CRÍTICO: Garantizar que cae en día hábil
        v_fecha := siguiente_dia_habiles(v_fecha);

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

          -- ✨ AJUSTE CRÍTICO: Garantizar que cae en día hábil
          v_fecha := siguiente_dia_habiles(v_fecha);

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
