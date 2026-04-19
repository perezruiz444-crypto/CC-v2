import { useState } from 'react'
import { Settings, Lock, Plus, Trash2, CalendarDays, AlertCircle } from 'lucide-react'
import { useEmpresa } from '../../hooks/useEmpresa'
import { useRol } from '../../hooks/useRol'
import { useDiasInhabilesOrg } from '../../hooks/useDiasInhabilesOrg'

const PLANES_PAGO = ['equipo', 'agencia', 'enterprise']

function formatFecha(fecha: string): string {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function Ajustes() {
  const { organizacion, loading: loadingEmpresa } = useEmpresa()
  const { esOwner, puedeEditar } = useRol()

  const esPlanPago = PLANES_PAGO.includes(organizacion?.plan_actual ?? '')

  if (loadingEmpresa) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2].map(i => (
          <div key={i} style={{ height: 80, background: 'var(--ink-2)', borderRadius: 'var(--r-xl)', border: '1px solid var(--ink-3)' }} />
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Settings size={20} color="var(--em)" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 700, color: 'var(--snow)' }}>
            Ajustes
          </h1>
        </div>
        <p style={{ fontSize: 13, color: 'rgb(255 255 255 / 0.4)' }}>
          Configuración de tu organización · Plan {organizacion?.plan_actual ?? 'gratis'}
        </p>
      </div>

      {/* Paywall: plan gratis */}
      {!esPlanPago ? (
        <PaywallCard planActual={organizacion?.plan_actual ?? 'gratis'} />
      ) : (
        <DiasInhabilesSection
          organizacionId={organizacion?.id ?? null}
          esOwner={esOwner}
          puedeEditar={puedeEditar}
        />
      )}
    </div>
  )
}

// ── Paywall ─────────────────────────────────────────────────────────────────

function PaywallCard({ planActual }: { planActual: string }) {
  return (
    <div style={{
      background: 'var(--ink-2)',
      border: '1px solid rgb(255 255 255 / 0.08)',
      borderRadius: 'var(--r-xl)',
      padding: '48px 32px',
      textAlign: 'center',
      maxWidth: 480,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgb(255 255 255 / 0.05)',
        border: '1px solid var(--ink-4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <Lock size={26} color="rgb(255 255 255 / 0.3)" />
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--snow)', marginBottom: 10 }}>
        Funciones exclusivas de planes de pago
      </h2>
      <p style={{ fontSize: 13, color: 'rgb(255 255 255 / 0.45)', lineHeight: 1.6, marginBottom: 28 }}>
        Los ajustes avanzados — como agregar días inhábiles personalizados para tu organización — están disponibles en los planes <strong style={{ color: 'var(--em)' }}>Equipo</strong>, <strong style={{ color: 'var(--info)' }}>Agencia</strong> y <strong style={{ color: 'var(--warn)' }}>Enterprise</strong>.
      </p>

      <div style={{
        display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28,
      }}>
        {[
          { label: 'Equipo', color: 'var(--em)' },
          { label: 'Agencia', color: 'var(--info)' },
          { label: 'Enterprise', color: 'var(--warn)' },
        ].map(p => (
          <span key={p.label} style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '5px 14px', borderRadius: 'var(--r-full)',
            border: `1px solid ${p.color}`, color: p.color,
          }}>
            {p.label}
          </span>
        ))}
      </div>

      <p style={{ fontSize: 11, color: 'rgb(255 255 255 / 0.25)' }}>
        Plan actual: <span style={{ color: 'rgb(255 255 255 / 0.45)', fontWeight: 600 }}>{planActual}</span>
      </p>
    </div>
  )
}

// ── Sección de Días Inhábiles ────────────────────────────────────────────────

