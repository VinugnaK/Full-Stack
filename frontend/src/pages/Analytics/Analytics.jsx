import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar/Sidebar'
import Navbar from '../../components/Navbar/Navbar'
import {
  ProductivityChart,
  RiskDistributionChart,
  TaskCompletionChart,
  WorkloadChart,
} from '../../components/Charts/Charts'
import { analyticsService } from '../../services/analyticsService'

const TABS = ['weekly', 'monthly', 'yearly']

export default function Analytics() {
  const [tab, setTab] = useState('weekly')
  const [data, setData] = useState({})
  const [burnout, setBurnout] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const fetchAnalytics = tab === 'weekly'
      ? analyticsService.getWeekly
      : tab === 'monthly'
        ? analyticsService.getMonthly
        : analyticsService.getYearly

    Promise.all([fetchAnalytics(), analyticsService.getBurnout(), analyticsService.getProductivity()])
      .then(([analytics, burnoutData, productivity]) => {
        setData({ ...analytics, productivity: productivity.chart || [] })
        setBurnout(burnoutData)
      })
      .finally(() => setLoading(false))
  }, [tab])

  return (
    <div className="flex min-h-screen bg-[#312c51]">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(240,195,142,0.12),_transparent_28%),linear-gradient(180deg,_#312c51_0%,_#2a2643_100%)] p-6 pt-20">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.04em] text-[#f6efe8]">Analytics</h1>
              <p className="mt-2 text-sm text-[#c6bfdc]">See completion trends, workload, productivity, and risk in one place.</p>
            </div>

            <div className="flex gap-2">
              {TABS.map((item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    tab === item ? 'bg-[#f0c38e] text-[#312c51]' : 'bg-[#48426d] text-[#ddd5e8] hover:bg-[#5a547d]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-[#c6bfdc]">Loading analytics...</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="card border border-[#5b557d] bg-[#48426d]/88">
                <h2 className="mb-4 text-lg font-bold text-[#f6efe8]">Task Completion</h2>
                <TaskCompletionChart data={data.chart || []} />
              </div>

              <div className="card border border-[#5b557d] bg-[#48426d]/88">
                <h2 className="mb-1 text-lg font-bold text-[#f6efe8]">Daily Workload</h2>
                <p className="mb-4 text-sm text-[#c6bfdc]">Rolling 7-day view from yesterday, based on task count and estimated hours.</p>
                <WorkloadChart data={data.workload || []} />
              </div>

              <div className="card border border-[#5b557d] bg-[#48426d]/88">
                <h2 className="mb-4 text-lg font-bold text-[#f6efe8]">Productivity Score</h2>
                <ProductivityChart data={data.productivity || []} />
              </div>

              <div className="card border border-[#5b557d] bg-[#48426d]/88">
                <h2 className="mb-4 text-lg font-bold text-[#f6efe8]">Risk Distribution</h2>
                <RiskDistributionChart
                  data={[
                    { name: 'Low', value: data.low_risk || 0 },
                    { name: 'Medium', value: data.medium_risk || 0 },
                    { name: 'High', value: data.high_risk || 0 },
                  ]}
                />
              </div>

              {burnout && (
                <div className="card border border-[#5b557d] bg-[#48426d]/88 lg:col-span-2">
                  <h2 className="mb-3 text-lg font-bold text-[#f6efe8]">Burnout Detection</h2>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-3xl font-black text-[#f6efe8]">{burnout.score}%</p>
                      <p className="mt-0.5 text-xs text-[#c6bfdc]">Burnout Risk Score</p>
                    </div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#312c51]/70">
                      <div
                        className={`h-full rounded-full transition-all ${
                          burnout.score < 40 ? 'bg-green-500' : burnout.score < 70 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${burnout.score}%` }}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        burnout.score < 40 ? 'text-green-500' : burnout.score < 70 ? 'text-amber-500' : 'text-red-500'
                      }`}
                    >
                      {burnout.level}
                    </span>
                  </div>

                  {burnout.suggestion && (
                    <p className="mt-3 border-t border-[#5b557d] pt-3 text-xs text-[#c6bfdc]">{burnout.suggestion}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
