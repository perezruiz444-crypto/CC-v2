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
  gratis:  { label: 'Básico',  color: '#64748B' },
  equipo:  { label: 'Equipo',  color: '#0369A1' },
  agencia: { label: 'Agencia', color: '#0F172A' },
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
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--ink-4)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--snow)' }}>
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
          {/* Active indicator */}
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#16A34A',
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
                color: isActive ? '#0369A1' : isLocked ? '#CBD5E1' : '#64748B',
                background: isActive ? '#EFF6FF' : 'transparent',
                borderLeft: isActive ? '3px solid #0369A1' : '3px solid transparent',
                transition: 'all var(--dur-fast)',
                cursor: 'pointer',
                minHeight: 44,
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} aria-hidden="true" color={isActive ? '#0369A1' : isLocked ? '#CBD5E1' : '#94A3B8'} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {isLocked && <Lock size={11} color="#CBD5E1" aria-label="Plan de pago requerido" />}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Usuario + logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--ink-4)', background: '#F8FAFC' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 'var(--r-lg)',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          marginBottom: 6,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'rgba(3,105,161,0.08)',
            border: '1px solid rgba(3,105,161,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#0369A1',
            flexShrink: 0,
          }}>
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 12, color: '#0F172A', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {organizacion?.nombre_cuenta ?? 'Mi organización'}
            </p>
            <p style={{ fontSize: 11, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
            color: '#94A3B8',
            transition: 'color var(--dur-fast), background var(--dur-fast)',
            minHeight: 44,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#DC2626'
            ;(e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,0.06)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#94A3B8'
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
    <div style={{ display: 'flex', minHeight: '100dvh', background: '#F8FAFC', fontFamily: 'var(--font-body)' }}>

      {/* Sidebar desktop */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
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
            background: '#FFFFFF',
            borderRight: '1px solid #E2E8F0',
            overflowY: 'auto',
            animation: 'slideInLeft 220ms var(--ease-spring)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 12px 0' }}>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#64748B', padding: 8, borderRadius: 'var(--r-md)',
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
          background: '#FFFFFF', borderBottom: '1px solid #E2E8F0',
          position: 'sticky', top: 0, zIndex: 30,
        }}
          className="topbar-mobile"
        >
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
            Calendario<span style={{ color: 'var(--em)' }}>Compliance</span>
          </span>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#64748B', padding: 8, borderRadius: 'var(--r-md)',
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
