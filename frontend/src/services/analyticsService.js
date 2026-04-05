import api from './api'

export const analyticsService = {
  getWeekly:    ()     => api.get('/analytics/weekly').then(r => r.data),
  getMonthly:   ()     => api.get('/analytics/monthly').then(r => r.data),
  getYearly:    ()     => api.get('/analytics/yearly').then(r => r.data),
  getSummary:   ()     => api.get('/analytics/summary').then(r => r.data),
  getBurnout:   ()     => api.get('/analytics/burnout').then(r => r.data),
  getProductivity: ()  => api.get('/analytics/productivity').then(r => r.data),
}
