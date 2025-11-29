// Performance monitoring utilities

class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.measures = new Map();
  }

  // Mark a point in time
  mark(name) {
    if (typeof performance !== 'undefined') {
      performance.mark(name);
      this.marks.set(name, performance.now());
    }
  }

  // Measure time between two marks
  measure(name, startMark, endMark) {
    if (typeof performance !== 'undefined') {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name, 'measure')[0];
        this.measures.set(name, measure.duration);
        return measure.duration;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Get measure duration
  getDuration(name) {
    return this.measures.get(name);
  }

  // Clear specific marks/measures
  clear(name) {
    if (typeof performance !== 'undefined') {
      performance.clearMarks(name);
      performance.clearMeasures(name);
    }
    this.marks.delete(name);
    this.measures.delete(name);
  }

  // Clear all
  clearAll() {
    if (typeof performance !== 'undefined') {
      performance.clearMarks();
      performance.clearMeasures();
    }
    this.marks.clear();
    this.measures.clear();
  }

  // Get all measures
  getAllMeasures() {
    return Object.fromEntries(this.measures);
  }

  // Log performance report
  report() {
    return this.getAllMeasures();
  }
}

// Global monitor instance
export const perfMonitor = new PerformanceMonitor();

// Measure async function execution
export async function measureAsync(name, fn) {
  const startMark = `${name}-start`;
  const endMark = `${name}-end`;
  
  perfMonitor.mark(startMark);
  try {
    const result = await fn();
    perfMonitor.mark(endMark);
    perfMonitor.measure(name, startMark, endMark);
    return result;
  } catch (error) {
    perfMonitor.mark(endMark);
    perfMonitor.measure(name, startMark, endMark);
    throw error;
  }
}

// Measure sync function execution
export function measureSync(name, fn) {
  const startMark = `${name}-start`;
  const endMark = `${name}-end`;
  
  perfMonitor.mark(startMark);
  try {
    const result = fn();
    perfMonitor.mark(endMark);
    perfMonitor.measure(name, startMark, endMark);
    return result;
  } catch (error) {
    perfMonitor.mark(endMark);
    perfMonitor.measure(name, startMark, endMark);
    throw error;
  }
}

// API metrics tracking
class APIMetrics {
  constructor() {
    this.metrics = new Map();
  }

  track(apiName, duration, success) {
    if (!this.metrics.has(apiName)) {
      this.metrics.set(apiName, {
        calls: 0,
        successes: 0,
        failures: 0,
        totalDuration: 0,
        avgDuration: 0,
        minDuration: Infinity,
        maxDuration: 0
      });
    }

    const metric = this.metrics.get(apiName);
    metric.calls++;
    metric.totalDuration += duration;
    metric.avgDuration = metric.totalDuration / metric.calls;
    metric.minDuration = Math.min(metric.minDuration, duration);
    metric.maxDuration = Math.max(metric.maxDuration, duration);
    
    if (success) {
      metric.successes++;
    } else {
      metric.failures++;
    }
  }

  getMetrics(apiName) {
    return this.metrics.get(apiName);
  }

  getAllMetrics() {
    return Object.fromEntries(this.metrics);
  }

  clear() {
    this.metrics.clear();
  }
}

export const apiMetrics = new APIMetrics();

// Component render timing
export function measureComponentRender(componentName) {
  return {
    start: () => perfMonitor.mark(`${componentName}-render-start`),
    end: () => {
      perfMonitor.mark(`${componentName}-render-end`);
      perfMonitor.measure(
        `${componentName}-render`,
        `${componentName}-render-start`,
        `${componentName}-render-end`
      );
    }
  };
}

// Report performance metrics to console (dev only)
export function logPerformanceReport() {
  if (import.meta.env.DEV) {
    // Performance reporting disabled
  }
}

// Debounce function for performance optimization
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for performance optimization
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoize function results
export function memoize(func) {
  const cache = new Map();
  return function memoized(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
