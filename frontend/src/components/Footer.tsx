import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { LogoIcon } from './Logo'

const FOOTER_COLUMNS = [
  {
    label: 'Plataforma',
    links: [
      { label: 'Cursos', to: '/dashboard' },
      { label: 'Ranking', to: '/' },
      { label: 'Dashboard', to: '/dashboard' },
    ],
  },
  {
    label: 'Recursos',
    links: [
      { label: 'Acerca de', to: '/' },
      { label: 'Blog', to: '/' },
      { label: 'Soporte', to: '/' },
    ],
  },
  {
    label: 'Legal',
    links: [
      { label: 'Términos', to: '/' },
      { label: 'Privacidad', to: '/' },
    ],
  },
]

const SOCIAL = [
  {
    label: 'GitHub',
    href: 'https://github.com',
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5"/>
      </svg>
    ),
  },
  {
    label: 'X',
    href: 'https://x.com',
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/>
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.43v6.31ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0Z"/>
      </svg>
    ),
  },
]

export default function Footer() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <footer
      className="relative border-t"
      style={{
        background: isDark ? '#060D1F' : '#E8EEFA',
        borderColor: isDark ? 'rgba(26,63,150,0.12)' : 'rgba(26,63,150,0.10)',
      }}
    >
      {/* Neon accent line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #1A3F96 35%, #2596be 65%, transparent 100%)',
          opacity: 0.4,
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-10">

        {/* Top: brand + columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">

          {/* Brand block */}
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center gap-3 mb-5 w-fit">
              <LogoIcon className="w-9 h-9" />
              <div>
                <p
                  className="font-display text-[18px] leading-none"
                  style={{ color: isDark ? '#EEF3FC' : '#0A1545' }}
                >
                  CyberSec<span style={{ color: '#1A3F96' }}> Labs</span>
                </p>
                <p
                  className="font-mono text-[9px] tracking-[0.22em] uppercase mt-1"
                  style={{ color: isDark ? '#3A5AB8' : '#1A3F96' }}
                >
                  learn · hack · evolve
                </p>
              </div>
            </Link>

            <p
              className="text-[14px] font-light max-w-sm leading-relaxed mb-6"
              style={{ color: isDark ? '#4A70CC' : '#2451C8' }}
            >
              La plataforma colombiana de laboratorios prácticos para futuros hackers.
              Aprende ciberseguridad rompiendo cosas reales.
            </p>

            {/* Social */}
            <div className="flex items-center gap-2">
              {SOCIAL.map(({ label, href, svg }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{
                    color: isDark ? '#7B9FE8' : '#1A3F96',
                    border: `1px solid ${isDark ? 'rgba(26,63,150,0.20)' : 'rgba(26,63,150,0.22)'}`,
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = 'rgba(26,63,150,0.10)'
                    el.style.color = '#2596be'
                    el.style.borderColor = 'rgba(26,63,150,0.45)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = 'transparent'
                    el.style.color = isDark ? '#7B9FE8' : '#1A3F96'
                    el.style.borderColor = isDark ? 'rgba(26,63,150,0.20)' : 'rgba(26,63,150,0.22)'
                  }}
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {FOOTER_COLUMNS.map(({ label, links }) => (
              <div key={label}>
                <p
                  className="font-mono text-[10px] tracking-[0.22em] uppercase mb-5"
                  style={{ color: isDark ? '#3A5AB8' : '#1A3F96' }}
                >
                  // {label.toLowerCase()}
                </p>
                <ul className="space-y-3">
                  {links.map(link => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="nav-link text-[14px] inline-block transition-colors"
                        style={{ color: isDark ? '#7B9FE8' : '#2451C8' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#2596be' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = isDark ? '#7B9FE8' : '#2451C8' }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px w-full"
          style={{ background: isDark ? 'rgba(26,63,150,0.14)' : 'rgba(26,63,150,0.12)' }}
        />

        {/* Bottom row */}
        <div className="pt-8 flex flex-wrap items-center justify-between gap-4">
          <p
            className="font-mono text-[10px] tracking-[0.22em] uppercase"
            style={{ color: isDark ? '#3A5AB8' : '#1A3F96' }}
          >
            CyberSec Labs © 2026 — todos los derechos reservados
          </p>
          <div className="flex items-center gap-4">
            <p
              className="font-mono text-[10px] tracking-[0.22em] uppercase"
              style={{ color: isDark ? '#3A5AB8' : '#1A3F96' }}
            >
              made_in.co
            </p>
            <span
              className="font-mono text-[10px] tracking-[0.22em] uppercase px-2.5 py-1 rounded"
              style={{
                color: '#2596be',
                background: 'rgba(37,150,190,0.08)',
                border: '1px solid rgba(37,150,190,0.25)',
              }}
            >
              v0.1.0-alpha
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
