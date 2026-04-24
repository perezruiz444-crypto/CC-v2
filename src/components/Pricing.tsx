import { Check, ArrowRight, Sparkles, Lock } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'
import { useState } from 'react'
import { PLAN_META, PLAN_FEATURES_LANDING, PLAN_ORDER } from '../lib/plans'

// Construir la lista de planes desde lib/plans.ts (fuente única de verdad)
const PLANS = PLAN_ORDER.map(planKey => {
  const meta = PLAN_META[planKey]
  const features = PLAN_FEATURES_LANDING[planKey]
  return {
    key: planKey,
    name: meta.label,
    price: meta.precio,
    period: meta.periodo,
    desc: meta.desc,
    cta: meta.cta,
    href: meta.href,
    featured: meta.featured,
    badge: meta.badge,
    features: features.included,
    disabled: features.disabled,
  }
})

export default function Pricing() {
  const ref = useReveal()
  const [expandedPlans, setExpandedPlans] = useState<{ [key: string]: boolean }>({})

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="section" id="pricing"
      style={{ background: 'var(--ink-3)', position: 'relative', overflow: 'hidden' }}>

      {/* Background glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgb(16 185 129 / 0.07) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative' }}>
        <div style={{ textAlign: 'center', maxWidth: 560, marginInline: 'auto', marginBottom: 60 }}>
          <span className="badge reveal" style={{ marginBottom: 16 }}>
            Precios
          </span>
          <h2 className="reveal delay-1" style={{ fontSize: 'clamp(26px, 4vw, 42px)', color: 'var(--text-primary)', marginBottom: 14 }}>
            Empieza gratis, escala cuando lo necesites
          </h2>
          <p className="reveal delay-2" style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Todos los planes incluyen el catálogo completo actualizado. Sin costos ocultos.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 16,
          alignItems: 'start',
        }}>
          {PLANS.map(({ key, name, price, period, desc, cta, href, featured, badge, features, disabled }) => {
            const isExpanded = expandedPlans[name]
            const visibleFeatures = isExpanded ? features : features.slice(0, 3)
            const hasMore = features.length > 3

            return (
            <div key={key}
              className={featured ? 'reveal-scale glow-pulse' : 'reveal-scale'}
              style={{
                background: featured ? 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' : 'var(--surface)',
                border: featured ? '2px solid var(--em)' : '1px solid var(--border)',
                borderRadius: 'var(--r-2xl)',
                padding: featured ? '40px 32px' : '32px 28px',
                position: 'relative',
                boxShadow: featured ? 'var(--sh-accent), 0 0 40px rgb(13 148 136 / 0.15)' : 'var(--sh-card)',
                transition: 'all var(--dur-base) var(--ease-out)',
              }}
              onMouseEnter={e => {
                if (!featured) {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-md)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--em)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                }
              }}
              onMouseLeave={e => {
                if (!featured) {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-card)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLElement).style.transform = ''
                }
              }}
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
                color: featured ? 'var(--em-dark)' : 'var(--text-muted)',
              }}>{name}</p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 6 }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: price === 'Gratis' || price === 'A consultar' ? 26 : 32,
                  fontWeight: 800, lineHeight: 1,
                  color: 'var(--text-primary)',
                }}>{price}</span>
                {period && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{period}</span>}
              </div>
              <p style={{ fontSize: 13, marginBottom: 22, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</p>

              <a href={href} className={featured ? 'btn btn-primary' : 'btn btn-outline'}
                style={{ width: '100%', justifyContent: 'center', marginBottom: 24, fontSize: 14,
                  ...(featured ? {} : { borderColor: 'var(--border)' }) }}>
                {cta}
                {featured && <ArrowRight size={15} aria-hidden="true" />}
              </a>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {visibleFeatures.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <Check size={14} strokeWidth={2.5} style={{ color: 'var(--em)', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
                {disabled.map(d => (
                  <li key={d} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, opacity: 0.35 }}>
                    <span style={{ width: 14, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.5 }}>{d}</span>
                  </li>
                ))}
              </ul>

              {hasMore && (
                <button
                  onClick={() => setExpandedPlans({ ...expandedPlans, [name]: !isExpanded })}
                  style={{
                    marginTop: 16, fontSize: 13, fontWeight: 500,
                    color: 'var(--em)', background: 'none', border: 'none',
                    cursor: 'pointer', padding: 0,
                  }}
                >
                  {isExpanded ? '− Ver menos' : '+ Ver todo'}
                </button>
              )}
            </div>
            )
          })}
        </div>

        {/* Trust signals */}
        <div className="reveal" style={{
          textAlign: 'center', marginTop: 48, fontSize: 13,
          color: 'var(--text-faint)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: 16,
          flexWrap: 'wrap',
        }}>
          {['14 días gratis en todos los planes', 'Sin tarjeta de crédito', 'Cancela cuando quieras', 'Soporte en español'].map((signal, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={12} style={{ color: 'rgb(16 185 129)', flexShrink: 0 }} aria-hidden="true" />
              <span>{signal}</span>
              {i < 3 && <span style={{ color: 'var(--border)', margin: '0 2px' }}>·</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
