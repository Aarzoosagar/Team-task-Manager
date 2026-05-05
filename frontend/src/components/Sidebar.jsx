import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { initials } from './ui'

const NAV = [
  { to: '/dashboard', label: 'Overview',  dot: '#dedad2' },
  { to: '/projects',  label: 'Projects',  dot: '#1a4b7a' },
  { to: '/tasks',     label: 'Tasks',     dot: '#3d5a3e' },
]
const ADMIN_NAV = [
  { to: '/team', label: 'Team', dot: '#b85c1a' },
]

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const toast  = useToast()
  const nav    = useNavigate()

  const items = isAdmin ? [...NAV, ...ADMIN_NAV] : NAV

  const handleLogout = () => {
    logout()
    toast.info('Signed out')
    nav('/login')
  }

  return (
    <aside className="sidebar">

      {/* Brand */}
      <div className="sidebar-top">
        <div className="sidebar-logo">
          Fieldwork
          <span className="sidebar-logo-sub">Task management</span>
        </div>
      </div>

      {/* User */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">{initials(user?.name)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sidebar-uname">{user?.name}</div>
          <div className="sidebar-urole">{user?.role}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            {({ isActive }) => (
              <>
                <div
                  className="nav-dot"
                  style={{ background: isActive ? item.dot : 'rgba(255,255,255,0.18)' }}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar-bottom">
        <button className="btn-logout" onClick={handleLogout}>
          Sign out
        </button>
      </div>

    </aside>
  )
}
