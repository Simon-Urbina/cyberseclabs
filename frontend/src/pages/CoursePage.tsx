import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { api } from '../lib/api'
import Header from '../components/Header'
import Footer from '../components/Footer'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseDetail {
  id: string
  slug: string
  title: string
  description: string | null
  difficulty: 'principiante' | 'intermedio' | 'avanzado'
  moduleCount: number
  labCount: number
  totalPoints: number
  isEnrolled: boolean
  completedLabsCount?: number
}

interface CourseModule {
  id: string
  slug: string
  title: string
  description: string | null
  position: number
}

interface Lab {
  id: string
  slug: string
  title: string
  position: number
  estimatedMinutes: number
  points: number
  isPublished: boolean
  progress?: {
    status: 'not_started' | 'in_progress' | 'completed'
    bestScorePercent: number
    attemptsCount: number
  }
}

interface ModuleWithLabs extends CourseModule {
  labs: Lab[]
  labsLoading: boolean
}

type LabStatus = 'completed' | 'in_progress' | 'available' | 'locked'

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFF_META = {
  principiante: { color: '#2596be', label: 'PRINCIPIANTE' },
  intermedio:   { color: '#F5C500', label: 'INTERMEDIO'   },
  avanzado:     { color: '#1A3F96', label: 'AVANZADO'     },
} as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

