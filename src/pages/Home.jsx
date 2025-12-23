import { useState, lazy, Suspense, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import TutorialModal from '../components/TutorialModal.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

// Lazy load page components
const ScanQR = lazy(() => import('./ScanQR'));
const Submit = lazy(() => import('./Submit'));
const History = lazy(() => import('./History'));
const MyHistory = lazy(() => import('./MyHistory'));
const Users = lazy(() => import('./Users'));
const Customers = lazy(() => import('./Customers'));
const Config = lazy(() => import('./Config'));

function HomeView({ onNavigate, isAdmin, currentUser }) {
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <>
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-white via-red-50/20 to-white/80 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900 px-4 py-2 transition-colors duration-300">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-slate-300/50 dark:shadow-none border border-slate-200/60 dark:border-gray-700/60 p-4 md:p-5 w-full max-w-2xl text-center transition-all duration-300">
        {/* Logo/Icon */}
        <div className="mb-3">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-2xl shadow-xl shadow-red-200/50 dark:shadow-red-900/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Welcome Text */}
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1.5">
          Selamat Datang
          {currentUser && (
            <span>
              , <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 dark:from-red-400 dark:to-red-500">{currentUser.name}</span>
            </span>
          )}
        </h1>

        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-3 max-w-lg mx-auto">
          {isAdmin
            ? 'Kelola sistem jimpitan dengan akses penuh sebagai admin.'
            : 'Lakukan scan QR dan catat transaksi jimpitan dengan mudah.'}
        </p>

        {/* Quick Stats (Admin Only) */}
        {isAdmin && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
            <button
              onClick={() => onNavigate('users')}
              className="bg-gradient-to-br from-red-50/80 to-white/80 dark:from-red-900/20 dark:to-gray-900/20 rounded-xl p-2 border border-red-200/60 dark:border-red-700/60 hover:shadow-lg hover:shadow-red-200/50 dark:hover:shadow-none hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-center mb-1">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-500 to-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Users</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Kelola pengguna</p>
            </button>

            <button
              onClick={() => onNavigate('customers')}
              className="bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-900/20 dark:to-gray-900/20 rounded-xl p-2 border border-gray-200/60 dark:border-gray-700/60 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-none hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-center mb-1">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Customers</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Data nasabah</p>
            </button>

            <button
              onClick={() => onNavigate('history')}
              className="bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-900/20 dark:to-gray-900/20 rounded-xl p-2 border border-gray-200/60 dark:border-gray-700/60 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-none hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-center mb-1">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-0.5">History</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Riwayat transaksi</p>
            </button>

            <button
              onClick={() => onNavigate('scanqr')}
              className="bg-gradient-to-br from-red-50/80 to-white/80 dark:from-red-900/20 dark:to-gray-900/20 rounded-xl p-2 border border-red-200/60 dark:border-red-700/60 hover:shadow-lg hover:shadow-red-200/50 dark:hover:shadow-none hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-center mb-1">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-500 to-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Scan QR</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Scan kode QR</p>
            </button>

            {/* <Link
              to="/config"
              className="bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-900/20 dark:to-gray-900/20 rounded-xl p-2 border border-gray-200/60 dark:border-gray-700/60 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-none hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-center mb-1">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Config</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Konfigurasi sistem</p>
            </Link> */}
          </div>
        )}

        {/* Quick Actions for Petugas */}
        {!isAdmin && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => onNavigate('scanqr')}
              className="bg-gradient-to-br from-red-50/80 to-white/80 dark:from-red-900/20 dark:to-gray-900/20 rounded-xl p-4 border border-red-200/60 dark:border-red-700/60 hover:shadow-lg hover:shadow-red-200/50 dark:hover:shadow-none hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 text-center">Scan QR</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Scan kode nasabah</p>
            </button>

            <button
              onClick={() => onNavigate('myhistory')}
              className="bg-gradient-to-br from-red-50/80 to-white/80 dark:from-red-900/20 dark:to-gray-900/20 rounded-xl p-4 border border-red-200/60 dark:border-red-700/60 hover:shadow-lg hover:shadow-red-200/50 dark:hover:shadow-none hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 text-center">Riwayat Saya</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Setoran saya</p>
            </button>
          </div>
        )}

        {/* CTA Button */}
        <div className="flex justify-center mb-2">
          <button
            onClick={() => setShowTutorial(true)}
            className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-xl shadow-red-200/50 hover:shadow-2xl hover:shadow-red-300/50 dark:shadow-red-900/30 dark:hover:shadow-red-800/40 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            <span>Tutorial</span>
          </button>
        </div>

        {/* Contact Developer */}
        {(import.meta.env.VITE_DEV_WHATSAPP || import.meta.env.VITE_DEV_EMAIL) && (
          <div className="flex flex-wrap justify-center gap-2">
            {import.meta.env.VITE_DEV_WHATSAPP && (
              <a
                href={`https://wa.me/${import.meta.env.VITE_DEV_WHATSAPP}?text=Halo%20DevsTeam%20Jimpitan`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 text-xs font-medium bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-md hover:shadow-lg hover:shadow-red-200/50 dark:hover:shadow-none transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp Devs
              </a>
            )}
            {import.meta.env.VITE_DEV_EMAIL && (
              <a
                href={`mailto:${import.meta.env.VITE_DEV_EMAIL}?subject=Pertanyaan%20Jimpitan&body=Halo%20Admin%2C%0A%0A`}
                className="px-5 py-2.5 text-xs font-medium bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-md hover:shadow-lg hover:shadow-red-200/50 dark:hover:shadow-none transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Devs
              </a>
            )}
          </div>
        )}
      </div>

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        userRole={isAdmin ? 'admin' : 'petugas'}
      />
    </div>
    </>
  );
}

