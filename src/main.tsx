import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { initSentry } from './lib/sentry'

// Initialize error monitoring — no-op if VITE_SENTRY_DSN is not set
initSentry()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)