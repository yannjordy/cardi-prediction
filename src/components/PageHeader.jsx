import { memo } from 'react'
import ThemeToggle from './ThemeToggle'

function PageHeader({ title, showBack = true, rightAction, onRightAction }) {
  return (
    <header className="header">
      <div className="header-content">
        {showBack && (
          <button
            className="back-btn"
            onClick={() => window.history.back()}
            aria-label="Retour"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="header-logo">
          <svg
            style={{ width: 28, height: 28 }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <h1 className="header-title">{title}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {rightAction && (
            <button
              onClick={onRightAction}
              style={{
                width: 40,
                height: 40,
                border: 'none',
                background: 'var(--bg-card)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--accent-primary)',
              }}
              aria-label={rightAction}
            >
              <svg
                style={{ width: 20, height: 20 }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export default memo(PageHeader)
