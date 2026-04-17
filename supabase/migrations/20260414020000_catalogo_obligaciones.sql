-- ============================================================
-- Calendario Compliance — Catálogo de Obligaciones
-- Migración: 20260414_002
-- Fuente: obligaciones_plantilla.xlsx (108 obligaciones)
-- ============================================================

INSERT INTO obligaciones_catalogo
  (nombre, descripcion, categoria, periodicidad, fundamento_legal, notas_importantes)
VALUES

-- ════════════════════════════════════════════════════════════
-- GENERALES
-- ════════════════════════════════════════════════════════════
('Opinión positiva (SAT)',
 'Opinión positiva vigente expedida por el SAT sobre el cumplimiento de obligaciones fiscales (32-D CFF). Causal de suspensión de padrón si no se presenta.',
 'general', 'mensual',
 'Art. 11 Fracc. III Decreto IMMEX; Regla 1.3.3 RGCE Fracc. III',
 'Revisión periódica mensual — día 21 de cada mes'),

('Artículo 69 CFF — No estar en listados SAT',
 'Documento que acredite no encontrarse en listados del SAT (Arts. 69 y 69-B 3er párrafo CFF). No estar en listado de "definitivos" (69-B 4to párrafo) ni haber realizado operaciones con ellos sin corregir situación fiscal.',
 'general', 'mensual',
 'Art. 11 Fracc. III Decreto IMMEX; Regla 1.3.3 RGCE Fracc. XLIV; Regla 7.4.2 RGCE Fracc. III',
 'Revisión periódica mensual — días 21 al 23 de cada mes'),

('Buzón tributario — Medios de contacto actualizados',
 'No tener registrados o actualizados los medios de contacto para buzón tributario (17-K CFF) es causal de suspensión de padrón. Contar con medios de contacto actualizados.',
 'general', 'mensual',
 'Regla 1.3.3 RGCE Fracc. II; Regla 7.4.2 RGCE Fracc. VI',
 'Revisión periódica semanal — cada viernes'),

('Reporte SENER',
 'Presentar reportes anuales (o al agotar cantidad autorizada).',
 'general', 'anual',
 'Art. 65 Inciso I Modif.',
 '10 días hábiles siguientes al cierre del año o al agotar la cantidad'),

-- ════════════════════════════════════════════════════════════
-- IMMEX
-- ════════════════════════════════════════════════════════════
('IMMEX — Ventas anuales al exterior',
 'Realizar anualmente ventas al exterior superiores a 500,000 USD o facturar exportaciones al menos el 10% de la facturación total.',
 'immex', 'anual',
 'Art. 24 Fracc. I Decreto IMMEX',
 'Anualmente en marzo'),

('IMMEX — Cumplir con el programa autorizado',
 'Cumplir en todo momento con lo establecido en el Programa que fue autorizado.',
 'immex', 'continua',
 'Art. 24 Fracc. II Decreto IMMEX',
 'En todo momento'),

('IMMEX — Requisitos de obtención y reporte anual',
 'Mantener vigentes: a) Firma electrónica avanzada SAT; b) RFC activo; c) Domicilio fiscal y operativos inscritos; d) No estar en listados 69/69-B; e) Opinión positiva (32-D CFF).',
 'immex', 'anual',
 'Art. 24 Fracc. II Decreto IMMEX',
 'Al momento de solicitar y reporte anual abril'),

('IMMEX — Importación de mercancías sensibles (Anexo II)',
 'Importar temporalmente mercancías sensibles (Anexo II) exclusivamente en fracciones arancelarias autorizadas.',
 'immex', 'continua',
 'Art. 24 Fracc. III Decreto IMMEX',
 'En caso de importación de mercancía sensible'),

('IMMEX — Destino de mercancías importadas',
 'Destinar las mercancías importadas temporalmente exclusivamente a los fines autorizados en el programa.',
 'immex', 'continua',
 'Art. 24 Fracc. IV Decreto IMMEX',
 'En todo momento'),

('IMMEX — Temporalidad de retorno',
 'Retornar las mercancías en los plazos: 18 meses (combustibles, materias primas, envases, etiquetas); 2 años (contenedores y cajas de trailers); Vigencia del Programa (maquinaria/equipo); 6 meses (transferencias virtuales V1).',
 'immex', 'continua',
 'Art. 24 Fracc. V / Art. 4 Decreto IMMEX',
 'Plazos según tipo de mercancía'),

