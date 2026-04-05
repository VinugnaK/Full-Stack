const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const User = require('../models/userModel')
const PasswordReset = require('../models/passwordResetModel')
const SignupVerification = require('../models/signupVerificationModel')
const { generateToken } = require('../utils/tokenUtils')
const { sendPasswordResetEmail } = require('../services/passwordResetEmailService')
const { sendSignupOtpEmail } = require('../services/signupOtpEmailService')

function isAllowedGoogleEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(String(email || '').trim())
}

exports.register = async (req, res, next) => {
  try {
    res.status(410).json({ message: 'Use OTP verification to complete account creation' })
  } catch (err) { next(err) }
}

exports.requestRegistrationOtp = async (req, res, next) => {
  try {
    const { name, email, password, work_hours_per_day, productivity_goal, preferred_working_time } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }

    const normalizedEmail = String(email || '').trim().toLowerCase()

    if (!isAllowedGoogleEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please use a valid Gmail address to create an account' })
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' })
    }

    const existing = await User.findByEmail(normalizedEmail)
    if (existing) return res.status(409).json({ message: 'Email already registered' })

    await SignupVerification.clearExpired()

    const password_hash = await bcrypt.hash(password, 10)
    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const otp_hash = crypto.createHash('sha256').update(otp).digest('hex')
    const expires_at = new Date(Date.now() + 1000 * 60 * 10)

    await SignupVerification.upsert({
      email: normalizedEmail,
      name: String(name).trim(),
      password_hash,
      work_hours_per_day,
      productivity_goal,
      preferred_working_time,
      otp_hash,
      expires_at,
    })

    await sendSignupOtpEmail({
      toEmail: normalizedEmail,
      toName: name,
      otp,
    })

    res.json({
      message: 'Verification code sent to your email',
      email: normalizedEmail,
      expires_in_minutes: 10,
    })
  } catch (err) { next(err) }
}

exports.verifyRegistrationOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' })
    }

    const normalizedEmail = String(email || '').trim().toLowerCase()
    const pending = await SignupVerification.findByEmail(normalizedEmail)

    if (!pending || new Date(pending.expires_at) < new Date()) {
      if (pending) await SignupVerification.deleteByEmail(normalizedEmail)
      return res.status(400).json({ message: 'This verification code is invalid or has expired' })
    }

    const otp_hash = crypto.createHash('sha256').update(String(otp).trim()).digest('hex')
    if (otp_hash !== pending.otp_hash) {
      return res.status(400).json({ message: 'Incorrect verification code' })
    }

    const existing = await User.findByEmail(normalizedEmail)
    if (existing) {
      await SignupVerification.deleteByEmail(normalizedEmail)
      return res.status(409).json({ message: 'Email already registered' })
    }

    const id = await User.create({
      name: pending.name,
      email: pending.email,
      password_hash: pending.password_hash,
      work_hours_per_day: pending.work_hours_per_day,
      productivity_goal: pending.productivity_goal,
      preferred_working_time: pending.preferred_working_time,
    })

    await SignupVerification.deleteByEmail(normalizedEmail)

    const user = await User.findById(id)
    const token = generateToken({ id, email: normalizedEmail })
    res.status(201).json({ token, user })
  } catch (err) { next(err) }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })
    const user = await User.findByEmail(email)
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) return res.status(401).json({ message: 'Invalid credentials' })
    const token = generateToken({ id: user.id, email: user.email })
    const { password_hash, ...safeUser } = user
    res.json({ token, user: safeUser })
  } catch (err) { next(err) }
}

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) { next(err) }
}

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, work_hours_per_day, productivity_goal, preferred_working_time } = req.body
    await User.update(req.user.id, { name, work_hours_per_day, productivity_goal, preferred_working_time })
    const user = await User.findById(req.user.id)
    res.json({ message: 'Profile updated', user })
  } catch (err) { next(err) }
}

exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const user = await User.findByEmail(email)
    if (user) {
      const otpCode = String(Math.floor(100000 + Math.random() * 900000))
      const tokenHash = crypto.createHash('sha256').update(otpCode).digest('hex')
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30)

      await PasswordReset.invalidateForUser(user.id)
      await PasswordReset.create({
        userId: user.id,
        tokenHash,
        expiresAt,
      })

      try {
        await sendPasswordResetEmail({
          toEmail: user.email,
          toName: user.name,
          otpCode,
        })
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError.response?.data || emailError.message)
      }
    }

    res.json({
      message: 'If that email is registered, a password reset OTP has been sent.',
    })
  } catch (err) { next(err) }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body
    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Email, OTP and new password are required' })
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' })
    }

    const tokenHash = crypto.createHash('sha256').update(String(otp).trim()).digest('hex')
    const resetRow = await PasswordReset.findValidByEmailAndTokenHash(String(email).trim().toLowerCase(), tokenHash)

    if (!resetRow) {
      return res.status(400).json({ message: 'This OTP is invalid or has expired' })
    }

    const password_hash = await bcrypt.hash(password, 10)
    await User.updatePassword(resetRow.user_id, password_hash)
    await PasswordReset.markUsed(resetRow.id)
    await PasswordReset.invalidateForUser(resetRow.user_id)

    res.json({ message: 'Password reset successful. You can now sign in.' })
  } catch (err) { next(err) }
}
