/**
 * ========================================
 * GOOGLE APPS SCRIPT - CUSTOMERS MODULE
 * ========================================
 * Manajemen data customers (blok & nama untuk QR)
 * 
 * SHEET STRUCTURE "Customers":
 * A: Customer ID (CUST-001, CUST-002, ...)
 * B: Blok/ID Number
 * C: Nama Lengkap
 * D: QR Hash (10 karakter untuk scan)
 * E: Tanggal Dibuat
 * F: Total Setoran (calculated)
 * G: Last Transaction (timestamp)
 */

/**
 * Generate QR Hash (10 karakter)
 * Format: Hash dari "Jimpitan" + Customer ID
 */
function generateQRHash(customerId) {
  var saltedString = 'Jimpitan' + customerId;
  var rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    saltedString,
    Utilities.Charset.UTF_8
  );
  
  // Convert to hex and take first 10 characters
  var hash = '';
  for (var i = 0; i < 5; i++) { // 5 bytes = 10 hex chars
    var byte = rawHash[i];
    if (byte < 0) byte += 256;
    var hex = byte.toString(16);
    if (hex.length === 1) hex = '0' + hex;
    hash += hex;
  }
  return hash.toUpperCase();
}

/**
 * Generate Customer ID
 */
function generateCustomerId(customersSheet) {
  var data = customersSheet.getDataRange().getValues();
  var maxNum = 0;
  
  for (var i = 1; i < data.length; i++) {
    var id = data[i][0];
    if (id && typeof id === 'string' && id.startsWith('CUST-')) {
      var num = parseInt(id.substring(5));
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  
  var newNum = maxNum + 1;
  return 'CUST-' + String(newNum).padStart(3, '0');
}

/**
 * Get all customers
 * Params: token (optional untuk admin check)
 */
function handleGetCustomers(params) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var customersSheet = ss.getSheetByName('Customers');
    
    if (!customersSheet) {
      return {
        status: 'error',
        message: 'Sheet "Customers" tidak ditemukan. Silakan buat sheet dengan nama "Customers"'
      };
    }
    
    var data = customersSheet.getDataRange().getValues();
    var customers = [];
    
    // Skip header row
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[0]) continue; // Skip empty rows
      
      customers.push({
        id: row[0],
        blok: row[1],
        nama: row[2],
        qrHash: row[3],
        createdAt: row[4] || '',
        totalSetoran: row[5] || 0,
        lastTransaction: row[6] || null
      });
    }
    
    return {
      status: 'success',
      data: customers
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat get customers: ' + error.toString()
    };
  }
}

/**
 * Get customer by QR Hash
 * Params: qrHash
 */
function handleGetCustomerByQRHash(params) {
  try {
    var qrHash = params.qrHash || '';
    
    if (!qrHash) {
      return {
        status: 'error',
        message: 'QR Hash tidak boleh kosong'
      };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var customersSheet = ss.getSheetByName('Customers');
    
    if (!customersSheet) {
      return {
        status: 'error',
        message: 'Sheet "Customers" tidak ditemukan'
      };
    }
    
    var data = customersSheet.getDataRange().getValues();
    
    // Find customer by QR Hash
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row[3] === qrHash) {
        return {
          status: 'success',
          data: {
            id: row[0],
            blok: row[1],
            nama: row[2],
            qrHash: row[3],
            createdAt: row[4] || '',
            totalSetoran: row[5] || 0,
            lastTransaction: row[6] || null
          }
        };
      }
    }
    
    return {
      status: 'error',
      message: 'Customer dengan QR Hash tersebut tidak ditemukan'
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat get customer: ' + error.toString()
    };
  }
}

/**
 * Get customer transaction history
 * Params: customerId
 */
