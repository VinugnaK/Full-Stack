import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const handleChange = e => {
    const field = e.target.dataset.field || e.target.name
    setForm(previous => ({ ...previous, [field]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate(searchParams.get('redirect') || '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#312c51] text-[#f6efe8]">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[26rem] bg-[radial-gradient(circle_at_top_left,_rgba(240,195,142,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(241,170,155,0.12),_transparent_30%)]" />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#c6bfdc] transition hover:text-[#f0c38e]">
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0c38e] text-lg font-bold text-[#312c51] shadow-[0_10px_30px_rgba(240,195,142,0.28)]">
              T
            </div>
            <span className="text-2xl font-bold tracking-tight">TaskFlow</span>
          </Link>
        </div>

        <div className="grid flex-1 items-center gap-14 py-10 lg:grid-cols-[0.95fr_0.85fr]">
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold leading-[0.96] tracking-[-0.04em] text-[#f6efe8] sm:text-6xl">
              Focus on the next move.
              <span className="mt-1 block text-[#f0c38e]">We&apos;ll keep the work aligned.</span>
            </h1>
            <p className="mt-8 max-w-lg text-xl leading-10 text-[#c6bfdc]">
              Sign in to continue planning, prioritizing, and tracking everything from personal to-dos to shared team projects.
            </p>
            <div className="mt-10 space-y-4">
              {[
                'See what needs attention first',
                'Track deadlines, calendar plans, and team updates',
                'Use AI recommendations to stay on schedule',
              ].map(item => (
                <div key={item} className="flex items-center gap-3 text-sm text-[#c6bfdc]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f0c38e]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-[#5b557d] bg-[#48426d]/92 p-8 shadow-[0_35px_90px_rgba(10,8,22,0.4)]">
            <h2 className="text-3xl font-bold tracking-tight text-[#f6efe8]">Sign in</h2>
            <p className="mt-2 text-sm text-[#c6bfdc]">Enter your credentials to continue your workflow.</p>

            <form onSubmit={handleSubmit} autoComplete="off" className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#ddd5e8]">Email</label>
                <input
                  name="login_email"
                  data-field="email"
                  type="email"
                  autoComplete="off"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#6a638e] bg-[#312c51] px-4 py-3 text-[#f6efe8] outline-none transition focus:border-[#f0c38e] focus:ring-4 focus:ring-[#f0c38e]/15"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#ddd5e8]">Password</label>
                <div className="relative">
                  <input
                    name="login_password"
                    data-field="password"
                    type={show ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#6a638e] bg-[#312c51] px-4 py-3 pr-12 text-[#f6efe8] outline-none transition focus:border-[#f0c38e] focus:ring-4 focus:ring-[#f0c38e]/15"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(previous => !previous)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c6bfdc] transition hover:text-[#f0c38e]"
                  >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="mt-2 flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-[#f0c38e] transition hover:text-[#f1aa9b]"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#f0c38e] px-5 py-3.5 text-base font-semibold text-[#312c51] shadow-[0_18px_36px_rgba(240,195,142,0.22)] transition hover:bg-[#f1aa9b] disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#c6bfdc]">
              No account?{' '}
              <Link
                to={`/register${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : ''}`}
                className="font-semibold text-[#f0c38e] hover:text-[#f1aa9b]"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
