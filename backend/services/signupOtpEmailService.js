const axios = require('axios')

const EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send'

function hasSignupOtpEmailConfig() {
  return Boolean(
    process.env.EMAILJS_SERVICE_ID &&
    process.env.EMAILJS_PUBLIC_KEY &&
    process.env.EMAILJS_PRIVATE_KEY &&
    (process.env.EMAILJS_SIGNUP_OTP_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID)
  )
}

async function sendSignupOtpEmail({ toEmail, toName, otp }) {
  if (!hasSignupOtpEmailConfig()) {
    return { sent: false, reason: 'email_not_configured' }
  }

  const templateId = process.env.EMAILJS_SIGNUP_OTP_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID

  await axios.post(
    EMAILJS_URL,
    {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        email: toEmail,
        to_email: toEmail,
        name: toName || toEmail,
        to_name: toName || toEmail,
        otp_code: otp,
        subject: 'Your TaskFlow verification code',
        message: `Use this verification code to finish creating your TaskFlow account: ${otp}`,
      },
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    }
  )

  return { sent: true }
}

module.exports = {
  hasSignupOtpEmailConfig,
  sendSignupOtpEmail,
}
