import { useState } from 'react'
import { Users, Crown, X, ChevronRight, Mail, UserPlus, Lock } from 'lucide-react'
import { useEmpresa } from '../../hooks/useEmpresa'
import { useAuth } from '../../hooks/useAuth'

export default function Equipo() {
  const { organizacion, loading } = useEmpresa()
  const { user } = useAuth()
  const [showPaywall, setShowPaywall] = useState(false)

  const planActual = organizacion?.plan_actual ?? 'gratis'
  const esPlanGratis = planActual === 'gratis'

  // TODO: reemplazar con datos reales de usuarios_organizacion cuando se implemente invitación de equipo
  // Mock: en plan gratis solo hay 1 miembro (el owner)
  const miembros = [
    {
      id: 'owner',
      email: user?.email ?? 'tú',
      rol: 'Administrador',
      estado: 'activo',
      esYo: true,
    },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
            Mi Equipo
          </h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>
            {organizacion?.nombre_cuenta ?? 'Mi organización'}
          </p>
        </div>
        <button
          onClick={() => esPlanGratis ? setShowPaywall(true) : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 'var(--r-full)',
            background: esPlanGratis ? '#F1F5F9' : 'var(--em)',
            border: `1px solid ${esPlanGratis ? '#E2E8F0' : 'transparent'}`,
            color: esPlanGratis ? '#64748B' : '#fff',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'all var(--dur-fast)',
            minHeight: 44,
          }}
          onMouseEnter={e => {
            if (!esPlanGratis) (e.currentTarget as HTMLElement).style.background = 'var(--em-dark)'
          }}
          onMouseLeave={e => {
            if (!esPlanGratis) (e.currentTarget as HTMLElement).style.background = 'var(--em)'
          }}
        >
          {esPlanGratis ? <Lock size={14} aria-hidden="true" /> : <UserPlus size={14} aria-hidden="true" />}
          Invitar miembro
          {esPlanGratis && <Crown size={13} color="var(--warn)" aria-hidden="true" />}
        </button>
      </div>

      {/* Banner plan gratis */}
      {esPlanGratis && (
        <div style={{
          background: 'rgb(245 158 11 / 0.07)',
          border: '1px solid rgb(245 158 11 / 0.2)',
          borderRadius: 'var(--r-xl)',
          padding: '16px 20px',
          marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <Crown size={20} color="var(--warn)" aria-hidden="true" />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 3 }}>
              Plan Gratis: 1 usuario incluido
            </p>
            <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
              Actualiza al Plan Equipo para invitar colaboradores, asignar responsables y gestionar vencimientos entre varios usuarios.
            </p>
          </div>
          <button
            onClick={() => setShowPaywall(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 'var(--r-full)',
              background: 'var(--warn)', border: 'none',
              color: '#fff', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', flexShrink: 0, minHeight: 44,
            }}
          >
            Ver planes <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* Tabla de miembros */}
      <div style={{
        background: '#FFFFFF', border: '1px solid #E2E8F0',
        borderRadius: 'var(--r-xl)', overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 22px', borderBottom: '1px solid #E2E8F0',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
            Miembros activos
          </h2>
          <span style={{
            fontSize: 11, fontWeight: 700,
            background: 'var(--em-subtle)', color: 'var(--em)',
            border: '1px solid rgb(16 185 129 / 0.3)',
            padding: '3px 10px', borderRadius: 'var(--r-full)',
          }}>
            {miembros.length} / {esPlanGratis ? '1' : '∞'}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '20px 22px' }}>
            {[1].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F1F5F9' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, width: '40%', background: '#F1F5F9', borderRadius: 4, marginBottom: 7 }} />
                  <div style={{ height: 10, width: '25%', background: '#E2E8F0', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {miembros.map((m, i) => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 22px',
                borderBottom: i < miembros.length - 1 ? '1px solid #E2E8F0' : 'none',
              }}>
                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--em-subtle)',
                  border: '1px solid rgb(16 185 129 / 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: 'var(--em)',
                }}>
                  {m.email[0].toUpperCase()}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.email}
                    </p>
                    {m.esYo && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: 'var(--em)',
                        background: 'var(--em-subtle)', border: '1px solid rgb(16 185 129 / 0.2)',
                        padding: '2px 7px', borderRadius: 'var(--r-full)', letterSpacing: '0.05em',
                      }}>Tú</span>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: '#94A3B8' }}>{m.rol}</p>
                </div>
                {/* Estado */}
                <span className="chip chip-success" style={{ fontSize: 10, flexShrink: 0 }}>
                  Activo
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Fila invitación bloqueada (solo plan gratis) */}
        {esPlanGratis && (
          <button
            onClick={() => setShowPaywall(true)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 22px',
              background: 'none', border: 'none',
              borderTop: '1px dashed #E2E8F0',
              cursor: 'pointer',
              transition: 'background var(--dur-fast)',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F8FAFC'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: '#F1F5F9', border: '1.5px dashed #E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <UserPlus size={14} color="#CBD5E1" />
            </div>
            <p style={{ fontSize: 13, color: '#94A3B8', fontStyle: 'italic' }}>
              Invitar a otro miembro — requiere Plan Equipo
            </p>
            <Lock size={13} color="var(--warn)" style={{ marginLeft: 'auto' }} />
          </button>
        )}
      </div>

      {/* Modal Paywall */}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
    </div>
  )
}

function PaywallModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgb(0 0 0 / 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}
        aria-hidden="true"
      />
      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
        style={{
          position: 'fixed', inset: 0, zIndex: 101,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, pointerEvents: 'none',
        }}
      >
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 'var(--r-2xl)',
          padding: '36px 32px',
          width: '100%', maxWidth: 460,
          pointerEvents: 'all',
          animation: 'slideInModal 250ms var(--ease-spring)',
        }}>
          {/* Close */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -8 }}>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#94A3B8', padding: 8, borderRadius: 'var(--r-md)',
                minWidth: 44, minHeight: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Crown icon */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
              background: 'rgb(245 158 11 / 0.12)',
              border: '2px solid rgb(245 158 11 / 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Crown size={28} color="var(--warn)" />
            </div>
            <h2 id="paywall-title" style={{
              fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
              color: '#0F172A', marginBottom: 10,
            }}>
              Actualiza al Plan Equipo
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.65, maxWidth: 340, margin: '0 auto' }}>
              Colabora con tu equipo, asigna responsables a cada obligación y recibe notificaciones compartidas.
            </p>
          </div>

          {/* Beneficios */}
          <div style={{
            background: '#F1F5F9', borderRadius: 'var(--r-lg)',
            padding: '16px 18px', marginBottom: 24,
          }}>
            {[
              { icon: Users, text: 'Hasta 10 usuarios por organización' },
              { icon: Mail, text: 'Notificaciones por correo a cada miembro' },
              { icon: ChevronRight, text: 'Asignación de responsables por obligación' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                paddingBlock: i > 0 ? 10 : 0,
                borderTop: i > 0 ? '1px solid #E2E8F0' : 'none',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 'var(--r-md)', flexShrink: 0,
                  background: 'var(--em-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={13} color="var(--em)" />
                </div>
                <p style={{ fontSize: 13, color: '#64748B' }}>{text}</p>
              </div>
            ))}
          </div>

          {/* Precio */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Plan Equipo
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#0F172A' }}>
              $1,490<span style={{ fontSize: 14, fontWeight: 500, color: '#64748B' }}>/mes</span>
            </p>
          </div>

          {/* CTA */}
          <button
            style={{
              width: '100%', padding: '14px 24px',
              background: 'var(--em)', border: 'none',
              borderRadius: 'var(--r-full)',
              fontSize: 14, fontWeight: 700, color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 4px 20px var(--em-glow)',
              transition: 'all var(--dur-fast)',
              minHeight: 48,
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--em-dark)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--em)'}
            onClick={() => {/* TODO: conectar a Stripe */}}
          >
            Actualizar ahora
          </button>
          <p style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 12 }}>
            Sin permanencia. Cancela cuando quieras.
          </p>
        </div>
      </div>

      {/* @keyframes defined globally in index.css */}
    </>
  )
}
