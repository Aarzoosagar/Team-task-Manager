import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth }  from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { authApi }  from '../api/services'

export default function LoginPage() {
  const [tab, setTab]     = useState('in')
  const [form, setForm]   = useState({ name: '', email: '', password: '', role: 'member' })
  const [err, setErr]     = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const toast     = useToast()
  const navigate  = useNavigate()

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErr('') }

  const validate = () => {
    if (tab === 'up' && !form.name.trim()) return 'Name is required'
    if (!form.email.trim())               return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email'
    if (!form.password)                   return 'Password is required'
    if (form.password.length < 6)         return 'Password must be at least 6 characters'
    return null
  }

  const submit = async () => {
    const err = validate()
    if (err) { setErr(err); return }
    setLoading(true)
    try {
      let res
      if (tab === 'in') {
        res = await authApi.login(form.email, form.password)
      } else {
        res = await authApi.signup(form.name, form.email, form.password, form.role)
        toast.success('Account created')
      }
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (e) {
      setErr(e.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const switchTab = t => {
    setTab(t)
    setErr('')
    setForm({ name: '', email: '', password: '', role: 'member' })
  }

  return (
    <div className="auth-screen">
      <div className="auth-box">

        {/* Logo */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ marginBottom: 4 }}>Team Task Manager</h1>
          <p style={{ fontSize: 12, color: 'var(--ink-3)' }}>
            Project & task management for focused teams
          </p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          {[['in', 'Sign in'], ['up', 'Create account']].map(([k, label]) => (
            <button
              key={k}
              className={`auth-tab${tab === k ? ' active' : ''}`}
              onClick={() => switchTab(k)}>
              {label}
            </button>
          ))}
        </div>

        {/* Error */}
        {err && <div className="error-banner">{err}</div>}

        {/* Fields */}
        {tab === 'up' && (
          <div className="field">
            <label>Full name</label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Your full name"
              autoFocus
            />
          </div>
        )}

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="you@example.com"
            autoFocus={tab === 'in'}
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={e => set('password', e.target.value)}
            placeholder="Min. 6 characters"
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        </div>

        {tab === 'up' && (
          <div className="field">
            <label>Role</label>
            <select value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}

        <button
          className="btn btn-dark"
          style={{ width: '100%', padding: '10px 14px', marginTop: 4 }}
          onClick={submit}
          disabled={loading}>
          {loading ? '…' : tab === 'in' ? 'Sign in →' : 'Create account →'}
        </button>

        

      </div>
    </div>
  )
}
