import api from './api'

export const authService = {
  login:    (email, password)  => api.post('/auth/login', { email, password }).then(r => r.data),
  register: (payload)          => api.post('/auth/register', payload).then(r => r.data),
  requestRegistrationOtp: (payload) => api.post('/auth/register/request-otp', payload).then(r => r.data),
  verifyRegistrationOtp: ({ email, otp }) => api.post('/auth/register/verify-otp', { email, otp }).then(r => r.data),
  requestPasswordReset: (email) => api.post('/auth/forgot-password', { email }).then(r => r.data),
  resetPassword: ({ email, otp, password }) => api.post('/auth/reset-password', { email, otp, password }).then(r => r.data),
  getMe:    ()                 => api.get('/auth/me').then(r => r.data),
  updateProfile: (payload)     => api.put('/auth/profile', payload).then(r => r.data),
}
