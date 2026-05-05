import { useState, useEffect, useCallback } from 'react'
import { useAuth }  from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { projectsApi, usersApi } from '../api/services'
import { Modal, MemberFaces, Spinner, Empty, initials } from '../components/ui'

export default function ProjectsPage() {
  const { user, isAdmin } = useAuth()
  const toast = useToast()

  const [projects, setProjects] = useState([])
  const [users,    setUsers]    = useState([])
  const [query,    setQuery]    = useState('')
  const [loading,  setLoading]  = useState(true)
  const [formModal, setFormModal]   = useState(null)  // null | 'create' | project obj
  const [manageModal, setManageModal] = useState(null)
  const [form, setForm] = useState({ title: '', description: '' })

  const load = useCallback(() => {
    setLoading(true)
    projectsApi.list({ search: query })
      .then(r => setProjects(r.data.projects))
      .finally(() => setLoading(false))
  }, [query])

  useEffect(() => { load() },              [load])
  useEffect(() => { usersApi.list().then(r => setUsers(r.data.users)) }, [])

  const openCreate = () => {
    setForm({ title: '', description: '' })
    setFormModal('create')
  }

  const openEdit = p => {
    setForm({ title: p.title, description: p.description || '' })
    setFormModal(p)
  }

  const submit = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    try {
      if (formModal === 'create') {
        await projectsApi.create(form)
        toast.success('Project created')
      } else {
        await projectsApi.update(formModal.id, form)
        toast.success('Project updated')
      }
      setFormModal(null)
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed')
    }
  }

  const del = async p => {
    if (!confirm(`Delete "${p.title}"? All tasks will be removed.`)) return
    try {
      await projectsApi.delete(p.id)
      toast.success('Project deleted')
      load()
    } catch { toast.error('Failed to delete') }
  }

  const addMember = async (projectId, userId) => {
    try {
      await projectsApi.addMember(projectId, parseInt(userId))
      toast.success('Member added')
      const updated = (await projectsApi.list({})).data.projects
      setProjects(updated)
      setManageModal(updated.find(p => p.id === projectId) || null)
    } catch (e) { toast.error(e.response?.data?.error || 'Already a member') }
  }

  const removeMember = async (projectId, userId) => {
    try {
      await projectsApi.removeMember(projectId, userId)
      toast.success('Member removed')
      const updated = (await projectsApi.list({})).data.projects
      setProjects(updated)
      setManageModal(updated.find(p => p.id === projectId) || null)
    } catch { toast.error('Failed') }
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div className="search-wrap" style={{ flex: 'none', width: 220 }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            placeholder="Search projects…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        {isAdmin && (
          <button className="btn btn-dark" style={{ marginLeft: 'auto' }} onClick={openCreate}>
            + New project
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? <Spinner /> : projects.length === 0
        ? <Empty icon="◻" text={isAdmin ? 'Create your first project' : 'No projects assigned to you'} />
        : (
          <div className="project-grid">
            {projects.map(p => (
              <div key={p.id} className="project-card">
                <div className="project-stripe" />
                <div className="project-name">{p.title}</div>
                <div className="project-desc">{p.description || 'No description provided.'}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div>
                    <MemberFaces members={p.members || []} />
                    <div className="label" style={{ marginTop: 4 }}>{p.task_count} tasks</div>
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="act-btn" onClick={() => setManageModal(p)}>Members</button>
                      <button className="act-btn" onClick={() => openEdit(p)}>Edit</button>
                      <button className="act-btn del" onClick={() => del(p)}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }

      {/* Create / Edit modal */}
      {formModal && (
        <Modal
          title={formModal === 'create' ? 'New project' : 'Edit project'}
          onClose={() => setFormModal(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setFormModal(null)}>Cancel</button>
            <button className="btn btn-dark" onClick={submit}>
              {formModal === 'create' ? 'Create' : 'Save changes'}
            </button>
          </>}>
          <div className="field">
            <label>Title *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Project name"
              autoFocus
            />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What is this project about?"
            />
          </div>
        </Modal>
      )}

      {/* Manage members modal */}
      {manageModal && (
        <Modal title={`Members — ${manageModal.title}`} onClose={() => setManageModal(null)}>
          <div style={{ marginBottom: 16 }}>
            {(manageModal.members || []).map((m, i) => (
              <div key={m.id} className="member-item">
                <div
                  style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: ['#0f0e0d','#3d5a3e','#1a4b7a','#b85c1a'][i % 4],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 500, color: '#faf8f5',
                  }}>
                  {initials(m.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)' }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{m.email}</div>
                </div>
                <span className={`chip chip-${m.role === 'admin' ? 'admin' : 'member'}`}>{m.role}</span>
                {isAdmin && m.id !== user.id && (
                  <button
                    className="act-btn del"
                    style={{ marginLeft: 8 }}
                    onClick={() => removeMember(manageModal.id, m.id)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          {isAdmin && (
            <>
              <div className="divider" />
              <div className="field">
                <label>Add member</label>
                <select
                  defaultValue=""
                  onChange={e => {
                    if (e.target.value) addMember(manageModal.id, e.target.value)
                    e.target.value = ''
                  }}>
                  <option value="">Select a person…</option>
                  {users
                    .filter(u => !(manageModal.members || []).find(m => m.id === u.id))
                    .map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))
                  }
                </select>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  )
}
