import { PlayCircle } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'
import { useState, useMemo } from 'react'

export default function Demo() {
  const ref = useReveal()
  const [showModal, setShowModal] = useState(false)

  const dummyDays = useMemo(() => {
    const days = []
    for (let i = 0; i < 35; i++) {
      days.push(i)
    }
    return days
  }, [])

  return (
    <>
      <section ref={ref as React.RefObject<HTMLElement>} className="section" id="demo"
        style={{ background: 'var(--ink)', position: 'relative', overflow: 'hidden', paddingTop: 80, paddingBottom: 80 }}>

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
              borderColor: 'rgb(16 185 129 / 0.25)', color: '#34d399'
            }}>
              VER EN ACCIÓN
            </span>
            <h2 className="reveal delay-1" style={{
              fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--snow)',
              marginBottom: 16, fontWeight: 600
            }}>
              El compliance que siempre quisiste tener
            </h2>
            <p className="reveal delay-2" style={{
              fontSize: 16, color: 'rgb(255 255 255 / 0.45)',
              lineHeight: 1.7, maxWidth: 500, marginInline: 'auto'
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
              <div style={{
                display: 'flex', gap: 6,
              }}>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: '#ef4444',
                }} />
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: '#eab308',
                }} />
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: '#22c55e',
                }} />
              </div>
              <div style={{
                marginLeft: 'auto', fontSize: 12,
                color: 'rgb(255 255 255 / 0.35)',
              }}>
                app.calendariocompliance.mx/dashboard
              </div>
            </div>

            {/* Content area — mockup dashboard */}
            <div style={{ padding: '32px', minHeight: 320, position: 'relative' }}>
              {/* Left sidebar */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{
                      background: 'rgb(255 255 255 / 0.02)',
                      border: '1px solid rgb(255 255 255 / 0.05)',
                      borderRadius: 'var(--r-lg)',
                      padding: 12,
                      fontSize: 12,
                      color: 'rgb(255 255 255 / 0.4)',
                    }}>
                      <div style={{ marginBottom: 4, fontWeight: 500 }}>
                        {i === 1 ? 'IMMEX' : i === 2 ? 'Padrón Importador' : 'PROSEC'}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgb(255 255 255 / 0.25)' }}>
                        Vence en {15 - i * 3} días
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calendar mini grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4,
                  }}>
                    {dummyDays.map((i: number) => {
                      const day = i % 35
                      const statuses = ['#ef4444', '#eab308', '#22c55e', 'rgb(255 255 255 / 0.08)']
                      const color = statuses[day % 4]
                      return (
                        <div key={i} style={{
                          aspectRatio: '1 / 1',
                          background: color,
                          borderRadius: 4,
                          opacity: day % 7 === 0 ? 0.3 : 1,
                        }} />
                      )
                    })}
                  </div>
                  <div style={{
                    display: 'flex', gap: 8, fontSize: 11,
                    color: 'rgb(255 255 255 / 0.35)',
                  }}>
                    <span>🔴 Vencidas</span>
                    <span>🟡 Por vencer</span>
                    <span>🟢 Cumplidas</span>
                  </div>
                </div>
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
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-em-lg)'
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
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgb(0 0 0 / 0.8)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: '#0f172a', borderRadius: 'var(--r-xl)',
            overflow: 'hidden', maxWidth: 900, width: '100%',
            aspectRatio: '16 / 9',
          }} onClick={e => e.stopPropagation()}>
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Demo Calendario Compliance"
              frameBorder="0"
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
