import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface Empresa {
  id: string
  organizacion_id: string
  rfc: string
  razon_social: string
  programas_activos: string[]
  created_at: string
}

export interface Organizacion {
  id: string
  nombre_cuenta: string
  plan_actual: string
}

export interface ActivarProgramaResult {
  proyectados: number
  limpiados: number
}

interface UseEmpresaResult {
  empresa: Empresa | null
  organizacion: Organizacion | null
  loading: boolean
  error: string | null
  activarPrograma: (programa: string, fechaAutorizacion: string) => Promise<ActivarProgramaResult | null>
  desactivarPrograma: (programa: string) => Promise<ActivarProgramaResult | null>
}

export function useEmpresa(): UseEmpresaResult {
  const { user } = useAuth()
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [organizacion, setOrganizacion] = useState<Organizacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    async function load() {
      setLoading(true)
      setError(null)

      const { data: orgData, error: orgError } = await supabase
        .from('usuarios_organizacion')
        .select('organizacion_id, rol, organizaciones(id, nombre_cuenta, plan_actual)')
        .eq('user_id', user!.id)
        .single()

      if (orgError) {
        setError(orgError.message)
        setLoading(false)
        return
      }

      const org = (orgData as any)?.organizaciones as Organizacion
      setOrganizacion(org)

      // TODO: multi-empresa — actualmente carga solo la primera empresa de la organización.
      // Cuando se soporte manejar múltiples empresas por org, añadir selector de empresa activa.
      const { data: empresaData, error: empresaError } = await supabase
        .from('empresas')
        .select('*')
        .eq('organizacion_id', org.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (empresaError && empresaError.code !== 'PGRST116') {
        setError(empresaError.message)
      } else {
        setEmpresa(empresaData as Empresa)
      }

      setLoading(false)
    }

    load()
  }, [user])

  // Activa un programa vía Edge Function SQL — requiere fecha de autorización
  const activarPrograma = useCallback(async (
    programa: string,
    fechaAutorizacion: string,    // formato ISO 'YYYY-MM-DD'
  ): Promise<ActivarProgramaResult | null> => {
    if (!empresa) return null

    // Optimistic: agregar al array local inmediatamente
    setEmpresa(prev => {
      if (!prev) return prev
      const ya = (prev.programas_activos ?? []).includes(programa)
      return ya ? prev : { ...prev, programas_activos: [...prev.programas_activos, programa] }
    })

    const { data, error: err } = await supabase.rpc('activar_programa_empresa', {
      p_empresa_id:         empresa.id,
      p_programa:           programa,
      p_fecha_autorizacion: fechaAutorizacion,
      p_activar:            true,
    })

    if (err) {
      // Revert optimistic
      setEmpresa(prev => prev ? { ...prev, programas_activos: prev.programas_activos.filter(p => p !== programa) } : prev)
      console.error(err.message)
      return null
    }

    return {
      proyectados: (data as any)?.proyectados ?? 0,
      limpiados:   (data as any)?.limpiados   ?? 0,
    }
  }, [empresa])

  // Desactiva un programa — limpia vencimientos futuros pendientes
  const desactivarPrograma = useCallback(async (
    programa: string,
  ): Promise<ActivarProgramaResult | null> => {
    if (!empresa) return null

    // Optimistic: quitar del array local
    setEmpresa(prev =>
      prev ? { ...prev, programas_activos: prev.programas_activos.filter(p => p !== programa) } : prev
    )

    const { data, error: err } = await supabase.rpc('activar_programa_empresa', {
      p_empresa_id:         empresa.id,
      p_programa:           programa,
      p_fecha_autorizacion: null,
      p_activar:            false,
    })

    if (err) {
      // Revert
      setEmpresa(prev => prev ? { ...prev, programas_activos: [...(prev.programas_activos ?? []), programa] } : prev)
      console.error(err.message)
      return null
    }

    return {
      proyectados: (data as any)?.proyectados ?? 0,
      limpiados:   (data as any)?.limpiados   ?? 0,
    }
  }, [empresa])

  return { empresa, organizacion, loading, error, activarPrograma, desactivarPrograma }
}
