import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout/Layout'
import { taskService } from '../../services/taskService'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import { CheckCircle, AlertTriangle, Clock, TrendingUp, PlusCircle } from 'lucide-react'
import { CompletionBarChart } from '../../components/Charts/Charts'

export default function Dashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, analyticsData] = await Promise.all([
          taskService.getAll({ limit: 5, status: 'active' }),
          taskService.getAnalytics('weekly')
        ])
        setTasks(tasksData.tasks || [])
        setAnalytics(analyticsData)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const stats = analytics?.summary || {}
  const highRiskTasks = tasks.filter(t => t.risk?.risk_level === 'HIGH')

  const statCards = [
    { label: 'Total Tasks', value: stats.total || 0, icon: Clock, color: 'blue' },
    { label: 'Completed', value: stats.completed || 0, icon: CheckCircle, color: 'green' },
    { label: 'Overdue', value: stats.overdue || 0, icon: AlertTriangle, color: 'red' },
    { label: 'Productivity', value: `${stats.productivity_score || 0}%`, icon: TrendingUp, color: 'purple' }
  ]

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Greeting */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">Here's what's happening with your tasks today.</p>
          </div>
          <Link to="/tasks/create" className="btn-primary flex items-center gap-2 hidden sm:flex">
            <PlusCircle size={18} /> New Task
          </Link>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse h-24 bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
                    <Icon size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 card">
            <h2 className="font-semibold text-gray-900 mb-4">Weekly Overview</h2>
            {analytics?.chart_data ? (
              <CompletionBarChart data={analytics.chart_data} />
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No chart data yet</div>
            )}
          </div>

          {/* High risk tasks */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" /> High Risk Tasks
            </h2>
            {highRiskTasks.length === 0 ? (
              <p className="text-sm text-gray-400">No high risk tasks. Great job!</p>
            ) : (
              <ul className="space-y-3">
                {highRiskTasks.map(task => (
                  <li key={task.id} className="text-sm">
                    <p className="font-medium text-gray-800 truncate">{task.title}</p>
                    <p className="text-xs text-red-500 mt-0.5">
                      {task.risk?.probability
                        ? `${Math.round(task.risk.probability * 100)}% overrun probability`
                        : 'High risk detected'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Weekly Insight */}
        {analytics?.insight && (
          <div className="mt-6 card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
            <p className="text-xs font-semibold text-blue-600 mb-1">📊 Weekly Insight</p>
            <p className="text-sm text-gray-700">{analytics.insight}</p>
          </div>
        )}
      </div>
    </Layout>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
