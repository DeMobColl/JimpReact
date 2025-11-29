export default function LoadingSpinner({ 
  loading = true, 
  size = 'md', 
  text = '', 
  fullscreen = false 
}) {
  if (!loading) return null;

  const sizeClasses = {
    sm: 'h-8 w-8 border-blue-400',
    md: 'h-12 w-12 border-blue-500',
    lg: 'h-16 w-16 border-blue-600'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const containerClass = fullscreen
    ? 'fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 z-50 backdrop-blur-sm flex items-center justify-center'
    : 'w-full py-12 flex items-center justify-center';

  return (
    <div className={containerClass}>
      <div className="text-center">
        {/* Spinner */}
        <div className={`inline-block animate-spin rounded-full border-b-2 ${sizeClasses[size]}`}></div>
        
        {/* Text */}
        {text && (
          <p className={`mt-4 text-gray-600 dark:text-gray-400 animate-pulse ${textSizeClasses[size]}`}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
