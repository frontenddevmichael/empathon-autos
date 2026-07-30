import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: 'var(--space-3)',
            textAlign: 'center',
          }}
        >
          <h2 style={{ marginBottom: 'var(--space-1)' }}>Something went wrong</h2>
          <p style={{ color: 'var(--stone)', marginBottom: 'var(--space-2)', maxWidth: 480 }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: 'var(--space-1-5) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--navy)',
              color: 'white',
              border: 'none',
              fontWeight: 500,
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
          {this.state.error && (
            <details
              style={{
                marginTop: 'var(--space-3)',
                fontSize: 'var(--text-xs)',
                color: 'var(--stone)',
                maxWidth: 480,
                textAlign: 'left',
              }}
            >
              <summary style={{ cursor: 'pointer', marginBottom: 'var(--space-1)' }}>
                Error details
              </summary>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}>
                {this.state.error.message}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
