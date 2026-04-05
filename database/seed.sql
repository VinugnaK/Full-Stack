-- SmartTask Seed Data (for development / testing)
-- Run AFTER schema.sql:  mysql -u root -p smart_task_db < database/seed.sql
-- Password for demo user: password123

USE smart_task_db;

-- ─────────────────────────────────────────
-- Demo users  (bcrypt hash of "password123")
-- ─────────────────────────────────────────
INSERT INTO users (name, email, password_hash, work_hours_per_day, timezone) VALUES
('Demo User',  'demo@smarttask.dev',  '$2a$12$K8GpFpDlXziM4yM4VGvVcuCHjFpVTdCAP3PnCiS9vBtHqVFKnEkdW', 8, 'Asia/Kolkata'),
('Alice Patel','alice@smarttask.dev', '$2a$12$K8GpFpDlXziM4yM4VGvVcuCHjFpVTdCAP3PnCiS9vBtHqVFKnEkdW', 7, 'Asia/Kolkata');

-- ─────────────────────────────────────────
-- Tasks for demo user (id=1)
-- ─────────────────────────────────────────
INSERT INTO tasks (user_id, title, description, priority, status, deadline, estimated_hours, progress) VALUES
(1, 'Design login page UI',      'Create Figma mockups and React components for auth screens', 'high',     'done',        DATE_SUB(CURDATE(), INTERVAL 3 DAY),  6.0,  100),
(1, 'Build REST API endpoints',  'Auth, tasks, and analytics routes with JWT middleware',      'critical', 'in_progress', DATE_ADD(CURDATE(), INTERVAL 2 DAY),  12.0, 65),
(1, 'Frontend integration',      'Wire up React pages to all backend endpoints',               'high',     'in_progress', DATE_ADD(CURDATE(), INTERVAL 4 DAY),  8.0,  40),
(1, 'Write unit tests',          'Cover controllers and model layer with Jest',                'medium',   'todo',        DATE_ADD(CURDATE(), INTERVAL 7 DAY),  5.0,  0),
(1, 'Deploy to production',      'Package and deploy all services to cloud',                   'high',     'todo',        DATE_ADD(CURDATE(), INTERVAL 10 DAY), 4.0,  0),
(1, 'Database schema review',    'Review indexes and FK constraints with DBA',                 'low',      'review',      DATE_ADD(CURDATE(), INTERVAL 1 DAY),  2.0,  80),
(1, 'Overdue task example',      'This task demonstrates overdue detection',                   'critical', 'todo',        DATE_SUB(CURDATE(), INTERVAL 2 DAY),  3.0,  10);

-- ─────────────────────────────────────────
-- Risk scores for demo tasks
-- ─────────────────────────────────────────
INSERT INTO task_risk (task_id, risk_level, probability, suggestion) VALUES
(1, 'LOW',    0.080, 'Great! This task looks on track.'),
(2, 'HIGH',   0.820, 'High overrun risk! Start this task immediately and break it into smaller steps.'),
(3, 'MEDIUM', 0.480, 'Moderate risk. Review your schedule and ensure uninterrupted time for this task.'),
(4, 'LOW',    0.150, 'You are on track. Keep up the momentum!'),
(5, 'LOW',    0.120, 'Deadline is comfortable. Monitor as it approaches.'),
(6, 'MEDIUM', 0.390, 'Consider starting a day earlier than planned.'),
(7, 'HIGH',   0.950, 'This task is already past its deadline. Escalate or renegotiate scope immediately.');

-- ─────────────────────────────────────────
-- Activity logs
-- ─────────────────────────────────────────
INSERT INTO activity_logs (task_id, user_id, action) VALUES
(1, 1, 'created'),
(1, 1, 'progress_updated'),
(2, 1, 'created'),
(2, 1, 'progress_updated'),
(3, 1, 'created'),
(4, 1, 'created'),
(5, 1, 'created'),
(6, 1, 'created'),
(7, 1, 'created');
