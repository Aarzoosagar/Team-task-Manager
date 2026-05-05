import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { tasksApi, projectsApi } from '../api/services'
import { BarChart, StatusChip, Spinner } from '../components/ui'

export default function Dashboard() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [stats,   setStats]   = useState(null)
  const [recent,  setRecent]  = useState([])
  const [projects,setProjects]= useState([])

  useEffect(() => {
    Promise.all([
      tasksApi.stats(),
      tasksApi.list({ per_page: 5 }),
      projectsApi.list({ per_page: 4 }),
    ]).then(([s, t, p]) => {
      setStats(s.data)
      setRecent(t.data.tasks)
      setProjects(p.data.projects)
    })
  }, [])

  if (!stats) return <Spinner />

  const bars = [
    { label: 'To do',       value: stats.todo,        color: '#dedad2' },
    { label: 'In progress', value: stats.in_progress, color: 'var(--sky)' },
    { label: 'Done',        value: stats.done,        color: 'var(--sage)' },
    { label: 'Overdue',     value: stats.overdue,     color: 'var(--red)' },
  ]

  return (
    <div>

      {/* Metric strip */}
      <div className="metrics">
        {[
          { num: stats.total,        label: 'Total tasks' },
          { num: stats.done,         label: 'Completed' },
          { num: stats.in_progress,  label: 'In progress' },
          { num: stats.overdue,      label: 'Overdue', overdue: true },
        ].map((m, i) => (
          <div key={i} className={`metric${m.overdue ? ' metric-overdue' : ''}`}>
            <div className="metric-num">{m.num}</div>
            <div className="label">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Two-col row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Bar chart */}
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Status breakdown</span>
          </div>
          <div className="panel-body">
            <BarChart bars={bars} />
          </div>
        </div>

        {/* Projects */}
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Projects</span>
            <button className="panel-link" onClick={() => navigate('/projects')}>
              View all
            </button>
          </div>
          <div className="panel-body" style={{ padding: '4px 16px' }}>
            {projects.length === 0
              ? <p style={{ fontSize: 12, color: 'var(--ink-3)', padding: '12px 0' }}>No projects yet</p>
              : projects.map(p => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 0', borderBottom: '1px solid var(--line)',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate('/projects')}>
                    <div style={{ width: 3, height: 28, background: 'var(--ink)', borderRadius: 1, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.title}
                      </div>
                      <div className="label" style={{ marginTop: 2 }}>
                        {p.task_count} tasks · {p.members?.length || 0} members
                      </div>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>

      </div>

      {/* Recent tasks */}
      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Recent tasks</span>
          <button className="panel-link" onClick={() => navigate('/tasks')}>View all</button>
        </div>
        <div className="panel-body" style={{ padding: '4px 16px' }}>
          {recent.length === 0
            ? <p style={{ fontSize: 12, color: 'var(--ink-3)', padding: '12px 0' }}>No tasks yet</p>
            : recent.map(t => (
                <div key={t.id} className="task-row">
                  <div className={`task-check${t.status === 'done' ? ' done' : ''}`}>
                    {t.status === 'done' && '✓'}
                  </div>
                  <span className={`task-name${t.status === 'done' ? ' done' : ''}`} style={{ flex: 1 }}>
                    {t.title}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--ink-3)', marginRight: 8 }}>
                    {t.project_title}
                  </span>
                  <StatusChip status={t.status} overdue={t.is_overdue} />
                </div>
              ))
          }
        </div>
      </div>

    </div>
  )
}
