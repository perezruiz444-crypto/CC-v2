import { Building2, ToggleRight, Calendar, CheckCircle2 } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'

const STEPS = [
  { num: '01', icon: <Building2 size={20} aria-hidden="true" />, title: 'Registra tu empresa', desc: 'Crea tu cuenta, agrega tu RFC y configura los datos básicos en menos de 5 minutos.' },
  { num: '02', icon: <ToggleRight size={20} aria-hidden="true" />, title: 'Activa tus programas', desc: 'Indica qué programas tiene tu empresa — IMMEX, PROSEC, Certificación IVA/IEPS. El sistema hace el resto.' },
  { num: '03', icon: <Calendar size={20} aria-hidden="true" />, title: 'Tu calendario aparece solo', desc: 'Todas las obligaciones con fechas exactas se proyectan automáticamente para los próximos 12 meses.' },
  { num: '04', icon: <CheckCircle2 size={20} aria-hidden="true" />, title: 'Recibe alertas y cumple', desc: 'Tu equipo recibe recordatorios automáticos. Marca cumplida, adjunta evidencia y genera el reporte.' },
]

export default function HowItWorks() {
  const ref = useReveal()

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="section" id="how"
      style={{ background: 'var(--surface)', borderTop: '1px solid var(--surface-2)', borderBottom: '1px solid var(--surface-2)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: 560, marginInline: 'auto', marginBottom: 60 }}>
          <span className="badge reveal" style={{ marginBottom: 16 }}>Cómo funciona</span>
          <h2 className="reveal delay-1" style={{ fontSize: 'clamp(26px, 4vw, 42px)', marginBottom: 14 }}>
            Configuras una vez,<br />el sistema te avisa el resto del año
          </h2>
          <p className="reveal delay-2" style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Sin hojas de cálculo. Sin correos manuales. Sin depender de que alguien recuerde la fecha.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          maxWidth: 980, marginInline: 'auto',
          position: 'relative',
        }}>
          {/* Connector line desktop */}
          <div aria-hidden="true" className="step-line" style={{
            position: 'absolute', top: 40, left: '12.5%', right: '12.5%',
            height: 2,
            background: 'linear-gradient(90deg, var(--em), rgb(16 185 129 / 0.1))',
            zIndex: 0,
          }} />

          {STEPS.map(({ num, icon, title, desc }, i) => (
            <div key={num}
              className={i % 2 === 0 ? 'reveal-left' : 'reveal-right'}
              style={{
                background: 'var(--snow)',
                borderRadius: 'var(--r-xl)',
                padding: '28px 24px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--sh-sm)',
                position: 'relative', zIndex: 1,
                transition: 'box-shadow var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-lg), 0 0 0 2px var(--em)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-sm)'
                ;(e.currentTarget as HTMLElement).style.transform = ''
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--r-full)',
                background: 'var(--em)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', marginBottom: 20,
                boxShadow: 'var(--sh-em)',
              }}>
                {icon}
              </div>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800,
                color: 'rgb(16 185 129 / 0.12)', lineHeight: 1,
                position: 'absolute', top: 16, right: 20,
              }} aria-hidden="true">{num}</span>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
                color: 'var(--text-primary)', marginBottom: 10,
              }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65 }}>{desc}</p>
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
