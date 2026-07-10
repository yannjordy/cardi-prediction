import { useState, useCallback, createContext, useContext, memo } from 'react'

const ToastContext = createContext(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const toast = useCallback(
    (msg) => addToast(msg, 'info'),
    [addToast]
  )
  toast.success = (msg) => addToast(msg, 'success')
  toast.error = (msg) => addToast(msg, 'error')
  toast.warning = (msg) => addToast(msg, 'warning')

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const ToastItem = memo(function ToastItem({ toast }) {
  const colors = {
    success: 'linear-gradient(135deg,#10b981,#059669)',
    error: 'linear-gradient(135deg,#ef4444,#dc2626)',
    warning: 'linear-gradient(135deg,#f59e0b,#d97706)',
    info: 'linear-gradient(135deg,#3b82f6,#2563eb)',
  }

  return (
    <div
      style={{
        background: colors[toast.type] || colors.info,
        color: 'white',
        padding: '12px 20px',
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 600,
        fontFamily: 'Nunito, sans-serif',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        animation: 'fadeInUp 0.3s ease-out',
        pointerEvents: 'auto',
        textAlign: 'center',
        maxWidth: 320,
      }}
      role="alert"
    >
      {toast.message}
    </div>
  )
})
