// Email configuration for 3Play Video Platform
// Supports SMTP, SendGrid, and Ethereal (development) transports

const getEmailConfig = () => {
  const {
    NODE_ENV,
    USE_ETHEREAL,
    EMAIL_FROM_NAME,
    EMAIL_FROM_ADDRESS,
    SUPPORT_EMAIL,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASSWORD,
    SENDGRID_API_KEY,
    CLIENT_URL
  } = process.env;

  const isDevelopment = NODE_ENV !== 'production';
  const useEthereal = isDevelopment && USE_ETHEREAL === 'true';

  // Default from address
  const from = {
    name: EMAIL_FROM_NAME || '3Play Video Platform',
    address: EMAIL_FROM_ADDRESS || 'noreply@3play.example.com'
  };

  // Support email for replies
  const supportEmail = SUPPORT_EMAIL || 'support@3play.example.com';

  // Client URL for password reset links
  const clientUrl = CLIENT_URL || (isDevelopment ? 'http://localhost:5173' : 'https://3play.example.com');

  // Ethereal configuration (development testing)
  if (useEthereal) {
    return {
      transport: 'ethereal',
      from,
      supportEmail,
      clientUrl,
      // Ethereal credentials will be generated dynamically
      ethereal: {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false
      }
    };
  }

  // SendGrid configuration (production)
  if (SENDGRID_API_KEY) {
    return {
      transport: 'sendgrid',
      from,
      supportEmail,
      clientUrl,
      sendgrid: {
        apiKey: SENDGRID_API_KEY
      }
    };
  }

  // SMTP configuration (production fallback)
  if (SMTP_HOST && SMTP_USER) {
    return {
      transport: 'smtp',
      from,
      supportEmail,
      clientUrl,
      smtp: {
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT, 10) || 587,
        secure: SMTP_SECURE === 'true',
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD
        }
      }
    };
  }

  // Fallback to console logging in development if no config provided
  if (isDevelopment) {
    return {
      transport: 'console',
      from,
      supportEmail,
      clientUrl
    };
  }

  throw new Error('Email configuration not found. Please set SMTP or SendGrid environment variables.');
};

module.exports = {
  getEmailConfig
};
