import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import Navbar from '../../src/components/Navbar'

describe('Navbar Component', () => {
  it('renderiza navbar con logo y navegación', () => {
    render(<Navbar />)
    expect(screen.getByRole('navigation', { name: /navegación principal/i })).toBeInTheDocument()
    expect(screen.getByText('Calendario')).toBeInTheDocument()
    expect(screen.getByText('Compliance')).toBeInTheDocument()
  })

  it('renderiza todos los enlaces de navegación', () => {
    render(<Navbar />)
    expect(screen.getByText('Funciones')).toBeInTheDocument()
    expect(screen.getByText('Cómo funciona')).toBeInTheDocument()
    expect(screen.getByText('Precios')).toBeInTheDocument()
    expect(screen.getByText('FAQ')).toBeInTheDocument()
  })

  it('renderiza botones CTA con componente Button', () => {
    render(<Navbar />)
    const loginButtons = screen.getAllByRole('link', { name: /iniciar sesión/i })
    const registerButtons = screen.getAllByRole('link', { name: /empieza gratis/i })

    expect(loginButtons.length).toBeGreaterThan(0)
    expect(registerButtons.length).toBeGreaterThan(0)
  })

  it('abre y cierra menú móvil al hacer click en hamburger', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    const hamburger = screen.getByRole('button', { name: /abrir menú/i })
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')

    await user.click(hamburger)
    expect(hamburger).toHaveAttribute('aria-expanded', 'true')

    await user.click(hamburger)
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')
  })

  it('cierra menú móvil al hacer click en enlace de navegación', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    const hamburger = screen.getByRole('button', { name: /abrir menú/i })
    await user.click(hamburger)

    const navLink = screen.getAllByText('Funciones')[screen.getAllByText('Funciones').length - 1]
    await user.click(navLink)

    expect(hamburger).toHaveAttribute('aria-expanded', 'false')
  })

  it('cierra menú móvil al presionar Escape', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    const hamburger = screen.getByRole('button', { name: /abrir menú/i })
    await user.click(hamburger)
    expect(hamburger).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Escape}')
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')
  })

  it('tiene focus states accesibles en enlaces de navegación', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    const navLinks = screen.getAllByText('Funciones')
    const firstNavLink = navLinks[0].closest('a')

    if (firstNavLink) {
      firstNavLink.focus()
      expect(firstNavLink).toHaveFocus()
    }
  })

  it('llama callback onNavigate cuando se hace click en un enlace', async () => {
    const user = userEvent.setup()
    const handleNavigate = vi.fn()
    render(<Navbar onNavigate={handleNavigate} />)

    const navLinks = screen.getAllByText('Funciones')
    // Encuentra el primer enlace de navegación en desktop
    const firstNavLink = Array.from(navLinks).find(link => {
      const parent = link.closest('nav[aria-label="Enlaces de navegación"]')
      return parent !== null
    })?.closest('a')

    if (firstNavLink) {
      await user.click(firstNavLink)
      expect(handleNavigate).toHaveBeenCalledWith('#features')
    }
  })

  it('proporciona aria-label descriptivos para accesibilidad', () => {
    render(<Navbar />)

    expect(screen.getByLabelText(/CalendarioCompliance inicio/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /abrir menú|cerrar menú/i })).toBeInTheDocument()
  })

  it('renderiza navegación con estructura semántica correcta', () => {
    render(<Navbar />)

    const navElement = screen.getByRole('navigation', { name: /navegación principal/i })
    expect(navElement).toBeInTheDocument()

    const header = navElement.closest('header')
    expect(header).toBeInTheDocument()
  })

  it('apply design system color tokens to nav links', () => {
    render(<Navbar />)

    const navLinks = screen.getAllByText('Funciones')
    const firstNavLink = navLinks[0]

    expect(firstNavLink).toHaveClass('text-[var(--color-text-secondary)]')
  })

  it('hamburger button es accesible solo en pantallas móviles', () => {
    render(<Navbar />)
    const hamburger = screen.getByRole('button', { name: /abrir menú/i })

    expect(hamburger).toHaveClass('md:hidden')
  })
})
