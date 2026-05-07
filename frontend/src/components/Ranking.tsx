import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useTheme } from '../context/ThemeContext'

interface RankRow {
  rank: number
  id: string
  username: string
  bio: string | null
  points: number
}

interface RankingResponse {
  data: RankRow[]
  total: number
}

const RANK_ACCENTS: Record<number, { color: string; label: string }> = {
  1: { color: '#F5C500', label: 'GOLD' },
  2: { color: '#7B9FE8', label: 'SILVER' },
  3: { color: '#2596be', label: 'BRONZE' },
}

export default function Ranking({ limit = 5 }: { limit?: number }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [rows, setRows] = useState<RankRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api
      .get<RankingResponse>(`/api/ranking?limit=${limit}`)
      .then(res => setRows(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [limit])

  const maxPoints = rows.length ? Math.max(...rows.map(r => r.points), 1) : 1

  return (
    <div className="space-y-3">
      {loading && (
        <>
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl px-6 py-5 animate-pulse"
              style={{
                background: isDark ? 'rgba(13,27,70,0.85)' : '#f8faff',
                border: `1px solid ${isDark ? 'rgba(26,63,150,0.10)' : 'rgba(26,63,150,0.08)'}`,
                opacity: 0.5,
              }}
            >
              <div className="h-4" />
            </div>
          ))}
        </>
      )}

      {error && !loading && (
        <div
          className="rounded-2xl px-6 py-5"
          style={{
            background: isDark ? 'rgba(13,27,70,0.85)' : '#eef0f8',
            border: '1px solid rgba(26,63,150,0.25)',
            borderLeft: '3px solid #1A3F96',
          }}
        >
          <span className="font-mono text-xs" style={{ color: '#1A3F96' }}>ERR</span>
          <p className="text-sm mt-1" style={{ color: isDark ? '#93B0F0' : '#0A1545' }}>{error}</p>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div
          className="rounded-2xl px-6 py-10 text-center"
          style={{
            background: isDark ? 'rgba(13,27,70,0.85)' : '#f8faff',
            border: `1px solid ${isDark ? 'rgba(26,63,150,0.12)' : 'rgba(26,63,150,0.10)'}`,
          }}
        >
          <p className="font-mono text-sm" style={{ color: isDark ? '#3A5AB8' : '#1A3F96' }}>
            // sin operadores aún
          </p>
        </div>
      )}

      {!loading && !error && rows.map(row => {
        const accent = RANK_ACCENTS[row.rank]?.color ?? (isDark ? '#3A5AB8' : '#4A70CC')
        const label = RANK_ACCENTS[row.rank]?.label
        const isTop = row.rank === 1
        const ratio = row.points > 0 ? row.points / maxPoints : 0

        return (
          <div
            key={row.id}
            className="rounded-2xl px-6 py-5 transition-all duration-200 cursor-default relative overflow-hidden"
            style={{
              background: isDark ? 'rgba(13,27,70,0.85)' : '#f8faff',
              border: `1px solid ${isDark ? 'rgba(26,63,150,0.14)' : 'rgba(26,63,150,0.10)'}`,
              ...(isTop && {
                boxShadow: isDark
                  ? '0 0 0 1px rgba(245,197,0,0.18), 0 8px 32px rgba(245,197,0,0.05)'
                  : '0 0 0 1px rgba(245,197,0,0.25), 0 8px 32px rgba(245,197,0,0.08)',
              }),
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.transform = 'translateY(0)'
            }}
          >
            {/* Background glow for top rank */}
            {isTop && (
              <div
                className="absolute pointer-events-none"
                style={{
                  top: '-50%', right: '-10%',
                  width: '240px', height: '240px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(245,197,0,0.08) 0%, transparent 65%)',
                }}
              />
            )}

            <div className="relative flex items-center gap-5">
              {/* Rank number */}
              <div
                className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-display"
                style={{
                  fontSize: '1.5rem',
                  background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
                  color: accent,
                  border: `1px solid ${accent}33`,
                }}
              >
                {row.rank}
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p
                    className="font-display truncate"
                    style={{
                      fontSize: isTop ? '1.35rem' : '1.15rem',
                      color: isDark ? '#C8D5EE' : '#0A1545',
                    }}
                  >
                    {row.username}
                  </p>
                  {label && (
                    <span
                      className="font-mono text-[9px] tracking-[0.18em] px-1.5 py-0.5 rounded"
                      style={{
                        color: accent,
                        background: `${accent}15`,
                        border: `1px solid ${accent}30`,
                      }}
                    >
                      {label}
                    </span>
                  )}
                </div>
                {row.bio && (
                  <p
                    className="text-xs truncate"
                    style={{ color: isDark ? '#3A5AB8' : '#1A3F96' }}
                  >
                    {row.bio}
                  </p>
                )}
                {/* Progress bar */}
                <div
                  className="mt-2 h-1 rounded-full overflow-hidden"
                  style={{ background: isDark ? 'rgba(26,63,150,0.10)' : 'rgba(26,63,150,0.08)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.max(ratio * 100, 4)}%`,
                      background: `linear-gradient(90deg, ${accent}, ${accent}dd)`,
                    }}
                  />
                </div>
              </div>

              {/* Points */}
              <div className="shrink-0 text-right">
                <p
                  className="font-display leading-none"
                  style={{ fontSize: '1.5rem', color: isDark ? '#C8D5EE' : '#0A1545' }}
                >
                  {row.points.toLocaleString('es-CO')}
                </p>
                <p
                  className="font-mono text-[10px] tracking-[0.18em] uppercase mt-1"
                  style={{ color: accent }}
                >
                  pts
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
