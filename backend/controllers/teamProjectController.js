const crypto = require('crypto')
const TeamProject = require('../models/teamProjectModel')
const User = require('../models/userModel')
const {
  hasInviteEmailConfig,
  sendProjectInvitationEmail,
  sendInvitationResponseEmail,
} = require('../services/inviteEmailService')
const {
  createTaskCompletedNotification,
  createInvitationResponseNotification,
  getTeamNotifications,
} = require('../services/teamNotificationService')

function validateTeamStatusTransition(currentStatus, nextStatus) {
  if (nextStatus === undefined || nextStatus === currentStatus) return null

  const order = { todo: 0, in_progress: 1, done: 2 }
  if (!(nextStatus in order)) {
    return 'Invalid team task status'
  }

  if (order[nextStatus] < order[currentStatus]) {
    return 'Team task status can only move forward'
  }

  return null
}

function normalizeEmails(inviteEmails = []) {
  const values = Array.isArray(inviteEmails)
    ? inviteEmails
    : String(inviteEmails || '')
        .split(',')
        .map(value => value.trim())

  return [...new Set(values.map(email => email.toLowerCase()).filter(Boolean))]
}

async function buildProjectDetail(projectId, userId) {
  const project = await TeamProject.findByIdForUser(projectId, userId)
  if (!project) return null

  const [members, invitations, tasks, activityMonitoring] = await Promise.all([
    TeamProject.findMembers(projectId),
    TeamProject.findInvitations(projectId),
    TeamProject.findTasks(projectId),
    TeamProject.findActivityMonitoring(projectId),
  ])

  return { project, members, invitations, tasks, activityMonitoring }
}

