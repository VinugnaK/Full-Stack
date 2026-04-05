import api from './api'

export const taskService = {
  getAll: async (params = {}) => {
    const res = await api.get('/tasks', { params })
    return res.data
  },

  getById: async (id) => {
    const res = await api.get(`/tasks/${id}`)
    return res.data
  },

  create: async (taskData) => {
    const res = await api.post('/tasks', taskData)
    return res.data
  },

  update: async (id, taskData) => {
    const res = await api.put(`/tasks/${id}`, taskData)
    return res.data
  },

  updateProgress: async (id, progress) => {
    const res = await api.patch(`/tasks/${id}/progress`, { progress })
    return res.data
  },

  delete: async (id) => {
    const res = await api.delete(`/tasks/${id}`)
    return res.data
  },

  getAnalytics: async (period = 'weekly') => {
    const res = await api.get(`/analytics?period=${period}`)
    return res.data
  },

  getRisk: async (id) => {
    const res = await api.get(`/tasks/${id}/risk`)
    return res.data
  }
}
