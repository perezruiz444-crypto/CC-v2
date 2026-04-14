import { Check, ArrowRight, Sparkles } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'

const PLANS = [
  {
    name: 'Básico',
    price: 'Gratis',
    period: '',
    desc: 'Explora sin compromisos.',
    cta: 'Crear cuenta gratis',
    href: '/register',
    featured: false,
    features: ['1 empresa (RFC)', '1 usuario', 'Catálogo completo de obligaciones', 'Calendario de vencimientos', 'Recordatorios por correo'],
    disabled: ['Sin invitar equipo', 'Sin asignación de tareas'],
  },
  {
    name: 'Equipo',
    price: '$990',
    period: 'MXN/mes',
    desc: 'Para departamentos de Comex.',
    cta: 'Empezar prueba gratis',
    href: '/register?plan=equipo',
    featured: true,
    badge: 'Más popular',
    features: ['1 empresa (RFC)', 'Hasta 5 usuarios', 'Todo lo del plan Básico', 'Asignación de obligaciones', 'Evidencia documental', 'Reportes PDF', 'Soporte por correo'],
    disabled: [],
  },
  {
    name: 'Agencia',
    price: '$2,490',
    period: 'MXN/mes',
    desc: 'Múltiples razones sociales.',
    cta: 'Empezar prueba gratis',
    href: '/register?plan=agencia',
    featured: false,
    badge: 'Recomendado',
    features: ['Hasta 5 empresas (RFCs)', 'Hasta 20 usuarios', 'Todo lo del plan Equipo', 'Dashboard global', 'Aislamiento por cliente', 'Soporte prioritario'],
    disabled: [],
  },
  {
    name: 'Enterprise',
    price: 'A consultar',
    period: '',
    desc: 'Corporativos con docenas de RFCs.',
    cta: 'Agendar demo',
    href: '/demo',
    featured: false,
    features: ['Empresas ilimitadas', 'Usuarios ilimitados', 'White-labeling', 'SLA garantizado', 'Onboarding dedicado'],
    disabled: [],
  },
]

export default function Pricing() {
  const ref = useReveal()

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="section" id="pricing"
      style={{ background: 'var(--ink)', position: 'relative', overflow: 'hidden' }}>

      {/* Background glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgb(16 185 129 / 0.07) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative' }}>
        <div style={{ textAlign: 'center', maxWidth: 560, marginInline: 'auto', marginBottom: 60 }}>
          <span className="badge reveal" style={{ marginBottom: 16, background: 'rgb(16 185 129 / 0.12)', borderColor: 'rgb(16 185 129 / 0.25)', color: '#34d399' }}>
            Precios
          </span>
          <h2 className="reveal delay-1" style={{ fontSize: 'clamp(26px, 4vw, 42px)', color: 'var(--snow)', marginBottom: 14 }}>
            Empieza gratis, escala cuando lo necesites
          </h2>
          <p className="reveal delay-2" style={{ fontSize: 16, color: 'rgb(255 255 255 / 0.45)', lineHeight: 1.7 }}>
            Todos los planes incluyen el catálogo completo actualizado. Sin costos ocultos.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 16,
          alignItems: 'start',
        }}>
          {PLANS.map(({ name, price, period, desc, cta, href, featured, badge, features, disabled }, i) => (
            <div key={name}
              className="reveal-scale"
              style={{
                background: featured ? 'var(--snow)' : 'var(--ink-2)',
                border: featured ? '2px solid var(--em)' : '1px solid var(--ink-4)',
                borderRadius: 'var(--r-2xl)',
                padding: featured ? '32px 24px' : '28px 24px',
                position: 'relative',
                boxShadow: featured ? 'var(--sh-em)' : 'none',
                transition: 'box-shadow var(--dur-base) var(--ease-out)',
              }}
              onMouseEnter={e => !featured && ((e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px var(--ink-4), var(--sh-md)')}
              onMouseLeave={e => !featured && ((e.currentTarget as HTMLElement).style.boxShadow = 'none')}
            >
              {badge && (
                <div style={{
                  position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--em)', color: 'white',
                  fontSize: 11, fontWeight: 700, padding: '4px 14px',
                  borderRadius: 'var(--r-full)', whiteSpace: 'nowrap',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <Sparkles size={10} aria-hidden="true" />
                  {badge}
                </div>
              )}

              <p style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: 10,
                color: featured ? 'var(--em-dark)' : 'rgb(255 255 255 / 0.35)',
              }}>{name}</p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 6 }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: price === 'Gratis' || price === 'A consultar' ? 26 : 32,
                  fontWeight: 800, lineHeight: 1,
                  color: featured ? 'var(--text-primary)' : 'var(--snow)',
                }}>{price}</span>
                {period && <span style={{ fontSize: 12, color: featured ? 'var(--text-muted)' : 'rgb(255 255 255 / 0.4)' }}>{period}</span>}
              </div>
              <p style={{ fontSize: 13, marginBottom: 22, color: featured ? 'var(--text-muted)' : 'rgb(255 255 255 / 0.4)', lineHeight: 1.5 }}>{desc}</p>

              <a href={href} className={featured ? 'btn btn-primary' : 'btn btn-ghost-dark'}
                style={{ width: '100%', justifyContent: 'center', marginBottom: 24, fontSize: 14,
                  ...(featured ? {} : { borderColor: 'var(--ink-4)' }) }}>
                {cta}
                {featured && <ArrowRight size={15} aria-hidden="true" />}
              </a>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <Check size={14} strokeWidth={2.5} style={{ color: 'var(--em)', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                    <span style={{ fontSize: 13, color: featured ? 'var(--text-muted)' : 'rgb(255 255 255 / 0.6)', lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
                {disabled.map(d => (
                  <li key={d} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, opacity: 0.35 }}>
                    <span style={{ width: 14, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: featured ? 'var(--text-faint)' : 'rgb(255 255 255 / 0.3)', lineHeight: 1.5 }}>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="reveal" style={{ textAlign: 'center', marginTop: 36, fontSize: 13, color: 'rgb(255 255 255 / 0.3)' }}>
          14 días de prueba gratis en todos los planes de pago. Sin tarjeta requerida.
        </p>
      </div>
    </section>
  )
}
