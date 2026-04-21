import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Funciones', href: '#features' },
  { label: 'Cómo funciona', href: '#how' },
  { label: 'Precios', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: `background ${220}ms, box-shadow ${220}ms, backdrop-filter ${220}ms`,
      background: scrolled ? 'rgba(248,250,252,0.95)' : 'transparent',
      boxShadow: scrolled ? `0 1px 0 rgba(14,165,233,0.15)` : 'none',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 68 }}>

        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17,
            color: 'var(--snow)',
            letterSpacing: '-0.02em',
            transition: 'opacity var(--dur-fast)',
          }}>
            Calendario<span style={{ color: 'var(--em)' }}>Compliance</span>
          </span>
        </a>

        {/* Nav links desktop */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 'auto', marginRight: 24 }}
          aria-label="Navegación principal">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href} className="nav-link-item" style={{
              fontSize: 14, fontWeight: 500,
              color: '#334155',
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 'var(--r-full)',
              transition: 'color var(--dur-fast), background var(--dur-fast)',
            }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.color = '#0369A1'
                ;(e.target as HTMLElement).style.background = 'rgba(3,105,161,0.06)'
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.color = '#334155'
                ;(e.target as HTMLElement).style.background = 'transparent'
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTAs desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          <a href="/login" className="btn btn-ghost-dark nav-cta" style={{ fontSize: 13, padding: '9px 18px', minHeight: 38 }}>
            Iniciar sesión
          </a>
          <a href="/register" className="btn btn-primary nav-cta" style={{ fontSize: 13, padding: '9px 20px', minHeight: 38 }}>
            Empieza gratis
          </a>

          {/* Hamburger mobile */}
          <button onClick={() => setOpen(!open)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open}
            className="nav-hamburger"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, background: 'none', border: 'none',
              cursor: 'pointer', borderRadius: 'var(--r-md)', color: 'var(--snow)',
            }}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background: 'var(--ink-2)',
          borderTop: '1px solid var(--ink-4)',
          padding: '16px 24px 24px',
        }}>
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href} onClick={() => setOpen(false)} style={{
              display: 'block', padding: '13px 0',
              fontSize: 15, fontWeight: 500,
              color: '#334155',
              textDecoration: 'none',
              borderBottom: '1px solid var(--ink-4)',
            }}>
              {label}
            </a>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            <a href="/login" className="btn btn-ghost-dark" style={{ justifyContent: 'center' }}>Iniciar sesión</a>
            <a href="/register" className="btn btn-primary" style={{ justifyContent: 'center' }}>Empieza gratis — sin tarjeta</a>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .nav-link-item { display: block !important; }
          .nav-hamburger { display: none !important; }
        }
        @media (max-width: 767px) {
          .nav-link-item { display: none !important; }
          .nav-cta { display: none !important; }
        }
      `}</style>
    </header>
  )
}
