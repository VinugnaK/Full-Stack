import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout/Layout'
import TaskCard from '../../components/TaskCard/TaskCard'
import { taskService } from '../../services/taskService'
import { Link } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'gray' },
  { id: 'in_progress', label: 'In Progress', color: 'blue' },
  { id: 'review', label: 'Review', color: 'yellow' },
  { id: 'done', label: 'Done', color: 'green' }
]

const COLUMN_STYLES = {
  gray: 'bg-gray-100 text-gray-600',
  blue: 'bg-blue-100 text-blue-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  green: 'bg-green-100 text-green-700'
}

export default function TaskBoard() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const data = await taskService.getAll()
      setTasks(data.tasks || [])
    } catch (e) {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  const handleDrop = async (e, status) => {
    const taskId = e.dataTransfer.getData('taskId')
    try {
      await taskService.update(taskId, { status })
      setTasks(prev => prev.map(t => t.id === parseInt(taskId) ? { ...t, status } : t))
      toast.success('Task moved')
    } catch {
      toast.error('Failed to update task')
    }
  }

  const handleDragOver = (e) => e.preventDefault()

  const getColumnTasks = (status) => tasks.filter(t => t.status === status)

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
            <p className="text-sm text-gray-500 mt-1">Drag and drop tasks between columns</p>
          </div>
          <Link to="/tasks/create" className="btn-primary flex items-center gap-2">
            <PlusCircle size={18} /> New Task
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
            {COLUMNS.map(col => (
              <div
                key={col.id}
                onDrop={(e) => handleDrop(e, col.id)}
                onDragOver={handleDragOver}
                className="bg-gray-50 rounded-xl p-3 min-h-[500px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${COLUMN_STYLES[col.color]}`}>
                    {col.label}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {getColumnTasks(col.id).length}
                  </span>
                </div>
                <div className="space-y-3">
                  {getColumnTasks(col.id).map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <TaskCard task={task} />
                    </div>
                  ))}
                  {getColumnTasks(col.id).length === 0 && (
                    <div className="text-center py-8 text-gray-300 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
