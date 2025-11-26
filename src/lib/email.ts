import logger from '@/lib/logger'

const log = logger.child({ component: 'email' })

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@pointadvisor.co'
const APP_URL = process.env.NEXTAUTH_URL || 'https://pointadvisor.co'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    log.warn('RESEND_API_KEY not configured, skipping email send', { to, subject })
    // In development, log the email content
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would be sent:')
      console.log(`   To: ${to}`)
      console.log(`   Subject: ${subject}`)
      console.log(`   Content: ${text || html}`)
    }
    return true // Return true in dev to not block the flow
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
        text
      })
    })

    if (!response.ok) {
      const error = await response.json()
      log.error('Failed to send email', { to, subject, error })
      return false
    }

    log.info('Email sent successfully', { to, subject })
    return true
  } catch (error) {
    log.error('Email send error', { 
      to, 
      subject, 
      error: error instanceof Error ? error.message : 'Unknown' 
    })
    return false
  }
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0284c7; margin: 0; font-size: 24px;">PointAdvisor</h1>
        </div>
        
        <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
          <h2 style="margin-top: 0; color: #111827;">Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #0284c7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">Reset Password</a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        </div>
        
        <div style="text-align: center; color: #9ca3af; font-size: 12px;">
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
        </div>
      </body>
    </html>
  `

  const text = `
Reset Your Password

We received a request to reset your password. Visit the link below to create a new password:

${resetUrl}

This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
  `.trim()

  return sendEmail({
    to: email,
    subject: 'Reset your PointAdvisor password',
    html,
    text
  })
}

export async function sendWelcomeEmail(email: string, firstName?: string): Promise<boolean> {
  const name = firstName || 'there'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to PointAdvisor</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0284c7; margin: 0; font-size: 24px;">PointAdvisor</h1>
        </div>
        
        <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
          <h2 style="margin-top: 0; color: #111827;">Welcome, ${name}!</h2>
          <p>Thanks for joining PointAdvisor. We're excited to help you maximize your credit card rewards.</p>
          
          <h3 style="color: #374151;">Get started:</h3>
          <ul style="color: #4b5563;">
            <li>Add your credit cards to your wallet</li>
            <li>Get personalized card recommendations</li>
            <li>Track your rewards and spending</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/dashboard" style="background: #0284c7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">Go to Dashboard</a>
          </div>
        </div>
        
        <div style="text-align: center; color: #9ca3af; font-size: 12px;">
          <p>Questions? Reply to this email and we'll help you out.</p>
        </div>
      </body>
    </html>
  `

  const text = `
Welcome to PointAdvisor, ${name}!

Thanks for joining PointAdvisor. We're excited to help you maximize your credit card rewards.

Get started:
- Add your credit cards to your wallet
- Get personalized card recommendations
- Track your rewards and spending

Visit your dashboard: ${APP_URL}/dashboard

Questions? Reply to this email and we'll help you out.
  `.trim()

  return sendEmail({
    to: email,
    subject: 'Welcome to PointAdvisor!',
    html,
    text
  })
}
