/**
 * ========================================
 * USER CRUD FUNCTIONS (Admin Only) - FIXED VERSION
 * ========================================
 * Struktur Spreadsheet:
 * A: ID, B: Name, C: Role, D: Username, E: Password, F: Token, G: Token Expiry, H: Last Login
 */

/**
 * Verify admin token - FIXED
 * @param {string} token - Session token
 * @return {object} {isValid, message, userId}
 */
function verifyAdminToken(token) {
  if (!token) {
    return {isValid: false, message: 'Token tidak ditemukan'};
  }
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Users');
  
  if (!sheet) {
    return {isValid: false, message: 'Sheet Users tidak ditemukan'};
  }
  
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var dbToken = row[5]; // Column F: token
    
    if (dbToken === token) {
      var tokenExpiry = row[6]; // Column G: token_expiry
      var role = row[2];         // Column C: role ✅ FIXED
      var userId = row[0];       // Column A: user_id
      
      if (!isTokenValid(tokenExpiry)) {
        return {isValid: false, message: 'Token sudah expired'};
      }
      
      if (role !== 'admin') {
        return {isValid: false, message: 'Hanya admin yang bisa melakukan operasi ini'};
      }
      
      return {isValid: true, userId: userId, message: 'Token valid'};
    }
  }
  
  return {isValid: false, message: 'Token tidak valid'};
}

/**
 * Create new user (Admin only) - FIXED
 * @param {object} params - {token, name, username, password, role}
 * @return {object} Response dengan data user baru
 */
function handleCreateUser(params) {
  try {
    var token = params.token;
    
    // Verify admin
    var verification = verifyAdminToken(token);
    if (!verification.isValid) {
      return {
        status: 'error',
        message: verification.message
      };
    }
    
    var username = params.username;
    var password = params.password;
    var name = params.name;
    var role = params.role;
    
    if (!username || !password || !name || !role) {
      return {
        status: 'error',
        message: 'Username, password, name, dan role harus diisi'
      };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Users');
    
    if (!sheet) {
      return {
        status: 'error',
        message: 'Sheet Users tidak ditemukan'
      };
    }
    
    var data = sheet.getDataRange().getValues();
    
    // Check username sudah ada - FIXED: cek di column D
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row[3] === username) { // Column D: username ✅ FIXED
        return {
          status: 'error',
          message: 'Username sudah digunakan'
        };
      }
    }
    
    // Generate user ID
    var userCount = data.length - 1; // Exclude header
    var userId = generateUserId(userCount);
    
    // Hash password
    var hashedPassword = hashPassword(password);
    
    // Append new user
    sheet.appendRow([
      userId,           // Column A: user_id
      name,             // Column B: name
      role,             // Column C: role
      username,         // Column D: username
      hashedPassword,   // Column E: password (hashed)
      '',               // Column F: token
      '',               // Column G: token_expiry
      ''                // Column H: last_login
    ]);
    
    return {
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        id: userId,
        name: name,
        role: role,
        username: username
      }
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat create user: ' + error.toString()
    };
  }
}

/**
 * Update user (Admin only) - FIXED
 * @param {object} params - {token, userId, name, username, password (optional), role}
 * @return {object} Response
 */
function handleUpdateUser(params) {
  try {
    var token = params.token;
    
    // Verify admin
    var verification = verifyAdminToken(token);
    if (!verification.isValid) {
      return {
        status: 'error',
        message: verification.message
      };
    }
    
    var userId = params.userId || '';
    var name = params.name || '';
    var username = params.username || '';
    var password = params.password || '';
    var role = params.role || '';
    
    if (!userId || !name || !username || !role) {
      return {
        status: 'error',
        message: 'User ID, nama, username, dan role harus diisi'
      };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var usersSheet = ss.getSheetByName('Users');
    var data = usersSheet.getDataRange().getValues();
    
    // Find user by ID (column A)
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        // Check if username already used by other user - FIXED: cek di column D
        for (var j = 1; j < data.length; j++) {
          if (j !== i && data[j][3] === username) { // Column D: username ✅ FIXED
            return {
              status: 'error',
              message: 'Username sudah digunakan oleh user lain'
            };
          }
        }
        
        // Update user data
        usersSheet.getRange(i + 1, 2).setValue(name);     // Column B: name
        usersSheet.getRange(i + 1, 3).setValue(role);     // Column C: role
        usersSheet.getRange(i + 1, 4).setValue(username); // Column D: username
        
        // Update password if provided
        if (password) {
          var passwordHash = hashPassword(password);
          usersSheet.getRange(i + 1, 5).setValue(passwordHash); // Column E: password
        }
        
        return {
          status: 'success',
          message: 'User berhasil diupdate',
          data: {
            id: userId,
            name: name,
            role: role,
            username: username
          }
        };
      }
    }
    
    return {
      status: 'error',
      message: 'User tidak ditemukan'
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat update user: ' + error.toString()
    };
  }
}

/**
 * Delete user (Admin only) - ALREADY CORRECT
 * Admin cannot delete themselves
 * @param {object} params - {token, userId}
 * @return {object} Response
 */
function handleDeleteUser(params) {
  try {
    var token = params.token;
    
    // Verify admin
    var verification = verifyAdminToken(token);
    if (!verification.isValid) {
      return {
        status: 'error',
        message: verification.message
      };
    }
    
    var userId = params.userId || '';
    
    if (!userId) {
      return {
        status: 'error',
        message: 'User ID harus diisi'
      };
    }
    
    // Check if admin trying to delete themselves
    if (verification.userId === userId) {
      return {
        status: 'error',
        message: 'Anda tidak dapat menghapus akun Anda sendiri'
      };
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var usersSheet = ss.getSheetByName('Users');
    var data = usersSheet.getDataRange().getValues();
    
    // Find and delete user by ID (column A)
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        usersSheet.deleteRow(i + 1);
        return {
          status: 'success',
          message: 'User berhasil dihapus'
        };
      }
    }
    
    return {
      status: 'error',
      message: 'User tidak ditemukan'
    };
    
  } catch(error) {
    return {
      status: 'error',
      message: 'Error saat delete user: ' + error.toString()
    };
  }
}
