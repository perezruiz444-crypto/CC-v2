import { Lock, ArrowRight } from 'lucide-react'
import { PLAN_META, planMinimoParaFeature, type FeatureKey } from '../lib/plans'

interface PlanPaywallProps {
  feature: FeatureKey
  titulo: string
  descripcion: string
  planActual?: string | null
}

export function PlanPaywall({ feature, titulo, descripcion, planActual: _planActual }: PlanPaywallProps) {
  const planMinimo = planMinimoParaFeature(feature)
  const meta = PLAN_META[planMinimo]

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '16px 20px',
      background: '#EFF6FF',
      border: '1px solid #BFDBFE',
      borderRadius: 'var(--r-xl)',
      flexWrap: 'wrap',
    }}>
      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: 'var(--r-lg)',
        background: '#DBEAFE',
        border: '1px solid #BFDBFE',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Lock size={16} color="#0369A1" />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 180 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>
          {titulo}
        </p>
        <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
          {descripcion}
        </p>
      </div>

      {/* Plan badge */}
      <span style={{
        fontSize: 11, fontWeight: 700,
        padding: '4px 10px', borderRadius: 'var(--r-full)',
        background: '#DBEAFE',
        border: '1px solid #93C5FD',
        color: '#0369A1',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap' as const,
        flexShrink: 0,
      }}>
        Requiere {meta.label}
      </span>

      {/* CTA */}
      <a
        href={meta.href}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 'var(--r-lg)',
          background: '#0369A1',
          color: '#FFFFFF',
          fontSize: 13, fontWeight: 600, textDecoration: 'none',
          flexShrink: 0,
          transition: 'all var(--dur-fast)',
          whiteSpace: 'nowrap' as const,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = '#0284C7'
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = '#0369A1'
          ;(e.currentTarget as HTMLElement).style.transform = ''
        }}
      >
        Empezar prueba
        <ArrowRight size={13} />
      </a>
    </div>
  )
}
