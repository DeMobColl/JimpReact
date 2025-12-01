/**
 * ========================================
 * MOBILE AUTHENTICATION FUNCTIONS
 * ========================================
 * Autentikasi khusus untuk mobile app dengan token terpisah
 * Token mobile disimpan di kolom I (Token Mobile) dan J (Token Mobile Expiry)
 */

/**
 * Handle mobile login (only for petugas role)
 * @param {object} params - {username, password}
 * @return {object} Response dengan mobile token
 */
function handleMobileLogin(params) {
  try {
    var username = params.username || '';
    var password = params.password || '';
    
    if (!username || !password) {
      return {
        status: 'error',
        message: 'Username dan password harus diisi'
      };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var usersSheet = ss.getSheetByName('Users');
    
    if (!usersSheet) {
      return {
        status: 'error',
        message: 'Sheet "Users" tidak ditemukan'
      };
    }
    
    var data = usersSheet.getDataRange().getValues();
    
    // Skip header row
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var userId = row[0];
      var name = row[1];
      var role = row[2];
      var dbUsername = row[3];
      var dbPasswordHash = row[4];
      
      // Mobile login only for petugas role
      if (dbUsername === username && verifyPassword(password, dbPasswordHash)) {
        if (role !== 'petugas') {
          return {
            status: 'error',
            message: 'Mobile app hanya dapat diakses oleh petugas'
          };
        }
        
        // Generate mobile token (7 days validity)
        var mobileToken = generateToken();
        var now = new Date();
        var expiry = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
        var expiryISO = expiry.toISOString();
        var loginISO = now.toISOString();
        
        // Update sheet - Column I: Token Mobile (index 9), Column J: Token Mobile Expiry (index 10)
        usersSheet.getRange(i + 1, 9).setValue(mobileToken);     // Column I (index 9)
        usersSheet.getRange(i + 1, 10).setValue(expiryISO);      // Column J (index 10)
        usersSheet.getRange(i + 1, 8).setValue(loginISO);        // Column H: Last Login
        
        return {
          status: 'success',
          message: 'Login mobile berhasil',
          data: {
            id: userId,
            name: name,
            role: role,
            username: dbUsername,
            mobileToken: mobileToken,
            tokenExpiry: expiryISO,
            lastLogin: loginISO
          }
        };
      }
    }
    
    return {
      status: 'error',
      message: 'Username atau password salah'
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat login mobile: ' + error.toString()
    };
  }
}

/**
 * Verify mobile token validity
 * @param {string} mobileToken - Mobile token to verify
 * @return {object} {isValid, message, user}
 */
function verifyMobileToken(mobileToken) {
  try {
    if (!mobileToken) {
      return {
        isValid: false,
        message: 'Mobile token tidak ditemukan'
      };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var usersSheet = ss.getSheetByName('Users');
    
    if (!usersSheet) {
      return {
        isValid: false,
        message: 'Sheet "Users" tidak ditemukan'
      };
    }
    
    var data = usersSheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var dbMobileToken = row[8];      // Column I: Token Mobile
      var tokenExpiry = row[9];         // Column J: Token Mobile Expiry
      
      if (dbMobileToken === mobileToken) {
        if (!isTokenValid(tokenExpiry)) {
          return {
            isValid: false,
            message: 'Mobile token sudah kadaluarsa'
          };
        }
        
        // Only petugas can use mobile token
        var role = row[2];
        if (role !== 'petugas') {
          return {
            isValid: false,
            message: 'Mobile token hanya valid untuk petugas'
          };
        }
        
        return {
          isValid: true,
          message: 'Mobile token valid',
          user: {
            id: row[0],
            name: row[1],
            role: role,
            username: row[3],
            mobileToken: mobileToken,
            tokenExpiry: tokenExpiry
          }
        };
      }
    }
    
    return {
      isValid: false,
      message: 'Mobile token tidak valid'
    };
    
  } catch(error) {
    return {
      isValid: false,
      message: 'Error saat verify mobile token: ' + error.toString()
    };
  }
}

/**
 * Handle mobile logout - clear mobile token
 * @param {object} params - {mobileToken}
 * @return {object} Response
 */
function handleMobileLogout(params) {
  try {
    var mobileToken = params.mobileToken || '';
    
    if (!mobileToken) {
      return {
        status: 'success',
        message: 'Logout berhasil'
      };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var usersSheet = ss.getSheetByName('Users');
    
    if (!usersSheet) {
      return {
        status: 'success',
        message: 'Logout berhasil'
      };
    }
    
    var data = usersSheet.getDataRange().getValues();
    
    // Find and clear mobile token
    for (var i = 1; i < data.length; i++) {
      var dbMobileToken = data[i][8]; // Column I
      
      if (dbMobileToken === mobileToken) {
        usersSheet.getRange(i + 1, 9).setValue('');  // Clear Column I
        usersSheet.getRange(i + 1, 10).setValue(''); // Clear Column J
        break;
      }
    }
    
    return {
      status: 'success',
      message: 'Logout mobile berhasil'
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat logout mobile: ' + error.toString()
    };
  }
}

/**
 * Verify mobile token for request (helper function)
 * @param {object} params - Request params with mobileToken
 * @return {object} Verification result with user data
 */
function verifyMobileTokenFromParams(params) {
  var mobileToken = params.mobileToken || '';
  return verifyMobileToken(mobileToken);
}
