import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import { useAuth } from './context/AuthContext'

const TITLES = {
  '/dashboard': 'Overview',
  '/projects':  'Projects',
  '/tasks':     'Tasks',
  '/team':      'Team',
}

export default function AppLayout() {
  const { user }   = useAuth()
  const { pathname } = useLocation()
  const title = TITLES[pathname] || 'Fieldwork'

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <header className="topbar">
          <span className="topbar-title">{title}</span>
          <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
        </header>

        {/* Content */}
        <main className="content-area">
          <Outlet />
        </main>

      </div>
    </div>
  )
}
