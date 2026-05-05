import api from './axios'

export const authApi = {
  login:  (email, password)           => api.post('/auth/login',  { email, password }),
  signup: (name, email, password, role) => api.post('/auth/signup', { name, email, password, role }),
  me:     ()                          => api.get('/auth/me'),
}

export const projectsApi = {
  list:         (params = {})     => api.get('/projects/',           { params }),
  get:          id                => api.get(`/projects/${id}`),
  create:       data              => api.post('/projects/',          data),
  update:       (id, data)        => api.put(`/projects/${id}`,      data),
  delete:       id                => api.delete(`/projects/${id}`),
  addMember:    (id, user_id)     => api.post(`/projects/${id}/members`,         { user_id }),
  removeMember: (id, user_id)     => api.delete(`/projects/${id}/members/${user_id}`),
}

export const tasksApi = {
  list:   (params = {}) => api.get('/tasks/',       { params }),
  stats:  ()            => api.get('/tasks/stats'),
  create: data          => api.post('/tasks/',      data),
  update: (id, data)    => api.put(`/tasks/${id}`,  data),
  delete: id            => api.delete(`/tasks/${id}`),
}

export const usersApi = {
  list: () => api.get('/users/'),
}
