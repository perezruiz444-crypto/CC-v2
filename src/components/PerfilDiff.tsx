import { CheckCircle2, AlertTriangle, Minus, Loader2, FileText } from 'lucide-react'
import type { DiffResult, ObligacionDiff } from '../lib/perfil'

export interface PerfilDiffProps {
  diff: DiffResult | null
  loading: boolean
  saving: boolean
  error: string | null
  tema: 'oscuro' | 'claro'
  onConfirmar: () => void | Promise<void>
  onCancelar: () => void
  textoConfirmar?: string
}

export function PerfilDiff({
  diff,
  loading,
  saving,
  error,
  tema,
  onConfirmar,
  onCancelar,
  textoConfirmar = 'Confirmar cambios',
}: PerfilDiffProps) {
  const t = tokens(tema)

  if (loading) {
    return (
      <div style={{ ...t.box, padding: '36px 24px', textAlign: 'center' }}>
        <Loader2 size={20} color={t.muted} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ ...t.muted_text, marginTop: 10 }}>Calculando cambios…</p>
      </div>
    )
  }

  if (!diff) return null

  const cambios = diff.aAgregar.length + diff.aDesactivar.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Resumen header */}
      <div style={{ ...t.box, padding: '14px 18px' }}>
        <p style={{ ...t.heading, fontSize: 14, marginBottom: 4 }}>
          {cambios === 0
            ? 'Sin cambios para aplicar'
            : `Se aplicarán ${cambios} cambio${cambios === 1 ? '' : 's'}`}
        </p>
        <p style={t.muted_text}>
          {diff.aAgregar.length} a agregar · {diff.aDesactivar.length} a desactivar · {diff.sinCambios.length} sin cambios
        </p>
      </div>

      {/* A AGREGAR */}
      {diff.aAgregar.length > 0 && (
        <Bloque
          tema={tema}
          titulo={`Se agregarán (${diff.aAgregar.length})`}
          icon={<CheckCircle2 size={14} color="#10B981" />}
          acento="#10B981"
          obligaciones={diff.aAgregar}
        />
      )}

      {/* A DESACTIVAR */}
      {diff.aDesactivar.length > 0 && (
        <Bloque
          tema={tema}
          titulo={`Se desactivarán (${diff.aDesactivar.length})`}
          icon={<AlertTriangle size={14} color="#F59E0B" />}
          acento="#F59E0B"
          obligaciones={diff.aDesactivar}
          nota="Las obligaciones no se eliminan. Quedan inactivas y conservan su historial."
        />
      )}

      {/* SIN CAMBIOS (collapsed summary) */}
      {diff.sinCambios.length > 0 && (
        <details style={{ ...t.box, padding: '10px 14px' }}>
          <summary style={{
            cursor: 'pointer', fontSize: 12, fontWeight: 600, color: t.muted,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Minus size={13} /> Sin cambios ({diff.sinCambios.length})
          </summary>
          <ul style={{ margin: '10px 0 0 0', padding: 0, listStyle: 'none' }}>
            {diff.sinCambios.map(o => (
              <li key={o.id} style={{ fontSize: 12, color: t.muted, padding: '2px 0' }}>
                • {o.nombre}
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '10px 14px',
          background: 'rgb(239 68 68 / 0.08)',
          border: '1px solid rgb(239 68 68 / 0.2)',
          borderRadius: 'var(--r-md)',
          fontSize: 12, color: 'var(--danger)',
        }}>
          {error}
        </div>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
        <button
          onClick={onCancelar}
          disabled={saving}
          style={{
            padding: '10px 18px', borderRadius: 'var(--r-md)',
            background: 'transparent', border: `1px solid ${t.border}`,
            color: t.muted, fontSize: 13, fontWeight: 500,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          Volver
        </button>
        <button
          onClick={onConfirmar}
          disabled={saving || cambios === 0}
          style={{
            padding: '10px 22px', borderRadius: 'var(--r-md)',
            background: saving || cambios === 0 ? t.disabledBg : 'var(--em)',
            color: saving || cambios === 0 ? t.muted : '#fff',
            border: 'none', fontSize: 13, fontWeight: 600,
            cursor: saving || cambios === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
          {saving ? 'Guardando…' : textoConfirmar}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function Bloque({
  tema, titulo, icon, acento, obligaciones, nota,
}: {
  tema: 'oscuro' | 'claro'
  titulo: string
  icon: React.ReactNode
  acento: string
  obligaciones: ObligacionDiff[]
  nota?: string
}) {
  const t = tokens(tema)
  return (
    <div style={{
      ...t.box,
      borderLeft: `3px solid ${acento}`,
      padding: '12px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {icon}
        <span style={{ ...t.heading, fontSize: 13 }}>{titulo}</span>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {obligaciones.map(o => (
          <li key={o.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '6px 0',
            borderTop: `1px solid ${t.border}`,
          }}>
            <FileText size={12} color={t.muted} style={{ marginTop: 3, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: t.text }}>{o.nombre}</p>
              {(o.fundamento_legal || o.nivel_riesgo) && (
                <p style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>
                  {o.nivel_riesgo && <span style={{ color: nivelColor(o.nivel_riesgo), fontWeight: 600 }}>{o.nivel_riesgo}</span>}
                  {o.nivel_riesgo && o.fundamento_legal && ' · '}
                  {o.fundamento_legal}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
      {nota && (
        <p style={{ fontSize: 11, color: t.muted, marginTop: 8, fontStyle: 'italic' }}>{nota}</p>
      )}
    </div>
  )
}

function nivelColor(n: string): string {
  switch (n) {
    case 'CRITICO': return '#EF4444'
    case 'ALTO':    return '#F59E0B'
    case 'MEDIO':   return '#0369A1'
    default:        return '#64748B'
  }
}

function tokens(tema: 'oscuro' | 'claro') {
  if (tema === 'oscuro') {
    return {
      text:       'var(--snow)',
      muted:      'rgb(255 255 255 / 0.5)',
      muted_text: { fontSize: 12, color: 'rgb(255 255 255 / 0.5)' } as React.CSSProperties,
      heading:    { color: 'var(--snow)', fontWeight: 700, fontFamily: 'var(--font-display)' } as React.CSSProperties,
      border:     'rgb(255 255 255 / 0.08)',
      disabledBg: 'rgb(255 255 255 / 0.06)',
      box: {
        background: 'rgb(255 255 255 / 0.03)',
        border: '1px solid rgb(255 255 255 / 0.08)',
        borderRadius: 'var(--r-lg)',
      } as React.CSSProperties,
    }
  }
  return {
    text:       '#0F172A',
    muted:      '#64748B',
    muted_text: { fontSize: 12, color: '#64748B' } as React.CSSProperties,
    heading:    { color: '#0F172A', fontWeight: 700, fontFamily: 'var(--font-display)' } as React.CSSProperties,
    border:     '#E2E8F0',
    disabledBg: '#E2E8F0',
    box: {
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: 'var(--r-lg)',
    } as React.CSSProperties,
  }
}
