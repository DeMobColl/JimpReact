import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import { getTransactionHistory, deleteTransaction, bulkDeleteTransactions } from '../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function History({ onBack }) {
  const { currentUser, token } = useAuth();
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const result = await getTransactionHistory(token);
      if (Array.isArray(result.transactions)) {
        // Normalize transaction data to ensure all fields exist
        const normalized = result.transactions.map(tx => ({
          txid: tx.txid || '',
          timestamp: tx.timestamp || tx.waktu || new Date().toISOString(),
          customer_id: tx.customer_id || '',
          blok: tx.blok || tx.block || '',
          nama: tx.nama || tx.name || '-',
          nominal: Number(tx.nominal || tx.amount || 0),
          user_id: tx.user_id || '',
          petugas: tx.petugas || tx.user_name || '-',
          waktu: tx.waktu || tx.timestamp || new Date().toISOString()
        }));
        setTransactions(normalized);
      } else {
        setTransactions([]);
        toast.error('Format data tidak valid');
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memuat data riwayat');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch =
      (tx.nama && tx.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.txid && tx.txid.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.petugas && tx.petugas.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesDate = true;
    const txDate = new Date(tx.timestamp || tx.waktu || new Date());

    if (selectedMonth) {
      matchesDate = matchesDate && txDate.getMonth() === parseInt(selectedMonth);
    }
    if (selectedYear) {
      matchesDate = matchesDate && txDate.getFullYear() === parseInt(selectedYear);
    }

    return matchesSearch && matchesDate;
  }).sort((a, b) => {
    const dateA = new Date(a.timestamp || a.waktu || 0).getTime();
    const dateB = new Date(b.timestamp || b.waktu || 0).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (timestamp) => {
    // Jika sudah dalam format string yang sudah diformat (dari waktu field)
    if (timestamp && typeof timestamp === 'string' && timestamp.includes('/')) {
      return timestamp;
    }
    // Jika timestamp
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return timestamp || '-';
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalAmount = filteredTransactions.reduce((sum, tx) => sum + (Number(tx.nominal) || 0), 0);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique years from data
  const years = [...new Set(transactions.map(tx => {
    const date = new Date(tx.timestamp || tx.waktu);
    return !isNaN(date.getTime()) ? date.getFullYear() : null;
  }).filter(year => year !== null))].sort((a, b) => b - a);

  // Get unique months from data (filtered by selected year if any)
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const availableMonths = [...new Set(transactions
    .filter(tx => {
      if (!selectedYear) return true;
      const date = new Date(tx.timestamp || tx.waktu);
      return !isNaN(date.getTime()) && date.getFullYear() === parseInt(selectedYear);
    })
    .map(tx => {
      const date = new Date(tx.timestamp || tx.waktu);
      return !isNaN(date.getTime()) ? date.getMonth() : null;
    })
    .filter(month => month !== null)
  )].sort((a, b) => a - b).map(month => ({
    value: month.toString(),
    label: monthNames[month]
  }));

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMonth, selectedYear, sortOrder]);

  const exportToPDF = () => {
    if (filteredTransactions.length === 0) {
      toast.error('Tidak ada data untuk diexport');
      return;
    }

    setIsExportingPDF(true);
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Laporan Transaksi Jimpitan', 105, 15, { align: 'center' });

      // Period
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      let periode = 'Semua Periode';
      if (selectedMonth && selectedYear) {
        periode = `${monthNames[parseInt(selectedMonth)]} ${selectedYear}`;
      } else if (selectedMonth) {
        periode = monthNames[parseInt(selectedMonth)];
      } else if (selectedYear) {
        periode = `Tahun ${selectedYear}`;
      }
      doc.text(`Periode: ${periode}`, 105, 22, { align: 'center' });

      // Export date
      doc.setFontSize(9);
      const exportDate = new Date().toLocaleString('id-ID');
      doc.text(`Dicetak: ${exportDate}`, 105, 28, { align: 'center' });

      // Table data
      const tableData = filteredTransactions.map((item, index) => [
        index + 1,
        item.blok || '-',
        item.nama || '-',
        `Rp${Number(item.nominal || 0).toLocaleString('id-ID')}`,
        formatDateTime(item.waktu || item.timestamp || new Date()),
        item.petugas || '-',
      ]);

      // Total
      const total = filteredTransactions.reduce((sum, item) => sum + Number(item.nominal || 0), 0);

      // Create table
      autoTable(doc, {
        startY: 35,
        head: [['No', 'Blok', 'Nama', 'Nominal', 'Waktu', 'Petugas']],
        body: tableData,
        foot: [['', '', 'TOTAL', `Rp${total.toLocaleString('id-ID')}`, '', '']],
        theme: 'striped',
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
        },
        footStyles: {
          fillColor: [229, 231, 235],
          textColor: 0,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { halign: 'center', cellWidth: 20 },
          2: { cellWidth: 50 },
          3: { halign: 'right', cellWidth: 30 },
          4: { cellWidth: 40 },
          5: { cellWidth: 30 },
        },
      });

      // Save
      const filename = `Jimpitan_${periode.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      doc.save(filename);
      toast.success('PDF berhasil diexport');
    } catch (error) {
      toast.error('Gagal export PDF: ' + error.message);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const exportToExcel = () => {
    if (filteredTransactions.length === 0) {
      toast.error('Tidak ada data untuk diexport');
      return;
    }

    setIsExportingExcel(true);
    try {
      // Prepare data
      const excelData = filteredTransactions.map((item, index) => ({
        'No': index + 1,
        'Blok': item.blok || '-',
        'Nama': item.nama || '-',
        'Nominal': Number(item.nominal || 0),
        'Waktu': formatDateTime(item.waktu || item.timestamp),
        'Petugas': item.petugas || '-',
      }));

      // Add total row
      const total = filteredTransactions.reduce((sum, item) => sum + Number(item.nominal || 0), 0);
      excelData.push({
        'No': '',
        'Blok': '',
        'Nama': 'TOTAL',
        'Nominal': total,
        'Waktu': '',
        'Petugas': '',
      });

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 5 },  // No
        { wch: 10 }, // Blok
        { wch: 30 }, // Nama
        { wch: 15 }, // Nominal
        { wch: 20 }, // Waktu
        { wch: 15 }, // Petugas
      ];

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Jimpitan');

      // Generate filename
      let periode = 'Semua_Periode';
      if (selectedMonth && selectedYear) {
        periode = `${monthNames[parseInt(selectedMonth)]}_${selectedYear}`;
      } else if (selectedMonth) {
        periode = monthNames[parseInt(selectedMonth)];
      } else if (selectedYear) {
        periode = `Tahun_${selectedYear}`;
      }
      const filename = `Jimpitan_${periode}_${Date.now()}.xlsx`;

      // Save
      XLSX.writeFile(workbook, filename);
      toast.success('Excel berhasil diexport');
    } catch (error) {
      toast.error('Gagal export Excel: ' + error.message);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const requestDelete = (tx) => {
    setConfirmData({ type: 'delete', transaction: tx });
  };

  const handleConfirm = async () => {
    if (!confirmData || confirmData.type !== 'delete') return;
    const { transaction } = confirmData;
    
    // Validasi: petugas hanya bisa hapus transaksi miliknya sendiri
    if (!currentUser.isAdmin && transaction.user_id !== currentUser.id) {
      toast.error('Anda hanya bisa menghapus transaksi milik Anda sendiri');
      setConfirmData(null);
      return;
    }

    setLoading(true);
    try {
      const res = await deleteTransaction(token, transaction.txid);
      if (res.status !== 'success') throw new Error(res.message || 'Gagal hapus transaksi');
      setTransactions(prev => prev.filter(p => p.txid !== transaction.txid));
      toast.success('Transaksi berhasil dihapus');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
      setConfirmData(null);
    }
  };

  const toggleItemSelection = (txid) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(txid)) {
      newSelected.delete(txid);
    } else {
      newSelected.add(txid);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === paginatedTransactions.length) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(paginatedTransactions.map(t => t.txid));
      setSelectedItems(allIds);
    }
  };

  const requestBulkDelete = () => {
    if (selectedItems.size === 0) {
      toast.warning('Pilih minimal 1 transaksi untuk dihapus');
      return;
    }
    setConfirmData({ type: 'bulk-delete', ids: Array.from(selectedItems) });
  };

  const handleBulkDelete = async () => {
    if (!confirmData || confirmData.type !== 'bulk-delete') return;
    const { ids } = confirmData;

    setLoading(true);
    try {
      const res = await bulkDeleteTransactions(token, ids);
      if (res.status !== 'success') throw new Error(res.message || 'Gagal hapus transaksi');
      setTransactions(prev => prev.filter(p => !ids.includes(p.txid)));
      setSelectedItems(new Set());
      toast.success(`${res.data.deleted || ids.length} transaksi berhasil dihapus`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
      setConfirmData(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white via-red-50/20 to-white/80 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900 transition-colors duration-300">
      <div className="flex-1 overflow-auto p-3 md:p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-300/50 dark:shadow-none border border-slate-200/60 dark:border-gray-700/60 p-4 md:p-5">

            {/* Header */}
            <div className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {onBack && (
                    <button
                      onClick={onBack}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                      title="Kembali"
                    >
                      <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 dark:from-red-400 dark:to-red-500 text-transparent bg-clip-text mb-1">
                      Riwayat Transaksi
                    </h1>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Total: {filteredTransactions.length} transaksi • {formatCurrency(totalAmount)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {currentUser.isAdmin && selectedItems.size > 0 && (
                    <button
                      onClick={requestBulkDelete}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Hapus ({selectedItems.size})
                    </button>
                  )}
                  <button
                    onClick={exportToPDF}
                    disabled={filteredTransactions.length === 0 || isExportingPDF}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    {isExportingPDF ? 'Export...' : 'PDF'}
                  </button>
                  <button
                    onClick={exportToExcel}
                    disabled={filteredTransactions.length === 0 || isExportingExcel}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {isExportingExcel ? 'Export...' : 'Excel'}
                  </button>
                </div>
              </div>
            </div>

            {/* Filters and Pagination */}
            <div className="space-y-2 mb-3">
              {/* Search - Full Width */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                />
                <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Month, Year, Sort - Grid */}
              <div className="grid grid-cols-3 gap-2">
                {/* Month */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-2 py-1.5 text-xs bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                >
                  <option value="">Bulan</option>
                  {availableMonths.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>

                {/* Year */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-2 py-1.5 text-xs bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                >
                  <option value="">Tahun</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>

                {/* Sort Toggle */}
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="px-2 py-1.5 text-xs font-medium bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortOrder === 'desc' ? 'M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12' : 'M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4'} />
                  </svg>
                  {sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}
                </button>
              </div>
            </div>

            {/* Transaction List */}
            <div className="space-y-1.5">
              {currentUser.isAdmin && paginatedTransactions.length > 0 && (
                <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-100 dark:bg-gray-700 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === paginatedTransactions.length && paginatedTransactions.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {selectedItems.size === 0 ? 'Pilih semua' : `${selectedItems.size} dipilih`}
                  </span>
                </div>
              )}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner loading text="Memuat data..." />
                </div>
              ) : paginatedTransactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                  Tidak ada transaksi ditemukan
                </div>
              ) : (
                paginatedTransactions.map((tx, index) => (
                  <div
                    key={`${tx.txid || tx.timestamp || 'unknown'}-${index}`}
                    className="bg-gradient-to-r from-slate-50/80 to-blue-50/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg p-2 border border-slate-200/60 dark:border-gray-600/60 hover:shadow-md transition-all duration-200 flex items-start gap-2"
                  >
                    {currentUser.isAdmin && (
                      <input
                        type="checkbox"
                        checked={selectedItems.has(tx.txid)}
                        onChange={() => toggleItemSelection(tx.txid)}
                        className="w-4 h-4 rounded border-gray-300 cursor-pointer flex-shrink-0 mt-2"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                            {tx.nama || '-'}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {tx.blok || '-'}
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <p className="font-bold text-sm text-blue-600 dark:text-blue-400">
                            {formatCurrency(tx.nominal || 0)}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {tx.petugas || '-'}
                          </p>
                          {(currentUser.isAdmin || tx.user_id === currentUser.id) && (
                            <button
                              onClick={() => requestDelete(tx)}
                              className="text-xs text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 font-medium mt-1"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {formatDateTime(tx.waktu || tx.timestamp || new Date())}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-gray-700">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  ‹
                </button>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-xs bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!confirmData}
        title={confirmData?.type === 'bulk-delete' ? 'Konfirmasi Hapus Massal' : 'Konfirmasi Hapus'}
        message={confirmData?.type === 'bulk-delete' ? `Yakin ingin menghapus ${confirmData?.ids?.length} transaksi ini?` : 'Yakin ingin menghapus transaksi ini?'}
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmData?.type === 'bulk-delete' ? handleBulkDelete : handleConfirm}
        onClose={() => setConfirmData(null)}
      />
    </div>
  );
}
