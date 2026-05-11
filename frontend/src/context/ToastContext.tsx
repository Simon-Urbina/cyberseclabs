import { createContext, useCallback, useContext, useState } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextType {
  addToast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} })

const STYLES = {
  success: { accent: '#4ade80', border: 'rgba(74,222,128,0.28)', icon: '✓' },
  error:   { accent: '#f87171', border: 'rgba(248,113,113,0.28)', icon: '✗' },
  info:    { accent: '#2596be', border: 'rgba(37,150,190,0.28)', icon: '·' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const dismiss = (id: string) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => {
          const s = STYLES[t.type]
          return (
            <div
              key={t.id}
              onClick={() => dismiss(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.7rem 1rem',
                borderRadius: '0.75rem',
                background: 'rgba(6,13,31,0.96)',
                border: `1px solid ${s.border}`,
                borderLeft: `3px solid ${s.accent}`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px ${s.border}`,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                pointerEvents: 'auto',
                cursor: 'pointer',
                animation: 'slideInRight 0.25s cubic-bezier(0.22,1,0.36,1)',
                maxWidth: '340px',
              }}
            >
              <span style={{ fontFamily: 'monospace', fontSize: '13px', color: s.accent, fontWeight: 700, flexShrink: 0 }}>
                {s.icon}
              </span>
              <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#C8D5EE', margin: 0, lineHeight: 1.4 }}>
                {t.message}
              </p>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
