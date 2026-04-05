import api from './api'

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    return res.data
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData)
    return res.data
  },

  getProfile: async () => {
    const res = await api.get('/users/profile')
    return res.data
  },

  updateProfile: async (data) => {
    const res = await api.put('/users/profile', data)
    return res.data
  }
}
