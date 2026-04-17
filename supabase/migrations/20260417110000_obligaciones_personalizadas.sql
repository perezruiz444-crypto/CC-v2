-- FASE 3: Obligaciones Personalizadas por Organización
-- Permite a cada organización crear obligaciones específicas (custom items)

-- Agregar columna organizacion_id a obligaciones_catalogo
ALTER TABLE obligaciones_catalogo
ADD COLUMN organizacion_id UUID REFERENCES organizaciones(id) ON DELETE CASCADE;

-- Índice compuesto para queries rápidas por organización
CREATE INDEX idx_obl_cat_org_activa ON obligaciones_catalogo(organizacion_id, activa)
WHERE organizacion_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- ACTUALIZAR POLÍTICAS DE RLS EN obligaciones_catalogo
-- ─────────────────────────────────────────────────────────────────────────────

-- Primero, eliminar las políticas antiguas
DROP POLICY IF EXISTS "Leer obligaciones_catalogo" ON obligaciones_catalogo;
DROP POLICY IF EXISTS "Insertar obligaciones_catalogo" ON obligaciones_catalogo;
DROP POLICY IF EXISTS "Actualizar obligaciones_catalogo" ON obligaciones_catalogo;
DROP POLICY IF EXISTS "Eliminar obligaciones_catalogo" ON obligaciones_catalogo;

-- Nueva política: Leer obligaciones globales (organizacion_id = NULL) O propias (de la org del usuario)
CREATE POLICY "Leer obligaciones (globales o propias)"
  ON obligaciones_catalogo FOR SELECT
  USING (
    organizacion_id IS NULL  -- Obligaciones de ley (globales, para todas las orgs)
    OR organizacion_id IN (
      SELECT organizacion_id FROM usuarios_organizacion
      WHERE user_id = auth.uid()
    )
  );

-- Insertar: Solo en obligaciones personalizadas (con organizacion_id)
-- Se requiere un ROLE owner o manager de esa organización
CREATE POLICY "Crear obligaciones personalizadas"
  ON obligaciones_catalogo FOR INSERT
  WITH CHECK (
    -- organizacion_id debe estar definido (no es obligación global)
    organizacion_id IS NOT NULL
    AND
    -- El usuario debe ser owner o manager de esa organización
    EXISTS (
      SELECT 1 FROM usuarios_organizacion uor
      WHERE uor.user_id = auth.uid()
        AND uor.organizacion_id = obligaciones_catalogo.organizacion_id
        AND uor.rol IN ('owner', 'manager')
    )
  );

-- Actualizar: Solo obligaciones personalizadas de la org del usuario (owner/manager)
CREATE POLICY "Actualizar obligaciones personalizadas"
  ON obligaciones_catalogo FOR UPDATE
  USING (
    organizacion_id IS NOT NULL
    AND
    EXISTS (
      SELECT 1 FROM usuarios_organizacion uor
      WHERE uor.user_id = auth.uid()
        AND uor.organizacion_id = obligaciones_catalogo.organizacion_id
        AND uor.rol IN ('owner', 'manager')
    )
  )
  WITH CHECK (
    organizacion_id IS NOT NULL
    AND
    EXISTS (
      SELECT 1 FROM usuarios_organizacion uor
      WHERE uor.user_id = auth.uid()
        AND uor.organizacion_id = obligaciones_catalogo.organizacion_id
        AND uor.rol IN ('owner', 'manager')
    )
  );

-- Eliminar: Solo obligaciones personalizadas de la org del usuario (owner/manager)
CREATE POLICY "Eliminar obligaciones personalizadas"
  ON obligaciones_catalogo FOR DELETE
  USING (
    organizacion_id IS NOT NULL
    AND
    EXISTS (
      SELECT 1 FROM usuarios_organizacion uor
      WHERE uor.user_id = auth.uid()
        AND uor.organizacion_id = obligaciones_catalogo.organizacion_id
        AND uor.rol IN ('owner', 'manager')
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Nota de implementación en frontend:
-- Cuando se crea una obligación personalizada:
-- 1. Se inserta en obligaciones_catalogo con organizacion_id = auth.user.organizacion_id
-- 2. Se inserta en obligaciones_empresa para vincularla a la empresa actual
-- 3. Se llama proyectar_vencimientos() para generar instancias del año actual
-- 4. El usuario solo verá: obligaciones globales (NULL) + sus propias (su org_id)
-- ─────────────────────────────────────────────────────────────────────────────
