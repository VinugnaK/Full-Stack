import { useState } from 'react'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import Sidebar from '../../components/Sidebar/Sidebar'
import Navbar from '../../components/Navbar/Navbar'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    work_hours_per_day: user?.work_hours_per_day || 8,
    productivity_goal: user?.productivity_goal || '',
    preferred_working_time: user?.preferred_working_time || '',
  })
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const result = await authService.updateProfile(form)
      if (result?.user) {
        refreshUser(result.user)
      }
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!user?.email) {
      toast.error('No email found for this account')
      return
    }

    setResetLoading(true)
    try {
      await authService.requestPasswordReset(user.email)
      toast.success(`Password reset OTP sent to ${user.email}`)
    } catch {
      toast.error('Failed to send password reset email')
    } finally {
      setResetLoading(false)
    }
  }

  const handleOtpPasswordReset = async () => {
    if (!user?.email) {
      toast.error('No email found for this account')
      return
    }

    if (!otp.trim()) {
      toast.error('Enter the OTP from your email')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setResetLoading(true)
    try {
      const response = await authService.resetPassword({
        email: user.email,
        otp: otp.trim(),
        password: newPassword,
      })
      toast.success(response.message || 'Password reset successful')
      setOtp('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#312c51]">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(240,195,142,0.12),_transparent_28%),linear-gradient(180deg,_#312c51_0%,_#2a2643_100%)] p-6 pt-20">
          <div className="mx-auto w-full max-w-4xl">
            <h1 className="mb-6 text-4xl font-black tracking-[-0.04em] text-[#f6efe8]">Profile</h1>

            <div className="card mb-5 border border-[#5b557d] bg-[#48426d]/88">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0c38e] text-2xl font-bold text-[#312c51]">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#f6efe8]">{user?.name}</p>
                  <p className="text-sm text-[#c6bfdc]">{user?.email}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#ddd5e8]">Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} className="input-field" />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#ddd5e8]">Work Hours Per Day</label>
                  <input
                    name="work_hours_per_day"
                    type="number"
                    min={1}
                    max={16}
                    value={form.work_hours_per_day}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#ddd5e8]">Productivity Goal</label>
                  <input
                    name="productivity_goal"
                    value={form.productivity_goal}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Finish 3 important tasks daily"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#ddd5e8]">Preferred Working Time</label>
                  <select
                    name="preferred_working_time"
                    value={form.preferred_working_time}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select your best focus window</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#ddd5e8]">Email</label>
                  <input value={user?.email} disabled className="input-field cursor-not-allowed opacity-50" />
                </div>

                <div className="rounded-[22px] border border-[#5b557d] bg-[#3d3762] p-4">
                  <p className="text-sm font-semibold text-[#f6efe8]">Password</p>
                  <p className="mt-2 text-sm leading-6 text-[#c6bfdc]">
                    For security, your current password cannot be viewed here. Send an OTP to your email, then enter it below to set a new password from this page.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      disabled={resetLoading}
                      className="btn-ghost disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {resetLoading ? 'Sending OTP...' : 'Send Password Reset OTP'}
                    </button>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#ddd5e8]">Email OTP</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        value={otp}
                        onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="input-field"
                        placeholder="Enter 6-digit OTP"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#ddd5e8]">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                          className="input-field pr-12"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((previous) => !previous)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c6bfdc] transition hover:text-[#f0c38e]"
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#ddd5e8]">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          className="input-field pr-12"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((previous) => !previous)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c6bfdc] transition hover:text-[#f0c38e]"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleOtpPasswordReset}
                      disabled={resetLoading}
                      className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {resetLoading ? 'Resetting password...' : 'Verify OTP & Reset Password'}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 disabled:opacity-60">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
