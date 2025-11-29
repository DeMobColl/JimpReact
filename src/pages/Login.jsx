import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { useToast } from '../hooks/useToast.jsx';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, currentUser, verifyAndRestoreSession, token } = useAuth();
  const toast = useToast();

  useEffect(() => {
    // Try to restore session from token
    const restoreSession = async () => {
      if (token && !currentUser) {
        const restored = await verifyAndRestoreSession();
        if (restored) {
          navigate('/', { replace: true });
        }
      } else if (currentUser) {
        navigate('/', { replace: true });
      }
    };
    
    restoreSession();
  }, [token, currentUser, verifyAndRestoreSession, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(username, password);
      toast.success('Login berhasil!', `Selamat datang, ${user.name}`);
      navigate('/', { replace: true });
    } catch (err) {
      const errorMessage = err.message || 'Gagal login. Periksa username dan password Anda.';
      setError(errorMessage);
      toast.error('Login gagal', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center w-full bg-gradient-to-br from-slate-50 to-slate-200 dark:from-gray-900 dark:to-gray-800 rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-2xl md:rounded-3xl shadow-lg p-4 md:p-6 lg:p-8 w-full max-w-md transition-colors duration-500">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-700 dark:text-slate-200 mb-4 md:mb-5 lg:mb-6">
          Login Page
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          <div>
            <label className="block text-xs md:text-sm font-medium mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              placeholder="Masukkan username"
              className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 dark:border-gray-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium mb-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Masukkan password"
              className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 dark:border-gray-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 md:py-3 text-sm md:text-base bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-lg md:rounded-xl shadow-xl shadow-blue-200/50 hover:shadow-2xl hover:shadow-blue-300/50 transition-all duration-200 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        {error && (
          <p className="mt-3 md:mt-4 text-xs md:text-sm text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg md:rounded-xl p-2 md:p-3 animate-fade-in">
            {error}
          </p>
        )}

        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-4 md:mt-5 text-center">
          Selamat datang di aplikasi Jimpitan.
        </p>

        {/* Contact Support */}
        <div className="mt-4 md:mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
            Butuh bantuan? Hubungi admin:
          </p>
          <div className="flex items-center justify-center gap-2 md:gap-3">
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 px-3 py-1.5 md:py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg text-xs md:text-sm font-medium transition-all duration-200 shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/50 hover:scale-105"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
            <a
              href="mailto:admin@jimpitanapp.com"
              className="flex items-center justify-center gap-1 px-3 py-1.5 md:py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg text-xs md:text-sm font-medium transition-all duration-200 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 hover:scale-105"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <span className="hidden sm:inline">Email</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
