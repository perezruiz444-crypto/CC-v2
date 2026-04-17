import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (signInError) {
      setError('Correo o contraseña incorrectos.')
      return
    }

    navigate('/app')
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
          <p style={{ ...mutedStyle, marginTop: 8 }}>Inicia sesión en tu cuenta</p>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <label style={labelStyle} htmlFor="password">Contraseña</label>
              <a href="#" style={{ fontSize: 12, color: 'var(--em)', textDecoration: 'none' }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: 44 }}
                placeholder="Tu contraseña"
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
            {loading ? 'Entrando...' : 'Iniciar sesión'}
            {!loading && <ArrowRight size={16} aria-hidden="true" />}
          </button>
        </form>

        <p style={{ ...mutedStyle, textAlign: 'center', marginTop: 24, fontSize: 12 }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{ color: 'var(--em)', textDecoration: 'none' }}>
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  )
}

// ── Estilos ─────────────────────────────────────────────────
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
  marginBottom: 0,
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
