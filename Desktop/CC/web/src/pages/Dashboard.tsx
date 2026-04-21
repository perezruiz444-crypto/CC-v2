import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user, signOut } = useAuth()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--ink)',
      fontFamily: 'var(--font-body)',
      color: 'var(--snow)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: 24,
    }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>
        Calendario<span style={{ color: 'var(--em)' }}>Compliance</span>
      </span>

      <div style={{
        background: 'var(--ink-2)',
        border: '1px solid var(--ink-4)',
        borderRadius: 'var(--r-xl)',
        padding: '32px 40px',
        textAlign: 'center',
        maxWidth: 440,
      }}>
        <div style={{
          width: 56, height: 56,
          background: 'rgb(16 185 129 / 0.1)',
          border: '1px solid rgb(16 185 129 / 0.2)',
          borderRadius: 'var(--r-xl)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 24,
        }}>
          🚀
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
          ¡Bienvenido al dashboard!
        </h1>
        <p style={{ fontSize: 14, color: 'rgb(255 255 255 / 0.5)', lineHeight: 1.7, marginBottom: 24 }}>
          Sesión activa: <strong style={{ color: 'var(--em)' }}>{user?.email}</strong>
          <br />
          El dashboard completo está en desarrollo. El backend y el schema ya están listos.
        </p>
        <button
          onClick={signOut}
          className="btn btn-ghost-dark"
          style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
