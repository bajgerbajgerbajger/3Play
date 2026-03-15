// Email service for 3Play Video Platform
// Handles sending emails with Nodemailer, template rendering, and error handling

const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const { getEmailConfig } = require('../config/email');

// Store ethereal test account for development
let etherealAccount = null;

/**
 * Create Nodemailer transport based on configuration
 */
const createTransport = async () => {
  const config = getEmailConfig();

  switch (config.transport) {
    case 'ethereal':
      // Create test account if not exists
      if (!etherealAccount) {
        etherealAccount = await nodemailer.createTestAccount();
        console.log('Ethereal test account created:', etherealAccount.user);
      }
      return nodemailer.createTransport({
        host: config.ethereal.host,
        port: config.ethereal.port,
        secure: config.ethereal.secure,
        auth: {
          user: etherealAccount.user,
          pass: etherealAccount.pass
        }
      });

    case 'smtp':
      return nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.smtp.auth.user,
          pass: config.smtp.auth.pass
        },
        tls: {
          // Do not fail on invalid certs in development
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
      });

    case 'sendgrid':
      // For SendGrid, we use SMTP relay
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: config.sendgrid.apiKey
        }
      });

    case 'console':
    default:
      // Console transport for development - logs email content
      return {
        sendMail: async (mailOptions) => {
          console.log('\n========== EMAIL (Console Mode) ==========');
          console.log('To:', mailOptions.to);
          console.log('From:', mailOptions.from);
          console.log('Subject:', mailOptions.subject);
          console.log('Text:', mailOptions.text?.substring(0, 200) + '...');
          console.log('==========================================\n');
          return { messageId: 'console-' + Date.now() };
        }
      };
  }
};

/**
 * Default email templates
 */
const defaultTemplates = {
  'password-reset': {
    subject: 'Reset Your 3Play Password',
    text: (data) => `Hello ${data.name || 'User'},

You requested a password reset for your 3Play Video Platform account.

Click the link below to reset your password:
${data.resetUrl}

This link will expire in 30 minutes.

If you didn't request this reset, please ignore this email or contact support if you have concerns.

Best regards,
The 3Play Team`,
    html: (data) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .button:hover { background: #5568d3; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
    .link { word-break: break-all; color: #667eea; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔒 Password Reset Request</h1>
  </div>
  <div class="content">
    <p>Hello ${data.name || 'User'},</p>
    <p>You requested a password reset for your 3Play Video Platform account.</p>
    <p>Click the button below to reset your password:</p>
    <p><a href="${data.resetUrl}" class="button">Reset Password</a></p>
    <p>Or copy and paste this link into your browser:</p>
    <p><span class="link">${data.resetUrl}</span></p>
    <p><strong>This link will expire in 30 minutes.</strong></p>
    <p>If you didn't request this reset, please ignore this email or contact support if you have concerns.</p>
  </div>
  <div class="footer">
    <p>Best regards,<br>The 3Play Team</p>
    <p>Need help? Contact us at <a href="mailto:${data.supportEmail}">${data.supportEmail}</a></p>
  </div>
</body>
</html>`
  }
};

/**
 * Load email template
 * @param {string} templateName - Name of the template
 * @returns {Object} Template with subject, text, and html functions
 */
const loadTemplate = (templateName) => {
  // Try to load from external file (optional)
  try {
    const fs = require('fs');
    const path = require('path');
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.json`);

    if (fs.existsSync(templatePath)) {
      const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      return {
        subject: templateData.subject,
        text: handlebars.compile(templateData.text),
        html: handlebars.compile(templateData.html)
      };
    }
  } catch (error) {
    console.warn(`Failed to load external template ${templateName}:`, error.message);
  }

  // Fall back to default templates
  const defaultTemplate = defaultTemplates[templateName];
  if (!defaultTemplate) {
    throw new Error(`Email template '${templateName}' not found`);
  }

  return {
    subject: defaultTemplate.subject,
    text: defaultTemplate.text,
    html: defaultTemplate.html
  };
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.template - Template name
 * @param {Object} options.data - Template data
 * @returns {Promise<Object>} - Email send result
 */
const sendEmail = async ({ to, template, data = {} }) => {
  try {
    const config = getEmailConfig();
    const transport = await createTransport();
    const emailTemplate = loadTemplate(template);

    // Prepare template data with common variables
    const templateData = {
      ...data,
      supportEmail: config.supportEmail,
      clientUrl: config.clientUrl,
      year: new Date().getFullYear()
    };

    // Compile templates
    const subject = emailTemplate.subject;
    const text = typeof emailTemplate.text === 'function'
      ? emailTemplate.text(templateData)
      : emailTemplate.text;
    const html = typeof emailTemplate.html === 'function'
      ? emailTemplate.html(templateData)
      : emailTemplate.html;

    // Send email
    const mailOptions = {
      from: config.from,
      to,
      subject,
      text,
      html
    };

    const result = await transport.sendMail(mailOptions);

    // Log Ethereal preview URL in development
    if (config.transport === 'ethereal' && result.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(result);
      console.log('Email sent! Preview URL:', previewUrl);
    }

    return {
      success: true,
      messageId: result.messageId,
      previewUrl: config.transport === 'ethereal' ? nodemailer.getTestMessageUrl(result) : null
    };

  } catch (error) {
    console.error('Email sending failed:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} resetToken - Password reset token
 * @returns {Promise<Object>} - Email send result
 */
const sendPasswordResetEmail = async (email, name, resetToken) => {
  const config = getEmailConfig();
  const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;

  return sendEmail({
    to: email,
    template: 'password-reset',
    data: {
      name,
      resetUrl,
      resetToken // Only for development logging
    }
  });
};

/**
 * Send email verification email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} verificationToken - Email verification token
 * @returns {Promise<Object>} - Email send result
 */
const sendVerificationEmail = async (email, name, verificationToken) => {
  const config = getEmailConfig();
  const verificationUrl = `${config.clientUrl}/verify-email?token=${verificationToken}`;

  return sendEmail({
    to: email,
    template: 'email-verification',
    data: {
      name,
      verificationUrl,
      verificationToken // Only for development logging
    }
  });
};

/**
 * Verify email configuration
 * @returns {Promise<Object>} - Verification result
 */
const verifyConfig = async () => {
  try {
    const config = getEmailConfig();
    const transport = await createTransport();

    if (config.transport === 'console') {
      return {
        success: true,
        transport: 'console',
        message: 'Email configured for console output (development mode)'
      };
    }

    // Verify SMTP connection
    if (config.transport !== 'console') {
      await transport.verify();
    }

    return {
      success: true,
      transport: config.transport,
      from: config.from,
      message: 'Email configuration verified successfully'
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Email configuration verification failed'
    };
  }
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  verifyConfig,
  getEmailConfig
};
