import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth.jsx';
import { useDarkMode } from './hooks/useDarkMode.jsx';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages
import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import TutorialModal from './components/TutorialModal';
import InstallPrompt from './components/InstallPrompt';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));

function AppContent() {
  const { currentUser, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useDarkMode();
  const [showTutorial, setShowTutorial] = useState(false);
  const location = useLocation();
  const homeNavigateRef = useRef(null);
  const [currentView, setCurrentView] = useState('home');

  // Function to navigate within Home component
  const handleNavigation = (view) => {
    if (homeNavigateRef.current) {
      homeNavigateRef.current(view);
    } else {
      console.warn('Navigation not ready yet:', view);
    }
  };

  // Helper function to get active styles
  const getActiveButtonClass = (view) => {
    const baseClass = "px-3 py-2 rounded-lg font-medium transition-all";
    if (currentView === view) {
      return `${baseClass} bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-200/50 dark:shadow-none`;
    }
    return `${baseClass} text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400`;
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-white via-red-50/20 to-white/80 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      {/* Navbar */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg shadow-slate-200/50 dark:shadow-none border-b border-slate-200/60 dark:border-gray-700/60 py-3 px-4 md:py-4 md:px-6 flex justify-between items-center flex-shrink-0 relative">
        <button
          onClick={() => handleNavigation('home')}
          className="font-bold text-lg md:text-xl bg-gradient-to-r from-red-600 to-red-700 dark:from-red-400 dark:to-red-500 text-transparent bg-clip-text hover:from-red-700 hover:to-red-800 transition-all cursor-pointer"
        >
          Jimpitan App
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2 text-sm font-medium">
          {currentUser && (
            <>
              <button
                onClick={() => handleNavigation('home')}
                className={getActiveButtonClass('home')}
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation('scanqr')}
                className={getActiveButtonClass('scanqr')}
              >
                Scan QR
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleNavigation('history')}
                  className={getActiveButtonClass('history')}
                >
                  Riwayat
                </button>
              )}
              {!isAdmin && (
                <button
                  onClick={() => handleNavigation('myhistory')}
                  className={getActiveButtonClass('myhistory')}
                >
                  Riwayat Saya
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => handleNavigation('users')}
                  className={getActiveButtonClass('users')}
                >
                  User
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => handleNavigation('customers')}
                  className={getActiveButtonClass('customers')}
                >
                  Customers
                </button>
              )}
              <button
                onClick={() => setShowTutorial(true)}
                className="px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 transition-all flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Tutorial
              </button>
            </>
          )}

          {/* Config Button (Admin Only) */}
          {isAdmin && (
            <button
              onClick={() => handleNavigation('config')}
              className="p-2.5 rounded-lg bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 hover:shadow-md transition-all duration-200 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              title="Konfigurasi"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 hover:shadow-md transition-all duration-200"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-gray-600">
            {currentUser && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {currentUser.name}
                </span>
              </div>
            )}
            {!currentUser ? (
              <button
                onClick={() => { window.location.href = '/login'; }}
                className="btn-primary btn-sm"
              >
                Login
              </button>
            ) : (
              <button
                onClick={logout}
                className="p-2.5 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-900/50 dark:hover:to-gray-800/50 text-gray-600 dark:text-gray-400 transition-all hover:shadow-md"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center gap-2">
          {/* Config Icon (Admin Only) */}
          {isAdmin && currentUser && (
            <button
              onClick={() => handleNavigation('config')}
              className="p-2 rounded-lg bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 hover:shadow-md transition-all duration-200 text-red-600 dark:text-red-400"
              title="Konfigurasi"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 hover:shadow-md transition-all duration-200"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* Logout Button */}
          {currentUser && (
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all hover:shadow-md"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </nav>

{/* Mobile Menu Overlay - REMOVED, replaced with bottom nav */}

      {/* Bottom Navigation for Mobile - Only show when logged in */}
      {currentUser && (
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-lg shadow-gray-300/50 dark:shadow-none">
        <div className="flex items-center justify-around py-3 px-2">
          {/* Home */}
          <button
            onClick={() => { handleNavigation('home'); }}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
              currentView === 'home'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
            }`}
            title="Home"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>

          {/* History/Riwayat */}
          {isAdmin && (
            <button
              onClick={() => { handleNavigation('history'); }}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                currentView === 'history'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
              }`}
              title="Riwayat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium">Riwayat</span>
            </button>
          )}
          {!isAdmin && (
            <button
              onClick={() => { handleNavigation('myhistory'); }}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                currentView === 'myhistory'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
              }`}
              title="Riwayat Saya"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium">Riwayat</span>
            </button>
          )}

          {/* QR Scan - Center */}
          <button
            onClick={() => handleNavigation('scanqr')}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg -mt-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            title="Scan QR"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 13h2v2h-2zM17 13h2v2h-2zM13 15h2v2h-2zM17 15h2v2h-2zM19 13h2v2h-2zM15 17h2v2h-2zM17 17h2v2h-2z"/>
            </svg>
            <span className="text-xs font-medium">Scan</span>
          </button>

          {/* Customers */}
          <button
            onClick={() => { handleNavigation('customers'); }}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
              currentView === 'customers'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
            }`}
            title="Data Customer"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
            <span className="text-xs font-medium">Customer</span>
          </button>

          {/* Users (Admin Only) */}
          {isAdmin && (
            <button
              onClick={() => { handleNavigation('users'); }}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                currentView === 'users'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
              }`}
              title="Manajemen User"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 6a3 3 0 11-6 0 3 3 0 016 0zM9 6a3 3 0 11-6 0 3 3 0 016 0zm12 6a9 9 0 11-18 0 9 9 0 0118 0zm-9-4a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-xs font-medium">User</span>
            </button>
          )}
        </div>
      </nav>
      )}

      {/* Main Content */}
      <main className="flex-1 flex p-3 md:p-6 pb-16 md:pb-6 overflow-hidden">
        <div className="w-full h-full overflow-auto">
          <Suspense fallback={<LoadingSpinner fullscreen loading text="Memuat halaman..." />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Home onSetNavigate={(fn) => { homeNavigateRef.current = fn; }} onViewChange={setCurrentView} /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs py-2 md:py-3 text-gray-500 dark:text-gray-400 flex-shrink-0">
        © 2025 QR Jimpitan App
      </footer>

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        userRole={isAdmin ? 'admin' : 'petugas'}
      />
      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
