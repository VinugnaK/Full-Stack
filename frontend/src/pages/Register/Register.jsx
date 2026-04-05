import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { authService } from '../../services/authService'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', work_hours_per_day: 8 })
  const [otp, setOtp] = useState('')
  const [otpStep, setOtpStep] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const handleChange = e => {
    const field = e.target.dataset.field || e.target.name
    setForm(previous => ({ ...previous, [field]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const normalizedEmail = String(form.email || '').trim().toLowerCase()
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(normalizedEmail)) {
      toast.error('Please enter a valid Gmail address')
      return
    }
    setLoading(true)
    try {
      if (!otpStep) {
        await authService.requestRegistrationOtp({ ...form, email: normalizedEmail })
        setForm(previous => ({ ...previous, email: normalizedEmail }))
        setOtpStep(true)
        toast.success('OTP sent to your email')
      } else {
        await register({ email: normalizedEmail, otp: String(otp).trim() })
        toast.success('Account created!')
        navigate(searchParams.get('redirect') || '/dashboard')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || (otpStep ? 'OTP verification failed' : 'Failed to send OTP'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#312c51] text-[#f6efe8]">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top_left,_rgba(240,195,142,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(241,170,155,0.12),_transparent_30%)]" />

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
              Build momentum.
              <span className="mt-1 block text-[#f0c38e]">Track work with clarity.</span>
            </h1>
            <p className="mt-8 max-w-lg text-xl leading-10 text-[#c6bfdc]">
              Start your workspace with the schedule, productivity goals, and team tools you need to stay organized from day one.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                ['Personal planning', 'Set work hours and shape a realistic schedule.'],
                ['Team collaboration', 'Invite teammates, assign tasks, and keep updates visible.'],
                ['Calendar scheduling', 'Plan by date and drag work into the right day.'],
                ['AI assistance', 'Get nudges for risk, rescue, procrastination, and priority.'],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-2xl border border-[#5b557d] bg-[#48426d]/80 p-4">
                  <p className="font-semibold text-[#f6efe8]">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-[#c6bfdc]">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-[#5b557d] bg-[#48426d]/92 p-8 shadow-[0_35px_90px_rgba(10,8,22,0.4)]">
            <h2 className="text-3xl font-bold tracking-tight text-[#f6efe8]">Create account</h2>
            <p className="mt-2 text-sm text-[#c6bfdc]">
              {otpStep
                ? `Enter the 6-digit OTP sent to ${form.email} to finish creating your account.`
                : 'Set up your profile and start managing work beautifully.'}
            </p>

            <form onSubmit={handleSubmit} autoComplete="off" className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#ddd5e8]">Full Name</label>
                <input
                  name="register_name"
                  data-field="name"
                  type="text"
                  autoComplete="off"
                  required
                  value={form.name}
                  onChange={handleChange}
                  disabled={otpStep}
                  className="w-full rounded-2xl border border-[#6a638e] bg-[#312c51] px-4 py-3 text-[#f6efe8] outline-none transition focus:border-[#f0c38e] focus:ring-4 focus:ring-[#f0c38e]/15"
                  placeholder="Jane Doe"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#ddd5e8]">Email</label>
                <input
                  name="register_email"
                  data-field="email"
                  type="email"
                  pattern="^[a-zA-Z0-9._%+-]+@gmail\.com$"
                  autoComplete="off"
                  required
                  value={form.email}
                  onChange={handleChange}
                  disabled={otpStep}
                  className="w-full rounded-2xl border border-[#6a638e] bg-[#312c51] px-4 py-3 text-[#f6efe8] outline-none transition focus:border-[#f0c38e] focus:ring-4 focus:ring-[#f0c38e]/15"
                  placeholder="you@gmail.com"
                />
                <p className="mt-2 text-xs text-[#c6bfdc]">Only Gmail addresses are allowed for signup.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#ddd5e8]">Password</label>
                <input
                  name="register_password"
                  data-field="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  disabled={otpStep}
                  className="w-full rounded-2xl border border-[#6a638e] bg-[#312c51] px-4 py-3 text-[#f6efe8] outline-none transition focus:border-[#f0c38e] focus:ring-4 focus:ring-[#f0c38e]/15"
                  placeholder="Min 6 characters"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#ddd5e8]">Work Hours / Day</label>
                <input
                  name="register_work_hours_per_day"
                  data-field="work_hours_per_day"
                  type="number"
                  autoComplete="off"
                  min={1}
                  max={16}
                  value={form.work_hours_per_day}
                  onChange={handleChange}
                  disabled={otpStep}
                  className="w-full rounded-2xl border border-[#6a638e] bg-[#312c51] px-4 py-3 text-[#f6efe8] outline-none transition focus:border-[#f0c38e] focus:ring-4 focus:ring-[#f0c38e]/15"
                />
              </div>

              {otpStep && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#ddd5e8]">Email OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full rounded-2xl border border-[#6a638e] bg-[#312c51] px-4 py-3 text-[#f6efe8] outline-none transition focus:border-[#f0c38e] focus:ring-4 focus:ring-[#f0c38e]/15"
                    placeholder="Enter 6-digit OTP"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          setLoading(true)
                          await authService.requestRegistrationOtp({ ...form, email: String(form.email || '').trim().toLowerCase() })
                          toast.success('OTP resent')
                        } catch (err) {
                          toast.error(err.response?.data?.message || 'Failed to resend OTP')
                        } finally {
                          setLoading(false)
                        }
                      }}
                      className="text-sm font-semibold text-[#f0c38e] hover:text-[#f1aa9b]"
                    >
                      Resend OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtp('')
                        setOtpStep(false)
                      }}
                      className="text-sm font-semibold text-[#c6bfdc] hover:text-[#f6efe8]"
                    >
                      Edit details
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#f0c38e] px-5 py-3.5 text-base font-semibold text-[#312c51] shadow-[0_18px_36px_rgba(240,195,142,0.22)] transition hover:bg-[#f1aa9b] disabled:opacity-60"
              >
                {loading ? (otpStep ? 'Verifying...' : 'Sending OTP...') : (otpStep ? 'Verify OTP & Create account' : 'Send OTP')}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#c6bfdc]">
              Have an account?{' '}
              <Link
                to={`/login${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : ''}`}
                className="font-semibold text-[#f0c38e] hover:text-[#f1aa9b]"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
