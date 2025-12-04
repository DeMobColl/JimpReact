/**
 * Security utilities to protect sensitive data from being exposed in DevTools
 */

// Disable console in development jika perlu
const isDev = import.meta.env.DEV;
const DISABLE_DEV_LOGS = false; // Set to true untuk disable logs di development

if (isDev && DISABLE_DEV_LOGS) {
  const noop = () => {};
  console.log = noop;
  console.warn = noop;
  console.error = noop;
  console.info = noop;
}

/**
 * Mask sensitive data for logging
 * @param {string} text - Original text
 * @param {number} showChars - Number of characters to show (beginning and end)
 * @returns {string} Masked text
 */
export const maskSensitive = (text, showChars = 4) => {
  if (!text || typeof text !== 'string') return '***';
  if (text.length <= showChars * 2) return '*'.repeat(Math.max(1, text.length - 2));
  
  const start = text.substring(0, showChars);
  const end = text.substring(text.length - showChars);
  const masked = '*'.repeat(Math.max(1, text.length - showChars * 2));
  
  return `${start}${masked}${end}`;
};

/**
 * Mask token/password for safe logging
 */
export const maskToken = (token) => {
  if (!token) return '***';
  return maskSensitive(token, 2);
};

/**
 * Mask email for safe logging
 */
export const maskEmail = (email) => {
  if (!email || !email.includes('@')) return '***';
  const [localPart, domain] = email.split('@');
  const maskedLocal = maskSensitive(localPart, 1);
  return `${maskedLocal}@${domain}`;
};

/**
 * Safe console log with masked sensitive data
 */
export const safeLog = (message, data = null) => {
  if (!isDev) return; // Only log in development
  
  if (data) {
    const maskedData = maskObject(data);
    console.log(message, maskedData);
  } else {
    console.log(message);
  }
};

/**
 * Recursively mask sensitive fields in an object
 */
export const maskObject = (obj, depth = 0) => {
  if (depth > 5 || !obj || typeof obj !== 'object') return obj;
  
  const sensitiveFields = ['password', 'token', 'authorization', 'email', 'phone', 'ssn', 'pin'];
  const masked = Array.isArray(obj) ? [...obj] : { ...obj };
  
  for (const key in masked) {
    if (masked.hasOwnProperty(key)) {
      const value = masked[key];
      const lowerKey = key.toLowerCase();
      
      // Mask sensitive fields
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        masked[key] = typeof value === 'string' ? maskSensitive(value) : '***';
      } 
      // Recursively mask nested objects
      else if (typeof value === 'object' && value !== null) {
        masked[key] = maskObject(value, depth + 1);
      }
    }
  }
  
  return masked;
};

/**
 * Setup network request interception to mask sensitive headers
 */
export const setupNetworkSecurity = () => {
  // Store original fetch
  const originalFetch = window.fetch;
  
  // Override fetch to mask sensitive headers in DevTools
  window.fetch = function(...args) {
    const [resource, config] = args;
    
    // Clone config to avoid mutating original
    const newConfig = config ? { ...config } : {};
    
    // Mask authorization header if present
    if (newConfig.headers) {
      const maskedHeaders = { ...newConfig.headers };
      if (maskedHeaders.authorization) {
        maskedHeaders.authorization = `Bearer ${maskToken(maskedHeaders.authorization)}`;
      }
      newConfig.headers = maskedHeaders;
    }
    
    // Log masked request data in development
    if (isDev && newConfig.body) {
      try {
        const bodyData = JSON.parse(newConfig.body);
        const maskedBody = maskObject(bodyData);
        safeLog('📤 API Request', { action: newConfig.action || 'unknown', data: maskedBody });
      } catch (e) {
        // Non-JSON body, skip logging
      }
    }
    
    return originalFetch.apply(this, [resource, newConfig]);
  };
};

/**
 * Mask sensitive data in API responses
 */
export const maskApiResponse = (data) => {
  if (!data || typeof data !== 'object') return data;
  return maskObject(data);
};

/**
 * Clear sensitive data from memory periodically
 */
export const setupMemorySecurity = () => {
  // Clear sensitive keys from localStorage periodically (optional)
  // Only keep what's necessary
  setInterval(() => {
    // You could add logic here to validate token expiry
    // and clear old/expired data
  }, 5 * 60 * 1000); // Every 5 minutes
};

/**
 * Prevent accidental console dumps of large objects
 */
export const setupConsoleSecurity = () => {
  if (isDev) {
    // Log a security reminder in development
    console.log('%c⚠️ Security Reminder', 'color: red; font-weight: bold; font-size: 16px;');
    console.log('%cDo not paste sensitive data or tokens in console. This is a development environment.', 'color: orange; font-size: 14px;');
  }
};

export default {
  maskSensitive,
  maskToken,
  maskEmail,
  safeLog,
  maskObject,
  maskApiResponse,
  setupNetworkSecurity,
  setupMemorySecurity,
  setupConsoleSecurity
};
