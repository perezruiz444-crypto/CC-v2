import { ArrowRight, Zap } from 'lucide-react'
import { useEffect, useRef } from 'react'

const PROGRAMS = ['IMMEX', 'PROSEC', 'IVA/IEPS', 'Padrón Import.', 'IMMEX', 'PROSEC', 'IVA/IEPS', 'Padrón Import.']

const STATS = [
  { value: '50+', label: 'Empresas activas' },
  { value: '2,400+', label: 'Obligaciones gestionadas' },
  { value: '0', label: 'Multas por omisión' },
]

export default function Hero() {
  const counterRef = useRef<HTMLDivElement>(null)

  /* count-up animation on mount */
  useEffect(() => {
    const els = counterRef.current?.querySelectorAll<HTMLElement>('.stat-val')
    els?.forEach((el, i) => {
      el.style.animationDelay = `${400 + i * 120}ms`
      el.style.animationFillMode = 'both'
      el.style.animation = `count-up 500ms cubic-bezier(0.34,1.56,0.64,1) both`
    })
  }, [])

  return (
    <section style={{
      background: 'var(--ink)',
      paddingTop: 120,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'hidden',
      minHeight: '100svh',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Grid texture */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgb(255 255 255 / 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgb(255 255 255 / 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse 80% 70% at 50% 0%, black 0%, transparent 100%)',
      }} />

      {/* Emerald glow blobs */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '8%', left: '60%',
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, rgb(16 185 129 / 0.12) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', top: '40%', left: '-5%',
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgb(59 130 246 / 0.08) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 48 }}>

        {/* Badge */}
        <div style={{ marginBottom: 28 }}>
          <span className="badge reveal" style={{ background: 'rgb(16 185 129 / 0.12)', borderColor: 'rgb(16 185 129 / 0.25)', color: '#34d399' }}>
            <Zap size={11} aria-hidden="true" />
            Catálogo actualizado · Abril 2026
          </span>
        </div>

        {/* Headline */}
        <h1 className="reveal delay-1" style={{
          fontSize: 'clamp(38px, 6.5vw, 74px)',
          fontWeight: 800,
          color: 'var(--snow)',
          maxWidth: 780,
          marginBottom: 24,
        }}>
          Nunca más pierdas una obligación de{' '}
          <span className="shimmer-text">Comercio Exterior</span>
        </h1>

        {/* Subheadline */}
        <p className="reveal delay-2" style={{
          fontSize: 'clamp(16px, 2vw, 19px)',
          color: 'rgb(255 255 255 / 0.55)',
          lineHeight: 1.7,
          maxWidth: 580,
          marginBottom: 40,
        }}>
          Centraliza IMMEX, PROSEC y SAT en un calendario inteligente.
          Alertas automáticas, evidencia documental y reportes listos para auditoría.
        </p>

        {/* CTAs */}
        <div className="reveal delay-3" style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 56 }}>
          <a href="/register" className="btn btn-primary" style={{ fontSize: 15, padding: '14px 30px', minHeight: 50 }}>
            Empieza gratis — sin tarjeta
            <ArrowRight size={17} aria-hidden="true" />
          </a>
          <a href="#demo" className="btn btn-ghost-dark" style={{ fontSize: 15, padding: '14px 26px', minHeight: 50 }}>
            Ver demo de 3 minutos
          </a>
        </div>

        {/* Stats */}
        <div ref={counterRef} className="reveal delay-4" style={{
          display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 64,
        }}>
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div className="stat-val" style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(26px, 3.5vw, 36px)',
                fontWeight: 800,
                color: 'var(--em)',
                lineHeight: 1,
              }}>
                {value}
              </div>
              <div style={{ fontSize: 13, color: 'rgb(255 255 255 / 0.45)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* App mockup — floats at bottom */}
      <div className="reveal delay-5 float-anim" style={{
        maxWidth: 860,
        width: '90%',
        marginInline: 'auto',
        position: 'relative', zIndex: 1,
      }}>
        {/* Browser chrome */}
        <div style={{
          background: 'var(--ink-2)',
          border: '1px solid var(--ink-4)',
          borderBottom: 'none',
          borderRadius: '14px 14px 0 0',
          padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {['#ff5f57','#febc2e','#28c840'].map(c => (
              <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} aria-hidden="true" />
            ))}
          </div>
          <div style={{
            flex: 1, background: 'var(--ink-3)', borderRadius: 'var(--r-sm)',
            height: 22, display: 'flex', alignItems: 'center', paddingInline: 10,
            fontSize: 11, color: 'rgb(255 255 255 / 0.3)',
            maxWidth: 280, marginInline: 'auto',
          }}>
            app.calendariocompliance.mx
          </div>
        </div>

        {/* Dashboard */}
        <div style={{
          background: 'var(--ink-2)',
          border: '1px solid var(--ink-4)',
          borderRadius: '0 0 14px 14px',
          padding: 24, paddingBottom: 0,
          overflow: 'hidden',
        }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Obligaciones activas', val: '42', accent: '#34d399' },
              { label: 'Vencen este mes',      val: '7',  accent: '#f59e0b' },
              { label: 'Cumplimiento',         val: '94%', accent: '#34d399' },
            ].map(({ label, val, accent }) => (
              <div key={label} style={{
                background: 'var(--ink-3)', borderRadius: 'var(--r-md)',
                padding: '14px 16px', border: '1px solid var(--ink-4)',
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: accent, lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 11, color: 'rgb(255 255 255 / 0.4)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Calendar rows */}
          <div style={{ background: 'var(--ink-3)', borderRadius: 'var(--r-md) var(--r-md) 0 0', padding: '14px 16px', border: '1px solid var(--ink-4)', borderBottom: 'none' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgb(255 255 255 / 0.4)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Próximos vencimientos
            </div>
            {[
              { name: 'Reporte mensual IMMEX',        date: '17 Abr', status: 'warn' },
              { name: 'DIOT — Declaración IVA',        date: '17 Abr', status: 'warn' },
              { name: 'Contabilidad electrónica SAT',  date: '25 Abr', status: 'ok'   },
            ].map(({ name, date, status }) => (
              <div key={name} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 0',
                borderBottom: '1px solid var(--ink-4)',
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  background: status === 'ok' ? 'var(--em)' : 'var(--warn)',
                  boxShadow: `0 0 6px ${status === 'ok' ? 'var(--em)' : 'var(--warn)'}`,
                }} aria-hidden="true" />
                <span style={{ flex: 1, fontSize: 12, color: 'rgb(255 255 255 / 0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: status === 'ok' ? 'var(--em)' : 'var(--warn)', flexShrink: 0 }}>{date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Programs ticker */}
      <div style={{
        background: 'var(--ink-3)',
        borderTop: '1px solid var(--ink-4)',
        paddingBlock: 14,
        overflow: 'hidden',
        position: 'relative', zIndex: 1,
        marginTop: 32,
      }}>
        <div className="marquee-track">
          {[...PROGRAMS, ...PROGRAMS].map((p, i) => (
            <span key={i} style={{
              fontSize: 12, fontWeight: 600,
              color: 'rgb(255 255 255 / 0.35)',
              paddingInline: 32,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 12,
              whiteSpace: 'nowrap',
            }}>
              <span style={{ color: 'var(--em)', opacity: 0.5 }}>✦</span>
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
