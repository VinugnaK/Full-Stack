const axios = require('axios')

const EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send'

function hasInviteEmailConfig() {
  return Boolean(
    process.env.EMAILJS_SERVICE_ID &&
    process.env.EMAILJS_TEMPLATE_ID &&
    process.env.EMAILJS_PUBLIC_KEY &&
    process.env.EMAILJS_PRIVATE_KEY
  )
}

async function sendEmailJsTemplate({ templateId, templateParams }) {
  await axios.post(
    EMAILJS_URL,
    {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: templateParams,
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    }
  )
}

async function sendProjectInvitationEmail({
  toEmail,
  inviteeName,
  inviterName,
  projectName,
  projectDescription,
  appUrl,
}) {
  if (!hasInviteEmailConfig()) {
    return { sent: false, reason: 'email_not_configured' }
  }

  await sendEmailJsTemplate({
    templateId: process.env.EMAILJS_TEMPLATE_ID,
    templateParams: {
      email: toEmail,
      to_email: toEmail,
      name: inviteeName || toEmail,
      to_name: inviteeName || toEmail,
      project_name: projectName,
      project_description: projectDescription || 'No description provided.',
      from_name: inviterName,
      invited_by_name: inviterName,
      invite_link: appUrl,
      app_link: appUrl,
      message: `${inviterName} invited you to collaborate on "${projectName}".`,
    },
  })

  return { sent: true }
}

async function sendInvitationResponseEmail({
  toEmail,
  ownerName,
  memberName,
  projectName,
  action,
  appUrl,
}) {
  if (!hasInviteEmailConfig()) {
    return { sent: false, reason: 'email_not_configured' }
  }

  const verb = action === 'accept' ? 'accepted' : 'declined'
  const subject =
    action === 'accept'
      ? `${memberName} accepted your team invite`
      : `${memberName} declined your team invite`

  const templateId = process.env.EMAILJS_RESPONSE_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID

  await sendEmailJsTemplate({
    templateId,
    templateParams: {
      email: toEmail,
      to_email: toEmail,
      name: ownerName || toEmail,
      to_name: ownerName || toEmail,
      from_name: memberName,
      invited_by_name: memberName,
      member_name: memberName,
      owner_name: ownerName || toEmail,
      project_name: projectName,
      response_status: action,
      invite_action: action,
      subject,
      invite_link: appUrl,
      app_link: appUrl,
      message: `${memberName} ${verb} your invitation for "${projectName}". Click below to open the project in TaskFlow.`,
    },
  })

  return { sent: true }
}

module.exports = {
  hasInviteEmailConfig,
  sendProjectInvitationEmail,
  sendInvitationResponseEmail,
}
