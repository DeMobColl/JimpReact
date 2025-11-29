/**
 * ========================================
 * UTILITY FUNCTIONS
 * ========================================
 * Helper functions untuk Apps Script
 */

/**
 * Hash password menggunakan SHA-256
 * @param {string} password - Password yang akan di-hash
 * @return {string} Hash 64 karakter hexadecimal
 */
function hashhhhh(){
  Logger.log(hashPassword('qwerty123'));
}
function hashPassword(password) {
  var rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
    Utilities.Charset.UTF_8
  );
  
  // Convert to hex string
  var hash = '';
  for (var i = 0; i < rawHash.length; i++) {
    var byte = rawHash[i];
    if (byte < 0) byte += 256;
    var hex = byte.toString(16);
    if (hex.length === 1) hex = '0' + hex;
    hash += hex;
  }
  return hash;
}

/**
 * Verify password terhadap hash
 * @param {string} password - Password plaintext
 * @param {string} hash - Hash yang tersimpan
 * @return {boolean} True jika cocok
 */
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

/**
 * Generate random token untuk session (32 karakter)
 * @return {string} Random token
 */
function generateToken() {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var token = '';
  for (var i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Generate user ID dengan format USR-XXX
 * @param {number} count - Jumlah user yang sudah ada
 * @return {string} User ID (USR-001, USR-002, dst)
 */
function generateUserId(count) {
  var num = (count + 1).toString();
  while (num.length < 3) {
    num = '0' + num;
  }
  return 'USR-' + num;
}

/**
 * Get current timestamp in ISO format
 * @return {string} ISO timestamp
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Check if token is still valid
 * @param {string} expiryTimestamp - ISO timestamp
 * @return {boolean} True jika masih valid
 */
function isTokenValid(expiryTimestamp) {
  if (!expiryTimestamp) return false;
  var expiry = new Date(expiryTimestamp);
  var now = new Date();
  return now < expiry;
}

/**
 * Create JSONP response
 * @param {string} callback - Callback function name
 * @param {object} data - Response data
 * @return {TextOutput} JSONP response
 */
function createJSONPResponse(callback, data) {
  var jsonpResponse = callback + '(' + JSON.stringify(data) + ')';
  return ContentService.createTextOutput(jsonpResponse)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
