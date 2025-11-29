/**
 * Config Management Functions
 * Handle system configuration and config password authentication
 * 
 * NOTE: Function hashPassword() sudah ada di utils.js
 * Pastikan utils.js di-include di Apps Script project
 */

/**
 * Get all system configurations
 * @param {Object} params - Request parameters
 * @param {string} params.token - Admin authentication token
 * @returns {Object} Response with config data
 */
function handleGetConfig(params) {
  try {
    // Verify token - only admin can access
    const tokenCheck = verifyAdminToken(params.token);
    if (!tokenCheck.isValid) {
      return { status: 'error', message: tokenCheck.message };
    }

    const configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config');
    if (!configSheet) {
      return { status: 'error', message: 'Config sheet not found' };
    }

    const data = configSheet.getDataRange().getValues();
    const config = {};
    
    // Skip header row (row 0)
    for (let i = 1; i < data.length; i++) {
      const key = data[i][0];
      const value = data[i][1];
      
      // Convert string 'TRUE'/'FALSE' to boolean
      if (value === 'TRUE' || value === true) {
        config[key] = true;
      } else if (value === 'FALSE' || value === false) {
        config[key] = false;
      } else {
        config[key] = value;
      }
    }

    return { status: 'success', data: config };
  } catch (error) {
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Update a specific configuration value
 * @param {Object} params - Request parameters
 * @param {string} params.token - Admin authentication token
 * @param {string} params.key - Config key to update
 * @param {*} params.value - New value for the config
 * @returns {Object} Response status
 */
function handleUpdateConfig(params) {
  try {
    // Verify token - only admin can access
    const tokenCheck = verifyAdminToken(params.token);
    if (!tokenCheck.isValid) {
      return { status: 'error', message: tokenCheck.message };
    }

    const key = params.key;
    const value = params.value;
    
    const configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config');
    if (!configSheet) {
      return { status: 'error', message: 'Config sheet not found' };
    }

    const data = configSheet.getDataRange().getValues();
    let rowIndex = -1;
    
    // Find the config key (skip header row)
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        rowIndex = i + 1; // +1 because getRange is 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      return { status: 'error', message: 'Config key not found: ' + key };
    }

    // Convert boolean to string for storage
    const valueToStore = value === true ? 'TRUE' : value === false ? 'FALSE' : value;
    
    // Update value (Column B) and timestamp (Column D)
    configSheet.getRange(rowIndex, 2).setValue(valueToStore);
    configSheet.getRange(rowIndex, 4).setValue(new Date());

    return { status: 'success', message: 'Config updated successfully' };
  } catch (error) {
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Verify config password
 * @param {Object} params - Request parameters
 * @param {string} params.token - Admin authentication token
 * @param {string} params.password - Password to verify (plain text)
 * @returns {Object} Response status
 */
function handleVerifyConfigPassword(params) {
  try {
    // Debug logging
    Logger.log('=== VERIFY CONFIG PASSWORD DEBUG ===');
    Logger.log('Params received: ' + JSON.stringify(params));
    
    // Verify token - only admin can access
    const tokenCheck = verifyAdminToken(params.token);
    if (!tokenCheck.isValid) {
      Logger.log('Token check failed: ' + tokenCheck.message);
      return { status: 'error', message: tokenCheck.message };
    }
    Logger.log('Token valid for user: ' + tokenCheck.userId);

    const password = params.password;
    Logger.log('Password received: ' + password);
    Logger.log('Password length: ' + (password ? password.length : 0));
    
    const configAuthSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ConfigAuth');
    if (!configAuthSheet) {
      Logger.log('ConfigAuth sheet not found!');
      return { status: 'error', message: 'ConfigAuth sheet not found' };
    }

    // Get stored hashed password from Row 2, Column A
    const storedHashedPassword = configAuthSheet.getRange(2, 1).getValue();
    Logger.log('Stored hash: ' + storedHashedPassword);
    Logger.log('Stored hash length: ' + storedHashedPassword.length);
    
    // Hash the input password and compare
    const hashedPassword = hashPassword(password);
    Logger.log('Input hash: ' + hashedPassword);
    Logger.log('Input hash length: ' + hashedPassword.length);
    Logger.log('Hashes match: ' + (hashedPassword === storedHashedPassword));
    
    if (hashedPassword === storedHashedPassword) {
      Logger.log('✅ Password verified successfully');
      return { status: 'success', message: 'Password verified' };
    } else {
      Logger.log('❌ Password mismatch');
      return { status: 'error', message: 'Password salah' };
    }
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Update config password
 * @param {Object} params - Request parameters
 * @param {string} params.token - Admin authentication token
 * @param {string} params.currentPassword - Current password (plain text)
 * @param {string} params.newPassword - New password (plain text)
 * @returns {Object} Response status
 */
function handleUpdateConfigPassword(params) {
  try {
    // Verify token - only admin can access
    const tokenCheck = verifyAdminToken(params.token);
    if (!tokenCheck.isValid) {
      return { status: 'error', message: tokenCheck.message };
    }

    const currentPassword = params.currentPassword;
    const newPassword = params.newPassword;
    
    const configAuthSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ConfigAuth');
    if (!configAuthSheet) {
      return { status: 'error', message: 'ConfigAuth sheet not found' };
    }

    // Get stored hashed password from Row 2, Column A
    const storedHashedPassword = configAuthSheet.getRange(2, 1).getValue();
    
    // Verify current password by hashing and comparing
    const hashedCurrentPassword = hashPassword(currentPassword);
    if (hashedCurrentPassword !== storedHashedPassword) {
      return { status: 'error', message: 'Password lama salah' };
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return { status: 'error', message: 'Password baru minimal 6 karakter' };
    }

    // Hash new password before storing
    const hashedNewPassword = hashPassword(newPassword);
    
    // Update to new hashed password (Row 2, Column A) and timestamp (Row 2, Column C)
    configAuthSheet.getRange(2, 1).setValue(hashedNewPassword);
    configAuthSheet.getRange(2, 3).setValue(new Date());

    return { status: 'success', message: 'Password updated successfully' };
  } catch (error) {
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Check if petugas web login is allowed
 * Helper function to be used in login flow
 * @returns {boolean} True if allowed, false if blocked
 */
function isPetugasWebLoginAllowed() {
  try {
    const configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config');
    if (!configSheet) {
      // If config sheet doesn't exist, allow by default
      return true;
    }

    const data = configSheet.getDataRange().getValues();
    
    // Search for allowPetugasWebLogin config
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === 'allowPetugasWebLogin') {
        const value = data[i][1];
        return value === 'TRUE' || value === true;
      }
    }
    
    // If config not found, allow by default
    return true;
  } catch (error) {
    // On error, allow by default
    return true;
  }
}

/**
 * HELPER: Setup initial config password (Run this once manually in Apps Script Editor)
 * This function will hash your password and save it to ConfigAuth sheet
 */
function setupConfigPassword() {
  var plainPassword = "qwerty123"; // GANTI dengan password yang diinginkan
  var hashedPassword = hashPassword(plainPassword);
  
  var configAuthSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ConfigAuth');
  if (!configAuthSheet) {
    Logger.log('ERROR: ConfigAuth sheet not found!');
    return;
  }
  
  // Save hashed password to Row 2, Column A
  configAuthSheet.getRange(2, 1).setValue(hashedPassword);
  configAuthSheet.getRange(2, 2).setValue(new Date()); // createdAt
  configAuthSheet.getRange(2, 3).setValue(new Date()); // updatedAt
  
  Logger.log('✅ Password setup complete!');
  Logger.log('Plain Password: ' + plainPassword);
  Logger.log('Hashed Password: ' + hashedPassword);
  Logger.log('Saved to ConfigAuth sheet Row 2, Column A');
}

/**
 * HELPER: Debug password verification (Run this in Apps Script Editor to test)
 * Use this to check if your password matches what's stored
 */
function debugConfigPassword() {
  var testPassword = "qwerty123"; // GANTI dengan password yang ingin di-test
  
  var configAuthSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ConfigAuth');
  if (!configAuthSheet) {
    Logger.log('ERROR: ConfigAuth sheet not found!');
    return;
  }
  
  var storedHash = configAuthSheet.getRange(2, 1).getValue();
  var testHash = hashPassword(testPassword);
  
  Logger.log('=== DEBUG CONFIG PASSWORD ===');
  Logger.log('Test Password (plain): ' + testPassword);
  Logger.log('Test Password (hashed): ' + testHash);
  Logger.log('Stored Hash in Sheet: ' + storedHash);
  Logger.log('Match: ' + (testHash === storedHash));
  Logger.log('Hash Length - Test: ' + testHash.length + ', Stored: ' + storedHash.length);
  
  if (testHash === storedHash) {
    Logger.log('✅ PASSWORD MATCHES!');
  } else {
    Logger.log('❌ PASSWORD DOES NOT MATCH!');
    Logger.log('Possible issues:');
    Logger.log('1. Password di sheet bukan hasil hash dari fungsi hashPassword()');
    Logger.log('2. Ada whitespace/karakter tersembunyi di stored hash');
    Logger.log('3. Test password tidak sama dengan yang di-setup');
    Logger.log('');
    Logger.log('SOLUTION: Run function setupConfigPassword() untuk reset password');
  }
}
