// Advanced Analytics and Monitoring for InfoScope OSINT
import { analytics } from '../firebase';
import { logEvent, setUserProperties, setUserId } from 'firebase/analytics';

class AnalyticsManager {
  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production';
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.pageViews = new Map();
    this.toolUsage = new Map();
    this.performanceMetrics = new Map();
    this.errorTracking = [];
    
    this.init();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  trackEvent(eventName, eventData = {}) {
    if (!this.isEnabled || !analytics) return;

    try {
      logEvent(analytics, eventName, {
        ...eventData,
        app_version: process.env.REACT_APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV
      });
    } catch (error) {
      console.error('[Analytics] Failed to track event:', error);
    }
  }

  init() {
    if (!this.isEnabled || !analytics) return;

    // Track session start
    this.trackEvent('session_start', {
      session_id: this.sessionId,
      timestamp: this.startTime,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    });

    // Setup performance monitoring
    this.setupPerformanceMonitoring();
    
    // Setup error tracking
    this.setupErrorTracking();
    
    // Setup user interaction tracking
    this.setupUserInteractionTracking();

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden', { session_id: this.sessionId });
      } else {
        this.trackEvent('page_visible', { session_id: this.sessionId });
      }
    });

    // Track before unload
    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd();
    });
  }

  setupPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('web-vitals' in window) {
      // Will be loaded separately
      return;
    }

    // Basic performance monitoring
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          this.trackEvent('performance_metrics', {
            session_id: this.sessionId,
            dom_content_loaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            load_complete: perfData.loadEventEnd - perfData.loadEventStart,
            first_byte: perfData.responseStart - perfData.requestStart,
            dns_lookup: perfData.domainLookupEnd - perfData.domainLookupStart,
            tcp_connect: perfData.connectEnd - perfData.connectStart,
            page_load_time: perfData.loadEventEnd - perfData.navigationStart
          });
        }
      }, 1000);
    });

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = performance.memory;
        this.performanceMetrics.set('memory_usage', {
          used: memInfo.usedJSHeapSize,
          total: memInfo.totalJSHeapSize,
          limit: memInfo.jsHeapSizeLimit,
          timestamp: Date.now()
        });
      }, 30000); // Every 30 seconds
    }
  }

  setupErrorTracking() {
    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        session_id: this.sessionId,
        timestamp: Date.now()
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        session_id: this.sessionId,
        timestamp: Date.now()
      });
    });
  }

  setupUserInteractionTracking() {
    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target;
      
      // Track button clicks
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.tagName === 'BUTTON' ? target : target.closest('button');
        this.trackEvent('button_click', {
          button_text: button.textContent?.trim().substring(0, 50),
          button_class: button.className,
          session_id: this.sessionId
        });
      }

      // Track link clicks
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.tagName === 'A' ? target : target.closest('a');
        this.trackEvent('link_click', {
          link_text: link.textContent?.trim().substring(0, 50),
          link_href: link.href,
          session_id: this.sessionId
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target;
      if (form.tagName === 'FORM') {
        this.trackEvent('form_submit', {
          form_id: form.id,
          form_class: form.className,
          session_id: this.sessionId
        });
      }
    });

    // Track search queries
    document.addEventListener('input', (event) => {
      const target = event.target;
      if (target.type === 'search' || target.placeholder?.toLowerCase().includes('search')) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          if (target.value.length > 2) {
            this.trackEvent('search_query', {
              query_length: target.value.length,
              search_type: target.className || 'unknown',
              session_id: this.sessionId
            });
          }
        }, 1000);
      }
    });
  }

  // Track page views
  trackPageView(pageName, additionalData = {}) {
    if (!this.isEnabled) return;

    const viewData = {
      page_name: pageName,
      session_id: this.sessionId,
      timestamp: Date.now(),
      referrer: document.referrer,
      url: window.location.href,
      ...additionalData
    };

    // Update page view count
    const currentCount = this.pageViews.get(pageName) || 0;
    this.pageViews.set(pageName, currentCount + 1);

    this.trackEvent('page_view', {
      ...viewData,
      view_count: currentCount + 1
    });

    // Track time spent on previous page
    if (this.lastPageView) {
      const timeSpent = Date.now() - this.lastPageView.timestamp;
      this.trackEvent('page_time_spent', {
        page_name: this.lastPageView.page_name,
        time_spent: timeSpent,
        session_id: this.sessionId
      });
    }

    this.lastPageView = viewData;
  }

  // Track OSINT tool usage
  trackToolUsage(toolName, action, additionalData = {}) {
    if (!this.isEnabled) return;

    const toolKey = `${toolName}_${action}`;
    const currentCount = this.toolUsage.get(toolKey) || 0;
    this.toolUsage.set(toolKey, currentCount + 1);

    this.trackEvent('osint_tool_usage', {
      tool_name: toolName,
      action: action,
      usage_count: currentCount + 1,
      session_id: this.sessionId,
      timestamp: Date.now(),
      ...additionalData
    });
  }

  // Track investigation activities
  trackInvestigation(action, details = {}) {
    if (!this.isEnabled) return;

    this.trackEvent('investigation_activity', {
      action: action,
      session_id: this.sessionId,
      timestamp: Date.now(),
      ...details
    });
  }

  // Track user authentication events
  trackAuth(action, method = 'unknown') {
    if (!this.isEnabled) return;

    this.trackEvent('auth_event', {
      action: action,
      method: method,
      session_id: this.sessionId,
      timestamp: Date.now()
    });
  }

  // Track feature usage
  trackFeatureUsage(featureName, context = {}) {
    if (!this.isEnabled) return;

    this.trackEvent('feature_usage', {
      feature_name: featureName,
      session_id: this.sessionId,
      timestamp: Date.now(),
      ...context
    });
  }

  // Track errors
  trackError(errorData) {
    if (!this.isEnabled) return;

    this.errorTracking.push(errorData);
    
    this.trackEvent('error_occurred', {
      error_type: errorData.type,
      error_message: errorData.message?.substring(0, 200),
      session_id: this.sessionId,
      timestamp: errorData.timestamp
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Analytics] Error tracked:', errorData);
    }
  }

  // Track performance metrics
  trackPerformance(metricName, value, context = {}) {
    if (!this.isEnabled) return;

    this.performanceMetrics.set(metricName, {
      value: value,
      timestamp: Date.now(),
      ...context
    });

    this.trackEvent('performance_metric', {
      metric_name: metricName,
      metric_value: value,
      session_id: this.sessionId,
      ...context
    });
  }

  // Track custom events
  // Set user properties
  setUser(userId, properties = {}) {
    if (!this.isEnabled || !analytics) return;

    try {
      setUserId(analytics, userId);
      setUserProperties(analytics, {
        ...properties,
        session_id: this.sessionId,
        first_visit: Date.now()
      });
    } catch (error) {
      console.error('[Analytics] Failed to set user properties:', error);
    }
  }

  // Track session end
  trackSessionEnd() {
    if (!this.isEnabled) return;

    const sessionDuration = Date.now() - this.startTime;
    
    this.trackEvent('session_end', {
      session_id: this.sessionId,
      session_duration: sessionDuration,
      pages_viewed: this.pageViews.size,
      tools_used: this.toolUsage.size,
      errors_encountered: this.errorTracking.length,
      timestamp: Date.now()
    });
  }

  // Get analytics summary
  getAnalyticsSummary() {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      sessionDuration: Date.now() - this.startTime,
      pageViews: Object.fromEntries(this.pageViews),
      toolUsage: Object.fromEntries(this.toolUsage),
      performanceMetrics: Object.fromEntries(this.performanceMetrics),
      errorCount: this.errorTracking.length,
      isEnabled: this.isEnabled
    };
  }

  // Enable/disable analytics
  setEnabled(enabled) {
    this.isEnabled = enabled && process.env.NODE_ENV === 'production';
    
    if (this.isEnabled) {
      this.trackEvent('analytics_enabled', { session_id: this.sessionId });
    }
  }
}

// Create singleton instance
const analyticsManager = new AnalyticsManager();

export default analyticsManager;

// Export convenience functions
export const {
  trackPageView,
  trackToolUsage,
  trackInvestigation,
  trackAuth,
  trackFeatureUsage,
  trackError,
  trackPerformance,
  trackEvent,
  setUser,
  getAnalyticsSummary,
  setEnabled
} = analyticsManager;