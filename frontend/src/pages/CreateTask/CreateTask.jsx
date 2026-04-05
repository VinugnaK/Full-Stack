import React, { useState } from 'react'
import Layout from '../../components/Layout/Layout'
import { taskService } from '../../services/taskService'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PlusCircle, AlertTriangle, CheckCircle } from 'lucide-react'

const RISK_CONFIG = {
  LOW:    { style: 'risk-low',    icon: <CheckCircle size={16} />,  label: 'Low Risk' },
  MEDIUM: { style: 'risk-medium', icon: <AlertTriangle size={16} />, label: 'Medium Risk' },
  HIGH:   { style: 'risk-high',   icon: <AlertTriangle size={16} />, label: 'High Risk' }
}

export default function CreateTask() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    deadline: '',
    estimated_hours: ''
  })
  const [loading, setLoading] = useState(false)
  const [risk, setRisk] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await taskService.create(form)
      if (data.risk) setRisk(data.risk)
      toast.success('Task created!')
      setTimeout(() => navigate('/tasks/list'), 1500)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the details below to add a new task.</p>
        </div>

        {risk && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${RISK_CONFIG[risk.risk_level]?.style}`}>
            {RISK_CONFIG[risk.risk_level]?.icon}
            <div>
              <p className="font-semibold text-sm">
                Risk Assessment: {RISK_CONFIG[risk.risk_level]?.label}
              </p>
              <p className="text-xs mt-0.5">
                Overrun probability: {Math.round((risk.probability || 0) * 100)}%
              </p>
              {risk.suggestion && (
                <p className="text-xs mt-1 italic">💡 {risk.suggestion}</p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
            <input name="title" type="text" required value={form.title} onChange={handleChange}
              placeholder="e.g. Complete project report" className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" rows={3} value={form.description} onChange={handleChange}
              placeholder="Task details..." className="input-field resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="input-field">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input name="deadline" type="date" value={form.deadline} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
              <input name="estimated_hours" type="number" min="0.5" step="0.5"
                value={form.estimated_hours} onChange={handleChange}
                placeholder="e.g. 4" className="input-field" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="btn-primary flex-1 py-2.5 disabled:opacity-60 flex items-center justify-center gap-2">
              <PlusCircle size={18} />
              {loading ? 'Creating...' : 'Create Task'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
