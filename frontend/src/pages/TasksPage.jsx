import { useState, useEffect, useCallback } from 'react'
import { useAuth }  from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { tasksApi, projectsApi, usersApi } from '../api/services'
import { Modal, StatusChip, Spinner, Empty, Pagination } from '../components/ui'

const STATUSES = ['todo', 'in_progress', 'done']
const STATUS_LABELS = { todo: 'To do', in_progress: 'In progress', done: 'Done' }

export default function TasksPage() {
  const { user, isAdmin } = useAuth()
  const toast = useToast()

  const [tasks, setTasks] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])

  const [filters, setFilters] = useState({
    search: '', status: '', project_id: '', overdue: false,
  })

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    assigned_to: '',
    project_id: '',
    due_date: '',
  })

  const load = useCallback(() => {
    setLoading(true)
    tasksApi.list({ page, per_page: 10, ...filters, overdue: filters.overdue || undefined })
      .then(r => {
        setTasks(r.data.tasks)
        setTotal(r.data.total)
        setPages(r.data.pages)
      })
      .finally(() => setLoading(false))
  }, [filters, page])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    projectsApi.list({}).then(r => setProjects(r.data.projects))
    usersApi.list().then(r => setUsers(r.data.users))
  }, [])

  const sf = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1) }

  const openCreate = () => {
    setEditTarget(null)
    setForm({
      title: '',
      description: '',
      status: 'todo',
      assigned_to: '',
      project_id: '',
      due_date: '',
    })
    setFormOpen(true)
  }

  const openEdit = t => {
    setEditTarget(t)
    setForm({
      title: t.title,
      description: t.description || '',
      status: t.status,
      assigned_to: t.assigned_to || '',
      project_id: t.project_id || '',
      due_date: t.due_date ? t.due_date.slice(0, 10) : '',
    })
    setFormOpen(true)
  }

 
  const submit = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }

    if (!editTarget && !form.project_id) {
      toast.error('Select a project')
      return
    }

    try {
      const payload = {
        title: form.title,
        description: form.description,
        status: form.status,

        
        assigned_to: form.assigned_to || null,
        project_id: form.project_id,

        
        due_date: form.due_date
          ? new Date(form.due_date).toISOString()
          : null,
      }

      console.log("PAYLOAD:", payload)

      if (editTarget) {
        await tasksApi.update(editTarget.id, payload)
        toast.success('Task updated')
      } else {
        await tasksApi.create(payload)
        toast.success('Task created')
      }

      setFormOpen(false)
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed')
    }
  }

  const del = async t => {
    if (!confirm(`Delete "${t.title}"?`)) return
    try { await tasksApi.delete(t.id); toast.success('Deleted'); load() }
    catch { toast.error('Failed') }
  }

  const changeStatus = async (t, status) => {
    try {
      await tasksApi.update(t.id, { status })
      toast.success('Status updated')
      load()
    } catch { toast.error('Failed') }
  }

  return (
    <div>
      {/* Filters */}
      <div className="filter-strip">

        <div className="search-wrap">
          <input
            placeholder="Search tasks…"
            value={filters.search}
            onChange={e => sf('search', e.target.value)}
          />
        </div>

        <select value={filters.status} onChange={e => sf('status', e.target.value)}>
          <option value="">All status</option>
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>

        <select value={filters.project_id} onChange={e => sf('project_id', e.target.value)}>
          <option value="">All projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>

        {isAdmin && (
          <button className="btn btn-dark" onClick={openCreate}>
            + New task
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? <Spinner /> : tasks.length === 0
        ? <Empty text="No tasks" />
        : (
          <>
            {tasks.map(t => (
              <div key={t.id}>
                <div>{t.title}</div>
                <div>{t.project_title}</div>
                <div>{t.assignee_name || '—'}</div>
                <StatusChip status={t.status} />

                {isAdmin && (
                  <>
                    <button onClick={() => openEdit(t)}>Edit</button>
                    <button onClick={() => del(t)}>Delete</button>
                  </>
                )}
              </div>
            ))}
            <Pagination page={page} totalPages={pages} onChange={setPage} />
          </>
        )
      }

      {/* Modal */}
      {formOpen && (
        <Modal
          title={editTarget ? 'Edit task' : 'New task'}
          onClose={() => setFormOpen(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setFormOpen(false)}>Cancel</button>
              <button className="btn btn-dark" onClick={submit}>
                {editTarget ? 'Save' : 'Create'}
              </button>
            </>
          }
        >

          <div className="field">
            <label>Title *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>

            <div className="field">
              <label>Project *</label>
              <select
                value={form.project_id}
                onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}>
                <option value="">Select…</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Assign to</label>
              <select
                value={form.assigned_to}
                onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}>
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Due date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
              />
            </div>

          </div>

        </Modal>
      )}
    </div>
  )
}