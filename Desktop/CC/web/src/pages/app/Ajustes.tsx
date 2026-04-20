import { useState } from 'react'
import { Settings, Plus, Trash2, CalendarDays, AlertCircle } from 'lucide-react'
import { useEmpresa } from '../../hooks/useEmpresa'
import { useRol } from '../../hooks/useRol'
import { useDiasInhabilesOrg } from '../../hooks/useDiasInhabilesOrg'
import { tieneFeature } from '../../lib/plans'
import { PlanPaywall } from '../../components/PlanPaywall'

function formatFecha(fecha: string): string {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function Ajustes() {
  const { organizacion, loading: loadingEmpresa } = useEmpresa()
  const { esOwner } = useRol()

  const tieneDiasInhabiles = tieneFeature(organizacion?.plan_actual, 'diasInhabilesOrg')

  if (loadingEmpresa) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2].map(i => (
          <div key={i} style={{ height: 80, background: '#FFFFFF', borderRadius: 'var(--r-xl)', border: '1px solid #E2E8F0' }} />
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
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 700, color: '#0F172A' }}>
            Ajustes
          </h1>
        </div>
        <p style={{ fontSize: 13, color: '#64748B' }}>
          Configuración de tu organización · Plan {organizacion?.plan_actual ?? 'gratis'}
        </p>
      </div>

      {/* Paywall: planes sin acceso */}
      {!tieneDiasInhabiles ? (
        <PlanPaywall
          feature="diasInhabilesOrg"
          titulo="Días inhábiles de tu organización"
          descripcion="Agrega fechas especiales de tu empresa (cierres, vacaciones, etc.) para que el motor las considere al calcular vencimientos."
          planActual={organizacion?.plan_actual}
        />
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

// ── Sección de Días Inhábiles ────────────────────────────────────────────────

function DiasInhabilesSection({
  organizacionId,
  esOwner,
  puedeEditar: _puedeEditar,
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
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: 'var(--r-xl)',
      overflow: 'hidden',
    }}>
      {/* Header de sección */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 24px', borderBottom: '1px solid #E2E8F0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CalendarDays size={16} color="var(--em)" />
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>
              Días Inhábiles de mi Organización
            </h2>
            <p style={{ fontSize: 11, color: '#94A3B8' }}>
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
              background: showForm ? '#F1F5F9' : 'var(--em-subtle)',
              border: `1px solid ${showForm ? '#E2E8F0' : 'rgb(16 185 129 / 0.3)'}`,
              color: showForm ? '#64748B' : 'var(--em)',
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
          borderBottom: '1px solid #E2E8F0',
          background: '#F8FAFC',
        }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '0 0 auto' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Fecha *
              </label>
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                style={{
                  background: '#F1F5F9', border: '1px solid #E2E8F0',
                  borderRadius: 'var(--r-md)', padding: '8px 12px',
                  color: '#0F172A', fontSize: 13,
                  outline: 'none', cursor: 'pointer',
                  colorScheme: 'light',
                }}
              />
            </div>

            <div style={{ flex: '1 1 200px', minWidth: 180 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Ej. Cierre de año fiscal"
                maxLength={80}
                style={{
                  width: '100%', background: '#F1F5F9', border: '1px solid #E2E8F0',
                  borderRadius: 'var(--r-md)', padding: '8px 12px',
                  color: '#0F172A', fontSize: 13, outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--em)')}
                onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
              />
            </div>

            <button
              onClick={handleAgregar}
              disabled={saving}
              style={{
                padding: '8px 20px', borderRadius: 'var(--r-md)',
                background: saving ? '#E2E8F0' : 'var(--em)',
                border: 'none', color: saving ? '#94A3B8' : '#fff',
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
            <div key={i} style={{ height: 44, background: '#F1F5F9', borderRadius: 'var(--r-md)' }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--danger)' }}>{error}</p>
        </div>
      ) : dias.length === 0 ? (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>Sin días personalizados</p>
          <p style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>
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
                borderBottom: i < dias.length - 1 ? '1px solid #E2E8F0' : 'none',
                transition: 'background var(--dur-fast)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
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
                <p style={{ fontSize: 13, color: '#0F172A', fontWeight: 500, marginBottom: 2 }}>
                  {dia.descripcion || <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Sin descripción</span>}
                </p>
                <p style={{ fontSize: 11, color: '#94A3B8' }}>
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
                    color: '#94A3B8',
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
                    (e.currentTarget as HTMLElement).style.color = '#CBD5E1'
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
        borderTop: '1px solid #E2E8F0',
        background: '#F8FAFC',
      }}>
        <p style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.5 }}>
          💡 Estos días se suman al catálogo nacional de días inhábiles. El motor de calendario los considerará al proyectar fechas límite.
          {!esOwner && ' Solo los owners pueden agregar o eliminar fechas.'}
        </p>
      </div>
    </div>
  )
}
