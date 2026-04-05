import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../../components/Sidebar/Sidebar'
import Navbar from '../../components/Navbar/Navbar'
import { teamProjectService } from '../../services/teamProjectService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Check, Mail, Pencil, Plus, Trash2, Users } from 'lucide-react'

const EMPTY_PROJECT_FORM = {
  name: '',
  description: '',
  inviteEmails: '',
}

const EMPTY_TASK_FORM = {
  title: '',
  description: '',
  priority: 'medium',
  deadline: '',
  estimated_hours: '',
  assigned_to: '',
}

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

const STATUS_ORDER = {
  todo: 0,
  in_progress: 1,
  done: 2,
}

function DeliveryHint({ inviteDelivery }) {
  if (!inviteDelivery?.length) return null

  const sent = inviteDelivery.filter(item => item.status === 'sent').length
  const skipped = inviteDelivery.filter(item => item.status.startsWith('skipped')).length
  const pendingConfig = inviteDelivery.filter(item => item.status === 'email_not_configured').length

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800/70 px-3 py-2 text-xs text-gray-400">
      {sent > 0 && <span>{sent} invitation email(s) sent. </span>}
      {skipped > 0 && <span>{skipped} skipped because they were already invited or already members. </span>}
      {pendingConfig > 0 && <span>{pendingConfig} invite(s) were saved, but EmailJS still needs to be configured.</span>}
    </div>
  )
}

function formatStatusTime(value) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: false,
  }).format(date)
}

function getInactiveMemberSummary(member) {
  if (!member?.open_assigned_tasks || !member.last_task_update_at) return null

  const lastUpdate = new Date(member.last_task_update_at)
  if (Number.isNaN(lastUpdate.getTime())) return null

  const daysInactive = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))
  if (daysInactive < 2) return null

  return {
    daysInactive,
    message: `${member.name} hasn't updated ${member.latest_task_title ? `"${member.latest_task_title}"` : 'their task'} in ${daysInactive} day${daysInactive === 1 ? '' : 's'}.`,
  }
}

