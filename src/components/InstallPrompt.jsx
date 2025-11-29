import { useState, useEffect } from 'react';
import { promptInstall, canInstall, isInstalled, getInstallInstructions } from '../utils/pwa';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (isInstalled()) {
      return;
    }

    // Listen for install availability
    const handleInstallAvailable = () => {
      setShowPrompt(true);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);

    // Check if can install immediately
    if (canInstall()) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
    };
  }, []);

  const handleInstall = async () => {
    setInstalling(true);
    const installed = await promptInstall();
    
    if (installed) {
      setShowPrompt(false);
    } else {
      // Show manual instructions if prompt not available
      setShowInstructions(true);
    }
    
    setInstalling(false);
  };

  const handleShowInstructions = () => {
    setShowInstructions(true);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for this session
    sessionStorage.setItem('install-prompt-dismissed', 'true');
  };

  const handleCloseInstructions = () => {
    setShowInstructions(false);
  };

  // Don't show if dismissed this session
  if (sessionStorage.getItem('install-prompt-dismissed')) {
    return null;
  }

  if (!showPrompt) {
    return null;
  }

  const instructions = getInstallInstructions();

  return (
    <>
      {/* Install Prompt Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-2xl z-50 animate-slide-in">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <svg className="w-8 h-8 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Install Jimpitan App</h3>
              <p className="text-sm text-blue-100">
                Install aplikasi untuk akses lebih cepat dan bisa digunakan offline!
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleShowInstructions}
              className="px-3 py-2 text-sm font-medium text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              Cara Install
            </button>
            <button
              onClick={handleInstall}
              disabled={installing}
              className="px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {installing ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Installing...
                </>
              ) : (
                'Install Sekarang'
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cara Install</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {instructions.platform === 'ios' ? 'iOS Safari' : 
                     instructions.platform === 'android' ? 'Android Chrome' :
                     instructions.platform === 'desktop' ? 'Desktop Browser' : 'Browser'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseInstructions}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {instructions.instructions.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseInstructions}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Nanti Saja
              </button>
              {canInstall() && (
                <button
                  onClick={async () => {
                    await handleInstall();
                    handleCloseInstructions();
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
                >
                  Install Sekarang
                </button>
              )}
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                💡 <strong>Tip:</strong> Aplikasi yang terinstall bisa diakses langsung dari home screen dan bekerja lebih cepat!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
