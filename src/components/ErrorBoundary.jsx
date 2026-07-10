import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            textAlign: 'center',
            background: 'var(--bg-primary)',
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: 'rgba(239,68,68,0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <svg
              style={{ width: 40, height: 40, color: '#ef4444' }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h2
            style={{
              fontFamily: 'Fredoka, cursive',
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 8,
              color: 'var(--text-primary)',
            }}
          >
            Oups ! Une erreur est survenue
          </h2>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: 24,
              maxWidth: 400,
            }}
          >
            L'application a rencontre un probleme inattendu. Vous pouvez
            reessayer ou revenir a l'accueil.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn btn-secondary"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Reessayer
            </button>
            <button
              className="btn btn-primary"
              onClick={() => (window.location.href = '/')}
            >
              Accueil
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