function DiasInhabilesSection({
  organizacionId,
  esOwner,
  puedeEditar,
}: {
  organizacionId: string | null
  esOwner: boolean
  puedeEditar: boolean
}) {
  const { dias, loading, error, agregar, eliminar } = useDiasInhabilesOrg(organizacionId)
  const [showForm, setShowForm] = useState(false)
  const [fecha, setFecha] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleAgregar = async () => {
    if (!fecha) { setFormError('Selecciona una fecha'); return }
    setSaving(true)
    setFormError(null)
    try {
      await agregar(fecha, descripcion.trim() || undefined)
      setFecha('')
      setDescripcion('')
      setShowForm(false)
    } catch {
      setFormError('Error al guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async (id: string) => {
    setDeletingId(id)
    await eliminar(id)
    setDeletingId(null)
  }

  return (
    <div style={{
      background: 'var(--ink-2)',
      border: '1px solid var(--ink-3)',
      borderRadius: 'var(--r-xl)',
      overflow: 'hidden',
    }}>
      {/* Header de sección */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 24px', borderBottom: '1px solid var(--ink-3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CalendarDays size={16} color="var(--em)" />
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--snow)', marginBottom: 2 }}>
              Días Inhábiles de mi Organización
            </h2>
            <p style={{ fontSize: 11, color: 'rgb(255 255 255 / 0.35)' }}>
              Se suman a los días festivos nacionales del catálogo
            </p>
          </div>
        </div>

        {esOwner && (
          <button
            onClick={() => { setShowForm(v => !v); setFormError(null) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 'var(--r-lg)',
              background: showForm ? 'var(--ink-3)' : 'var(--em-subtle)',
              border: `1px solid ${showForm ? 'var(--ink-4)' : 'rgb(16 185 129 / 0.3)'}`,
              color: showForm ? 'rgb(255 255 255 / 0.5)' : 'var(--em)',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
              transition: 'all var(--dur-fast)',
            }}
          >
            <Plus size={14} />
            {showForm ? 'Cancelar' : 'Agregar día'}
          </button>
        )}
      </div>

      {/* Formulario de agregar */}
      {showForm && esOwner && (
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--ink-3)',
          background: 'rgb(255 255 255 / 0.02)',
        }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '0 0 auto' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(255 255 255 / 0.45)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Fecha *
              </label>
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                style={{
                  background: 'var(--ink-3)', border: '1px solid var(--ink-4)',
                  borderRadius: 'var(--r-md)', padding: '8px 12px',
                  color: 'var(--snow)', fontSize: 13,
                  outline: 'none', cursor: 'pointer',
                  colorScheme: 'dark',
                }}
              />
            </div>

            <div style={{ flex: '1 1 200px', minWidth: 180 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(255 255 255 / 0.45)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Ej. Cierre de año fiscal"
                maxLength={80}
                style={{
                  width: '100%', background: 'var(--ink-3)', border: '1px solid var(--ink-4)',
                  borderRadius: 'var(--r-md)', padding: '8px 12px',
                  color: 'var(--snow)', fontSize: 13, outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--em)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--ink-4)')}
              />
            </div>

            <button
              onClick={handleAgregar}
              disabled={saving}
              style={{
                padding: '8px 20px', borderRadius: 'var(--r-md)',
                background: saving ? 'var(--ink-3)' : 'var(--em)',
                border: 'none', color: saving ? 'rgb(255 255 255 / 0.4)' : '#fff',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: 600,
                transition: 'all var(--dur-fast)',
                minHeight: 36,
              }}
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>

          {formError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
              <AlertCircle size={13} color="var(--danger)" />
              <p style={{ fontSize: 12, color: 'var(--danger)' }}>{formError}</p>
            </div>
          )}
        </div>
      )}

      {/* Lista de días */}
      {loading ? (
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2].map(i => (
            <div key={i} style={{ height: 44, background: 'var(--ink-3)', borderRadius: 'var(--r-md)' }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--danger)' }}>{error}</p>
        </div>
      ) : dias.length === 0 ? (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--snow)', marginBottom: 4 }}>Sin días personalizados</p>
          <p style={{ fontSize: 12, color: 'rgb(255 255 255 / 0.35)', lineHeight: 1.5 }}>
            {esOwner
              ? 'Agrega fechas especiales de tu organización (vacaciones, cierres, etc.)'
              : 'Tu organización no ha agregado días inhábiles personalizados aún.'}
          </p>
        </div>
      ) : (
        <div>
          {dias.map((dia, i) => (
            <div
              key={dia.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 24px',
                borderBottom: i < dias.length - 1 ? '1px solid var(--ink-3)' : 'none',
                transition: 'background var(--dur-fast)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgb(255 255 255 / 0.02)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Fecha badge */}
              <div style={{
                flexShrink: 0,
                background: 'var(--em-subtle)',
                border: '1px solid rgb(16 185 129 / 0.2)',
                borderRadius: 'var(--r-md)',
                padding: '6px 10px',
                fontFamily: 'var(--font-display)',
                fontSize: 12, fontWeight: 700, color: 'var(--em)',
                whiteSpace: 'nowrap',
              }}>
                {dia.fecha}
              </div>

              {/* Descripción */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: 'var(--snow)', fontWeight: 500, marginBottom: 2 }}>
                  {dia.descripcion || <span style={{ color: 'rgb(255 255 255 / 0.3)', fontStyle: 'italic' }}>Sin descripción</span>}
                </p>
                <p style={{ fontSize: 11, color: 'rgb(255 255 255 / 0.3)' }}>
                  {formatFecha(dia.fecha)}
                </p>
              </div>

              {/* Botón eliminar */}
              {esOwner && (
                <button
                  onClick={() => handleEliminar(dia.id)}
                  disabled={deletingId === dia.id}
                  title="Eliminar día inhábil"
                  style={{
                    flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: 'var(--r-md)',
                    background: 'transparent',
                    border: '1px solid transparent',
                    cursor: deletingId === dia.id ? 'not-allowed' : 'pointer',
                    color: 'rgb(255 255 255 / 0.3)',
                    opacity: deletingId === dia.id ? 0.4 : 1,
                    transition: 'all var(--dur-fast)',
                    minWidth: 44, minHeight: 44,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = 'var(--danger)'
                    ;(e.currentTarget as HTMLElement).style.background = 'rgb(239 68 68 / 0.08)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgb(239 68 68 / 0.2)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = 'rgb(255 255 255 / 0.3)'
                    ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'transparent'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer informativo */}
      <div style={{
        padding: '12px 24px',
        borderTop: '1px solid var(--ink-3)',
        background: 'rgb(255 255 255 / 0.01)',
      }}>
        <p style={{ fontSize: 11, color: 'rgb(255 255 255 / 0.25)', lineHeight: 1.5 }}>
          💡 Estos días se suman al catálogo nacional de días inhábiles. El motor de calendario los considerará al proyectar fechas límite.
          {!esOwner && ' Solo los owners pueden agregar o eliminar fechas.'}
        </p>
      </div>
    </div>
  )
}
