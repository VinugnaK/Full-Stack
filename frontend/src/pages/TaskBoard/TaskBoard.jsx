import { useEffect, useState } from 'react'
import { addDays, endOfDay, format, startOfDay } from 'date-fns'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar'
import Navbar from '../../components/Navbar/Navbar'
import TaskCard from '../../components/TaskCard/TaskCard'
import { taskService } from '../../services/taskService'

const COLUMNS = [
  { id: 'todo', label: 'To Do', accent: 'border-t-[#f0c38e]' },
  { id: 'in_progress', label: 'In Progress', accent: 'border-t-[#f1aa9b]' },
  { id: 'done', label: 'Done', accent: 'border-t-[#8fd3b6]' },
]

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
  const dueAt = new Date(`${datePart}T${timePart}`)
  return Number.isNaN(dueAt.getTime()) ? null : dueAt
}

function sortTasksByDueDate(tasks) {
  return [...tasks].sort((left, right) => {
    const leftDueAt = getTaskDueAt(left)
    const rightDueAt = getTaskDueAt(right)

    if (leftDueAt && rightDueAt) return leftDueAt - rightDueAt
    if (leftDueAt) return -1
    if (rightDueAt) return 1
    return 0
  })
}

export default function TaskBoard() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    taskService.getAll()
      .then((data) => setTasks(data.tasks || []))
      .finally(() => setLoading(false))
  }, [])

  const today = startOfDay(new Date())
  const boardEnd = endOfDay(addDays(today, 2))
  const visibleTasks = sortTasksByDueDate(
    tasks.filter((task) => {
      const dueAt = getTaskDueAt(task)
      return dueAt && dueAt >= today && dueAt <= boardEnd
    })
  )

  const grouped = COLUMNS.reduce((acc, column) => {
    acc[column.id] = visibleTasks.filter((task) => task.status === column.id)
    return acc
  }, {})

  const statusOrder = { todo: 0, in_progress: 1, done: 2 }

  const handleDrop = async (event, status) => {
    const id = event.dataTransfer.getData('text/plain')
    if (!id) return

    const draggedTask = visibleTasks.find((task) => task.id === Number(id))
    if (!draggedTask || draggedTask.status === status) return

    if (statusOrder[status] < statusOrder[draggedTask.status]) {
      toast.error('Tasks can only move forward')
      return
    }

    try {
      const updated = await taskService.update(id, { status })
      setTasks((current) => current.map((task) => (task.id === Number(id) ? updated : task)))
      toast.success('Task moved')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update task')
    }
  }

  return (
    <div className="flex min-h-screen bg-[#312c51]">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(240,195,142,0.12),_transparent_28%),linear-gradient(180deg,_#312c51_0%,_#2a2643_100%)] p-6 pt-20">
          <div className="mb-6">
            <h1 className="text-4xl font-black tracking-[-0.04em] text-[#f6efe8]">Task Board</h1>
            <p className="mt-2 text-sm text-[#c6bfdc]">
              Drag and drop only the tasks due in your current 3-day work window.
            </p>
            <div className="mt-4 inline-flex rounded-full border border-[#6f6894] bg-[#403a66] px-4 py-2 text-sm font-medium text-[#efe7f8]">
              Showing tasks from {format(today, 'MMM d')} to {format(boardEnd, 'MMM d')}
            </div>
          </div>

          {loading ? (
            <p className="text-[#c6bfdc]">Loading tasks...</p>
          ) : (
            <div className="grid h-full grid-cols-1 gap-5 xl:grid-cols-3">
              {COLUMNS.map((column) => (
                <div
                  key={column.id}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, column.id)}
                  className={`min-h-96 rounded-[28px] border border-[#5b557d] border-t-[3px] bg-[#48426d]/88 p-5 shadow-[0_24px_60px_rgba(11,9,24,0.3)] ${column.accent}`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[#f6efe8]">{column.label}</h2>
                    <span className="rounded-full bg-[#312c51] px-2.5 py-1 text-xs font-semibold text-[#f0c38e]">
                      {grouped[column.id]?.length || 0}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {grouped[column.id]?.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = 'move'
                          event.dataTransfer.setData('text/plain', String(task.id))
                        }}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <TaskCard task={task} onClick={() => navigate(`/tasks/${task.id}`)} />
                      </div>
                    ))}

                    {grouped[column.id]?.length === 0 && (
                      <p className="mt-8 text-center text-xs text-[#c6bfdc]">No tasks in this 3-day window</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
