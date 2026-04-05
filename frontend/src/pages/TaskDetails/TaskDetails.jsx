import { useEffect, useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ArrowLeft, Calendar, Clock3, Gauge, Loader2 } from 'lucide-react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Sidebar from '../../components/Sidebar/Sidebar'
import Navbar from '../../components/Navbar/Navbar'
import { taskService } from '../../services/taskService'

const RISK_CLASS = { LOW: 'risk-badge-low', MEDIUM: 'risk-badge-medium', HIGH: 'risk-badge-high' }

export default function TaskDetails() {
  const navigate = useNavigate()
  const location = useLocation()
  const { taskId } = useParams()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [progressDraft, setProgressDraft] = useState(0)
  const openedFromDashboard = location.state?.source === 'dashboard'
  const backTarget = openedFromDashboard ? '/dashboard' : '/tasks/list'
  const currentProgress = Number(task?.progress || 0)

  useEffect(() => {
    taskService.getById(taskId)
      .then((data) => {
        setTask(data)
        setProgressDraft(Number(data.progress || 0))
      })
      .catch(() => {
        toast.error('Task not found')
        navigate(backTarget)
      })
      .finally(() => setLoading(false))
  }, [taskId, navigate, backTarget])

  const dueLabel = useMemo(() => {
    if (!task?.deadline) return 'No deadline'
    const dateLabel = format(parseISO(task.deadline), 'MMM d, yyyy')
    const timeLabel = task.deadline_time ? ` at ${String(task.deadline_time).slice(0, 5)}` : ''
    return `${dateLabel}${timeLabel}`
  }, [task])

  const quickMarks = [0, 25, 50, 75, 100]

  const handleSaveProgress = async () => {
    try {
      setSaving(true)
      const updated = await taskService.updateProgress(taskId, progressDraft)
      setTask(updated)
      setProgressDraft(Number(updated.progress || 0))
      toast.success('Progress updated')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update progress')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#312c51]">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(240,195,142,0.14),_transparent_30%),linear-gradient(180deg,_#312c51_0%,_#2a2643_100%)] px-6 pb-8 pt-20">
          <div className="mb-6">
            <Link
              to={backTarget}
              className="inline-flex items-center gap-2 rounded-full border border-[#6a648f] bg-[#3b355f] px-4 py-2 text-sm font-medium text-[#f4ebe1] transition-colors hover:bg-[#443d6b]"
            >
              <ArrowLeft size={15} />
              {openedFromDashboard ? 'Back to dashboard' : 'Back to tasks'}
            </Link>
          </div>

          {loading ? (
            <div className="card flex items-center gap-3 text-[#d6d0e4]">
              <Loader2 size={18} className="animate-spin" />
              Loading task details...
            </div>
          ) : task ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
              <section className="card border border-[#5b557d] bg-[#48426d]/88">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f0c38e]">Task Details</p>
                    <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#f6efe8]">{task.title}</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d6d0e4]">
                      {task.description || 'No description provided yet for this task.'}
                    </p>
                  </div>

                  {task.prediction?.risk_level && (
                    <span className={RISK_CLASS[task.prediction.risk_level]}>
                      {task.prediction.risk_level}
                    </span>
                  )}
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[22px] border border-[#625b86] bg-[#403a66] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#bfb7d6]">Status</p>
                    <p className="mt-2 text-lg font-semibold capitalize text-[#f6efe8]">{task.status?.replace('_', ' ')}</p>
                  </div>
                  <div className="rounded-[22px] border border-[#625b86] bg-[#403a66] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#bfb7d6]">Priority</p>
                    <p className="mt-2 text-lg font-semibold capitalize text-[#f6efe8]">{task.priority}</p>
                  </div>
                  <div className="rounded-[22px] border border-[#625b86] bg-[#403a66] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#bfb7d6]">Estimated Hours</p>
                    <p className="mt-2 text-lg font-semibold text-[#f6efe8]">{task.estimated_hours || '-'} hrs</p>
                  </div>
                  <div className="rounded-[22px] border border-[#625b86] bg-[#403a66] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#bfb7d6]">Due</p>
                    <p className="mt-2 text-lg font-semibold text-[#f6efe8]">{dueLabel}</p>
                  </div>
                </div>

                <div className="mt-8 rounded-[28px] border border-[#675f8d] bg-[linear-gradient(180deg,rgba(68,62,106,0.95),rgba(59,53,94,0.92))] p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f0c38e]">Progress</p>
                      <p className="mt-2 text-sm text-[#d6d0e4]">
                        Update how far this task has moved. Reaching 100% will mark it as done automatically.
                      </p>
                    </div>
                    <div className="rounded-full border border-[#7b739e] bg-[#312c51]/55 px-3 py-1 text-sm font-semibold text-[#f6efe8]">
                      {progressDraft}%
                    </div>
                  </div>

                  <div className="mb-4 h-3 overflow-hidden rounded-full bg-[#342f57]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#f0c38e_0%,#f1aa9b_100%)] transition-all"
                      style={{ width: `${progressDraft}%` }}
                    />
                  </div>

                  <input
                    type="range"
                    min={currentProgress}
                    max="100"
                    step="5"
                    value={progressDraft}
                    onChange={(event) => setProgressDraft(Math.max(currentProgress, Number(event.target.value)))}
                    disabled={task.status === 'done'}
                    className="w-full accent-[#f0c38e]"
                  />

                  <div className="mt-4 flex flex-wrap gap-2">
                    {quickMarks.map((mark) => (
                      <button
                        key={mark}
                        type="button"
                        disabled={task.status === 'done' || mark < currentProgress}
                        onClick={() => setProgressDraft(Math.max(mark, currentProgress))}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          progressDraft === mark
                            ? 'border-[#f0c38e] bg-[#f0c38e] text-[#312c51]'
                            : 'border-[#746d97] bg-[#403a66] text-[#e2dced] hover:border-[#f0c38e] hover:text-[#f6efe8]'
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {mark}%
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={handleSaveProgress}
                      disabled={saving || progressDraft === currentProgress}
                      className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving && <Loader2 size={15} className="animate-spin" />}
                      Save Progress
                    </button>
                    <button
                      onClick={() => navigate(`/tasks/${task.id}/edit`)}
                      disabled={openedFromDashboard}
                      className="btn-ghost disabled:cursor-not-allowed disabled:opacity-50"
                      title={openedFromDashboard ? 'Editing is disabled from dashboard recent tasks' : 'Edit task'}
                    >
                      Edit Task
                    </button>
                  </div>
                </div>
              </section>

              <aside className="space-y-4">
                <div className="card border border-[#5b557d] bg-[#48426d]/88">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5b547e] text-[#f0c38e]">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#bfb7d6]">Deadline</p>
                      <p className="mt-1 text-sm font-medium text-[#f6efe8]">{dueLabel}</p>
                    </div>
                  </div>
                </div>

                <div className="card border border-[#5b557d] bg-[#48426d]/88">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5b547e] text-[#f0c38e]">
                      <Clock3 size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#bfb7d6]">Created</p>
                      <p className="mt-1 text-sm font-medium text-[#f6efe8]">{format(new Date(task.created_at), 'MMM d, yyyy • hh:mm a')}</p>
                    </div>
                  </div>
                </div>

                <div className="card border border-[#5b557d] bg-[#48426d]/88">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5b547e] text-[#f0c38e]">
                      <Gauge size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#bfb7d6]">AI Suggestion</p>
                      <p className="mt-1 text-sm leading-6 text-[#f6efe8]">{task.prediction?.suggestion || 'No AI suggestion available for this task yet.'}</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
