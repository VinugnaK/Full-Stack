import { useEffect, useMemo, useRef, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Sidebar from '../../components/Sidebar/Sidebar'
import Navbar from '../../components/Navbar/Navbar'
import { taskService } from '../../services/taskService'

function getDateKey(date) {
  return format(date, 'yyyy-MM-dd')
}

function getTaskDateKey(value) {
  if (!value) return null

  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) return null

  return format(parsed, 'yyyy-MM-dd')
}

function getDropPayload(task, date) {
  const targetDate = getDateKey(date)
  const todayKey = getDateKey(new Date())

  if (targetDate === todayKey) {
    const existingTime = task.deadline_time ? String(task.deadline_time).slice(0, 5) : null
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const existingMinutes = existingTime
      ? Number(existingTime.slice(0, 2)) * 60 + Number(existingTime.slice(3, 5))
      : null

    return {
      deadline: targetDate,
      deadline_time: existingMinutes && existingMinutes > currentMinutes ? existingTime : '23:59',
    }
  }

  return {
    deadline: targetDate,
    deadline_time: task.deadline_time || null,
  }
}

function buildTaskGroups(tasks) {
  const byDate = new Map()
  const unscheduled = []

  tasks.forEach((task) => {
    if (!task.deadline) {
      unscheduled.push(task)
      return
    }

    const key = getTaskDateKey(task.deadline)
    if (!key) {
      unscheduled.push(task)
      return
    }

    const current = byDate.get(key) || []
    current.push(task)
    byDate.set(key, current)
  })

  return { byDate, unscheduled }
}

function TaskPill({ task }) {
  return (
    <div className="rounded-2xl border border-[#6a638e] bg-[#3d3762] px-3 py-2 text-left text-xs shadow-[0_12px_30px_rgba(10,8,22,0.24)]">
      <p className="truncate font-medium text-[#f6efe8]">{task.title}</p>
      <p className="mt-0.5 text-[11px] text-[#c6bfdc]">
        {task.status.replace('_', ' ')}
        {task.deadline_time ? ` • ${String(task.deadline_time).slice(0, 5)}` : ''}
      </p>
    </div>
  )
}