function handleGetCustomerHistory(params) {
  try {
    var customerId = params.customerId || '';
    
    if (!customerId) {
      return {
        status: 'error',
        message: 'Customer ID tidak boleh kosong'
      };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var jimpitanSheet = ss.getSheetByName('Jimpitan');
    var customersSheet = ss.getSheetByName('Customers');
    
    if (!jimpitanSheet || !customersSheet) {
      return {
        status: 'error',
        message: 'Sheet tidak ditemukan'
      };
    }
    
    // Get customer data
    var customersData = customersSheet.getDataRange().getValues();
    var customer = null;
    var customerBlok = '';
    var customerNama = '';
    
    for (var i = 1; i < customersData.length; i++) {
      if (customersData[i][0] === customerId) {
        customer = {
          id: customersData[i][0],
          blok: customersData[i][1],
          nama: customersData[i][2],
          qrHash: customersData[i][3]
        };
        customerBlok = customersData[i][1];
        customerNama = customersData[i][2];
        break;
      }
    }
    
    if (!customer) {
      return {
        status: 'error',
        message: 'Customer tidak ditemukan'
      };
    }
    
    // Get transactions for this customer (by blok AND nama)
    var jimpitanData = jimpitanSheet.getDataRange().getValues();
    var transactions = [];
    var totalSetoran = 0;
    
    // Pastikan customerBlok dan customerNama tidak kosong
    if (!customerBlok || !customerNama) {
      return {
        status: 'success',
        data: {
          customer: customer,
          transactions: [],
          totalSetoran: 0,
          totalTransactions: 0
        }
      };
    }
    
    for (var j = 1; j < jimpitanData.length; j++) {
      var row = jimpitanData[j];
      // Match berdasarkan BLOK (Column B) DAN NAMA (Column C)
      var rowBlok = String(row[1]).trim();
      var rowNama = String(row[2]).trim().toLowerCase();
      
      if (row[1] && row[2] && 
          rowBlok === String(customerBlok).trim() && 
          rowNama === String(customerNama).trim().toLowerCase()) {
        var nominal = parseFloat(row[3]) || 0;
        totalSetoran += nominal;
        
        transactions.push({
          timestamp: row[0] || '',
          id: row[1] || '',
          nama: row[2] || '',
          nominal: nominal,
          petugas: row[4] || '',
          waktu: row[5] || '',
          username: row[6] || ''
        });
      }
    }
    
    return {
      status: 'success',
      data: {
        customer: customer,
        transactions: transactions,
        totalSetoran: totalSetoran,
        totalTransactions: transactions.length
      }
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat get customer history: ' + error.toString()
    };
  }
}

/**
 * Create new customer (Admin only)
 * Params: token, blok, nama
 */
function handleCreateCustomer(params) {
  try {
    var token = params.token || '';
    var adminCheck = verifyAdminToken(token);
    
    if (!adminCheck.isValid) {
      return {
        status: 'error',
        message: adminCheck.message
      };
    }
    
    var blok = params.blok || '';
    var nama = params.nama || '';
    
    if (!blok || !nama) {
      return {
        status: 'error',
        message: 'Blok dan nama harus diisi'
      };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var customersSheet = ss.getSheetByName('Customers');
    
    if (!customersSheet) {
      return {
        status: 'error',
        message: 'Sheet "Customers" tidak ditemukan'
      };
    }
    
    // Check if nama AND blok both already exist together
    var data = customersSheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      var existingNama = String(data[i][2]).toLowerCase();
      var existingBlok = String(data[i][1]);
      
      // Only error if BOTH nama and blok match the same record
      if (existingNama === String(nama).toLowerCase() && existingBlok === String(blok)) {
        return {
          status: 'error',
          message: 'Customer dengan Nama dan Blok yang sama sudah terdaftar'
        };
      }
    }
    
    // Generate IDs
    var customerId = generateCustomerId(customersSheet);
    var qrHash = generateQRHash(customerId);
    var createdAt = getCurrentTimestamp();
    
    // Add customer
    customersSheet.appendRow([
      customerId,   // A: Customer ID
      blok,         // B: Blok/ID Number
      nama,         // C: Nama
      qrHash,       // D: QR Hash
      createdAt,    // E: Created At
      0,            // F: Total Setoran
      ''            // G: Last Transaction
    ]);
    
    return {
      status: 'success',
      message: 'Customer berhasil ditambahkan',
      data: {
        id: customerId,
        blok: blok,
        nama: nama,
        qrHash: qrHash,
        createdAt: createdAt
      }
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat create customer: ' + error.toString()
    };
  }
}

/**
 * Update customer (Admin only)
 * Params: token, customerId, blok, nama
 */
function handleUpdateCustomer(params) {
  try {
    var token = params.token || '';
    var adminCheck = verifyAdminToken(token);
    
    if (!adminCheck.isValid) {
      return {
        status: 'error',
        message: adminCheck.message
      };
    }
    
    var customerId = params.customerId || '';
    var blok = params.blok || '';
    var nama = params.nama || '';
    
    if (!customerId || !blok || !nama) {
      return {
        status: 'error',
        message: 'Customer ID, blok, dan nama harus diisi'
      };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var customersSheet = ss.getSheetByName('Customers');
    var data = customersSheet.getDataRange().getValues();
    
    // Find customer
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === customerId) {
        // Check if nama AND blok both conflict with same other customer
        for (var j = 1; j < data.length; j++) {
          if (j !== i) {
            var existingNama = String(data[j][2]).toLowerCase();
            var existingBlok = String(data[j][1]);
            
            // Only error if BOTH nama and blok match the same other customer
            if (existingNama === String(nama).toLowerCase() && existingBlok === String(blok)) {
              return {
                status: 'error',
                message: 'Customer dengan Nama dan Blok yang sama sudah ada'
              };
            }
          }
        }
        
        // Update customer
        customersSheet.getRange(i + 1, 2).setValue(blok);  // B: Blok
        customersSheet.getRange(i + 1, 3).setValue(nama);  // C: Nama
        
        return {
          status: 'success',
          message: 'Customer berhasil diupdate',
          data: {
            id: customerId,
            blok: blok,
            nama: nama,
            qrHash: data[i][3]
          }
        };
      }
    }
    
    return {
      status: 'error',
      message: 'Customer tidak ditemukan'
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat update customer: ' + error.toString()
    };
  }
}

