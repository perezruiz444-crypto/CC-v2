import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface ObligacionEmpresa {
  id: string
  empresa_id: string
  estado: boolean
  activa_desde: string
  activa_hasta: string | null
  motivo_inactiva: string | null
  created_at: string
  catalogo: {
    id: string
    nombre: string
    descripcion: string | null
    categoria: string
    periodicidad: string | null
    fundamento_legal: string | null
    notas_importantes: string | null
    multa_minima_mxn: number | null
    multa_maxima_mxn: number | null
  }
  vencimientos: VencimientoResumen[]
}

export interface VencimientoResumen {
  id: string
  titulo_instancia: string
  periodo_key: string
  fecha_limite: string
  estado_cumplimiento: string
  notas: string | null
  completado_en: string | null
}

interface UseObligacionesResult {
  obligaciones: ObligacionEmpresa[]
  loading: boolean
  error: string | null
  toggleEstado: (id: string, nuevoEstado: boolean, motivo?: string) => Promise<void>
  editarFechaVencimiento: (vencimientoId: string, nuevaFecha: string) => Promise<void>
  agregarNota: (vencimientoId: string, nota: string) => Promise<void>
  refetch: () => void
}

export function useObligaciones(empresaId: string | null): UseObligacionesResult {
  const [obligaciones, setObligaciones] = useState<ObligacionEmpresa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    if (!empresaId) { setLoading(false); return }

    async function load() {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('obligaciones_empresa')
        .select(`
          id, empresa_id, estado, activa_desde, activa_hasta, motivo_inactiva, created_at,
          catalogo_id (
            id, nombre, descripcion, categoria, periodicidad,
            fundamento_legal, notas_importantes,
            multa_minima_mxn, multa_maxima_mxn
          )
        `)
        .eq('empresa_id', empresaId)
        .order('estado', { ascending: false })

      if (err) { setError(err.message); setLoading(false); return }

      // Para cada obligacion cargar sus últimos 12 vencimientos
      const ids = (data ?? []).map((o: any) => o.id)
      let vencMap: Record<string, VencimientoResumen[]> = {}

      if (ids.length > 0) {
        const { data: venc } = await supabase
          .from('vencimientos_calendario')
          .select('id, obligacion_origen_id, titulo_instancia, periodo_key, fecha_limite, estado_cumplimiento, notas, completado_en')
          .in('obligacion_origen_id', ids)
          .order('fecha_limite', { ascending: false })
          .limit(200)

        ;(venc ?? []).forEach((v: any) => {
          if (!vencMap[v.obligacion_origen_id]) vencMap[v.obligacion_origen_id] = []
          vencMap[v.obligacion_origen_id].push(v)
        })
      }

      const normalized = (data ?? []).map((o: any) => ({
        ...o,
        catalogo: o.catalogo_id,
        vencimientos: vencMap[o.id] ?? [],
      }))

      setObligaciones(normalized)
      setLoading(false)
    }

    load()
  }, [empresaId, tick])

  const toggleEstado = useCallback(async (id: string, nuevoEstado: boolean, motivo?: string) => {
    setObligaciones(prev => prev.map(o =>
      o.id === id ? { ...o, estado: nuevoEstado, motivo_inactiva: motivo ?? o.motivo_inactiva } : o
    ))
    const { error: err } = await supabase
      .from('obligaciones_empresa')
      .update({
        estado: nuevoEstado,
        motivo_inactiva: nuevoEstado ? null : (motivo ?? null),
        activa_hasta: nuevoEstado ? null : new Date().toISOString().split('T')[0],
      })
      .eq('id', id)
    if (err) { console.error(err.message); refetch() }
  }, [refetch])

  const editarFechaVencimiento = useCallback(async (vencimientoId: string, nuevaFecha: string) => {
    setObligaciones(prev => prev.map(o => ({
      ...o,
      vencimientos: o.vencimientos.map(v =>
        v.id === vencimientoId ? { ...v, fecha_limite: nuevaFecha } : v
      ),
    })))
    const { error: err } = await supabase
      .from('vencimientos_calendario')
      .update({ fecha_limite: nuevaFecha })
      .eq('id', vencimientoId)
    if (err) { console.error(err.message); refetch() }
  }, [refetch])

  const agregarNota = useCallback(async (vencimientoId: string, nota: string) => {
    setObligaciones(prev => prev.map(o => ({
      ...o,
      vencimientos: o.vencimientos.map(v =>
        v.id === vencimientoId ? { ...v, notas: nota } : v
      ),
    })))
    const { error: err } = await supabase
      .from('vencimientos_calendario')
      .update({ notas: nota })
      .eq('id', vencimientoId)
    if (err) { console.error(err.message); refetch() }
  }, [refetch])

  return { obligaciones, loading, error, toggleEstado, editarFechaVencimiento, agregarNota, refetch }
}
