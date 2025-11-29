/**
 * ========================================
 * PASSWORD MIGRATION UTILITIES
 * ========================================
 * Script untuk migrasi password dari plain text ke SHA-256 hash
 * 
 * CARA PAKAI:
 * 1. Copy semua kode di COMPLETE.js ke Apps Script
 * 2. Copy function migratePasswordsToHash dan testPasswordHash dari file ini
 * 3. Jalankan migratePasswordsToHash() dari Apps Script editor
 * 4. Cek hasilnya di sheet Users
 * 5. Test login dengan testPasswordHash()
 */

/**
 * Migrasi semua plain password ke hash
 * PERHATIAN: Function ini akan mengubah semua password yang belum di-hash
 * Pastikan backup sheet dulu sebelum menjalankan!
 */
function migratePasswordsToHash() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Users');
  
  if (!sheet) {
    Logger.log('ERROR: Sheet Users tidak ditemukan');
    return;
  }
  
  var data = sheet.getDataRange().getValues();
  var migratedCount = 0;
  var skippedCount = 0;
  
  Logger.log('=== Memulai Migrasi Password ===');
  Logger.log('Total users: ' + (data.length - 1));
  
  // Loop dari row 2 (skip header)
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var userId = row[0]; // Column A
    var username = row[1]; // Column B
    var password = row[2]; // Column C
    
    if (!password) {
      Logger.log('SKIP: User ' + username + ' tidak punya password');
      skippedCount++;
      continue;
    }
    
    // Cek apakah sudah hash (64 karakter hex)
    if (password.length === 64 && /^[a-f0-9]+$/i.test(password)) {
      Logger.log('SKIP: User ' + username + ' sudah di-hash');
      skippedCount++;
      continue;
    }
    
    // Hash plain password
    var hashedPassword = hashPassword(password);
    
    // Update di sheet
    sheet.getRange(i + 1, 3).setValue(hashedPassword); // Column C
    
    Logger.log('✅ MIGRATED: ' + username + ' (Plain: ' + password + ' → Hash: ' + hashedPassword.substring(0, 16) + '...)');
    migratedCount++;
  }
  
  Logger.log('\n=== Migrasi Selesai ===');
  Logger.log('Total di-migrate: ' + migratedCount);
  Logger.log('Total di-skip: ' + skippedCount);
  Logger.log('\nSilakan test login dengan function testPasswordHash()');
}

/**
 * Test password hash dengan sample user
 * Ganti username dan password sesuai dengan user di sheet
 */
function testPasswordHash() {
  var testUsername = 'admin'; // Ganti dengan username di sheet
  var testPassword = 'admin123'; // Ganti dengan password asli
  
  Logger.log('=== Testing Password Hash ===');
  Logger.log('Username: ' + testUsername);
  Logger.log('Password: ' + testPassword);
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Users');
  
  if (!sheet) {
    Logger.log('ERROR: Sheet Users tidak ditemukan');
    return;
  }
  
  var data = sheet.getDataRange().getValues();
  
  // Cari user
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var dbUsername = row[1]; // Column B
    var dbPassword = row[2]; // Column C
    
    if (dbUsername === testUsername) {
      Logger.log('\nUser ditemukan!');
      Logger.log('Password di database: ' + dbPassword.substring(0, 16) + '...');
      
      // Test verifikasi
      var isValid = verifyPassword(testPassword, dbPassword);
      
      if (isValid) {
        Logger.log('✅ Password COCOK!');
        Logger.log('Login akan berhasil dengan credentials ini');
      } else {
        Logger.log('❌ Password TIDAK COCOK!');
        Logger.log('Ada masalah dengan hashing atau password salah');
      }
      
      return;
    }
  }
  
  Logger.log('ERROR: User ' + testUsername + ' tidak ditemukan');
}

/**
 * Cek status migrasi password
 * Menampilkan berapa user yang sudah/belum di-hash
 */
function checkMigrationStatus() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Users');
  
  if (!sheet) {
    Logger.log('ERROR: Sheet Users tidak ditemukan');
    return;
  }
  
  var data = sheet.getDataRange().getValues();
  var hashedCount = 0;
  var plainCount = 0;
  
  Logger.log('=== Status Migrasi Password ===\n');
  
  // Loop dari row 2 (skip header)
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var username = row[1]; // Column B
    var password = row[2]; // Column C
    
    if (!password) {
      Logger.log('⚠️  ' + username + ': Tidak ada password');
      continue;
    }
    
    // Cek apakah sudah hash (64 karakter hex)
    if (password.length === 64 && /^[a-f0-9]+$/i.test(password)) {
      Logger.log('✅ ' + username + ': Sudah di-hash');
      hashedCount++;
    } else {
      Logger.log('❌ ' + username + ': Masih plain text');
      plainCount++;
    }
  }
  
  Logger.log('\n=== Summary ===');
  Logger.log('Total users: ' + (data.length - 1));
  Logger.log('Sudah di-hash: ' + hashedCount);
  Logger.log('Masih plain: ' + plainCount);
  
  if (plainCount > 0) {
    Logger.log('\n⚠️  Masih ada ' + plainCount + ' user dengan plain password');
    Logger.log('Jalankan migratePasswordsToHash() untuk migrasi');
  } else {
    Logger.log('\n✅ Semua password sudah di-hash!');
  }
}

/**
 * Reset password user (untuk testing atau lupa password)
 * @param {string} username - Username yang mau direset
 * @param {string} newPassword - Password baru (akan di-hash otomatis)
 */
function resetUserPassword(username, newPassword) {
  if (!username || !newPassword) {
    Logger.log('ERROR: Username dan password harus diisi');
    return;
  }
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Users');
  
  if (!sheet) {
    Logger.log('ERROR: Sheet Users tidak ditemukan');
    return;
  }
  
  var data = sheet.getDataRange().getValues();
  
  // Cari user
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var dbUsername = row[1]; // Column B
    
    if (dbUsername === username) {
      var hashedPassword = hashPassword(newPassword);
      sheet.getRange(i + 1, 3).setValue(hashedPassword); // Column C
      
      Logger.log('✅ Password berhasil direset!');
      Logger.log('Username: ' + username);
      Logger.log('Password baru: ' + newPassword);
      Logger.log('Hash: ' + hashedPassword);
      return;
    }
  }
  
  Logger.log('ERROR: User ' + username + ' tidak ditemukan');
}
