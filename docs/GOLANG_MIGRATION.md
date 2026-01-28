# Frontend Integration dengan Backend Go

Panduan lengkap untuk mengintegrasikan frontend React dengan backend Go yang baru.

## 📋 Perubahan pada Frontend

### 1. Environment Variables (.env)

**Sebelum (Google Apps Script):**
```
VITE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
VITE_JSONP_TIMEOUT_MS=15000
VITE_REQUEST_MAX_CONCURRENT=3
VITE_REQUEST_CACHE_TTL_MS=30000
```

**Sesudah (Backend Go):**
```
VITE_API_URL=http://localhost:8080
VITE_API_TIMEOUT_MS=15000
VITE_REQUEST_MAX_CONCURRENT=3
VITE_REQUEST_CACHE_TTL_MS=30000
```

### 2. File yang Perlu Diubah

```
src/
├── services/
│   ├── sheets.js          ← Ubah menjadi api.js (REST API calls)
│   └── requestManager.js  ← Perbarui untuk REST API
├── contexts/
│   └── AuthContext.jsx    ← Update untuk JWT tokens
└── utils/
    └── security.js        ← Update untuk JWT handling
```

## 🔄 Migrasi `sheets.js` → `api.js`

### Perbedaan Utama

**JSONP (Lama):**
```javascript
// GET request dengan callback JSONP
const response = await createJSONPRequest('getUsers', {token});
```

**REST API (Baru):**
```javascript
// Standard fetch dengan Authorization header
const response = await fetch('http://localhost:8080/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Implementasi Baru

File `src/services/api.js` yang menggantikan `sheets.js`:

```javascript
import { requestQueue, requestCache, retryWithBackoff } from "./requestManager";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 15000;

let tokenInvalidHandler = null;

export function setTokenInvalidHandler(handler) {
  tokenInvalidHandler = handler;
}

// Helper untuk mengirim GET request
async function apiGet(endpoint, token, useCache = true) {
  const cacheKey = `GET_${endpoint}`;
  
  if (useCache && requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  return requestQueue.add(() =>
    retryWithBackoff(async () => {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        handleTokenInvalid();
        throw new Error('Token tidak valid atau sudah kadaluarsa');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }

      const data = await response.json();
      
      if (useCache) {
        requestCache.set(cacheKey, data, API_TIMEOUT_MS);
      }
      
      return data;
    })
  );
}

// Helper untuk mengirim POST request
async function apiPost(endpoint, body, token) {
  return requestQueue.add(() =>
    retryWithBackoff(async () => {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.status === 401) {
        handleTokenInvalid();
        throw new Error('Token tidak valid atau sudah kadaluarsa');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }

      return await response.json();
    })
  );
}

// ============ AUTH ENDPOINTS ============

export async function loginWithSheet(username, password) {
  const response = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();
  return data.data; // { id, name, role, username, token, token_expiry }
}

