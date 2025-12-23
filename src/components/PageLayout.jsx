export default function PageLayout({ title, subtitle, children, actions, onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50/20 to-white/80 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900">
      {/* Page Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-slate-200/60 dark:border-gray-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex-shrink-0 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                  title="Kembali"
                >
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 truncate">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {actions && <div className="flex-shrink-0">{actions}</div>}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
