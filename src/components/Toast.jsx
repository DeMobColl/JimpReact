import { useState, useEffect, useRef } from 'react';

export default function Toast({ 
  type = 'info', 
  title, 
  message = '', 
  duration = 3000, 
  showProgress = true,
  onClose 
}) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const typeClasses = {
    success: 'bg-green-500/90 text-white backdrop-blur-sm',
    error: 'bg-red-500/90 text-white backdrop-blur-sm',
    warning: 'bg-yellow-500/90 text-white backdrop-blur-sm',
    info: 'bg-red-500/90 text-white backdrop-blur-sm'
  };

  useEffect(() => {
    // Show toast
    setVisible(true);

    // Progress bar
    if (showProgress && duration > 0) {
      const interval = 50;
      const steps = duration / interval;
      let currentStep = 0;

      progressIntervalRef.current = setInterval(() => {
        currentStep++;
        setProgress(100 - (currentStep / steps) * 100);
      }, interval);
    }

    // Auto close
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [duration, showProgress]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed top-4 left-4 right-4 md:left-auto md:right-4 z-[65] max-w-sm w-full md:w-80 shadow-lg rounded-lg overflow-hidden transform transition-all duration-300 ease-in-out ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full md:translate-x-96 opacity-0'
      } ${typeClasses[type] || typeClasses.info}`}
      role="alert"
    >
      <div className="p-4 flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          {type === 'success' && (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {type === 'error' && (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {type === 'warning' && (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {type === 'info' && (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          {message && <p className="text-sm mt-1 opacity-90">{message}</p>}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 inline-flex text-current hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md p-1"
        >
          <span className="sr-only">Close</span>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      {showProgress && duration > 0 && (
        <div className="h-1 bg-black bg-opacity-20">
          <div
            className="h-full bg-current transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
