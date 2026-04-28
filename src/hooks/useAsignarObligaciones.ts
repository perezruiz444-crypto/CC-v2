import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import {
  type PerfilEmpresa,
  type DiffResult,
  type ApplyResult,
  perfilToJsonb,
} from '../lib/perfil'

/**
 * Hook para calcular el diff y aplicar un nuevo perfil a una empresa.
 * Llama a los RPCs de Supabase:
 *   - calcular_diff_perfil    (read-only)
 *   - actualizar_perfil_empresa (transactional update)
 */
export function useAsignarObligaciones(empresaId: string | null) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calcularDiff = useCallback(
    async (perfil: PerfilEmpresa): Promise<DiffResult> => {
      if (!empresaId) throw new Error('empresaId requerido')
      setLoading(true)
      setError(null)
      try {
        const { data, error: rpcError } = await supabase.rpc(
          'calcular_diff_perfil',
          {
            p_empresa_id: empresaId,
            p_perfil_nuevo: perfilToJsonb(perfil),
          }
        )
        if (rpcError) throw rpcError
        const result = (data ?? {}) as Partial<DiffResult>
        return {
          aAgregar:    result.aAgregar    ?? [],
          aDesactivar: result.aDesactivar ?? [],
          sinCambios:  result.sinCambios  ?? [],
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al calcular diff'
        setError(msg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [empresaId]
  )

  const aplicarPerfil = useCallback(
    async (perfil: PerfilEmpresa): Promise<ApplyResult> => {
      if (!empresaId) throw new Error('empresaId requerido')
      setLoading(true)
      setError(null)
      try {
        const { data, error: rpcError } = await supabase.rpc(
          'actualizar_perfil_empresa',
          {
            p_empresa_id: empresaId,
            p_perfil: perfilToJsonb(perfil),
          }
        )
        if (rpcError) throw rpcError
        return (data ?? { agregadas: 0, desactivadas: 0, sin_cambios: 0 }) as ApplyResult
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error al aplicar perfil'
        setError(msg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [empresaId]
  )

  return { loading, error, calcularDiff, aplicarPerfil }
}
