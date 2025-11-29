/**
 * ========================================
 * AUTHENTICATION FUNCTIONS
 * ========================================
 * Login, Logout, Token verification
 */

/**
 * Handle login request
 * @param {object} params - {username, password}
 * @return {object} Response dengan token
 */
function handleLogin(params) {
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
      
      // Verify credentials
      if (dbUsername === username && verifyPassword(password, dbPasswordHash)) {
        // Generate token (7 days validity)
        if (role === 'petugas') {
          // Check if petugas web login is allowed
          if (!isPetugasWebLoginAllowed()) {
            return { 
              status: 'error', 
              message: 'Login petugas via web saat ini dinonaktifkan. Hubungi administrator.' 
            };
          }
        }
        var token = generateToken();
        var now = new Date();
        var expiry = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
        var expiryISO = expiry.toISOString();
        var loginISO = now.toISOString();
        
        // Update sheet
        usersSheet.getRange(i + 1, 6).setValue(token);
        usersSheet.getRange(i + 1, 7).setValue(expiryISO);
        usersSheet.getRange(i + 1, 8).setValue(loginISO);
        
        return {
          status: 'success',
          message: 'Login berhasil',
          data: {
            id: userId,
            name: name,
            role: role,
            username: dbUsername,
            token: token,
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
      message: 'Error saat login: ' + error.toString()
    };
  }
}

/**
 * Verify token validity
 * @param {object} params - {token}
 * @return {object} Response dengan user data
 */
function handleVerifyToken(params) {
  try {
    var token = params.token || '';
    
    if (!token) {
      return {
        status: 'error',
        message: 'Token tidak ditemukan'
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
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var dbToken = row[5];
      var tokenExpiry = row[6];
      
      if (dbToken === token) {
        if (isTokenValid(tokenExpiry)) {
          return {
            status: 'success',
            message: 'Token valid',
            data: {
              id: row[0],
              name: row[1],
              role: row[2],
              username: row[3],
              token: token,
              tokenExpiry: tokenExpiry
            }
          };
        } else {
          return {
            status: 'error',
            message: 'Token sudah kadaluarsa'
          };
        }
      }
    }
    
    return {
      status: 'error',
      message: 'Token tidak valid'
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat verify token: ' + error.toString()
    };
  }
}

/**
 * Handle logout - clear token
 * @param {object} params - {token}
 * @return {object} Response
 */
function handleLogout(params) {
  try {
    var token = params.token || '';
    
    if (!token) {
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
    
    // Find and clear token
    for (var i = 1; i < data.length; i++) {
      var dbToken = data[i][5];
      
      if (dbToken === token) {
        usersSheet.getRange(i + 1, 6).setValue('');
        usersSheet.getRange(i + 1, 7).setValue('');
        break;
      }
    }
    
    return {
      status: 'success',
      message: 'Logout berhasil'
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat logout: ' + error.toString()
    };
  }
}

/**
 * Get all users (Admin only)
 * @param {object} params - {token}
 * @return {object} Response dengan array users
 */
function handleGetUsers(params) {
  try {
    var token = params.token || '';
    
    if (!token) {
      return {
        status: 'error',
        message: 'Unauthorized'
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
    var users = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      users.push({
        id: row[0],
        name: row[1],
        role: row[2],
        username: row[3],
        lastLogin: row[7] || null
      });
    }
    
    return {
      status: 'success',
      data: users
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat get users: ' + error.toString()
    };
  }
}

/**
 * Get user activity log
 * @param {object} params - {token, role (optional)}
 * @return {object} Response dengan activity log
 */
function handleGetUserActivity(params) {
  try {
    var token = params.token || '';
    var roleFilter = params.role || '';
    
    if (!token) {
      return {
        status: 'error',
        message: 'Unauthorized'
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
    var activities = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var role = row[2];
      var lastLogin = row[7];
      
      if (roleFilter && role !== roleFilter) {
        continue;
      }
      
      if (lastLogin) {
        activities.push({
          id: row[0],
          name: row[1],
          role: role,
          username: row[3],
          lastLogin: lastLogin
        });
      }
    }
    
    return {
      status: 'success',
      data: activities
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat get user activity: ' + error.toString()
    };
  }
}
