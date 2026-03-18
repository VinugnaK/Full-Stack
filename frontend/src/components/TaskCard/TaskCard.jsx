import { format, parseISO, differenceInDays } from 'date-fns'
import { Calendar, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'

const PRIORITY_STYLES = {
  low:    'bg-[#6c7bd1]/18 text-[#cfd4ff] border-[#6c7bd1]/30',
  medium: 'bg-[#f0c38e]/14 text-[#f7d8af] border-[#f0c38e]/30',
  high:   'bg-[#f1aa9b]/14 text-[#ffd3ca] border-[#f1aa9b]/30',
}

const RISK_ICON = {
  LOW:    <CheckCircle2 size={13} className="text-emerald-300" />,
  MEDIUM: <Clock size={13} className="text-[#f0c38e]" />,
  HIGH:   <AlertTriangle size={13} className="text-[#f1aa9b]" />,
}

export default function TaskCard({ task, onClick, showProgress = false }) {
  const daysLeft = task.deadline ? differenceInDays(parseISO(task.deadline), new Date()) : null
  const risk     = task.prediction?.risk_level || null
  const progress = Number.isFinite(Number(task.progress)) ? Number(task.progress) : 0

  return (
    <div
      onClick={() => onClick?.(task)}
      className="card group cursor-pointer transition-all hover:-translate-y-0.5 hover:border-[#f0c38e]/35"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[#f6efe8] transition-colors group-hover:text-[#f0c38e]">
          {task.title}
        </h3>
        {task.priority && (
          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORITY_STYLES[task.priority]}`}>
            {task.priority}
          </span>
        )}
      </div>

      {task.description && (
        <p className="mb-3 line-clamp-2 text-xs text-[#c6bfdc]">{task.description}</p>
      )}

      {showProgress && (
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-[#d7d0e8]">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#342f57]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#f0c38e_0%,#f1aa9b_100%)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-[#c6bfdc]">
          <Calendar size={12} />
          {task.deadline
            ? `${daysLeft >= 0 ? daysLeft + 'd left' : 'Overdue'}`
            : 'No deadline'}
        </div>
        {risk && (
          <div className={`flex items-center gap-1 text-xs risk-badge-${risk.toLowerCase()}`}>
            {RISK_ICON[risk]}
            {risk}
          </div>
        )}
      </div>
    </div>
  )
}
