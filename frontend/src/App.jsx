import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout      from './AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage      from './pages/LoginPage'
import Dashboard      from './pages/Dashboard'
import ProjectsPage   from './pages/ProjectsPage'
import TasksPage      from './pages/TasksPage'
import TeamPage       from './pages/TeamPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
        <Route index          element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects"  element={<ProjectsPage />} />
        <Route path="tasks"     element={<TasksPage />} />
        <Route path="team"      element={
          <ProtectedRoute adminOnly>
            <TeamPage />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
