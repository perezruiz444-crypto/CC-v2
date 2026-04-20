import { ArrowRight, ShieldCheck } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'

export default function CTA() {
  const ref = useReveal()

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="section-sm"
      style={{ background: 'var(--snow)', borderTop: '1px solid var(--surface-2)', overflow: 'hidden', position: 'relative' }}>

      {/* Emerald glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: '-40%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(3,105,161,0.08) 0%, transparent 70%)',
        filter: 'blur(50px)', pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', textAlign: 'center', maxWidth: 660 }}>
        <div className="reveal" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 64, height: 64,
          background: 'var(--em-subtle)',
          borderRadius: 'var(--r-xl)',
          marginBottom: 28,
          border: '1px solid rgba(3,105,161,0.2)',
        }}>
          <ShieldCheck size={28} color="var(--em)" aria-hidden="true" />
        </div>

        <h2 className="reveal delay-1" style={{ fontSize: 'clamp(26px, 4vw, 44px)', marginBottom: 18, color: '#0f172a' }}>
          Tu siguiente auditoría puede ser<br />la más tranquila que hayas tenido
        </h2>
        <p className="reveal delay-2" style={{ fontSize: 17, color: '#666666', lineHeight: 1.7, marginBottom: 40 }}>
          Únete a las empresas que ya dejaron el Excel atrás. Configura tu calendario de obligaciones en menos de 10 minutos.
        </p>

        <div className="reveal delay-3" style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginBottom: 28 }}>
          <a href="/register" className="btn btn-primary" style={{ fontSize: 15, padding: '14px 30px', minHeight: 50 }}>
            Empieza gratis — sin tarjeta
            <ArrowRight size={17} aria-hidden="true" />
          </a>
          <a href="/demo" className="btn btn-outline" style={{ fontSize: 15, padding: '14px 26px', minHeight: 50 }}>
            Agendar demo
          </a>
        </div>

        <p className="reveal delay-4" style={{ fontSize: 13, color: 'var(--text-faint)' }}>
          14 días de prueba gratis · Sin contrato · Cancela cuando quieras
        </p>
      </div>
    </section>
  )
}
