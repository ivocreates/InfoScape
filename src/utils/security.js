// Security utilities for InfoScope OSINT
// Comprehensive input validation, sanitization, and security measures

import DOMPurify from 'dompurify';

/**
 * Input Validation and Sanitization
 */

// URL validation with strict security checks
export const validateURL = (url) => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL must be a non-empty string' };
  }

  // Remove dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];
  const lowercaseUrl = url.toLowerCase().trim();
  
  for (const protocol of dangerousProtocols) {
    if (lowercaseUrl.startsWith(protocol)) {
      return { valid: false, error: 'Dangerous protocol detected' };
    }
  }

  // Validate URL format
  try {
    const urlObj = new URL(url);
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS protocols allowed' };
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /[<>]/,  // HTML tags
      /javascript:/i,
      /on\w+=/i,  // Event handlers
      /eval\(/i,
      /expression\(/i,
      /script/i,
      /@import/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        return { valid: false, error: 'Suspicious URL pattern detected' };
      }
    }

    return { valid: true, sanitized: urlObj.href };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
};

// Email validation with comprehensive checks
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email must be a non-empty string' };
  }

  const trimmed = email.trim();
  
  // Basic format check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Length limits
  if (trimmed.length > 254) {
    return { valid: false, error: 'Email too long' };
  }

  const [localPart, domain] = trimmed.split('@');
  if (localPart.length > 64) {
    return { valid: false, error: 'Email local part too long' };
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    /[<>]/,
    /javascript:/i,
    /script/i,
    /['"]/
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmed)) {
      return { valid: false, error: 'Suspicious email pattern detected' };
    }
  }

  return { valid: true, sanitized: trimmed.toLowerCase() };
};

// Domain validation
export const validateDomain = (domain) => {
  if (!domain || typeof domain !== 'string') {
    return { valid: false, error: 'Domain must be a non-empty string' };
  }

  const trimmed = domain.trim().toLowerCase();
  
  // Basic domain format
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!domainRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid domain format' };
  }

  // Length check
  if (trimmed.length > 253) {
    return { valid: false, error: 'Domain too long' };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /[<>]/,
    /javascript:/i,
    /script/i,
    /\s/,  // Whitespace
    /['"]/
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) {
      return { valid: false, error: 'Suspicious domain pattern detected' };
    }
  }

  return { valid: true, sanitized: trimmed };
};

// IP address validation
export const validateIP = (ip) => {
  if (!ip || typeof ip !== 'string') {
    return { valid: false, error: 'IP must be a non-empty string' };
  }

  const trimmed = ip.trim();

  // IPv4 validation
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6 validation (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

  if (!ipv4Regex.test(trimmed) && !ipv6Regex.test(trimmed)) {
    return { valid: false, error: 'Invalid IP address format' };
  }

  // Check for private/reserved ranges
  if (ipv4Regex.test(trimmed)) {
    const parts = trimmed.split('.').map(Number);
    
    // Private ranges
    if (
      (parts[0] === 10) ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      (parts[0] === 127) || // Loopback
      (parts[0] === 0) || // Reserved
      (parts[0] >= 224) // Multicast/Reserved
    ) {
      return { valid: true, sanitized: trimmed, warning: 'Private/reserved IP address' };
    }
  }

  return { valid: true, sanitized: trimmed };
};

// Phone number validation
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone must be a non-empty string' };
  }

  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)\+\.]/g, '');
  
  // Basic phone number format (7-15 digits)
  const phoneRegex = /^[0-9]{7,15}$/;
  if (!phoneRegex.test(cleaned)) {
    return { valid: false, error: 'Invalid phone number format' };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /[<>]/,
    /javascript:/i,
    /script/i,
    /['"]/
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(phone)) {
      return { valid: false, error: 'Suspicious phone pattern detected' };
    }
  }

  return { valid: true, sanitized: cleaned };
};

