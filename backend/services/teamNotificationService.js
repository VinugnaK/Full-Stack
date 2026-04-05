const TeamNotification = require('../models/teamNotificationModel')

function formatDateTime(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  }).format(value)
}

async function createTaskAssignedNotification({ userId, projectId, taskId, taskTitle, projectName, assignedByName }) {
  return TeamNotification.create({
    userId,
    projectId,
    teamTaskId: taskId,
    eventType: 'task_assigned',
    message: `You were assigned "${taskTitle}" in "${projectName}" by ${assignedByName}. The task is ready in To Do.`,
  })
}

async function createTaskCompletedNotification({ userId, projectId, taskId, taskTitle, projectName, completedByName, completedAt }) {
  return TeamNotification.create({
    userId,
    projectId,
    teamTaskId: taskId,
    eventType: 'task_completed',
    message: `"${taskTitle}" in "${projectName}" was marked done by ${completedByName} on ${formatDateTime(completedAt)}.`,
  })
}

async function createInvitationResponseNotification({ userId, projectId, projectName, memberName, action }) {
  const eventType = action === 'accept' ? 'invitation_accepted' : 'invitation_declined'
  const verb = action === 'accept' ? 'accepted' : 'declined'

  return TeamNotification.create({
    userId,
    projectId,
    teamTaskId: null,
    eventType,
    message: `${memberName} ${verb} the invitation for "${projectName}".`,
  })
}

async function getTeamNotifications(userId, since) {
  const [history, fresh] = await Promise.all([
    TeamNotification.findRecentByUser(userId, 20),
    since ? TeamNotification.findSinceByUser(userId, since) : Promise.resolve([]),
  ])

  return { history, fresh }
}

module.exports = {
  createTaskAssignedNotification,
  createTaskCompletedNotification,
  createInvitationResponseNotification,
  getTeamNotifications,
}
