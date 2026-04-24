-- Consolidar las dos políticas SELECT de obligaciones_catalogo en una sola
-- clara para usuarios autenticados.
-- Las dos políticas anteriores (una para authenticated, otra para public)
-- causaban que el nested select de Supabase JS devolviera catalogo_id: null,
-- colapsando la lista de obligaciones en el frontend.

DROP POLICY IF EXISTS "catalogo_select_authenticated" ON obligaciones_catalogo;
DROP POLICY IF EXISTS "Leer obligaciones (globales o propias)" ON obligaciones_catalogo;

CREATE POLICY "catalogo_select_authenticated"
ON obligaciones_catalogo
FOR SELECT
TO authenticated
USING (
  activa = true
  AND (
    organizacion_id IS NULL
    OR organizacion_id IN (
      SELECT organizacion_id FROM usuarios_organizacion
      WHERE user_id = auth.uid()
    )
  )
);
