import { Building2, ToggleRight, Calendar } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'

const STEPS = [
  { num: '01', icon: <Building2 size={20} aria-hidden="true" />, title: 'Registra tu empresa', desc: 'RFC y datos básicos en 5 minutos.' },
  { num: '02', icon: <ToggleRight size={20} aria-hidden="true" />, title: 'Activa tus programas', desc: 'IMMEX, PROSEC o Padrón Importador.' },
  { num: '03', icon: <Calendar size={20} aria-hidden="true" />, title: 'Tu calendario aparece', desc: 'Fechas automáticas para los próximos 12 meses.' },
]

export default function HowItWorks() {
  const ref = useReveal()

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="section" id="how"
      style={{ background: 'var(--surface)', borderTop: '1px solid var(--surface-2)', borderBottom: '1px solid var(--surface-2)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: 560, marginInline: 'auto', marginBottom: 60 }}>
          <span className="badge reveal" style={{ marginBottom: 16 }}>Cómo funciona</span>
          <h2 className="reveal delay-1" style={{ fontSize: 'clamp(26px, 4vw, 42px)', marginBottom: 14, color: '#0f172a' }}>
            3 pasos, listo para todo el año
          </h2>
          <p className="reveal delay-2" style={{ fontSize: 15, color: '#666666', lineHeight: 1.7 }}>
            Configura una sola vez, luego el sistema se encarga.
          </p>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 24,
          maxWidth: 900, marginInline: 'auto',
          position: 'relative',
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {/* Connector line desktop */}
          <div aria-hidden="true" className="step-line" style={{
            position: 'absolute', top: '50%', left: '15%', right: '15%',
            height: 2, transform: 'translateY(-50%)',
            background: 'linear-gradient(90deg, var(--em), rgba(3,105,161,0.1))',
            zIndex: 0, display: 'none',
          }} />

          {STEPS.map(({ num, icon, title, desc }) => (
            <div key={num} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                className="reveal-scale"
                style={{
                  background: 'var(--surface)',
                  borderRadius: 'var(--r-lg)',
                  padding: '24px 20px',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--sh-sm)',
                  textAlign: 'center',
                  minWidth: 200,
                  position: 'relative',
                  transition: 'box-shadow var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-lg), 0 0 0 2px var(--em)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-sm)'
                  ;(e.currentTarget as HTMLElement).style.transform = ''
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--r-full)',
                  background: 'var(--em)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', marginBottom: 12,
                  boxShadow: 'var(--sh-em)', marginInline: 'auto',
                }}>
                  {icon}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
                  color: '#0f172a', marginBottom: 6,
                }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#525252', lineHeight: 1.5 }}>{desc}</p>
              </div>
              {STEPS.findIndex(s => s.num === num) < STEPS.length - 1 && (
                <div style={{
                  fontSize: 20, color: 'rgb(13 148 136 / 0.3)',
                  display: 'none',
                }}>
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .step-line { display: none; } }
      `}</style>
    </section>
  )
}
