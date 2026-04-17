-- ============================================================
-- Fix: tighten organizaciones INSERT RLS policy
-- The old policy used WITH CHECK (true), allowing any
-- authenticated user to insert rows directly.
-- The correct pattern is to block direct inserts and rely
-- exclusively on the crear_organizacion_inicial SECURITY
-- DEFINER function, which bypasses RLS intentionally.
-- ============================================================

DROP POLICY IF EXISTS "organizaciones_insert_own" ON organizaciones;

-- No direct INSERT allowed from client; only SECURITY DEFINER
-- functions (crear_organizacion_inicial) can create orgs.
CREATE POLICY "organizaciones_insert_own" ON organizaciones FOR INSERT
  WITH CHECK (false);
