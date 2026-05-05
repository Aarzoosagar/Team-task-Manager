import { useEffect } from 'react'

/* ── Helpers ── */
export const initials = name =>
  (name || '').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase() || '?'

export const statusChipClass = status => ({
  todo:        'chip chip-todo',
  in_progress: 'chip chip-inprog',
  done:        'chip chip-done',
}[status] || 'chip chip-todo')

export const statusLabel = status => ({
  todo:        'To do',
  in_progress: 'In progress',
  done:        'Done',
}[status] || status)

/* ── Avatar ── */
const AV_COLORS = ['#0f0e0d', '#3d5a3e', '#1a4b7a', '#b85c1a']

export function Avatar({ name, size = 34, index = 0 }) {
  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: AV_COLORS[index % AV_COLORS.length],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.floor(size * 0.32), fontWeight: 500,
        color: '#faf8f5', flexShrink: 0,
      }}>
      {initials(name)}
    </div>
  )
}

/* ── Status chip ── */
export function StatusChip({ status, overdue }) {
  if (overdue && status !== 'done') return <span className="chip chip-overdue">Overdue</span>
  return <span className={statusChipClass(status)}>{statusLabel(status)}</span>
}

/* ── Modal ── */
export function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

/* ── Field wrapper ── */
export function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  )
}

/* ── Buttons ── */
export function Btn({ children, variant = 'dark', ...props }) {
  return (
    <button className={`btn btn-${variant}`} {...props}>
      {children}
    </button>
  )
}

/* ── Spinner ── */
export function Spinner() {
  return <div className="spinner" />
}

/* ── Empty state ── */
export function Empty({ icon = '◻', text = 'Nothing here yet' }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <div className="empty-text">{text}</div>
    </div>
  )
}

/* ── Pagination ── */
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="pagination">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          className={`pg-btn${page === p ? ' active' : ''}`}
          onClick={() => onChange(p)}>
          {p}
        </button>
      ))}
    </div>
  )
}

/* ── Member faces stack ── */
export function MemberFaces({ members = [], max = 4 }) {
  const shown = members.slice(0, max)
  const extra = members.length - max
  return (
    <div className="member-faces">
      {shown.map((m, i) => (
        <div
          key={m.id}
          title={m.name}
          className={`member-face${i % 2 === 1 ? ' alt' : ''}`}>
          {initials(m.name)}
        </div>
      ))}
      {extra > 0 && (
        <div className="member-face" style={{ background: '#888780' }}>
          +{extra}
        </div>
      )}
    </div>
  )
}

/* ── Bar chart ── */
export function BarChart({ bars }) {
  const max = Math.max(...bars.map(b => b.value), 1)
  return (
    <div className="chart-bars">
      {bars.map((b, i) => (
        <div key={i} className="chart-bar-wrap">
          <span className="chart-bar-val">{b.value}</span>
          <div
            className="chart-bar"
            style={{
              height: Math.max((b.value / max) * 68, b.value ? 3 : 0),
              background: b.color,
            }}
          />
          <span className="chart-bar-label">{b.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ── ProtectedRoute ── */
export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = window.__AUTH_CTX__ || {}
  // Real usage: import useAuth and check inside component
  return children
}
