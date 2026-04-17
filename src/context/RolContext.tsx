import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export type Rol = 'owner' | 'manager' | 'viewer'

interface RolState {
  rol: Rol | null
  loading: boolean
  /** true once the initial fetch has completed — distinguishes null (loading) from null (no role / unauthenticated) */
  isLoaded: boolean
  puedeEditar: boolean
  esOwner: boolean
}

const RolContext = createContext<RolState>({
  rol: null,
  loading: true,
  isLoaded: false,
  puedeEditar: false,
  esOwner: false,
})

export function RolProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [rol, setRol] = useState<Rol | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Reset whenever user changes (sign-out, sign-in as different account)
    setRol(null)
    setLoading(true)
    setIsLoaded(false)

    if (authLoading) return
    if (!user) { setLoading(false); setIsLoaded(true); return }

    let cancelled = false
    supabase
      .from('usuarios_organizacion')
      .select('rol')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        setRol(!error && data?.rol ? (data.rol as Rol) : null)
        setLoading(false)
        setIsLoaded(true)
      })

    return () => { cancelled = true }
  }, [user?.id, authLoading])   // key on user.id — resets when account changes

  return (
    <RolContext.Provider value={{
      rol,
      loading,
      isLoaded,
      puedeEditar: rol === 'owner' || rol === 'manager',
      esOwner:     rol === 'owner',
    }}>
      {children}
    </RolContext.Provider>
  )
}

export function useRol(): RolState {
  return useContext(RolContext)
}
