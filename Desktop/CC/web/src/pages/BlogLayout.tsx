import { Link, Outlet } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function BlogLayout() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
      {/* Header blog */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid var(--ink-4)',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div className="container" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 60,
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <ArrowLeft size={16} color="#64748B" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#0F172A' }}>
              Calendario<span style={{ color: 'var(--em)' }}>Compliance</span>
            </span>
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Link to="/blog" style={{ fontSize: 14, color: '#64748B', textDecoration: 'none', fontWeight: 500 }}>
              Blog
            </Link>
            <a href="/register" className="btn btn-primary" style={{ fontSize: 13, padding: '8px 20px', minHeight: 36 }}>
              Empieza gratis
            </a>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer style={{
        borderTop: '1px solid var(--ink-4)',
        padding: '32px 0',
        marginTop: 80,
        textAlign: 'center',
        fontSize: 13, color: '#94A3B8',
      }}>
        <div className="container">
          <p>
            © 2026 Calendario Compliance ·{' '}
            <a href="/privacy" style={{ color: '#64748B', textDecoration: 'none' }}>Privacidad</a>
            {' · '}
            <a href="/terms" style={{ color: '#64748B', textDecoration: 'none' }}>Términos</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
