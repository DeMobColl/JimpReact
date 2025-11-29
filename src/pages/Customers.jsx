import { useState, useEffect, useMemo } from 'react';
import PageLayout from '../components/PageLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import QRCard from '../components/QRCard';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  getCustomersFromSheet,
  createCustomerInSheet,
  updateCustomerInSheet,
  deleteCustomerInSheet,
} from '../services/sheets';

export default function Customers() {
  const { currentUser, token } = useAuth();
  const toast = useToast();

  // State management
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchBlok, setSearchBlok] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [formData, setFormData] = useState({
    blok: '',
    nama: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // QR Code display
  const [showQRCard, setShowQRCard] = useState(false);
  const [qrCustomer, setQrCustomer] = useState(null);

  // Load customers
  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      setLoading(true);
      const response = await getCustomersFromSheet();
      
      if (response.status === 'success') {
        
        // Sanitize customer data - ensure all properties are strings
        const sanitizedData = (response.data || []).map(customer => ({
          ...customer,
          id: customer.id || '',
          blok: customer.blok || '',
          nama: customer.nama || '',
          qrHash: customer.qrHash || '',
          createdAt: customer.createdAt || '',
          totalSetoran: customer.totalSetoran || 0,
          lastTransaction: customer.lastTransaction || null
        }));
        
        setCustomers(sanitizedData);
      } else {
        toast.error(response.message || 'Gagal memuat data customer');
        setCustomers([]); // Set empty array on error
      }
    } catch (error) {
      toast.error('Error memuat data customer', error.message);
      setCustomers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // Safety checks untuk null/undefined
      const customerName = customer?.nama || '';
      const customerBlok = customer?.blok || '';
      
      const nameMatch = customerName.toString().toLowerCase().includes(searchName.toLowerCase());
      const blokMatch = customerBlok.toString().toLowerCase().includes(searchBlok.toLowerCase());
      return nameMatch && blokMatch;
    });
  }, [customers, searchName, searchBlok]);

  // Paginate filtered customers
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCustomers.slice(startIndex, endIndex);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, searchBlok]);

  // Form handlers
  function handleCreate() {
    setFormMode('create');
    setCurrentCustomer(null);
    setFormData({ blok: '', nama: '' });
    setShowForm(true);
  }

  function handleEdit(customer) {
    setFormMode('edit');
    setCurrentCustomer(customer);
    setFormData({
      blok: customer.blok,
      nama: customer.nama,
    });
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setCurrentCustomer(null);
    setFormData({ blok: '', nama: '' });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validation - Convert to string first
    const blokStr = String(formData.blok || '').trim();
    const namaStr = String(formData.nama || '').trim();
    
    if (!blokStr || !namaStr) {
      toast.error('Blok dan nama harus diisi');
      return;
    }

    if (!token) {
      toast.error('Token tidak ditemukan, silakan login ulang');
      return;
    }

    if (currentUser?.role !== 'admin') {
      toast.error('Hanya admin yang dapat mengelola customer');
      return;
    }

    try {
      setSubmitting(true);

      // Prepare data with string values
      const submitData = {
        blok: blokStr,
        nama: namaStr
      };

      let response;
      if (formMode === 'create') {
        response = await createCustomerInSheet(token, submitData);
      } else {
        response = await updateCustomerInSheet(token, currentCustomer.id, submitData);
      }

      if (response.status === 'success') {
        toast.success(
          formMode === 'create' ? 'Customer berhasil ditambahkan' : 'Customer berhasil diupdate'
        );
        handleCloseForm();
        await loadCustomers();
      } else {
        toast.error(response.message || 'Operasi gagal');
      }
    } catch (error) {
      toast.error('Error saat menyimpan customer', error.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDeleteClick(customer) {
    setCustomerToDelete(customer);
    setShowDeleteConfirm(true);
  }

  async function handleDeleteConfirm() {
    if (!customerToDelete || !token) return;

    try {
      const response = await deleteCustomerInSheet(token, customerToDelete.id);
      
      if (response.status === 'success') {
        toast.success('Customer berhasil dihapus');
        setShowDeleteConfirm(false);
        setCustomerToDelete(null);
        await loadCustomers();
      } else {
        toast.error(response.message || 'Gagal menghapus customer');
      }
    } catch (error) {
      toast.error('Error saat menghapus customer', error.message);
    }
  }

  function handleShowQR(customer) {
    setQrCustomer(customer);
    setShowQRCard(true);
  }

  function handleCloseQR() {
    setShowQRCard(false);
    setQrCustomer(null);
  }

  if (loading) {
    return (
      <PageLayout title="Manajemen Customer" subtitle="Kelola data customer dan QR code">
        <LoadingSpinner text="Memuat data customer..." />
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="📋 Manajemen Customer" 
      subtitle="Kelola data customer dan QR code"
      actions={
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah
        </button>
      }
    >
      {/* Stats Info */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total: <strong>{customers.length}</strong> customer • Halaman {currentPage} dari {totalPages || 1}
        </div>
      </div>

      {/* Search Filters */}
      {customers.length > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Cari nama customer..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Cari blok..."
              value={searchBlok}
              onChange={(e) => setSearchBlok(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          {(searchName || searchBlok) && (
            <button
              onClick={() => {
                setSearchName('');
                setSearchBlok('');
              }}
              className="px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Filter Results Info */}
      {customers.length > 0 && (
        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Menampilkan {filteredCustomers.length} dari {customers.length} customer
        </div>
      )}

      {/* Empty State */}
      {customers.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Belum Ada Customer
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Tambahkan customer pertama untuk mulai menggunakan sistem Jimpitan
          </p>
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            Tambah Customer Pertama
          </button>
        </div>
      )}

      {/* No Results State */}
      {customers.length > 0 && filteredCustomers.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Tidak Ada Hasil
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Coba ubah kata kunci pencarian Anda
          </p>
        </div>
      )}

      {/* Customer Grid */}
      {filteredCustomers.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
            {paginatedCustomers.map((customer) => {
              // Safety check untuk data customer
              if (!customer || !customer.id) return null;
              
              return (
              <div
                key={customer.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 text-white text-center">
                  <div className="text-xs opacity-75 mb-1">Blok {customer.blok || '-'}</div>
                  <div className="text-lg font-bold mb-1">{customer.id || '-'}</div>
                  <div className="text-sm font-semibold">{customer.nama || '-'}</div>
                </div>

                {/* Card Body */}
                <div className="p-3">
                  {/* QR Hash - Center */}
                  <div className="mb-3 text-center">
                    <div className="font-mono text-lg bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 px-3 py-2 rounded-lg font-bold text-purple-700 dark:text-purple-300">
                      {customer.qrHash || '-'}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                      <div className="text-xs text-green-600 dark:text-green-400">Total</div>
                      <div className="text-sm font-bold text-green-700 dark:text-green-300">
                        Rp {(customer.totalSetoran || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                      <div className="text-xs text-blue-600 dark:text-blue-400">Terakhir Pencatatan</div>
                      <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                        {customer.lastTransaction
                          ? new Date(customer.lastTransaction).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }) + ', ' + new Date(customer.lastTransaction).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '-'}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleShowQR(customer)}
                      className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                      title="Lihat QR Code"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      QR
                    </button>
                    <button
                      onClick={() => handleEdit(customer)}
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                      title="Edit Customer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(customer)}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                      title="Hapus Customer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            )})}
          </div>

          {/* Pagination - Fixed at bottom */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 py-3">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                ‹ Prev
              </button>
              <div className="text-sm text-gray-600 dark:text-gray-400 px-3">
                {currentPage} / {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next ›
              </button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseForm}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {formMode === 'create' ? '➕ Tambah Customer' : '✏️ Edit Customer'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Blok Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Blok / ID Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.blok}
                  onChange={(e) => setFormData({ ...formData, blok: e.target.value })}
                  placeholder="Contoh: A-12, B-05, dst"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Nama Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Nama customer"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Info Text */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                💡 QR Code akan otomatis dibuat setelah customer ditambahkan
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Menyimpan...' : formMode === 'create' ? 'Tambah' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Hapus Customer"
        message={
          customerToDelete
            ? `Apakah Anda yakin ingin menghapus customer "${customerToDelete.nama}" (Blok: ${customerToDelete.blok})? Tindakan ini tidak dapat dibatalkan.`
            : ''
        }
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setCustomerToDelete(null);
        }}
        type="danger"
      />

      {/* QR Code Modal */}
      {showQRCard && qrCustomer && <QRCard customer={qrCustomer} onClose={handleCloseQR} />}
    </PageLayout>
  );
}
