import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/i18n'
import './index.css'
import App from './App'

// Initialize dark mode from store
const stored = localStorage.getItem('theme-storage')
if (stored) {
  try {
    const parsed = JSON.parse(stored)
    if (parsed.state?.isDark) {
      document.documentElement.classList.add('dark')
    }
  } catch {
    // ignore
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
