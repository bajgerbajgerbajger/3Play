// Security configuration and middleware

// Trusted IP ranges for email service provider SMTP servers
// These IPs are whitelisted for webhook verification and rate limiting exceptions
const TRUSTED_IP_RANGES = [
  '74.220.51.0/24',  // 256 IPs: 74.220.51.0 - 74.220.51.255
  '74.220.59.0/24'   // 256 IPs: 74.220.59.0 - 74.220.59.255
];

// Parse CIDR notation and check if IP is in range
const ipToLong = (ip) => {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
};

const isIpInRange = (ip, cidr) => {
  const [rangeIp, prefix] = cidr.split('/');
  const ipLong = ipToLong(ip);
  const rangeLong = ipToLong(rangeIp);
  const mask = -1 << (32 - parseInt(prefix, 10));
  return (ipLong & mask) === (rangeLong & mask);
};

// Check if an IP address is in the trusted whitelist
const isTrustedIP = (ip) => {
  if (!ip) return false;
  return TRUSTED_IP_RANGES.some(range => isIpInRange(ip, range));
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  res.setHeader('Permissions-Policy',
    'accelerometer=(), camera=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(self), payment=(), usb=()'
  );

  // Content Security Policy for API
  res.setHeader('Content-Security-Policy', "default-src 'none'");

  next();
};

// CSRF protection configuration
const csrfProtection = {
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
};

// Password validation
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
  if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
  if (!hasNumbers) errors.push('Password must contain at least one number');
  if (!hasSpecialChar) errors.push('Password must contain at least one special character');

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Input sanitization
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

// File type validation
const allowedVideoTypes = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska'
];

const allowedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

const validateFileType = (mimetype, allowedTypes) => {
  return allowedTypes.includes(mimetype);
};

// Rate limit configurations
const rateLimitConfigs = {
  standard: {
    windowMs: 15 * 60 * 1000,
    max: 100
  },
  auth: {
    windowMs: 60 * 60 * 1000,
    max: 10
  },
  upload: {
    windowMs: 60 * 60 * 1000,
    max: 5
  }
};

// Token configuration
const tokenConfig = {
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  algorithm: 'HS256'
};

module.exports = {
  securityHeaders,
  csrfProtection,
  validatePassword,
  sanitizeInput,
  validateFileType,
  allowedVideoTypes,
  allowedImageTypes,
  rateLimitConfigs,
  tokenConfig,
  TRUSTED_IP_RANGES,
  isTrustedIP
};