// Username validation
export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username must be a non-empty string' };
  }

  const trimmed = username.trim();
  
  // Length limits
  if (trimmed.length < 1 || trimmed.length > 50) {
    return { valid: false, error: 'Username must be 1-50 characters' };
  }

  // Basic format (letters, numbers, underscore, hyphen, dot)
  const usernameRegex = /^[a-zA-Z0-9._-]+$/;
  if (!usernameRegex.test(trimmed)) {
    return { valid: false, error: 'Username contains invalid characters' };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /[<>]/,
    /javascript:/i,
    /script/i,
    /['"]/,
    /eval/i,
    /expression/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) {
      return { valid: false, error: 'Suspicious username pattern detected' };
    }
  }

  return { valid: true, sanitized: trimmed };
};

/**
 * Content Sanitization
 */

// Sanitize HTML content using DOMPurify
export const sanitizeHTML = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onclick', 'onload', 'onmouseover', 'onerror', 'style']
  });
};

// Sanitize text input
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove potential XSS patterns
  return text
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/eval\(/gi, '') // Remove eval calls
    .replace(/expression\(/gi, '') // Remove CSS expressions
    .trim();
};

/**
 * Rate Limiting
 */

const rateLimitStore = new Map();

export const rateLimit = (key, limit = 10, window = 60000) => {
  const now = Date.now();
  const windowStart = now - window;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }
  
  const requests = rateLimitStore.get(key).filter(time => time > windowStart);
  
  if (requests.length >= limit) {
    return {
      allowed: false,
      error: 'Rate limit exceeded',
      resetTime: requests[0] + window
    };
  }
  
  requests.push(now);
  rateLimitStore.set(key, requests);
  
  return {
    allowed: true,
    remaining: limit - requests.length
  };
};

/**
 * CSRF Protection
 */

// Generate CSRF token
export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Validate CSRF token
export const validateCSRFToken = (token, expectedToken) => {
  if (!token || !expectedToken) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  if (token.length !== expectedToken.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  
  return result === 0;
};

/**
 * Input Sanitization for OSINT Tools
 */

export const sanitizeOSINTInput = (input, type) => {
  switch (type) {
    case 'url':
      return validateURL(input);
    case 'email':
      return validateEmail(input);
    case 'domain':
      return validateDomain(input);
    case 'ip':
      return validateIP(input);
    case 'phone':
      return validatePhone(input);
    case 'username':
      return validateUsername(input);
    default:
      return {
        valid: true,
        sanitized: sanitizeText(input)
      };
  }
};

/**
 * Security Headers Helper
 */

export const getSecurityHeaders = () => {
  return {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https: wss:; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  };
};

/**
 * Secure Storage
 */

export const secureStorage = {
  set: (key, value, ttl = null) => {
    try {
      const item = {
        value,
        timestamp: Date.now(),
        ttl
      };
      
      // Encrypt sensitive data (implement encryption if needed)
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Secure storage set error:', error);
      return false;
    }
  },
  
  get: (key) => {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;
      
      const item = JSON.parse(itemStr);
      
      // Check TTL
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Secure storage get error:', error);
      return null;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Secure storage remove error:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Secure storage clear error:', error);
      return false;
    }
  }
};

/**
 * Security Audit Logger
 */

export const securityLogger = {
  logSecurityEvent: (event, details = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // In production, send to security monitoring service
    console.warn('[SECURITY]', logEntry);
    
    // Store locally for debugging (remove in production)
    const logs = secureStorage.get('security_logs') || [];
    logs.push(logEntry);
    
    // Keep only last 100 entries
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    secureStorage.set('security_logs', logs, 7 * 24 * 60 * 60 * 1000); // 7 days TTL
  }
};

export default {
  validateURL,
  validateEmail,
  validateDomain,
  validateIP,
  validatePhone,
  validateUsername,
  sanitizeHTML,
  sanitizeText,
  rateLimit,
  generateCSRFToken,
  validateCSRFToken,
  sanitizeOSINTInput,
  getSecurityHeaders,
  secureStorage,
  securityLogger
};