import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '../../components/Sidebar/Sidebar'
import Navbar from '../../components/Navbar/Navbar'
import { taskService } from '../../services/taskService'
import { useAuth } from '../../context/AuthContext'

function getLocalDate(offsetDays = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getCurrentTimePlusMinutes(minutes = 15) {
  const now = new Date()
  now.setMinutes(now.getMinutes() + minutes)
  const hours = String(now.getHours()).padStart(2, '0')
  const mins = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${mins}`
}

function getAvailableHours(deadline, deadlineTime, workHoursPerDay) {
  if (!deadline) return null

  const now = new Date()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const selectedDeadline = new Date(`${deadline}T00:00:00`)
  if (Number.isNaN(selectedDeadline.getTime()) || selectedDeadline < today) return null

  if (deadline === getLocalDate()) {
    if (!deadlineTime) return null
    const todayDeadline = new Date(`${deadline}T${deadlineTime}:00`)
    if (Number.isNaN(todayDeadline.getTime()) || todayDeadline <= now) return null
    return Number(((todayDeadline - now) / (1000 * 60 * 60)).toFixed(1))
  }

  const dayMs = 1000 * 60 * 60 * 24
  const availableDays = Math.ceil((selectedDeadline - today) / dayMs)
  return availableDays * Number(workHoursPerDay || 8)
}

export default function CreateTask() {
  const navigate = useNavigate()
  const { taskId } = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [loadingTask, setLoadingTask] = useState(Boolean(taskId))
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    deadline: getLocalDate(1),
    deadline_time: '',
    estimated_hours: '',
  })

  const isEditMode = Boolean(taskId)
  const todayDate = useMemo(() => getLocalDate(), [])
  const availableHours = getAvailableHours(form.deadline, form.deadline_time, user?.work_hours_per_day)

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  useEffect(() => {
    if (!taskId) return

    let active = true
    setLoadingTask(true)

    taskService.getById(taskId)
      .then((task) => {
        if (!active) return
        setForm({
          title: task.title || '',
          description: task.description || '',
          priority: task.priority || 'medium',
          status: task.status || 'todo',
          deadline: task.deadline ? String(task.deadline).split('T')[0] : getLocalDate(),
          deadline_time: task.deadline_time ? String(task.deadline_time).slice(0, 5) : '',
          estimated_hours: task.estimated_hours ?? '',
        })
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Failed to load task')
        navigate('/tasks/list')
      })
      .finally(() => {
        if (active) setLoadingTask(false)
      })

    return () => {
      active = false
    }
  }, [taskId, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (form.deadline < todayDate) {
      toast.error('Deadline cannot be in the past')
      return
    }

    if (form.deadline === todayDate && !form.deadline_time) {
      toast.error('For today tasks, please select a deadline time')
      return
    }

    if (form.deadline === todayDate && form.deadline_time && form.deadline_time <= getCurrentTimePlusMinutes(0)) {
      toast.error('For today tasks, deadline time must be later than now')
      return
    }

    if (form.estimated_hours) {
      const estimatedHours = Number(form.estimated_hours)
      if (!Number.isFinite(estimatedHours) || estimatedHours <= 0) {
        toast.error('Estimated hours must be greater than 0')
        return
      }
      if (availableHours !== null && estimatedHours > availableHours) {
        toast.error(`Estimated hours cannot exceed ${availableHours} hours before the deadline`)
        return
      }
    }

    setLoading(true)
    try {
      if (isEditMode) {
        await taskService.update(taskId, form)
        toast.success('Task updated successfully.')
      } else {
        await taskService.create(form)
        toast.success('Task created! AI prediction will be generated shortly.')
      }
      navigate('/tasks/list')
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} task`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#312c51]">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(240,195,142,0.12),_transparent_28%),linear-gradient(180deg,_#312c51_0%,_#2a2643_100%)] p-6 pt-20">
          <div className="mx-auto w-full max-w-4xl">
            <h1 className="mb-2 text-4xl font-black tracking-[-0.04em] text-[#f6efe8]">
              {isEditMode ? 'Edit Task' : 'Create Task'}
            </h1>
            <p className="mb-6 text-sm text-[#c6bfdc]">
              {isEditMode
                ? 'Update your task details and keep the AI prediction in sync.'
                : 'Create tasks for today or future days, with a real deadline time when needed.'}
            </p>

            {loadingTask ? (
              <div className="card border border-[#5b557d] bg-[#48426d]/88 text-sm text-[#c6bfdc]">Loading task details...</div>
            ) : (
              <form onSubmit={handleSubmit} className="card space-y-5 border border-[#5b557d] bg-[#48426d]/88">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#ddd5e8]">Task Title *</label>
                  <input
                    name="title"
                    required
                    value={form.title}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g. Implement user authentication"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#ddd5e8]">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    value={form.description}
                    onChange={handleChange}
                    className="input-field resize-none"
                    placeholder="Describe what needs to be done..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#ddd5e8]">Priority</label>
                    <select name="priority" value={form.priority} onChange={handleChange} className="input-field">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#ddd5e8]">Status</label>
                    <select name="status" value={form.status} onChange={handleChange} className="input-field">
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#ddd5e8]">Deadline Date</label>
                    <input
                      name="deadline"
                      type="date"
                      min={todayDate}
                      value={form.deadline}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#ddd5e8]">Deadline Time</label>
                    <input
                      name="deadline_time"
                      type="time"
                      min={form.deadline === todayDate ? getCurrentTimePlusMinutes() : undefined}
                      value={form.deadline_time}
                      onChange={handleChange}
                      className="input-field"
                    />
                    <p className="mt-1.5 text-xs text-[#c6bfdc]">
                      Required for tasks due today. Future-day tasks can leave this empty.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#ddd5e8]">Estimated Hours</label>
                  <input
                    name="estimated_hours"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={form.estimated_hours}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g. 2"
                  />
                  {availableHours !== null && (
                    <p className="mt-1.5 text-xs text-[#c6bfdc]">
                      Based on your schedule, you can plan up to {availableHours} hour{availableHours === 1 ? '' : 's'} before this deadline.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 rounded-[20px] border border-[#6a638e] bg-[#3d3762] p-3">
                  <Brain size={18} className="shrink-0 text-[#f0c38e]" />
                  <p className="text-xs text-[#ddd5e8]">
                    Same-day tasks are allowed now. If you set a time, the app can remind you daily and again 3 hours or 2 hours before the deadline.
                  </p>
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5 disabled:opacity-60">
                    {loading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Task')}
                  </button>
                  <button type="button" onClick={() => navigate(-1)} className="btn-ghost px-6">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
