import api from './api'

export const taskService = {
  getAll:    (params)    => api.get('/tasks', { params }).then(r => r.data),
  getById:   (id)        => api.get(`/tasks/${id}`).then(r => r.data),
  create:    (payload)   => api.post('/tasks', payload).then(r => r.data),
  update:    (id, data)  => api.put(`/tasks/${id}`, data).then(r => r.data),
  delete:    (id)        => api.delete(`/tasks/${id}`).then(r => r.data),
  updateProgress: (id, progress) => api.patch(`/tasks/${id}/progress`, { progress }).then(r => r.data),
  getPrediction:  (id)   => api.get(`/tasks/${id}/prediction`).then(r => r.data),
  getBreakdown:   (id)   => api.get(`/tasks/${id}/breakdown`).then(r => r.data),
  getDueReminders: ()    => api.get('/tasks/reminders/due').then(r => r.data),
  getDeadlineRescue: ()  => api.get('/tasks/deadline-rescue').then(r => r.data),
  getProcrastinationAlerts: () => api.get('/tasks/procrastination-alerts').then(r => r.data),
  getPriorityRecommendation: () => api.get('/tasks/priority-recommendation').then(r => r.data),
}
