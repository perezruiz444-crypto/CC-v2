import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (resetError) {
      setError('No pudimos enviar el email. Verifica que el correo sea correcto.')
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={48} color="var(--em)" style={{ marginBottom: 20 }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--snow)', marginBottom: 12 }}>
              Email enviado
            </h1>
            <p style={{ ...mutedStyle, marginBottom: 24 }}>
              Revisa tu bandeja de entrada. Si no ves el email, verifica la carpeta de spam.
            </p>
            <p style={{ fontSize: 13, color: 'rgb(255 255 255 / 0.5)', marginBottom: 20 }}>
              El enlace para resetear tu contraseña expira en 24 horas.
            </p>
            <Link
              to="/login"
              style={{
                display: 'inline-block',
                padding: '12px 28px',
                background: 'var(--em)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: 'var(--r-lg)',
                fontSize: 14,
                fontWeight: 600,
                transition: 'all var(--dur-base)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-em)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
            >
              Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Back link */}
        <Link
          to="/login"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: 'var(--em)',
            textDecoration: 'none',
            marginBottom: 24,
            transition: 'color var(--dur-base)',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--em-light)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--em)'}
        >
          <ArrowLeft size={14} />
          Volver al login
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--snow)', marginBottom: 8 }}>
            ¿Olvidaste tu contraseña?
          </h1>
          <p style={{ ...mutedStyle, fontSize: 13 }}>
            Ingresa tu correo y te enviaremos un enlace para resetearla.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle} htmlFor="email">
              Correo electrónico
            </label>
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

          {error && (
            <p style={{ fontSize: 13, color: 'var(--danger)', background: 'rgb(239 68 68 / 0.1)', padding: '10px 14px', borderRadius: 'var(--r-md)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px 26px',
              background: loading ? 'rgb(148 163 184 / 0.5)' : 'var(--em)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--r-full)',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all var(--dur-base)',
              minHeight: 46,
            }}
            onMouseEnter={e => {
              if (!loading) {
                (e.currentTarget as HTMLElement).style.background = 'var(--em-dark)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--em)'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
            }}
          >
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>
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
  marginBottom: 8,
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
