// Performance optimization utilities for InfoScope OSINT
// Implements code splitting, lazy loading, caching, and performance monitoring

import React, { lazy, Suspense, useState, useEffect } from 'react';

// Direct imports to avoid chunk loading errors
import OSINTTools from '../components/OSINTTools';
import Investigation from '../components/Investigation';
import Profile from '../components/Profile';
import DomainLookup from '../components/DomainLookup';

/**
 * Component Exports (switching from lazy to direct imports)
 */

// Export components directly to avoid chunk loading issues
export const LazyOSINTTools = OSINTTools;
export const LazyInvestigation = Investigation;
export const LazyProfile = Profile;
export const LazyDomainLookup = DomainLookup;

// Loading fallback component
export const LoadingFallback = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-300">{message}</p>
    </div>
  </div>
);

// Enhanced Suspense wrapper with error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('LazyWrapper Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const LazyWrapper = ({ children, fallback }) => (
  <ErrorBoundary>
    <Suspense fallback={fallback || <LoadingFallback />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

/**
 * Image Optimization
 */

// Optimized image component with lazy loading and WebP support
export const OptimizedImage = ({ src, alt, className, width, height, priority = false }) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Generate WebP alternative if available
  const webpSrc = src ? src.replace(/\.(jpg|jpeg|png)$/i, '.webp') : null;

  useEffect(() => {
    if (!priority) {
      // Lazy load images that are not priority
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.onerror = () => setHasError(true);
      img.src = webpSrc || src;
    } else {
      setIsLoaded(true);
    }
  }, [src, webpSrc, priority]);

  if (hasError) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && !priority && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
      )}
      <picture>
        {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            if (webpSrc && imageSrc === webpSrc) {
              // Fallback to original format
              setImageSrc(src);
            } else {
              setHasError(true);
            }
          }}
        />
      </picture>
    </div>
  );
};

/**
 * Caching Utilities
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.maxSize = 100; // Maximum cache entries
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
  }

  set(key, value, ttl = this.defaultTTL) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const [key, item] of this.cache) {
      if (now - item.timestamp > item.ttl) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
      maxSize: this.maxSize
    };
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const cacheManager = new CacheManager();

// Cleanup expired cache entries every 5 minutes
setInterval(() => {
  cacheManager.cleanup();
}, 5 * 60 * 1000);

/**
 * Performance Monitoring
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
  }

  // Start timing a operation
  startTiming(name) {
    this.metrics.set(name, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
  }

  // End timing and calculate duration
  endTiming(name) {
    const metric = this.metrics.get(name);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      
      // Log slow operations
      if (metric.duration > 1000) { // More than 1 second
        console.warn(`[PERFORMANCE] Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`);
      }
      
      return metric.duration;
    }
    return null;
  }

  // Get timing for an operation
  getTiming(name) {
    return this.metrics.get(name);
  }

  // Get all metrics
  getAllMetrics() {
    const result = {};
    for (const [name, metric] of this.metrics) {
      result[name] = metric;
    }
    return result;
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics.clear();
  }

  // Monitor Core Web Vitals
  monitorWebVitals() {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordWebVital('LCP', lastEntry.startTime);
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('[PERFORMANCE] LCP monitoring not supported');
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordWebVital('FID', entry.processingStart - entry.startTime);
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('[PERFORMANCE] FID monitoring not supported');
      }

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordWebVital('CLS', clsValue);
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('[PERFORMANCE] CLS monitoring not supported');
      }
    }
  }

  recordWebVital(name, value) {
    console.log(`[PERFORMANCE] ${name}: ${value.toFixed(2)}`);
    
    // Send to analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        non_interaction: true,
      });
    }
  }

  // Initialize performance monitoring
  init() {
    console.log('[PERFORMANCE] Initializing performance monitoring...');
    this.monitorWebVitals();
    
    // Record app initialization time
    this.startTiming('app_initialization');
    
    // Monitor navigation
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            console.log(`[PERFORMANCE] Navigation type: ${entry.type}`);
            console.log(`[PERFORMANCE] Page load time: ${entry.loadEventEnd - entry.fetchStart}ms`);
          }
        });
      });

      try {
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (e) {
        console.warn('[PERFORMANCE] Navigation monitoring not supported');
      }
    }
  }

  // Cleanup method for component unmounting
  cleanup() {
    console.log('[PERFORMANCE] Cleaning up performance monitoring...');
    this.disconnect();
    this.clearMetrics();
  }

  // Disconnect all observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Note: Performance monitoring will be initialized via performanceMonitor.init() in App.js

/**
 * Bundle Size Analysis
 */

export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle analyzer available. Run npm run analyze to view bundle composition.');
  }
};

/**
 * Code Splitting Utilities
 */

// Dynamic import with error handling and loading states
export const dynamicImport = async (importFn, componentName = 'Component') => {
  try {
    performanceMonitor.startTiming(`dynamic_import_${componentName}`);
    const module = await importFn();
    performanceMonitor.endTiming(`dynamic_import_${componentName}`);
    return module;
  } catch (error) {
    console.error(`[PERFORMANCE] Failed to load ${componentName}:`, error);
    throw error;
  }
};

/**
 * Memory Management
 */

class MemoryManager {
  constructor() {
    this.cleanup = new Set();
  }

  // Register cleanup function
  register(cleanupFn) {
    this.cleanup.add(cleanupFn);
  }

  // Unregister cleanup function
  unregister(cleanupFn) {
    this.cleanup.delete(cleanupFn);
  }

  // Run all cleanup functions
  runCleanup() {
    this.cleanup.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.error('[PERFORMANCE] Cleanup function failed:', error);
      }
    });
  }

  // Get memory usage (if available)
  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  // Monitor memory usage
  monitorMemory() {
    if ('memory' in performance) {
      const usage = this.getMemoryUsage();
      const usagePercent = (usage.used / usage.limit) * 100;
      
      if (usagePercent > 80) {
        console.warn(`[PERFORMANCE] High memory usage: ${usagePercent.toFixed(2)}%`);
        // Trigger cleanup if memory usage is high
        this.runCleanup();
      }
      
      return usage;
    }
    return null;
  }
}

export const memoryManager = new MemoryManager();

// Monitor memory usage every minute
setInterval(() => {
  memoryManager.monitorMemory();
}, 60 * 1000);

/**
 * Debouncing and Throttling
 */

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Resource Hints
 */

export const preloadResource = (href, as, type = null) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  document.head.appendChild(link);
};

export const prefetchResource = (href) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
};

export const preconnectToDomain = (domain) => {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = domain;
  document.head.appendChild(link);
};

export default {
  LazyOSINTTools,
  LazyInvestigation,
  LazyProfile,
  LazyDomainLookup,
  LoadingFallback,
  LazyWrapper,
  OptimizedImage,
  cacheManager,
  performanceMonitor,
  analyzeBundleSize,
  dynamicImport,
  memoryManager,
  debounce,
  throttle,
  preloadResource,
  prefetchResource,
  preconnectToDomain
};