export default function TeamProjects() {
  const { user } = useAuth()
  const [overview, setOverview] = useState({ projects: [], pendingInvitations: [], emailConfigured: false })
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [projectDetail, setProjectDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT_FORM)
  const [taskForm, setTaskForm] = useState(EMPTY_TASK_FORM)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviteDelivery, setInviteDelivery] = useState([])
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false)

  const selectedProject = useMemo(
    () => overview.projects.find(project => project.id === selectedProjectId) || null,
    [overview.projects, selectedProjectId]
  )

  const isProjectOwner = Number(projectDetail?.project?.owner_id || selectedProject?.owner_id) === Number(user?.id)

  const loadOverview = async preferredProjectId => {
    const data = await teamProjectService.getOverview()
    setOverview(data)

    const nextProjectId =
      preferredProjectId ||
      selectedProjectId ||
      data.projects[0]?.id ||
      null

    setSelectedProjectId(nextProjectId)
    return { data, nextProjectId }
  }

  const loadProjectDetail = async projectId => {
    if (!projectId) {
      setProjectDetail(null)
      return
    }

    setDetailLoading(true)
    try {
      const data = await teamProjectService.getProject(projectId)
      setProjectDetail(data)
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const { nextProjectId } = await loadOverview()
        if (mounted && nextProjectId) {
          await loadProjectDetail(nextProjectId)
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load team projects')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectDetail(selectedProjectId).catch(error => {
        toast.error(error.response?.data?.message || 'Failed to load team project')
      })
    } else {
      setProjectDetail(null)
    }
  }, [selectedProjectId])

  const handleCreateProject = async e => {
    e.preventDefault()
    try {
      const payload = {
        ...projectForm,
        inviteEmails: projectForm.inviteEmails
          .split(',')
          .map(email => email.trim())
          .filter(Boolean),
      }

      const created = await teamProjectService.createProject(payload)
      toast.success('Team project created')
      setProjectForm(EMPTY_PROJECT_FORM)
      setInviteDelivery(created.inviteDelivery || [])
      setShowCreateProjectModal(false)

      await loadOverview(created.project.id)
      setProjectDetail(created)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create team project')
    }
  }

  const handleInvitationResponse = async (invitationId, action) => {
    try {
      const updated = await teamProjectService.respondToInvitation(invitationId, action)
      setOverview(current => ({
        ...current,
        projects: updated.projects,
        pendingInvitations: updated.pendingInvitations,
      }))
      toast.success(action === 'accept' ? 'Invitation accepted' : 'Invitation declined')
      if (action === 'accept' && updated.projects.length && !selectedProjectId) {
        setSelectedProjectId(updated.projects[0].id)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to respond to invitation')
    }
  }

  const handleInviteMembers = async e => {
    e.preventDefault()
    if (!selectedProjectId) return

    const normalizedEmails = inviteEmails
      .split(',')
      .map(email => email.trim())
      .filter(Boolean)

    if (!normalizedEmails.length) {
      toast.error('Enter at least one email address to send invites')
      return
    }

    try {
      const updated = await teamProjectService.inviteMembers(selectedProjectId, normalizedEmails.join(', '))
      setProjectDetail(updated)
      setInviteEmails('')
      setInviteDelivery(updated.inviteDelivery || [])
      await loadOverview(selectedProjectId)
      toast.success('Invitations processed')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to invite teammates')
    }
  }

  const handleDeleteProject = async projectId => {
    if (!window.confirm('Delete this team project? This will remove its team tasks, invites, and notifications.')) {
      return
    }

    try {
      await teamProjectService.deleteProject(projectId)
      const wasSelected = Number(selectedProjectId) === Number(projectId)
      await loadOverview(wasSelected ? null : selectedProjectId)
      if (wasSelected) {
        setProjectDetail(null)
      }
      toast.success('Team project deleted')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete team project')
    }
  }

  const handleCreateTask = async e => {
    e.preventDefault()
    if (!selectedProjectId) return

    try {
      const payload = {
        ...taskForm,
        assigned_to: taskForm.assigned_to || null,
      }
      if (editingTaskId) {
        await teamProjectService.updateTask(selectedProjectId, editingTaskId, payload)
      } else {
        await teamProjectService.createTask(selectedProjectId, payload)
      }
      setTaskForm(EMPTY_TASK_FORM)
      setEditingTaskId(null)
      await loadProjectDetail(selectedProjectId)
      await loadOverview(selectedProjectId)
      toast.success(editingTaskId ? 'Team task updated' : 'Team task created')
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${editingTaskId ? 'update' : 'create'} team task`)
    }
  }

  const handleQuickStatus = async (taskId, status) => {
    if (!selectedProjectId) return

    try {
      await teamProjectService.updateTask(selectedProjectId, taskId, {
        status,
        progress: status === 'done' ? 100 : undefined,
      })
      await loadProjectDetail(selectedProjectId)
      await loadOverview(selectedProjectId)
      toast.success('Team task updated')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update team task')
    }
  }

  const handleDeleteTask = async taskId => {
    if (!selectedProjectId || !window.confirm('Delete this team task?')) return

    try {
      await teamProjectService.deleteTask(selectedProjectId, taskId)
      await loadProjectDetail(selectedProjectId)
      await loadOverview(selectedProjectId)
      toast.success('Team task deleted')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete team task')
    }
  }

  const handleStartEditTask = task => {
    setEditingTaskId(task.id)
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      deadline: task.deadline ? String(task.deadline).split('T')[0] : '',
      estimated_hours: task.estimated_hours ?? '',
      assigned_to: task.assigned_to ? String(task.assigned_to) : '',
    })
  }

  const handleCancelTaskEdit = () => {
    setEditingTaskId(null)
    setTaskForm(EMPTY_TASK_FORM)
  }

  return (
    <div className="flex min-h-screen bg-[#312c51]">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="min-h-screen space-y-6 bg-[radial-gradient(circle_at_top_left,_rgba(240,195,142,0.12),_transparent_28%),linear-gradient(180deg,_#312c51_0%,_#2a2643_100%)] p-6 pt-20">
          {showCreateProjectModal && (
            <div className="fixed inset-0 z-40 flex items-start justify-center bg-[#120f1f]/55 px-6 py-24 backdrop-blur-sm">
              <div className="w-full max-w-xl rounded-[32px] border border-[#5b557d] bg-[#3d3762] p-6 shadow-[0_32px_80px_rgba(10,8,22,0.42)]">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Plus size={16} className="text-[#f0c38e]" />
                      <h2 className="text-2xl font-bold text-[#f6efe8]">Create Team Project</h2>
                    </div>
                    <p className="text-sm text-[#c6bfdc]">
                      Start a shared workspace, add project details, and invite teammates in one step.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateProjectModal(false)}
                    className="rounded-full border border-[#6a638e] px-3 py-1 text-sm text-[#c6bfdc] transition-colors hover:bg-[#5a547d] hover:text-[#f6efe8]"
                  >
                    Close
                  </button>
                </div>

                <form className="space-y-4" onSubmit={handleCreateProject}>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#ddd5e8]">Project Name</label>
                    <input
                      className="input-field"
                      value={projectForm.name}
                      onChange={e => setProjectForm(current => ({ ...current, name: e.target.value }))}
                      placeholder="Launch website redesign"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#ddd5e8]">Description</label>
                    <textarea
                      className="input-field min-h-28 resize-none"
                      value={projectForm.description}
                      onChange={e => setProjectForm(current => ({ ...current, description: e.target.value }))}
                      placeholder="What is this project about?"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#ddd5e8]">Invite Emails</label>
                    <textarea
                      className="input-field min-h-24 resize-none"
                      value={projectForm.inviteEmails}
                      onChange={e => setProjectForm(current => ({ ...current, inviteEmails: e.target.value }))}
                      placeholder="friend1@example.com, friend2@example.com"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button className="btn-primary flex-1" type="submit">
                      Create Project
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateProjectModal(false)}
                      className="btn-ghost"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.04em] text-[#f6efe8]">Team Projects</h1>
              <p className="mt-2 text-sm text-[#c6bfdc]">
                Create shared projects, invite teammates by email, and manage tasks together.
              </p>
            </div>
            <div className="flex max-w-md flex-col items-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateProjectModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={16} /> Create Team Project
              </button>
              {!overview.emailConfigured && (
                <div className="rounded-[24px] border border-[#6a638e] bg-[#3d3762] px-4 py-3 text-xs text-[#f0c38e]">
                  Invite records are ready. To send real emails, add EmailJS keys in the backend `.env`.
                </div>
              )}
            </div>
          </div>

          <DeliveryHint inviteDelivery={inviteDelivery} />

          {overview.pendingInvitations.length > 0 && (
            <section className="card border border-[#5b557d] bg-[#48426d]/88">
              <div className="mb-4 flex items-center gap-2">
                <Mail size={16} className="text-[#f0c38e]" />
                <h2 className="text-lg font-bold text-[#f6efe8]">Pending Team Invites</h2>
              </div>
              <div className="space-y-3">
                {overview.pendingInvitations.map(invitation => (
                  <div key={invitation.id} className="flex flex-col gap-3 rounded-[24px] border border-[#5b557d] bg-[#3d3762] p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-medium text-[#f6efe8]">{invitation.project_name}</p>
                      <p className="mt-1 text-sm text-[#c6bfdc]">
                        Invited by {invitation.invited_by_name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-primary text-sm" onClick={() => handleInvitationResponse(invitation.id, 'accept')}>
                        Accept
                      </button>
                      <button className="btn-ghost text-sm" onClick={() => handleInvitationResponse(invitation.id, 'decline')}>
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid gap-6 xl:grid-cols-[360px,1fr]">
            <div className="space-y-6">
              <section className="card border border-[#5b557d] bg-[#48426d]/88">
                <div className="mb-4 flex items-center gap-2">
                  <Users size={16} className="text-[#f0c38e]" />
                  <h2 className="text-lg font-bold text-[#f6efe8]">Your Team Spaces</h2>
                </div>

                <div className="space-y-3">
                  {overview.projects.map(project => {
                    const isActive = project.id === selectedProjectId
                    const isOwnerProject = Number(project.owner_id) === Number(user?.id)
                    return (
                      <div
                        key={project.id}
                        className={`w-full rounded-xl border p-4 text-left transition ${
                          isActive
                            ? 'border-[#f0c38e] bg-[#5a547d]'
                            : 'border-[#5b557d] bg-[#3d3762] hover:border-[#6a638e]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedProjectId(project.id)}
                            className="flex-1 text-left"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-medium text-[#f6efe8]">{project.name}</p>
                              <span className="rounded-full bg-[#312c51] px-2 py-0.5 text-xs text-[#f0c38e]">
                                {project.role}
                              </span>
                            </div>
                            <p className="mt-2 line-clamp-2 text-sm text-[#c6bfdc]">
                              {project.description || 'No description added yet.'}
                            </p>
                            <div className="mt-3 flex gap-4 text-xs text-[#c6bfdc]">
                              <span>{project.member_count} members</span>
                              <span>{project.completed_tasks}/{project.total_tasks} tasks done</span>
                            </div>
                          </button>
                          {isOwnerProject && (
                            <button
                              type="button"
                              onClick={event => {
                                event.stopPropagation()
                                handleDeleteProject(project.id)
                              }}
                              className="rounded-lg p-2 text-[#c6bfdc] transition-colors hover:bg-[#644861] hover:text-[#f1aa9b]"
                              title="Delete team project"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {!overview.projects.length && !loading && (
                    <p className="text-sm text-[#c6bfdc]">No team projects yet. Create one to start collaborating.</p>
                  )}
                </div>
              </section>
            </div>

            <section className="card min-h-[600px] border border-[#5b557d] bg-[#48426d]/88">
              {!selectedProject && !loading && (
                <div className="flex h-full items-center justify-center text-sm text-[#c6bfdc]">
                  Choose a project to manage shared tasks.
                </div>
              )}

              {selectedProject && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 border-b border-[#5b557d] pb-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-[#f6efe8]">{selectedProject.name}</h2>
                      <p className="mt-2 max-w-3xl text-sm text-[#c6bfdc]">
                        {selectedProject.description || 'No project description yet.'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm lg:min-w-72">
                      <div className="rounded-[20px] border border-[#5b557d] bg-[#3d3762] p-3">
                        <p className="text-[#c6bfdc]">Members</p>
                        <p className="mt-1 text-lg font-semibold text-[#f6efe8]">{selectedProject.member_count}</p>
                      </div>
                      <div className="rounded-[20px] border border-[#5b557d] bg-[#3d3762] p-3">
                        <p className="text-[#c6bfdc]">Completed</p>
                        <p className="mt-1 text-lg font-semibold text-[#f6efe8]">
                          {selectedProject.completed_tasks}/{selectedProject.total_tasks}
                        </p>
                      </div>
                    </div>
                  </div>

                  {detailLoading && (
                    <p className="text-sm text-[#c6bfdc]">Loading project details...</p>
                  )}

                  {projectDetail && (
                    <>
                      <div className="grid gap-6 xl:grid-cols-[1.3fr,0.9fr]">
                        <section className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-[#f6efe8]">Shared Tasks</h3>
                            <span className="text-xs text-[#c6bfdc]">
                              Only the assignee can update status, and only the owner can edit task details.
                            </span>
                          </div>

                          <div className="space-y-3">
                            {projectDetail.tasks.map(task => (
                              <div key={task.id} className="rounded-[24px] border border-[#5b557d] bg-[#3d3762] p-4">
                                {(() => {
                                  const canUpdateStatus = Number(task.assigned_to) === Number(user?.id)
                                  const currentOrder = STATUS_ORDER[task.status] ?? 0

                                  return (
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-gray-100">{task.title}</p>
                                      <span className="rounded-full border border-[#6a638e] bg-[#312c51] px-2 py-0.5 text-xs capitalize text-[#f0c38e]">
                                        {task.priority}
                                      </span>
                                    </div>
                                    {task.description && (
                                      <p className="mt-2 text-sm text-[#c6bfdc]">{task.description}</p>
                                    )}
                                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#c6bfdc]">
                                      <span>Assigned: {task.assigned_to_name || 'Unassigned'}</span>
                                      <span>Status: {task.status.replace('_', ' ')}</span>
                                      <span>Progress: {task.progress || 0}%</span>
                                      <span>Created by: {task.created_by_name}</span>
                                      {task.completed_at && (
                                        <span>Completed on: {formatStatusTime(task.completed_at)}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {STATUS_OPTIONS.map(option => (
                                      <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleQuickStatus(task.id, option.value)}
                                        disabled={!canUpdateStatus || (STATUS_ORDER[option.value] ?? 0) < currentOrder}
                                        className={`rounded-lg border px-3 py-1.5 text-xs ${
                                          task.status === option.value
                                            ? 'border-[#f0c38e] bg-[#5a547d] text-[#f6efe8]'
                                            : 'border-[#6a638e] bg-[#312c51] text-[#ddd5e8] hover:text-[#f0c38e]'
                                        } ${!canUpdateStatus || (STATUS_ORDER[option.value] ?? 0) < currentOrder ? 'cursor-not-allowed opacity-50' : ''}`}
                                        title={
                                          !canUpdateStatus
                                            ? 'Only the assigned teammate can update the status'
                                            : (STATUS_ORDER[option.value] ?? 0) < currentOrder
                                              ? 'Team task status can only move forward'
                                              : 'Update team task status'
                                        }
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                    {isProjectOwner && (
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditTask(task)}
                                        className="rounded-lg border border-[#6a638e] bg-[#312c51] px-3 py-1.5 text-xs text-[#ddd5e8] hover:text-[#f0c38e]"
                                      >
                                        <Pencil size={12} className="mr-1 inline-block" /> Edit
                                      </button>
                                    )}
                                    {isProjectOwner && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-300"
                                      >
                                        <Trash2 size={12} className="inline-block" /> Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                                  )
                                })()}
                              </div>
                            ))}

                            {!projectDetail.tasks.length && (
                              <p className="rounded-[24px] border border-dashed border-[#6a638e] px-4 py-10 text-center text-sm text-[#c6bfdc]">
                                No team tasks yet. Add the first one below.
                              </p>
                            )}
                          </div>
                        </section>

                        <section className="space-y-6">
                          <div className="rounded-[24px] border border-[#5b557d] bg-[#3d3762] p-4">
                            <h3 className="text-lg font-bold text-[#f6efe8]">Accountability System</h3>
                            <div className="mt-4 space-y-3">
                              {(projectDetail.activityMonitoring || [])
                                .map(member => ({ member, insight: getInactiveMemberSummary(member) }))
                                .filter(item => item.insight)
                                .map(({ member, insight }) => (
                                  <div key={`inactive-${member.user_id}`} className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                                    <p className="text-sm font-medium text-amber-100">{member.name}</p>
                                    <p className="mt-1 text-xs text-amber-200/90">{insight.message}</p>
                                  </div>
                                ))}

                              {!(projectDetail.activityMonitoring || []).some(member => getInactiveMemberSummary(member)) && (
                                <div className="rounded-lg border border-dashed border-[#6a638e] px-4 py-8 text-center text-sm text-[#c6bfdc]">
                                  No inactive teammates right now. Team updates look healthy.
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="rounded-[24px] border border-[#5b557d] bg-[#3d3762] p-4">
                            <h3 className="text-lg font-bold text-[#f6efe8]">Members</h3>
                            <div className="mt-4 space-y-3">
                              {projectDetail.members.map(member => (
                                <div key={member.user_id} className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-medium text-[#f6efe8]">{member.name}</p>
                                    <p className="text-xs text-[#c6bfdc]">{member.email}</p>
                                  </div>
                                  <span className="rounded-full bg-[#312c51] px-2 py-0.5 text-xs text-[#f0c38e]">
                                    {member.role}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-[24px] border border-[#5b557d] bg-[#3d3762] p-4">
                            <h3 className="text-lg font-bold text-[#f6efe8]">Invite More Teammates</h3>
                            <form className="mt-4 space-y-3" onSubmit={handleInviteMembers}>
                              <textarea
                                className="input-field min-h-24 resize-none"
                                value={inviteEmails}
                                onChange={e => setInviteEmails(e.target.value)}
                                placeholder="newfriend@example.com, another@example.com"
                              />
                              <button className="btn-primary w-full" type="submit">
                                Send Invites
                              </button>
                            </form>

                            {!!projectDetail.invitations.length && (
                              <div className="mt-4 space-y-2 border-t border-[#5b557d] pt-4">
                                {projectDetail.invitations.map(invitation => (
                                  <div key={invitation.id} className="flex items-center justify-between gap-3 text-xs text-[#c6bfdc]">
                                    <span>{invitation.email}</span>
                                    <span className="capitalize">{invitation.status}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </section>
                      </div>

                      <section className="border-t border-[#5b557d] pt-6">
                        <div className="mb-4 flex items-center gap-2">
                          <Check size={16} className="text-[#f0c38e]" />
                          <h3 className="text-lg font-bold text-[#f6efe8]">
                            {editingTaskId ? 'Edit Team Task' : 'Add Team Task'}
                          </h3>
                        </div>
                        <p className="mb-4 text-xs text-[#c6bfdc]">
                          New team tasks always start in <span className="font-semibold text-[#f6efe8]">To Do</span>. Only the assigned teammate can change status later.
                        </p>
                        <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleCreateTask}>
                          <input
                            className="input-field"
                            placeholder="Task title"
                            value={taskForm.title}
                            onChange={e => setTaskForm(current => ({ ...current, title: e.target.value }))}
                            required
                          />
                          <select
                            className="input-field"
                            value={taskForm.assigned_to}
                            onChange={e => setTaskForm(current => ({ ...current, assigned_to: e.target.value }))}
                          >
                            <option value="">Assign teammate</option>
                            {projectDetail.members.map(member => (
                              <option key={member.user_id} value={member.user_id}>
                                {member.name}
                              </option>
                            ))}
                          </select>
                          <textarea
                            className="input-field min-h-28 resize-none lg:col-span-2"
                            placeholder="Task description"
                            value={taskForm.description}
                            onChange={e => setTaskForm(current => ({ ...current, description: e.target.value }))}
                          />
                          <select
                            className="input-field"
                            value={taskForm.priority}
                            onChange={e => setTaskForm(current => ({ ...current, priority: e.target.value }))}
                          >
                            <option value="low">Low priority</option>
                            <option value="medium">Medium priority</option>
                            <option value="high">High priority</option>
                          </select>
                          <div className="input-field flex items-center text-gray-500">Status: To Do</div>
                          <input
                            className="input-field"
                            type="date"
                            value={taskForm.deadline}
                            onChange={e => setTaskForm(current => ({ ...current, deadline: e.target.value }))}
                          />
                          <input
                            className="input-field"
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="Estimated hours"
                            value={taskForm.estimated_hours}
                            onChange={e => setTaskForm(current => ({ ...current, estimated_hours: e.target.value }))}
                          />
                          <div className="flex gap-3 lg:col-span-2">
                            <button className="btn-primary flex-1" type="submit">
                              {editingTaskId ? 'Save Team Task' : 'Add Team Task'}
                            </button>
                            {editingTaskId && (
                              <button className="btn-ghost" type="button" onClick={handleCancelTaskEdit}>
                                Cancel
                              </button>
                            )}
                          </div>
                        </form>
                      </section>
                    </>
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