/**
 * Delete customer (Admin only)
 * Params: token, customerId
 */
function handleDeleteCustomer(params) {
  try {
    var token = params.token || '';
    var adminCheck = verifyAdminToken(token);
    
    if (!adminCheck.isValid) {
      return {
        status: 'error',
        message: adminCheck.message
      };
    }
    
    var customerId = params.customerId || '';
    
    if (!customerId) {
      return {
        status: 'error',
        message: 'Customer ID harus diisi'
      };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var customersSheet = ss.getSheetByName('Customers');
    var data = customersSheet.getDataRange().getValues();
    
    // Find and delete customer
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === customerId) {
        customersSheet.deleteRow(i + 1);
        return {
          status: 'success',
          message: 'Customer berhasil dihapus'
        };
      }
    }
    
    return {
      status: 'error',
      message: 'Customer tidak ditemukan'
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat delete customer: ' + error.toString()
    };
  }
}

/**
 * Import customers in bulk (Admin only)
 * Params: token, customers (array of {blok, nama})
 */
function handleImportCustomers(params) {
  try {
    var token = params.token || '';
    var adminCheck = verifyAdminToken(token);
    
    if (!adminCheck.isValid) {
      return {
        status: 'error',
        message: adminCheck.message
      };
    }
    
    var customers = params.customers || [];
    
    if (!Array.isArray(customers) || customers.length === 0) {
      return {
        status: 'error',
        message: 'Data customer tidak valid atau kosong'
      };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var customersSheet = ss.getSheetByName('Customers');
    
    if (!customersSheet) {
      return {
        status: 'error',
        message: 'Sheet "Customers" tidak ditemukan'
      };
    }
    
    var existingData = customersSheet.getDataRange().getValues();
    var importedCount = 0;
    var skippedCount = 0;
    var duplicateEntries = [];
    
    // Track existing entries for deduplication
    var existingEntries = {};
    for (var i = 1; i < existingData.length; i++) {
      var nama = String(existingData[i][2] || '').toLowerCase().trim();
      var blok = String(existingData[i][1] || '').trim();
      var key = blok + '|' + nama;
      existingEntries[key] = true;
    }
    
    // Import each customer
    for (var j = 0; j < customers.length; j++) {
      var customer = customers[j];
      var blok = String(customer.blok || '').trim();
      var nama = String(customer.nama || '').toLowerCase().trim();
      
      if (!blok || !nama) {
        skippedCount++;
        continue;
      }
      
      var key = blok + '|' + nama;
      
      // Check if customer already exists
      if (existingEntries[key]) {
        skippedCount++;
        duplicateEntries.push(blok + ' - ' + customer.nama);
        continue;
      }
      
      // Generate new Customer ID
      var customerId = generateCustomerId(customersSheet);
      
      // Generate QR Hash
      var qrHash = generateQRHash(customerId);
      
      // Add new row
      var newRow = [
        customerId,           // A: Customer ID
        blok,                 // B: Blok/ID Number
        customer.nama,        // C: Nama Lengkap
        qrHash,               // D: QR Hash
        new Date(),           // E: Tanggal Dibuat
        0,                    // F: Total Setoran
        ''                    // G: Last Transaction
      ];
      
      customersSheet.appendRow(newRow);
      importedCount++;
      
      // Mark as added to prevent duplicates within batch
      existingEntries[key] = true;
    }
    
    return {
      status: 'success',
      message: 'Import berhasil',
      data: {
        imported: importedCount,
        skipped: skippedCount,
        duplicates: duplicateEntries
      }
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat import customer: ' + error.toString()
    };
  }
}

/**
 * Get user transactions (Petugas only - their own transactions)
 * Params: token
 */
function handleGetUserTransactions(params) {
  try {
    var token = params.token || '';
    
    if (!token) {
      return {
        status: 'error',
        message: 'Token tidak ditemukan'
      };
    }
    
    // Verify token and get user info
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var usersSheet = ss.getSheetByName('Users');
    
    if (!usersSheet) {
      return {
        status: 'error',
        message: 'Sheet Users tidak ditemukan'
      };
    }
    
    var usersData = usersSheet.getDataRange().getValues();
    var currentUser = null;
    
    // Find user by token
    for (var i = 1; i < usersData.length; i++) {
      var row = usersData[i];
      var dbToken = row[5]; // Column F
      
      if (dbToken === token) {
        var tokenExpiry = row[6]; // Column G
        
        if (!isTokenValid(tokenExpiry)) {
          return {
            status: 'error',
            message: 'Token sudah expired'
          };
        }
        
        currentUser = {
          id: row[0],
          name: row[1],
          username: row[2],
          role: row[3]
        };
        break;
      }
    }
    
    if (!currentUser) {
      return {
        status: 'error',
        message: 'Token tidak valid'
      };
    }
    
    // Get transactions
    var jimpitanSheet = ss.getSheetByName('Jimpitan');
    
    if (!jimpitanSheet) {
      return {
        status: 'error',
        message: 'Sheet Jimpitan tidak ditemukan'
      };
    }
    
    var jimpitanData = jimpitanSheet.getDataRange().getValues();
    var transactions = [];
    
    // Get transactions for this user (all roles - only their own transactions)
    // Sheet structure: A=TXID | B=Timestamp | C=Customer ID | D=Blok/ID | E=Nama | F=Nominal | G=user_id | H=petugas
    for (var j = 1; j < jimpitanData.length; j++) {
      var row = jimpitanData[j];
      var rowUserId = String(row[6] || '').trim(); // Column G (index 6) - User ID
      
      // Only show transactions that belong to this user (match by user_id)
      if (rowUserId !== String(currentUser.id)) {
        continue;
      }
      
      if (row[0]) { // Has TXID
        transactions.push({
          rowIndex: j + 1, // Store row index for deletion
          txid: row[0] || '',           // A: TXID
          timestamp: row[1] || '',       // B: Timestamp
          customer_id: row[2] || '',     // C: Customer ID
          blok: row[3] || '',            // D: Blok/ID
          nama: row[4] || '',            // E: Nama
          nominal: parseFloat(row[5]) || 0,  // F: Nominal
          user_id: row[6] || '',         // G: user_id
          petugas: row[7] || ''          // H: petugas
        });
      }
    }
    
    // Sort by TXID descending (newest first)
    transactions.sort(function(a, b) {
      var txidA = String(a.txid || '');
      var txidB = String(b.txid || '');
      return txidB.localeCompare(txidA);
    });
    
    return {
      status: 'success',
      data: {
        user: currentUser,
        transactions: transactions,
        total: transactions.length
      }
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat get user transactions: ' + error.toString()
    };
  }
}

/**
 * Delete transaction (User can delete their own transaction)
 * Params: token, txid
 */
function handleDeleteTransaction(params) {
  try {
    var token = params.token || '';
    var txid = params.txid || '';
    
    if (!token) {
      return {
        status: 'error',
        message: 'Token tidak ditemukan'
      };
    }
    
    if (!txid) {
      return {
        status: 'error',
        message: 'TXID tidak ditemukan'
      };
    }
    
    // Verify token and get user info
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var usersSheet = ss.getSheetByName('Users');
    
    if (!usersSheet) {
      return {
        status: 'error',
        message: 'Sheet Users tidak ditemukan'
      };
    }
    
    var usersData = usersSheet.getDataRange().getValues();
    var currentUser = null;
    
    // Find user by token
    for (var i = 1; i < usersData.length; i++) {
      var row = usersData[i];
      var dbToken = row[5]; // Column F
      
      if (dbToken === token) {
        var tokenExpiry = row[6]; // Column G
        
        if (!isTokenValid(tokenExpiry)) {
          return {
            status: 'error',
            message: 'Token sudah expired'
          };
        }
        
        currentUser = {
          id: row[0],
          name: row[1],
          username: row[2],
          role: row[3]
        };
        break;
      }
    }
    
    if (!currentUser) {
      return {
        status: 'error',
        message: 'Token tidak valid'
      };
    }
    
    // Find and delete transaction
    var jimpitanSheet = ss.getSheetByName('Jimpitan');
    
    if (!jimpitanSheet) {
      return {
        status: 'error',
        message: 'Sheet Jimpitan tidak ditemukan'
      };
    }
    
    var jimpitanData = jimpitanSheet.getDataRange().getValues();
    
    for (var j = 1; j < jimpitanData.length; j++) {
      var row = jimpitanData[j];
      var rowTxid = row[0];
      var rowUserId = row[6];
      
      // Match by TXID
      if (String(rowTxid) === String(txid)) {
        // Petugas can only delete their own transactions
        // Admin can delete any transaction
        if (currentUser.role === 'petugas' && rowUserId !== currentUser.id) {
          return {
            status: 'error',
            message: 'Anda hanya bisa menghapus transaksi Anda sendiri'
          };
        }
        
        // Store transaction data before deleting
        var deletedCustomerId = row[2]; // Column C: customer_id
        var deletedNominal = parseFloat(row[5]) || 0; // Column F: nominal
        
        // Delete the row
        jimpitanSheet.deleteRow(j + 1);
        
        // Update customer stats if customer_id exists (subtract the deleted amount)
        if (deletedCustomerId) {
          updateCustomerStats(deletedCustomerId, -deletedNominal, '');
        }
        
        return {
          status: 'success',
          message: 'Transaksi berhasil dihapus'
        };
      }
    }
    
    return {
      status: 'error',
      message: 'Transaksi tidak ditemukan'
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat delete transaction: ' + error.toString()
    };
  }
}

/**
 * Update customer stats - Simple increment
 * Called after transaction
 * @param {string} customer_id - Customer ID (CUST-xxx)
 * @param {number} nominal - Amount to add (negative to subtract)
 * @param {string} timestamp - Transaction timestamp
 */
function updateCustomerStats(customer_id, nominal, timestamp) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var customersSheet = ss.getSheetByName('Customers');
    
    if (!customersSheet) {
      Logger.log('⚠️ Customers sheet not found');
      return;
    }
    
    var customersData = customersSheet.getDataRange().getValues();
    var normalizedCustomerId = String(customer_id || '').trim();
    
    Logger.log('📊 Updating stats for customer_id: "' + normalizedCustomerId + '"');
    Logger.log('   Adding: Rp ' + nominal);
    
    // Find customer by Customer ID (column A)
    for (var i = 1; i < customersData.length; i++) {
      var customerIdInSheet = String(customersData[i][0] || '').trim();
      
      if (customerIdInSheet === normalizedCustomerId) {
        Logger.log('✅ Found customer at row ' + (i + 1) + ': ' + customersData[i][2]);
        
        // Get current total and add nominal
        var currentTotal = parseFloat(customersData[i][5]) || 0; // Column F
        var newTotal = currentTotal + parseFloat(nominal);
        
        Logger.log('   Current total: Rp ' + currentTotal);
        Logger.log('   New total: Rp ' + newTotal);
        
        // Update customer stats
        var totalCell = customersSheet.getRange(i + 1, 6); // F: Total Setoran
        totalCell.setValue(newTotal);
        totalCell.setNumberFormat('"Rp" #,##0'); // Plain number format
        
        customersSheet.getRange(i + 1, 7).setValue(timestamp || ''); // G: Last Transaction
        
        SpreadsheetApp.flush();
        
        Logger.log('✅ Customer stats updated successfully');
        return;
      }
    }
    
    Logger.log('⚠️ Customer not found: ' + normalizedCustomerId);
    
  } catch(error) {
    Logger.log('Error updating customer stats: ' + error.toString());
  }
}
