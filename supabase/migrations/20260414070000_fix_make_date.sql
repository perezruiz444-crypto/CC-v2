-- ============================================================
-- Fix: proyectar_vencimientos — make_date clamping logic
-- Replaces the unsafe LEAST(dia, date_subtraction) expression
-- with EXTRACT(DAY FROM last_day_of_month) which is correct.
-- ============================================================

CREATE OR REPLACE FUNCTION proyectar_vencimientos(
  p_empresa_id UUID,
  p_anio       INT DEFAULT NULL
)
RETURNS INT
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
  v_dia_seguro    INT;

  -- Helper: último día del mes
  v_last_day      INT;
BEGIN
  v_anio := COALESCE(p_anio, EXTRACT(YEAR FROM CURRENT_DATE)::INT);

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
        CONTINUE;
      END IF;

      DECLARE
        v_base DATE := rec.ancla;
        v_iter INT  := rec.meses_ancla;
      BEGIN
        LOOP
          v_fecha := v_base + (v_iter || ' months')::INTERVAL;
          EXIT WHEN EXTRACT(YEAR FROM v_fecha)::INT > v_anio;

          IF EXTRACT(YEAR FROM v_fecha)::INT = v_anio THEN
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

    -- ── ESCENARIO A: Estático ────────────────────────────────
    IF rec.dia IS NULL THEN CONTINUE; END IF;

    CASE rec.periodicidad

      WHEN 'mensual' THEN
        FOR v_mes IN 1..12 LOOP
          -- Último día real del mes (correcto para feb, abril, etc.)
          v_last_day := EXTRACT(DAY FROM
            (DATE_TRUNC('MONTH', make_date(v_anio, v_mes, 1)) + INTERVAL '1 month - 1 day')
          )::INT;
          v_dia_seguro := LEAST(rec.dia, v_last_day);
          v_fecha := make_date(v_anio, v_mes, v_dia_seguro);
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

      WHEN 'bimestral' THEN
        FOREACH v_mes IN ARRAY ARRAY[2,4,6,8,10,12] LOOP
          v_last_day := EXTRACT(DAY FROM
            (DATE_TRUNC('MONTH', make_date(v_anio, v_mes, 1)) + INTERVAL '1 month - 1 day')
          )::INT;
          v_dia_seguro := LEAST(rec.dia, v_last_day);
          v_fecha := make_date(v_anio, v_mes, v_dia_seguro);
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

      WHEN 'trimestral' THEN
        FOREACH v_mes IN ARRAY ARRAY[3,6,9,12] LOOP
          v_last_day := EXTRACT(DAY FROM
            (DATE_TRUNC('MONTH', make_date(v_anio, v_mes, 1)) + INTERVAL '1 month - 1 day')
          )::INT;
          v_dia_seguro := LEAST(rec.dia, v_last_day);
          v_fecha := make_date(v_anio, v_mes, v_dia_seguro);
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

      WHEN 'anual' THEN
        v_mes := COALESCE(rec.mes, 5);
        v_last_day := EXTRACT(DAY FROM
          (DATE_TRUNC('MONTH', make_date(v_anio, v_mes, 1)) + INTERVAL '1 month - 1 day')
        )::INT;
        v_dia_seguro := LEAST(rec.dia, v_last_day);
        v_fecha := make_date(v_anio, v_mes, v_dia_seguro);
        v_periodo_key := rec.oe_id || '_' || to_char(v_fecha, 'YYYY');
        v_titulo      := rec.nombre || ' — ' || to_char(v_fecha, 'YYYY');
        INSERT INTO vencimientos_calendario
          (empresa_id, obligacion_origen_id, titulo_instancia, periodo_key, fecha_limite, estado_cumplimiento)
        VALUES
          (p_empresa_id, rec.oe_id, v_titulo, v_periodo_key, v_fecha, 'pendiente')
        ON CONFLICT (obligacion_origen_id, periodo_key) DO NOTHING;
        GET DIAGNOSTICS v_count = ROW_COUNT;
        v_inserted := v_inserted + v_count;

      WHEN 'bianual' THEN
        FOREACH v_mes IN ARRAY ARRAY[1,7] LOOP
          v_last_day := EXTRACT(DAY FROM
            (DATE_TRUNC('MONTH', make_date(v_anio, v_mes, 1)) + INTERVAL '1 month - 1 day')
          )::INT;
          v_dia_seguro := LEAST(rec.dia, v_last_day);
          v_fecha := make_date(v_anio, v_mes, v_dia_seguro);
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

      ELSE NULL;
    END CASE;

  END LOOP;

  RETURN v_inserted;
END;
$$;

REVOKE ALL ON FUNCTION proyectar_vencimientos(UUID, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION proyectar_vencimientos(UUID, INT) TO authenticated;