('IMMEX — Mercancías en domicilios registrados',
 'Mantener las mercancías importadas temporalmente únicamente en los domicilios registrados en el programa.',
 'immex', 'continua',
 'Art. 24 Fracc. VI Decreto IMMEX',
 'En todo momento'),

('IMMEX — Notificar cambios a la Secretaría',
 'Notificar cambios en: a) Denominación, RFC, domicilio fiscal (3 días hábiles previos); b) Domicilios operativos/submanufactura (3 días hábiles antes del traslado); c) Socios, accionistas o representante legal (al momento del cambio); d) Cualquier cambio vía escrito libre (10 días hábiles siguientes).',
 'immex', 'continua',
 'Art. 24 Fracc. VII y VIII Decreto IMMEX; Regla 3.2.39 Acuerdo SE',
 'Según tipo de cambio: 3 días previos o 10 días hábiles siguientes'),

('IMMEX — Control de inventarios (Anexo 24)',
 'Llevar control de inventarios automatizado conforme al Anexo 24, con catálogos y módulos del apartado A.',
 'immex', 'continua',
 'Art. 24 Fracc. IX Decreto IMMEX; Regla 4.3.1 RGCE',
 'En todo momento'),

('IMMEX — Reporte anual de ventas y exportaciones',
 'Presentar reporte anual de ventas y exportaciones del ejercicio anterior a más tardar el último día hábil de mayo. Recomendado presentar junto con reporte PROSEC.',
 'immex', 'anual',
 'Art. 25 / Art. 29 Decreto IMMEX',
 '15 de abril (recomendado) — último día hábil de mayo (límite)'),

('IMMEX — Información estadística INEGI',
 'Presentar información estadística: I. Mensualmente (primeros 20 días naturales). II. Anualmente (30 días naturales tras notificación de la Secretaría).',
 'immex', 'mensual',
 'Art. 25 Quinto párrafo Decreto IMMEX; Regla 3.2.17 Acuerdo SE',
 'Mensual: primeros 20 días. Anual: 30 días tras notificación'),

('IMMEX — Facilidades para verificación',
 'Proporcionar información solicitada por SE/SAT y otorgar facilidades para visitas de verificación.',
 'immex', 'continua',
 'Art. 26 Decreto IMMEX',
 'En todo momento'),

('IMMEX — Causales de cancelación del programa',
 'Evitar causales de cancelación: incumplimiento del Decreto; falta de documentación aduanal; no localización en domicilios; mercancías fuera de domicilios registrados; documentación falsa; aviso de cancelación en RFC; socios vinculados a empresa con programa cancelado.',
 'immex', 'continua',
 'Art. 27 Fracc. I-IX Decreto IMMEX; Regla 3.2.9 Acuerdo SE',
 'Monitoreo permanente'),

('IMMEX — Trato arancelario preferencial (Cambio de régimen)',
 'Aplicar tasa preferencial al cambiar a régimen definitivo si se cumple regla 1.6.8 (origen, plazo vigente, no bien final).',
 'immex', 'continua',
 'Regla 1.6.8 RGCE 2025',
 'Cuando se cambie de régimen temporal a definitivo'),

('IMMEX — Mercancías sensibles pre-2003 (Beneficio Maquila/PITEX)',
 'Mercancías sensibles importadas antes de 2003: permanencia hasta la vigencia del Programa IMMEX.',
 'immex', 'continua',
 'Regla 4.3.2 RGCE 2025',
 'Cuando importen mercancías sensibles bajo beneficio previo'),

('IMMEX — Destrucción de desperdicios',
 'Realizar destrucción de desperdicios transmitiendo aviso electrónico (ficha 102/LA).',
 'immex', 'continua',
 'Regla 4.3.5 RGCE 2025',
 'Al destruir desperdicios — aviso previo'),

('IMMEX — Traslado a submanufactureros',
 'Traslado de mercancías a otras empresas IMMEX o bodegas (mismo programa) mediante aviso electrónico previo.',
 'immex', 'continua',
 'Regla 4.3.6 RGCE 2025',
 'Al realizar cada traslado'),

