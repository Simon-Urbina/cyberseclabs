import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { api } from '../lib/api'
import Header from '../components/Header'
import Footer from '../components/Footer'

interface PublicProfile {
  id: string
  username: string
  bio: string | null
  profileImage: string | null
  points: number
  createdAt: string
  completedLabs: number
  rank: number | null
  enrolledCourses: { id: string; title: string; slug: string }[]
}

const RANK_STYLE: Record<number, { color: string; label: string; glow: string }> = {
  1: { color: '#F5C500', label: 'GOLD',   glow: 'rgba(245,197,0,0.18)' },
  2: { color: '#7B9FE8', label: 'SILVER', glow: 'rgba(123,159,232,0.14)' },
  3: { color: '#CD7F32', label: 'BRONZE', glow: 'rgba(205,127,50,0.14)' },
}

function Avatar({ image, username, size = 96 }: { image: string | null; username: string; size?: number }) {
  const initials = username.slice(0, 2).toUpperCase()
  if (image) {
    return (
      <img
        src={`data:image/jpeg;base64,${image}`}
        alt={username}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      />
    )
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg, #1A3F96, #2596be)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.36, fontWeight: 700, color: '#fff',
        fontFamily: 'Syne, sans-serif', letterSpacing: '0.04em',
      }}
    >
      {initials}
    </div>
  )
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const isDark = theme === 'dark'

  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!username) return
    setLoading(true)
    setNotFound(false)
    api.get<PublicProfile>(`/api/users/${username}`)
      .then(setProfile)
      .catch(err => {
        if (err.message?.includes('404') || err.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [username])

  const rankStyle = profile?.rank ? RANK_STYLE[profile.rank] : null
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })
    : null

  const bg = isDark ? '#060D1F' : '#EEF3FC'
  const cardBg = isDark ? 'rgba(13,27,70,0.7)' : '#f8faff'
  const cardBorder = isDark ? 'rgba(26,63,150,0.18)' : 'rgba(26,63,150,0.12)'
  const textMain = isDark ? '#C8D5EE' : '#0A1545'
  const textMuted = isDark ? '#3A5AB8' : '#4A70CC'
  const textSub = isDark ? '#7B9FE8' : '#2451C8'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: bg }}>
      <Header />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-12 space-y-6">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.18em] uppercase transition-colors"
          style={{ color: textMuted }}
          onMouseEnter={e => (e.currentTarget.style.color = '#2596be')}
          onMouseLeave={e => (e.currentTarget.style.color = textMuted)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Volver
        </button>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24 gap-4 flex-col">
            <div className="w-9 h-9 rounded-full border-2 animate-spin"
              style={{ borderColor: '#1A3F96', borderTopColor: 'transparent' }} />
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: textMuted }}>
              Cargando perfil…
            </p>
          </div>
        )}

        {/* Not found */}
        {!loading && notFound && (
          <div className="text-center py-24 space-y-3">
            <p className="font-display text-3xl" style={{ color: textMain }}>404</p>
            <p className="font-mono text-[13px]" style={{ color: textMuted }}>
              El usuario <span style={{ color: '#2596be' }}>@{username}</span> no existe.
            </p>
          </div>
        )}

        {/* Profile */}
        {!loading && profile && (
          <>
            {/* Header card */}
            <div
              className="rounded-2xl p-8 relative overflow-hidden"
              style={{
                background: cardBg,
                border: `1px solid ${rankStyle ? rankStyle.color + '40' : cardBorder}`,
                boxShadow: rankStyle
                  ? `0 0 0 1px ${rankStyle.glow}, 0 12px 40px ${rankStyle.glow}`
                  : '0 4px 24px rgba(26,63,150,0.07)',
              }}
            >
              {/* Glow blob for top ranks */}
              {rankStyle && (
                <div className="absolute pointer-events-none"
                  style={{
                    top: '-40%', right: '-8%',
                    width: 260, height: 260, borderRadius: '50%',
                    background: `radial-gradient(circle, ${rankStyle.glow} 0%, transparent 65%)`,
                  }}
                />
              )}

              <div className="relative flex items-start gap-6">
                {/* Avatar */}
                <div
                  className="shrink-0 rounded-full"
                  style={{
                    padding: 3,
                    background: rankStyle
                      ? `linear-gradient(135deg, ${rankStyle.color}, ${rankStyle.color}88)`
                      : 'linear-gradient(135deg, #1A3F96, #2596be)',
                  }}
                >
                  <Avatar image={profile.profileImage} username={profile.username} size={88} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="font-display" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: textMain, lineHeight: 1.1 }}>
                      {profile.username}
                    </h1>
                    {rankStyle && (
                      <span
                        className="font-mono text-[10px] tracking-[0.2em] px-2 py-1 rounded"
                        style={{ color: rankStyle.color, background: rankStyle.color + '18', border: `1px solid ${rankStyle.color}30` }}
                      >
                        {rankStyle.label}
                      </span>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="mt-2 text-[14px] leading-relaxed" style={{ color: textSub }}>
                      {profile.bio}
                    </p>
                  )}

                  <p className="mt-3 font-mono text-[11px] tracking-[0.14em]" style={{ color: textMuted }}>
                    Miembro desde {memberSince}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Posición', value: profile.rank ? `#${profile.rank}` : '—', accent: rankStyle?.color ?? textSub },
                { label: 'Puntos', value: profile.points.toLocaleString('es-CO'), accent: '#F5C500' },
                { label: 'Labs completados', value: profile.completedLabs, accent: '#4ade80' },
              ].map(({ label, value, accent }) => (
                <div
                  key={label}
                  className="rounded-2xl overflow-hidden transition-all duration-200 cursor-default relative"
                  style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(-3px)'
                    el.style.boxShadow = `0 8px 40px rgba(0,0,0,0.25), 0 0 0 1px ${accent}40`
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = 'none'
                  }}
                >
                  {/* Top accent strip */}
                  <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

                  {/* Corner glow */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      bottom: '-20%', right: '-10%',
                      width: '140px', height: '140px',
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
                    }}
                  />

                  <div className="relative px-5 py-5 text-center">
                    <p className="num-display leading-none" style={{ fontSize: '2rem', color: accent as string }}>
                      {value}
                    </p>
                    <p className="font-mono text-[10px] tracking-[0.16em] uppercase mt-2" style={{ color: textMuted }}>
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Enrolled courses */}
            <div
              className="rounded-2xl p-6 space-y-4"
              style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
            >
              <p className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: textMuted }}>
                // cursos inscritos
              </p>

              {profile.enrolledCourses.length === 0 ? (
                <p className="text-[13px] italic" style={{ color: textMuted }}>
                  Sin cursos inscritos aún.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.enrolledCourses.map(c => (
                    <Link
                      key={c.id}
                      to={`/courses/${c.slug}`}
                      className="px-4 py-2 rounded-full font-mono text-[12px] tracking-wide transition-all duration-150"
                      style={{
                        background: isDark ? 'rgba(26,63,150,0.12)' : 'rgba(26,63,150,0.07)',
                        border: `1px solid ${isDark ? 'rgba(26,63,150,0.28)' : 'rgba(26,63,150,0.18)'}`,
                        color: textSub,
                        textDecoration: 'none',
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement
                        el.style.background = isDark ? 'rgba(26,63,150,0.22)' : 'rgba(26,63,150,0.13)'
                        el.style.color = '#2596be'
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement
                        el.style.background = isDark ? 'rgba(26,63,150,0.12)' : 'rgba(26,63,150,0.07)'
                        el.style.color = textSub
                      }}
                    >
                      {c.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