function labStatus(lab: Lab, enrolled: boolean): LabStatus {
  if (!enrolled) return 'locked'
  const s = lab.progress?.status
  if (s === 'completed')  return 'completed'
  if (s === 'in_progress') return 'in_progress'
  return 'available'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CoursePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate   = useNavigate()
  const { theme }  = useTheme()
  const isDark     = theme === 'dark'

  const [course,  setCourse]  = useState<CourseDetail | null>(null)
  const [modules, setModules] = useState<ModuleWithLabs[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const [courseData, moduleData] = await Promise.all([
          api.get<CourseDetail>(`/api/courses/${slug}`),
          api.get<CourseModule[]>(`/api/courses/${slug}/modules`),
        ])
        if (cancelled) return

        setCourse(courseData)
        setModules(moduleData.map(m => ({ ...m, labs: [], labsLoading: true })))

        // fetch all module labs in parallel
        const labResults = await Promise.all(
          moduleData.map(m =>
            api.get<Lab[]>(`/api/courses/${slug}/modules/${m.slug}/labs`)
              .catch(() => [] as Lab[])
          )
        )
        if (cancelled) return

        setModules(moduleData.map((m, i) => ({
          ...m, labs: labResults[i], labsLoading: false,
        })))
      } catch (e: unknown) {
        if (!cancelled) setError((e as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [slug])

  if (loading) return <Spinner isDark={isDark} />
  if (error || !course) return <ErrorScreen isDark={isDark} message={error} onBack={() => navigate('/dashboard')} />

  const diff         = DIFF_META[course.difficulty]
  const completed    = course.completedLabsCount ?? 0
  const total        = course.labCount
  const pct          = total > 0 ? (completed / total) * 100 : 0

  return (
    <div style={{ background: isDark ? '#060D1F' : '#EEF3FC', minHeight: '100vh' }}>
      <Header />

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden border-b"
        style={{
          borderColor: isDark ? 'rgba(26,63,150,0.12)' : 'rgba(26,63,150,0.10)',
          background: isDark
            ? 'linear-gradient(155deg, #0D1630 0%, #060D1F 100%)'
            : 'linear-gradient(155deg, #E8EEFA 0%, #EEF3FC 100%)',
        }}
      >
        {/* Ambient orb */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-40%', right: '-8%',
            width: '560px', height: '560px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${diff.color}1A 0%, transparent 62%)`,
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6 lg:px-10 py-12">
          {/* Back */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 mb-8 font-mono text-[11px] tracking-[0.2em] uppercase transition-colors"
            style={{ color: isDark ? '#3A5AB8' : '#4A70CC' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = diff.color }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = isDark ? '#3A5AB8' : '#4A70CC' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Dashboard
          </button>

          {/* Badges */}
          <div className="flex items-center gap-3 mb-5 animate-fade-up-1">
            <span
              className="font-mono text-[10px] tracking-[0.22em] px-3 py-1.5 rounded"
              style={{ color: diff.color, background: `${diff.color}12`, border: `1px solid ${diff.color}30` }}
            >
              {diff.label}
            </span>
            {course.isEnrolled && (
              <span
                className="font-mono text-[10px] tracking-[0.22em] px-3 py-1.5 rounded flex items-center gap-1.5"
                style={{ color: '#52ad70', background: 'rgba(82,173,112,0.08)', border: '1px solid rgba(82,173,112,0.25)' }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Inscrito
              </span>
            )}
          </div>

          <h1
            className="font-display mb-4 animate-fade-up-1"
            style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', lineHeight: 1.1, color: isDark ? '#C8D5EE' : '#0A1545' }}
          >
            {course.title}
          </h1>

          {course.description && (
            <p
              className="text-base font-light max-w-2xl mb-8 animate-fade-up-2"
              style={{ color: isDark ? '#4A70CC' : '#2451C8', lineHeight: 1.65 }}
            >
              {course.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 flex-wrap animate-fade-up-2">
            <HeroStat label="Módulos"      value={course.moduleCount.toString()}              accent={diff.color} isDark={isDark} />
            <Divider isDark={isDark} />
            <HeroStat label="Laboratorios" value={course.labCount.toString()}                 accent={diff.color} isDark={isDark} />
            <Divider isDark={isDark} />
            <HeroStat label="Puntos"       value={course.totalPoints.toLocaleString('es-CO')} accent="#F5C500"   isDark={isDark} />
          </div>

          {/* Progress bar */}
          {course.isEnrolled && total > 0 && (
            <div className="mt-8 max-w-sm animate-fade-up-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: diff.color }}>
                  Tu progreso
                </span>
                <span className="font-mono text-[11px]" style={{ color: isDark ? '#3A5AB8' : '#4A70CC' }}>
                  <span className="num-display" style={{ fontSize: '0.85rem', color: isDark ? '#C8D5EE' : '#0A1545' }}>
                    {completed}
                  </span>
                  {' / '}{total} labs
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(26,63,150,0.12)' : 'rgba(26,63,150,0.08)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${diff.color}, ${diff.color}bb)`,
                    minWidth: completed > 0 ? '6px' : '0',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Module path ── */}
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-16 space-y-2">
        {modules.length === 0
          ? <EmptyModules isDark={isDark} />
          : modules.map((mod, idx) => (
              <ModuleSection
                key={mod.id}
                mod={mod}
                modIdx={idx}
                course={course}
                isDark={isDark}
                onLabClick={lab =>
                  navigate(`/courses/${slug}/${mod.slug}/${lab.slug}`)
                }
              />
            ))
        }
      </div>

      <Footer />
    </div>
  )
}

// ─── Module section ────────────────────────────────────────────────────────────

function ModuleSection({
  mod, modIdx, course, isDark, onLabClick,
}: {
  mod: ModuleWithLabs
  modIdx: number
  course: CourseDetail
  isDark: boolean
  onLabClick: (lab: Lab) => void
}) {
  const diff         = DIFF_META[course.difficulty]
  const completedCnt = mod.labs.filter(l => l.progress?.status === 'completed').length
  const allDone      = mod.labs.length > 0 && completedCnt === mod.labs.length

  return (
    <div className="animate-fade-up-2">
      {/* ── Module banner ── */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(13,27,70,0.95) 0%, rgba(9,30,82,0.88) 100%)'
            : 'linear-gradient(135deg, #f0f5ff 0%, #e8eefa 100%)',
          border: `1px solid ${isDark ? 'rgba(26,63,150,0.18)' : 'rgba(26,63,150,0.14)'}`,
          borderLeft: `3px solid ${diff.color}`,
        }}
      >
        {/* Watermark number */}
        <div
          className="absolute right-5 top-1/2 -translate-y-1/2 font-display pointer-events-none select-none"
          style={{
            fontSize: 'clamp(4rem,10vw,6.5rem)',
            lineHeight: 1,
            fontWeight: 800,
            color: isDark ? 'rgba(26,63,150,0.06)' : 'rgba(26,63,150,0.04)',
          }}
        >
          {String(modIdx + 1).padStart(2, '0')}
        </div>

        <div className="relative px-8 py-6 pr-28">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p
                className="font-mono text-[9px] tracking-[0.28em] uppercase mb-2.5"
                style={{ color: diff.color }}
              >
                // módulo {String(modIdx + 1).padStart(2, '0')}
              </p>
              <h2
                className="font-display mb-1.5"
                style={{
                  fontSize: 'clamp(1.2rem,2.2vw,1.6rem)',
                  lineHeight: 1.2,
                  color: isDark ? '#C8D5EE' : '#0A1545',
                }}
              >
                {mod.title}
              </h2>
              {mod.description && (
                <p className="text-[13px] font-light" style={{ color: isDark ? '#4A70CC' : '#2451C8', lineHeight: 1.6 }}>
                  {mod.description}
                </p>
              )}
            </div>

            {/* Status badge */}
            {allDone ? (
              <StatusPill color="#52ad70" bg="rgba(82,173,112,0.08)" border="rgba(82,173,112,0.22)">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Completado
              </StatusPill>
            ) : mod.labs.length > 0 ? (
              <StatusPill
                color={isDark ? '#3A5AB8' : '#4A70CC'}
                bg={isDark ? 'rgba(26,63,150,0.06)' : 'rgba(26,63,150,0.04)'}
                border={isDark ? 'rgba(26,63,150,0.14)' : 'rgba(26,63,150,0.12)'}
              >
                {completedCnt}/{mod.labs.length} labs
              </StatusPill>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Labs path ── */}
      {mod.labsLoading
        ? <LabsSkeleton isDark={isDark} />
        : mod.labs.length === 0
        ? (
          <p className="py-8 text-center font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: isDark ? '#3A5AB8' : '#9BADD0' }}>
            // sin laboratorios publicados
          </p>
        )
        : <LabPath labs={mod.labs} course={course} isDark={isDark} onLabClick={onLabClick} />
      }
    </div>
  )
}

// ─── Lab path ─────────────────────────────────────────────────────────────────

function LabPath({ labs, course, isDark, onLabClick }: {
  labs: Lab[]
  course: CourseDetail
  isDark: boolean
  onLabClick: (lab: Lab) => void
}) {
  return (
    <div className="relative">
      {/* Dashed vertical spine */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0"
        style={{
          width: '2px',
          background: isDark
            ? 'repeating-linear-gradient(to bottom, rgba(26,63,150,0.22) 0, rgba(26,63,150,0.22) 6px, transparent 6px, transparent 14px)'
            : 'repeating-linear-gradient(to bottom, rgba(26,63,150,0.15) 0, rgba(26,63,150,0.15) 6px, transparent 6px, transparent 14px)',
        }}
      />

      <div className="py-5 space-y-3">
        {labs.map((lab, idx) => (
          <LabRow
            key={lab.id}
            lab={lab}
            status={labStatus(lab, course.isEnrolled)}
            isLeft={idx % 2 === 0}
            isDark={isDark}
            onClick={() => {
              if (course.isEnrolled) onLabClick(lab)
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Lab row ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<LabStatus, { bg: string; border: string; fg: string; glow: string; darkBg: string; darkBorder: string; darkFg: string }> = {
  completed:  { bg: 'rgba(82,173,112,0.10)',  border: 'rgba(82,173,112,0.50)',  fg: '#52ad70', glow: 'rgba(82,173,112,0.22)', darkBg: 'rgba(82,173,112,0.10)',  darkBorder: 'rgba(82,173,112,0.50)',  darkFg: '#52ad70' },
  in_progress:{ bg: 'rgba(37,150,190,0.12)',  border: '#2596be',               fg: '#2596be', glow: 'rgba(37,150,190,0.28)', darkBg: 'rgba(37,150,190,0.15)',  darkBorder: '#2596be',               darkFg: '#3DAED0' },
  available:  { bg: 'rgba(26,63,150,0.07)',   border: 'rgba(26,63,150,0.40)',  fg: '#1A3F96', glow: 'none',                  darkBg: 'rgba(26,63,150,0.12)',   darkBorder: 'rgba(26,63,150,0.50)',  darkFg: '#7B9FE8' },
  locked:     { bg: 'rgba(26,63,150,0.03)',   border: 'rgba(26,63,150,0.10)',  fg: '#9BADD0', glow: 'none',                  darkBg: 'rgba(26,63,150,0.04)',   darkBorder: 'rgba(26,63,150,0.14)',  darkFg: '#3A5AB8' },
}

function LabRow({ lab, status, isLeft, isDark, onClick }: {
  lab: Lab
  status: LabStatus
  isLeft: boolean
  isDark: boolean
  onClick: () => void
}) {
  const st       = STATUS_STYLES[status]
  const bg       = isDark ? st.darkBg     : st.bg
  const border   = isDark ? st.darkBorder : st.border
  const fg       = isDark ? st.darkFg     : st.fg
  const clickable = status !== 'locked'

  return (
    <div className="relative grid items-center" style={{ gridTemplateColumns: '1fr 80px 1fr', gap: '0 24px', minHeight: '96px' }}>
      {/* Left info */}
      <div className="flex justify-end">
        {!isLeft && (
          <LabCard lab={lab} status={status} fg={fg} isDark={isDark} clickable={clickable} onClick={onClick} />
        )}
      </div>

      {/* Node */}
      <div className="relative flex items-center justify-center" style={{ zIndex: 10 }}>
        <button
          disabled={!clickable}
          onClick={clickable ? onClick : undefined}
          className="relative flex items-center justify-center rounded-full transition-all duration-200"
          style={{
            width: 76, height: 76,
            background: bg,
            border: `2px solid ${border}`,
            boxShadow: st.glow !== 'none' ? `0 0 18px ${st.glow}, 0 0 36px ${st.glow}55` : 'none',
            cursor: clickable ? 'pointer' : 'default',
          }}
          onMouseEnter={e => {
            if (!clickable) return
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'scale(1.1)'
            el.style.boxShadow = `0 0 28px ${st.glow !== 'none' ? st.glow : `${border}55`}, 0 6px 24px rgba(0,0,0,0.28)`
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'scale(1)'
            el.style.boxShadow = st.glow !== 'none' ? `0 0 18px ${st.glow}, 0 0 36px ${st.glow}55` : 'none'
          }}
        >
          <NodeIcon status={status} color={fg} />

          {/* Pulse ring for in_progress */}
          {status === 'in_progress' && (
            <span className="absolute inset-0 rounded-full animate-ping" style={{ border: `2px solid ${fg}55` }} />
          )}
        </button>

        {/* Position badge */}
        <span
          className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full num-display"
          style={{
            width: 20, height: 20,
            fontSize: '9px', lineHeight: 1,
            background: isDark ? '#0A1545' : '#EEF3FC',
            border: `1px solid ${border}`,
            color: fg,
          }}
        >
          {lab.position}
        </span>
      </div>

      {/* Right info */}
      <div className="flex justify-start">
        {isLeft && (
          <LabCard lab={lab} status={status} fg={fg} isDark={isDark} clickable={clickable} onClick={onClick} />
        )}
      </div>
    </div>
  )
}

// ─── Lab card ─────────────────────────────────────────────────────────────────

function LabCard({ lab, status, fg, isDark, clickable, onClick }: {
  lab: Lab
  status: LabStatus
  fg: string
  isDark: boolean
  clickable: boolean
  onClick: () => void
}) {
  const isCompleted  = status === 'completed'
  const isInProgress = status === 'in_progress'
  const isLocked     = status === 'locked'

  const borderColor = isCompleted
    ? 'rgba(82,173,112,0.25)'
    : isInProgress
    ? 'rgba(37,150,190,0.35)'
    : isDark ? 'rgba(26,63,150,0.14)' : 'rgba(26,63,150,0.10)'

  const statusLabel = isCompleted
    ? '✓ Completado'
    : isInProgress
    ? '● En progreso'
    : isLocked
    ? '⌛ Bloqueado'
    : '○ Disponible'

  return (
    <button
      disabled={!clickable}
      onClick={clickable ? onClick : undefined}
      className="text-left w-full max-w-[220px] rounded-xl p-4 transition-all duration-150"
      style={{
        background: isDark ? 'rgba(13,27,70,0.80)' : '#f8faff',
        border: `1px solid ${borderColor}`,
        opacity: isLocked ? 0.45 : 1,
        cursor: clickable ? 'pointer' : 'default',
      }}
      onMouseEnter={e => {
        if (!clickable) return
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'scale(1.03)'
        el.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'scale(1)'
        el.style.boxShadow = 'none'
      }}
    >
      <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-1.5" style={{ color: fg }}>
        {statusLabel}
      </p>

      <p
        className="font-display leading-tight mb-3"
        style={{ fontSize: '13px', color: isDark ? '#C8D5EE' : '#0A1545' }}
      >
        {lab.title}
      </p>

      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 font-mono text-[10px]" style={{ color: '#F5C500' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span className="num-display" style={{ fontSize: '10px' }}>{lab.points}</span> pts
        </span>
        <span className="flex items-center gap-1 font-mono text-[10px]" style={{ color: isDark ? '#3A5AB8' : '#4A70CC' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span className="num-display" style={{ fontSize: '10px' }}>{lab.estimatedMinutes}</span>min
        </span>
      </div>

      {isCompleted && lab.progress && (
        <div className="mt-2.5 pt-2.5" style={{ borderTop: '1px solid rgba(82,173,112,0.14)' }}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] tracking-wider" style={{ color: 'rgba(82,173,112,0.65)' }}>
              MEJOR PUNTAJE
            </span>
            <span className="num-display" style={{ fontSize: '11px', color: '#52ad70' }}>
              {lab.progress.bestScorePercent.toFixed(0)}%
            </span>
          </div>
        </div>
      )}
    </button>
  )
}

// ─── Node icon ────────────────────────────────────────────────────────────────

function NodeIcon({ status, color }: { status: LabStatus; color: string }) {
  const s = { stroke: color, fill: 'none', strokeWidth: '2', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  if (status === 'completed') return (
    <svg width="28" height="28" viewBox="0 0 24 24" {...s} strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
  if (status === 'locked') return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...s} strokeWidth="1.8">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
  if (status === 'in_progress') return (
    <svg width="26" height="26" viewBox="0 0 24 24" {...s} strokeWidth="1.8">
      <polyline points="4 17 10 11 4 5"/>
      <line x1="12" y1="19" x2="20" y2="19"/>
    </svg>
  )
  // available
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" {...s} strokeWidth="1.8">
      <polygon points="5 3 19 12 5 21 5 3" fill={`${color}20`}/>
    </svg>
  )
}

// ─── Minor components ─────────────────────────────────────────────────────────

function HeroStat({ label, value, accent, isDark }: { label: string; value: string; accent: string; isDark: boolean }) {
  return (
    <div>
      <p className="num-display" style={{ fontSize: '1.65rem', lineHeight: 1, color: isDark ? '#C8D5EE' : '#0A1545' }}>
        {value}
      </p>
      <p className="font-mono text-[9px] tracking-[0.2em] uppercase mt-1" style={{ color: accent }}>
        {label}
      </p>
    </div>
  )
}

function Divider({ isDark }: { isDark: boolean }) {
  return <div style={{ width: 1, height: 28, background: isDark ? 'rgba(26,63,150,0.15)' : 'rgba(26,63,150,0.12)' }} />
}

function StatusPill({
  color, bg, border, children,
}: {
  color: string; bg: string; border: string; children: React.ReactNode
}) {
  return (
    <div
      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono text-[9px] tracking-[0.18em] uppercase"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      {children}
    </div>
  )
}

function LabsSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div className="py-6 space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="grid items-center animate-pulse" style={{ gridTemplateColumns: '1fr 80px 1fr', gap: '0 24px', minHeight: '96px' }}>
          <div />
          <div className="rounded-full mx-auto" style={{ width: 76, height: 76, background: isDark ? 'rgba(26,63,150,0.10)' : 'rgba(26,63,150,0.06)' }} />
          <div className="rounded-xl" style={{ height: 72, background: isDark ? 'rgba(26,63,150,0.08)' : 'rgba(26,63,150,0.05)' }} />
        </div>
      ))}
    </div>
  )
}

function EmptyModules({ isDark }: { isDark: boolean }) {
  return (
    <div className="py-24 text-center">
      <p className="font-mono text-[10px] tracking-[0.28em] uppercase mb-3" style={{ color: isDark ? '#3A5AB8' : '#4A70CC' }}>
        // sin módulos
      </p>
      <p className="font-display text-xl" style={{ color: isDark ? '#C8D5EE' : '#0A1545' }}>
        Este curso no tiene módulos publicados aún.
      </p>
    </div>
  )
}

function Spinner({ isDark }: { isDark: boolean }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: isDark ? '#060D1F' : '#EEF3FC' }}>
      <div className="text-center">
        <div className="inline-flex gap-2 mb-4">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ background: '#1A3F96', animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: isDark ? '#3A5AB8' : '#4A70CC' }}>
          Cargando curso…
        </p>
      </div>
    </div>
  )
}

function ErrorScreen({ isDark, message, onBack }: { isDark: boolean; message: string | null; onBack: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: isDark ? '#060D1F' : '#EEF3FC' }}>
      <div className="text-center max-w-sm px-6">
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: '#1A3F96' }}>Error</p>
        <p className="font-display text-xl mb-8" style={{ color: isDark ? '#C8D5EE' : '#0A1545' }}>
          {message ?? 'Curso no encontrado.'}
        </p>
        <button onClick={onBack} className="btn-neon px-6 py-3 rounded-xl text-[14px] font-semibold">
          ← Volver al dashboard
        </button>
      </div>
    </div>
  )
}
