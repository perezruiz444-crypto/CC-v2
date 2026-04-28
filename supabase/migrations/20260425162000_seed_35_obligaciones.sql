-- ============================================================================
-- Migración: Seed UPSERT de 35 obligaciones del Wizard de Perfil
-- Estrategia (Opción C - Merge): UPSERT por nombre. Si existe, actualiza
-- condicion_activacion, nivel_riesgo, fundamento_legal y periodicidad. Si no
-- existe, INSERT completo. Solo afecta obligaciones globales (organizacion_id IS NULL).
-- ============================================================================

-- Helper: upsert obligación global por nombre
CREATE OR REPLACE FUNCTION _upsert_obligacion_global(
  p_nombre TEXT,
  p_descripcion TEXT,
  p_categoria TEXT,
  p_periodicidad TEXT,
  p_dia_venc INT,
  p_mes_venc INT,
  p_fundamento TEXT,
  p_nivel TEXT,
  p_condicion JSONB
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id
    FROM obligaciones_catalogo
    WHERE nombre = p_nombre AND organizacion_id IS NULL
    LIMIT 1;

  IF v_id IS NOT NULL THEN
    UPDATE obligaciones_catalogo
       SET descripcion          = COALESCE(p_descripcion, descripcion),
           categoria            = p_categoria,
           periodicidad         = p_periodicidad,
           dia_vencimiento      = p_dia_venc,
           mes_vencimiento      = p_mes_venc,
           fundamento_legal     = COALESCE(p_fundamento, fundamento_legal),
           nivel_riesgo         = p_nivel,
           condicion_activacion = p_condicion,
           updated_at           = NOW(),
           activa               = true
     WHERE id = v_id;
  ELSE
    INSERT INTO obligaciones_catalogo (
      nombre, descripcion, categoria, periodicidad,
      dia_vencimiento, mes_vencimiento, fundamento_legal,
      nivel_riesgo, condicion_activacion, activa, organizacion_id
    ) VALUES (
      p_nombre, p_descripcion, p_categoria, p_periodicidad,
      p_dia_venc, p_mes_venc, p_fundamento,
      p_nivel, p_condicion, true, NULL
    ) RETURNING id INTO v_id;
  END IF;

  RETURN v_id;
END;
$$;

-- ============================================================================
-- BLOQUE GENERALES (1-3)
-- ============================================================================
SELECT _upsert_obligacion_global(
  'Opinión Positiva SAT',
  'Verificación mensual de la opinión de cumplimiento del SAT antes del día 21.',
  'general', 'mensual', 21, NULL,
  'Art. 11 Fr. III Decreto IMMEX; Regla 1.3.3 RGCE',
  'CRITICO',
  '{}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Verificación Art. 69 CFF (No estar en listados SAT)',
  'Validar que la empresa no aparezca en los listados públicos del SAT (69-B).',
  'general', 'mensual', 23, NULL,
  'Art. 69-B CFF; Reglas 1.3.3 y 7.4.2 RGCE',
  'CRITICO',
  '{}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Medios de Contacto y Buzón Tributario actualizados',
  'Revisión semanal de notificaciones del Buzón Tributario y datos de contacto.',
  'general', 'continua', NULL, NULL,
  'Art. 17-K CFF',
  'ALTO',
  '{}'::jsonb
);

-- ============================================================================
-- BLOQUE IMMEX (4-10)
-- ============================================================================
SELECT _upsert_obligacion_global(
  'Mínimo de ventas al exterior ($500K USD o 10%)',
  'Acreditar exportaciones anuales mínimas para mantener IMMEX.',
  'immex', 'anual', 31, 3,
  'Art. 24 Fr. I Decreto IMMEX',
  'CRITICO',
  '{"programas":["IMMEX"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Reporte anual de operaciones ante SE',
  'Informe anual de operaciones de comercio exterior a la Secretaría de Economía.',
  'immex', 'anual', 31, 5,
  'Art. 25/29 Decreto IMMEX',
  'CRITICO',
  '{"programas":["IMMEX"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Anexo 24 - Sistema automatizado de control de inventarios',
  'Mantener operativo y actualizado el sistema de inventarios IMMEX.',
  'immex', 'continua', NULL, NULL,
  'Art. 24 Fr. IX Decreto IMMEX; Regla 4.3.1 RGCE',
  'CRITICO',
  '{"programas":["IMMEX"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Reporte estadístico INEGI',
  'Reporte mensual de operaciones (primeros 20 días) y consolidado anual.',
  'immex', 'mensual', 20, NULL,
  'Art. 25 5to párrafo Decreto IMMEX',
  'MEDIO',
  '{"programas":["IMMEX"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Notificar cambios a la SE (domicilio, socios, RFC)',
  'Avisos de cambios en datos clave dentro de 3-10 días hábiles.',
  'immex', 'continua', NULL, NULL,
  'Art. 24 Fr. VII y VIII Decreto IMMEX',
  'ALTO',
  '{"programas":["IMMEX"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Temporalidad de retorno - monitoreo por pedimento',
  'Vigilar plazos de retorno de mercancía importada temporalmente.',
  'immex', 'mensual', NULL, NULL,
  'Art. 24 Fr. V; Art. 4 Decreto IMMEX',
  'CRITICO',
  '{"programas":["IMMEX"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Destrucción de desperdicios (ficha 102/LA)',
  'Solicitud y notificación de destrucción de mermas y desperdicios.',
  'immex', 'continua', NULL, NULL,
  'Regla 4.3.5 RGCE',
  'MEDIO',
  '{"programas":["IMMEX"]}'::jsonb
);

-- IMMEX condicional: Industrial / Controladora
SELECT _upsert_obligacion_global(
  'Importar solo fracciones arancelarias autorizadas',
  'Verificación permanente de que las importaciones estén dentro del programa.',
  'immex', 'continua', NULL, NULL,
  'Art. 24 Fr. III Decreto IMMEX',
  'ALTO',
  '{"programas":["IMMEX"],"modalidad":["industrial","controladora"]}'::jsonb
);

-- IMMEX Controladora
SELECT _upsert_obligacion_global(
  'Reporte consolidado de inventarios de subsidiarias',
  'Reporte mensual consolidado para empresas controladoras.',
  'immex', 'mensual', 20, NULL,
  'Art. 3 Fr. IV Decreto IMMEX',
  'CRITICO',
  '{"programas":["IMMEX"],"modalidad":["controladora"]}'::jsonb
);

-- Submaquila / Tercerización
SELECT _upsert_obligacion_global(
  'Avisos de Submaquila - Registro de terceros ante SAT',
  'Notificar al SAT cada traslado de mercancía a fabricantes terceros.',
  'immex', 'continua', NULL, NULL,
  'Art. 3 Fr. V Decreto IMMEX; Regla 4.3.6 RGCE',
  'CRITICO',
  '{"programas":["IMMEX"],"submaquila":true}'::jsonb
);

-- Sensibles
SELECT _upsert_obligacion_global(
  'Verificación de fracciones sensibles (Anexo II)',
  'Validación adicional para mercancías del Anexo II en cada importación.',
  'immex', 'continua', NULL, NULL,
  'Art. 24 Fr. III Decreto IMMEX',
  'ALTO',
  '{"programas":["IMMEX"],"sensibles":true}'::jsonb
);

-- ============================================================================
-- BLOQUE CTM EMISOR (15-21)
-- ============================================================================
SELECT _upsert_obligacion_global(
  'Emisión y transmisión de CTMs al SAT',
  'Generar y transmitir Constancias de Transferencia de Mercancías (máx. 15 días hábiles).',
  'immex', 'mensual', 15, NULL,
  'Regla 4.3.13 Fr. I RGCE',
  'CRITICO',
  '{"ctm_rol":["emisor","ambos"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Pedimento de retorno (Apartado C CTM)',
  'Pedimento de retorno máximo 60 días naturales tras emisión de CTM.',
  'immex', 'mensual', NULL, NULL,
  'Regla 4.3.13 Fr. II RGCE',
  'ALTO',
  '{"ctm_rol":["emisor","ambos"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Conciliación mensual CTM vs Anexo 24',
  'Cruce mensual de CTMs emitidas/recibidas con el sistema de inventarios.',
  'immex', 'mensual', 10, NULL,
  'Regla 4.3.16 RGCE',
  'CRITICO',
  '{"ctm_rol":["emisor","receptor","ambos"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Ajuste anual de enajenaciones',
  'Cálculo y entero del ajuste anual derivado de las CTMs (último día hábil de mayo).',
  'immex', 'anual', 31, 5,
  'Regla 4.3.14 RGCE',
  'ALTO',
  '{"ctm_rol":["emisor","ambos"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Pago de IGI por venta nacional (cambio de régimen)',
  'Pago del IGI cuando se enajenan partes en mercado nacional.',
  'immex', 'continua', NULL, NULL,
  'Reglas 4.3.13 y 1.6.8 RGCE',
  'CRITICO',
  '{"ctm_rol":["emisor","ambos"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Retorno de material de empaque reutilizable',
  'Documentar retorno de empaques reutilizables (valor declarado $1 USD).',
  'immex', 'continua', NULL, NULL,
  'Regla 4.3.20 RGCE',
  'BAJO',
  '{"ctm_rol":["emisor","ambos"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Rectificación de constancias CTM',
  'Rectificar CTMs con errores en el mes siguiente a la emisión incorrecta.',
  'immex', 'continua', NULL, NULL,
  'Regla 4.3.18 RGCE',
  'MEDIO',
  '{"ctm_rol":["emisor","ambos"]}'::jsonb
);

-- ============================================================================
-- BLOQUE CTM RECEPTOR (22-24) - la conciliación ya quedó arriba
-- ============================================================================
SELECT _upsert_obligacion_global(
  'Expedición de Formato C3 a proveedores de autopartes',
  'Emisión mensual del Formato C3 a proveedores Tier 1.',
  'immex', 'mensual', 31, NULL,
  'Regla 4.3.17 RGCE',
  'CRITICO',
  '{"ctm_rol":["receptor","ambos"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Registro mensual: partes exportadas vs vendidas en mercado nacional',
  'Control mensual de destino de las partes recibidas vía CTM.',
  'immex', 'mensual', 31, NULL,
  'Regla 4.3.19 RGCE',
  'ALTO',
  '{"ctm_rol":["receptor","ambos"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Informe anual sobre inventarios adquiridos de autopartes',
  'Informe anual a la autoridad sobre autopartes adquiridas.',
  'immex', 'anual', 31, 3,
  'Regla 4.3.17 RGCE',
  'CRITICO',
  '{"ctm_rol":["receptor","ambos"]}'::jsonb
);

-- ============================================================================
-- BLOQUE PROSEC (26-28)
-- ============================================================================
SELECT _upsert_obligacion_global(
  'Informe anual de operaciones PROSEC',
  'Informe anual a la SE sobre operaciones del programa PROSEC.',
  'prosec', 'anual', 30, 4,
  'Art. 8 Decreto PROSEC',
  'CRITICO',
  '{"programas":["PROSEC"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Sistema informático de inventarios PROSEC',
  'Mantener sistema de inventarios específico para PROSEC.',
  'prosec', 'continua', NULL, NULL,
  'Art. 8 Decreto PROSEC',
  'ALTO',
  '{"programas":["PROSEC"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Monitoreo de causales de cancelación PROSEC',
  'Revisión trimestral de cumplimiento de requisitos para evitar cancelación.',
  'prosec', 'trimestral', NULL, NULL,
  'Art. 9 Decreto PROSEC',
  'CRITICO',
  '{"programas":["PROSEC"]}'::jsonb
);

-- ============================================================================
-- BLOQUE CERTIVA (29-34)
-- ============================================================================
SELECT _upsert_obligacion_global(
  'Cumplimiento permanente de requisitos CERTIVA',
  'Verificación mensual de que se cumplen los requisitos de la certificación.',
  'iva_ieps', 'mensual', NULL, NULL,
  'Regla 7.2.1 Fr. I RGCE',
  'CRITICO',
  '{"programas":["CERTIVA"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Reporte mensual de modificaciones (socios, representantes, clientes/proveedores)',
  'Notificar cambios relevantes mensualmente.',
  'iva_ieps', 'mensual', NULL, NULL,
  'Regla 7.2.1 Fr. I 2do párrafo RGCE',
  'ALTO',
  '{"programas":["CERTIVA"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Vigencia legal de inmueble (mínimo 8 meses restantes)',
  'Mantener contrato/posesión legal del inmueble; alerta a 90 días de vencer.',
  'iva_ieps', 'continua', NULL, NULL,
  'Regla 7.2.1 Fr. II RGCE',
  'CRITICO',
  '{"programas":["CERTIVA"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Transmisión electrónica Anexo 30 (descargos e inventario)',
  'Transmisión por operación dentro de los 30 días siguientes.',
  'iva_ieps', 'continua', NULL, NULL,
  'Regla 7.2.1 Fr. IV RGCE',
  'ALTO',
  '{"programas":["CERTIVA"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Retorno mínimo del 60% del valor de importaciones temporales',
  'Cumplimiento trimestral del 60% de retornos sobre importaciones temporales.',
  'iva_ieps', 'trimestral', NULL, NULL,
  'Regla 7.1.2 Fr. A III RGCE',
  'CRITICO',
  '{"programas":["CERTIVA"]}'::jsonb
);

SELECT _upsert_obligacion_global(
  'Cuotas IMSS al corriente (todos los trabajadores)',
  'Mantener al corriente las cuotas obrero-patronales del IMSS.',
  'iva_ieps', 'mensual', NULL, NULL,
  'Regla 7.2.1 Fr. III RGCE',
  'ALTO',
  '{"programas":["CERTIVA"]}'::jsonb
);

-- ============================================================================
-- BLOQUE SENER (35)
-- ============================================================================
SELECT _upsert_obligacion_global(
  'Reporte anual SENER (energéticos/combustibles)',
  'Reporte anual a la SENER dentro de 10 días hábiles tras cierre de año o agotamiento.',
  'general', 'anual', 15, 1,
  'Art. 65 inciso I Decreto IMMEX',
  'ALTO',
  '{"programas":["SENER"]}'::jsonb
);

-- Limpieza: helper temporal
DROP FUNCTION _upsert_obligacion_global(TEXT, TEXT, TEXT, TEXT, INT, INT, TEXT, TEXT, JSONB);
