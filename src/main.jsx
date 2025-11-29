import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './assets/main.css';

// PWA utilities
import { registerServiceWorker, setupInstallPrompt, setupNetworkListeners } from './utils/pwa.js';

// Global error handler
window.addEventListener('error', (event) => {
  // Error handling without console output
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  // Promise rejection handling without console output
});

// Performance monitoring
if (import.meta.env.DEV) {
  // You can enable performance tracking here if needed
}

// Register service worker for PWA (only in production)
if (import.meta.env.PROD) {
  registerServiceWorker();
}

// Setup PWA install prompt
setupInstallPrompt();

// Setup network status listeners
setupNetworkListeners(
  () => {
    // Online callback
    console.log('[App] Network: Online');
  },
  () => {
    // Offline callback
    console.log('[App] Network: Offline');
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
