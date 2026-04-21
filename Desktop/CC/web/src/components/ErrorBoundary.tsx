import React from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'var(--ink)',
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: 500,
          }}>
            <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: 20 }} />
            <h1 style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--snow)',
              marginBottom: 12,
            }}>
              Algo salió mal
            </h1>
            <p style={{
              fontSize: 14,
              color: 'rgb(255 255 255 / 0.6)',
              lineHeight: 1.6,
              marginBottom: 24,
            }}>
              Estamos trabajando en solucionarlo. Por favor, intenta recargar la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 28px',
                background: 'var(--em)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--r-lg)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--dur-base)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-accent)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
