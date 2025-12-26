import { useState } from 'react';
import { parseUserExcelFile, validateUserData } from '../utils/excelImport';
import LoadingSpinner from './LoadingSpinner';

export default function ImportUserModal({ isOpen, onClose, onImport }) {
  const [step, setStep] = useState(1); // 1: upload, 2: preview
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError('');

    // Validate file type
    if (!['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'].includes(file.type)) {
      setError('File harus berupa Excel (.xlsx, .xls) atau CSV');
      setSelectedFile(null);
      return;
    }

    try {
      setLoading(true);
      const users = await parseUserExcelFile(file);
      const validation = validateUserData(users);

      setPreviewData(users);
      setValidationResult(validation);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Gagal memproses file');
      setSelectedFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError('');

    // Validate file type
    if (!['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'].includes(file.type)) {
      setError('File harus berupa Excel (.xlsx, .xls) atau CSV');
      setSelectedFile(null);
      return;
    }

    try {
      setLoading(true);
      const users = await parseUserExcelFile(file);
      const validation = validateUserData(users);

      setPreviewData(users);
      setValidationResult(validation);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Gagal memproses file');
      setSelectedFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!validationResult?.valid || previewData.length === 0) {
      setError('Data tidak valid untuk diimport');
      return;
    }

    try {
      setImporting(true);
      await onImport(previewData);
      resetModal();
    } catch (err) {
      setError(err.message || 'Gagal mengimport data');
    } finally {
      setImporting(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setSelectedFile(null);
    setPreviewData([]);
    setValidationResult(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/30 dark:border-gray-700/30">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            📥 Import User
          </h2>
          <button
            onClick={resetModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {loading && <LoadingSpinner text="Memproses file..." />}

          {!loading && step === 1 && (
            <>
              {/* File Upload */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-400 transition-colors"
              >
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Drag file Excel ke sini atau klik
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Format: .xlsx, .xls, .csv
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg cursor-pointer transition-colors"
                >
                  Pilih File
                </label>
              </div>

              {selectedFile && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    ✓ File terseleksi: <strong>{selectedFile.name}</strong>
                  </p>
                </div>
              )}

              {/* Info */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Format File:</h3>
                <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                  <li>• Kolom: Nama, Username, Password, Role</li>
                  <li>• Role: "admin" atau "petugas" (default: petugas)</li>
                  <li>• Password akan di-hash otomatis</li>
                </ul>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    ⚠️ {error}
                  </p>
                </div>
              )}
            </>
          )}

          {!loading && step === 2 && (
            <>
              {/* Validation Result */}
              {!validationResult?.valid && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">Kesalahan ditemukan:</h3>
                  <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
                    {validationResult?.errors.map((err, idx) => (
                      <li key={idx}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validationResult?.valid && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    ✓ Data valid dan siap diimport
                  </p>
                </div>
              )}

              {/* Preview Table */}
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Preview Data:</h3>
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">No</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Nama</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Username</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {previewData.slice(0, 20).map((user, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}>
                          <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{idx + 1}</td>
                          <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{user.name}</td>
                          <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{user.username}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            }`}>
                              {user.role || 'petugas'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.length > 20 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    ... dan {previewData.length - 20} user lainnya
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    ⚠️ {error}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(1)}
                  disabled={importing}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  Kembali
                </button>
                <button
                  onClick={handleImport}
                  disabled={!validationResult?.valid || importing}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {importing && (
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>{importing ? 'Mengimport...' : `Import ${previewData.length} User`}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
