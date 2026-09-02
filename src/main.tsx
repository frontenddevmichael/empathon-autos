import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { App } from './App'
import { ToastProvider } from './context/ToastContext'
import { JsonLd } from './components/JsonLd'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <JsonLd />
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
