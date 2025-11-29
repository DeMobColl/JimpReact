import { lazy } from 'react';

/**
 * Lazy load React components with retry logic
 * Handles chunk loading failures gracefully
 */
export function lazyWithRetry(componentImport) {
  return lazy(() => 
    new Promise((resolve, reject) => {
      // Check if already loaded
      const hasRefreshed = JSON.parse(
        window.sessionStorage.getItem('retry-lazy-refreshed') || 'false'
      );

      componentImport()
        .then((module) => {
          window.sessionStorage.setItem('retry-lazy-refreshed', 'false');
          resolve(module);
        })
        .catch((error) => {
          if (!hasRefreshed) {
            // Retry once by refreshing the page
            window.sessionStorage.setItem('retry-lazy-refreshed', 'true');
            return window.location.reload();
          }
          // If already retried, reject
          reject(error);
        });
    })
  );
}

/**
 * Preload a lazy-loaded component
 * Useful for eager loading critical routes
 */
export function preloadComponent(componentImport) {
  return componentImport();
}

/**
 * Create a lazy component with a custom loading fallback
 */
export function createLazyComponent(importFn, fallback = null) {
  const LazyComponent = lazy(importFn);
  
  return function LazyComponentWrapper(props) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
