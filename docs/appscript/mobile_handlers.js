/**
 * ========================================
 * MOBILE APP HANDLERS
 * ========================================
 * Handler khusus untuk mobile app (petugas only)
 * Semua endpoint menggunakan mobileToken untuk autentikasi
 */

/**
 * Mobile: Scan QR and get customer data
 * @param {object} params - {mobileToken, qrHash}
 * @return {object} Response dengan data customer
 */
function handleMobileScanQR(params) {
  try {
    // Verify mobile token
    var verification = verifyMobileTokenFromParams(params);
    if (!verification.isValid) {
      return {
        status: 'error',
        message: verification.message
      };
    }
    
    var qrHash = params.qrHash || '';
    
    if (!qrHash) {
      return {
        status: 'error',
        message: 'QR Hash tidak boleh kosong'
      };
    }
    
    // Reuse existing function from customers.js
    var result = handleGetCustomerByQRHash({qrHash: qrHash});
    
    // Add user info to response
    if (result.status === 'success') {
      result.user = {
        id: verification.user.id,
        name: verification.user.name
      };
    }
    
    return result;
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat scan QR: ' + error.toString()
    };
  }
}

/**
 * Mobile: Submit transaction
 * @param {object} params - {mobileToken, customer_id, id (blok), nama, nominal}
 * @return {object} Response
 */
function handleMobileSubmitTransaction(params) {
  try {
    // Verify mobile token
    var verification = verifyMobileTokenFromParams(params);
    if (!verification.isValid) {
      return {
        status: 'error',
        message: verification.message
      };
    }
    
    // Add user info from token verification
    params.user_id = verification.user.id;
    params.petugas = verification.user.name;
    
    // Validate required fields
    if (!params.customer_id || !params.id || !params.nama || !params.nominal) {
      return {
        status: 'error',
        message: 'Data tidak lengkap: customer_id, id (blok), nama, dan nominal harus diisi'
      };
    }
    
    if (params.nominal <= 0) {
      return {
        status: 'error',
        message: 'Nominal harus lebih dari 0'
      };
    }
    
    // Reuse existing function from submit.js
    var result = submitTransaction(params);
    
    // Add user info to response
    if (result.status === 'success') {
      result.data.petugas = verification.user.name;
      result.data.user_id = verification.user.id;
    }
    
    return result;
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat submit transaction: ' + error.toString()
    };
  }
}

/**
 * Mobile: Get user's own transaction history
 * @param {object} params - {mobileToken, limit (optional)}
 * @return {object} Response dengan transaction history
 */
