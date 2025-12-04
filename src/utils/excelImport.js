import * as XLSX from 'xlsx';

/**
 * Parse Excel file and extract customer data
 * Expected columns: Blok, Nama (or similar variations)
 * @param {File} file - Excel file
 * @returns {Promise<Array>} Array of {blok, nama} objects
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Parse and validate data
        const customers = jsonData
          .map((row) => {
            // Try to find blok and nama columns (case-insensitive)
            const blokKey = Object.keys(row).find(key => 
              key.toLowerCase().includes('blok') || 
              key.toLowerCase().includes('block') ||
              key.toLowerCase().includes('no')
            );
            const namaKey = Object.keys(row).find(key => 
              key.toLowerCase().includes('nama') || 
              key.toLowerCase().includes('name')
            );
            
            const blok = row[blokKey] ? String(row[blokKey]).trim() : '';
            const nama = row[namaKey] ? String(row[namaKey]).trim() : '';
            
            return { blok, nama };
          })
          .filter(customer => customer.blok && customer.nama); // Filter out empty rows
        
        if (customers.length === 0) {
          reject(new Error('Tidak ada data customer yang valid. Pastikan file memiliki kolom "Blok" dan "Nama"'));
        } else {
          resolve(customers);
        }
      } catch (error) {
        reject(new Error(`Gagal membaca file Excel: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Gagal membaca file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Validate customer data before import
 * @param {Array} customers - Array of {blok, nama} objects
 * @returns {Object} {valid: boolean, errors: Array}
 */
export function validateCustomerData(customers) {
  const errors = [];
  const seen = new Set();
  
  customers.forEach((customer, index) => {
    const lineNumber = index + 2; // +2 because header is row 1, data starts at row 2
    
    if (!customer.blok) {
      errors.push(`Baris ${lineNumber}: Blok tidak boleh kosong`);
    }
    if (!customer.nama) {
      errors.push(`Baris ${lineNumber}: Nama tidak boleh kosong`);
    }
    
    const key = `${customer.blok}-${customer.nama}`.toLowerCase();
    if (seen.has(key)) {
      errors.push(`Baris ${lineNumber}: Duplikasi Blok "${customer.blok}" dan Nama "${customer.nama}"`);
    }
    seen.add(key);
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
