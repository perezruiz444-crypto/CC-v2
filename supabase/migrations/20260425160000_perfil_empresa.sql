-- ============================================================================
-- Migración: Perfil de Empresa
-- Agrega columnas que capturan el perfil real de cada empresa para auto-asignar
-- obligaciones específicas según modalidad IMMEX, operaciones CTM, submaquila y
-- mercancías sensibles.
-- ============================================================================

ALTER TABLE empresas
  ADD COLUMN IF NOT EXISTS modalidad_immex   TEXT
    CHECK (modalidad_immex IN ('industrial','servicios','albergue','controladora','tercerizacion')),
  ADD COLUMN IF NOT EXISTS opera_ctm         BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS rol_ctm           TEXT
    CHECK (rol_ctm IN ('emisor','receptor','ambos')),
  ADD COLUMN IF NOT EXISTS opera_submaquila  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS importa_sensibles BOOLEAN NOT NULL DEFAULT false;

-- Garantiza coherencia: si no opera CTM, no debe tener rol asignado
ALTER TABLE empresas
  ADD CONSTRAINT empresas_ctm_coherente
  CHECK (
    (opera_ctm = false AND rol_ctm IS NULL)
    OR (opera_ctm = true AND rol_ctm IS NOT NULL)
  );

COMMENT ON COLUMN empresas.modalidad_immex   IS 'Modalidad IMMEX (Decreto IMMEX Art. 3)';
COMMENT ON COLUMN empresas.opera_ctm         IS 'TRUE si emite/recibe Constancias de Transferencia de Mercancías';
COMMENT ON COLUMN empresas.rol_ctm           IS 'Rol en operaciones CTM: emisor (Tier 1/autopartes), receptor (armadora), ambos';
COMMENT ON COLUMN empresas.opera_submaquila  IS 'TRUE si envía mercancía temporal a fabricantes terceros';
COMMENT ON COLUMN empresas.importa_sensibles IS 'TRUE si importa mercancías del Anexo II del Decreto IMMEX';