('IMMEX — Rectificación de claves de pedimento',
 'Rectificar pedimentos de retorno con clave "A1" por única vez cuando aplique.',
 'immex', 'continua',
 'Regla 4.3.10 RGCE 2025',
 'Al rectificar pedimentos'),

('IMMEX — Constancia de transferencia Autopartes (Apartado A)',
 'Cambio de régimen temporal a definitivo de partes (Apartado A de Constancia) en plazo no mayor a 15 días naturales.',
 'immex', 'mensual',
 'Regla 4.3.13 Fracc. I RGCE 2025',
 'Mensual — plazo máximo 15 días tras emisión de constancia'),

('IMMEX — Constancia de transferencia Autopartes (Apartado C)',
 'Tramitar pedimento de retorno (Apartado C de Constancia) en plazo no mayor a 60 días naturales.',
 'immex', 'mensual',
 'Regla 4.3.13 Fracc. II RGCE 2025',
 'Mensual — plazo máximo 60 días tras constancia'),

('IMMEX — Expedición constancias Automotriz (C3)',
 'Expedir formato C3 a proveedores de autopartes a más tardar el último día hábil de cada mes.',
 'immex', 'mensual',
 'Regla 4.3.17 RGCE 2025',
 'Último día hábil de cada mes'),

('IMMEX — Informe anual inventarios Automotriz',
 'Informe sobre existencia de inventarios en contabilidad (partes adquiridas de proveedores).',
 'immex', 'anual',
 'Regla 4.3.17 RGCE 2025',
 'Marzo de cada año'),

('IMMEX — Registros automatizados Autopartes',
 'Llevar registro automatizado identificando partes en constancias vs CFDI entregados.',
 'immex', 'mensual',
 'Regla 4.3.16 RGCE 2025',
 'Mensual'),

('IMMEX — Rectificación de constancias',
 'Rectificar datos de constancias (excepto folio, periodo, RFC, descripción) mediante constancia complementaria en el mes siguiente.',
 'immex', 'continua',
 'Regla 4.3.18 RGCE 2025',
 'Cuando se rectifique — mes siguiente'),

('IMMEX — Ajuste anual de inventarios (Autopartes)',
 'Efectuar ajuste anual de enajenaciones de partes y componentes a más tardar en mayo.',
 'immex', 'anual',
 'Regla 4.3.14 RGCE 2025',
 'Último día hábil de mayo'),

('IMMEX — Registros Automotriz por empresa de autopartes',
 'Llevar registro por cada empresa de autopartes (exportados vs mercado nacional).',
 'immex', 'mensual',
 'Regla 4.3.19 RGCE 2025',
 'Último día hábil de cada mes'),

('IMMEX — Retorno material de empaque',
 'Retornar empaques reutilizables (palets, racks) declarando valor 1 USD en pedimento (no comercial).',
 'immex', 'continua',
 'Regla 4.3.20 RGCE 2025',
 'Al retornar materiales de empaque'),

-- ════════════════════════════════════════════════════════════
-- PROSEC
-- ════════════════════════════════════════════════════════════
('PROSEC — Reporte anual de operaciones',
 'Presentar informe anual de operaciones del ejercicio anterior.',
 'prosec', 'anual',
 'Art. 8 Decreto PROSEC',
 '15 de abril (último día hábil de abril)'),

('PROSEC — Control de inventarios',
 'Utilizar sistema informático de control de inventarios registrado en contabilidad.',
 'prosec', 'continua',
 'Art. 8 Decreto PROSEC',
 'En todo momento'),

('PROSEC — Causales de cancelación',
 'Evitar causales de cancelación: incumplir el Decreto; dejar de cumplir condiciones de otorgamiento; no presentar 3+ pagos provisionales o anual ISR/IVA; cambio de domicilio sin aviso; destinar bienes a propósitos diferentes.',
 'prosec', 'continua',
 'Art. 9 Decreto PROSEC',
 'Monitoreo permanente'),

('PROSEC — Destino de bienes importados',
 'No destinar bienes a propósitos distintos a los autorizados (salvo pago de impuestos con actualización y recargos).',
 'prosec', 'continua',
 'Art. 10 Decreto PROSEC',
 'En todo momento'),

