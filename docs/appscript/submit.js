/**
 * ========================================
 * SUBMIT TRANSACTION FUNCTIONS
 * ========================================
 * Handle transaction submission (single, bulk, import)
 */

/**
 * Submit single transaction to Jimpitan sheet
 * @param {object} params - Transaction data
 * @return {object} Response object
 */
function submitTransaction(params) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Jimpitan');
    
    if (!sheet) {
      return {
        status: 'error',
        message: 'Sheet "Jimpitan" tidak ditemukan'
      };
    }
    
    // Validate required fields
    if (!params.id || !params.nama || !params.nominal) {
      return {
        status: 'error',
        message: 'Data tidak lengkap: id, nama, dan nominal harus diisi'
      };
    }
    
    if (params.nominal <= 0) {
      return {
        status: 'error',
        message: 'Nominal harus lebih dari 0'
      };
    }
    
    var timestamp = getCurrentTimestamp();
    
    // Generate TXID
    var lastRow = sheet.getLastRow();
    var txid = lastRow.toString().padStart(4, '0'); // e.g., 0001, 0002, etc.
    
    // Map frontend params to sheet columns
    // Frontend sends: {customer_id, id (blok), nama, nominal, user_id, petugas}
    // Sheet structure: A=TXID | B=Timestamp | C=Customer ID | D=Blok/ID | E=Nama | F=Nominal | G=user_id | H=petugas
    var newRow = lastRow + 1;
    
    // Ensure nominal is a number
    var nominalValue = parseFloat(params.nominal) || 0;
    
    Logger.log('💾 Writing to sheet - Row ' + newRow + ':');
    Logger.log('  TXID: ' + txid);
    Logger.log('  Customer ID: ' + params.customer_id);
    Logger.log('  Blok: ' + params.id);
    Logger.log('  Nama: ' + params.nama);
    Logger.log('  Nominal (raw): ' + params.nominal + ' → (parsed): ' + nominalValue);
    Logger.log('  User ID: ' + params.user_id);
    Logger.log('  Petugas: ' + params.petugas);
    
    sheet.appendRow([
      txid,                     // A: TXID (primary key)
      timestamp,                // B: timestamp (server-side)
      params.customer_id || '', // C: customer_id (CUST-xxx)
      params.id || '',          // D: blok (customer blok/ID number)
      params.nama || '',        // E: nama (customer name)
      nominalValue,             // F: nominal (amount as number)
      params.user_id || '',     // G: user_id (staff ID)
      params.petugas || ''      // H: petugas (staff name)
    ]);
    
    // Set format for nominal column as plain number (no currency format)
    var nominalCell = sheet.getRange(newRow, 6); // Column F
    nominalCell.setNumberFormat('"Rp" #,##0');
    
    SpreadsheetApp.flush(); // Force write to sheet
    
    Logger.log('✅ Row written successfully');
    
    // Update customer stats (if customer exists with this customer_id)
    if (params.customer_id) {
      Logger.log('📊 Calling updateCustomerStats for customer_id: ' + params.customer_id);
      updateCustomerStats(params.customer_id, nominalValue, timestamp);
    } else {
      Logger.log('⚠️ No params.customer_id provided, skipping stats update');
    }
    
    return {
      status: 'success',
      message: 'Transaksi berhasil ditambahkan',
      data: {
        txid: txid,
        timestamp: timestamp,
        customer_id: params.customer_id,
        blok: params.id,
        nama: params.nama,
        nominal: params.nominal
      }
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error: ' + error.toString()
    };
  }
}

/**
 * Submit bulk transactions (multiple at once)
 * @param {array} transactions - Array of transaction objects
 * @return {object} Response object
 */
function submitBulkTransactions(transactions) {
  try {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return {
        status: 'error',
        message: 'Data transaksi harus berupa array yang tidak kosong'
      };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Jimpitan');
    
    if (!sheet) {
      return {
        status: 'error',
        message: 'Sheet "Jimpitan" tidak ditemukan'
      };
    }
    
    var timestamp = getCurrentTimestamp();
    var rows = [];
    var successCount = 0;
    var failedItems = [];
    var updatedBloks = {};
    
    // Prepare all rows
    for (var i = 0; i < transactions.length; i++) {
      var params = transactions[i];
      
      // Validate each transaction
      if (!params.id || !params.nama || !params.nominal) {
        failedItems.push({
          index: i + 1,
          reason: 'Data tidak lengkap'
        });
        continue;
      }
      
      if (params.nominal <= 0) {
        failedItems.push({
          index: i + 1,
          reason: 'Nominal harus lebih dari 0'
        });
        continue;
      }
      
      var bulkTxid = (sheet.getLastRow() + rows.length).toString().padStart(4, '0');
      
      rows.push([
        bulkTxid,
        timestamp,
        params.customer_id || '',
        params.id || '',
        params.nama || '',
        params.nominal || 0,
        params.user_id || '',
        params.petugas || ''
      ]);
      
      // Track customer_ids that need stats update
      if (params.customer_id) {
        if (!updatedBloks[params.customer_id]) {
          updatedBloks[params.customer_id] = {nominal: 0, timestamp: timestamp};
        }
        updatedBloks[params.customer_id].nominal += params.nominal;
      }
      successCount++;
    }
    
    // Batch insert all rows
    if (rows.length > 0) {
      var range = sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 8);
      range.setValues(rows);
      
      // Update stats for all affected customers
      for (var customer_id in updatedBloks) {
        var data = updatedBloks[customer_id];
        updateCustomerStats(customer_id, data.nominal, data.timestamp);
      }
    }
    
    return {
      status: successCount > 0 ? 'success' : 'error',
      message: successCount + ' dari ' + transactions.length + ' transaksi berhasil ditambahkan',
      data: {
        total: transactions.length,
        success: successCount,
        failed: failedItems.length,
        failedItems: failedItems,
        timestamp: timestamp
      }
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error: ' + error.toString()
    };
  }
}

/**
 * Import transactions from external data (CSV/Excel format)
 * @param {object} params - Import parameters {data: array, source: string}
 * @return {object} Response object
 */
function importTransactions(params) {
  try {
    if (!params.data || !Array.isArray(params.data)) {
      return {
        status: 'error',
        message: 'Data import harus berupa array'
      };
    }
    
    // Transform import data to transaction format
    var transactions = [];
    var timestamp = getCurrentTimestamp();
    
    for (var i = 0; i < params.data.length; i++) {
      var row = params.data[i];
      
      // Expected format: [blok, nama, nominal, tanggal]
      // or object: {blok, nama, nominal, tanggal}
      var transaction = {};
      
      if (Array.isArray(row)) {
        transaction = {
          customer_id: row[0] || '',
          id: row[1] || '',
          nama: row[2] || '',
          nominal: parseFloat(row[3]) || 0,
          user_id: params.user_id || '',
          petugas: params.petugas || 'Import'
        };
      } else {
        transaction = {
          customer_id: row.customer_id || '',
          id: row.blok || row.id || '',
          nama: row.nama || '',
          nominal: parseFloat(row.nominal || row.jumlah) || 0,
          user_id: params.user_id || '',
          petugas: params.petugas || 'Import'
        };
      }
      
      transactions.push(transaction);
    }
    
    // Use bulk submission
    var result = submitBulkTransactions(transactions);
    result.source = params.source || 'import';
    
    return result;
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error import: ' + error.toString()
    };
  }
}
