import { useState } from 'react'
import { X, AlertCircle, Plus } from 'lucide-react'
import { useObligaciones } from '../hooks/useObligaciones'

export interface CrearObligacionDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => Promise<void>
  empresaId: string
}

const PERIODICIDADES = [
  { value: 'mensual',    label: 'Mensual' },
  { value: 'bimestral', label: 'Bimestral' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'anual',     label: 'Anual' },
]

export function CrearObligacionDialog({
  isOpen,
  onClose,
  onCreated,
  empresaId,
}: CrearObligacionDialogProps) {
  const { crearObligacionPersonalizada } = useObligaciones(empresaId)
  const [nombre, setNombre] = useState('')
  const [periodicidad, setPeriodicidad] = useState('mensual')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const reset = () => {
    setNombre('')
    setPeriodicidad('mensual')
    setDescripcion('')
    setError(null)
  }

  const handleClose = () => { reset(); onClose() }

  const handleCrear = async () => {
    setError(null)
    if (!nombre.trim() || nombre.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres')
      return
    }
    setLoading(true)
    try {
      await crearObligacionPersonalizada(nombre.trim(), periodicidad, descripcion.trim() || undefined)
      await onCreated()
      reset()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la obligación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'rgb(0 0 0 / 0.6)',
          backdropFilter: 'blur(2px)',
        }}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 61,
          width: '100%', maxWidth: 460,
          background: 'var(--ink-2)',
          border: '1px solid var(--ink-3)',
          borderRadius: 'var(--r-2xl)',
          boxShadow: 'var(--sh-xl)',
          padding: '28px 28px 24px',
          animation: 'fadeIn 150ms var(--ease-out)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 'var(--r-lg)',
              background: 'var(--em-subtle)', border: '1px solid rgb(16 185 129 / 0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Plus size={16} color="var(--em)" />
            </div>
            <div>
              <h2 id="dialog-title" style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--snow)', marginBottom: 2 }}>
                Crear Obligación Interna
              </h2>
              <p style={{ fontSize: 12, color: 'rgb(255 255 255 / 0.35)' }}>
                Se generarán los vencimientos automáticamente
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgb(255 255 255 / 0.4)', padding: 6, borderRadius: 'var(--r-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Nombre */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(255 255 255 / 0.45)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Nombre *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej. Reporte de Inventario, Auditoría Interna"
              maxLength={100}
              autoFocus
              disabled={loading}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--ink-3)', border: '1px solid var(--ink-4)',
                borderRadius: 'var(--r-md)', padding: '9px 12px',
                color: 'var(--snow)', fontSize: 13, outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--em)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--ink-4)')}
            />
          </div>

          {/* Periodicidad */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(255 255 255 / 0.45)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Periodicidad *
            </label>
            <select
              value={periodicidad}
              onChange={e => setPeriodicidad(e.target.value)}
              disabled={loading}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--ink-3)', border: '1px solid var(--ink-4)',
                borderRadius: 'var(--r-md)', padding: '9px 12px',
                color: 'var(--snow)', fontSize: 13, outline: 'none',
                colorScheme: 'dark', cursor: 'pointer',
              }}
            >
              {PERIODICIDADES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgb(255 255 255 / 0.45)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Descripción (opcional)
            </label>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Notas, requisitos o detalles adicionales..."
              rows={3}
              maxLength={300}
              disabled={loading}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--ink-3)', border: '1px solid var(--ink-4)',
                borderRadius: 'var(--r-md)', padding: '9px 12px',
                color: 'var(--snow)', fontSize: 13, outline: 'none',
                resize: 'vertical', fontFamily: 'inherit',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--em)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--ink-4)')}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgb(239 68 68 / 0.08)', border: '1px solid rgb(239 68 68 / 0.2)', borderRadius: 'var(--r-md)' }}>
              <AlertCircle size={13} color="var(--danger)" flexShrink={0} />
              <p style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              padding: '9px 18px', borderRadius: 'var(--r-md)',
              background: 'transparent', border: '1px solid var(--ink-4)',
              color: 'rgb(255 255 255 / 0.5)', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleCrear}
            disabled={loading || !nombre.trim()}
            style={{
              padding: '9px 20px', borderRadius: 'var(--r-md)',
              background: loading || !nombre.trim() ? 'var(--ink-3)' : 'var(--em)',
              border: 'none',
              color: loading || !nombre.trim() ? 'rgb(255 255 255 / 0.3)' : '#fff',
              cursor: loading || !nombre.trim() ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all var(--dur-fast)',
            }}
          >
            {loading ? 'Creando…' : 'Crear Obligación'}
          </button>
        </div>
      </div>
    </>
  )
}
