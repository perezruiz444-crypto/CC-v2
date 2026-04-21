import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface ResumenAnual {
  totalAnual: number
  completadosAnual: number
  pendientesAnual: number
  vencidosAnual: number
  porcentaje: number
  loading: boolean
}

export function useResumenAnual(empresaId: string | null): ResumenAnual {
  const [stats, setStats] = useState({
    totalAnual: 0,
    completadosAnual: 0,
    pendientesAnual: 0,
    vencidosAnual: 0,
    porcentaje: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!empresaId) { setLoading(false); return }

    async function load() {
      setLoading(true)
      const anio = new Date().getFullYear()

      const { data, error } = await supabase
        .from('vencimientos_calendario')
        .select('estado_cumplimiento')
        .eq('empresa_id', empresaId)
        .gte('fecha_limite', `${anio}-01-01`)
        .lte('fecha_limite', `${anio}-12-31`)

      if (error || !data) { setLoading(false); return }

      const total = data.length
      const completados = data.filter(v => v.estado_cumplimiento === 'completado').length
      const pendientes  = data.filter(v => v.estado_cumplimiento === 'pendiente').length
      const vencidos    = data.filter(v => v.estado_cumplimiento === 'vencido').length
      const porcentaje  = total > 0 ? Math.round((completados / total) * 100) : 0

      setStats({ totalAnual: total, completadosAnual: completados, pendientesAnual: pendientes, vencidosAnual: vencidos, porcentaje })
      setLoading(false)
    }

    load()
  }, [empresaId])

  return { ...stats, loading }
}