function handleMobileGetHistory(params) {
  try {
    // Verify mobile token
    var verification = verifyMobileTokenFromParams(params);
    if (!verification.isValid) {
      return {
        status: 'error',
        message: verification.message
      };
    }
    
    var limit = parseInt(params.limit) || 100; // Default 100 records
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var jimpitanSheet = ss.getSheetByName('Jimpitan');
    
    if (!jimpitanSheet) {
      return {
        status: 'error',
        message: 'Sheet Jimpitan tidak ditemukan'
      };
    }
    
    var jimpitanData = jimpitanSheet.getDataRange().getValues();
    var transactions = [];
    var userId = verification.user.id;
    
    // Get transactions for this user only
    // Sheet structure: A=TXID | B=Timestamp | C=Customer ID | D=Blok/ID | E=Nama | F=Nominal | G=user_id | H=petugas
    for (var i = 1; i < jimpitanData.length; i++) {
      var row = jimpitanData[i];
      var rowUserId = String(row[6] || '').trim(); // Column G
      
      // Only show transactions that belong to this user
      if (rowUserId === String(userId)) {
        transactions.push({
          txid: row[0] || '',
          timestamp: row[1] || '',
          customer_id: row[2] || '',
          blok: row[3] || '',
          nama: row[4] || '',
          nominal: parseFloat(row[5]) || 0,
          user_id: row[6] || '',
          petugas: row[7] || ''
        });
      }
    }
    
    // Sort by timestamp descending (newest first)
    transactions.sort(function(a, b) {
      var timeA = new Date(a.timestamp).getTime();
      var timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
    
    // Limit results
    if (limit > 0 && transactions.length > limit) {
      transactions = transactions.slice(0, limit);
    }
    
    // Calculate summary
    var totalNominal = 0;
    for (var j = 0; j < transactions.length; j++) {
      totalNominal += transactions[j].nominal;
    }
    
    return {
      status: 'success',
      data: {
        user: {
          id: verification.user.id,
          name: verification.user.name
        },
        transactions: transactions,
        summary: {
          totalTransactions: transactions.length,
          totalNominal: totalNominal,
          limit: limit
        }
      }
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat get history: ' + error.toString()
    };
  }
}

/**
 * Mobile: Delete user's own transaction
 * @param {object} params - {mobileToken, txid}
 * @return {object} Response
 */
function handleMobileDeleteTransaction(params) {
  try {
    // Verify mobile token
    var verification = verifyMobileTokenFromParams(params);
    if (!verification.isValid) {
      return {
        status: 'error',
        message: verification.message
      };
    }
    
    var txid = params.txid || '';
    
    if (!txid) {
      return {
        status: 'error',
        message: 'TXID tidak ditemukan'
      };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var jimpitanSheet = ss.getSheetByName('Jimpitan');
    
    if (!jimpitanSheet) {
      return {
        status: 'error',
        message: 'Sheet Jimpitan tidak ditemukan'
      };
    }
    
    var jimpitanData = jimpitanSheet.getDataRange().getValues();
    var userId = verification.user.id;
    
    for (var i = 1; i < jimpitanData.length; i++) {
      var row = jimpitanData[i];
      var rowTxid = row[0];
      var rowUserId = row[6];
      
      // Match by TXID
      if (String(rowTxid) === String(txid)) {
        // Petugas can only delete their own transactions
        if (rowUserId !== userId) {
          return {
            status: 'error',
            message: 'Anda hanya bisa menghapus transaksi Anda sendiri'
          };
        }
        
        // Store transaction data before deleting
        var deletedCustomerId = row[2]; // Column C: customer_id
        var deletedNominal = parseFloat(row[5]) || 0; // Column F: nominal
        
        // Delete the row
        jimpitanSheet.deleteRow(i + 1);
        
        // Update customer stats if customer_id exists (subtract the deleted amount)
        if (deletedCustomerId) {
          updateCustomerStats(deletedCustomerId, -deletedNominal, '');
        }
        
        return {
          status: 'success',
          message: 'Transaksi berhasil dihapus',
          data: {
            txid: txid,
            deletedBy: verification.user.name
          }
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
 * Mobile: Get history summary (stats only)
 * @param {object} params - {mobileToken}
 * @return {object} Response dengan summary statistics
 */
function handleMobileGetSummary(params) {
  try {
    // Verify mobile token
    var verification = verifyMobileTokenFromParams(params);
    if (!verification.isValid) {
      return {
        status: 'error',
        message: verification.message
      };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var jimpitanSheet = ss.getSheetByName('Jimpitan');
    
    if (!jimpitanSheet) {
      return {
        status: 'error',
        message: 'Sheet Jimpitan tidak ditemukan'
      };
    }
    
    var jimpitanData = jimpitanSheet.getDataRange().getValues();
    var userId = verification.user.id;
    
    var totalTransactions = 0;
    var totalNominal = 0;
    var todayTransactions = 0;
    var todayNominal = 0;
    
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Count transactions and nominal
    for (var i = 1; i < jimpitanData.length; i++) {
      var row = jimpitanData[i];
      var rowUserId = String(row[6] || '').trim();
      
      if (rowUserId === String(userId)) {
        var nominal = parseFloat(row[5]) || 0;
        totalTransactions++;
        totalNominal += nominal;
        
        // Check if today
        var timestamp = new Date(row[1]);
        timestamp.setHours(0, 0, 0, 0);
        if (timestamp.getTime() === today.getTime()) {
          todayTransactions++;
          todayNominal += nominal;
        }
      }
    }
    
    return {
      status: 'success',
      data: {
        user: {
          id: verification.user.id,
          name: verification.user.name
        },
        summary: {
          totalTransactions: totalTransactions,
          totalNominal: totalNominal,
          todayTransactions: todayTransactions,
          todayNominal: todayNominal
        }
      }
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat get summary: ' + error.toString()
    };
  }
}