('PROSEC — Prohibición de enajenación',
 'No enajenar ni ceder bienes a otra persona (salvo que esta tenga programa y cumpla las reglas aplicables).',
 'prosec', 'continua',
 'Art. 10 Decreto PROSEC',
 'En todo momento'),

-- ════════════════════════════════════════════════════════════
-- IVA/IEPS (CERTIVA)
-- ════════════════════════════════════════════════════════════
('CERTIVA — Cumplir requisitos del esquema de certificación',
 'Cumplir permanentemente con los requisitos del Registro en el Esquema de Certificación (Modalidad/Rubro) y estar al corriente en obligaciones fiscales y aduaneras.',
 'iva_ieps', 'continua',
 'Regla 7.2.1 Fracc. I y II RGCE 2025',
 'En todo momento'),

('CERTIVA — Fusión o escisión (empresa certificada subsiste)',
 'Si subsiste empresa certificada: cumplir obligaciones de fusionadas/escindidas (informes de descargo). Si resulta nueva sociedad: presentar nueva solicitud.',
 'iva_ieps', 'continua',
 'Regla 7.2.1 Fracc. III y IV RGCE',
 'En caso de fusión o escisión'),

('CERTIVA — Aviso fusión con empresa sin registro (10 días)',
 'Si fusión con empresa sin registro y subsiste la certificada: aviso a AGACE en 10 días hábiles tras inscripción en registro público.',
 'iva_ieps', 'continua',
 'Regla 7.2.1 Fracc. V RGCE',
 '10 días posteriores a inscripción de acuerdos'),

('CERTIVA — Cancelar garantía previa a fusión con empresa con garantía IVA/IEPS',
 'En fusión con empresa que tiene garantía IVA/IEPS: cancelar garantía previo al aviso de fusión.',
 'iva_ieps', 'continua',
 'Regla 7.2.1 Fracc. VI RGCE',
 'Previo al aviso de fusión'),

('CERTIVA — Permitir acceso para inspección',
 'Permitir acceso a la autoridad para inspección inicial y de supervisión.',
 'iva_ieps', 'continua',
 'Regla 7.2.1 Fracc. VII RGCE',
 'En todo momento'),

('CERTIVA — Aviso cambios en inmuebles (5 días)',
 'Aviso a AGACE cuando cambie la situación legal del uso/goce de inmuebles (vigencia, partes, domicilio).',
 'iva_ieps', 'continua',
 'Regla 7.2.1 Fracc. VIII RGCE',
 '5 días hábiles siguientes al supuesto'),

('CERTIVA — Aviso importación de mercancías adicionales (30 días previos)',
 'Aviso si requiere importar mercancías adicionales a las señaladas en la solicitud inicial.',
 'iva_ieps', 'continua',
 'Regla 7.2.1 Fracc. X RGCE',
 '30 días previos a la importación'),

('CERTIVA — Requisitos generales permanentes',
 'Cumplir permanentemente: personas morales constituidas en México; corriente fiscal/aduanera; personal IMSS; no estar en listados 69/69-B; sellos digitales vigentes; domicilios registrados ante SAT; buzón tributario actualizado; no suspendido en Padrón; clientes/proveedores vinculados al régimen; legal uso/goce inmueble; sin querella penal del SAT; control de inventarios Anexo 24 apartado C; contabilidad electrónica mensual; socios al corriente.',
 'iva_ieps', 'continua',
 'Regla 7.1.1 Fracc. I-XVIII RGCE 2025',
 'En todo momento — revisión mensual recomendada'),

('CERTIVA — Reportes mensuales de modificaciones',
 'Reportar modificaciones de: socios, representantes, clientes/proveedores extranjeros y nacionales.',
 'iva_ieps', 'mensual',
 'Regla 7.2.1 Fracc. I (2do párrafo) RGCE',
 'Mes inmediato siguiente a la modificación'),

('CERTIVA — Acreditar uso y goce de inmuebles',
 'Acreditar permanentemente el legal uso y goce de los inmuebles del programa.',
 'iva_ieps', 'continua',
 'Regla 7.2.1 Fracc. II (2do párrafo) RGCE',
 'En todo momento'),

('CERTIVA — Pago de cuotas IMSS',
 'Estar permanentemente al corriente en el pago de cuotas al IMSS.',
 'iva_ieps', 'mensual',
 'Regla 7.2.1 Fracc. III (2do párrafo) RGCE',
 'En todo momento — verificación mensual'),

