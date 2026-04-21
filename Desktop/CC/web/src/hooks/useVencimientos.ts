import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface Vencimiento {
  id: string
  empresa_id: string
  titulo_instancia: string
  periodo_key: string
  fecha_limite: string
  estado_cumplimiento: 'pendiente' | 'completado' | 'vencido' | 'omitido' | 'prorrogado'
  notas: string | null
  obligacion_origen: {
    catalogo: {
      nombre: string
      categoria: string
      periodicidad: string
    }
  } | null
}

interface UseVencimientosResult {
  vencimientos: Vencimiento[]
  loading: boolean
  error: string | null
  marcarCompletado: (id: string) => Promise<void>
  refetch: () => void
}

export function useVencimientos(empresaId: string | null, mes: Date): UseVencimientosResult {
  const [vencimientos, setVencimientos] = useState<Vencimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    if (!empresaId) {
      setLoading(false)
      return
    }

    const inicio = new Date(mes.getFullYear(), mes.getMonth(), 1).toISOString().split('T')[0]
    const fin    = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).toISOString().split('T')[0]

    async function load() {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('vencimientos_calendario')
        .select(`
          id, empresa_id, titulo_instancia, periodo_key,
          fecha_limite, estado_cumplimiento, notas,
          obligacion_origen_id (
            catalogo_id (nombre, categoria, periodicidad)
          )
        `)
        .eq('empresa_id', empresaId)
        .gte('fecha_limite', inicio)
        .lte('fecha_limite', fin)
        .order('fecha_limite', { ascending: true })

      if (fetchError) {
        setError(fetchError.message)
      } else {
        // Normalizar la estructura del join
        const normalized = (data ?? []).map((v: any) => ({
          ...v,
          obligacion_origen: v.obligacion_origen_id
            ? { catalogo: v.obligacion_origen_id.catalogo_id }
            : null,
        }))
        setVencimientos(normalized)
      }
      setLoading(false)
    }

    load()
  }, [empresaId, mes.getFullYear(), mes.getMonth(), tick])

  const marcarCompletado = useCallback(async (id: string) => {
    // Capturar estado original antes del update optimista
    let estadoOriginal: Vencimiento['estado_cumplimiento'] = 'pendiente'
    setVencimientos(prev => {
      const venc = prev.find(v => v.id === id)
      if (venc) estadoOriginal = venc.estado_cumplimiento
      return prev.map(v => v.id === id ? { ...v, estado_cumplimiento: 'completado' } : v)
    })

    // Obtener user desde la sesión ya en memoria (no llamada extra a getUser)
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id

    const { error: updateError } = await supabase
      .from('vencimientos_calendario')
      .update({
        estado_cumplimiento: 'completado',
        completado_por: userId ?? null,
        completado_en: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      // Revertir al estado original, no asumir 'pendiente'
      setVencimientos(prev =>
        prev.map(v => v.id === id ? { ...v, estado_cumplimiento: estadoOriginal } : v)
      )
      if (import.meta.env.DEV) {
        console.error('Error al marcar completado:', updateError.message)
      }
      setError(updateError.message)
    }
  }, [])

  return { vencimientos, loading, error, marcarCompletado, refetch }
}
