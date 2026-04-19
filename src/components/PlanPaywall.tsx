import { Lock, ArrowRight } from 'lucide-react'
import { PLAN_META, PLAN_FEATURES_LANDING, planMinimoParaFeature, type FeatureKey, type Plan } from '../lib/plans'

interface PlanPaywallProps {
  feature: FeatureKey
  titulo: string
  descripcion: string
  planActual?: string | null
}

export function PlanPaywall({ feature, titulo, descripcion, planActual }: PlanPaywallProps) {
  const planMinimo = planMinimoParaFeature(feature)
  const meta = PLAN_META[planMinimo]
  const featuresDelPlan = PLAN_FEATURES_LANDING[planMinimo].included.slice(0, 5)

  return (
    <div style={{
      background: 'var(--ink-2)',
      border: '1px solid rgb(255 255 255 / 0.07)',
      borderRadius: 'var(--r-xl)',
      padding: '40px 32px',
      textAlign: 'center',
      maxWidth: 500,
    }}>
      {/* Ícono lock */}
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'rgb(255 255 255 / 0.04)',
        border: '1px solid var(--ink-4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <Lock size={22} color="rgb(255 255 255 / 0.25)" />
      </div>

      {/* Título y descripción */}
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
        color: 'var(--snow)', marginBottom: 10,
      }}>
        {titulo}
      </h2>
      <p style={{ fontSize: 13, color: 'rgb(255 255 255 / 0.4)', lineHeight: 1.6, marginBottom: 24 }}>
        {descripcion}
      </p>

      {/* Badge del plan mínimo requerido */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '8px 16px', borderRadius: 'var(--r-full)',
        border: `1px solid ${meta.color}`,
        marginBottom: 24,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Requiere plan {meta.label}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'rgb(255 255 255 / 0.3)' }}>
          {meta.precio}{meta.periodo ? ` ${meta.periodo}` : ''}
        </span>
      </div>

      {/* Features destacadas del plan mínimo */}
      <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {featuresDelPlan.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
            <span style={{ color: meta.color, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
            <span style={{ fontSize: 13, color: 'rgb(255 255 255 / 0.5)', lineHeight: 1.5 }}>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href={meta.href}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 24px', borderRadius: 'var(--r-lg)',
          background: meta.color === 'var(--em)' ? 'var(--em)' : 'transparent',
          border: `1px solid ${meta.color}`,
          color: meta.color === 'var(--em)' ? '#fff' : meta.color,
          fontSize: 14, fontWeight: 600, textDecoration: 'none',
          transition: 'all var(--dur-fast)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.opacity = '0.85'
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.opacity = '1'
          ;(e.currentTarget as HTMLElement).style.transform = ''
        }}
      >
        {meta.cta}
        <ArrowRight size={14} />
      </a>

      {planActual && (
        <p style={{ fontSize: 11, color: 'rgb(255 255 255 / 0.2)', marginTop: 16 }}>
          Plan actual: <span style={{ color: 'rgb(255 255 255 / 0.35)', fontWeight: 600 }}>{planActual}</span>
        </p>
      )}
    </div>
  )
}
