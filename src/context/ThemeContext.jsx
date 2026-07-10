import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'

const ThemeContext = createContext()

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('cardiTheme')
    if (saved) return saved
    if (window.matchMedia?.('(prefers-color-scheme: dark)')?.matches) return 'dark'
  } catch {}
  return 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    localStorage.setItem('cardiTheme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
