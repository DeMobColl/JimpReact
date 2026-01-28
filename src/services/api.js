/**
 * API Service Layer for Golang Backend
 * Handles all REST API calls to the Golang backend server
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const REQUEST_TIMEOUT = import.meta.env.VITE_API_TIMEOUT_MS || 15000;

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const {
    method = "GET",
    body = null,
    headers = {},
    token = null,
  } = options;

  const url = `${API_URL}${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Add token to Authorization header if provided
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions = {
    method,
    headers: defaultHeaders,
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    // Set timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // Parse response
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Debug logging
    console.log(`[API] ${method} ${endpoint}`, { status: response.status, data });

    // Handle error responses
    if (!response.ok) {
      const errorMessage =
        data?.message || data?.error || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Network error or timeout
    if (error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  }
}

// ============================================
// Authentication Endpoints
// ============================================

/**
 * Login with username and password
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{token, user: {id, name, role, username}}>}
 */
export async function loginWithAPI(username, password) {
  try {
    const response = await apiCall("/api/login", {
      method: "POST",
      body: { username, password },
    });

    console.log("[loginWithAPI] Full response:", response);

    // Backend returns { status, message, data: { token, id, name, role, username, ... } }
    // Sometimes might be just { message, token, id, ... } without wrapper
    let userData;
    
    if (response.data) {
      // Standard format: { status, message, data: {...} }
      userData = response.data;
    } else if (response.token) {
      // Direct format: { token, id, name, ... }
      userData = response;
    } else {
      console.error("[loginWithAPI] Unexpected response structure:", response);
      throw new Error("Invalid response format from server");
    }

    if (!userData.token || !userData.id) {
      console.error("[loginWithAPI] Missing token or id in userData:", userData);
      throw new Error("Invalid response format from server");
    }

    console.log("[loginWithAPI] Parsed user data:", userData);

    return {
      token: userData.token,
      user: {
        id: userData.id,
        name: userData.name || userData.nama || "Unknown",
        role: userData.role, // 'admin' or 'petugas'
        username: userData.username,
      },
    };
  } catch (error) {
    console.error("[loginWithAPI] Error:", error);
    throw new Error(`Login failed: ${error.message}`);
  }
}

/**
 * Verify token validity
 * @param {string} token
 * @returns {Promise<{user: {id, name, role, username}}>}
 */
