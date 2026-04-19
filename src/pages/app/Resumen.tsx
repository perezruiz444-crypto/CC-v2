import { useMemo, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Clock, CalendarDays, ChevronRight, CheckCheck, EyeOff, TrendingUp } from 'lucide-react'
import { useEmpresa } from '../../hooks/useEmpresa'
import { useVencimientos } from '../../hooks/useVencimientos'
import { useRol } from '../../hooks/useRol'
import { useResumenAnual } from '../../hooks/useResumenAnual'
import { ESTADO_CONFIG } from '../../lib/constants'
import { tieneFeature } from '../../lib/plans'
import { PlanPaywall } from '../../components/PlanPaywall'
import { Link } from 'react-router-dom'

function diasRestantes(fecha: string): number {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const limite = new Date(fecha + 'T00:00:00')
  return Math.ceil((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
}

function formatFecha(fecha: string): string {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// Semáforo: rojo si hay vencidos, amarillo si hay vencimientos en ≤15 días, verde si todo al día
type SemaforoEstado = 'verde' | 'amarillo' | 'rojo'

function calcularSemaforo(vencidos: number, proximos15: number): SemaforoEstado {
  if (vencidos > 0) return 'rojo'
  if (proximos15 > 0) return 'amarillo'
  return 'verde'
}

const SEMAFORO_CONFIG: Record<SemaforoEstado, {
  color: string; glow: string; bg: string; border: string;
  titulo: string; desc: string; emoji: string;
}> = {
  verde: {
    color: 'var(--em)', glow: 'var(--em-glow)', bg: 'var(--em-subtle)', border: 'rgb(16 185 129 / 0.25)',
    titulo: 'Todo al día', desc: 'No tienes obligaciones vencidas ni vencimientos próximos urgentes.', emoji: '✅',
  },
  amarillo: {
    color: 'var(--warn)', glow: 'rgb(245 158 11 / 0.18)', bg: 'rgb(245 158 11 / 0.08)', border: 'rgb(245 158 11 / 0.25)',
    titulo: 'Atención requerida', desc: 'Tienes vencimientos en los próximos 15 días. Revisa el panel de acción.', emoji: '⚠️',
  },
  rojo: {
    color: 'var(--danger)', glow: 'rgb(239 68 68 / 0.18)', bg: 'rgb(239 68 68 / 0.08)', border: 'rgb(239 68 68 / 0.25)',
    titulo: 'Obligaciones vencidas', desc: 'Hay obligaciones sin cumplir vencidas. Toma acción inmediata.', emoji: '🔴',
  },
}

export default function Resumen() {
  const [kpiVisible, setKpiVisible] = useState(false)
  const { empresa, organizacion, loading: loadingEmpresa } = useEmpresa()
  const { puedeEditar } = useRol()
  const mesActual = useMemo(() => new Date(), [])
  const { vencimientos, loading: loadingVenc, marcarCompletado } = useVencimientos(empresa?.id ?? null, mesActual)

  useEffect(() => {
    setKpiVisible(true)
  }, [])

  const resumenAnual = useResumenAnual(empresa?.id ?? null)

  const stats = useMemo(() => {
    const proximos15 = vencimientos.filter(v => {
      if (v.estado_cumplimiento !== 'pendiente') return false
      const dias = diasRestantes(v.fecha_limite)
      return dias >= 0 && dias <= 15
    }).length
    return {
      pendientes:  vencimientos.filter(v => v.estado_cumplimiento === 'pendiente').length,
      completados: vencimientos.filter(v => v.estado_cumplimiento === 'completado').length,
      vencidos:    vencimientos.filter(v => v.estado_cumplimiento === 'vencido').length,
      total:       vencimientos.length,
      proximos15,
    }
  }, [vencimientos])

  const semaforoEstado = calcularSemaforo(stats.vencidos, stats.proximos15)
  const semaforo = SEMAFORO_CONFIG[semaforoEstado]

  // Panel de acción requerida: vencidos + próximos ≤15 días, max 5
  const accionRequerida = useMemo(() =>
    vencimientos
      .filter(v => {
        if (v.estado_cumplimiento === 'vencido') return true
        if (v.estado_cumplimiento === 'pendiente') {
          return diasRestantes(v.fecha_limite) <= 15
        }
        return false
      })
      .slice(0, 5),
  [vencimientos])

  const proximos = useMemo(() =>
    vencimientos
      .filter(v => v.estado_cumplimiento === 'pendiente' || v.estado_cumplimiento === 'vencido')
      .slice(0, 5),
  [vencimientos])

  const loading = loadingEmpresa || loadingVenc
  const mesLabel = mesActual.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 26px)',
          fontWeight: 700, color: 'var(--snow)', marginBottom: 4,
        }}>
          {loadingEmpresa ? 'Cargando...' : `Hola, ${organizacion?.nombre_cuenta ?? ''}`}
        </h1>
        <p style={{ fontSize: 13, color: 'rgb(255 255 255 / 0.4)' }}>
          Dashboard · {mesLabel} · {empresa?.razon_social ?? ''}
        </p>
      </div>

      {/* Semáforo de cumplimiento */}
      {loading ? (
        <div style={{ height: 100, background: 'var(--ink-2)', borderRadius: 'var(--r-xl)', marginBottom: 20, border: '1px solid var(--ink-3)' }} />
      ) : (
        <div style={{
          background: semaforo.bg,
          border: `1px solid ${semaforo.border}`,
          borderRadius: 'var(--r-xl)',
          padding: '20px 24px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          boxShadow: `0 0 24px ${semaforo.glow}`,
        }}>
          {/* Indicador circular */}
          <div style={{
            width: 64, height: 64, flexShrink: 0,
            borderRadius: '50%',
            background: `color-mix(in srgb, ${semaforo.color} 15%, transparent)`,
            border: `3px solid ${semaforo.color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26,
            boxShadow: `0 0 16px ${semaforo.glow}`,
            animation: semaforoEstado === 'rojo' ? 'pulse-glow 2s ease-in-out infinite' : 'none',
          }} aria-hidden="true">
            {semaforo.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
              color: semaforo.color, marginBottom: 4,
            }}>
              {semaforo.titulo}
            </p>
            <p style={{ fontSize: 13, color: 'rgb(255 255 255 / 0.5)', lineHeight: 1.5 }}>
              {semaforo.desc}
            </p>
          </div>
          {/* Stats rápidos en el semáforo */}
          <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
            {stats.vencidos > 0 && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--danger)', lineHeight: 1 }}>
                  {stats.vencidos}
                </p>
                <p style={{ fontSize: 10, color: 'rgb(255 255 255 / 0.35)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>vencidas</p>
              </div>
            )}
            {stats.proximos15 > 0 && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--warn)', lineHeight: 1 }}>
                  {stats.proximos15}
                </p>
                <p style={{ fontSize: 10, color: 'rgb(255 255 255 / 0.35)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>próximas</p>
              </div>
            )}
            {semaforoEstado === 'verde' && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--em)', lineHeight: 1 }}>
                  {stats.completados}
                </p>
                <p style={{ fontSize: 10, color: 'rgb(255 255 255 / 0.35)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>completadas</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12, marginBottom: 28,
      }}>
        <div className={`reveal-scale delay-1 ${kpiVisible ? 'visible' : ''}`}><KpiCard label="Pendientes"  value={loading ? '–' : stats.pendientes}  icon={<Clock size={16} />}       accent="var(--warn)"   topBorder="var(--warn)" loading={loading}  /></div>
        <div className={`reveal-scale delay-2 ${kpiVisible ? 'visible' : ''}`}><KpiCard label="Completados" value={loading ? '–' : stats.completados} icon={<CheckCircle2 size={16} />} accent="var(--em)"     topBorder="var(--em)" loading={loading}  /></div>
        <div className={`reveal-scale delay-3 ${kpiVisible ? 'visible' : ''}`}><KpiCard label="Vencidos"    value={loading ? '–' : stats.vencidos}    icon={<AlertCircle size={16} />}  accent="var(--danger)" topBorder="var(--danger)" loading={loading} alert={stats.vencidos > 0}  /></div>
        <div className={`reveal-scale delay-4 ${kpiVisible ? 'visible' : ''}`}><KpiCard label="Este mes"    value={loading ? '–' : stats.total}       icon={<CalendarDays size={16} />} accent="var(--info)"   topBorder="var(--info)" loading={loading}  /></div>
      </div>

      {/* Paneles: Progreso Anual + Resumen por Categoría (solo planes de pago) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 20 }}>
        {tieneFeature(organizacion?.plan_actual, 'dashboardProgresoAnual')
          ? <ProgresoAnualPanel resumenAnual={resumenAnual} anio={mesActual.getFullYear()} />
          : <PlanPaywall
              feature="dashboardProgresoAnual"
              titulo="Progreso anual"
              descripcion="Visualiza tu porcentaje de cumplimiento del año con desglose por estado. Disponible en planes de pago."
              planActual={organizacion?.plan_actual}
            />
        }
        {tieneFeature(organizacion?.plan_actual, 'dashboardResumenCategoria')
          ? <ResumenCategoriaPanel vencimientos={vencimientos} loading={loading} />
          : <PlanPaywall
              feature="dashboardResumenCategoria"
              titulo="Resumen por categoría"
              descripcion="Consulta el avance de tus obligaciones IMMEX, IVA/IEPS y generales en un solo vistazo."
              planActual={organizacion?.plan_actual}
            />
        }
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>

        {/* Panel Acción Requerida */}
        <div style={{
          background: 'var(--ink-2)', border: '1px solid var(--ink-3)',
          borderRadius: 'var(--r-xl)', overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid var(--ink-3)',
          }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--snow)', marginBottom: 2 }}>
                Acción Requerida
              </h2>
              <p style={{ fontSize: 11, color: 'rgb(255 255 255 / 0.35)' }}>Vencidas y próximas 15 días</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {!puedeEditar && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 'var(--r-full)', background: 'rgb(255 255 255 / 0.05)', border: '1px solid var(--ink-4)' }}>
                  <EyeOff size={10} color="rgb(255 255 255 / 0.3)" />
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'rgb(255 255 255 / 0.3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Lectura</span>
                </div>
              )}
              {accionRequerida.length > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: 'rgb(239 68 68 / 0.15)', color: 'var(--danger)',
                  border: '1px solid rgb(239 68 68 / 0.3)',
                  padding: '3px 10px', borderRadius: 'var(--r-full)',
                }}>
                  {accionRequerida.length}
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <SkeletonAccion />
          ) : accionRequerida.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }} aria-hidden="true">✅</div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--snow)', marginBottom: 4 }}>Sin acciones urgentes</p>
              <p style={{ fontSize: 12, color: 'rgb(255 255 255 / 0.35)', lineHeight: 1.5 }}>No hay vencimientos inmediatos.</p>
            </div>
          ) : (
            <div>
              {accionRequerida.map((v, i) => {
                const dias = diasRestantes(v.fecha_limite)
                const isVencido = dias < 0
                return (
                  <div key={v.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 20px',
                    borderBottom: i < accionRequerida.length - 1 ? '1px solid var(--ink-3)' : 'none',
                  }}>
                    {/* Indicador */}
                    <div style={{
                      width: 40, height: 40, flexShrink: 0, borderRadius: 'var(--r-md)',
                      background: isVencido ? 'rgb(239 68 68 / 0.12)' : 'rgb(245 158 11 / 0.12)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, lineHeight: 1, color: isVencido ? 'var(--danger)' : 'var(--warn)' }}>
                        {Math.abs(dias)}
                      </p>
                      <p style={{ fontSize: 8, color: 'rgb(255 255 255 / 0.3)', marginTop: 1 }}>días</p>
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--snow)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                        {v.titulo_instancia}
                      </p>
                      <p style={{ fontSize: 11, color: 'rgb(255 255 255 / 0.35)' }}>
                        {isVencido ? `Venció ${formatFecha(v.fecha_limite)}` : `Vence ${formatFecha(v.fecha_limite)}`}
                      </p>
                    </div>
                    {/* Botón marcar — solo owner/manager */}
                    {puedeEditar ? (
                      <button
                        onClick={() => marcarCompletado(v.id)}
                        title="Marcar como completada"
                        style={{
                          flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 32, height: 32, borderRadius: 'var(--r-md)',
                          background: 'var(--em-subtle)', border: '1px solid rgb(16 185 129 / 0.3)',
                          cursor: 'pointer', color: 'var(--em)',
                          transition: 'all var(--dur-fast)',
                          minWidth: 44, minHeight: 44,
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = 'var(--em)'
                          ;(e.currentTarget as HTMLElement).style.color = '#fff'
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = 'var(--em-subtle)'
                          ;(e.currentTarget as HTMLElement).style.color = 'var(--em)'
                        }}
                      >
                        <CheckCheck size={14} aria-hidden="true" />
                      </button>
                    ) : (
                      <div style={{ width: 44, flexShrink: 0 }} aria-hidden="true" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Próximos vencimientos */}
        <ProximosVencimientos proximos={proximos} vencimientos={vencimientos} loading={loading} />
      </div>
    </div>
  )
}

// ── Sub-componente: Próximos Vencimientos ───────────────────

function ProximosVencimientos({ proximos, vencimientos, loading }: {
  proximos: any[]
  vencimientos: any[]
  loading: boolean
}) {
  const [itemsVisible, setItemsVisible] = useState<boolean[]>([])

  useEffect(() => {
    if (proximos.length > 0) {
      setItemsVisible(new Array(proximos.length).fill(false))
      // Activate reveal animations on first render
      setTimeout(() => {
        setItemsVisible(new Array(proximos.length).fill(true))
      }, 0)
    }
  }, [proximos.length])

  return (
    <div style={{
      background: 'var(--ink-2)', border: '1px solid var(--ink-3)',
      borderRadius: 'var(--r-xl)', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid var(--ink-3)',
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--snow)', marginBottom: 2 }}>
            Próximos vencimientos
          </h2>
          <p style={{ fontSize: 11, color: 'rgb(255 255 255 / 0.35)' }}>Pendientes del mes</p>
        </div>
        <Link to="/app/calendario" style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 12, color: 'var(--em)', textDecoration: 'none', fontWeight: 500,
        }}>
          Ver todos <ChevronRight size={13} />
        </Link>
      </div>

      {loading ? (
        <SkeletonRows />
      ) : proximos.length === 0 ? (
        <div style={{ padding: '36px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }} aria-hidden="true">📅</div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--snow)', marginBottom: 4 }}>Sin pendientes</p>
          <p style={{ fontSize: 12, color: 'rgb(255 255 255 / 0.35)', lineHeight: 1.5 }}>
            {vencimientos.length === 0 ? 'No hay obligaciones generadas aún.' : 'Todo al día este mes.'}
          </p>
        </div>
      ) : (
        <div>
          {proximos.map((v, i) => {
            const dias = diasRestantes(v.fecha_limite)
            const cfg = ESTADO_CONFIG[v.estado_cumplimiento as keyof typeof ESTADO_CONFIG] ?? ESTADO_CONFIG.pendiente
            return (
              <div
                key={v.id}
                className={`reveal-left ${itemsVisible[i] ? 'visible' : ''} delay-${i + 1}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 20px',
                  borderBottom: i < proximos.length - 1 ? '1px solid var(--ink-3)' : 'none',
                  transition: 'background var(--dur-fast)',
                  opacity: itemsVisible[i] ? 1 : 0,
                  transform: itemsVisible[i] ? 'translateX(0)' : 'translateX(-44px)',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgb(255 255 255 / 0.025)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <div style={{
                  width: 40, height: 40, flexShrink: 0,
                  background: dias < 0 ? 'rgb(239 68 68 / 0.1)' : dias <= 7 ? 'rgb(245 158 11 / 0.1)' : 'var(--em-subtle)',
                  borderRadius: 'var(--r-md)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <p style={{
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, lineHeight: 1,
                    color: dias < 0 ? 'var(--danger)' : dias <= 7 ? 'var(--warn)' : 'var(--em)',
                  }}>
                    {Math.abs(dias)}
                  </p>
                  <p style={{ fontSize: 8, color: 'rgb(255 255 255 / 0.3)', marginTop: 1 }}>días</p>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--snow)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                    {v.titulo_instancia}
                  </p>
                  <p style={{ fontSize: 11, color: 'rgb(255 255 255 / 0.35)' }}>
                    {formatFecha(v.fecha_limite)}
                  </p>
                </div>
                <span className={cfg.className} style={{ flexShrink: 0, fontSize: 10 }}>
                  {cfg.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Sub-componentes ──────────────────────────────────────────

function KpiCard({ label, value, icon, accent, loading, alert, topBorder }: {
  label: string; value: number | string; icon: React.ReactNode
  accent: string; loading?: boolean; alert?: boolean; topBorder?: string
}) {
  return (
    <div style={{
      background: `linear-gradient(135deg, var(--ink-2), var(--ink-3))`,
      border: `1px solid ${alert ? 'rgb(239 68 68 / 0.3)' : 'var(--ink-3)'}`,
      borderTop: topBorder ? `3px solid ${topBorder}` : `1px solid ${alert ? 'rgb(239 68 68 / 0.3)' : 'var(--ink-3)'}`,
      borderRadius: 'var(--r-xl)',
      padding: '18px 20px',
      transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
      cursor: 'default',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-md)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = ''
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgb(255 255 255 / 0.4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {label}
        </p>
        <div style={{ color: accent }}>{icon}</div>
      </div>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: loading ? 22 : 36,
        fontWeight: 800, lineHeight: 1,
        color: loading ? 'rgb(255 255 255 / 0.15)' : 'var(--snow)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {loading ? '–' : value}
      </p>
    </div>
  )
}

function SkeletonRows() {
  return (
    <div>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 20px',
          borderBottom: i < 3 ? '1px solid var(--ink-3)' : 'none',
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: 'var(--ink-3)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 11, width: '55%', background: 'var(--ink-3)', borderRadius: 4, marginBottom: 7 }} />
            <div style={{ height: 10, width: '30%', background: 'var(--ink-4)', borderRadius: 4 }} />
          </div>
          <div style={{ width: 64, height: 20, background: 'var(--ink-3)', borderRadius: 'var(--r-full)' }} />
        </div>
      ))}
    </div>
  )
}

// ── Panel: Progreso Anual ────────────────────────────────────

function ProgresoAnualPanel({ resumenAnual, anio }: { resumenAnual: import('../../hooks/useResumenAnual').ResumenAnual; anio: number }) {
  const { totalAnual, completadosAnual, pendientesAnual, vencidosAnual, porcentaje, loading } = resumenAnual

  return (
    <div style={{
      background: 'var(--ink-2)', border: '1px solid var(--ink-3)',
      borderRadius: 'var(--r-xl)', padding: '20px 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <TrendingUp size={15} color="var(--em)" />
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--snow)', marginBottom: 1 }}>
            Progreso Anual {anio}
          </h2>
          <p style={{ fontSize: 11, color: 'rgb(255 255 255 / 0.35)' }}>Cumplimiento total del año</p>
        </div>
      </div>

      {loading ? (
        <div>
          <div style={{ height: 60, background: 'var(--ink-3)', borderRadius: 'var(--r-md)', marginBottom: 12 }} />
          <div style={{ height: 8, background: 'var(--ink-3)', borderRadius: 'var(--r-full)' }} />
        </div>
      ) : (
        <>
          {/* Número grande */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 14 }}>
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 800, lineHeight: 1,
              color: porcentaje >= 80 ? 'var(--em)' : porcentaje >= 50 ? 'var(--warn)' : 'var(--danger)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {porcentaje}
            </p>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'rgb(255 255 255 / 0.4)', marginBottom: 8 }}>%</p>
          </div>

          {/* Barra de progreso */}
          <div style={{
            height: 8, background: 'var(--ink-4)', borderRadius: 'var(--r-full)',
            overflow: 'hidden', marginBottom: 14,
          }}>
            <div style={{
              height: '100%',
              width: `${porcentaje}%`,
              borderRadius: 'var(--r-full)',
              background: porcentaje >= 80
                ? 'linear-gradient(90deg, var(--em), #34d399)'
                : porcentaje >= 50
                ? 'linear-gradient(90deg, var(--warn), #fbbf24)'
                : 'linear-gradient(90deg, var(--danger), #f87171)',
              transition: 'width 0.8s var(--ease-out)',
            }} />
          </div>

          {/* Desglose */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Completados', value: completadosAnual, color: 'var(--em)' },
              { label: 'Pendientes',  value: pendientesAnual,  color: 'var(--warn)' },
              { label: 'Vencidos',    value: vencidosAnual,    color: 'var(--danger)' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'rgb(255 255 255 / 0.4)' }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--snow)', fontVariantNumeric: 'tabular-nums' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {totalAnual === 0 && (
            <p style={{ fontSize: 12, color: 'rgb(255 255 255 / 0.3)', marginTop: 8, fontStyle: 'italic' }}>
              Sin vencimientos generados para {anio}
            </p>
          )}
        </>
      )}
    </div>
  )
}

