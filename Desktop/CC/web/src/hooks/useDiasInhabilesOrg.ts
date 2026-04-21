import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface DiaInhabilOrg {
  id: string
  organizacion_id: string
  fecha: string
  descripcion: string | null
  created_at: string
}

interface UseDiasInhabilesOrgResult {
  dias: DiaInhabilOrg[]
  loading: boolean
  error: string | null
  agregar: (fecha: string, descripcion?: string) => Promise<void>
  eliminar: (id: string) => Promise<void>
  refetch: () => void
}

export function useDiasInhabilesOrg(organizacionId: string | null): UseDiasInhabilesOrgResult {
  const [dias, setDias] = useState<DiaInhabilOrg[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    if (!organizacionId) { setLoading(false); return }

    async function load() {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('dias_inhabiles_org')
        .select('*')
        .eq('organizacion_id', organizacionId)
        .order('fecha', { ascending: true })

      if (err) { setError(err.message); setLoading(false); return }
      setDias(data ?? [])
      setLoading(false)
    }

    load()
  }, [organizacionId, tick])

  const agregar = useCallback(async (fecha: string, descripcion?: string) => {
    if (!organizacionId) return
    const { error: err } = await supabase
      .from('dias_inhabiles_org')
      .insert({ organizacion_id: organizacionId, fecha, descripcion: descripcion ?? null })

    if (err) { setError(err.message); return }
    refetch()
  }, [organizacionId, refetch])

  const eliminar = useCallback(async (id: string) => {
    const backup = dias.find(d => d.id === id)
    setDias(prev => prev.filter(d => d.id !== id))
    const { error: err } = await supabase
      .from('dias_inhabiles_org')
      .delete()
      .eq('id', id)

    if (err && backup) {
      setDias(prev => [...prev, backup].sort((a, b) => a.fecha.localeCompare(b.fecha)))
      setError(err.message)
    }
  }, [dias])

  return { dias, loading, error, agregar, eliminar, refetch }
}
