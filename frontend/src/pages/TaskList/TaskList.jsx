import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '../../components/Sidebar/Sidebar'
import Navbar from '../../components/Navbar/Navbar'
import { taskService } from '../../services/taskService'

const RISK_CLASS = { LOW: 'risk-badge-low', MEDIUM: 'risk-badge-medium', HIGH: 'risk-badge-high' }

function getLocalDatePart(deadline) {
  const value = deadline ? new Date(deadline) : null
  if (!value || Number.isNaN(value.getTime())) return null

  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getTaskDueAt(task) {
  if (!task.deadline) return null
  const datePart = getLocalDatePart(task.deadline)
  if (!datePart) return null
  const timePart = task.deadline_time ? String(task.deadline_time).slice(0, 8) : '23:59:59'
  const value = new Date(`${datePart}T${timePart}`)
  return Number.isNaN(value.getTime()) ? null : value
}

function getTodayDate() {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now
}

function getWeekRange(baseDate) {
  const start = new Date(baseDate)
  const day = start.getDay()
  const distanceFromMonday = day === 0 ? 6 : day - 1
  start.setDate(start.getDate() - distanceFromMonday)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

function getMonthRange(baseDate) {
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
  start.setHours(0, 0, 0, 0)

  const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

function matchesTimeFilter(task, timeFilter) {
  if (timeFilter === 'all') return true

  const dueAt = getTaskDueAt(task)
  if (!dueAt) return false

  const today = getTodayDate()

  if (timeFilter === 'today') {
    return dueAt >= today && dueAt < new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  }

  if (timeFilter === 'week') {
    const { start, end } = getWeekRange(today)
    return dueAt >= start && dueAt <= end
  }

  if (timeFilter === 'month') {
    const { start, end } = getMonthRange(today)
    return dueAt >= start && dueAt <= end
  }

  return true
}

function sortTasksByDueDate(tasks) {
  return [...tasks].sort((left, right) => {
    const leftDueAt = getTaskDueAt(left)
    const rightDueAt = getTaskDueAt(right)

    if (leftDueAt && rightDueAt) return leftDueAt - rightDueAt
    if (leftDueAt) return -1
    if (rightDueAt) return 1

    const leftCreatedAt = left.created_at ? new Date(left.created_at).getTime() : 0
    const rightCreatedAt = right.created_at ? new Date(right.created_at).getTime() : 0
    return rightCreatedAt - leftCreatedAt
  })
}

const STATUS_OPTIONS = [
  { key: 'all', label: 'All Tasks' },
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
]

const TIME_OPTIONS = [
  { key: 'all', label: 'Everything' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
]

export default function TaskList() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')

  const load = () => {
    const params = statusFilter !== 'all' ? { status: statusFilter } : {}
    taskService.getAll(params)
      .then((data) => {
        const realTasks = data.tasks || []
        const filtered = realTasks.filter((task) => {
          const matchesStatus = statusFilter === 'all' || task.status === statusFilter
          const matchesTime = matchesTimeFilter(task, timeFilter)
          return matchesStatus && matchesTime
        })
        setTasks(sortTasksByDueDate(filtered))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [statusFilter, timeFilter])

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return

    try {
      await taskService.delete(id)
      setTasks((current) => current.filter((task) => task.id !== id))
      toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete task')
    }
  }

  return (
    <div className="flex min-h-screen bg-[#312c51]">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(240,195,142,0.12),_transparent_28%),linear-gradient(180deg,_#312c51_0%,_#2a2643_100%)] p-6 pt-20">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.04em] text-[#f6efe8]">All Tasks</h1>
              <p className="mt-2 text-sm text-[#c6bfdc]">Filter, review, and manage every task from one clean list.</p>
            </div>

            <Link to="/tasks/new" className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={16} /> New Task
            </Link>
          </div>

          <div className="mb-6 rounded-[28px] border border-[#6f6891] bg-[linear-gradient(180deg,rgba(78,71,121,0.98),rgba(65,59,104,0.96))] px-5 py-5 shadow-[0_20px_50px_rgba(17,13,32,0.18)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="inline-flex rounded-full border border-[#f0c38e]/30 bg-[#f0c38e]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ffdcae]">
                  Filter Tasks
                </div>
                <p className="mt-3 text-sm text-[#d5cfe3]">
                  Focus the list by status and time window. Tasks are ordered by the nearest due date.
                </p>
              </div>

              <div className="rounded-full border border-[#7c759e] bg-[#3e385f] px-4 py-2 text-sm font-medium text-[#f4ecfa] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} shown
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <label className="rounded-[24px] border border-[#726b95] bg-[linear-gradient(180deg,rgba(67,61,105,0.94),rgba(59,53,95,0.9))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#cfc7de]">Status</p>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="w-full appearance-none rounded-2xl border border-[#857ea7] bg-[#efe8f8] px-4 py-3 pr-12 text-sm font-semibold text-[#312c51] outline-none transition-all hover:border-[#f0c38e] focus:border-[#f0c38e] focus:bg-white"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#312c51]" />
                </div>
              </label>

              <label className="rounded-[24px] border border-[#726b95] bg-[linear-gradient(180deg,rgba(67,61,105,0.94),rgba(59,53,95,0.9))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#cfc7de]">Due Window</p>
                <div className="relative">
                  <select
                    value={timeFilter}
                    onChange={(event) => setTimeFilter(event.target.value)}
                    className="w-full appearance-none rounded-2xl border border-[#857ea7] bg-[#efe8f8] px-4 py-3 pr-12 text-sm font-semibold text-[#312c51] outline-none transition-all hover:border-[#f0c38e] focus:border-[#f0c38e] focus:bg-white"
                  >
                    {TIME_OPTIONS.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#312c51]" />
                </div>
              </label>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStatusFilter('all')
                    setTimeFilter('all')
                  }}
                  className="w-full rounded-2xl border border-[#f0c38e]/60 bg-[#f0c38e] px-5 py-3 text-sm font-semibold text-[#312c51] transition-all hover:bg-[#f6cca0] hover:shadow-[0_12px_24px_rgba(240,195,142,0.18)] lg:w-auto"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-[#c6bfdc]">Loading...</p>
          ) : (
            <div className="card overflow-hidden border border-[#5b557d] bg-[#48426d]/88 p-0">
              <table className="w-full text-sm">
                <thead className="border-b border-[#5b557d] bg-[#3d3762] text-xs uppercase tracking-[0.16em] text-[#c6bfdc]">
                  <tr>
                    <th className="px-5 py-4 text-left">Title</th>
                    <th className="px-5 py-4 text-left">Status</th>
                    <th className="px-5 py-4 text-left">Priority</th>
                    <th className="px-5 py-4 text-left">Deadline</th>
                    <th className="px-5 py-4 text-left">Created</th>
                    <th className="px-5 py-4 text-left">AI Risk</th>
                    <th className="px-5 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#5b557d]">
                  {tasks.map((task) => (
                    <tr key={task.id} className="transition-colors hover:bg-[#534d78]/45">
                      <td className="px-5 py-4 font-semibold text-[#f6efe8]">
                        <button
                          onClick={() => navigate(`/tasks/${task.id}`)}
                          className="text-left transition-colors hover:text-[#f0c38e]"
                        >
                          {task.title}
                        </button>
                      </td>
                      <td className="px-5 py-4 capitalize text-[#ddd5e8]">{task.status?.replace('_', ' ')}</td>
                      <td className="px-5 py-4 capitalize text-[#ddd5e8]">{task.priority}</td>
                      <td className="px-5 py-4 text-[#ddd5e8]">
                        {(() => {
                          if (!task.deadline) return '-'
                          const dueAt = getTaskDueAt(task)
                          const isOverdue = task.status !== 'done' && dueAt && dueAt < new Date()

                          return (
                            <div className="flex items-center gap-2">
                              <span>
                                {`${format(parseISO(task.deadline), 'MMM d, yyyy')}${task.deadline_time ? `, ${String(task.deadline_time).slice(0, 5)}` : ''}`}
                              </span>
                              {isOverdue && (
                                <span className="rounded-full border border-[#f1aa9b] bg-[#644861] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#ffe3dc]">
                                  Missed
                                </span>
                              )}
                            </div>
                          )
                        })()}
                      </td>
                      <td className="px-5 py-4 text-[#ddd5e8]">
                        {task.created_at
                          ? format(new Date(task.created_at), 'MMM d, yyyy • hh:mm a')
                          : '-'}
                      </td>
                      <td className="px-5 py-4">
                        {task.prediction?.risk_level
                          ? <span className={RISK_CLASS[task.prediction.risk_level]}>{task.prediction.risk_level}</span>
                          : <span className="text-xs text-[#968fb1]">-</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/tasks/${task.id}/edit`)}
                            className="rounded-lg p-1.5 text-[#c6bfdc] transition-colors hover:bg-[#5a547d] hover:text-[#f0c38e]"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="rounded-lg p-1.5 text-[#c6bfdc] transition-colors hover:bg-[#644861] hover:text-[#f1aa9b]"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-[#c6bfdc]">
                        No tasks found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
