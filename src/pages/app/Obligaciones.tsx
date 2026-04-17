import { useState, useMemo, useEffect } from 'react'
import {
  ChevronDown, ChevronUp, ToggleLeft, ToggleRight,
  Calendar, Clock, CheckCircle2, AlertCircle,
  BookOpen, AlertTriangle, StickyNote, X, Plus
} from 'lucide-react'
import { useEmpresa } from '../../hooks/useEmpresa'
import { useObligaciones } from '../../hooks/useObligaciones'
import { useRol } from '../../hooks/useRol'
import { CrearObligacionDialog } from '../../components/CrearObligacionDialog'
import type { ObligacionEmpresa, VencimientoResumen } from '../../hooks/useObligaciones'

const CAT_LABELS: Record<string, { label: string; color: string }> = {
  immex:    { label: 'IMMEX',      color: 'var(--em)' },
  prosec:   { label: 'PROSEC',     color: 'var(--info)' },
  iva_ieps: { label: 'IVA/IEPS',   color: 'var(--warn)' },
  padron:   { label: 'Padrón',     color: '#a855f7' },
  general:  { label: 'General',    color: 'rgb(255 255 255 / 0.4)' },
}

const ESTADO_VENC: Record<string, { label: string; color: string; icon: any }> = {
  pendiente:  { label: 'Pendiente',  color: 'var(--warn)',   icon: Clock },
  completado: { label: 'Completado', color: 'var(--em)',     icon: CheckCircle2 },
  vencido:    { label: 'Vencido',    color: 'var(--danger)', icon: AlertCircle },
  omitido:    { label: 'Omitido',    color: 'rgb(255 255 255 / 0.35)', icon: Clock },
  prorrogado: { label: 'Prorrogado', color: 'var(--info)',   icon: Clock },
}

type Filtro = 'todas' | 'activas' | 'inactivas'

function formatFecha(f: string) {
  return new Date(f + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Obligaciones() {
  const { empresa, loading: loadingEmp } = useEmpresa()
  const { puedeEditar } = useRol()
  const { obligaciones, loading, toggleEstado, editarFechaVencimiento, agregarNota, crearObligacionPersonalizada, refetch } = useObligaciones(empresa?.id ?? null)

  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [busqueda, setBusqueda] = useState('')
  const [expandida, setExpandida] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const lista = useMemo(() => {
    return obligaciones
      .filter(o => filtro === 'todas' ? true : filtro === 'activas' ? o.estado : !o.estado)
      .filter(o => busqueda === '' ||
        o.catalogo.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        o.catalogo.categoria.toLowerCase().includes(busqueda.toLowerCase())
      )
  }, [obligaciones, filtro, busqueda])

  const counts = useMemo(() => ({
    activas:   obligaciones.filter(o => o.estado).length,
    inactivas: obligaciones.filter(o => !o.estado).length,
  }), [obligaciones])

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,3vw,24px)', fontWeight: 700, color: 'var(--snow)', marginBottom: 4 }}>
          Obligaciones
        </h1>
        <p style={{ fontSize: 13, color: 'rgb(255 255 255 / 0.4)' }}>
          {loadingEmp ? '...' : empresa?.razon_social}
        </p>
      </div>

      {/* Filtros + búsqueda + Botón Crear Obligación */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
        {(['todas', 'activas', 'inactivas'] as Filtro[]).map(f => (
          <button key={f} onClick={() => setFiltro(f)} style={{
            padding: '7px 14px', borderRadius: 'var(--r-full)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            border: `1px solid ${filtro === f ? 'var(--em)' : 'var(--ink-4)'}`,
            background: filtro === f ? 'var(--em-subtle)' : 'var(--ink-2)',
            color: filtro === f ? 'var(--em)' : 'rgb(255 255 255 / 0.45)',
            transition: 'all var(--dur-fast)',
            minHeight: 36,
          }}>
            {f === 'todas' ? `Todas (${obligaciones.length})` : f === 'activas' ? `Activas (${counts.activas})` : `Inactivas (${counts.inactivas})`}
          </button>
        ))}

        <input
          type="text"
          placeholder="Buscar obligación..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          aria-label="Buscar obligación"
          style={{
            flex: 1, minWidth: 200, padding: '8px 14px',
            background: 'var(--ink-2)', border: '1px solid var(--ink-4)',
            borderRadius: 'var(--r-full)', color: 'var(--snow)',
            fontSize: 13, fontFamily: 'var(--font-body)',
            outline: 'none', minHeight: 36,
            transition: 'border-color var(--dur-fast)',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--em)')}
          onBlur={e => (e.target.style.borderColor = 'var(--ink-4)')}
        />

        {puedeEditar && (
          <button
            onClick={() => setShowCreateDialog(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 'var(--r-full)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: 'none',
              background: 'var(--em)', color: 'var(--ink-0)',
              transition: 'all var(--dur-fast)',
              minHeight: 36,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Plus style={{ width: 16, height: 16 }} />
            Crear Obligación Interna
          </button>
        )}
      </div>

      {/* Lista */}
      {loading || loadingEmp ? (
        <SkeletonLista />
      ) : lista.length === 0 ? (
        <div style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)', borderRadius: 'var(--r-xl)', padding: '56px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }} aria-hidden="true">📋</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--snow)', marginBottom: 6 }}>Sin obligaciones</p>
          <p style={{ fontSize: 13, color: 'rgb(255 255 255 / 0.35)', lineHeight: 1.6 }}>
            {busqueda ? 'Ninguna obligación coincide con tu búsqueda.' : 'No hay obligaciones registradas para esta empresa.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lista.map((o, i) => (
            <div key={o.id} className={`reveal-left delay-${Math.min(i + 1, 6)}`}>
              <ObligacionRow
                obligacion={o}
                expanded={expandida === o.id}
                onToggleExpand={() => setExpandida(expandida === o.id ? null : o.id)}
                onToggleEstado={toggleEstado}
                onEditarFecha={editarFechaVencimiento}
                onAgregarNota={agregarNota}
                puedeEditar={puedeEditar}
              />
            </div>
          ))}
        </div>
      )}

      {/* Dialog para crear obligación personalizada */}
      {empresa && (
        <CrearObligacionDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onCreated={async () => {
            await refetch()
          }}
          empresaId={empresa.id}
        />
      )}
    </div>
  )
}

