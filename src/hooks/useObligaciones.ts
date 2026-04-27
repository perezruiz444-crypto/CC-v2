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
  ultima_revision: string | null
  estado_revision: 'vigente' | 'en_riesgo' | 'incumplimiento' | 'sin_revisar' | null
  notas_revision: string | null
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
  registrarRevision: (id: string, estado: 'vigente' | 'en_riesgo' | 'incumplimiento', notas?: string) => Promise<void>
  crearObligacionPersonalizada: (nombre: string, periodicidad: string, descripcion?: string) => Promise<void>
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
          ultima_revision, estado_revision, notas_revision,
          catalogo:catalogo_id (
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

      // ⚡ Bolt: Use a single O(N) loop to process API response instead of chained .filter().map()
      // This avoids redundant array traversals and garbage collection overhead
      const huerfanas: any[] = []
      const normalized: any[] = []

      for (const o of (data ?? [])) {
        if (o.catalogo == null) {
          huerfanas.push(o.id)
        } else {
          normalized.push({
            ...o,
            vencimientos: vencMap[o.id] ?? [],
          })
        }
      }

      if (huerfanas.length > 0) {
        console.warn(`[useObligaciones] ${huerfanas.length} fila(s) sin catálogo ignoradas:`, huerfanas)
      }

      setObligaciones(normalized)
      setLoading(false)
    }

    load()
  }, [empresaId, tick])

  useEffect(() => {
    const handler = () => setTick(t => t + 1)
    window.addEventListener('programas-updated', handler)
    return () => window.removeEventListener('programas-updated', handler)
  }, [])

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

  const registrarRevision = useCallback(async (
    obligacionId: string,
    estadoRevision: 'vigente' | 'en_riesgo' | 'incumplimiento',
    notasRevision?: string
  ) => {
    const hoy = new Date().toISOString().split('T')[0]

    setObligaciones(prev => prev.map(o =>
      o.id === obligacionId
        ? { ...o, ultima_revision: hoy, estado_revision: estadoRevision, notas_revision: notasRevision ?? o.notas_revision }
        : o
    ))

    const { error: err } = await supabase
      .from('obligaciones_empresa')
      .update({
        ultima_revision: hoy,
        estado_revision: estadoRevision,
        notas_revision: notasRevision ?? null,
      })
      .eq('id', obligacionId)

    if (err) { console.error(err.message); refetch() }
  }, [refetch])

  const crearObligacionPersonalizada = useCallback(async (
    nombre: string,
    periodicidad: string,
    descripcion?: string
  ) => {
    if (!empresaId) throw new Error('empresaId requerido')

    // Obtener usuario actual y su organizacion_id
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    // Obtener organizacion_id del usuario
    const { data: userOrg, error: userOrgErr } = await supabase
      .from('usuarios_organizacion')
      .select('organizacion_id')
      .eq('user_id', user.id)
      .single()

    if (userOrgErr || !userOrg) {
      throw new Error('No se encontró la organización del usuario')
    }

    const organizacionId = userOrg.organizacion_id

    // Generar UUID para el nuevo catálogo
    const catalogoId = crypto.randomUUID()

    // Mapear periodicidad a dia_vencimiento y mes_vencimiento
    // Para obligaciones personalizadas, usamos días por defecto
    let diaVencimiento = 15
    let mesVencimiento = null

    switch (periodicidad) {
      case 'mensual':
        diaVencimiento = 15 // Medio del mes
        break
      case 'bimestral':
        diaVencimiento = 15
        break
      case 'trimestral':
        diaVencimiento = 15
        break
      case 'anual':
        diaVencimiento = 15
        mesVencimiento = 6 // Junio
        break
    }

    // 1. Insertar en obligaciones_catalogo (con organizacion_id)
    const { error: catErr } = await supabase
      .from('obligaciones_catalogo')
      .insert({
        id: catalogoId,
        nombre,
        descripcion: descripcion || null,
        categoria: 'general',
        periodicidad,
        dia_vencimiento: diaVencimiento,
        mes_vencimiento: mesVencimiento,
        tipo_calculo: 'estatico',
        activa: true,
        organizacion_id: organizacionId,
      })

    if (catErr) throw new Error(`Error al crear obligación: ${catErr.message}`)

    // 2. Insertar en obligaciones_empresa (vincular a esta empresa)
    const { error: oemErr } = await supabase
      .from('obligaciones_empresa')
      .insert({
        empresa_id: empresaId,
        catalogo_id: catalogoId,
        estado: true,
        activa_desde: new Date().toISOString().split('T')[0],
      })

    if (oemErr) {
      // Cleanup: eliminar el catálogo recién creado para no dejar huérfanos
      await supabase.from('obligaciones_catalogo').delete().eq('id', catalogoId)
      throw new Error(`Error al vincular obligación: ${oemErr.message}`)
    }

    // 3. Llamar a la stored procedure para proyectar vencimientos del año actual
    const currentYear = new Date().getFullYear()
    const { error: projErr } = await supabase
      .rpc('proyectar_vencimientos', {
        p_empresa_id: empresaId,
        p_anio: currentYear,
      })

    if (projErr) {
      console.warn(`Advertencia al proyectar vencimientos: ${projErr.message}`)
      // No lanzamos error aquí, la obligación ya fue creada
    }

    // 4. Refetch para actualizar la lista
    refetch()
  }, [empresaId, refetch])

  return {
    obligaciones,
    loading,
    error,
    toggleEstado,
    editarFechaVencimiento,
    agregarNota,
    registrarRevision,
    crearObligacionPersonalizada,
    refetch
  }
}
