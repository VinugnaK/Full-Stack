import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout/Layout'
import { taskService } from '../../services/taskService'
import { CompletionBarChart, ProductivityLineChart, RiskPieChart } from '../../components/Charts/Charts'

const PERIODS = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' }
]

export default function Analytics() {
  const [period, setPeriod] = useState('weekly')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const result = await taskService.getAnalytics(period)
        setData(result)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [period])

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Track your productivity and task insights</p>
          </div>
          <div className="flex gap-2">
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === p.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card h-72 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : (
          <>
            {/* Summary row */}
            {data?.summary && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Completed', value: data.summary.completed },
                  { label: 'Overdue', value: data.summary.overdue },
                  { label: 'On Time %', value: `${data.summary.on_time_rate || 0}%` },
                  { label: 'Productivity', value: `${data.summary.productivity_score || 0}%` }
                ].map(s => (
                  <div key={s.label} className="card text-center">
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-4">Task Completion</h2>
                {data?.chart_data ? <CompletionBarChart data={data.chart_data} /> :
                  <p className="text-gray-400 text-sm text-center py-10">No data</p>}
              </div>

              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-4">Productivity Trend</h2>
                {data?.productivity_data ? <ProductivityLineChart data={data.productivity_data} /> :
                  <p className="text-gray-400 text-sm text-center py-10">No data</p>}
              </div>

              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-4">Risk Distribution</h2>
                {data?.risk_distribution ? <RiskPieChart data={data.risk_distribution} /> :
                  <p className="text-gray-400 text-sm text-center py-10">No data</p>}
              </div>

              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-4">📊 Insights</h2>
                {data?.insight ? (
                  <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700">
                    {data.insight}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Complete more tasks to unlock insights.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
