import { useEffect, useState } from 'react'
import { GriffinLogo } from './components/GriffinLogo'
import { SignatureForm } from './components/SignatureForm'

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme() {
  const stored = localStorage.getItem('ggt-theme')
  return stored === 'light' || stored === 'dark' ? stored : null
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    return getStoredTheme() ?? getSystemTheme()
  })
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window === 'undefined') return 'system'
    return getStoredTheme() ? 'manual' : 'system'
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleSystemThemeChange = () => {
      if (themeMode === 'system') {
        setTheme(getSystemTheme())
      }
    }

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleSystemThemeChange)
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }

    mediaQuery.addListener(handleSystemThemeChange)
    return () => mediaQuery.removeListener(handleSystemThemeChange)
  }, [themeMode])

  useEffect(() => {
    document.documentElement.dataset.theme = theme

    if (themeMode === 'manual') {
      localStorage.setItem('ggt-theme', theme)
    } else {
      localStorage.removeItem('ggt-theme')
    }
  }, [theme, themeMode])

  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  const handleThemeToggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setThemeMode('manual')
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <GriffinLogo />
        <button
          type="button"
          className="theme-toggle"
          onClick={handleThemeToggle}
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