// ── Fila de obligación ───────────────────────────────────────

function ObligacionRow({
  obligacion: o, expanded, onToggleExpand,
  onToggleEstado, onEditarFecha, onAgregarNota, puedeEditar,
}: {
  obligacion: ObligacionEmpresa
  expanded: boolean
  onToggleExpand: () => void
  onToggleEstado: (id: string, estado: boolean, motivo?: string) => Promise<void>
  onEditarFecha: (vencimientoId: string, fecha: string) => Promise<void>
  onAgregarNota: (vencimientoId: string, nota: string) => Promise<void>
  puedeEditar: boolean
}) {
  const cat = CAT_LABELS[o.catalogo.categoria] ?? CAT_LABELS.general
  const [showMotivoModal, setShowMotivoModal] = useState(false)
  const [motivo, setMotivo] = useState('')

  const handleToggle = () => {
    if (o.estado) {
      setShowMotivoModal(true)
    } else {
      onToggleEstado(o.id, true)
    }
  }

  const confirmarDesactivar = () => {
    onToggleEstado(o.id, false, motivo)
    setShowMotivoModal(false)
    setMotivo('')
  }

  return (
    <>
      <div style={{
        background: 'var(--ink-2)',
        border: `1px solid ${expanded ? 'var(--ink-4)' : 'var(--ink-3)'}`,
        borderRadius: 'var(--r-xl)',
        overflow: 'hidden',
        opacity: o.estado ? 1 : 0.6,
        transition: `opacity var(--dur-base), border-color var(--dur-base) cubic-bezier(0.34, 1.56, 0.64, 1)`,
      }}>
        {/* Header de la fila */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px',
          cursor: 'pointer',
        }}
          onClick={onToggleExpand}
        >
          {/* Categoría chip */}
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 9px',
            borderRadius: 'var(--r-full)', flexShrink: 0,
            background: `color-mix(in srgb, ${cat.color} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${cat.color} 25%, transparent)`,
            color: cat.color, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            {cat.label}
          </span>

          {/* Nombre */}
          <p style={{
            flex: 1, fontSize: 13, fontWeight: 600, color: o.estado ? 'var(--snow)' : 'rgb(255 255 255 / 0.4)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            textDecoration: o.estado ? 'none' : 'line-through',
          }}>
            {o.catalogo.nombre}
          </p>

          {/* Periodicidad */}
          {o.catalogo.periodicidad && (
            <span style={{ fontSize: 11, color: 'rgb(255 255 255 / 0.3)', flexShrink: 0 }}>
              {o.catalogo.periodicidad}
            </span>
          )}

          {/* Toggle activo/inactivo — solo owner/manager */}
          <button
            onClick={e => { e.stopPropagation(); if (puedeEditar) handleToggle() }}
            aria-label={!puedeEditar ? 'Solo lectura' : o.estado ? 'Desactivar obligación' : 'Activar obligación'}
            aria-pressed={o.estado}
            disabled={!puedeEditar}
            title={!puedeEditar ? 'Solo los administradores pueden cambiar el estado' : undefined}
            style={{
              background: 'none', border: 'none',
              cursor: puedeEditar ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center',
              color: !puedeEditar
                ? 'rgb(255 255 255 / 0.15)'
                : o.estado ? 'var(--em)' : 'rgb(255 255 255 / 0.25)',
              padding: 6, borderRadius: 'var(--r-md)',
              transition: 'color var(--dur-fast)',
              minWidth: 44, minHeight: 44, justifyContent: 'center',
              opacity: puedeEditar ? 1 : 0.5,
            }}
          >
            {o.estado
              ? <ToggleRight size={22} aria-hidden="true" />
              : <ToggleLeft  size={22} aria-hidden="true" />
            }
          </button>

          {/* Chevron expand */}
          <div style={{ color: 'rgb(255 255 255 / 0.25)', flexShrink: 0 }}>
            {expanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
          </div>
        </div>

        {/* Contenido expandido */}
        {expanded && (
          <div style={{ borderTop: '1px solid var(--ink-3)', padding: '20px 18px' }}>

            {/* Descripción */}
            {o.catalogo.descripcion && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgb(255 255 255 / 0.3)', marginBottom: 8 }}>
                  Descripción
                </p>
                <p style={{ fontSize: 13, color: 'rgb(255 255 255 / 0.6)', lineHeight: 1.7 }}>
                  {o.catalogo.descripcion}
                </p>
              </div>
            )}

            {/* Fundamento legal + multas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 20 }}>
              {o.catalogo.fundamento_legal && (
                <InfoCard icon={<BookOpen size={13} aria-hidden="true" />} label="Fundamento legal" value={o.catalogo.fundamento_legal} />
              )}
              {(o.catalogo.multa_minima_mxn || o.catalogo.multa_maxima_mxn) && (
                <InfoCard
                  icon={<AlertTriangle size={13} aria-hidden="true" />}
                  label="Multa estimada"
                  value={`$${o.catalogo.multa_minima_mxn?.toLocaleString('es-MX') ?? '?'} – $${o.catalogo.multa_maxima_mxn?.toLocaleString('es-MX') ?? '?'} MXN`}
                  accent="var(--danger)"
                />
              )}
            </div>

            {/* Historial de vencimientos */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgb(255 255 255 / 0.3)', marginBottom: 10 }}>
                Historial de vencimientos
              </p>
              {o.vencimientos.length === 0 ? (
                <p style={{ fontSize: 12, color: 'rgb(255 255 255 / 0.25)', fontStyle: 'italic' }}>
                  Sin vencimientos generados todavía.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {o.vencimientos.map(v => (
                    <VencimientoHistorialRow
                      key={v.id}
                      v={v}
                      onEditarFecha={onEditarFecha}
                      onAgregarNota={onAgregarNota}
                      puedeEditar={puedeEditar}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal motivo desactivación */}
      {showMotivoModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgb(0 0 0 / 0.7)', backdropFilter: 'blur(4px)',
          padding: 24,
        }}
          onClick={() => setShowMotivoModal(false)}
        >
          <div style={{
            background: 'var(--ink-2)', border: '1px solid var(--ink-4)',
            borderRadius: 'var(--r-2xl)', padding: '28px 28px',
            width: '100%', maxWidth: 420,
            boxShadow: '0 20px 60px rgb(0 0 0 / 0.5)',
          }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--snow)' }}>
                Desactivar obligación
              </h3>
              <button onClick={() => setShowMotivoModal(false)} aria-label="Cerrar"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(255 255 255 / 0.4)', padding: 4, minWidth: 32, minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-md)' }}>
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <p style={{ fontSize: 13, color: 'rgb(255 255 255 / 0.5)', marginBottom: 16, lineHeight: 1.6 }}>
              ¿Por qué se desactiva esta obligación? (opcional)
            </p>
            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Ej: Programa suspendido por SAT, empresa perdió IMMEX..."
              rows={3}
              style={{
                width: '100%', padding: '10px 12px',
                background: 'var(--ink)', border: '1px solid var(--ink-4)',
                borderRadius: 'var(--r-md)', color: 'var(--snow)',
                fontSize: 13, fontFamily: 'var(--font-body)',
                resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color var(--dur-fast)',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--em)')}
              onBlur={e => (e.target.style.borderColor = 'var(--ink-4)')}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowMotivoModal(false)}
                className="btn btn-ghost-dark" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>
                Cancelar
              </button>
              <button onClick={confirmarDesactivar}
                className="btn" style={{
                  flex: 1, justifyContent: 'center', fontSize: 13,
                  background: 'rgb(239 68 68 / 0.15)', color: 'var(--danger)',
                  border: '1px solid rgb(239 68 68 / 0.3)',
                }}>
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Fila de vencimiento en historial ────────────────────────

function VencimientoHistorialRow({ v, onEditarFecha, onAgregarNota, puedeEditar }: {
  v: VencimientoResumen
  onEditarFecha: (id: string, fecha: string) => Promise<void>
  onAgregarNota: (id: string, nota: string) => Promise<void>
  puedeEditar: boolean
}) {
  const cfg = ESTADO_VENC[v.estado_cumplimiento] ?? ESTADO_VENC.pendiente
  const Icon = cfg.icon
  const [editandoFecha, setEditandoFecha] = useState(false)
  const [editandoNota, setEditandoNota] = useState(false)
  const [fechaLocal, setFechaLocal] = useState(v.fecha_limite)
  const [notaLocal, setNotaLocal] = useState(v.notas ?? '')
  const [savingFecha, setSavingFecha] = useState(false)
  const [savingNota, setSavingNota] = useState(false)

  // Sync con props cuando el padre re-renderiza con datos actualizados (ej. tras refetch)
  useEffect(() => { if (!editandoFecha) setFechaLocal(v.fecha_limite) }, [v.fecha_limite, editandoFecha])
  useEffect(() => { if (!editandoNota)  setNotaLocal(v.notas ?? '')   }, [v.notas, editandoNota])

  const guardarFecha = async () => {
    setSavingFecha(true)
    await onEditarFecha(v.id, fechaLocal)
    setSavingFecha(false)
    setEditandoFecha(false)
  }

  const guardarNota = async () => {
    setSavingNota(true)
    await onAgregarNota(v.id, notaLocal)
    setSavingNota(false)
    setEditandoNota(false)
  }

  return (
    <div style={{
      background: 'var(--ink-3)', borderRadius: 'var(--r-lg)',
      padding: '12px 14px',
    }}>
      {/* Fila principal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Icon size={13} color={cfg.color} aria-hidden="true" style={{ flexShrink: 0 }} />

        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--snow)', flex: 1, minWidth: 120 }}>
          {v.titulo_instancia}
        </p>

        {/* Fecha — editable solo para owner/manager */}
        {editandoFecha && puedeEditar ? (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="date"
              value={fechaLocal}
              onChange={e => setFechaLocal(e.target.value)}
              aria-label="Nueva fecha límite"
              style={{
                background: 'var(--ink-2)', border: '1px solid var(--em)',
                borderRadius: 'var(--r-md)', color: 'var(--snow)',
                fontSize: 12, padding: '4px 8px', fontFamily: 'var(--font-body)',
                outline: 'none', colorScheme: 'dark',
              }}
            />
            <button onClick={guardarFecha} disabled={savingFecha}
              style={{ fontSize: 11, padding: '4px 10px', borderRadius: 'var(--r-full)', background: 'var(--em)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, minHeight: 28 }}>
              {savingFecha ? '...' : 'OK'}
            </button>
            <button onClick={() => { setEditandoFecha(false); setFechaLocal(v.fecha_limite) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(255 255 255 / 0.35)', padding: 4, minWidth: 28, minHeight: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={13} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => puedeEditar && setEditandoFecha(true)}
            aria-label={`Fecha límite: ${formatFecha(v.fecha_limite)}${!puedeEditar ? ' (solo lectura)' : ''}`}
            disabled={!puedeEditar}
            title={!puedeEditar ? 'Solo los administradores pueden editar fechas' : 'Editar fecha límite'}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'none', border: '1px solid var(--ink-4)',
              borderRadius: 'var(--r-md)', padding: '4px 9px',
              color: 'rgb(255 255 255 / 0.45)', fontSize: 11,
              cursor: puedeEditar ? 'pointer' : 'default',
              transition: 'border-color var(--dur-fast), color var(--dur-fast)',
              minHeight: 28,
            }}
            onMouseEnter={e => { if (puedeEditar) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--em)'; (e.currentTarget as HTMLElement).style.color = 'var(--em)' } }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink-4)'; (e.currentTarget as HTMLElement).style.color = 'rgb(255 255 255 / 0.45)' }}
          >
            <Calendar size={11} aria-hidden="true" />
            {formatFecha(v.fecha_limite)}
          </button>
        )}

        {/* Chip estado */}
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 8px',
          borderRadius: 'var(--r-full)', flexShrink: 0,
          background: `color-mix(in srgb, ${cfg.color} 12%, transparent)`,
          color: cfg.color, border: `1px solid color-mix(in srgb, ${cfg.color} 25%, transparent)`,
        }}>
          {cfg.label}
        </span>
      </div>

      {/* Notas */}
      <div style={{ marginTop: 10 }}>
        {/* Notas — editables solo para owner/manager */}
        {editandoNota && puedeEditar ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <textarea
              value={notaLocal}
              onChange={e => setNotaLocal(e.target.value)}
              placeholder="Agregar nota..."
              rows={2}
              aria-label="Nota del vencimiento"
              style={{
                flex: 1, padding: '7px 10px',
                background: 'var(--ink-2)', border: '1px solid var(--em)',
                borderRadius: 'var(--r-md)', color: 'var(--snow)',
                fontSize: 12, fontFamily: 'var(--font-body)',
                resize: 'vertical', outline: 'none',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button onClick={guardarNota} disabled={savingNota}
                style={{ fontSize: 11, padding: '5px 10px', borderRadius: 'var(--r-md)', background: 'var(--em)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, minHeight: 32 }}>
                {savingNota ? '...' : 'Guardar'}
              </button>
              <button onClick={() => { setEditandoNota(false); setNotaLocal(v.notas ?? '') }}
                style={{ fontSize: 11, padding: '5px 10px', borderRadius: 'var(--r-md)', background: 'var(--ink-4)', color: 'rgb(255 255 255 / 0.5)', border: 'none', cursor: 'pointer', minHeight: 32 }}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => puedeEditar && setEditandoNota(true)}
            disabled={!puedeEditar && !v.notas}
            title={!puedeEditar ? 'Solo los administradores pueden editar notas' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none',
              cursor: puedeEditar ? 'pointer' : 'default',
              color: v.notas ? 'rgb(255 255 255 / 0.5)' : 'rgb(255 255 255 / 0.2)',
              fontSize: 11, padding: '2px 0',
              transition: 'color var(--dur-fast)',
              minHeight: 28,
            }}
            onMouseEnter={e => { if (puedeEditar) (e.currentTarget as HTMLElement).style.color = 'var(--em)' }}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = v.notas ? 'rgb(255 255 255 / 0.5)' : 'rgb(255 255 255 / 0.2)'}
          >
            <StickyNote size={11} aria-hidden="true" />
            {v.notas ? v.notas : puedeEditar ? 'Agregar nota...' : '—'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────

function InfoCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: string }) {
  return (
    <div style={{ background: 'var(--ink-3)', borderRadius: 'var(--r-lg)', padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgb(255 255 255 / 0.3)', marginBottom: 6 }}>
        {icon}
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
      </div>
      <p style={{ fontSize: 12, color: accent ?? 'rgb(255 255 255 / 0.55)', lineHeight: 1.5 }}>{value}</p>
    </div>
  )
}

function SkeletonLista() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)', borderRadius: 'var(--r-xl)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 60, height: 22, background: 'var(--ink-3)', borderRadius: 'var(--r-full)' }} />
          <div style={{ flex: 1, height: 14, background: 'var(--ink-3)', borderRadius: 4 }} />
          <div style={{ width: 44, height: 22, background: 'var(--ink-4)', borderRadius: 4 }} />
        </div>
      ))}
    </div>
  )
}
