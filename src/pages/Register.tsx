import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app/onboarding`,
      },
    })

    setLoading(false)

    if (signUpError) {
      const msg = signUpError.message.toLowerCase()
      if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('over_email_send_rate_limit')) {
        setError('Demasiados intentos desde esta red. Espera unos minutos e intenta de nuevo, o usa una red diferente (datos móviles).')
      } else {
        setError(signUpError.message)
      }
      return
    }

    setSent(true)
    // En modo sin email confirmation, redirige directamente
    setTimeout(() => navigate('/app/onboarding'), 1500)
  }

  if (sent) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
            <h2 style={headingStyle}>Revisa tu correo</h2>
            <p style={mutedStyle}>
              Te enviamos un link de confirmación a <strong>{email}</strong>.
              Revísalo para activar tu cuenta.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--snow)' }}>
              Calendario<span style={{ color: 'var(--em)' }}>Compliance</span>
            </span>
          </a>
          <p style={{ ...mutedStyle, marginTop: 8 }}>Crea tu cuenta gratis</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle} htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="tu@empresa.com"
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="password">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: 44 }}
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgb(255 255 255 / 0.4)', display: 'flex', padding: 4,
                }}
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: 'var(--danger)', background: 'rgb(239 68 68 / 0.1)', padding: '10px 14px', borderRadius: 'var(--r-md)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            {!loading && <ArrowRight size={16} aria-hidden="true" />}
          </button>
        </form>

        <p style={{ ...mutedStyle, textAlign: 'center', marginTop: 24, fontSize: 12 }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--em)', textDecoration: 'none' }}>
            Inicia sesión
          </Link>
        </p>

        <p style={{ fontSize: 11, color: 'rgb(255 255 255 / 0.25)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
          Al registrarte aceptas nuestros Términos de servicio y Política de privacidad.
          14 días de prueba gratis · Sin tarjeta.
        </p>
      </div>
    </div>
  )
}

// ── Estilos internos ────────────────────────────────────────
const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'var(--ink)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  fontFamily: 'var(--font-body)',
}

const cardStyle: React.CSSProperties = {
  background: 'var(--ink-2)',
  border: '1px solid var(--ink-4)',
  borderRadius: 'var(--r-2xl)',
  padding: '40px 36px',
  width: '100%',
  maxWidth: 420,
  boxShadow: '0 20px 60px rgb(0 0 0 / 0.4)',
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 22,
  fontWeight: 700,
  color: 'var(--snow)',
  marginBottom: 10,
}

const mutedStyle: React.CSSProperties = {
  fontSize: 14,
  color: 'rgb(255 255 255 / 0.5)',
  lineHeight: 1.6,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: 'rgb(255 255 255 / 0.7)',
  marginBottom: 7,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--ink)',
  border: '1px solid var(--ink-4)',
  borderRadius: 'var(--r-md)',
  padding: '11px 14px',
  fontSize: 14,
  color: 'var(--snow)',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 150ms',
}
