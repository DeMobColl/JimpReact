import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import PageLayout from '../components/PageLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  getConfig, 
  updateConfig, 
  verifyConfigPassword,
  updateConfigPassword 
} from '../services/sheets';

export default function Config() {
  const { token } = useAuth();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(true);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  
  // Config state
  const [config, setConfig] = useState({
    allowPetugasWebLogin: true,
  });
  
  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadConfig();
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error('Password tidak boleh kosong');
      return;
    }

    setVerifying(true);
    try {
      const response = await verifyConfigPassword(token, password);
      if (response.status === 'success') {
        setIsAuthenticated(true);
        setShowPasswordDialog(false);
        setPassword('');
        toast.success('Akses berhasil');
      } else {
        toast.error(response.message || 'Password salah');
      }
    } catch (error) {
      toast.error('Gagal verifikasi password', error.message);
    } finally {
      setVerifying(false);
    }
  };

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await getConfig(token);
      if (response.status === 'success' && response.data) {
        setConfig(response.data);
      } else {
        toast.error(response.message || 'Gagal memuat konfigurasi');
      }
    } catch (error) {
      toast.error('Error memuat konfigurasi', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConfig = async (key) => {
    setSaving(true);
    try {
      const newValue = !config[key];
      const response = await updateConfig(token, key, newValue);
      
      if (response.status === 'success') {
        setConfig(prev => ({ ...prev, [key]: newValue }));
        toast.success('Konfigurasi berhasil diupdate');
      } else {
        toast.error(response.message || 'Gagal update konfigurasi');
      }
    } catch (error) {
      toast.error('Error update konfigurasi', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Semua field harus diisi');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password baru dan konfirmasi tidak cocok');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    setSaving(true);
    try {
      const response = await updateConfigPassword(
        token, 
        passwordForm.currentPassword, 
        passwordForm.newPassword
      );
      
      if (response.status === 'success') {
        toast.success('Password konfigurasi berhasil diubah');
        setShowChangePassword(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(response.message || 'Gagal ubah password');
      }
    } catch (error) {
      toast.error('Error ubah password', error.message);
    } finally {
      setSaving(false);
    }
  };

  // Password Dialog
  if (showPasswordDialog && !isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              🔐 Akses Konfigurasi
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Masukkan password khusus untuk mengakses menu konfigurasi sistem
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password Konfigurasi
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan password"
                disabled={verifying}
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                disabled={verifying}
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifikasi...
                  </>
                ) : (
                  'Akses'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <PageLayout title="⚙️ Konfigurasi Sistem" subtitle="Pengaturan sistem aplikasi">
        <LoadingSpinner text="Memuat konfigurasi..." />
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="⚙️ Konfigurasi Sistem" 
      subtitle="Pengaturan dan kontrol sistem aplikasi"
    >
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Security Warning */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-1">
                ⚠️ Area Sensitif
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-400">
                Perubahan pada konfigurasi ini dapat mempengaruhi seluruh sistem. Pastikan Anda memahami dampak dari setiap perubahan.
              </p>
            </div>
          </div>
        </div>

        {/* Login Control */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Login Petugas via Web
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Kontrol akses login untuk role petugas melalui aplikasi web
                </p>
              </div>
            </div>
            
            <button
              onClick={() => handleToggleConfig('allowPetugasWebLogin')}
              disabled={saving}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                config.allowPetugasWebLogin
                  ? 'bg-green-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  config.allowPetugasWebLogin ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className={`p-4 rounded-lg border-2 ${
            config.allowPetugasWebLogin
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
          }`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {config.allowPetugasWebLogin ? (
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${
                  config.allowPetugasWebLogin
                    ? 'text-green-900 dark:text-green-300'
                    : 'text-red-900 dark:text-red-300'
                }`}>
                  Status: {config.allowPetugasWebLogin ? 'Diizinkan ✅' : 'Diblokir 🚫'}
                </p>
                <p className={`text-xs mt-1 ${
                  config.allowPetugasWebLogin
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-red-700 dark:text-red-400'
                }`}>
                  {config.allowPetugasWebLogin
                    ? 'Petugas dapat login melalui aplikasi web'
                    : 'Petugas tidak dapat login melalui aplikasi web (hanya admin)'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Password Konfigurasi
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ubah password untuk mengakses menu konfigurasi
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {showChangePassword ? 'Batal' : 'Ubah Password'}
            </button>
          </div>

          {showChangePassword && (
            <form onSubmit={handleChangePasswordSubmit} className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Password Lama
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan password lama"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan password baru (min. 6 karakter)"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ketik ulang password baru"
                  disabled={saving}
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? 'Menyimpan...' : 'Simpan Password Baru'}
              </button>
            </form>
          )}
        </div>

        {/* Info Footer */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-900 dark:text-blue-300">
              Konfigurasi ini memerlukan password khusus yang berbeda dengan password login admin. 
              Pastikan password disimpan dengan aman dan hanya dibagikan kepada personel yang berwenang.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
