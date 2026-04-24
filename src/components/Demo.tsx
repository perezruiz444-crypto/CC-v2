import { PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'
import { useState, useMemo } from 'react'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const WEEKDAYS = ['Lu','Ma','Mi','Ju','Vi','Sa','Do']

// Obligaciones relativas a hoy (diaOffset = días desde hoy)
// Mismos estados y colores que usa Calendario.tsx en la app autenticada
const DEMO_ITEMS = [
  { id: 1, titulo: 'Reporte mensual IMMEX',   programa: 'IMMEX',             diaOffset: -2,  status: 'vencido'   },
  { id: 2, titulo: 'Pago derechos aduanales', programa: 'Padrón Importador', diaOffset: 4,   status: 'proximo'   },
  { id: 3, titulo: 'Presentación Anexo 30',   programa: 'PROSEC',            diaOffset: 8,   status: 'proximo'   },
  { id: 4, titulo: 'Encuesta económica anual',programa: 'IMMEX',             diaOffset: 14,  status: 'pendiente' },
  { id: 5, titulo: 'Actualización de socios', programa: 'IMMEX',             diaOffset: 21,  status: 'pendiente' },
] as const

type StatusKey = 'vencido' | 'proximo' | 'pendiente' | 'completado'

// Mismos colores semánticos que Calendario.tsx usa con --danger, --warn, --em
const STATUS_COLOR: Record<StatusKey, string> = {
  vencido:    '#DC2626',   // var(--danger)
  proximo:    '#D97706',   // var(--warn)
  pendiente:  '#0369A1',   // var(--em)
  completado: '#16A34A',   // var(--success)
}

const STATUS_LABEL: Record<StatusKey, string> = {
  vencido:    'Vencida',
  proximo:    'Por vencer',
  pendiente:  'Pendiente',
  completado: 'Completada',
}

export default function Demo() {
  const ref = useReveal()
  const [showModal, setShowModal] = useState(false)
  const [visMes, setVisMes]       = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const obligsByDay = useMemo(() => {
    const hoy = new Date()
    const map = new Map<number, typeof DEMO_ITEMS[number][]>()
    DEMO_ITEMS.forEach(item => {
      const fecha = new Date(hoy)
      fecha.setDate(hoy.getDate() + item.diaOffset)
      if (
        fecha.getFullYear() === visMes.getFullYear() &&
        fecha.getMonth()    === visMes.getMonth()
      ) {
        const dia = fecha.getDate()
        if (!map.has(dia)) map.set(dia, [])
        map.get(dia)!.push(item)
      }
    })
    return map
  }, [visMes])

  const firstDay    = (new Date(visMes.getFullYear(), visMes.getMonth(), 1).getDay() + 6) % 7
  const daysInMonth = new Date(visMes.getFullYear(), visMes.getMonth() + 1, 0).getDate()

  const esHoy = (d: number) => {
    const now = new Date()
    return (
      visMes.getFullYear() === now.getFullYear() &&
      visMes.getMonth()    === now.getMonth()    &&
      d === now.getDate()
    )
  }

  const navMes = (delta: number) => {
    setVisMes(p => new Date(p.getFullYear(), p.getMonth() + delta, 1))
    setSelectedDay(null)
  }

  return (
    <>
      <section
        ref={ref as React.RefObject<HTMLElement>}
        className="section"
        id="demo"
        style={{
          background: 'var(--ink)',
          position: 'relative', overflow: 'hidden',
          paddingTop: 80, paddingBottom: 80,
        }}
      >
        {/* Glow decorativo sutil */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(3,105,161,0.06) 0%, transparent 70%)',
          filter: 'blur(80px)', pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', maxWidth: '72rem' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span className="badge reveal" style={{ marginBottom: 16 }}>
              VER EN ACCIÓN
            </span>
            <h2 className="reveal delay-1" style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              color: 'var(--snow)',
              marginBottom: 16, fontWeight: 600,
            }}>
              El compliance que siempre quisiste tener
            </h2>
            <p className="reveal delay-2" style={{
              fontSize: 16,
              color: 'var(--text-muted)',
              lineHeight: 1.7, maxWidth: 500, marginInline: 'auto',
            }}>
              Así se ve tu operación de ComEx cuando todo está organizado.
            </p>
          </div>

          {/* Browser Mockup — light mode */}
          <div className="reveal-scale float-anim" style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-2xl)',
            overflow: 'hidden',
            boxShadow: 'var(--sh-xl)',
            marginBottom: 40,
          }}>

            {/* Browser chrome — light */}
            <div style={{
              background: '#F8FAFC',
              padding: '10px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#eab308' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
              </div>
              <div style={{
                flex: 1, marginInline: 12,
                background: '#FFFFFF', border: '1px solid var(--border)',
                borderRadius: 'var(--r-full)', padding: '4px 12px',
                fontSize: 11, color: 'var(--text-muted)', textAlign: 'center',
              }}>
                app.calendariocompliance.mx/calendario
              </div>
            </div>

            {/* Calendario interactivo — light mode */}
            <div style={{ padding: '24px 28px 28px' }}>

              {/* Nav de mes */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 20,
              }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--snow)' }}>
                    {MESES[visMes.getMonth()]} {visMes.getFullYear()}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {obligsByDay.size} obligación{obligsByDay.size !== 1 ? 'es' : ''} este mes
                  </div>
                </div>
                <div style={{
                  display: 'flex', gap: 4,
                  background: '#FFFFFF', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-full)', padding: '4px 6px',
                }}>
                  <button
                    onClick={() => navMes(-1)}
                    aria-label="Mes anterior"
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'none', border: 'none',
                      color: 'var(--text-muted)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background var(--dur-fast)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F1F5F9'; (e.currentTarget as HTMLElement).style.color = '#0F172A' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => navMes(1)}
                    aria-label="Mes siguiente"
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'none', border: 'none',
                      color: 'var(--text-muted)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background var(--dur-fast)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F1F5F9'; (e.currentTarget as HTMLElement).style.color = '#0F172A' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Cabecera días semana */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
                {WEEKDAYS.map(d => (
                  <div key={d} style={{
                    textAlign: 'center',
                    fontSize: 11, fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    padding: '6px 0',
                  }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid de días */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(dia => {
                  const items  = obligsByDay.get(dia)
                  const isHoy  = esHoy(dia)
                  const isSel  = selectedDay === dia
                  return (
                    <div
                      key={dia}
                      onClick={() => items && setSelectedDay(isSel ? null : dia)}
                      style={{
                        minHeight: 40,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        borderRadius: 'var(--r-md)',
                        fontSize: 13, fontWeight: isHoy ? 700 : 600,
                        color: 'var(--snow)',
                        background: isSel
                          ? 'rgba(3,105,161,0.08)'
                          : isHoy
                            ? '#F1F5F9'
                            : 'transparent',
                        border: isSel
                          ? '1px solid rgba(3,105,161,0.3)'
                          : isHoy
                            ? '1px solid var(--border)'
                            : '1px solid transparent',
                        cursor: items ? 'pointer' : 'default',
                        transition: 'background var(--dur-fast)',
                      }}
                      onMouseEnter={e => {
                        if (!isSel && items) {
                          (e.currentTarget as HTMLElement).style.background = '#F8FAFC'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSel) {
                          (e.currentTarget as HTMLElement).style.background = isSel
                            ? 'rgba(3,105,161,0.08)'
                            : isHoy ? '#F1F5F9' : 'transparent'
                        }
                      }}
                    >
                      <span>{dia}</span>
                      {items && (
                        <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
                          {items.slice(0, 3).map(it => (
                            <div key={it.id} style={{
                              width: 6, height: 6, borderRadius: '50%',
                              background: STATUS_COLOR[it.status as StatusKey],
                            }} />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Panel detalle */}
              {selectedDay !== null && obligsByDay.get(selectedDay) && (
                <div style={{
                  marginTop: 16,
                  background: '#F8FAFC',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '10px 16px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      {MESES[visMes.getMonth()]} {selectedDay}
                    </span>
                    <button
                      onClick={() => setSelectedDay(null)}
                      style={{
                        background: '#FFFFFF', border: '1px solid var(--border)',
                        borderRadius: 'var(--r-full)', padding: '4px 10px',
                        fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      Cerrar
                    </button>
                  </div>
                  {obligsByDay.get(selectedDay)!.map((it, idx, arr) => (
                    <div key={it.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px',
                      borderBottom: idx < arr.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        background: STATUS_COLOR[it.status as StatusKey],
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--snow)' }}>
                          {it.titulo}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {it.programa}
                        </div>
                      </div>
                      <div style={{
                        fontSize: 11, fontWeight: 600,
                        color: STATUS_COLOR[it.status as StatusKey],
                        background: `${STATUS_COLOR[it.status as StatusKey]}14`,
                        padding: '3px 8px', borderRadius: 'var(--r-full)',
                      }}>
                        {STATUS_LABEL[it.status as StatusKey]}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Leyenda */}
              <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                {([
                  ['#DC2626', 'Vencida'],
                  ['#D97706', 'Por vencer'],
                  ['#0369A1', 'Pendiente'],
                ] as [string, string][]).map(([c, l]) => (
                  <div key={l} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 11, color: 'var(--text-muted)',
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
                    {l}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setShowModal(true)}
              className="reveal btn btn-primary"
              style={{ fontSize: 15, padding: '14px 32px' }}
            >
              <PlayCircle size={18} />
              Ver demo de 3 minutos
            </button>
          </div>
        </div>
      </section>

      {/* Modal Demo */}
      {showModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgb(0 0 0 / 0.8)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#0f172a', borderRadius: 'var(--r-xl)',
              overflow: 'hidden', maxWidth: 900, width: '100%',
              aspectRatio: '16 / 9',
            }}
            onClick={e => e.stopPropagation()}
          >
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Demo Calendario Compliance"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ display: 'block' }}
            />
          </div>
        </div>
      )}
    </>
  )
}
