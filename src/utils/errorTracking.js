/**
 * Error Tracking Setup
 * 
 * This module provides error tracking capabilities.
 * To enable Sentry error tracking:
 * 
 * 1. Create a Sentry account at https://sentry.io/
 * 2. Create a new project for your site
 * 3. Get your DSN from Project Settings > Client Keys (DSN)
 * 4. Replace YOUR_SENTRY_DSN below with your actual DSN
 * 
 * Free tier: 5,000 errors/month, 30-day retention
 */

// Configuration - Replace with your Sentry DSN when ready
const SENTRY_DSN = null // Example: 'https://abc123@o123456.ingest.sentry.io/789012'
const SENTRY_ENABLED = false

let sentryInitialized = false

/**
 * Initialize error tracking
 * Call this once when your app starts
 */
export function initErrorTracking() {
  if (!SENTRY_ENABLED || !SENTRY_DSN || sentryInitialized) {
    console.log('[Error Tracking] Sentry disabled or not configured')
    return
  }

  // For static sites, we can use Sentry's CDN version
  // This is loaded dynamically to avoid blocking initial page load
  loadSentry()
    .then(() => {
      sentryInitialized = true
      console.log('[Error Tracking] Sentry initialized')
    })
    .catch(err => {
      console.error('[Error Tracking] Failed to load Sentry:', err)
    })
}

/**
 * Capture an error
 * @param {Error} error - The error to capture
 * @param {Object} context - Additional context
 */
export function captureError(error, context = {}) {
  // Log to console (always)
  console.error('[Error Tracking]', error, context)

  // Send to Sentry if available
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(error, {
      extra: context
    })
  }
}

/**
 * Capture a message
 * @param {string} message - The message to capture
 * @param {string} level - The severity level
 */
export function captureMessage(message, level = 'info') {
  // Log to console (always)
  console.log(`[Error Tracking ${level.toUpperCase()}]`, message)

  // Send to Sentry if available
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureMessage(message, level)
  }
}

/**
 * Set user context
 * @param {Object} user - User info (id, email, etc.)
 */
export function setUser(user) {
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.setUser(user)
  }
}

/**
 * Add breadcrumb
 * @param {Object} breadcrumb - Breadcrumb data
 */
export function addBreadcrumb(breadcrumb) {
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.addBreadcrumb(breadcrumb)
  }
}

/**
 * Load Sentry from CDN
 */
function loadSentry() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Not in browser environment'))
      return
    }

    // Check if already loaded
    if (window.Sentry) {
      resolve()
      return
    }

    // Create script element
    const script = document.createElement('script')
    script.src = 'https://browser.sentry-cdn.com/7.100.1/bundle.min.js'
    script.crossOrigin = 'anonymous'
    script.async = true

    script.onload = () => {
      // Initialize Sentry
      if (window.Sentry && SENTRY_DSN) {
        window.Sentry.init({
          dsn: SENTRY_DSN,
          integrations: [
            new window.Sentry.Integrations.BrowserTracing()
          ],
          tracesSampleRate: 0.1, // Sample 10% of transactions
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0
        })
        resolve()
      } else {
        reject(new Error('Sentry failed to initialize'))
      }
    }

    script.onerror = () => {
      reject(new Error('Failed to load Sentry script'))
    }

    document.head.appendChild(script)
  })
}

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  initErrorTracking()
}

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    captureError(event.error, {
      source: event.filename,
      line: event.lineno,
      column: event.colno
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    captureError(event.reason, {
      type: 'unhandledrejection'
    })
  })
}
