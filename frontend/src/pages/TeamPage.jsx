import { useState, useEffect } from 'react'
import { usersApi } from '../api/services'
import { Spinner } from '../components/ui'

const COLORS = ['#0f0e0d', '#3d5a3e', '#1a4b7a', '#b85c1a']

const initials = name =>
  (name || '').split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase()

export default function TeamPage() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    usersApi.list()
      .then(r => setUsers(r.data.users))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">{users.length} members</span>
      </div>
      <div className="panel-body" style={{ padding: '4px 16px' }}>
        {users.map((u, i) => (
          <div key={u.id} className="user-row">
            <div
              className="user-avatar"
              style={{ background: COLORS[i % COLORS.length] }}>
              {initials(u.name)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{u.name}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{u.email}</div>
            </div>
            <span className={`chip chip-${u.role === 'admin' ? 'admin' : 'member'}`}>
              {u.role}
            </span>
            <span style={{ fontSize: 11, color: 'var(--ink-3)', minWidth: 80, textAlign: 'right' }}>
              {u.created_at?.slice(0, 10)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
