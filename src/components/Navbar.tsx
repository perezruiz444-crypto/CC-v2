import { useState, useEffect, forwardRef } from 'react'
import { Menu, X } from 'lucide-react'
import Button from './ui/Button'
import Card from './ui/Card'

const NAV_LINKS = [
  { label: 'Funciones', href: '#features' },
  { label: 'Cómo funciona', href: '#how' },
  { label: 'Precios', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

interface NavbarProps {
  onNavigate?: (href: string) => void
}

const Navbar = forwardRef<HTMLElement, NavbarProps>(({ onNavigate }, ref) => {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setOpen(false)
    onNavigate?.(href)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <header
      ref={ref}
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-[var(--duration-base)] ease-[var(--easing-in-out)]
        ${scrolled
          ? 'bg-[rgba(248,250,252,0.95)] shadow-[0_1px_0_rgba(14,165,233,0.15)] backdrop-blur-[12px]'
          : 'bg-transparent shadow-none backdrop-blur-none'
        }
      `}
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="container mx-auto px-6 flex items-center justify-between h-[68px]">

        {/* Logo */}
        <a
          href="/"
          className="flex items-center flex-shrink-0 focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2 rounded-md"
          aria-label="CalendarioCompliance inicio"
        >
          <span className="font-bold text-lg tracking-tight text-[var(--color-text-primary)] transition-opacity duration-[var(--duration-fast)]">
            Calendario<span className="text-[var(--color-primary)]">Compliance</span>
          </span>
        </a>

        {/* Nav links desktop */}
        <nav
          className="nav-link-item hidden md:flex items-center gap-2 ml-auto mr-6"
          aria-label="Enlaces de navegación"
        >
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={() => handleNavClick(href)}
              className="
                px-4 py-1.5 text-sm font-medium
                text-[var(--color-text-secondary)]
                rounded-[var(--radius-full)]
                transition-all duration-[var(--duration-fast)]
                hover:text-[var(--color-primary)]
                hover:bg-[rgba(37,99,235,0.06)]
                focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2
              "
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTAs desktop + Hamburger mobile container */}
        <div className="flex items-center gap-3 ml-auto">
          {/* CTA buttons desktop */}
          <a
            href="/login"
            className="nav-cta hidden md:inline-block"
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-sm"
              aria-label="Iniciar sesión"
            >
              Iniciar sesión
            </Button>
          </a>
          <a
            href="/register"
            className="nav-cta hidden md:inline-block"
          >
            <Button
              variant="primary"
              size="sm"
              className="text-sm"
              aria-label="Empieza gratis"
            >
              Empieza gratis
            </Button>
          </a>

          {/* Hamburger mobile */}
          <Button
            onClick={() => setOpen(!open)}
            onKeyDown={handleKeyDown}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            variant="ghost"
            isIconOnly
            className="nav-hamburger md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <Card
          className="
            md:hidden
            bg-[var(--color-background)]
            border-t-2 border-[var(--color-border)]
            rounded-none
            p-0
          "
          interactive={false}
        >
          <nav className="flex flex-col">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                onClick={() => handleNavClick(href)}
                className="
                  block px-6 py-3
                  text-base font-medium
                  text-[var(--color-text-secondary)]
                  border-b border-[var(--color-border)]
                  transition-all duration-[var(--duration-fast)]
                  hover:text-[var(--color-primary)]
                  hover:bg-[var(--color-primary-light)]
                  focus:outline-2 focus:outline-[var(--color-primary)] focus:outline-offset-2
                "
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-2 p-6 pt-4">
            <a href="/login" className="w-full">
              <Button
                variant="ghost"
                className="w-full justify-center"
                aria-label="Iniciar sesión (mobile)"
              >
                Iniciar sesión
              </Button>
            </a>
            <a href="/register" className="w-full">
              <Button
                variant="primary"
                className="w-full justify-center"
                aria-label="Empieza gratis sin tarjeta (mobile)"
              >
                Empieza gratis — sin tarjeta
              </Button>
            </a>
          </div>
        </Card>
      )}
    </header>
  )
})

Navbar.displayName = 'Navbar'

export default Navbar
