import { PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'
import { useState, useMemo } from 'react'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const WEEKDAYS = ['Lu','Ma','Mi','Ju','Vi','Sa','Do']

const DEMO_ITEMS = [
  { id: 1, titulo: 'Reporte mensual IMMEX',   programa: 'IMMEX',             diaOffset: -2,  status: 'vencido'   },
  { id: 2, titulo: 'Pago derechos aduanales', programa: 'Padrón Importador', diaOffset: 4,   status: 'proximo'   },
  { id: 3, titulo: 'Presentación Anexo 30',   programa: 'PROSEC',            diaOffset: 8,   status: 'proximo'   },
  { id: 4, titulo: 'Encuesta económica anual',programa: 'IMMEX',             diaOffset: 14,  status: 'pendiente' },
  { id: 5, titulo: 'Actualización de socios', programa: 'IMMEX',             diaOffset: 21,  status: 'pendiente' },
] as const

type StatusKey = 'vencido' | 'proximo' | 'pendiente' | 'completado'

const STATUS_COLOR: Record<StatusKey, string> = {
  vencido:    '#ef4444',
  proximo:    '#eab308',
  pendiente:  '#0369A1',
  completado: '#22c55e',
}

export default function Demo() {
  const ref = useReveal()
  const [showModal, setShowModal] = useState(false)
  const [visMes, setVisMes]       = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const obligsByDay = useMemo(() => {
    const hoy  = new Date()
    const map  = new Map<number, typeof DEMO_ITEMS[number][]>()
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
        style={{ background: 'var(--ink)', position: 'relative', overflow: 'hidden', paddingTop: 80, paddingBottom: 80 }}
      >
        {/* Background glow */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 800, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgb(16 185 129 / 0.06) 0%, transparent 70%)',
          filter: 'blur(80px)', pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', maxWidth: '72rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span className="badge reveal" style={{
              marginBottom: 16, background: 'rgb(16 185 129 / 0.12)',
              borderColor: 'rgb(16 185 129 / 0.25)', color: '#34d399',
            }}>
              VER EN ACCIÓN
            </span>
            <h2 className="reveal delay-1" style={{
              fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--snow)',
              marginBottom: 16, fontWeight: 600,
            }}>
              El compliance que siempre quisiste tener
            </h2>
            <p className="reveal delay-2" style={{
              fontSize: 16, color: 'rgb(255 255 255 / 0.45)',
              lineHeight: 1.7, maxWidth: 500, marginInline: 'auto',
            }}>
              Toda tu operación de ComEx en un solo lugar.
            </p>
          </div>

          {/* Browser Mockup */}
          <div className="reveal-scale float-anim" style={{
            background: 'linear-gradient(135deg, #1a2a3a 0%, #0f1a28 100%)',
            border: '1px solid rgb(255 255 255 / 0.1)',
            borderRadius: 'var(--r-2xl)',
            overflow: 'hidden',
            boxShadow: '0 0 60px rgb(16 185 129 / 0.1), inset 0 1px 0 rgb(255 255 255 / 0.05)',
            marginBottom: 40,
          }}>
            {/* Browser chrome */}
            <div style={{
              background: 'rgb(15 23 42 / 0.8)',
              padding: '12px 16px',
              borderBottom: '1px solid rgb(255 255 255 / 0.05)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#eab308' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 12, color: 'rgb(255 255 255 / 0.35)' }}>
                app.calendariocompliance.mx/calendario
              </div>
            </div>

            {/* ── Calendario interactivo ── */}
            <div style={{ padding: '20px 24px 24px', minHeight: 340 }}>

              {/* Nav de mes */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <button
                  onClick={() => navMes(-1)}
                  aria-label="Mes anterior"
                  style={{ background: 'none', border: 'none', color: 'rgb(255 255 255 / 0.5)', cursor: 'pointer', padding: 4, borderRadius: 4 }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'rgb(255 255 255 / 0.8)', letterSpacing: '0.05em' }}>
                  {MESES[visMes.getMonth()]} {visMes.getFullYear()}
                </span>
                <button
                  onClick={() => navMes(1)}
                  aria-label="Mes siguiente"
                  style={{ background: 'none', border: 'none', color: 'rgb(255 255 255 / 0.5)', cursor: 'pointer', padding: 4, borderRadius: 4 }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Cabecera días semana */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
                {WEEKDAYS.map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 10, color: 'rgb(255 255 255 / 0.35)', fontWeight: 600, padding: '2px 0' }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid de días */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(dia => {
                  const items = obligsByDay.get(dia)
                  const isHoy = esHoy(dia)
                  const isSel = selectedDay === dia
                  return (
                    <div
                      key={dia}
                      onClick={() => setSelectedDay(isSel ? null : (items ? dia : null))}
                      style={{
                        aspectRatio: '1/1',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 4, fontSize: 11, fontWeight: isHoy ? 700 : 400,
                        color: isHoy ? '#ffffff' : 'rgb(255 255 255 / 0.65)',
                        background: isSel
                          ? 'rgba(3,105,161,0.35)'
                          : isHoy
                            ? 'rgba(3,105,161,0.5)'
                            : 'rgb(255 255 255 / 0.03)',
                        border: isHoy ? '1px solid rgba(3,105,161,0.6)' : '1px solid transparent',
                        cursor: items ? 'pointer' : 'default',
                        transition: 'background 150ms',
                      }}
                    >
                      {dia}
                      {items && (
                        <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                          {items.slice(0, 2).map(it => (
                            <div key={it.id} style={{
                              width: 5, height: 5, borderRadius: '50%',
                              background: STATUS_COLOR[it.status as StatusKey],
                            }} />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Panel día seleccionado */}
              {selectedDay !== null && obligsByDay.get(selectedDay) && (
                <div style={{ marginTop: 12, borderTop: '1px solid rgb(255 255 255 / 0.08)', paddingTop: 12 }}>
                  {obligsByDay.get(selectedDay)!.map(it => (
                    <div key={it.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 0', borderBottom: '1px solid rgb(255 255 255 / 0.05)',
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        background: STATUS_COLOR[it.status as StatusKey],
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 11, color: 'rgb(255 255 255 / 0.85)', fontWeight: 500,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {it.titulo}
                        </div>
                        <div style={{ fontSize: 10, color: 'rgb(255 255 255 / 0.4)', marginTop: 1 }}>
                          {it.programa}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Leyenda */}
              <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                {([['#ef4444','Vencida'],['#eab308','Por vencer'],['#0369A1','Pendiente']] as [string,string][]).map(([c, l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'rgb(255 255 255 / 0.4)' }}>
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
              className="reveal"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--em)', color: 'white',
                padding: '14px 32px', borderRadius: 'var(--r-lg)',
                fontSize: 15, fontWeight: 600, border: 'none',
                cursor: 'pointer', transition: 'all var(--dur-base) var(--ease-out)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(3,105,161,0.4)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              }}
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
