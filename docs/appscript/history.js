/**
 * ========================================
 * HISTORY DATA FUNCTIONS
 * ========================================
 * Get data transaksi jimpitan (read only)
 */

/**
 * Get history data from Jimpitan sheet
 * @return {object} Response dengan array data
 */
function getHistoryData() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Jimpitan');
    
    if (!sheet) {
      return {
        status: 'error',
        message: 'Sheet "Jimpitan" tidak ditemukan'
      };
    }
    
    var data = sheet.getDataRange().getValues();
    var result = [];
    
    // Skip header row
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      
      // Skip empty rows
      if (!row[0] && !row[1]) continue;
      
      // Sheet columns: A=TXID, B=Timestamp, C=Customer ID, D=Blok/ID, E=Nama, F=Nominal, G=user_id, H=petugas
      result.push({
        txid: row[0] || '',          // Transaction ID
        timestamp: row[1] || '',     // Server timestamp
        customer_id: row[2] || '',   // Customer ID (CUST-xxx)
        id: row[3] || '',            // Blok number
        nama: row[4] || '',          // Customer name
        nominal: row[5] || 0,        // Amount
        user_id: row[6] || '',       // Staff user ID
        petugas: row[7] || ''        // Staff name
      });
    }
    
    return {
      status: 'success',
      data: result
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: error.toString()
    };
  }
}


