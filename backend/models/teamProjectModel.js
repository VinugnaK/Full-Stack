const db = require('../config/db')

function mapProject(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    owner_id: row.owner_id,
    owner_name: row.owner_name,
    owner_email: row.owner_email,
    role: row.role,
    created_at: row.created_at,
    updated_at: row.updated_at,
    total_tasks: Number(row.total_tasks || 0),
    completed_tasks: Number(row.completed_tasks || 0),
    member_count: Number(row.member_count || 0),
    pending_invites: Number(row.pending_invites || 0),
  }
}

const projectSummarySelect = `
  SELECT
    p.*,
    m.role,
    owner.name AS owner_name,
    owner.email AS owner_email,
    (SELECT COUNT(*) FROM team_tasks tt WHERE tt.project_id = p.id) AS total_tasks,
    (SELECT COUNT(*) FROM team_tasks tt WHERE tt.project_id = p.id AND tt.status = 'done') AS completed_tasks,
    (SELECT COUNT(*) FROM team_project_members tpm WHERE tpm.project_id = p.id) AS member_count,
    (SELECT COUNT(*) FROM team_project_invitations tpi WHERE tpi.project_id = p.id AND tpi.status = 'pending') AS pending_invites
  FROM team_projects p
  INNER JOIN team_project_members m ON m.project_id = p.id
  INNER JOIN users owner ON owner.id = p.owner_id
`