export async function verifyTokenAPI(token) {
  try {
    const response = await apiCall("/api/verifyToken", {
      method: "GET",
      token,
    });

    // Backend returns { data: { id, name, role, username, ... } } or similar
    const userData = response.data || response;
    if (!userData.id) {
      throw new Error("Invalid token response");
    }

    return {
      user: {
        id: userData.id,
        name: userData.name,
        role: userData.role,
        username: userData.username,
      },
    };
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

/**
 * Logout (invalidate token on server)
 * @param {string} token
 */
export async function logoutAPI(token) {
  try {
    await apiCall("/api/logout", {
      method: "POST",
      token,
    });
  } catch (error) {
    console.warn("Logout request failed:", error.message);
    // Don't throw - allow logout to proceed even if server call fails
  }
}

// ============================================
// User Management Endpoints
// ============================================

/**
 * Get all users (admin only)
 * @param {string} token
 * @returns {Promise<Array>}
 */
export async function getUsers(token) {
  try {
    const response = await apiCall("/api/users", {
      method: "GET",
      token,
    });
    // Backend returns { status, message, data: { users: [...] } }
    console.log("[getUsers] Response:", response);
    
    if (!response) return [];
    
    // Handle the response data structure
    let usersArray = [];
    
    if (response.data) {
      // Standard format: { status, message, data: { users: [...] } }
      if (response.data.users && Array.isArray(response.data.users)) {
        usersArray = response.data.users;
      } else if (Array.isArray(response.data)) {
        // Direct array in data field
        usersArray = response.data;
      }
    } else if (response.users && Array.isArray(response.users)) {
      // Direct format: { users: [...] }
      usersArray = response.users;
    } else if (Array.isArray(response)) {
      // Direct array
      usersArray = response;
    }
    
    console.log("[getUsers] Parsed users:", usersArray);
    return usersArray;
  } catch (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}

/**
 * Create new user (admin only)
 * @param {string} token
 * @param {Object} userData - {name, username, password, role}
 * @returns {Promise<Object>}
 */
export async function createUser(token, userData) {
  try {
    const response = await apiCall("/api/users", {
      method: "POST",
      body: userData,
      token,
    });
    // Backend returns { status, message, data: { id, name, role, username, ... } }
    return response.data || response;
  } catch (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }
}

/**
 * Update user (admin only)
 * @param {string} token
 * @param {string} userId
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
export async function updateUser(token, userId, userData) {
  try {
    const response = await apiCall(`/api/users?id=${userId}`, {
      method: "PUT",
      body: userData,
      token,
    });
    // Backend returns { status, message, data: null }
    return response;
  } catch (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }
}

/**
 * Delete user (admin only)
 * @param {string} token
 * @param {string} userId
 */
export async function deleteUser(token, userId) {
  try {
    await apiCall(`/api/users?id=${userId}`, {
      method: "DELETE",
      token,
    });
  } catch (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
}

/**
 * Bulk delete users
 * @param {string} token
 * @param {Array} userIds
 * @returns {Promise<{deleted: number, excluded: Array}>}
 */
export async function bulkDeleteUsers(token, userIds) {
  try {
    const deleted = [];
    const excluded = [];

    // Delete users one by one
    for (const id of userIds) {
      try {
        await deleteUser(token, id);
        deleted.push(id);
      } catch (error) {
        excluded.push({ id, error: error.message });
      }
    }

    return {
      status: 'success',
      deleted: deleted.length,
      excluded,
      totalRequested: userIds.length,
    };
  } catch (error) {
    throw new Error(`Failed to bulk delete users: ${error.message}`);
  }
}

/**
 * Bulk import users
 * @param {string} token
 * @param {Array} users
 * @returns {Promise<Object>}
 */
export async function bulkImportUsers(token, users) {
  try {
    const created = [];
    const excluded = [];

    // Create users one by one
    for (const user of users) {
      try {
        const result = await createUser(token, user);
        created.push(result);
      } catch (error) {
        excluded.push({ user, error: error.message });
      }
    }

    return {
      status: 'success',
      created: created.length,
      excluded,
      totalRequested: users.length,
    };
  } catch (error) {
    throw new Error(`Failed to bulk import users: ${error.message}`);
  }
}

// ============================================
// Customer Management Endpoints
// ============================================

/**
 * Get all customers
 * @param {string} token
 * @returns {Promise<Array>}
 */
export async function getCustomers(token) {
  try {
    const response = await apiCall("/api/customers", {
      method: "GET",
      token,
    });
    // Backend returns { status, message, data: { customers: [...] } }
    console.log("[getCustomers] Response:", response);
    
    if (!response) return [];
    
    // Handle the response data structure
    let customersArray = [];
    
    if (response.data) {
      // Standard format: { status, message, data: { customers: [...] } }
      if (response.data.customers && Array.isArray(response.data.customers)) {
        customersArray = response.data.customers;
      } else if (Array.isArray(response.data)) {
        // Direct array in data field
        customersArray = response.data;
      }
    } else if (response.customers && Array.isArray(response.customers)) {
      // Direct format: { customers: [...] }
      customersArray = response.customers;
    } else if (Array.isArray(response)) {
      // Direct array
      customersArray = response;
    }
    
    console.log("[getCustomers] Parsed customers:", customersArray);
    return customersArray;
  } catch (error) {
    throw new Error(`Failed to fetch customers: ${error.message}`);
  }
}

/**
 * Create new customer
 * @param {string} token
 * @param {Object} customerData - {blok, nama}
 * @returns {Promise<Object>}
 */
export async function createCustomer(token, customerData) {
  try {
    const response = await apiCall("/api/customers", {
      method: "POST",
      body: customerData,
      token,
    });
    // Backend returns { status, message, data: { id, blok, nama, qr_hash, ... } }
    return response.data || response;
  } catch (error) {
    throw new Error(`Failed to create customer: ${error.message}`);
  }
}

/**
 * Get customer by QR hash
 * @param {string} token
 * @param {string} qrHash
 * @returns {Promise<Object>}
 */
export async function getCustomerByQRHash(token, qrHash) {
  try {
    const response = await apiCall(`/api/customers/qr?qr_hash=${qrHash}`, {
      method: "GET",
      token,
    });
    // Backend returns { status, message, data: { id, blok, nama, qr_hash, ... } }
    return response.data || response;
  } catch (error) {
    throw new Error(`Failed to fetch customer: ${error.message}`);
  }
}

/**
 * Update customer
 * @param {string} token
 * @param {string} customerId
 * @param {Object} customerData
 * @returns {Promise<Object>}
 */
export async function updateCustomer(token, customerId, customerData) {
  try {
    const response = await apiCall(`/api/customers?id=${customerId}`, {
      method: "PUT",
      body: customerData,
      token,
    });
    // Backend returns { status, message, data: null }
    return response;
  } catch (error) {
    throw new Error(`Failed to update customer: ${error.message}`);
  }
}

/**
 * Delete customer
 * @param {string} token
 * @param {string} customerId
 */
export async function deleteCustomer(token, customerId) {
  try {
    await apiCall(`/api/customers?id=${customerId}`, {
      method: "DELETE",
      token,
    });
  } catch (error) {
    throw new Error(`Failed to delete customer: ${error.message}`);
  }
}

/**
 * Bulk delete customers
 * @param {string} token
 * @param {Array} customerIds
 * @returns {Promise<{deleted: number, excluded: Array}>}
 */
export async function bulkDeleteCustomers(token, customerIds) {
  try {
    const deleted = [];
    const excluded = [];

    // Delete customers one by one
    for (const id of customerIds) {
      try {
        await deleteCustomer(token, id);
        deleted.push(id);
      } catch (error) {
        excluded.push({ id, error: error.message });
      }
    }

    return {
      status: 'success',
      deleted: deleted.length,
      excluded,
      totalRequested: customerIds.length,
    };
  } catch (error) {
    throw new Error(`Failed to bulk delete customers: ${error.message}`);
  }
}

/**
 * Bulk import customers
 * @param {string} token
 * @param {Array} customers
 * @returns {Promise<Object>}
 */
export async function bulkImportCustomers(token, customers) {
  try {
    const response = await apiCall("/api/customers/bulk", {
      method: "POST",
      body: { customers },
      token,
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to import customers: ${error.message}`);
  }
}

// ============================================
// Transaction Endpoints
// ============================================

/**
 * Submit transaction
 * @param {string} token
 * @param {Object} transactionData - {customer_id, nominal, notes?}
 * @returns {Promise<Object>}
 */
export async function submitTransaction(token, transactionData) {
  try {
    const response = await apiCall("/api/transactions", {
      method: "POST",
      body: transactionData,
      token,
    });
    // Backend returns { status, message, data: { id, timestamp, customer_id, nominal, ... } }
    return response.data || response;
  } catch (error) {
    throw new Error(`Failed to submit transaction: ${error.message}`);
  }
}

/**
 * Get transaction history (all or filtered)
 * @param {string} token
 * @param {Object} filters - {customerId?, userId?, startDate?, endDate?, limit?, offset?}
 * @returns {Promise<{transactions: Array, total: number}>}
 */
export async function getTransactionHistory(token, filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        queryParams.append(key, value);
      }
    });

    const endpoint = `/api/transactions${queryParams ? `?${queryParams}` : ""}`;
    const response = await apiCall(endpoint, {
      method: "GET",
      token,
    });

    // Backend returns { status, message, data: [...] } - array of transactions directly
    console.log("[getTransactionHistory] Response:", response);
    
    let transactions = [];
    
    if (response.data) {
      if (Array.isArray(response.data)) {
        transactions = response.data;
      } else if (response.data.transactions && Array.isArray(response.data.transactions)) {
        transactions = response.data.transactions;
      }
    } else if (Array.isArray(response)) {
      transactions = response;
    }
    
    console.log("[getTransactionHistory] Parsed transactions:", transactions);
    
    return {
      transactions,
      total: transactions.length,
    };
  } catch (error) {
    throw new Error(`Failed to fetch transaction history: ${error.message}`);
  }
}

/**
 * Get my transaction history (current user)
 * Fallback: if not implemented, use regular transaction history
 * @param {string} token
 * @param {Object} filters
 * @returns {Promise<{transactions: Array, total: number}>}
 */
export async function getMyTransactionHistory(token, filters = {}) {
  try {
    // Try my-history endpoint first
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        queryParams.append(key, value);
      }
    });

    try {
      const endpoint = `/api/transactions/my-history${queryParams ? `?${queryParams}` : ""}`;
      const response = await apiCall(endpoint, {
        method: "GET",
        token,
      });
      
      console.log("[getMyTransactionHistory] Response:", response);
      
      let transactions = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          transactions = response.data;
        } else if (response.data.transactions && Array.isArray(response.data.transactions)) {
          transactions = response.data.transactions;
        }
      } else if (Array.isArray(response)) {
        transactions = response;
      }
      
      console.log("[getMyTransactionHistory] Parsed transactions:", transactions);
      
      return {
        transactions,
        total: transactions.length,
      };
    } catch (error) {
      // If my-history not available, fallback to regular transactions
      if (error.message.includes("404") || error.message.includes("not found")) {
        return getTransactionHistory(token, filters);
      }
      throw error;
    }
  } catch (error) {
    throw new Error(`Failed to fetch my transaction history: ${error.message}`);
  }
}

// ============================================
// Config Endpoints (Not yet implemented in backend)
// ============================================

/**
 * Get system configuration
 * NOTE: This endpoint is not yet implemented in the backend
 * @param {string} token
 * @returns {Promise<Object>}
 */
export async function getConfig(token) {
  try {
    const response = await apiCall("/api/config", {
      method: "GET",
      token,
    });
    return response.data || response.config || response;
  } catch (error) {
    if (error.message.includes("404") || error.message.includes("not found")) {
      // Return default config if endpoint not available
      console.warn("Config endpoint not available, using defaults");
      return {
        id: "CONFIG-001",
        petugas_web_login_enabled: true,
        mobile_app_version: "1.0.0",
        updated_at: new Date().toISOString(),
      };
    }
    throw new Error(`Failed to fetch configuration: ${error.message}`);
  }
}

/**
 * Update system configuration (admin only)
 * NOTE: This endpoint is not yet implemented in the backend
 * @param {string} token
 * @param {Object} configData
 * @returns {Promise<Object>}
 */
export async function updateConfig(token, configData) {
  try {
    const response = await apiCall("/api/config", {
      method: "PUT",
      body: configData,
      token,
    });
    return response.data || response.config || response;
  } catch (error) {
    if (error.message.includes("404") || error.message.includes("not found")) {
      console.warn("Config endpoint not available");
      return { success: true };
    }
    throw new Error(`Failed to update configuration: ${error.message}`);
  }
}

// ============================================
// Health Check
// ============================================

/**
 * Check if API is healthy
 * @returns {Promise<boolean>}
 */
export async function healthCheck() {
  try {
    await apiCall("/api/health", {
      method: "GET",
    });
    return true;
  } catch {
    return false;
  }
}
