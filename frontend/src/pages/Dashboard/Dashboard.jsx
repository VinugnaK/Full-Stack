import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock, Siren, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Sidebar from '../../components/Sidebar/Sidebar'
import Navbar from '../../components/Navbar/Navbar'
import TaskCard from '../../components/TaskCard/TaskCard'
import { taskService } from '../../services/taskService'
import { analyticsService } from '../../services/analyticsService'
import { useAuth } from '../../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [summary, setSummary] = useState(null)
  const [chartData, setChartData] = useState([])
  const [rescueTasks, setRescueTasks] = useState([])
  const [procrastinationAlerts, setProcrastinationAlerts] = useState([])
  const [priorityRecommendation, setPriorityRecommendation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actioningTaskId, setActioningTaskId] = useState(null)
  const [breakdownModal, setBreakdownModal] = useState(null)

  const loadDashboard = () =>
    Promise.all([
      taskService.getAll({ limit: 6, sort: 'deadline' }),
      analyticsService.getSummary(),
      analyticsService.getWeekly(),
      taskService.getDeadlineRescue(),
      taskService.getProcrastinationAlerts(),
      taskService.getPriorityRecommendation(),
    ])
      .then(([taskResponse, summaryResponse, weeklyResponse, rescueResponse, procrastinationResponse, priorityResponse]) => {
        setTasks(taskResponse.tasks || [])
        setSummary(summaryResponse)
        setChartData(weeklyResponse.chart || [])
        setRescueTasks(rescueResponse.rescueTasks || [])
        setProcrastinationAlerts(procrastinationResponse.alerts || [])
        setPriorityRecommendation(priorityResponse.recommendation || null)
      })

  useEffect(() => {
    loadDashboard().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!breakdownModal) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [breakdownModal])

  const refreshDashboard = async () => {
    await loadDashboard()
  }

  const handleSuggestionClick = async (taskId, suggestion, context = {}) => {
    const normalized = suggestion.toLowerCase()

    if (normalized.includes('break task') || normalized.includes('cut the task')) {
      try {
        setActioningTaskId(taskId)
        const breakdown = await taskService.getBreakdown(taskId)
        setBreakdownModal(breakdown)
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to generate task breakdown')
      } finally {
        setActioningTaskId(null)
      }
      return
    }

    if (normalized.includes('extend deadline')) {
      navigate(`/tasks/${taskId}/edit`)
      return
    }

    try {
      setActioningTaskId(taskId)

      if (normalized.includes('finish 20')) {
        const nextProgress = Math.min(100, Math.max(Number(context.progress || 0), 20))
        await taskService.update(taskId, {
          status: nextProgress >= 100 ? 'done' : 'in_progress',
          progress: nextProgress,
        })
        toast.success('Task progress updated')
      } else if (normalized.includes('start now') || normalized.includes('focus sprint')) {
        const nextProgress = Math.max(Number(context.progress || 0), 10)
        await taskService.update(taskId, {
          status: nextProgress >= 100 ? 'done' : 'in_progress',
          progress: nextProgress,
        })
        toast.success('Task moved into focus mode')
      } else {
        navigate(`/tasks/${taskId}/edit`)
        return
      }

      await refreshDashboard()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply task action')
    } finally {
      setActioningTaskId(null)
    }
  }

  const stats = [
    {
      label: 'Total Tasks',
      value: summary?.total_tasks || 0,
      icon: Clock,
      iconClass: 'bg-[#5a547d] text-[#f0c38e]',
    },
    {
      label: 'Completed',
      value: summary?.completed || 0,
      icon: CheckCircle2,
      iconClass: 'bg-[#5b647f] text-[#d6f5dc]',
    },
    {
      label: 'High Risk',
      value: summary?.high_risk || 0,
      icon: AlertTriangle,
      iconClass: 'bg-[#69516e] text-[#f1aa9b]',
    },
    {
      label: 'Overdue',
      value: summary?.overdue || 0,
      icon: Siren,
      iconClass: 'bg-[#69516e] text-[#f1aa9b]',
    },
    {
      label: 'Productivity',
      value: `${summary?.productivity_score || 0}%`,
      icon: TrendingUp,
      iconClass: 'bg-[#5a547d] text-[#f0c38e]',
    },
  ]

  const getRescueTone = (urgency) => {
    if (urgency === 'high') {
      return {
        card: 'border-[#f1aa9b]/70 bg-[linear-gradient(180deg,_rgba(100,72,97,0.94),_rgba(86,61,89,0.9))]',
        accent: 'bg-[#f1aa9b] text-[#3e2840]',
        chip: 'border-[#d59ba5] bg-[#59405f] text-[#fff1f3]',
      }
    }

    if (urgency === 'medium') {
      return {
        card: 'border-[#f0c38e]/70 bg-[linear-gradient(180deg,_rgba(90,79,104,0.94),_rgba(78,68,94,0.9))]',
        accent: 'bg-[#f0c38e] text-[#392f47]',
        chip: 'border-[#dfb585] bg-[#564968] text-[#fff4e4]',
      }
    }

    return {
      card: 'border-[#9ba8f2]/65 bg-[linear-gradient(180deg,_rgba(76,82,118,0.94),_rgba(64,69,101,0.9))]',
      accent: 'bg-[#aeb8ff] text-[#2f355b]',
      chip: 'border-[#919ce2] bg-[#475078] text-[#eef1ff]',
    }
  }

  return (
    <div className="flex min-h-screen bg-[#312c51]">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(240,195,142,0.14),_transparent_30%),linear-gradient(180deg,_#312c51_0%,_#2a2643_100%)] px-6 pb-8 pt-20">
          <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center rounded-full border border-[#6a638e] bg-[#48426d] px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0c38e]">
                Smart Task Command Center
              </span>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] text-[#f6efe8]">
                Good morning, {user?.name?.split(' ')[0]}
                <span className="text-[#f0c38e]">.</span>
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-[#c6bfdc]">
                See what needs attention, what is slipping, and what deserves your focus first without digging through every list.
              </p>
            </div>
            <div className="rounded-[28px] border border-[#5b557d] bg-[#48426d]/90 px-5 py-4 shadow-[0_24px_60px_rgba(11,9,24,0.32)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f0c38e]">Today&apos;s focus</p>
              <p className="mt-2 text-base font-semibold text-[#f6efe8]">
                {priorityRecommendation?.title || 'Keep your active tasks moving forward'}
              </p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-5">
            {stats.map(({ label, value, icon: Icon, iconClass }) => (
              <div key={label} className="card border border-[#5b557d] bg-[#48426d]/88">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-3xl font-black tracking-[-0.03em] text-[#f6efe8]">{value}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#c6bfdc]">{label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card mb-6 border border-[#5b557d] bg-[#48426d]/88">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#f6efe8]">AI Priority Recommendation</h2>
              <p className="mt-2 text-sm text-[#c6bfdc]">
                When you do not know what to do first, let the app pick the most important active task.
              </p>
            </div>

            {priorityRecommendation ? (
              <div className="rounded-[28px] border border-[#6a638e] bg-[linear-gradient(135deg,_#3a3560_0%,_#48426d_100%)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f0c38e]">Start this task first</p>
                <p className="mt-3 text-2xl font-black tracking-[-0.03em] text-[#f6efe8]">
                  {priorityRecommendation.title}
                </p>
                <p className="mt-3 text-sm text-[#f1aa9b]">Reason: {priorityRecommendation.reason}</p>
                <p className="mt-4 text-base leading-7 text-[#ece3f3]">
                  {priorityRecommendation.suggestion}
                </p>
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-[#6a638e] bg-[#3d3762] px-4 py-8 text-center text-sm text-[#c6bfdc]">
                No active task needs a first-priority recommendation right now.
              </div>
            )}
          </div>

          <div className="card mb-6 border border-[#5b557d] bg-[#48426d]/88">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-[#f6efe8]">Deadline Rescue System</h2>
              <p className="mt-2 text-sm text-[#c6bfdc]">
                Rescue tasks that are falling behind before they turn into missed deadlines.
              </p>
            </div>

            {rescueTasks.length ? (
              <div className="grid gap-5 xl:grid-cols-2">
                {rescueTasks.map((task) => {
                  const tone = getRescueTone(task.urgency)

                  return (
                    <div
                      key={task.task_id}
                      className={`rounded-[28px] border p-6 shadow-[0_20px_48px_rgba(13,10,28,0.2)] transition-transform duration-200 hover:-translate-y-0.5 ${tone.card}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="max-w-[80%]">
                          <p className="text-[1.55rem] font-black leading-tight tracking-[-0.03em] text-[#f6efe8]">
                            {task.title}
                          </p>
                          <p className="mt-3 text-sm leading-7 text-[#f2ebf7]">{task.message}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${tone.accent}`}>
                          {task.behind_percent}% behind
                        </span>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2.5">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.chip}`}>
                          Progress {task.progress}%
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.chip}`}>
                          Expected {task.expected_progress}%
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tone.chip}`}>
                          {task.time_left} left
                        </span>
                      </div>

                      <div className="mt-5 border-t border-white/10 pt-4">
                        <div className="flex flex-wrap gap-2.5">
                          {task.suggestions
                            .filter((suggestion) => !suggestion.toLowerCase().includes('start now'))
                            .map((suggestion) => (
                            <button
                              key={`${task.task_id}-${suggestion}`}
                              type="button"
                              onClick={() => handleSuggestionClick(task.task_id, suggestion, { progress: task.progress })}
                              disabled={actioningTaskId === task.task_id}
                              className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                suggestion.toLowerCase().includes('start now')
                                  ? 'bg-[#f0c38e] text-[#2c2547] shadow-[0_10px_24px_rgba(240,195,142,0.18)] hover:bg-[#e7b778]'
                                  : 'border border-[#8c85ad] bg-[#312c51]/45 text-[#f4ecfb] hover:border-[#f0c38e] hover:bg-[#312c51]/70'
                              }`}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-[#6a638e] bg-[#3d3762] px-4 py-8 text-center text-sm text-[#c6bfdc]">
                No rescue alerts right now. Your active tasks are on track.
              </div>
            )}
          </div>

          <div className="card mb-6 border border-[#5b557d] bg-[#48426d]/88">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-[#f6efe8]">Procrastination Detection</h2>
              <p className="mt-2 text-sm text-[#c6bfdc]">
                Detect repeated postpones and nudge yourself back into motion before the pattern grows.
              </p>
            </div>

            {procrastinationAlerts.length ? (
              <div className="grid gap-5 xl:grid-cols-2">
                {procrastinationAlerts.map((alert) => (
                  <div
                    key={alert.task_id}
                    className="rounded-[28px] border border-[#f1aa9b]/70 bg-[linear-gradient(180deg,_rgba(100,72,97,0.94),_rgba(86,61,89,0.9))] p-6 shadow-[0_20px_48px_rgba(13,10,28,0.2)] transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="max-w-[80%]">
                        <p className="text-[1.55rem] font-black leading-tight tracking-[-0.03em] text-[#f6efe8]">
                          {alert.title}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#f8eef4]">{alert.message}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#312c51]/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#f6efe8]">
                        Pattern detected
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2.5">
                      <span className="rounded-full border border-[#d69cab] bg-[#5a4060] px-3 py-1 text-xs font-semibold text-[#fff2f5]">
                        Postponed {alert.postpone_count} times
                      </span>
                    </div>

                    <div className="mt-5 border-t border-white/10 pt-4">
                      <div className="flex flex-wrap gap-2.5">
                        {alert.suggestions
                          .filter((suggestion) => !suggestion.toLowerCase().includes('start now'))
                          .map((suggestion) => (
                          <button
                            key={`${alert.task_id}-${suggestion}`}
                            type="button"
                            onClick={() => handleSuggestionClick(alert.task_id, suggestion)}
                            disabled={actioningTaskId === alert.task_id}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              suggestion.toLowerCase().includes('start now') || suggestion.toLowerCase().includes('finish 20')
                                ? 'bg-[#f0c38e] text-[#2c2547] shadow-[0_10px_24px_rgba(240,195,142,0.18)] hover:bg-[#e7b778]'
                                : 'border border-[#c697ae] bg-[#312c51]/45 text-[#f7edf2] hover:border-[#f0c38e] hover:bg-[#312c51]/70'
                            }`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-[#6a638e] bg-[#3d3762] px-4 py-8 text-center text-sm text-[#c6bfdc]">
                No procrastination pattern detected right now.
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-4 text-lg font-bold text-[#f6efe8]">Recent Tasks</h2>
            {loading ? (
              <p className="text-sm text-[#c6bfdc]">Loading...</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    showProgress
                    onClick={() => navigate(`/tasks/${task.id}`, { state: { source: 'dashboard' } })}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      {breakdownModal ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#120f1e]/70 p-4 backdrop-blur-sm">
          <div className="mx-auto my-6 w-full max-w-3xl rounded-[32px] border border-[#665e8d] bg-[linear-gradient(180deg,_rgba(72,66,109,0.98),_rgba(53,48,81,0.98))] p-6 shadow-[0_30px_90px_rgba(8,6,20,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f0c38e]">Task Breakdown</p>
                <h3 className="mt-3 text-3xl font-black tracking-[-0.03em] text-[#f6efe8]">
                  {breakdownModal.title}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d7cfe5]">
                  {breakdownModal.summary}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBreakdownModal(null)}
                className="rounded-full border border-[#736b99] bg-[#312c51]/60 px-4 py-2 text-sm font-semibold text-[#f4ecfb] transition hover:border-[#f0c38e] hover:bg-[#312c51]"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid max-h-[calc(100vh-14rem)] gap-4 overflow-y-auto pr-2">
              {breakdownModal.steps?.map((step) => (
                <div key={`${breakdownModal.taskId}-${step.order}`} className="rounded-[24px] border border-[#6b638f] bg-[#3d3762]/85 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f0c38e]">
                        Step {step.order}
                      </p>
                      <p className="mt-2 text-lg font-bold text-[#f6efe8]">{step.title}</p>
                    </div>
                    <span className="rounded-full border border-[#8b84ab] bg-[#312c51]/45 px-3 py-1 text-xs font-semibold text-[#f4ecfb]">
                      ~{step.estimate_hours} hrs
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#ddd5e8]">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
