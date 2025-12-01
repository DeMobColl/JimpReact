/**
 * ========================================
 * MAIN REQUEST HANDLER
 * ========================================
 * Routing semua request (GET & POST) ke function yang sesuai
 */

/**
 * Main GET handler - routing requests
 * @param {object} e - GET event object
 * @return {TextOutput} JSONP response
 */
function doGet(e) {
  try {
    var params = e && e.parameter ? e.parameter : {};
    var action = params.action || 'health';
    var callback = params.callback || 'callback';
    
    var response = {};
    
    switch(action) {
      case 'health':
        response = {
          status: 'success',
          message: '✅ Jimpitan App API Active',
          version: '2.0',
          features: ['Login', 'CRUD User', 'History', 'Password Hashing'],
          timestamp: getCurrentTimestamp()
        };
        break;
        
      // History
      case 'getHistory':
        response = getHistoryData();
        break;
        
      // Authentication
      case 'login':
        response = handleLogin(params);
        break;
        
      case 'verifyToken':
        response = handleVerifyToken(params);
        break;
        
      case 'logout':
        response = handleLogout(params);
        break;
        
      case 'getUsers':
        response = handleGetUsers(params);
        break;
        
      case 'getUserActivity':
        response = handleGetUserActivity(params);
        break;
        
      // Customer Management
      case 'getCustomers':
        response = handleGetCustomers(params);
        break;
        
      case 'getCustomerByQRHash':
        response = handleGetCustomerByQRHash(params);
        break;
        
      case 'getCustomerHistory':
        response = handleGetCustomerHistory(params);
        break;
        
      // User Transactions (Petugas)
      case 'getUserTransactions':
        response = handleGetUserTransactions(params);
        break;
        
      case 'deleteTransaction':
        response = handleDeleteTransaction(params);
        break;
        
      // Submit Transaction (via JSONP for CORS compatibility)
      case 'submitTransaction':
        response = submitTransaction(params);
        break;
        
      case 'getConfig':
        response = handleGetConfig(params);
        break;
      
      case 'updateConfig':
        response = handleUpdateConfig(params);
        break;
        
      case 'verifyConfigPassword':
        response = handleVerifyConfigPassword(params);
        break;
        
      case 'updateConfigPassword':
        response = handleUpdateConfigPassword(params);
        break;
        
      default:
        response = {
          status: 'error',
          message: 'Action tidak dikenali: ' + action,
          availableActions: {
            GET: [
              'health', 'getHistory', 'login', 'verifyToken', 'logout',
              'getUsers', 'getUserActivity', 
              'getCustomers', 'getCustomerByQRHash', 'getCustomerHistory',
              'getUserTransactions', 'deleteTransaction', 'submitTransaction',
              'getConfig', 'updateConfig', 'verifyConfigPassword', 'updateConfigPassword'
            ],
            POST: [
              'submitTransaction', 'submitBulk', 'importTransactions',
              'createUser', 'updateUser', 'deleteUser',
              'createCustomer', 'updateCustomer', 'deleteCustomer'
            ]
          }
        };
    }
    
    // JSONP response
    return createJSONPResponse(callback, response);
      
  } catch(error) {
    var errorResponse = {
      status: 'error',
      message: error.toString(),
      stack: error.stack || 'No stack trace'
    };
    var callback = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : 'callback';
    return createJSONPResponse(callback, errorResponse);
  }
}

/**
 * ========================================
 * POST REQUEST HANDLER
 * ========================================
 */

/**
 * Create JSON response for POST requests with CORS headers
 * @param {object} data - Response data
 * @return {TextOutput} JSON response
 */
function createPostResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Handle OPTIONS request for CORS preflight
 */
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
    .setHeader('Access-Control-Max-Age', '86400');
}

/**
 * Main POST handler - routing POST requests
 * @param {object} e - POST event object
 * @return {TextOutput} JSON response
 */
function doPost(e) {
  try {
    var params = JSON.parse(e.postData.contents);
    var action = params.action || 'submitTransaction';
    var response;
    
    // Route to appropriate handler based on action
    switch(action) {
      // Transaction Submissions
      case 'submitTransaction':
        response = submitTransaction(params);
        break;
        
      case 'submitBulk':
        response = submitBulkTransactions(params.transactions || []);
        break;
        
      case 'importTransactions':
        response = importTransactions(params);
        break;
        
      // User CRUD (Write Operations)
      case 'createUser':
        response = handleCreateUser(params);
        break;
        
      case 'updateUser':
        response = handleUpdateUser(params);
        break;
        
      case 'deleteUser':
        response = handleDeleteUser(params);
        break;
        
      // Customer CRUD (Write Operations)
      case 'createCustomer':
        response = handleCreateCustomer(params);
        break;
        
      case 'updateCustomer':
        response = handleUpdateCustomer(params);
        break;
        
      case 'deleteCustomer':
        response = handleDeleteCustomer(params);
        break;
        
      default:
        // Default: treat as single transaction submission
        response = submitTransaction(params);
        break;
    }
    
    return createPostResponse(response);
    
  } catch(error) {
    return createPostResponse({
      status: 'error',
      message: 'POST Error: ' + error.toString(),
      stack: error.stack || 'No stack trace'
    });
  }
}
