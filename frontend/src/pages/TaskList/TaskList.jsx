import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout/Layout'
import { taskService } from '../../services/taskService'
import { Link } from 'react-router-dom'
import { PlusCircle, Trash2, Edit3, ChevronUp, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const RISK_BADGE = {
  LOW: 'risk-low',
  MEDIUM: 'risk-medium',
  HIGH: 'risk-high'
}

export default function TaskList() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState('deadline')
  const [sortDir, setSortDir] = useState('asc')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => { fetchTasks() }, [])

  const fetchTasks = async () => {
    try {
      const data = await taskService.getAll()
      setTasks(data.tasks || [])
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return
    try {
      await taskService.delete(id)
      setTasks(prev => prev.filter(t => t.id !== id))
      toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const filtered = tasks
    .filter(t => filterStatus === 'all' || t.status === filterStatus)
    .sort((a, b) => {
      const aVal = a[sortField] ?? ''
      const bVal = b[sortField] ?? ''
      return sortDir === 'asc' ? aVal > bVal ? 1 : -1 : aVal < bVal ? 1 : -1
    })

  const SortIcon = ({ field }) => sortField === field
    ? (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)
    : null

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task List</h1>
            <p className="text-sm text-gray-500 mt-1">{filtered.length} tasks</p>
          </div>
          <Link to="/tasks/create" className="btn-primary flex items-center gap-2">
            <PlusCircle size={18} /> New Task
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {['all', 'todo', 'in_progress', 'review', 'done'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                filterStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="card overflow-hidden p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading tasks...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No tasks found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {[
                      { label: 'Title', field: 'title' },
                      { label: 'Status', field: 'status' },
                      { label: 'Priority', field: 'priority' },
                      { label: 'Deadline', field: 'deadline' },
                      { label: 'Risk', field: null },
                      { label: 'Actions', field: null }
                    ].map(col => (
                      <th
                        key={col.label}
                        onClick={() => col.field && toggleSort(col.field)}
                        className={`text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${col.field ? 'cursor-pointer hover:text-gray-700' : ''}`}
                      >
                        <span className="flex items-center gap-1">
                          {col.label} {col.field && <SortIcon field={col.field} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(task => (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{task.title}</td>
                      <td className="px-4 py-3 capitalize">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {task.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-600">{task.priority}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {task.deadline ? format(new Date(task.deadline), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {task.risk?.risk_level ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RISK_BADGE[task.risk.risk_level]}`}>
                            {task.risk.risk_level}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link to={`/tasks/create?edit=${task.id}`} className="text-gray-400 hover:text-blue-600 transition-colors">
                            <Edit3 size={16} />
                          </Link>
                          <button onClick={() => handleDelete(task.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
