import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { authService } from '../../services/authService'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialEmail = useMemo(() => searchParams.get('email') || '', [searchParams])
  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!email.trim()) {
      toast.error('Email is required')
      return
    }

    if (!otp.trim()) {
      toast.error('OTP is required')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await authService.resetPassword({ email: email.trim().toLowerCase(), otp: otp.trim(), password })
      toast.success(response.message || 'Password reset successful')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#312c51] text-[#f6efe8]">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[26rem] bg-[radial-gradient(circle_at_top_left,_rgba(240,195,142,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(241,170,155,0.12),_transparent_30%)]" />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[#c6bfdc] transition hover:text-[#f0c38e]">
            <ArrowLeft size={16} />
            Back to sign in
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
              Choose a new password.
              <span className="mt-1 block text-[#f0c38e]">A strong reset keeps your workspace secure.</span>
            </h1>
            <p className="mt-8 max-w-lg text-xl leading-10 text-[#c6bfdc]">
              Enter the OTP from your email, then set a new password for your account.
            </p>
          </div>

          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-[#5b557d] bg-[#48426d]/92 p-8 shadow-[0_35px_90px_rgba(10,8,22,0.4)]">
            <h2 className="text-3xl font-bold tracking-tight text-[#f6efe8]">Reset password</h2>
            <p className="mt-2 text-sm text-[#c6bfdc]">Enter the email OTP and confirm your new password below.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#ddd5e8]">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-[#6a638e] bg-[#312c51] px-4 py-3 text-[#f6efe8] outline-none transition focus:border-[#f0c38e] focus:ring-4 focus:ring-[#f0c38e]/15"
                  placeholder="you@gmail.com"
                />
              </div>

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
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#ddd5e8]">New password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-[#6a638e] bg-[#312c51] px-4 py-3 pr-12 text-[#f6efe8] outline-none transition focus:border-[#f0c38e] focus:ring-4 focus:ring-[#f0c38e]/15"
                    placeholder="Enter a new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c6bfdc] transition hover:text-[#f0c38e]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#ddd5e8]">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-2xl border border-[#6a638e] bg-[#312c51] px-4 py-3 pr-12 text-[#f6efe8] outline-none transition focus:border-[#f0c38e] focus:ring-4 focus:ring-[#f0c38e]/15"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((previous) => !previous)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c6bfdc] transition hover:text-[#f0c38e]"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#f0c38e] px-5 py-3.5 text-base font-semibold text-[#312c51] shadow-[0_18px_36px_rgba(240,195,142,0.22)] transition hover:bg-[#f1aa9b] disabled:opacity-60"
              >
                {loading ? 'Resetting password...' : 'Reset password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
