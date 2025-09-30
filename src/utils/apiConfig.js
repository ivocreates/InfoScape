/**
 * Secure API Configuration Manager
 * Handles environment variables and API keys securely
 */

// Environment validation helper
export const validateEnvVars = (requiredVars) => {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    return false;
  }
  return true;
};

// Firebase configuration
export const getFirebaseConfig = () => {
  const requiredVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    'REACT_APP_FIREBASE_APP_ID'
  ];

  if (!validateEnvVars(requiredVars)) {
    throw new Error('Firebase configuration is incomplete. Please check your .env file.');
  }

  return {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
  };
};

// Google AI API configuration
export const getGoogleAIConfig = () => {
  const apiKey = process.env.REACT_APP_GOOGLE_AI_API_KEY;
  if (!apiKey || apiKey === 'your_google_ai_api_key_here') {
    console.warn('Google AI API key not configured. AI features will be disabled.');
    return null;
  }
  return { apiKey };
};

// Razorpay configuration
export const getRazorpayConfig = () => {
  const keyId = process.env.REACT_APP_RAZORPAY_KEY_ID;
  const keySecret = process.env.REACT_APP_RAZORPAY_KEY_SECRET;
  
  if (!keyId || keyId === 'your_razorpay_key_id_here') {
    console.warn('Razorpay configuration not found. Payment features will be disabled.');
    return null;
  }
  
  return { keyId, keySecret };
};

// Development configuration
export const isDevelopment = () => {
  return process.env.REACT_APP_ENVIRONMENT === 'development' || process.env.NODE_ENV === 'development';
};

export const isDebugMode = () => {
  return process.env.REACT_APP_DEBUG_MODE === 'true';
};

// API rate limiting configuration
export const getAPIRateLimits = () => {
  return {
    google: {
      requestsPerHour: 100,
      requestsPerMinute: 10
    },
    firebase: {
      readsPerDay: 50000,
      writesPerDay: 20000
    },
    ai: {
      requestsPerDay: 1000,
      requestsPerMinute: 60
    }
  };
};

// Security headers and CORS configuration
export const getSecurityConfig = () => {
  return {
    allowedOrigins: isDevelopment() 
      ? ['http://localhost:3000', 'http://127.0.0.1:3000']
      : ['https://infoscope-osint.web.app', 'https://infoscope-osint.firebaseapp.com'],
    maxRequestSize: '10mb',
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    csrfProtection: true,
    httpOnly: true,
    secure: !isDevelopment()
  };
};

// Logging configuration
export const getLoggingConfig = () => {
  return {
    level: isDevelopment() ? 'debug' : 'error',
    enableConsole: isDevelopment(),
    enableAnalytics: !isDevelopment() && process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
    enableErrorReporting: !isDevelopment()
  };
};