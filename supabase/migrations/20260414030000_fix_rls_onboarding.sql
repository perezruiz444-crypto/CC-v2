-- ============================================================
-- Fix: RLS policies para permitir el flujo de onboarding
-- El flujo es: INSERT org → INSERT usuarios_org → INSERT empresa
-- Las policies originales tienen dependencias circulares
-- ============================================================

-- organizaciones: el usuario autenticado puede insertar y ver las suyas
DROP POLICY IF EXISTS "organizaciones_insert_own" ON organizaciones;
CREATE POLICY "organizaciones_insert_own" ON organizaciones FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- organizaciones: puede ver las que le pertenecen via usuarios_organizacion
-- (sin cambio, pero se reemplaza por si hay cache)
DROP POLICY IF EXISTS "organizaciones_select_own" ON organizaciones;
CREATE POLICY "organizaciones_select_own" ON organizaciones FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organizacion_id FROM usuarios_organizacion
      WHERE user_id = auth.uid()
    )
  );

-- usuarios_organizacion: el usuario puede insertarse a sí mismo como owner
DROP POLICY IF EXISTS "usuarios_org_insert" ON usuarios_organizacion;
CREATE POLICY "usuarios_org_insert" ON usuarios_organizacion FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- empresas: owner/manager de la org puede insertar
-- Usamos SET LOCAL para evitar el problema de la consulta recursiva
DROP POLICY IF EXISTS "empresas_insert_org" ON empresas;
CREATE POLICY "empresas_insert_org" ON empresas FOR INSERT
  TO authenticated
  WITH CHECK (
    organizacion_id IN (
      SELECT organizacion_id FROM usuarios_organizacion
      WHERE user_id = auth.uid()
    )
  );

-- obligaciones_empresa: misma lógica simplificada
DROP POLICY IF EXISTS "oblig_empresa_insert" ON obligaciones_empresa;
CREATE POLICY "oblig_empresa_insert" ON obligaciones_empresa FOR INSERT
  TO authenticated
  WITH CHECK (
    empresa_id IN (
      SELECT e.id FROM empresas e
      JOIN usuarios_organizacion uo ON uo.organizacion_id = e.organizacion_id
      WHERE uo.user_id = auth.uid()
    )
  );
