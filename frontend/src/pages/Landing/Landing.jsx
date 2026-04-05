import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Zap } from 'lucide-react'

const previewTasks = [
  { title: 'Design homepage mockup', priority: 'HIGH', owner: 'S', ownerClass: 'bg-[#f0c38e] text-[#312c51]', badgeClass: 'bg-[#644861] text-[#ffe3dc]' },
  { title: 'Review API documentation', priority: 'MED', owner: 'A', ownerClass: 'bg-[#6c7bd1] text-white', badgeClass: 'bg-[#5a547d] text-[#f6efe8]' },
  { title: 'Set up CI/CD pipeline', priority: 'LOW', owner: 'R', ownerClass: 'bg-[#8fd3b6] text-[#1f2837]', badgeClass: 'bg-[#4d6a66] text-[#dcfff1]', done: true },
]

const progressRows = [
  { name: 'Website Redesign', value: 72, color: 'bg-[#f0c38e]' },
  { name: 'Mobile App', value: 45, color: 'bg-[#6c7bd1]' },
  { name: 'Client Launch', value: 88, color: 'bg-[#8fd3b6]' },
]

const benefits = [
  'Plan daily work and team projects in one place',
  'See deadlines, ownership, and progress at a glance',
  'Use AI cues to decide what deserves attention first',
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#312c51] text-[#f6efe8]">
      <div className="absolute inset-x-0 top-0 -z-0 h-[34rem] bg-[radial-gradient(circle_at_top_left,_rgba(240,195,142,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(241,170,155,0.12),_transparent_28%)]" />

      <nav className="sticky top-0 z-20 border-b border-[#5b557d] bg-[#312c51]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0c38e] text-[#312c51] shadow-[0_10px_30px_rgba(240,195,142,0.28)]">
              <span className="text-lg font-bold">T</span>
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">TaskFlow</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-2xl border border-[#6a638e] bg-[#48426d] px-5 py-3 text-sm font-semibold text-[#f6efe8] transition hover:border-[#f0c38e] hover:bg-[#5a547d]"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-2xl bg-[#f0c38e] px-6 py-3 text-sm font-semibold text-[#312c51] shadow-[0_16px_35px_rgba(240,195,142,0.2)] transition hover:bg-[#f1aa9b]"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-8 lg:pt-20">
        <section className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold leading-[0.94] tracking-[-0.04em] text-[#f6efe8] sm:text-6xl lg:text-[5.2rem]">
              Manage tasks.
              <span className="mt-1 block text-[#f0c38e]">Ship faster.</span>
              <span className="mt-1 block">Stay aligned.</span>
            </h1>

            <p className="mt-8 max-w-lg text-xl leading-10 text-[#c6bfdc]">
              TaskFlow gives your team one place to plan, prioritize, and track every task from daily to-dos to complex
              multi-team projects.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-[1.35rem] bg-[#f0c38e] px-8 py-4 text-lg font-semibold text-[#312c51] shadow-[0_20px_36px_rgba(240,195,142,0.24)] transition hover:bg-[#f1aa9b]"
              >
                Start for free
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="rounded-[1.35rem] border border-[#6a638e] bg-[#48426d] px-8 py-4 text-lg font-semibold text-[#f6efe8] transition hover:border-[#f0c38e] hover:bg-[#5a547d]"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-10 space-y-3">
              {benefits.map(item => (
                <div key={item} className="flex items-center gap-3 text-sm text-[#c6bfdc]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#48426d] shadow-sm">
                    <CheckCircle2 size={16} className="text-[#f0c38e]" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 flex items-center gap-6 text-sm text-[#c6bfdc]">
              <div className="flex -space-x-3">
                {['#f97316', '#3b82f6', '#22c55e', '#8b5cf6', '#06b6d4'].map(color => (
                  <span
                    key={color}
                    className="h-10 w-10 rounded-full border-4 border-[#312c51]"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div>
                <p className="font-semibold text-[#f6efe8]">Loved by focused teams</p>
                <p>Built for daily execution, clarity, and momentum.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-10 h-52 w-52 rounded-full bg-[#f0c38e]/14 blur-3xl" />
            <div className="absolute -right-4 bottom-6 h-56 w-56 rounded-full bg-[#f1aa9b]/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-[#5b557d] bg-[#48426d] shadow-[0_35px_90px_rgba(10,8,22,0.34)]">
              <div className="flex items-center justify-between border-b border-[#5b557d] bg-[#3d3762] px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                  <span className="ml-2 text-lg font-semibold text-[#c6bfdc]">taskflow.app</span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-[#48426d] p-1 text-sm font-semibold text-[#c6bfdc] shadow-sm">
                  <span className="rounded-xl bg-[#f0c38e] px-4 py-2 text-[#312c51]">Board</span>
                  <span className="px-3 py-2">List</span>
                  <span className="px-3 py-2">Analytics</span>
                </div>
              </div>

              <div className="space-y-6 p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-[#ece4db] bg-white p-4">
                    <p className="text-sm font-semibold uppercase tracking-wide text-[#b0a59a]">Total Tasks</p>
                    <p className="mt-5 text-5xl font-bold tracking-tight text-[#201d1a]">24</p>
                    <p className="mt-3 text-lg font-medium text-[#22c55e]">↑ 3 this week</p>
                  </div>
                  <div className="rounded-2xl border border-[#ece4db] bg-white p-4">
                    <p className="text-sm font-semibold uppercase tracking-wide text-[#b0a59a]">Completed</p>
                    <p className="mt-5 text-5xl font-bold tracking-tight text-[#201d1a]">18</p>
                    <p className="mt-3 text-lg font-medium text-[#22c55e]">75% done rate</p>
                  </div>
                  <div className="rounded-2xl border border-[#ece4db] bg-white p-4">
                    <p className="text-sm font-semibold uppercase tracking-wide text-[#b0a59a]">Overdue</p>
                    <p className="mt-5 text-5xl font-bold tracking-tight text-[#201d1a]">2</p>
                    <p className="mt-3 text-lg font-medium text-[#ef4444]">↓ from 5</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-[#b0a59a]">Today&apos;s Tasks</p>
                  <div className="mt-4 space-y-4">
                    {previewTasks.map(task => (
                      <div
                        key={task.title}
                        className="flex items-center justify-between rounded-2xl border border-[#ece4db] bg-white px-5 py-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-md border ${task.done ? 'border-green-500 bg-green-500' : 'border-[#d7cdc0] bg-[#fbfaf8]'}`}>
                            {task.done && <CheckCircle2 size={14} className="text-white" />}
                          </div>
                          <div>
                            <p className={`text-2xl font-medium leading-tight ${task.done ? 'text-[#9c948b] line-through' : 'text-[#23201d]'}`}>
                              {task.title}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`rounded-xl px-3 py-1 text-sm font-bold ${task.badgeClass}`}>
                            {task.priority}
                          </span>
                          <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${task.ownerClass}`}>
                            {task.owner}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-[#b0a59a]">Project Progress</p>
                  <div className="mt-4 space-y-4">
                    {progressRows.map(row => (
                      <div key={row.name}>
                        <div className="mb-1 flex items-center justify-between text-lg">
                          <span className="font-medium text-[#3b352f]">{row.name}</span>
                          <span className="font-semibold text-[#5f564e]">{row.value}%</span>
                        </div>
                        <div className="h-3 rounded-full bg-[#e8e1d8]">
                          <div className={`h-3 rounded-full ${row.color}`} style={{ width: `${row.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
