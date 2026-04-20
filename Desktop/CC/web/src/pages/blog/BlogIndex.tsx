import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Tag } from 'lucide-react'
import SEO from '../../components/SEO'

const POSTS = [
  {
    slug: 'raoce-2026-que-es-como-cumplir',
    title: 'RAOCE 2026: Qué es y cómo cumplir antes del 31 de mayo',
    description: 'El RAOCE vence el 31 de mayo. Conoce quién debe presentarlo, los documentos necesarios y cómo evitar multas.',
    date: '20 de abril, 2026',
    category: 'IMMEX',
    readingTime: '6 min',
    urgent: true,
  },
  {
    slug: 'obligaciones-mensuales-immex',
    title: 'Obligaciones mensuales IMMEX: la lista completa para 2026',
    description: 'Todas las obligaciones que debes cumplir cada mes con un programa IMMEX activo. Fechas, fundamentos legales y consecuencias.',
    date: '18 de abril, 2026',
    category: 'IMMEX',
    readingTime: '8 min',
    urgent: false,
  },
  {
    slug: 'anexo-24-contabilidad-electronica',
    title: 'Anexo 24: Contabilidad electrónica para empresas IMMEX en 2026',
    description: 'Guía completa del Anexo 24: qué es, quién lo aplica, periodicidad y los 5 errores más comunes que llevan a multas.',
    date: '15 de abril, 2026',
    category: 'General',
    readingTime: '7 min',
    urgent: false,
  },
]

export default function BlogIndex() {
  return (
    <>
      <SEO
        title="Blog de Comercio Exterior — Obligaciones IMMEX, SAT y PROSEC"
        description="Guías, artículos y actualizaciones sobre obligaciones de Comercio Exterior en México: IMMEX, PROSEC, SAT, RAOCE y más."
        canonical="https://calendariocompliance.mx/blog"
      />

      <div style={{ paddingBlock: '64px 96px' }}>
        <div className="container" style={{ maxWidth: 860 }}>
          {/* Header */}
          <div style={{ marginBottom: 56 }}>
            <span className="badge" style={{ marginBottom: 16 }}>Blog</span>
            <h1 style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 800, color: 'var(--snow)',
              marginBottom: 16, lineHeight: 1.1,
            }}>
              Comercio Exterior sin sorpresas
            </h1>
            <p style={{ fontSize: 17, color: '#64748B', lineHeight: 1.7, maxWidth: 560 }}>
              Guías prácticas sobre obligaciones IMMEX, PROSEC, SAT y cumplimiento aduanero. Para directores de ComEx, agentes aduanales y CFOs.
            </p>
          </div>

          {/* Posts list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {POSTS.map(({ slug, title, description, date, category, readingTime, urgent }) => (
              <Link key={slug} to={`/blog/${slug}`} style={{ textDecoration: 'none' }}>
                <article
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--ink-4)',
                    borderLeft: urgent ? '3px solid var(--warn)' : '1px solid var(--ink-4)',
                    borderRadius: 'var(--r-xl)',
                    padding: '28px 32px',
                    transition: 'all 200ms ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-lg)'
                    ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none'
                    ;(e.currentTarget as HTMLElement).style.transform = ''
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                    <span className="chip chip-info" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Tag size={10} />
                      {category}
                    </span>
                    {urgent && <span className="chip chip-warn">⚠ Vence pronto</span>}
                    <span style={{ fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} />
                      {readingTime}
                    </span>
                    <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 'auto' }}>{date}</span>
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--snow)', marginBottom: 10, lineHeight: 1.3 }}>{title}</h2>
                  <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.6, marginBottom: 16 }}>{description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--em)', fontSize: 13, fontWeight: 600 }}>
                    Leer artículo <ArrowRight size={14} />
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div style={{
            marginTop: 64, padding: 40,
            background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F7FF 100%)',
            border: '1px solid rgba(3,105,161,0.15)',
            borderRadius: 'var(--r-2xl)',
            textAlign: 'center',
          }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--snow)', marginBottom: 10 }}>
              ¿Cansado de rastrear fechas en Excel?
            </h3>
            <p style={{ fontSize: 15, color: '#64748B', marginBottom: 24 }}>
              Calendario Compliance centraliza todas estas obligaciones con alertas automáticas.
            </p>
            <a href="/register" className="btn btn-primary">
              Empieza gratis — sin tarjeta
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
