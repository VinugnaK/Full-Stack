const db = require('./db')

const statements = [
  `CREATE TABLE IF NOT EXISTS team_projects (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    owner_id INT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id)
  )`,
  `CREATE TABLE IF NOT EXISTS team_project_members (
    project_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    role ENUM('owner', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES team_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_member_user (user_id)
  )`,
  `CREATE TABLE IF NOT EXISTS team_project_invitations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id INT UNSIGNED NOT NULL,
    email VARCHAR(150) NOT NULL,
    invited_by INT UNSIGNED NOT NULL,
    invite_token VARCHAR(64) NOT NULL UNIQUE,
    status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (project_id) REFERENCES team_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_project_invitation (project_id, status),
    INDEX idx_email_invitation (email, status)
  )`,
  `CREATE TABLE IF NOT EXISTS team_tasks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id INT UNSIGNED NOT NULL,
    created_by INT UNSIGNED NOT NULL,
    assigned_to INT UNSIGNED NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
    deadline DATE,
    estimated_hours DECIMAL(5,2),
    progress TINYINT UNSIGNED DEFAULT 0,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES team_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_team_tasks_project (project_id, status),
    INDEX idx_team_tasks_assigned (assigned_to)
  )`,
  `CREATE TABLE IF NOT EXISTS team_notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    project_id INT UNSIGNED NOT NULL,
    team_task_id INT UNSIGNED NULL,
    event_type ENUM('task_assigned', 'task_completed') NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES team_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (team_task_id) REFERENCES team_tasks(id) ON DELETE CASCADE,
    INDEX idx_team_notifications_user (user_id, created_at)
  )`,
]

let initialized = false

async function initTeamCollaboration() {
  if (initialized) return
  for (const statement of statements) {
    await db.query(statement)
  }
  await db.query(`
    ALTER TABLE team_notifications
    MODIFY COLUMN event_type ENUM('task_assigned', 'task_completed', 'invitation_accepted', 'invitation_declined') NOT NULL
  `)
  initialized = true
}

module.exports = initTeamCollaboration
