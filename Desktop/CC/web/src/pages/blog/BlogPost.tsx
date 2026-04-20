import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Clock, Tag, ArrowRight } from 'lucide-react'
import SEO from '../../components/SEO'
import { lazy, Suspense } from 'react'

interface PostMeta {
  title: string
  description: string
  date: string
  category: string
  readingTime: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const POST_MODULES: Record<string, { loader: () => Promise<{ default: any }>, meta: PostMeta }> = {
  'raoce-2026-que-es-como-cumplir': {
    loader: () => import('../../content/blog/raoce-2026-que-es-como-cumplir.mdx'),
    meta: {
      title: 'RAOCE 2026: Qué es y cómo cumplir antes del 31 de mayo',
      description: 'El RAOCE vence el 31 de mayo. Conoce quién debe presentarlo, los documentos necesarios y cómo evitar multas.',
      date: '20 de abril, 2026',
      category: 'IMMEX',
      readingTime: '6 min',
    },
  },
  'obligaciones-mensuales-immex': {
    loader: () => import('../../content/blog/obligaciones-mensuales-immex.mdx'),
    meta: {
      title: 'Obligaciones mensuales IMMEX: la lista completa para 2026',
      description: 'Todas las obligaciones que debes cumplir cada mes con un programa IMMEX activo en México.',
      date: '18 de abril, 2026',
      category: 'IMMEX',
      readingTime: '8 min',
    },
  },
  'anexo-24-contabilidad-electronica': {
    loader: () => import('../../content/blog/anexo-24-contabilidad-electronica.mdx'),
    meta: {
      title: 'Anexo 24: Contabilidad electrónica para empresas IMMEX en 2026',
      description: 'Guía completa del Anexo 24: qué es, quién lo aplica, periodicidad y los 5 errores más comunes.',
      date: '15 de abril, 2026',
      category: 'General',
      readingTime: '7 min',
    },
  },
}

const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 {...props} style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: '#0F172A', marginBottom: 24, lineHeight: 1.2 }} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 {...props} style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', marginTop: 48, marginBottom: 16 }} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 {...props} style={{ fontSize: 17, fontWeight: 600, color: '#0F172A', marginTop: 32, marginBottom: 12 }} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} style={{ fontSize: 16, color: '#334155', lineHeight: 1.8, marginBottom: 20 }} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} style={{ paddingLeft: 24, marginBottom: 20 }} />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol {...props} style={{ paddingLeft: 24, marginBottom: 20 }} />
  ),
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li {...props} style={{ fontSize: 15, color: '#334155', lineHeight: 1.7, marginBottom: 6 }} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong {...props} style={{ color: '#0F172A', fontWeight: 700 }} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote {...props} style={{
      borderLeft: '4px solid var(--warn)',
      paddingLeft: 20, paddingBlock: 4,
      marginBlock: 24, marginLeft: 0,
      background: 'rgba(217,119,6,0.06)',
      borderRadius: '0 8px 8px 0',
    }} />
  ),
  hr: () => <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', marginBlock: 40 }} />,
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div style={{ overflowX: 'auto', marginBottom: 24 }}>
      <table {...props} style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }} />
    </div>
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th {...props} style={{ textAlign: 'left', padding: '10px 14px', background: '#F1F5F9', borderBottom: '2px solid #E2E8F0', fontWeight: 600, color: '#0F172A', fontSize: 13 }} />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td {...props} style={{ padding: '10px 14px', borderBottom: '1px solid #E2E8F0', color: '#334155' }} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props} style={{ color: 'var(--em)', textDecoration: 'underline', textUnderlineOffset: 2 }} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code {...props} style={{ background: '#F1F5F9', borderRadius: 4, padding: '2px 6px', fontSize: '0.9em', color: '#0369A1' }} />
  ),
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  if (!slug || !POST_MODULES[slug]) return <Navigate to="/blog" replace />

  const { loader, meta } = POST_MODULES[slug]
  const PostContent = lazy(loader)

  return (
    <>
      <SEO
        title={meta.title}
        description={meta.description}
        canonical={`https://calendariocompliance.mx/blog/${slug}`}
      />

      <div style={{ paddingBlock: '48px 96px' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <Link to="/blog" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            textDecoration: 'none', color: '#64748B', fontSize: 14,
            marginBottom: 32, fontWeight: 500,
          }}>
            <ArrowLeft size={16} />
            Volver al blog
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            <span className="chip chip-info" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Tag size={10} />
              {meta.category}
            </span>
            <span style={{ fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} />
              {meta.readingTime}
            </span>
            <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 'auto' }}>{meta.date}</span>
          </div>

          <article style={{
            background: '#FFFFFF',
            border: '1px solid var(--ink-4)',
            borderRadius: 'var(--r-2xl)',
            padding: 'clamp(28px, 5vw, 56px)',
            boxShadow: 'var(--sh-sm)',
          }}>
            <Suspense fallback={
              <div style={{ textAlign: 'center', padding: 80, color: '#94A3B8' }}>Cargando artículo...</div>
            }>
              {/* @ts-expect-error MDX components prop */}
              <PostContent components={mdxComponents} />
            </Suspense>
          </article>

          <div style={{
            marginTop: 48, padding: 40,
            background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F7FF 100%)',
            border: '1px solid rgba(3,105,161,0.15)',
            borderRadius: 'var(--r-2xl)',
            textAlign: 'center',
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
              Nunca más pierdas una obligación
            </h3>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 20 }}>
              Calendario Compliance centraliza IMMEX, PROSEC y SAT con alertas automáticas.
            </p>
            <a href="/register" className="btn btn-primary" style={{ fontSize: 14 }}>
              Empieza gratis — sin tarjeta
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
