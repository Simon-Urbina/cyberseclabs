import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const STORAGE_KEY = 'cookie_consent'

export default function CookieBanner() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  if (!visible) return null

  const accept = (level: 'all' | 'essential') => {
    localStorage.setItem(STORAGE_KEY, level)
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3 md:px-6 md:py-4"
      style={{
        background: isDark
          ? 'rgba(6,13,31,0.97)'
          : 'rgba(238,243,252,0.97)',
        borderTop: isDark
          ? '1px solid rgba(26,63,150,0.30)'
          : '1px solid rgba(26,63,150,0.20)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Icon + text */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span
            className="font-mono text-[10px] tracking-[0.18em] uppercase shrink-0 mt-0.5"
            style={{ color: isDark ? '#7B9FE8' : '#1A3F96' }}
          >
            //
          </span>
          <div className="min-w-0">
            <p
              className="font-mono text-[10px] tracking-[0.18em] uppercase mb-1"
              style={{ color: isDark ? '#7B9FE8' : '#1A3F96' }}
            >
              cookies & almacenamiento local
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: isDark ? '#93B0F0' : '#0A1545' }}>
              Usamos <strong>localStorage</strong> para mantener tu sesión y preferencia de tema, y cookies de terceros
              para analítica y publicidad (Google AdSense). Consulta nuestra{' '}
              <Link
                to="/privacy-policy"
                className="font-semibold hover:underline"
                style={{ color: isDark ? '#F5C500' : '#1A3F96' }}
              >
                Política de Privacidad
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => accept('essential')}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-[13px] font-mono tracking-wide transition-colors"
            style={{
              border: `1px solid ${isDark ? 'rgba(26,63,150,0.40)' : 'rgba(26,63,150,0.30)'}`,
              color: isDark ? '#7B9FE8' : '#1A3F96',
              background: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = isDark ? 'rgba(26,63,150,0.15)' : 'rgba(26,63,150,0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            Solo esenciales
          </button>
          <button
            onClick={() => accept('all')}
            className="btn-gold flex-1 sm:flex-none px-5 py-2 rounded-lg text-[13px]"
          >
            Aceptar todo
          </button>
        </div>
      </div>
    </div>
  )
}
