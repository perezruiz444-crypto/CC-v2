import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle, EyeOff, X } from 'lucide-react'
import { useEmpresa } from '../../hooks/useEmpresa'
import { useVencimientos } from '../../hooks/useVencimientos'
import { useRol } from '../../hooks/useRol'
import { ESTADO_CONFIG } from '../../lib/constants'

// Icons per estado for the card
const ESTADO_ICON = { pendiente: Clock, completado: CheckCircle2, vencido: AlertCircle, omitido: Clock, prorrogado: Clock }

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']

function formatFechaCorta(fecha: string): string {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

function diasRestantes(fecha: string): number {
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  return Math.ceil((new Date(fecha + 'T00:00:00').getTime() - hoy.getTime()) / 86400000)
}

export default function Calendario() {
  const { empresa, loading: loadingEmpresa } = useEmpresa()
  const { puedeEditar, rol } = useRol()
  const [mes, setMes] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const mesObj = useMemo(() => new Date(mes.getFullYear(), mes.getMonth(), 1), [mes])
  const { vencimientos, loading, marcarCompletado } = useVencimientos(empresa?.id ?? null, mesObj)

  const navMes = (delta: number) => {
    setMes(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
    setSelectedDay(null)
  }

  // Today's date
  const today = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])

  // Map vencimientos by day number
  const vencimientosByDay = useMemo(() => {
    const map = new Map<number, typeof vencimientos>()
    vencimientos.forEach(v => {
      const d = new Date(v.fecha_limite + 'T00:00:00')
      if (d.getFullYear() === mesObj.getFullYear() && d.getMonth() === mesObj.getMonth()) {
        const day = d.getDate()
        if (!map.has(day)) map.set(day, [])
        map.get(day)!.push(v)
      }
    })
    return map
  }, [vencimientos, mesObj])

  // Filtered vencimientos based on selected day
  const filteredVencimientos = useMemo(() => {
    if (selectedDay === null) return vencimientos
    return vencimientos.filter(v => {
      const d = new Date(v.fecha_limite + 'T00:00:00')
      return d.getDate() === selectedDay
    })
  }, [vencimientos, selectedDay])

  // Calendar grid: get first day of month and total days
  const firstDay = useMemo(() => {
    const d = new Date(mesObj)
    // JS: Sunday=0, so we adjust: Sunday=6, Monday=0
    return (d.getDay() + 6) % 7
  }, [mesObj])

  const daysInMonth = useMemo(() => {
    return new Date(mesObj.getFullYear(), mesObj.getMonth() + 1, 0).getDate()
  }, [mesObj])

  // Determine dot status for a day
  const getDotStatus = (day: number): 'vencido' | 'proximo' | 'completado' | null => {
    const items = vencimientosByDay.get(day) ?? []
    if (items.length === 0) return null

    let hasVencido = false
    let hasProximo = false
    let allCompletado = true

    items.forEach(v => {
      const dias = diasRestantes(v.fecha_limite)
      if (v.estado_cumplimiento === 'completado') {
        // allCompletado stays true
      } else {
        allCompletado = false
        if (dias < 0) hasVencido = true
        if (dias >= 0 && dias <= 7) hasProximo = true
      }
    })

    if (allCompletado && items.length > 0) return 'completado'
    if (hasVencido) return 'vencido'
    if (hasProximo) return 'proximo'
    return null
  }

  return (
    <div>
      {/* Header + navegación de mes */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: '#0F172A' }}>
              Calendario
            </h1>
            {rol === 'viewer' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 'var(--r-full)', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <EyeOff size={11} color="#CBD5E1" />
                <span style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Solo lectura</span>
              </div>
            )}
          </div>
          <p style={{ fontSize: 13, color: '#64748B' }}>
            {empresa?.razon_social ?? ''}
          </p>
        </div>

        {/* Navegador de mes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 'var(--r-full)', padding: '4px 6px' }}>
          <button
            onClick={() => navMes(-1)}
            aria-label="Mes anterior"
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#64748B',
              transition: 'background var(--dur-fast), color var(--dur-fast)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F1F5F9'; (e.currentTarget as HTMLElement).style.color = '#0F172A' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#64748B' }}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>

          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#0F172A', padding: '0 10px', minWidth: 130, textAlign: 'center' }}>
            {MESES[mes.getMonth()]} {mes.getFullYear()}
          </span>

          <button
            onClick={() => navMes(1)}
            aria-label="Mes siguiente"
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#64748B',
              transition: 'background var(--dur-fast), color var(--dur-fast)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F1F5F9'; (e.currentTarget as HTMLElement).style.color = '#0F172A' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#64748B' }}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Contenido */}
      {loading || loadingEmpresa ? (
        <SkeletonCalendario />
      ) : vencimientos.length === 0 ? (
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0',
          borderRadius: 'var(--r-xl)', padding: '64px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }} aria-hidden="true">📭</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>
            Sin vencimientos en {MESES[mes.getMonth()]}
          </p>
          <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6, maxWidth: 300, margin: '0 auto' }}>
            Los vencimientos se generan automáticamente cuando se activen las obligaciones de tu empresa.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Mini calendar grid */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 'var(--r-lg)', padding: 16 }}>
            {/* Weekday headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 12 }}>
              {WEEKDAYS.map(day => (
                <div key={day} style={{
                  textAlign: 'center', fontSize: 11, fontWeight: 700,
                  color: '#64748B', textTransform: 'uppercase',
                  letterSpacing: '0.08em', minHeight: 36, display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {/* Empty cells before first day */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} style={{ minHeight: 36 }} />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const isToday = today.getFullYear() === mesObj.getFullYear() &&
                               today.getMonth() === mesObj.getMonth() &&
                               today.getDate() === day
                const isSelected = selectedDay === day
                const dotStatus = getDotStatus(day)

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      minHeight: 36,
                      padding: 4,
                      borderRadius: 'var(--r-md)',
                      background: isSelected ? 'var(--em-subtle)' : isToday ? '#F1F5F9' : 'transparent',
                      border: isSelected ? '1px solid var(--em-light)' : isToday ? '1px solid #E2E8F0' : '1px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      transition: 'background var(--dur-fast), border-color var(--dur-fast)',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#0F172A',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLElement).style.background = '#F1F5F9'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent'
                      }
                    }}
                  >
                    <span>{day}</span>
                    {/* Status dots */}
                    {dotStatus && (
                      <div style={{ width: 6, height: 6, borderRadius: '50%',
                        background: dotStatus === 'vencido' ? 'var(--danger)' : dotStatus === 'proximo' ? 'var(--warn)' : 'var(--em)'
                      }} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* List section */}
          <div>
            {/* Header + clear button */}
            {selectedDay !== null && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{
                  fontSize: 13, fontWeight: 600, color: '#64748B',
                  textTransform: 'uppercase', letterSpacing: '0.08em'
                }}>
                  Vencimientos del {selectedDay} de {MESES[mes.getMonth()]}
                </p>
                <button
                  onClick={() => setSelectedDay(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 'var(--r-full)',
                    background: '#FFFFFF', border: '1px solid #E2E8F0',
                    color: '#64748B', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background var(--dur-fast), color var(--dur-fast)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = '#F1F5F9'
                    el.style.color = '#0F172A'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = '#FFFFFF'
                    el.style.color = '#64748B'
                  }}
                >
                  <X size={14} aria-hidden="true" />
                  Limpiar
                </button>
              </div>
            )}

            {/* Vencimientos list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredVencimientos.length === 0 ? (
                <div style={{
                  background: '#FFFFFF', border: '1px solid #E2E8F0',
                  borderRadius: 'var(--r-lg)', padding: '24px 16px', textAlign: 'center',
                }}>
                  <p style={{ fontSize: 13, color: '#94A3B8' }}>
                    {selectedDay !== null ? 'Sin vencimientos este día' : 'Sin vencimientos'}
                  </p>
                </div>
              ) : (
                filteredVencimientos.map((v, idx) => {
                  const delayMs = 55 * ((idx % 6) + 1)
                  return (
                    <div
                      key={v.id}
                      style={{
                        opacity: 1,
                        transform: 'translateX(0)',
                        animation: `slideInLeft 300ms cubic-bezier(0, 0, 0.2, 1) ${delayMs}ms both`,
                      }}
                    >
                      <VencimientoCard v={v} onCompletar={() => marcarCompletado(v.id)} puedeEditar={puedeEditar} />
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function VencimientoCard({ v, onCompletar, puedeEditar }: { v: any; onCompletar: () => void; puedeEditar: boolean }) {
  const cfg = ESTADO_CONFIG[v.estado_cumplimiento as keyof typeof ESTADO_CONFIG] ?? ESTADO_CONFIG.pendiente
  const Icon = ESTADO_ICON[v.estado_cumplimiento as keyof typeof ESTADO_ICON] ?? Clock
  const dias = diasRestantes(v.fecha_limite)
  const completado = v.estado_cumplimiento === 'completado'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: 'var(--r-lg)',
      padding: '14px 18px',
      transition: 'box-shadow var(--dur-fast), transform var(--dur-fast)',
      opacity: completado ? 0.6 : 1,
    }}
      onMouseEnter={e => { if (!completado) { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-sm)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' } }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = '' }}
    >
      {/* Ícono estado */}
      <div style={{
        width: 36, height: 36, borderRadius: 'var(--r-md)', flexShrink: 0,
        background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} color={cfg.color as string} aria-hidden="true" />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 13, fontWeight: 600, color: '#0F172A',
          marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          textDecoration: completado ? 'line-through' : 'none',
        }}>
          {v.titulo_instancia}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <p style={{ fontSize: 11, color: '#94A3B8' }}>
            {formatFechaCorta(v.fecha_limite)}
          </p>
          {!completado && (
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: dias < 0 ? 'var(--danger)' : dias <= 7 ? 'var(--warn)' : '#94A3B8',
            }}>
              {dias < 0 ? `${Math.abs(dias)}d vencido` : dias === 0 ? 'Hoy' : `${dias}d restantes`}
            </span>
          )}
        </div>
      </div>

      {/* Chip + acción */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 9px',
          borderRadius: 'var(--r-full)',
          background: cfg.bg as string, color: cfg.color as string,
          border: `1px solid ${cfg.color}`,
          letterSpacing: '0.04em',
        }}>
          {cfg.label}
        </span>

        {(v.estado_cumplimiento === 'pendiente' || v.estado_cumplimiento === 'vencido') && puedeEditar && (
          <button
            onClick={onCompletar}
            aria-label={`Marcar ${v.titulo_instancia} como completado`}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 12px', borderRadius: 'var(--r-full)',
              background: 'var(--em-subtle)',
              border: '1px solid rgb(16 185 129 / 0.3)',
              color: 'var(--em)', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'background var(--dur-fast), transform var(--dur-fast)',
              minHeight: 34,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--em)'; (e.currentTarget as HTMLElement).style.color = 'white' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--em-subtle)'; (e.currentTarget as HTMLElement).style.color = 'var(--em)' }}
            onMouseDown={e => (e.currentTarget as HTMLElement).style.transform = 'scale(0.96)'}
            onMouseUp={e => (e.currentTarget as HTMLElement).style.transform = ''}
          >
            <CheckCircle2 size={13} aria-hidden="true" />
            Completar
          </button>
        )}
      </div>
    </div>
  )
}

function SkeletonCalendario() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: '#FFFFFF', border: '1px solid #E2E8F0',
          borderRadius: 'var(--r-lg)', padding: '14px 18px',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: '#F1F5F9', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 12, width: '50%', background: '#F1F5F9', borderRadius: 4, marginBottom: 8 }} />
            <div style={{ height: 10, width: '25%', background: '#E2E8F0', borderRadius: 4 }} />
          </div>
          <div style={{ width: 80, height: 28, background: '#F1F5F9', borderRadius: 'var(--r-full)' }} />
        </div>
      ))}
    </div>
  )
}
