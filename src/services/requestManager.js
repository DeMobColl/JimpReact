// API Request Queue Manager for load balancing
const _env =
  typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};

const DEFAULT_MAX_CONCURRENT = Number(_env.VITE_REQUEST_MAX_CONCURRENT) || 3;
const DEFAULT_CACHE_TTL = Number(_env.VITE_REQUEST_CACHE_TTL_MS) || 30000; // ms
const DEFAULT_RETRY_MAX = Number(_env.VITE_REQUEST_RETRY_MAX) || 3;
const DEFAULT_RETRY_BASE_DELAY =
  Number(_env.VITE_REQUEST_RETRY_BASE_DELAY_MS) || 1000; // ms

class RequestQueue {
  constructor(maxConcurrent = DEFAULT_MAX_CONCURRENT) {
    this.maxConcurrent = maxConcurrent;
    this.queue = [];
    this.activeRequests = 0;
  }

  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const { requestFn, resolve, reject } = this.queue.shift();
    this.activeRequests++;

    try {
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }

  clear() {
    this.queue = [];
    this.activeRequests = 0;
  }
}

// Request cache with TTL
class RequestCache {
  constructor(ttl = 30000) {
    // 30 seconds default
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key, data, ttl = this.ttl) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }
}

// Global instances
export const requestQueue = new RequestQueue();
export const requestCache = new RequestCache(DEFAULT_CACHE_TTL);

// Retry logic with exponential backoff
export async function retryWithBackoff(
  fn,
  maxRetries = DEFAULT_RETRY_MAX,
  baseDelay = DEFAULT_RETRY_BASE_DELAY
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Exponential backoff: delay = baseDelay * 2^i + random jitter
      const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Clear all caches (useful for logout or force refresh)
export function clearAllCaches() {
  requestCache.clear();
  requestQueue.clear();
}

// Prefetch data to cache
export async function prefetchToCache(cacheKey, fetcher, ttl) {
  try {
    const data = await fetcher();
    requestCache.set(cacheKey, data, ttl);
    return data;
  } catch (error) {
    return null;
  }
}

// Batch multiple requests with deduplication
export async function batchRequests(requests) {
  const deduped = new Map();
  
  // Deduplicate by cacheKey if provided
  requests.forEach(req => {
    const key = req.cacheKey || Symbol();
    if (!deduped.has(key)) {
      deduped.set(key, req);
    }
  });

  // Execute all unique requests
  const results = await Promise.allSettled(
    Array.from(deduped.values()).map(req => req.fetcher())
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return { success: true, data: result.value };
    } else {
      return { success: false, error: result.reason };
    }
  });
}