const TeamProject = {
  async findAllByUser(userId) {
    const [rows] = await db.query(
      `${projectSummarySelect}
       WHERE m.user_id = ?
       ORDER BY p.updated_at DESC`,
      [userId]
    )
    return rows.map(mapProject)
  },

  async findByIdForUser(projectId, userId) {
    const [rows] = await db.query(
      `${projectSummarySelect}
       WHERE p.id = ? AND m.user_id = ?
       LIMIT 1`,
      [projectId, userId]
    )
    return rows[0] ? mapProject(rows[0]) : null
  },

  async findMembers(projectId) {
    const [rows] = await db.query(
      `SELECT m.user_id, m.role, m.joined_at, u.name, u.email
       FROM team_project_members m
       INNER JOIN users u ON u.id = m.user_id
       WHERE m.project_id = ?
       ORDER BY FIELD(m.role, 'owner', 'member'), u.name ASC`,
      [projectId]
    )
    return rows
  },

  async findInvitations(projectId) {
    const [rows] = await db.query(
      `SELECT i.id, i.email, i.status, i.created_at, i.responded_at, inviter.name AS invited_by_name
       FROM team_project_invitations i
       INNER JOIN users inviter ON inviter.id = i.invited_by
       WHERE i.project_id = ?
       ORDER BY i.created_at DESC`,
      [projectId]
    )
    return rows
  },

  async findActivityMonitoring(projectId) {
    const [rows] = await db.query(
      `SELECT
         m.user_id,
         u.name,
         u.email,
         m.role,
         COUNT(CASE WHEN t.status != 'done' THEN 1 END) AS open_assigned_tasks,
         MAX(CASE WHEN t.status != 'done' THEN t.updated_at END) AS last_task_update_at,
         MAX(CASE WHEN t.status != 'done' THEN t.title END) AS latest_task_title
       FROM team_project_members m
       INNER JOIN users u ON u.id = m.user_id
       LEFT JOIN team_tasks t
         ON t.project_id = m.project_id
        AND t.assigned_to = m.user_id
       WHERE m.project_id = ?
       GROUP BY m.user_id, u.name, u.email, m.role
       ORDER BY FIELD(m.role, 'owner', 'member'), u.name ASC`,
      [projectId]
    )
    return rows.map(row => ({
      ...row,
      open_assigned_tasks: Number(row.open_assigned_tasks || 0),
    }))
  },

  async findInvitationById(invitationId) {
    const [rows] = await db.query(
      `SELECT * FROM team_project_invitations WHERE id = ? LIMIT 1`,
      [invitationId]
    )
    return rows[0] || null
  },

  async findPendingInvitationsByEmail(email) {
    const [rows] = await db.query(
      `SELECT i.id, i.project_id, i.email, i.status, i.created_at, p.name AS project_name, p.description AS project_description, inviter.name AS invited_by_name
       FROM team_project_invitations i
       INNER JOIN team_projects p ON p.id = i.project_id
       INNER JOIN users inviter ON inviter.id = i.invited_by
       WHERE i.email = ? AND i.status = 'pending'
       ORDER BY i.created_at DESC`,
      [email]
    )
    return rows
  },

  async createProject({ ownerId, name, description }) {
    const [result] = await db.query(
      `INSERT INTO team_projects (owner_id, name, description) VALUES (?, ?, ?)`,
      [ownerId, name, description || null]
    )
    await db.query(
      `INSERT INTO team_project_members (project_id, user_id, role) VALUES (?, ?, 'owner')`,
      [result.insertId, ownerId]
    )
    return result.insertId
  },

  async deleteProject(projectId) {
    await db.query(`DELETE FROM team_projects WHERE id = ?`, [projectId])
  },

  async addInvitation({ projectId, email, invitedBy, inviteToken }) {
    const [result] = await db.query(
      `INSERT INTO team_project_invitations (project_id, email, invited_by, invite_token)
       VALUES (?, ?, ?, ?)`,
      [projectId, email, invitedBy, inviteToken]
    )
    return result.insertId
  },

  async isMember(projectId, userId) {
    const [rows] = await db.query(
      `SELECT role FROM team_project_members WHERE project_id = ? AND user_id = ? LIMIT 1`,
      [projectId, userId]
    )
    return rows[0] || null
  },

  async addMember(projectId, userId, role = 'member') {
    await db.query(
      `INSERT INTO team_project_members (project_id, user_id, role)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE role = VALUES(role)`,
      [projectId, userId, role]
    )
  },

  async respondToInvitation(invitationId, status) {
    await db.query(
      `UPDATE team_project_invitations SET status = ?, responded_at = NOW() WHERE id = ?`,
      [status, invitationId]
    )
  },

  async createTask(projectId, createdBy, payload) {
    const [result] = await db.query(
      `INSERT INTO team_tasks
        (project_id, created_by, assigned_to, title, description, priority, status, deadline, estimated_hours, progress, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        createdBy,
        payload.assigned_to || null,
        payload.title,
        payload.description || null,
        payload.priority || 'medium',
        payload.status || 'todo',
        payload.deadline || null,
        payload.estimated_hours || null,
        payload.progress ?? (payload.status === 'done' ? 100 : 0),
        payload.status === 'done' ? new Date() : null,
      ]
    )
    return result.insertId
  },

  async findTasks(projectId) {
    const [rows] = await db.query(
      `SELECT
         t.*,
         creator.name AS created_by_name,
         assignee.name AS assigned_to_name,
         assignee.email AS assigned_to_email
       FROM team_tasks t
       INNER JOIN users creator ON creator.id = t.created_by
       LEFT JOIN users assignee ON assignee.id = t.assigned_to
       WHERE t.project_id = ?
       ORDER BY FIELD(t.status, 'todo', 'in_progress', 'done'), t.created_at DESC`,
      [projectId]
    )
    return rows
  },

  async findTaskById(projectId, taskId) {
    const [rows] = await db.query(
      `SELECT
         t.*,
         creator.name AS created_by_name,
         assignee.name AS assigned_to_name,
         assignee.email AS assigned_to_email
       FROM team_tasks t
       INNER JOIN users creator ON creator.id = t.created_by
       LEFT JOIN users assignee ON assignee.id = t.assigned_to
       WHERE t.project_id = ? AND t.id = ?
       LIMIT 1`,
      [projectId, taskId]
    )
    return rows[0] || null
  },

  async updateTask(projectId, taskId, payload) {
    const fields = []
    const values = []
    const allowed = ['title', 'description', 'priority', 'status', 'deadline', 'estimated_hours', 'progress', 'assigned_to']

    allowed.forEach(field => {
      if (payload[field] !== undefined) {
        fields.push(`${field} = ?`)
        values.push(payload[field] === '' ? null : payload[field])
      }
    })

    if (payload.status !== undefined) {
      fields.push('completed_at = ?')
      values.push(payload.status === 'done' ? new Date() : null)
    }

    if (!fields.length) return

    values.push(projectId, taskId)
    await db.query(
      `UPDATE team_tasks SET ${fields.join(', ')} WHERE project_id = ? AND id = ?`,
      values
    )
  },

  async deleteTask(projectId, taskId) {
    await db.query(`DELETE FROM team_tasks WHERE project_id = ? AND id = ?`, [projectId, taskId])
  },
}

module.exports = TeamProject
