import { X, ArrowRight } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'

const PAINS = [
  'Vencimientos en Excel sin sincronización',
  'Multas por plazos perdidos',
  'Auditorías caóticas sin evidencia organizada',
  'Equipos desincronizados en reportes',
]

export default function PainPoints() {
  const ref = useReveal()

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="section-sm" id="pain"
      style={{ background: 'var(--surface)', borderTop: '1px solid var(--surface-2)' }}>
      <div className="container">
        <div style={{ maxWidth: 600, marginInline: 'auto', textAlign: 'center' }}>
          <h2 className="reveal" style={{ fontSize: 'clamp(26px, 4vw, 38px)', marginBottom: 14, color: '#0f172a' }}>
            ¿Te suena familiar?
          </h2>
          <p className="reveal delay-1" style={{ fontSize: 15, color: '#666666', marginBottom: 44 }}>
            Los problemas que todas las áreas de ComEx enfrentan.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 44 }}>
            {PAINS.map((pain) => (
              <div key={pain}
                className="reveal-left"
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  background: 'var(--snow)',
                  borderRadius: 'var(--r-lg)',
                  padding: '16px 22px',
                  border: '1px solid var(--border)',
                  textAlign: 'left',
                  boxShadow: 'var(--sh-sm)',
                  transition: 'box-shadow var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-md)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateX(4px)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-sm)'
                  ;(e.currentTarget as HTMLElement).style.transform = ''
                }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                  background: 'rgb(239 68 68 / 0.09)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <X size={13} color="var(--danger)" strokeWidth={2.5} aria-hidden="true" />
                </div>
                <p style={{ fontSize: 15, color: '#3f3f3f', lineHeight: 1.6 }}>{pain}</p>
              </div>
            ))}
          </div>

          <a href="#features" className="btn btn-primary reveal delay-5">
            Hay una mejor forma
            <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
