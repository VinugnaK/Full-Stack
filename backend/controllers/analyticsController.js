const { pool } = require('../config/db')

const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id
    const period = req.query.period || 'weekly'

    const now = new Date()
    let startDate = new Date()
    let groupBy = 'DATE(t.created_at)'
    let labelFormat = '%a'

    if (period === 'monthly') {
      startDate.setDate(now.getDate() - 30)
      groupBy = 'WEEK(t.created_at)'
      labelFormat = 'Week %u'
    } else if (period === 'yearly') {
      startDate.setFullYear(now.getFullYear() - 1)
      groupBy = 'MONTH(t.created_at)'
      labelFormat = '%b'
    } else {
      startDate.setDate(now.getDate() - 7)
    }

    const startStr = startDate.toISOString().slice(0, 10)

    const [[totals]] = await pool.execute(
      `SELECT
         COUNT(*) as total,
         SUM(status = 'done') as completed,
         SUM(status != 'done' AND deadline < NOW()) as overdue,
         SUM(status != 'done' AND deadline >= NOW()) as active
       FROM tasks WHERE user_id = ?`,
      [userId]
    )

    const productivity_score = totals.total > 0
      ? Math.round((totals.completed / totals.total) * 100)
      : 0

    const on_time_rate = totals.completed > 0
      ? Math.round(((totals.completed - (totals.overdue || 0)) / totals.completed) * 100)
      : 0

    const [chartRows] = await pool.execute(
      `SELECT
         DATE_FORMAT(created_at, ?) as name,
         SUM(status = 'done') as completed,
         SUM(status != 'done' AND deadline < NOW()) as overdue
       FROM tasks
       WHERE user_id = ? AND created_at >= ?
       GROUP BY ${groupBy}
       ORDER BY created_at ASC`,
      [labelFormat, userId, startStr]
    )

    const [productivityRows] = await pool.execute(
      `SELECT
         DATE_FORMAT(created_at, ?) as name,
         ROUND(SUM(status = 'done') / COUNT(*) * 100) as score,
         COUNT(*) as tasks
       FROM tasks
       WHERE user_id = ? AND created_at >= ?
       GROUP BY ${groupBy}
       ORDER BY created_at ASC`,
      [labelFormat, userId, startStr]
    )

    const [riskRows] = await pool.execute(
      `SELECT r.risk_level as name, COUNT(*) as value
       FROM task_risk r
       JOIN tasks t ON t.id = r.task_id
       WHERE t.user_id = ?
       GROUP BY r.risk_level`,
      [userId]
    )

    const insight = generateInsight(totals, productivity_score, period)

    res.json({
      summary: {
        total: totals.total,
        completed: totals.completed,
        overdue: totals.overdue,
        active: totals.active,
        productivity_score,
        on_time_rate
      },
      chart_data: chartRows,
      productivity_data: productivityRows,
      risk_distribution: riskRows,
      insight
    })
  } catch (err) {
    next(err)
  }
}

function generateInsight(totals, score, period) {
  if (totals.total === 0) return 'Create your first task to start seeing insights!'
  if (score >= 80) return `Excellent work this ${period}! You completed ${totals.completed} tasks with a ${score}% productivity score. Keep the momentum going.`
  if (score >= 50) return `Good progress this ${period}. You have ${totals.overdue || 0} overdue tasks — consider prioritizing them to improve your score.`
  return `Your productivity score is ${score}% this ${period}. You have ${totals.overdue || 0} overdue tasks. Focus on clearing the backlog before adding new work.`
}

module.exports = { getAnalytics }
