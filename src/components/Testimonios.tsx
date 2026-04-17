import { useReveal } from '../hooks/useReveal'

const TESTIMONIALS = [
  {
    quote: 'Antes tardábamos días en preparar evidencia para una auditoría. Ahora la descargo en segundos.',
    name: 'Lic. Mariana Solís',
    role: 'Directora de Comercio Exterior',
    company: 'Grupo Manufacturas del Norte',
    initials: 'MS',
  },
  {
    quote: 'Manejo 40 clientes y Calendario Compliance me da visibilidad total sin hojas de Excel.',
    name: 'Lic. Roberto Garza',
    role: 'Agente Aduanal Patente 3421',
    company: 'Garza & Asociados Aduanales',
    initials: 'RG',
  },
  {
    quote: 'La dirección general ahora ve el status de compliance en tiempo real. Cero fricciones con el SAT.',
    name: 'C.P. Fernanda Rivas',
    role: 'CFO',
    company: 'Electrocomponentes de México S.A.',
    initials: 'FR',
  },
]

export default function Testimonios() {
  const ref = useReveal()

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="section" id="testimonios"
      style={{ background: 'linear-gradient(135deg, var(--ink-2) 0%, var(--ink-3) 100%)', position: 'relative' }}>

      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60, maxWidth: 560, marginInline: 'auto' }}>
          <span className="badge reveal" style={{
            marginBottom: 16, background: 'rgb(13 148 136 / 0.12)',
            borderColor: 'rgb(13 148 136 / 0.25)', color: 'var(--em-light)'
          }}>
            CONFÍAN EN NOSOTROS
          </span>
          <h2 className="reveal delay-1" style={{
            fontSize: 'clamp(26px, 4vw, 42px)', color: 'var(--snow)',
            marginBottom: 14, fontWeight: 700,
          }}>
            Lo que dicen nuestros clientes
          </h2>
          <p className="reveal delay-2" style={{
            fontSize: 16, color: 'rgb(255 255 255 / 0.6)', lineHeight: 1.7,
          }}>
            Directores de ComEx, agentes aduanales y CFOs que ya optimizaron su compliance.
          </p>
        </div>

        {/* Testimonial Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
          alignItems: 'start',
        }}>
          {TESTIMONIALS.map(({ quote, name, role, company, initials }, i) => (
            <div key={name}
              className={`reveal-scale delay-${i + 1}`}
              style={{
                background: 'linear-gradient(135deg, var(--ink-3) 0%, var(--ink-2) 100%)',
                border: '1px solid rgb(255 255 255 / 0.1)',
                borderRadius: 'var(--r-xl)',
                borderLeft: '3px solid var(--em-light)',
                padding: 32,
                position: 'relative',
                display: 'flex', flexDirection: 'column',
                boxShadow: 'var(--sh-md), 0 0 24px rgb(13 148 136 / 0.08)',
                transition: 'all var(--dur-base)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-lg), 0 0 32px rgb(13 148 136 / 0.12)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-md), 0 0 24px rgb(13 148 136 / 0.08)'
                ;(e.currentTarget as HTMLElement).style.transform = ''
              }}>

              {/* Quotation mark */}
              <div style={{
                fontSize: 48, fontFamily: 'var(--font-display)',
                color: 'var(--em-light)', lineHeight: 1, marginBottom: 16,
                opacity: 0.25,
              }}>
                "
              </div>

              {/* Quote */}
              <p style={{
                fontSize: 16, fontStyle: 'italic', color: 'rgb(255 255 255 / 0.8)',
                lineHeight: 1.6, marginBottom: 24, flexGrow: 1,
              }}>
                {quote}
              </p>

              {/* Author */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                paddingTop: 20, borderTop: '1px solid rgb(255 255 255 / 0.08)',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: `linear-gradient(135deg, var(--em-light), var(--em))`,
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, flexShrink: 0,
                  boxShadow: 'var(--sh-accent)',
                }}>
                  {initials}
                </div>
                <div>
                  <div style={{
                    fontSize: 14, fontWeight: 700, color: 'var(--snow)',
                  }}>
                    {name}
                  </div>
                  <div style={{
                    fontSize: 12, color: 'rgb(255 255 255 / 0.6)',
                  }}>
                    {role}
                  </div>
                  <div style={{
                    fontSize: 11, color: 'rgb(255 255 255 / 0.4)',
                  }}>
                    {company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
