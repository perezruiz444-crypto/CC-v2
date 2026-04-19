import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Calendar, Building2, Menu, X, LogOut, ClipboardList, Users, Settings, Lock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useEmpresa } from '../../hooks/useEmpresa'
import { tieneFeature } from '../../lib/plans'

const NAV = [
  { to: '/app',                label: 'Dashboard',    icon: LayoutDashboard, end: true,  planGated: false },
  { to: '/app/calendario',     label: 'Calendario',   icon: Calendar,        end: false, planGated: false },
  { to: '/app/obligaciones',   label: 'Obligaciones', icon: ClipboardList,   end: false, planGated: false },
  { to: '/app/empresa',        label: 'Mi Empresa',   icon: Building2,       end: false, planGated: false },
  { to: '/app/equipo',         label: 'Mi Equipo',    icon: Users,           end: false, planGated: false },
  { to: '/app/ajustes',        label: 'Ajustes',      icon: Settings,        end: false, planGated: true  },
]

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  gratis:  { label: 'Gratis',  color: 'rgb(255 255 255 / 0.25)' },
  equipo:  { label: 'Equipo',  color: 'var(--em)' },
  agencia: { label: 'Agencia', color: 'var(--info)' },
}

export default function AppLayout() {
  const { user, signOut } = useAuth()
  const { organizacion } = useEmpresa()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const plan = PLAN_LABELS[organizacion?.plan_actual ?? 'gratis'] ?? PLAN_LABELS.gratis

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--ink-3)' }}>
        <span className="shimmer-gradient" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--snow)' }}>
          Calendario<span style={{ color: 'var(--em)' }}>Compliance</span>
        </span>
        {/* Badge plan + status indicator */}
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '3px 8px', borderRadius: 'var(--r-full)',
            border: `1px solid ${plan.color}`,
            color: plan.color,
          }}>
            {plan.label}
          </span>
          {/* Green glow indicator */}
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--em)',
            boxShadow: '0 0 12px var(--em-glow), 0 0 6px var(--em)',
            flexShrink: 0,
          }} aria-label="Status: Activo" />
        </div>
      </div>

      {/* Nav items */}
      <nav aria-label="Navegación principal" style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ to, label, icon: Icon, end, planGated }) => {
          const isLocked = planGated && !tieneFeature(organizacion?.plan_actual, 'diasInhabilesOrg')
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--r-lg)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? 'var(--em)' : isLocked ? 'rgb(255 255 255 / 0.3)' : 'rgb(255 255 255 / 0.55)',
                background: isActive ? 'var(--em-subtle)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--em)' : '3px solid transparent',
                boxShadow: isActive ? 'inset 0 0 8px rgba(13, 148, 136, 0.1)' : 'none',
                transition: 'all var(--dur-fast)',
                cursor: 'pointer',
                minHeight: 44,
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} aria-hidden="true" color={isActive ? 'var(--em)' : isLocked ? 'rgb(255 255 255 / 0.2)' : 'rgb(255 255 255 / 0.4)'} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {isLocked && <Lock size={11} color="rgb(255 255 255 / 0.2)" aria-label="Plan de pago requerido" />}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Usuario + logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--ink-3)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 'var(--r-lg)',
          background: 'var(--ink-3)',
          marginBottom: 6,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'var(--em-subtle)',
            border: '1px solid var(--em)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'var(--em)',
            flexShrink: 0,
            boxShadow: '0 0 12px var(--em-glow), 0 0 6px var(--em)',
          }}>
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 12, color: 'var(--snow)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {organizacion?.nombre_cuenta ?? 'Mi organización'}
            </p>
            <p style={{ fontSize: 11, color: 'rgb(255 255 255 / 0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          aria-label="Cerrar sesión"
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 'var(--r-lg)',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 500,
            color: 'rgb(255 255 255 / 0.4)',
            transition: 'color var(--dur-fast), background var(--dur-fast)',
            minHeight: 44,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--danger)'
            ;(e.currentTarget as HTMLElement).style.background = 'rgb(239 68 68 / 0.08)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = 'rgb(255 255 255 / 0.4)'
            ;(e.currentTarget as HTMLElement).style.background = 'none'
          }}
        >
          <LogOut size={15} aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--ink)', fontFamily: 'var(--font-body)' }}>

      {/* Sidebar desktop */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: 'var(--ink-2)',
        borderRight: '1px solid var(--ink-3)',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 40, overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}
        className="sidebar-desktop"
      >
        <SidebarContent />
      </aside>

      {/* Sidebar mobile drawer */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 49,
              background: 'rgb(0 0 0 / 0.6)',
              backdropFilter: 'blur(2px)',
            }}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside style={{
            position: 'fixed', top: 0, left: 0, bottom: 0,
            width: 260, zIndex: 50,
            background: 'var(--ink-2)',
            borderRight: '1px solid var(--ink-3)',
            overflowY: 'auto',
            animation: 'slideInLeft 220ms var(--ease-spring)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 12px 0' }}>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgb(255 255 255 / 0.4)', padding: 8, borderRadius: 'var(--r-md)',
                  minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Área principal */}
      <main style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}
        className="main-content"
      >
        {/* Topbar mobile */}
        <header style={{
          display: 'none', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: 56,
          background: 'var(--ink-2)', borderBottom: '1px solid var(--ink-3)',
          position: 'sticky', top: 0, zIndex: 30,
        }}
          className="topbar-mobile"
        >
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--snow)' }}>
            Calendario<span style={{ color: 'var(--em)' }}>Compliance</span>
          </span>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgb(255 255 255 / 0.7)', padding: 8, borderRadius: 'var(--r-md)',
              minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Página activa */}
        <div style={{ flex: 1, padding: '32px 36px', maxWidth: 1100 }}
          className="page-content"
        >
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .main-content    { margin-left: 0 !important; }
          .topbar-mobile   { display: flex !important; }
          .page-content    { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  )
}