export default function CalendarView() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [monthCursor, setMonthCursor] = useState(startOfMonth(new Date()))
  const [draggedTaskId, setDraggedTaskId] = useState(null)
  const [selectedDayKey, setSelectedDayKey] = useState(null)
  const [isUnscheduledDropActive, setIsUnscheduledDropActive] = useState(false)
  const popupRef = useRef(null)

  useEffect(() => {
    taskService.getAll()
      .then((data) => setTasks(data.tasks || []))
      .catch((error) => toast.error(error.response?.data?.message || 'Failed to load tasks'))
      .finally(() => setLoading(false))
  }, [])

  const { byDate, unscheduled } = useMemo(() => buildTaskGroups(tasks), [tasks])

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(monthCursor)
    const monthEnd = endOfMonth(monthCursor)
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 0 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
    })
  }, [monthCursor])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!popupRef.current?.contains(event.target)) {
        setSelectedDayKey(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDropOnDate = async (event, date) => {
    event.preventDefault()
    const taskId = Number(event.dataTransfer.getData('text/plain') || draggedTaskId)
    if (!taskId) return

    const task = tasks.find((item) => item.id === taskId)
    if (!task) return

    try {
      const updated = await taskService.update(taskId, getDropPayload(task, date))
      setTasks((current) => current.map((item) => (item.id === taskId ? updated : item)))
      toast.success(`Task scheduled for ${format(date, 'MMM d')}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reschedule task')
    } finally {
      setDraggedTaskId(null)
    }
  }

  const handleDropToUnscheduled = async (event) => {
    event.preventDefault()
    setIsUnscheduledDropActive(false)
    const taskId = Number(event.dataTransfer.getData('text/plain') || draggedTaskId)
    if (!taskId) return

    try {
      const updated = await taskService.update(taskId, { deadline: null, deadline_time: null })
      setTasks((current) => current.map((item) => (item.id === taskId ? updated : item)))
      toast.success('Task moved to unscheduled')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unschedule task')
    } finally {
      setDraggedTaskId(null)
    }
  }

  const handleMoveToUnscheduled = async (taskId) => {
    try {
      const updated = await taskService.update(taskId, { deadline: null, deadline_time: null })
      setTasks((current) => current.map((item) => (item.id === taskId ? updated : item)))
      setSelectedDayKey(null)
      toast.success('Task moved to unscheduled')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unschedule task')
    }
  }

  return (
    <div className="flex min-h-screen bg-[#312c51]">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="min-h-screen space-y-6 bg-[radial-gradient(circle_at_top_left,_rgba(240,195,142,0.12),_transparent_28%),linear-gradient(180deg,_#312c51_0%,_#2a2643_100%)] p-6 pt-20">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.04em] text-[#f6efe8]">Calendar View</h1>
              <p className="mt-2 text-sm text-[#c6bfdc]">
                View tasks by date and drag them onto a new day to reschedule.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-[24px] border border-[#5b557d] bg-[#48426d]/88 px-3 py-2 shadow-[0_18px_40px_rgba(10,8,22,0.22)]">
              <button
                type="button"
                onClick={() => setMonthCursor((previous) => subMonths(previous, 1))}
                className="rounded-lg p-2 text-[#c6bfdc] transition-colors hover:bg-[#5a547d] hover:text-[#f6efe8]"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="min-w-40 text-center text-sm font-semibold text-[#f6efe8]">
                {format(monthCursor, 'MMMM yyyy')}
              </div>
              <button
                type="button"
                onClick={() => setMonthCursor((previous) => addMonths(previous, 1))}
                className="rounded-lg p-2 text-[#c6bfdc] transition-colors hover:bg-[#5a547d] hover:text-[#f6efe8]"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[320px,1fr]">
            <section
              onDragOver={(event) => {
                event.preventDefault()
                if (!isUnscheduledDropActive) setIsUnscheduledDropActive(true)
              }}
              onDragLeave={() => setIsUnscheduledDropActive(false)}
              onDrop={handleDropToUnscheduled}
              className={`card h-fit border bg-[#48426d]/88 transition-all ${
                isUnscheduledDropActive
                  ? 'border-[#f0c38e] shadow-[0_0_0_3px_rgba(240,195,142,0.14)]'
                  : 'border-[#5b557d]'
              }`}
            >
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays size={16} className="text-[#f0c38e]" />
                <h2 className="text-lg font-bold text-[#f6efe8]">Unscheduled Tasks</h2>
              </div>
              <p className="mb-4 text-sm text-[#c6bfdc]">
                Drag a task into the calendar to give it a date, or drop it back here to clear the schedule.
              </p>

              <div className="space-y-3">
                {loading ? (
                  <p className="text-sm text-[#c6bfdc]">Loading tasks...</p>
                ) : unscheduled.length ? (
                  unscheduled.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(event) => {
                        setDraggedTaskId(task.id)
                        event.dataTransfer.effectAllowed = 'move'
                        event.dataTransfer.setData('text/plain', String(task.id))
                      }}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <TaskPill task={task} />
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[#6a638e] px-4 py-8 text-center text-sm text-[#c6bfdc]">
                    Every task already has a date.
                  </div>
                )}
              </div>
            </section>

            <section className="card overflow-visible border border-[#5b557d] bg-[#48426d]/88 p-0">
              <div className="grid grid-cols-7 border-b border-[#5b557d] bg-[#3d3762]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#c6bfdc]">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {calendarDays.map((day) => {
                  const key = getDateKey(day)
                  const tasksForDay = byDate.get(key) || []
                  const inMonth = isSameMonth(day, monthCursor)
                  const today = isToday(day)

                  return (
                    <div
                      key={key}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => handleDropOnDate(event, day)}
                      className={`relative min-h-40 border-b border-r border-[#5b557d] p-3 transition-colors ${
                        inMonth ? 'bg-[#3d3762]/70' : 'bg-[#342f56]'
                      } ${today ? 'bg-[#4d466f]' : ''}`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                            today
                              ? 'bg-[#f0c38e] text-[#312c51]'
                              : inMonth
                                ? 'text-[#f6efe8]'
                                : 'text-[#8e86ab]'
                          }`}
                        >
                          {format(day, 'd')}
                        </span>

                        {tasksForDay.length > 0 && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              setSelectedDayKey((current) => (current === key ? null : key))
                            }}
                            className="rounded-full border border-[#f0c38e] bg-[#5a547d] px-2.5 py-1 text-[11px] font-semibold text-[#f6efe8] transition-colors hover:bg-[#6a638e]"
                          >
                            {tasksForDay.length}
                          </button>
                        )}
                      </div>

                      {selectedDayKey === key && tasksForDay.length > 0 && (
                        <div
                          ref={popupRef}
                          className="absolute left-1/2 top-14 z-20 w-72 -translate-x-1/2 rounded-[24px] border border-[#6a638e] bg-[#3d3762] p-4 shadow-[0_28px_60px_rgba(10,8,22,0.34)]"
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-[#f6efe8]">{format(day, 'EEE, MMM d')}</p>
                              <p className="text-xs text-[#c6bfdc]">{tasksForDay.length} task(s)</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedDayKey(null)}
                              className="text-xs text-[#c6bfdc] hover:text-[#f0c38e]"
                            >
                              Close
                            </button>
                          </div>

                          <div className="max-h-72 space-y-2 overflow-y-auto">
                            {tasksForDay.map((task) => (
                              <div key={`popup-${task.id}`} className="space-y-2">
                                <div
                                  draggable
                                  onDragStart={(event) => {
                                    setDraggedTaskId(task.id)
                                    event.dataTransfer.effectAllowed = 'move'
                                    event.dataTransfer.setData('text/plain', String(task.id))
                                    setSelectedDayKey(null)
                                  }}
                                  onDragEnd={() => {
                                    setDraggedTaskId(null)
                                    setIsUnscheduledDropActive(false)
                                  }}
                                  className="cursor-grab active:cursor-grabbing"
                                >
                                  <TaskPill task={task} />
                                </div>
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveToUnscheduled(task.id)}
                                    className="rounded-full border border-[#8b84ab] bg-[#312c51]/45 px-3 py-1 text-[11px] font-semibold text-[#f4ecfb] transition hover:border-[#f0c38e] hover:bg-[#312c51]/70"
                                  >
                                    Move to unscheduled
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {today && !tasksForDay.length && (
                        <div className="mt-3 rounded-lg border border-dashed border-[#f0c38e] px-2 py-1 text-[11px] text-[#f0c38e]">
                          Today
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