('CERTIVA — Transmisión Anexo 30 (Descargos)',
 'Transmitir electrónicamente (Anexo 30) operaciones, descargos e inventario inicial en plazo de 30 días.',
 'iva_ieps', 'mensual',
 'Regla 7.2.1 Fracc. IV (2do párrafo) RGCE',
 'En todo momento — plazo 30 días por operación'),

('CERTIVA — Fusión con no certificada (descargos y nueva solicitud)',
 'Si fusión con empresa no certificada y subsiste la no certificada: acreditar descargo de inventario y presentar nueva solicitud de certificación.',
 'iva_ieps', 'continua',
 'Regla 7.2.1 Fracc. V (2do párrafo) RGCE',
 'En caso de fusión'),

-- Rubro A
('CERTIVA Rubro A — Solicitud conforme ficha 61/LA',
 'Presentar solicitud de Rubro A conforme a ficha técnica 61/LA.',
 'iva_ieps', 'unica',
 'Regla 7.1.2 Fracc. I RGCE 2025',
 'Al momento de la solicitud'),

('CERTIVA Rubro A — Mínimo 10 trabajadores IMSS',
 'Tener registrados ante IMSS al menos 10 trabajadores y pago total de cuotas.',
 'iva_ieps', 'continua',
 'Regla 7.1.2 Fracc. II RGCE 2025',
 'En todo momento'),

('CERTIVA Rubro A — Inversión en territorio nacional',
 'Acreditar inversión en territorio nacional.',
 'iva_ieps', 'continua',
 'Regla 7.1.2 Fracc. III RGCE 2025',
 'En todo momento'),

('CERTIVA Rubro A — Cumplimiento previo Anexo 30',
 'Si tuvo certificación previa IVA/IEPS, estar al corriente en transmisión de Anexo 30.',
 'iva_ieps', 'continua',
 'Regla 7.1.2 Fracc. IV RGCE 2025',
 'En todo momento si hubo certificación previa'),

('CERTIVA Rubro A — Proveedores no listados 69-B',
 'Proveedores no deben estar listados en el artículo 69-B (4to párrafo CFF).',
 'iva_ieps', 'continua',
 'Regla 7.1.2 Fracc. V RGCE 2025',
 'En todo momento'),

('CERTIVA Rubro A — Programa IMMEX vigente',
 'Contar con Programa IMMEX vigente.',
 'iva_ieps', 'continua',
 'Regla 7.1.2 A Fracc. I RGCE 2025',
 'En todo momento'),

('CERTIVA Rubro A — Infraestructura para operar IMMEX',
 'Contar con infraestructura adecuada para operar el Programa IMMEX (sujeta a inspección).',
 'iva_ieps', 'continua',
 'Regla 7.1.2 A Fracc. II RGCE 2025',
 'En todo momento'),

('CERTIVA Rubro A — Retorno mínimo 60% importaciones temporales',
 'Retornar al menos 60% del valor total de importaciones temporales (últimos 12 meses): a) Elaboración/Transformación; b) Servicios/Otros.',
 'iva_ieps', 'continua',
 'Regla 7.1.2 A Fracc. III RGCE 2025',
 'En todo momento — medición últimos 12 meses'),

('CERTIVA Rubro A — Descripción de procesos',
 'Describir actividades del proceso productivo (arribo, almacenamiento, proceso, retorno).',
 'iva_ieps', 'unica',
 'Regla 7.1.2 A Fracc. IV RGCE 2025',
 'Al momento de solicitar / actualizar cuando cambie el proceso'),

('CERTIVA Rubro A — Contrato maquila o compraventa',
 'Contrato de maquila o compraventa que acredite continuidad del proyecto de exportación.',
 'iva_ieps', 'continua',
 'Regla 7.1.2 A Fracc. V RGCE 2025',
 'En todo momento'),

('CERTIVA Rubro A — Importación mercancías sensibles (Retorno 80%)',
 'Para importar mercancías sensibles (Anexo II/28): haber operado IMMEX 12 meses previos y cumplir retornos del 80%.',
 'iva_ieps', 'continua',
 'Regla 7.1.2 B RGCE 2025',
 'En todo momento si importan sensibles')

ON CONFLICT DO NOTHING;
