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

    // Backend returns { message, data: { token, id, name, role, username, ... } }
    const userData = response.data || response;
    if (!userData.token || !userData.id) {
      throw new Error("Invalid response format from server");
    }

    return {
      token: userData.token,
      user: {
        id: userData.id,
        name: userData.name,
        role: userData.role, // 'admin' or 'petugas'
        username: userData.username,
      },
    };
  } catch (error) {
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
    const usersData = response.data || response;
    return usersData.users || usersData || [];
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
    const customersData = response.data || response;
    return customersData.customers || customersData || [];
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

    // Backend returns { status, message, data: [...] } - array of transactions
    const transactionsData = response.data || response;
    return {
      transactions: Array.isArray(transactionsData) ? transactionsData : [],
      total: Array.isArray(transactionsData) ? transactionsData.length : 0,
    };
  } catch (error) {
    throw new Error(`Failed to fetch transaction history: ${error.message}`);
  }
}

/**
 * Get my transaction history (current user)
 * @param {string} token
 * @param {Object} filters
 * @returns {Promise<{transactions: Array, total: number}>}
 */
export async function getMyTransactionHistory(token, filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        queryParams.append(key, value);
      }
    });

    const endpoint = `/api/transactions/my-history${queryParams ? `?${queryParams}` : ""}`;
    const response = await apiCall(endpoint, {
      method: "GET",
      token,
    });

    // Backend returns { status, message, data: [...] } - array of transactions
    const transactionsData = response.data || response;
    return {
      transactions: Array.isArray(transactionsData) ? transactionsData : [],
      total: Array.isArray(transactionsData) ? transactionsData.length : 0,
    };
  } catch (error) {
    throw new Error(`Failed to fetch my transaction history: ${error.message}`);
  }
}

// ============================================
// Config Endpoints
// ============================================

/**
 * Get system configuration
 * @param {string} token
 * @returns {Promise<Object>}
 */
export async function getConfig(token) {
  try {
    const response = await apiCall("/api/config", {
      method: "GET",
      token,
    });
    return response.config || response;
  } catch (error) {
    throw new Error(`Failed to fetch configuration: ${error.message}`);
  }
}

/**
 * Update system configuration (admin only)
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
    return response.config || response;
  } catch (error) {
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
