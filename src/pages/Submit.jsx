import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { getCustomerByQRHash, submitToSheet } from '../services/sheets';

export default function Submit({ onBack, qrHash: propsQrHash }) {
  const { currentUser, token } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [formData, setFormData] = useState({
    nominal: ''
  });

  const qrHash = propsQrHash;

  useEffect(() => {
    if (!qrHash) {
      toast.warning('QR Hash tidak ditemukan', 'Silakan scan QR Code terlebih dahulu');
      setLoading(false);
      return;
    }

    loadCustomerData();
  }, [qrHash]);

  async function loadCustomerData() {
    try {
      setLoading(true);
      const response = await getCustomerByQRHash(qrHash);
      
      if (response.status === 'success' && response.data) {
        setCustomer(response.data);
      } else {
        toast.error('Customer tidak ditemukan', 'QR Code tidak valid atau customer telah dihapus');
      }
    } catch (error) {
      toast.error('Gagal memuat data customer', error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validation
    const nominal = parseFloat(formData.nominal);
    if (!nominal || nominal <= 0) {
      toast.error('Nominal tidak valid', 'Masukkan nominal lebih dari 0');
      return;
    }

    if (!customer) {
      toast.error('Data customer tidak ditemukan');
      return;
    }

    if (!token || !currentUser) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        customer_id: customer.id,  // CUST-xxx
        id: customer.blok,         // Blok number
        nama: customer.nama,
        nominal: nominal,
        user_id: currentUser.id,
        petugas: currentUser.name
      };

      const response = await submitToSheet(payload);
      
      if (response.status === 'success') {
        toast.success('Transaksi berhasil dicatat!');
        
        // Reset form
        setFormData({ nominal: '' });
        
        // Navigate after short delay
        setTimeout(() => {
          navigate('/my-history');
        }, 1500);
      } else {
        toast.error(response.message || 'Gagal menyimpan transaksi');
      }

    } catch (error) {
      toast.error('Gagal menyimpan transaksi', error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <PageLayout title="Submit Transaksi" subtitle="Mencatat jimpitan warga" onBack={onBack}>
        <LoadingSpinner text="Memuat data customer..." />
      </PageLayout>
    );
  }

  if (!qrHash) {
    return (
      <PageLayout title="Submit Transaksi" subtitle="Mencatat jimpitan warga" onBack={onBack}>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
            QR Hash Tidak Ditemukan
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            Silakan scan QR Code customer terlebih dahulu
          </p>
          <button
            onClick={() => navigate('/scan-qr')}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
          >
            Scan QR Code
          </button>
        </div>
      </PageLayout>
    );
  }

  if (!customer) {
    return (
      <PageLayout title="Submit Transaksi" subtitle="Mencatat jimpitan warga" onBack={onBack}>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
            Customer Tidak Ditemukan
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-4">
            QR Code tidak valid atau customer telah dihapus
          </p>
          <button
            onClick={() => navigate('/customers')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            Lihat Daftar Customer
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Submit Transaksi" subtitle="Mencatat jimpitan warga" onBack={onBack}>
      <div className="max-w-2xl mx-auto">
        {/* Customer Info Card */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl p-4 md:p-6 mb-4 md:mb-6 shadow-lg">
          <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl md:text-3xl">
              👤
            </div>
            <div className="flex-1">
              <div className="text-xs md:text-sm opacity-90 mb-1">Customer</div>
              <div className="text-xl md:text-2xl font-bold">{customer.nama}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 md:gap-4 pt-3 md:pt-4 border-t border-white/20">
            <div>
              <div className="text-xs md:text-sm opacity-75">Blok</div>
              <div className="text-base md:text-lg font-bold">{customer.blok || customer.id}</div>
            </div>
            <div>
              <div className="text-xs md:text-sm opacity-75">Total Setoran</div>
              <div className="text-base md:text-lg font-bold">
                Rp {(customer.totalSetoran || 0).toLocaleString('id-ID')}
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6">
          <form onSubmit={handleSubmit}>
            {/* Nominal Input */}
            <div className="mb-4 md:mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                💰 Nominal Setoran <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                  Rp
                </span>
                <input
                  type="number"
                  name="nominal"
                  value={formData.nominal}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  disabled={submitting}
                  className="w-full pl-12 pr-4 py-2 md:py-3 text-base md:text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden md:block">
                💡 Masukkan nominal dalam rupiah (contoh: 5000)
              </p>
            </div>

            {/* Petugas Info */}
            <div className="mb-3 md:mb-6 p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-semibold">Petugas:</span> {currentUser?.name} ({currentUser?.username})
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 md:gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={submitting}
                className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-gray-500 hover:bg-gray-600 text-white text-sm md:text-base font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting || !formData.nominal}
                className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white text-sm md:text-base font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    ✅ Submit Transaksi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-3 md:mt-6 p-3 md:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center hidden md:block">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 Transaksi akan tercatat atas nama <strong>{currentUser?.name}</strong>
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
