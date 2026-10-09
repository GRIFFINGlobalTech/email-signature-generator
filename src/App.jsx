import { useEffect, useState } from 'react'
import { GriffinLogo } from './components/GriffinLogo'
import { SignatureForm } from './components/SignatureForm'

function getPreferredTheme() {
  const stored = localStorage.getItem('ggt-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export default function App() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    setTheme(getPreferredTheme())
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('ggt-theme', theme)
  }, [theme])

  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <div className="app-shell">
      <header className="site-header">
        <GriffinLogo />
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme(nextTheme)}
          aria-label={`Switch to ${nextTheme} mode`}
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </header>

      <main className="site-main">
        <SignatureForm />
      </main>

      <footer className="site-footer">
        <GriffinLogo compact />
        <p>Internal tool for Griffin Global Technologies team members.</p>
      </footer>
    </div>
  )
}
