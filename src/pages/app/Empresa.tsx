import { useState } from 'react'
import { useEmpresa } from '../../hooks/useEmpresa'
import { useRol } from '../../hooks/useRol'
import { Building2, CalendarDays, Hash, CheckCircle2, Sparkles, X, AlertCircle, EyeOff } from 'lucide-react'

const PROGRAMAS: Array<{
  id: string; label: string; color: string;
  desc: string; icon: string; necesitaAncla: boolean;
}> = [
  {
    id: 'immex',
    label: 'IMMEX',
    color: 'var(--em)',
    icon: '🏭',
    necesitaAncla: true,
    desc: 'Maquila y manufactura bajo el programa IMMEX. Incluye control de inventarios, reporte anual de ventas y cumplimiento VUCEM.',
  },
  {
    id: 'prosec',
    label: 'PROSEC',
    color: 'var(--info)',
    icon: '⚙️',
    necesitaAncla: true,
    desc: 'Programa de Promoción Sectorial. Gestiona renovaciones, reportes anuales y certificados de destino.',
  },
  {
    id: 'iva_ieps',
    label: 'Certificación IVA/IEPS',
    color: 'var(--warn)',
    icon: '🔖',
    necesitaAncla: true,
    desc: 'Certificación del SAT. El sistema calculará la fecha de renovación automáticamente usando tu fecha de autorización.',
  },
  {
    id: 'padron',
    label: 'Padrón Importadores',
    color: '#a855f7',
    icon: '📋',
    necesitaAncla: false,
    desc: 'Alta y mantenimiento en el Padrón de Importadores. Vencimientos basados en el calendario SAT.',
  },
]

function formatFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatFechaCorta(fecha: string): string {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Estado por programa: { fecha_autorizacion } que guardamos localmente después de activar
type ProgramasMeta = Record<string, { fecha_autorizacion: string }>

export default function Empresa() {
  const { empresa, organizacion, loading, activarPrograma, desactivarPrograma } = useEmpresa()
  const { puedeEditar, rol } = useRol()

  // Modal de fecha ancla
  const [modalPrograma, setModalPrograma] = useState<string | null>(null)
  const [fechaInput, setFechaInput] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [errorModal, setErrorModal] = useState<string | null>(null)

  // Meta local (fecha de autorización guardada por programa)
  const [programasMeta, setProgramasMeta] = useState<ProgramasMeta>({})

  // Mensaje de éxito tras activar
  const [mensajeExito, setMensajeExito] = useState<{ programa: string; count: number } | null>(null)

  // Procesando desactivación
  const [desactivando, setDesactivando] = useState<string | null>(null)

  if (loading) return <SkeletonEmpresa />

  if (!empresa) {
    return (
      <div style={{
        background: '#FFFFFF', border: '1px solid #E2E8F0',
        borderRadius: 'var(--r-xl)', padding: '64px 24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }} aria-hidden="true">🏢</div>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>Sin empresa registrada</p>
        <p style={{ fontSize: 13, color: '#94A3B8' }}>Completa el onboarding para configurar tu primera empresa.</p>
      </div>
    )
  }

  const programasActivos = empresa.programas_activos ?? []

  // Al hacer clic en toggle
  const handleToggle = (programaId: string, activo: boolean) => {
    const prog = PROGRAMAS.find(p => p.id === programaId)!

    if (!activo) {
      // Activar: si necesita ancla, abrir modal; si no, activar directo con fecha hoy
      if (prog.necesitaAncla) {
        setFechaInput('')
        setErrorModal(null)
        setModalPrograma(programaId)
      } else {
        handleActivarConFecha(programaId, new Date().toISOString().split('T')[0])
      }
    } else {
      // Desactivar
      handleDesactivar(programaId)
    }
  }

  const handleActivarConFecha = async (programaId: string, fecha: string) => {
    setGuardando(true)
    setErrorModal(null)

    const resultado = await activarPrograma(programaId, fecha)
    setGuardando(false)

    if (resultado === null) {
      setErrorModal('Ocurrió un error al activar el programa. Intenta de nuevo.')
      return
    }

    // Guardar meta local
    setProgramasMeta(prev => ({ ...prev, [programaId]: { fecha_autorizacion: fecha } }))
    setModalPrograma(null)
    setFechaInput('')

    if (resultado.proyectados > 0) {
      setMensajeExito({ programa: programaId, count: resultado.proyectados })
      setTimeout(() => setMensajeExito(null), 6000)
    }
  }

  const handleDesactivar = async (programaId: string) => {
    setDesactivando(programaId)
    await desactivarPrograma(programaId)
    setDesactivando(null)
    setProgramasMeta(prev => {
      const next = { ...prev }
      delete next[programaId]
      return next
    })
  }

  const handleGuardarModal = () => {
    if (!fechaInput) return
    if (modalPrograma) {
      handleActivarConFecha(modalPrograma, fechaInput)
    }
  }

  const progModal = modalPrograma ? PROGRAMAS.find(p => p.id === modalPrograma) : null

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
          Mi Empresa
        </h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>
          {organizacion?.nombre_cuenta}
        </p>
      </div>

      {/* Card principal */}
      <div style={{
        background: '#FFFFFF', border: '1px solid #E2E8F0',
        borderRadius: 'var(--r-xl)', padding: '24px',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 22 }}>
          <div style={{
            width: 50, height: 50, borderRadius: 'var(--r-lg)', flexShrink: 0,
            background: 'var(--em-subtle)', border: '1px solid rgb(16 185 129 / 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={20} color="var(--em)" aria-hidden="true" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
              {empresa.razon_social}
            </h2>
            <p style={{ fontSize: 13, color: '#64748B', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
              RFC: {empresa.rfc}
            </p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <DatoCard icon={<Hash size={13} />} label="RFC" value={empresa.rfc} mono />
          <DatoCard icon={<CalendarDays size={13} />} label="Alta en el sistema" value={formatFecha(empresa.created_at)} />
        </div>
      </div>

      {/* Programas — toggles */}
      <div style={{
        background: '#FFFFFF', border: '1px solid #E2E8F0',
        borderRadius: 'var(--r-xl)', overflow: 'hidden',
        marginBottom: 20,
      }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 3 }}>
              Programas activos
            </h2>
            <p style={{ fontSize: 12, color: '#94A3B8' }}>
              Al activar un programa, el sistema proyecta automáticamente sus vencimientos en el calendario.
            </p>
          </div>
          {rol === 'viewer' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              padding: '4px 10px', borderRadius: 'var(--r-full)',
              background: '#F8FAFC', border: '1px solid #E2E8F0',
            }}>
              <EyeOff size={11} color="#CBD5E1" />
              <span style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Solo lectura
              </span>
            </div>
          )}
        </div>

        {/* Mensaje éxito */}
        {mensajeExito && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 24px',
            background: 'var(--em-subtle)', borderBottom: '1px solid rgb(16 185 129 / 0.2)',
            animation: 'fadeInBanner 300ms var(--ease-spring)',
          }}>
            <Sparkles size={15} color="var(--em)" />
            <p style={{ fontSize: 13, color: 'var(--em)', fontWeight: 600 }}>
              ¡Listo! Se proyectaron {mensajeExito.count} vencimientos para{' '}
              {PROGRAMAS.find(p => p.id === mensajeExito.programa)?.label}. Revisa tu calendario.
            </p>
            <CheckCircle2 size={15} color="var(--em)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
          </div>
        )}

        <div>
          {PROGRAMAS.map((prog, i) => {
            const activo = programasActivos.includes(prog.id)
            const enProceso = desactivando === prog.id || (guardando && modalPrograma === prog.id)
            const bloqueado = !puedeEditar
            const meta = programasMeta[prog.id]

            return (
              <div key={prog.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 16,
                padding: '18px 24px',
                borderBottom: i < PROGRAMAS.length - 1 ? '1px solid #E2E8F0' : 'none',
                background: activo ? `color-mix(in srgb, ${prog.color} 4%, transparent)` : 'transparent',
                transition: 'background var(--dur-base)',
              }}>
                {/* Icono */}
                <div style={{
                  width: 42, height: 42, flexShrink: 0, borderRadius: 'var(--r-lg)',
                  background: activo ? `color-mix(in srgb, ${prog.color} 14%, transparent)` : '#F1F5F9',
                  border: `1px solid ${activo ? `color-mix(in srgb, ${prog.color} 30%, transparent)` : '#E2E8F0'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, transition: 'all var(--dur-base)',
                }} aria-hidden="true">
                  {prog.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <p style={{
                      fontSize: 14, fontWeight: 700,
                      color: activo ? prog.color : 'var(--snow)',
                      transition: 'color var(--dur-base)',
                    }}>
                      {prog.label}
                    </p>
                    {activo && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: prog.color,
                        background: `color-mix(in srgb, ${prog.color} 12%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${prog.color} 25%, transparent)`,
                        padding: '2px 7px', borderRadius: 'var(--r-full)', letterSpacing: '0.05em',
                      }}>
                        ACTIVO
                      </span>
                    )}
                    {prog.necesitaAncla && !activo && (
                      <span style={{
                        fontSize: 10, color: '#94A3B8',
                        background: '#F1F5F9',
                        padding: '2px 7px', borderRadius: 'var(--r-full)',
                      }}>
                        Requiere fecha de autorización
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6, marginBottom: meta ? 6 : 0 }}>
                    {prog.desc}
                  </p>
                  {/* Fecha ancla guardada */}
                  {activo && meta && (
                    <p style={{ fontSize: 11, color: `color-mix(in srgb, ${prog.color} 70%, transparent)` }}>
                      Fecha base: {formatFechaCorta(meta.fecha_autorizacion)}
                    </p>
                  )}
                </div>

                {/* Toggle */}
                <button
                  onClick={() => !bloqueado && handleToggle(prog.id, activo)}
                  disabled={enProceso || bloqueado}
                  aria-pressed={activo}
                  aria-label={bloqueado ? `${prog.label} — solo lectura` : `${activo ? 'Desactivar' : 'Activar'} ${prog.label}`}
                  title={bloqueado ? 'Solo los administradores pueden cambiar programas' : undefined}
                  style={{
                    flexShrink: 0,
                    width: 48, height: 28,
                    borderRadius: 'var(--r-full)',
                    background: activo ? prog.color : '#E2E8F0',
                    border: 'none',
                    cursor: bloqueado ? 'not-allowed' : enProceso ? 'not-allowed' : 'pointer',
                    position: 'relative',
                    transition: 'background var(--dur-base)',
                    opacity: enProceso ? 0.5 : bloqueado ? 0.4 : 1,
                    minWidth: 48, minHeight: 44,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    left: activo ? 'calc(100% - 22px)' : '4px',
                    width: 20, height: 20,
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'left var(--dur-base) var(--ease-spring)',
                    boxShadow: '0 1px 4px rgb(0 0 0 / 0.3)',
                    display: 'block',
                  }} />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Nota */}
      <div style={{
        background: 'var(--em-subtle)', border: '1px solid rgb(16 185 129 / 0.15)',
        borderRadius: 'var(--r-lg)', padding: '14px 18px',
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <div style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }} aria-hidden="true">💡</div>
        <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.65 }}>
          La fecha de autorización es la fecha oficial en que la autoridad emitió tu programa. Se usa para calcular renovaciones dinámicas como la Certificación IVA/IEPS. Si la desconoces, búscala en el oficio de resolución original.
        </p>
      </div>

      {/* Modal — Fecha Ancla */}
      {modalPrograma && progModal && (
        <ModalFechaAncla
          programa={progModal}
          fechaInput={fechaInput}
          onFechaChange={setFechaInput}
          onGuardar={handleGuardarModal}
          onCerrar={() => { setModalPrograma(null); setFechaInput(''); setErrorModal(null) }}
          guardando={guardando}
          error={errorModal}
        />
      )}

      {/* @keyframes defined globally in index.css */}
    </div>
  )
}

// ── Modal Fecha Ancla ────────────────────────────────────────

function ModalFechaAncla({
  programa, fechaInput, onFechaChange, onGuardar, onCerrar, guardando, error
}: {
  programa: typeof PROGRAMAS[0]
  fechaInput: string
  onFechaChange: (v: string) => void
  onGuardar: () => void
  onCerrar: () => void
  guardando: boolean
  error: string | null
}) {
  const fechaValida = fechaInput.length === 10   // YYYY-MM-DD

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onCerrar}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgb(0 0 0 / 0.65)', backdropFilter: 'blur(4px)',
        }}
        aria-hidden="true"
      />
      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ancla-title"
        style={{
          position: 'fixed', inset: 0, zIndex: 101,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, pointerEvents: 'none',
        }}
      >
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0',
          borderRadius: 'var(--r-2xl)', padding: '32px 28px',
          width: '100%', maxWidth: 440,
          pointerEvents: 'all',
          animation: 'slideInModal 240ms var(--ease-spring)',
        }}>
          {/* Header modal */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--r-lg)',
                background: `color-mix(in srgb, ${programa.color} 14%, transparent)`,
                border: `1px solid color-mix(in srgb, ${programa.color} 30%, transparent)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }} aria-hidden="true">
                {programa.icon}
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#64748B', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Activar programa
                </p>
                <h2 id="ancla-title" style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: programa.color }}>
                  {programa.label}
                </h2>
              </div>
            </div>
            <button
              onClick={onCerrar}
              aria-label="Cerrar"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#94A3B8', padding: 8, borderRadius: 'var(--r-md)',
                minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={17} />
            </button>
          </div>

          {/* Descripción */}
          <div style={{
            background: '#F1F5F9', borderRadius: 'var(--r-lg)',
            padding: '14px 16px', marginBottom: 24,
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <AlertCircle size={15} color={programa.color} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.65 }}>
              Para automatizar los vencimientos, ingresa la <strong style={{ color: '#0F172A', fontWeight: 600 }}>Fecha de Autorización original</strong> del programa <strong style={{ color: programa.color }}>{programa.label}</strong>. Es la fecha del oficio emitido por la autoridad.
            </p>
          </div>

          {/* Campo de fecha */}
          <div style={{ marginBottom: 24 }}>
            <label
              htmlFor="fecha-autorizacion"
              style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}
            >
              Fecha de Autorización
            </label>
            <input
              id="fecha-autorizacion"
              type="date"
              value={fechaInput}
              onChange={e => onFechaChange(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%', padding: '12px 14px',
                background: '#F1F5F9',
                border: `1.5px solid ${fechaValida ? programa.color : '#E2E8F0'}`,
                borderRadius: 'var(--r-lg)',
                fontSize: 15, color: '#0F172A',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                transition: 'border-color var(--dur-fast)',
                colorScheme: 'light',
              }}
              onFocus={e => !fechaValida && (e.target.style.borderColor = 'var(--em)')}
              onBlur={e => !fechaValida && (e.target.style.borderColor = '#E2E8F0')}
            />
            {fechaValida && (
              <p style={{ fontSize: 12, color: programa.color, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={12} aria-hidden="true" />
                {new Date(fechaInput + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              style={{
                display: 'flex', gap: 8, alignItems: 'flex-start',
                padding: '10px 14px', borderRadius: 'var(--r-md)',
                background: 'rgb(239 68 68 / 0.1)', border: '1px solid rgb(239 68 68 / 0.25)',
                marginBottom: 20,
              }}
            >
              <AlertCircle size={14} color="var(--danger)" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</p>
            </div>
          )}

          {/* Botones */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onCerrar}
              disabled={guardando}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 'var(--r-full)',
                background: 'none', border: '1px solid #E2E8F0',
                color: '#64748B', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', minHeight: 44,
              }}
            >
              Cancelar
            </button>
            <button
              onClick={onGuardar}
              disabled={!fechaValida || guardando}
              style={{
                flex: 2, padding: '12px 16px', borderRadius: 'var(--r-full)',
                background: fechaValida && !guardando ? programa.color : '#E2E8F0',
                border: 'none',
                color: fechaValida && !guardando ? '#fff' : '#94A3B8',
                fontSize: 13, fontWeight: 700,
                cursor: fechaValida && !guardando ? 'pointer' : 'not-allowed',
                transition: 'all var(--dur-fast)',
                minHeight: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {guardando ? (
                <>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 600ms linear infinite', display: 'inline-block' }} />
                  Guardando...
                </>
              ) : 'Guardar y Activar'}
            </button>
          </div>
        </div>
      </div>

      {/* @keyframes defined globally in index.css */}
    </>
  )
}

// ── Subcomponentes ───────────────────────────────────────────

function DatoCard({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ background: '#F1F5F9', borderRadius: 'var(--r-lg)', padding: '13px 15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: '#94A3B8' }}>
        {icon}
        <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
      </div>
      <p style={{
        fontSize: 13, fontWeight: 600, color: '#0F172A',
        fontFamily: mono ? 'monospace' : 'var(--font-body)',
        letterSpacing: mono ? '0.05em' : 'normal',
      }}>
        {value}
      </p>
    </div>
  )
}

function SkeletonEmpresa() {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 'var(--r-xl)', padding: 24 }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 22 }}>
        <div style={{ width: 50, height: 50, borderRadius: 'var(--r-lg)', background: '#F1F5F9', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 16, width: '50%', background: '#F1F5F9', borderRadius: 4, marginBottom: 10 }} />
          <div style={{ height: 12, width: '28%', background: '#E2E8F0', borderRadius: 4 }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[1,2].map(i => <div key={i} style={{ height: 62, background: '#F1F5F9', borderRadius: 'var(--r-lg)' }} />)}
      </div>
    </div>
  )
}