export default function Home({ onSetNavigate, onViewChange }) {
  const { currentUser, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [qrHash, setQrHash] = useState(null);

  const handleNavigate = (view, data = null) => {
    setCurrentView(view);
    if (data?.qrHash) {
      setQrHash(data.qrHash);
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setQrHash(null);
  };

  // Expose navigation function to App.jsx
  useEffect(() => {
    if (onSetNavigate) {
      onSetNavigate(handleNavigate);
    }
  }, [onSetNavigate]);

  // Notify parent when view changes
  useEffect(() => {
    if (onViewChange) {
      onViewChange(currentView);
    }
  }, [currentView, onViewChange]);

  return (
    <div className="w-full h-full">
      {currentView === 'home' && (
        <HomeView onNavigate={handleNavigate} isAdmin={isAdmin} currentUser={currentUser} />
      )}
      {currentView === 'users' && (
        <Suspense fallback={<LoadingSpinner fullscreen loading text="Memuat User..." />}>
          <Users onBack={handleBackToHome} />
        </Suspense>
      )}
      {currentView === 'customers' && (
        <Suspense fallback={<LoadingSpinner fullscreen loading text="Memuat Customers..." />}>
          <Customers onBack={handleBackToHome} />
        </Suspense>
      )}
      {currentView === 'history' && (
        <Suspense fallback={<LoadingSpinner fullscreen loading text="Memuat Riwayat..." />}>
          <History onBack={handleBackToHome} />
        </Suspense>
      )}
      {currentView === 'myhistory' && (
        <Suspense fallback={<LoadingSpinner fullscreen loading text="Memuat Riwayat Saya..." />}>
          <MyHistory onBack={handleBackToHome} />
        </Suspense>
      )}
      {currentView === 'scanqr' && (
        <Suspense fallback={<LoadingSpinner fullscreen loading text="Memuat Scan QR..." />}>
          <ScanQR onBack={handleBackToHome} onNavigate={handleNavigate} />
        </Suspense>
      )}
      {currentView === 'submit' && (
        <Suspense fallback={<LoadingSpinner fullscreen loading text="Memuat Submit..." />}>
          <Submit onBack={handleBackToHome} qrHash={qrHash} />
        </Suspense>
      )}
      {currentView === 'config' && (
        <Suspense fallback={<LoadingSpinner fullscreen loading text="Memuat Config..." />}>
          <Config onBack={handleBackToHome} />
        </Suspense>
      )}
    </div>
  );
}
