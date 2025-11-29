import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { useToast } from '../hooks/useToast.jsx';

export default function ScanQR() {
  const navigate = useNavigate();
  const toast = useToast();
  const scannerContainer = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const html5QrCodeRef = useRef(null);
  const isScanningRef = useRef(false); // Use ref to avoid stale closure

  const getScannerHeight = () => {
    if (window.innerWidth < 640) return '180px';
    if (window.innerWidth < 1024) return '200px';
    return '220px';
  };

  const [scannerHeight, setScannerHeight] = useState(getScannerHeight());

  useEffect(() => {
    const handleResize = () => {
      setScannerHeight(getScannerHeight());
    };
    window.addEventListener('resize', handleResize);
    
    // Auto start scan on mount with slight delay to ensure DOM is ready
    const timer = setTimeout(() => {
      startScan();
    }, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
      // Clean up scanner on unmount
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().catch(() => {});
          html5QrCodeRef.current = null;
        } catch (e) {
          // Cleanup error ignored
        }
      }
    };
  }, []);

  const startScan = async () => {
    if (isScanning || html5QrCodeRef.current) return;

    setError('');
    setMessage('');

    try {
      const scannerId = 'qr-reader';
      
      html5QrCodeRef.current = new Html5Qrcode(scannerId);

      const qrBoxSize = window.innerWidth < 640 ? 160 : window.innerWidth < 1024 ? 180 : 200;
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: qrBoxSize, height: qrBoxSize },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        onScanFailure
      );

      setIsScanning(true);
      isScanningRef.current = true;
      setMessage('Scanning...');
    } catch (err) {
      setError('Gagal mengaktifkan kamera. Pastikan izin kamera sudah diberikan.');
      setIsScanning(false);
      isScanningRef.current = false;
    }
  };

  const stopScan = async () => {
    if (!html5QrCodeRef.current) return;

    try {
      setIsScanning(false);
      isScanningRef.current = false;
      await html5QrCodeRef.current.stop();
      html5QrCodeRef.current = null;
      setMessage('');
    } catch (err) {
      // Force cleanup even if error occurs
      html5QrCodeRef.current = null;
      setMessage('');
    }
  };

  const onScanSuccess = async (decodedText) => {
    // Prevent multiple scans using ref (avoid stale closure)
    if (!isScanningRef.current) {
      return;
    }
    
    // Scan hash customer (10 karakter hexadecimal)
    const cleanText = decodedText.trim();
      
      if (cleanText.length === 10 && /^[A-F0-9]+$/i.test(cleanText)) {
        
        // Stop immediately to prevent multiple scans
        setIsScanning(false);
        isScanningRef.current = false;
        
        const hashUpper = cleanText.toUpperCase();
        const targetUrl = `/submit?qrHash=${hashUpper}`;
        
        if (html5QrCodeRef.current) {
          html5QrCodeRef.current.stop()
            .then(() => {
              html5QrCodeRef.current = null;
              setMessage('QR Hash terdeteksi! Mengambil data customer...');
              toast.success('QR Code berhasil discan!');
              navigate(targetUrl);
            })
            .catch((e) => {
              html5QrCodeRef.current = null;
              toast.success('QR Code berhasil discan!');
              navigate(targetUrl);
            });
        } else {
          toast.success('QR Code berhasil discan!');
          navigate(targetUrl);
        }
      } else {
      setError(`Format hash tidak valid: "${cleanText}". Hash harus 10 karakter hexadecimal.`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const onScanFailure = () => {
    // Ignore scan failures
  };

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 via-purple-50/40 to-violet-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900 px-4 py-2 transition-colors duration-300">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-slate-300/50 dark:shadow-none border border-slate-200/60 dark:border-gray-700/60 p-3 md:p-4 w-full max-w-2xl text-center transition-all duration-300">
        
        {/* Header Icon */}
        <div className="mb-2">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-violet-500 dark:from-purple-600 dark:to-violet-600 rounded-2xl shadow-xl shadow-purple-200/50 dark:shadow-purple-900/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 md:h-10 md:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1.5">
          Scan QR Code
        </h1>

        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-3">
          Arahkan kamera ke QR code customer untuk memindai
        </p>

        {/* Scanner Container */}
        <div className="relative mb-2">
          <div
            id="qr-reader"
            ref={scannerContainer}
            className="w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800"
            style={{ minHeight: scannerHeight }}
          ></div>
          {!isScanning && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-2xl pointer-events-none"
              style={{ zIndex: 1 }}
            >
              <p className="text-gray-500 dark:text-gray-400 text-sm">Kamera belum aktif</p>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-xl p-2 animate-fade-in">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700 rounded-xl p-2 animate-fade-in">
            {message}
          </div>
        )}

        {/* Control Buttons */}
        <div className="mt-2 flex gap-2 justify-center">
          {!isScanning ? (
            <button
              onClick={startScan}
              className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white rounded-xl shadow-xl shadow-purple-200/50 hover:shadow-2xl hover:shadow-purple-300/50 dark:shadow-purple-900/30 dark:hover:shadow-purple-800/40 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span>Mulai Scan</span>
            </button>
          ) : (
            <button
              onClick={stopScan}
              className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl shadow-xl shadow-red-200/50 hover:shadow-2xl hover:shadow-red-300/50 dark:shadow-red-900/30 dark:hover:shadow-red-800/40 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              <span>Stop Scan</span>
            </button>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-2">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-xs font-medium bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 dark:hover:from-purple-900/20 dark:hover:to-violet-900/20 rounded-xl shadow-md hover:shadow-lg hover:shadow-purple-200/50 dark:hover:shadow-none transition-all duration-200 flex items-center justify-center gap-1.5 mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali ke Home
          </button>
        </div>
      </div>
    </div>
  );
}
