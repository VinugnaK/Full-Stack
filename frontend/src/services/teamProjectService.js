import api from './api'

export const teamProjectService = {
  getOverview: () => api.get('/team-projects').then(res => res.data),
  getProject: projectId => api.get(`/team-projects/${projectId}`).then(res => res.data),
  createProject: payload => api.post('/team-projects', payload).then(res => res.data),
  deleteProject: projectId => api.delete(`/team-projects/${projectId}`).then(res => res.data),
  inviteMembers: (projectId, inviteEmails) =>
    api.post(`/team-projects/${projectId}/invitations`, { inviteEmails }).then(res => res.data),
  respondToInvitation: (invitationId, action) =>
    api.post(`/team-projects/invitations/${invitationId}/respond`, { action }).then(res => res.data),
  createTask: (projectId, payload) =>
    api.post(`/team-projects/${projectId}/tasks`, payload).then(res => res.data),
  updateTask: (projectId, taskId, payload) =>
    api.put(`/team-projects/${projectId}/tasks/${taskId}`, payload).then(res => res.data),
  deleteTask: (projectId, taskId) =>
    api.delete(`/team-projects/${projectId}/tasks/${taskId}`).then(res => res.data),
  getNotifications: params =>
    api.get('/team-projects/notifications', { params }).then(res => res.data),
}