export async function verifyTokenAPI(token) {
  const response = await fetch(`${API_URL}/api/verifyToken?token=${token}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error('Token verification failed');
  }

  const data = await response.json();
  return data.data;
}

// ============ USER ENDPOINTS ============

export async function getUsers(token) {
  const data = await apiGet('/api/users', token);
  return data.data.users || [];
}

export async function createUser(name, role, username, password, token) {
  const result = await apiPost('/api/users', {
    name, role, username, password
  }, token);
  
  // Clear cache after mutation
  requestCache.delete('GET_/api/users');
  return result.data;
}

export async function updateUser(id, name, role, username, token) {
  const result = await apiPost(`/api/users?id=${id}`, {
    name, role, username
  }, token);
  
  requestCache.delete('GET_/api/users');
  return result.data;
}

export async function deleteUser(id, token) {
  const response = await fetch(`${API_URL}/api/users?id=${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) throw new Error('Delete failed');
  
  requestCache.delete('GET_/api/users');
  return await response.json();
}

// ============ CUSTOMER ENDPOINTS ============

export async function getCustomers(token) {
  const data = await apiGet('/api/customers', token);
  return data.data.customers || [];
}

export async function getCustomerByQRHash(qrHash, token) {
  const data = await apiGet(`/api/customers/qr?qr_hash=${qrHash}`, token, false);
  return data.data;
}

export async function createCustomer(blok, nama, token) {
  const result = await apiPost('/api/customers', {
    blok, nama
  }, token);
  
  requestCache.delete('GET_/api/customers');
  return result.data;
}

// ============ TRANSACTION ENDPOINTS ============

export async function submitTransaction(params, token) {
  const result = await apiPost('/api/transactions', params, token);
  
  requestCache.delete('GET_/api/transactions');
  requestCache.delete(`GET_/api/customers/history?customer_id=${params.customer_id}`);
  
  return result.data;
}

export async function getHistory(token) {
  const data = await apiGet('/api/transactions', token);
  return data.data || [];
}

export async function deleteTransaction(id, token) {
  const response = await fetch(`${API_URL}/api/transactions?id=${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) throw new Error('Delete failed');
  
  requestCache.delete('GET_/api/transactions');
  return await response.json();
}
```

## 🔐 Update AuthContext.jsx

### Token Management

**Sebelum:**
```javascript
// Menyimpan token di localStorage
localStorage.setItem('jimpitanToken', response.token);
localStorage.setItem('jimpitanCurrentUser', JSON.stringify(response));
```

**Sesudah (Sama, tapi untuk JWT):**
```javascript
// Tetap sama, API sudah return JWT format
localStorage.setItem('jimpitanToken', response.token);
localStorage.setItem('jimpitanTokenExpiry', response.token_expiry);
localStorage.setItem('jimpitanCurrentUser', JSON.stringify(response));
```

### Verify Token Logic

Update `AuthContext.jsx`:
```javascript
import { verifyTokenAPI } from '../services/api';

// Dalam useEffect token verification
const verifyToken = async () => {
  const token = localStorage.getItem('jimpitanToken');
  if (!token) {
    setIsAuthenticated(false);
    return;
  }

  try {
    const user = await verifyTokenAPI(token);
    setCurrentUser(user);
    setIsAuthenticated(true);
  } catch (error) {
    // Token invalid atau expired
    handleTokenInvalid();
  }
};
```

## 🔄 Update RequestManager

Perbarui `requestManager.js` untuk kompatibilitas:

```javascript
// Tidak perlu ubah banyak, tetap support cache dan queue
// Hanya update error handling untuk REST API responses

export class RequestQueue {
  // ... existing code ...

  async add(operation) {
    // Existing queue logic tetap sama
    // REST API akan throw Error jika status bukan 200-299
    try {
      return await operation();
    } catch (error) {
      // Handle error consistency
      throw error;
    }
  }
}
```

## 📝 Update import di Pages

Setiap page yang menggunakan API perlu update import:

**Sebelum:**
```javascript
import { getCustomers, submitTransaction } from '../services/sheets';
```

**Sesudah:**
```javascript
import { getCustomers, submitTransaction } from '../services/api';
```

### Files untuk diupdate:
- `src/pages/Home.jsx`
- `src/pages/Users.jsx`
- `src/pages/Customers.jsx`
- `src/pages/ScanQR.jsx`
- `src/pages/Submit.jsx`
- `src/pages/History.jsx`
- `src/pages/MyHistory.jsx`
- `src/pages/Config.jsx`

## 🧪 Testing Checklist

- [ ] Login berhasil dengan JWT token
- [ ] Token simpan di localStorage dengan format baru
- [ ] Get customers dari endpoint `/api/customers`
- [ ] Submit transaction ke `/api/transactions`
- [ ] QR scan masih berfungsi dengan endpoint baru
- [ ] Delete operations clear cache dengan benar
- [ ] Token expiry handling (auto logout setelah 7 hari)
- [ ] CORS request dari frontend berhasil
- [ ] Error handling untuk 401/403 responses
- [ ] Offline fallback tetap berfungsi

## 🚀 Migration Steps

1. **Backup** database lama dan data frontend
2. **Setup** backend Go dengan migrations (lihat `backend-go/README.md`)
3. **Copy** semua files dari backend-go ke struktur yang sesuai
4. **Create** `src/services/api.js` (file baru menggantikan sheets.js)
5. **Update** `.env` dengan `VITE_API_URL`
6. **Update** semua imports di pages/components
7. **Update** `AuthContext.jsx` untuk JWT handling
8. **Test** semua endpoints dengan curl/Postman
9. **Run** `npm run dev` dan lakukan manual testing
10. **Build** untuk production: `npm run build`

## 🔗 Reference

- Backend API Docs: `backend-go/README.md`
- JWT Standard: https://tools.ietf.org/html/rfc7519
- Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