async function inviteMembers({ detail, inviteEmails, invitedByUser }) {
  const delivery = []
  const inviterDisplayName = invitedByUser.name || invitedByUser.email

  for (const email of normalizeEmails(inviteEmails)) {
    const existingMember = detail.members.find(member => member.email.toLowerCase() === email)
    if (existingMember) {
      delivery.push({ email, status: 'skipped_member' })
      continue
    }

    const existingInvite = detail.invitations.find(invite => invite.email.toLowerCase() === email && invite.status === 'pending')
    if (existingInvite) {
      delivery.push({ email, status: 'skipped_pending' })
      continue
    }

    const inviteToken = crypto.randomBytes(24).toString('hex')

    await TeamProject.addInvitation({
      projectId: detail.project.id,
      email,
      invitedBy: invitedByUser.id,
      inviteToken,
    })

    try {
      const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173'
      const appUrl = `${frontendBase}/teams?invite=${inviteToken}&project=${detail.project.id}`

      const emailResult = await sendProjectInvitationEmail({
        toEmail: email,
        inviterName: inviterDisplayName,
        projectName: detail.project.name,
        projectDescription: detail.project.description,
        appUrl,
      })

      delivery.push({ email, status: emailResult.sent ? 'sent' : emailResult.reason || 'created_without_email', appUrl })
    } catch (error) {
      delivery.push({
        email,
        status: 'email_failed',
        appUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/teams?invite=${inviteToken}&project=${detail.project.id}`,
        error: error.response?.data || error.message,
      })
    }
  }

  return delivery
}

exports.getOverview = async (req, res, next) => {
  try {
    const [projects, invitations] = await Promise.all([
      TeamProject.findAllByUser(req.user.id),
      TeamProject.findPendingInvitationsByEmail(req.user.email),
    ])

    res.json({
      projects,
      pendingInvitations: invitations,
      emailConfigured: hasInviteEmailConfig(),
    })
  } catch (error) {
    next(error)
  }
}

exports.createProject = async (req, res, next) => {
  try {
    const { name, description, inviteEmails } = req.body
    if (!name) {
      return res.status(400).json({ message: 'Project name is required' })
    }

    const inviter = await User.findById(req.user.id)
    const projectId = await TeamProject.createProject({
      ownerId: req.user.id,
      name,
      description,
    })

    let detail = await buildProjectDetail(projectId, req.user.id)
    const inviteDelivery = await inviteMembers({
      detail,
      inviteEmails,
      invitedByUser: inviter || req.user,
    })
    detail = await buildProjectDetail(projectId, req.user.id)

    res.status(201).json({
      ...detail,
      inviteDelivery,
      emailConfigured: hasInviteEmailConfig(),
    })
  } catch (error) {
    next(error)
  }
}

exports.getProject = async (req, res, next) => {
  try {
    const detail = await buildProjectDetail(req.params.projectId, req.user.id)
    if (!detail) {
      return res.status(404).json({ message: 'Project not found' })
    }
    res.json(detail)
  } catch (error) {
    next(error)
  }
}

exports.deleteProject = async (req, res, next) => {
  try {
    const detail = await buildProjectDetail(req.params.projectId, req.user.id)
    if (!detail) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (Number(detail.project.owner_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Only the project owner can delete this project' })
    }

    await TeamProject.deleteProject(req.params.projectId)
    res.json({ message: 'Team project deleted' })
  } catch (error) {
    next(error)
  }
}

exports.inviteToProject = async (req, res, next) => {
  try {
    const detail = await buildProjectDetail(req.params.projectId, req.user.id)
    if (!detail) {
      return res.status(404).json({ message: 'Project not found' })
    }

    const inviter = await User.findById(req.user.id)
    const inviteDelivery = await inviteMembers({
      detail,
      inviteEmails: req.body.inviteEmails,
      invitedByUser: inviter || req.user,
    })

    const updated = await buildProjectDetail(req.params.projectId, req.user.id)
    res.status(201).json({
      ...updated,
      inviteDelivery,
      emailConfigured: hasInviteEmailConfig(),
    })
  } catch (error) {
    next(error)
  }
}

exports.respondToInvitation = async (req, res, next) => {
  try {
    const { action } = req.body
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ message: 'Action must be accept or decline' })
    }

    const invitation = await TeamProject.findInvitationById(req.params.invitationId)
    if (!invitation || invitation.email.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(404).json({ message: 'Invitation not found' })
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation already processed' })
    }

    if (action === 'accept') {
      await TeamProject.addMember(invitation.project_id, req.user.id, 'member')
      await TeamProject.respondToInvitation(invitation.id, 'accepted')
    } else {
      await TeamProject.respondToInvitation(invitation.id, 'declined')
    }

    const ownerProjectDetail = await TeamProject.findByIdForUser(invitation.project_id, invitation.invited_by)
    if (ownerProjectDetail) {
      await createInvitationResponseNotification({
        userId: ownerProjectDetail.owner_id,
        projectId: invitation.project_id,
        projectName: ownerProjectDetail.name,
        memberName: req.user.name || req.user.email,
        action,
      })

      try {
        const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173'
        const appUrl = `${frontendBase}/teams?project=${invitation.project_id}`

        await sendInvitationResponseEmail({
          toEmail: ownerProjectDetail.owner_email,
          ownerName: ownerProjectDetail.owner_name,
          memberName: req.user.name || req.user.email,
          projectName: ownerProjectDetail.name,
          action,
          appUrl,
        })
      } catch (emailError) {
        console.error('Failed to send invitation response email:', emailError.response?.data || emailError.message)
      }
    }

    const [projects, invitations] = await Promise.all([
      TeamProject.findAllByUser(req.user.id),
      TeamProject.findPendingInvitationsByEmail(req.user.email),
    ])

    res.json({ projects, pendingInvitations: invitations })
  } catch (error) {
    next(error)
  }
}

exports.createTask = async (req, res, next) => {
  try {
    const detail = await buildProjectDetail(req.params.projectId, req.user.id)
    if (!detail) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (!req.body.title) {
      return res.status(400).json({ message: 'Task title is required' })
    }

    if (
      req.body.assigned_to &&
      !detail.members.some(member => Number(member.user_id) === Number(req.body.assigned_to))
    ) {
      return res.status(400).json({ message: 'Assigned teammate must be a project member' })
    }

    const taskId = await TeamProject.createTask(req.params.projectId, req.user.id, {
      ...req.body,
      status: 'todo',
      progress: 0,
    })
    const task = await TeamProject.findTaskById(req.params.projectId, taskId)
    res.status(201).json(task)
  } catch (error) {
    next(error)
  }
}

exports.updateTask = async (req, res, next) => {
  try {
    const detail = await buildProjectDetail(req.params.projectId, req.user.id)
    if (!detail) {
      return res.status(404).json({ message: 'Project not found' })
    }

    const task = await TeamProject.findTaskById(req.params.projectId, req.params.taskId)
    if (!task) {
      return res.status(404).json({ message: 'Team task not found' })
    }

    const payload = { ...req.body }
    const statusFields = ['status', 'progress']
    const detailFields = ['title', 'description', 'priority', 'deadline', 'estimated_hours', 'assigned_to']
    const wantsStatusUpdate = statusFields.some(field => payload[field] !== undefined)
    const wantsDetailUpdate = detailFields.some(field => payload[field] !== undefined)

    if (wantsStatusUpdate && Number(task.assigned_to) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Only the assigned teammate can update this task status' })
    }

    if (wantsDetailUpdate && Number(detail.project.owner_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Only the project owner can edit team task details' })
    }

    if (payload.status !== undefined) {
      const statusError = validateTeamStatusTransition(task.status, payload.status)
      if (statusError) return res.status(400).json({ message: statusError })
    }

    if (payload.status === 'done' && payload.progress === undefined) {
      payload.progress = 100
    }

    if (
      payload.assigned_to &&
      !detail.members.some(member => Number(member.user_id) === Number(payload.assigned_to))
    ) {
      return res.status(400).json({ message: 'Assigned teammate must be a project member' })
    }

    await TeamProject.updateTask(req.params.projectId, req.params.taskId, payload)
    const updated = await TeamProject.findTaskById(req.params.projectId, req.params.taskId)

    if (task.status !== 'done' && updated.status === 'done') {
      await createTaskCompletedNotification({
        userId: detail.project.owner_id,
        projectId: Number(req.params.projectId),
        taskId: Number(req.params.taskId),
        taskTitle: updated.title,
        projectName: detail.project.name,
        completedByName: req.user.name || req.user.email,
        completedAt: updated.completed_at || new Date(),
      })
    }

    res.json(updated)
  } catch (error) {
    next(error)
  }
}

exports.deleteTask = async (req, res, next) => {
  try {
    const detail = await buildProjectDetail(req.params.projectId, req.user.id)
    if (!detail) {
      return res.status(404).json({ message: 'Project not found' })
    }

    const task = await TeamProject.findTaskById(req.params.projectId, req.params.taskId)
    if (!task) {
      return res.status(404).json({ message: 'Team task not found' })
    }

    if (Number(detail.project.owner_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Only the project owner can delete team tasks' })
    }

    await TeamProject.deleteTask(req.params.projectId, req.params.taskId)
    res.json({ message: 'Team task deleted' })
  } catch (error) {
    next(error)
  }
}

exports.getNotifications = async (req, res, next) => {
  try {
    const { since } = req.query
    const result = await getTeamNotifications(req.user.id, since || null)
    res.json(result)
  } catch (error) {
    next(error)
  }
}
