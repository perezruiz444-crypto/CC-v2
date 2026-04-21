import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, CheckCircle2, ArrowRight, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const PROGRAMAS = [
  { id: 'immex',    label: 'IMMEX',                     desc: 'Industria Manufacturera, Maquiladora y de Servicios de Exportación' },
  { id: 'prosec',   label: 'PROSEC',                    desc: 'Programa de Promoción Sectorial' },
  { id: 'iva_ieps', label: 'Certificación IVA/IEPS',    desc: 'Certificación de empresas para devolución automática' },
  { id: 'padron',   label: 'Padrón de Importadores',    desc: 'Padrón general y sectorial de importadores' },
]

type Step = 1 | 2 | 3

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Si el usuario ya tiene organización, redirigir directo al app
  useEffect(() => {
    if (!user) return
    supabase
      .from('usuarios_organizacion')
      .select('organizacion_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()
      .then(({ data }) => { if (data) navigate('/app', { replace: true }) })
  }, [user, navigate])

  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Paso 1
  const [nombreOrg, setNombreOrg] = useState('')
  // Paso 2
  const [rfc, setRfc] = useState('')
  const [razonSocial, setRazonSocial] = useState('')
  // Paso 3
  const [programasSeleccionados, setProgramasSeleccionados] = useState<string[]>([])

  const togglePrograma = (id: string) => {
    setProgramasSeleccionados(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handleComplete = async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      // 1. Crear org + membership + empresa en una sola transacción (SECURITY DEFINER)
      const { error: fnError } = await supabase.rpc('crear_organizacion_inicial', {
        p_nombre_cuenta: nombreOrg,
        p_rfc:           rfc,
        p_razon_social:  razonSocial,
        p_programas:     programasSeleccionados,
      })

      if (fnError) throw fnError

      // crear_organizacion_inicial ya crea obligaciones_empresa y proyecta
      // vencimientos en una sola transacción — no se necesita nada más aquí.
      navigate('/app')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al configurar tu cuenta. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--snow)' }}>
            Calendario<span style={{ color: 'var(--em)' }}>Compliance</span>
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--snow)', marginTop: 20, marginBottom: 8 }}>
            Configura tu cuenta
          </h1>
          <p style={mutedStyle}>Solo toma 2 minutos</p>
        </div>

        {/* Steps indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 36 }}>
          {([1, 2, 3] as Step[]).map(n => (
            <div key={n} style={{
              flex: 1, height: 4, borderRadius: 9999,
              background: n <= step ? 'var(--em)' : 'var(--ink-4)',
              transition: 'background 300ms',
            }} />
          ))}
        </div>

        {/* ── Paso 1: Nombre de organización ── */}
        {step === 1 && (
          <div>
            <div style={stepIconWrap}>
              <Building2 size={22} color="var(--em)" />
            </div>
            <h2 style={stepHeading}>¿Cómo se llama tu organización?</h2>
            <p style={{ ...mutedStyle, marginBottom: 24 }}>
              Puede ser tu empresa, despacho o nombre de proyecto.
            </p>
            <input
              type="text"
              autoFocus
              value={nombreOrg}
              onChange={e => setNombreOrg(e.target.value)}
              style={inputStyle}
              placeholder="Ej: Importaciones del Norte SA de CV"
            />
            <button
              className="btn btn-primary"
              disabled={!nombreOrg.trim()}
              onClick={() => setStep(2)}
              style={{ width: '100%', justifyContent: 'center', marginTop: 24 }}
            >
              Continuar <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ── Paso 2: Datos de la empresa ── */}
        {step === 2 && (
          <div>
            <div style={stepIconWrap}>
              <Building2 size={22} color="var(--em)" />
            </div>
            <h2 style={stepHeading}>Tu primera empresa</h2>
            <p style={{ ...mutedStyle, marginBottom: 24 }}>
              RFC y razón social que auditarás. Podrás agregar más después.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>RFC</label>
                <input
                  type="text"
                  value={rfc}
                  onChange={e => setRfc(e.target.value.toUpperCase())}
                  style={inputStyle}
                  placeholder="XAXX010101000"
                  maxLength={13}
                />
              </div>
              <div>
                <label style={labelStyle}>Razón social</label>
                <input
                  type="text"
                  value={razonSocial}
                  onChange={e => setRazonSocial(e.target.value)}
                  style={inputStyle}
                  placeholder="Importaciones del Norte SA de CV"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                className="btn btn-ghost-dark"
                onClick={() => setStep(1)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Atrás
              </button>
              <button
                className="btn btn-primary"
                disabled={!rfc.trim() || !razonSocial.trim()}
                onClick={() => setStep(3)}
                style={{ flex: 2, justifyContent: 'center' }}
              >
                Continuar <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Paso 3: Programas activos ── */}
        {step === 3 && (
          <div>
            <div style={stepIconWrap}>
              <CheckCircle2 size={22} color="var(--em)" />
            </div>
            <h2 style={stepHeading}>¿Qué programas tiene tu empresa?</h2>
            <p style={{ ...mutedStyle, marginBottom: 24 }}>
              Selecciona los que aplican. Activaremos sus obligaciones automáticamente.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {PROGRAMAS.map(({ id, label, desc }) => {
                const selected = programasSeleccionados.includes(id)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => togglePrograma(id)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14,
                      padding: '14px 16px',
                      background: selected ? 'rgb(16 185 129 / 0.1)' : 'var(--ink)',
                      border: `1.5px solid ${selected ? 'var(--em)' : 'var(--ink-4)'}`,
                      borderRadius: 'var(--r-lg)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'border-color 150ms, background 150ms',
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: 6,
                      border: `2px solid ${selected ? 'var(--em)' : 'var(--ink-4)'}`,
                      background: selected ? 'var(--em)' : 'transparent',
                      flexShrink: 0, marginTop: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 150ms',
                    }}>
                      {selected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--snow)', marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: 12, color: 'rgb(255 255 255 / 0.4)', lineHeight: 1.5 }}>{desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {error && (
              <p role="alert" aria-live="assertive" style={{ fontSize: 13, color: 'var(--danger)', background: 'rgb(239 68 68 / 0.1)', padding: '10px 14px', borderRadius: 'var(--r-md)', marginBottom: 16 }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-ghost-dark"
                onClick={() => setStep(2)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Atrás
              </button>
              <button
                className="btn btn-primary"
                disabled={loading}
                onClick={handleComplete}
                style={{ flex: 2, justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Configurando...' : 'Ir a mi calendario'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'rgb(255 255 255 / 0.3)', textAlign: 'center', marginTop: 14 }}>
              Podrás agregar o quitar programas después
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Estilos ─────────────────────────────────────────────────
const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--ink)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  fontFamily: 'var(--font-body)',
}

const cardStyle: React.CSSProperties = {
  background: 'var(--ink-2)',
  border: '1px solid var(--ink-4)',
  borderRadius: 'var(--r-2xl)',
  padding: '40px 36px',
  width: '100%',
  maxWidth: 480,
  boxShadow: '0 20px 60px rgb(0 0 0 / 0.4)',
}

const stepIconWrap: React.CSSProperties = {
  width: 48, height: 48,
  background: 'rgb(16 185 129 / 0.1)',
  border: '1px solid rgb(16 185 129 / 0.2)',
  borderRadius: 'var(--r-xl)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  marginBottom: 16,
}

const stepHeading: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 19, fontWeight: 700,
  color: 'var(--snow)',
  marginBottom: 8,
}

const mutedStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'rgb(255 255 255 / 0.5)',
  lineHeight: 1.6,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13, fontWeight: 500,
  color: 'rgb(255 255 255 / 0.7)',
  marginBottom: 7,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--ink)',
  border: '1px solid var(--ink-4)',
  borderRadius: 'var(--r-md)',
  padding: '11px 14px',
  fontSize: 14, color: 'var(--snow)',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 150ms',
}