// ── Panel: Resumen por Categoría ─────────────────────────────

const CATEGORIA_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  immex:    { label: 'IMMEX',    color: 'var(--em)',   bg: 'var(--em-subtle)' },
  iva_ieps: { label: 'IVA/IEPS', color: 'var(--info)', bg: 'rgb(59 130 246 / 0.08)' },
  general:  { label: 'General',  color: 'rgb(255 255 255 / 0.5)', bg: 'var(--ink-3)' },
  prosec:   { label: 'PROSEC',   color: 'var(--warn)', bg: 'rgb(245 158 11 / 0.08)' },
  padron:   { label: 'Padrón',   color: 'var(--warn)', bg: 'rgb(245 158 11 / 0.08)' },
}

function ResumenCategoriaPanel({ vencimientos, loading }: { vencimientos: any[]; loading: boolean }) {
  const porCategoria = useMemo(() => {
    const map: Record<string, { total: number; completados: number }> = {}
    vencimientos.forEach(v => {
      const cat = (v.catalogo?.categoria ?? 'general') as string
      if (!map[cat]) map[cat] = { total: 0, completados: 0 }
      map[cat].total++
      if (v.estado_cumplimiento === 'completado') map[cat].completados++
    })
    // Ordenar por total desc, solo mostrar categorías con ≥1 vencimiento
    return Object.entries(map)
      .filter(([, { total }]) => total > 0)
      .sort((a, b) => b[1].total - a[1].total)
  }, [vencimientos])

  return (
    <div style={{
      background: 'var(--ink-2)', border: '1px solid var(--ink-3)',
      borderRadius: 'var(--r-xl)', overflow: 'hidden',
    }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--ink-3)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--snow)', marginBottom: 2 }}>
          Este mes por categoría
        </h2>
        <p style={{ fontSize: 11, color: 'rgb(255 255 255 / 0.35)' }}>Vencimientos del mes activo</p>
      </div>

      {loading ? (
        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 36, background: 'var(--ink-3)', borderRadius: 'var(--r-md)' }} />
          ))}
        </div>
      ) : porCategoria.length === 0 ? (
        <div style={{ padding: '36px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'rgb(255 255 255 / 0.3)' }}>Sin vencimientos este mes</p>
        </div>
      ) : (
        <div style={{ padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {porCategoria.map(([cat, { total, completados }]) => {
            const cfg = CATEGORIA_CONFIG[cat] ?? CATEGORIA_CONFIG.general
            const pct = total > 0 ? Math.round((completados / total) * 100) : 0
            return (
              <div key={cat}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
                      textTransform: 'uppercase', padding: '2px 8px',
                      borderRadius: 'var(--r-full)',
                      background: cfg.bg,
                      color: cfg.color,
                    }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: 11, color: 'rgb(255 255 255 / 0.35)' }}>
                      {completados}/{total}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>
                    {pct}%
                  </span>
                </div>
                <div style={{ height: 5, background: 'var(--ink-4)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`,
                    background: cfg.color,
                    borderRadius: 'var(--r-full)',
                    transition: 'width 0.6s var(--ease-out)',
                    opacity: 0.8,
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SkeletonAccion() {
  return (
    <div>
      {[1, 2].map(i => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 20px',
          borderBottom: i < 2 ? '1px solid var(--ink-3)' : 'none',
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: 'var(--ink-3)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 11, width: '65%', background: 'var(--ink-3)', borderRadius: 4, marginBottom: 7 }} />
            <div style={{ height: 10, width: '40%', background: 'var(--ink-4)', borderRadius: 4 }} />
          </div>
          <div style={{ width: 32, height: 32, borderRadius: 'var(--r-md)', background: 'var(--ink-3)' }} />
        </div>
      ))}
    </div>
  )
}
