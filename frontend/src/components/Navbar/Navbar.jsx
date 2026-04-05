import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, LogOut, Menu } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { taskService } from '../../services/taskService'
import { teamProjectService } from '../../services/teamProjectService'
import { useLayout } from '../../context/LayoutContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { toggleSidebar } = useLayout()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)
  const latestTeamNotificationRef = useRef(null)
  const seenTeamNotificationIdsRef = useRef(new Set())
  const hasInitializedRef = useRef(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  useEffect(() => {
    let active = true

    const requestPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission()
      }
    }

    const pollReminders = async ({ silentInitial = false } = {}) => {
      try {
        const [reminderData, teamData] = await Promise.all([
          taskService.getDueReminders(),
          teamProjectService.getNotifications(
            latestTeamNotificationRef.current ? { since: latestTeamNotificationRef.current } : undefined
          ),
        ])
        if (!active) return

        const freshReminders = reminderData.notifications || []
        const freshTeamNotifications = (teamData.fresh || []).filter((item) => {
          if (seenTeamNotificationIdsRef.current.has(item.id)) return false
          seenTeamNotificationIdsRef.current.add(item.id)
          return true
        })

        const shouldAnnounce = hasInitializedRef.current || !silentInitial

        if (shouldAnnounce) {
          ;[...freshReminders, ...freshTeamNotifications].forEach((item) => {
            toast(item.message, { duration: 7000 })
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('SmartTask Reminder', { body: item.message })
            }
          })
        }

        const reminderHistory = (reminderData.history || []).map((item) => ({
          ...item,
          timestamp: item.sent_at,
          source: 'personal',
        }))
        const teamHistory = (teamData.history || []).map((item) => ({
          ...item,
          timestamp: item.created_at,
          source: 'team',
        }))

        teamHistory.forEach((item) => {
          seenTeamNotificationIdsRef.current.add(item.id)
        })

        const mergedHistory = [...reminderHistory, ...teamHistory].sort(
          (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
        )

        setNotifications(mergedHistory)
        setUnreadCount((previous) => previous + freshReminders.length + freshTeamNotifications.length)

        const latestCreatedAt = [...teamHistory, ...freshTeamNotifications]
          .map((item) => item.created_at)
          .filter(Boolean)
          .sort((a, b) => new Date(b) - new Date(a))[0]

        if (latestCreatedAt) {
          latestTeamNotificationRef.current = latestCreatedAt
        }

        hasInitializedRef.current = true
      } catch {
        // Quiet background polling failure.
      }
    }

    requestPermission().catch(() => {})
    pollReminders({ silentInitial: true })
    const interval = setInterval(() => pollReminders(), 10000)

    const handleWindowFocus = () => {
      pollReminders()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        pollReminders()
      }
    }

    window.addEventListener('focus', handleWindowFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      active = false
      clearInterval(interval)
      window.removeEventListener('focus', handleWindowFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleDocumentClick)
    return () => document.removeEventListener('mousedown', handleDocumentClick)
  }, [])

  const handleToggleNotifications = () => {
    setIsOpen((previous) => {
      const next = !previous
      if (next) {
        setUnreadCount(0)
      }
      return next
    })
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-10 flex h-16 items-center justify-between border-b border-[#5a547d] bg-[#312c51]/92 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded-xl border border-[#5a547d] bg-[#3b355f] p-2 text-[#f6efe8] transition-colors hover:border-[#f0c38e] hover:text-[#f0c38e]"
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c6bfdc]">TaskHub Workspace</h1>
      </div>
      <div className="flex items-center gap-3">
        <div ref={dropdownRef} className="relative">
          <button
            onClick={handleToggleNotifications}
            className="relative rounded-xl p-2 text-[#c8c1df] transition-colors hover:bg-[#3b355f] hover:text-[#f6efe8]"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[#f1aa9b] px-1.5 py-0.5 text-[10px] font-bold text-[#312c51]">
                {unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 top-12 z-20 w-96 rounded-[1.5rem] border border-[#5a547d] bg-[#3b355f] shadow-[0_30px_70px_rgba(6,5,18,0.4)]">
              <div className="border-b border-[#5a547d] px-4 py-3">
                <p className="text-sm font-semibold text-[#f6efe8]">Task Reminders</p>
                <p className="text-xs text-[#c6bfdc]">Daily reminders and near-deadline nudges</p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length ? notifications.map((item) => (
                  <div key={item.id} className="border-b border-[#544e77] px-4 py-3 last:border-b-0">
                    <p className="text-sm text-[#f3ebdf]">{item.message}</p>
                    <p className="mt-1 text-xs text-[#c6bfdc]">
                      {item.source === 'team'
                        ? `${item.project_name || 'Team project'}${item.created_at ? ` • ${new Date(item.created_at).toLocaleString('en-IN')}` : ''}`
                        : item.deadline
                          ? `Due ${String(item.deadline).split('T')[0]}${item.deadline_time ? ` at ${String(item.deadline_time).slice(0, 5)}` : ''}`
                          : 'No deadline'}
                    </p>
                  </div>
                )) : (
                  <div className="px-4 py-6 text-sm text-[#c6bfdc]">No reminders right now.</div>
                )}
              </div>
            </div>
          )}
        </div>

        <Link to="/profile" className="flex items-center gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-[#3b355f]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0c38e] text-xs font-bold text-[#312c51]">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium text-[#f6efe8]">{user?.name}</span>
        </Link>

        <button
          onClick={handleLogout}
          className="rounded-xl p-2 text-[#c8c1df] transition-colors hover:bg-[#3b355f] hover:text-[#f1aa9b]"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
