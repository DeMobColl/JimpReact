# 📱 Panduan Mobile API - Jimpitan App

Dokumentasi lengkap endpoint mobile API untuk aplikasi Jimpitan dengan alur penggunaan berdasarkan role.

---

## 📋 Daftar Isi

1. [Pendahuluan](#pendahuluan)
2. [Setup Postman](#setup-postman)
3. [Authentication Mobile](#authentication-mobile)
4. [Alur Petugas](#alur-petugas)
5. [Alur Admin](#alur-admin)
6. [Response Format](#response-format)
7. [Error Handling](#error-handling)
8. [Testing Guide](#testing-guide)

---

## 📖 Pendahuluan

### Perbedaan Web vs Mobile API

| Aspek | Web API | Mobile API |
|-------|---------|------------|
| **Authentication** | Token-based (login once) | Stateless (username+password setiap request) |
| **Request Method** | GET (JSONP) | POST (JSON) |
| **Response Type** | JSONP callback | Pure JSON |
| **Session** | Token valid 7 hari | No session, auth per request |
| **CORS** | JSONP workaround | Standard CORS |

### Base URL

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

**Ganti** `YOUR_DEPLOYMENT_ID` dengan ID deployment Apps Script Anda.

### Request Format

Semua mobile endpoint menggunakan:
- **Method:** `POST`
- **Content-Type:** `application/json`
- **Auth:** Username + Password di setiap request body

---

## 🔧 Setup Postman

### 1. Import Collection

1. Download file `Jimpitan_API.postman_collection.json`
2. Buka Postman
3. Klik **Import** → pilih file → **Import**
4. Collection "Jimpitan App API" akan muncul

### 2. Setup Environment

1. Klik **Environments** di sidebar
2. Klik **+** untuk create environment baru
3. Nama: **Jimpitan Local/Production**
4. Tambahkan variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `https://script.google.com/macros/s/.../exec` | (sama) |
| `username` | `admin` | `admin` |
| `password` | `admin123` | `admin123` |
| `token` | (kosong) | (kosong) |
| `qr_hash` | (kosong) | (kosong) |

5. **Save** environment
6. Pilih environment di dropdown (pojok kanan atas)

### 3. Verifikasi Setup

Test dengan endpoint **Health Check**:

**Request:**
```
GET {{base_url}}?action=health&callback=callback
```

**Expected Response:**
```javascript
callback({
  "status": "success",
  "message": "✅ Jimpitan App API Active",
  "version": "2.0",
  "features": ["Login", "CRUD User", "History", "Password Hashing"],
  "timestamp": "2025-11-30T10:00:00Z"
})
```

✅ Jika response seperti di atas, setup berhasil!

---

## 🔐 Authentication Mobile

### Endpoint: Mobile Login

**Purpose:** Verifikasi kredensial user dan dapatkan data user untuk request selanjutnya.

**Request:**
```http
POST {{base_url}}
Content-Type: application/json

{
  "action": "mobileLogin",
  "username": "admin",
  "password": "admin123"
}
```

**Success Response:**
```json
{
  "status": "success",
  "message": "Login berhasil",
  "data": {
    "id": "USR-001",
    "name": "Admin",
    "role": "admin",
    "username": "admin"
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Username atau password salah"
}
```

### Cara Kerja Stateless Auth

Setiap request mobile **HARUS** menyertakan `username` dan `password`:

```json
{
  "action": "mobileSubmitTransaction",
  "username": "petugas1",
  "password": "password123",
  "customer_id": "CUST-001",
  "nominal": 2000
}
```

Backend akan:
1. Verifikasi username & password di setiap request
2. Check role user untuk authorization
3. Execute action jika authorized
4. Return response

**Keuntungan:**
- ✅ No token management di client
- ✅ No session expiry issues
- ✅ Stateless & scalable

**Kerugian:**
- ⚠️ Username & password di setiap request (harus HTTPS!)
- ⚠️ Sedikit lebih lambat (hash check setiap kali)

---

## 👷 Alur Petugas

Petugas memiliki akses terbatas untuk operasi sehari-hari.

### Use Case: Scan QR & Submit Transaksi

#### Step 1: Login (Optional - untuk validasi awal)

```http
POST {{base_url}}
Content-Type: application/json

{
  "action": "mobileLogin",
  "username": "petugas1",
  "password": "pass123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "USR-002",
    "name": "Petugas Satu",
    "role": "petugas",
    "username": "petugas1"
  }
}
```

💡 **Note:** Login mobile tidak wajib. Bisa langsung ke Step 2 dengan username/password valid.

#### Step 2: Scan QR Code Customer

Setelah scan QR code fisik, kirim QR hash ke backend:

```http
POST {{base_url}}
Content-Type: application/json

{
  "action": "mobileScanQR",
  "username": "petugas1",
  "password": "pass123",
  "qrHash": "a3f5d8e9c2b1..."
}
```

**Success Response:**
```json
{
  "status": "success",
  "data": {
    "id": "CUST-001",
    "blok": "A-101",
    "nama": "John Doe",
    "qrHash": "a3f5d8e9c2b1..."
  }
}
```

**Error Response (QR Invalid):**
```json
{
  "status": "error",
  "message": "Customer tidak ditemukan"
}
```

#### Step 3: Submit Transaksi

Setelah dapat data customer, submit transaksi:

```http
POST {{base_url}}
Content-Type: application/json

{
  "action": "mobileSubmitTransaction",
  "username": "petugas1",
  "password": "pass123",
  "customer_id": "CUST-001",
  "id": "A-101",
  "nama": "John Doe",
  "nominal": 2000
}
```

**Success Response:**
```json
{
  "status": "success",
  "message": "Transaksi berhasil dicatat",
  "data": {
    "txid": "TX-20251130-001",
    "customer_id": "CUST-001",
    "nominal": 2000,
    "petugas": "Petugas Satu",
    "timestamp": "2025-11-30T10:30:00Z"
  }
}
```

#### Step 4: Lihat Riwayat Transaksi Sendiri

```http
POST {{base_url}}
Content-Type: application/json

{
  "action": "mobileGetHistory",
  "username": "petugas1",
  "password": "pass123",
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "limit": 50
}
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "txid": "TX-20251130-001",
      "customer_id": "CUST-001",
      "blok": "A-101",
      "nama": "John Doe",
      "nominal": 2000,
      "petugas": "Petugas Satu",
      "timestamp": "2025-11-30T10:30:00Z"
    }
  ],
  "summary": {
    "total_transaksi": 1,
    "total_nominal": 2000
  }
}
```

💡 **Note:** Petugas **hanya bisa lihat transaksi sendiri**, bukan transaksi petugas lain.

#### Step 5: Hapus Transaksi (Jika Salah Input)

```http
POST {{base_url}}
Content-Type: application/json

{
  "action": "mobileDeleteTransaction",
  "username": "petugas1",
  "password": "pass123",
  "txid": "TX-20251130-001"
}
```

**Success Response:**
```json
{
  "status": "success",
  "message": "Transaksi berhasil dihapus"
}
```

**Error (Tidak Punya Akses):**
```json
{
  "status": "error",
  "message": "Anda hanya bisa menghapus transaksi sendiri"
}
```

---

### Use Case: Bulk Submit (Offline Mode)

Petugas mengumpulkan data offline, submit sekaligus saat online.

#### Bulk Submit Transaksi

```http
POST {{base_url}}
Content-Type: application/json

{
  "action": "mobileBulkSubmit",
  "username": "petugas1",
  "password": "pass123",
  "transactions": [
    {
      "customer_id": "CUST-001",
      "id": "A-101",
      "nama": "John Doe",
      "nominal": 2000
    },
    {
      "customer_id": "CUST-002",
      "id": "A-102",
      "nama": "Jane Smith",
      "nominal": 3000
    },
    {
      "customer_id": "CUST-003",
      "id": "B-201",
      "nama": "Bob Johnson",
      "nominal": 2000
    }
  ]
}
```

**Success Response:**
```json
{
  "status": "success",
  "message": "3 transaksi berhasil dicatat",
  "data": {
    "success": 3,
    "failed": 0,
    "transactions": [
      {
        "txid": "TX-20251130-001",
        "customer_id": "CUST-001",
        "status": "success"
      },
      {
        "txid": "TX-20251130-002",
        "customer_id": "CUST-002",
        "status": "success"
      },
      {
        "txid": "TX-20251130-003",
        "customer_id": "CUST-003",
        "status": "success"
      }
    ]
  }
}
```

**Partial Success:**
```json
{
  "status": "partial",
  "message": "2 berhasil, 1 gagal",
  "data": {
    "success": 2,
    "failed": 1,
    "transactions": [
      {
        "customer_id": "CUST-001",
        "status": "success",
        "txid": "TX-20251130-001"
      },
      {
        "customer_id": "CUST-002",
        "status": "success",
        "txid": "TX-20251130-002"
      },
      {
        "customer_id": "CUST-999",
        "status": "failed",
        "error": "Customer tidak ditemukan"
      }
    ]
  }
}
```

---

## 👤 Alur Admin

Admin memiliki akses penuh ke semua fitur termasuk manajemen user & customer.

### Use Case: Lihat Semua Transaksi

```http
POST {{base_url}}
Content-Type: application/json

{
  "action": "mobileGetHistory",
  "username": "admin",
  "password": "admin123",
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "limit": 100
}
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "txid": "TX-20251130-001",
      "customer_id": "CUST-001",
      "blok": "A-101",
      "nama": "John Doe",
      "nominal": 2000,
      "user_id": "USR-002",
      "petugas": "Petugas Satu",
      "timestamp": "2025-11-30T10:30:00Z"
    },
    {
      "txid": "TX-20251130-002",
      "customer_id": "CUST-002",
      "blok": "A-102",
      "nama": "Jane Smith",
      "nominal": 3000,
      "user_id": "USR-003",
      "petugas": "Petugas Dua",
      "timestamp": "2025-11-30T11:00:00Z"
    }
  ],
  "summary": {
    "total_transaksi": 2,
    "total_nominal": 5000
  }
}
```

💡 **Note:** Admin melihat **semua transaksi** dari semua petugas.

### Use Case: Summary Report

```http
POST {{base_url}}
Content-Type: application/json

{
  "action": "mobileGetHistorySummary",
  "username": "admin",
  "password": "admin123",
  "startDate": "2025-11-01",
  "endDate": "2025-11-30"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "period": {
      "start": "2025-11-01",
      "end": "2025-11-30"
    },
    "total_transaksi": 150,
    "total_nominal": 300000,
    "unique_customers": 75,
    "by_petugas": [
      {
        "petugas": "Petugas Satu",
        "total_transaksi": 80,
        "total_nominal": 160000
      },
      {
        "petugas": "Petugas Dua",
        "total_transaksi": 70,
        "total_nominal": 140000
      }
    ],
    "by_date": [
      {
        "date": "2025-11-01",
        "total_transaksi": 5,
        "total_nominal": 10000
      },
      {
        "date": "2025-11-02",
        "total_transaksi": 7,
        "total_nominal": 14000
      }
    ]
  }
}
```

### Use Case: Hapus Transaksi Any Petugas

Admin bisa hapus transaksi siapa saja:

```http
POST {{base_url}}
Content-Type: application/json

{
  "action": "mobileDeleteTransaction",
  "username": "admin",
  "password": "admin123",
  "txid": "TX-20251130-001"
}
```

**Success Response:**
```json
{
  "status": "success",
  "message": "Transaksi berhasil dihapus"
}
```

### Use Case: Bulk Delete

Admin hapus multiple transaksi sekaligus (cleanup data salah):

```http
POST {{base_url}}
Content-Type: application/json

{
  "action": "mobileBulkDeleteTransactions",
  "username": "admin",
  "password": "admin123",
  "txids": [
    "TX-20251130-001",
    "TX-20251130-002",
    "TX-20251130-003"
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "3 transaksi berhasil dihapus",
  "data": {
    "deleted": 3,
    "failed": 0
  }
}
```

---

## 📊 Response Format

### Standard Success Response

```json
{
  "status": "success",
  "message": "Operasi berhasil",
  "data": {
    // response data
  }
}
```

### Standard Error Response

```json
{
  "status": "error",
  "message": "Deskripsi error",
  "code": "ERROR_CODE" // opsional
}
```

### Partial Success Response

Untuk bulk operations:

```json
{
  "status": "partial",
  "message": "Sebagian berhasil",
  "data": {
    "success": 2,
    "failed": 1,
    "details": []
  }
}
```

---

## ⚠️ Error Handling

### Common Error Codes

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `Username atau password salah` | Invalid credentials | Check username/password |
| `Akses ditolak` | Insufficient permission | Login as admin |
| `Customer tidak ditemukan` | Invalid QR hash or deleted customer | Verify QR code |
| `Transaksi tidak ditemukan` | TXID doesn't exist | Check transaction ID |
| `Data tidak lengkap` | Missing required fields | Check request body |
| `Anda hanya bisa menghapus transaksi sendiri` | Petugas trying to delete other's transaction | Only admin can delete others' transactions |

### HTTP Status Codes

Mobile API selalu return **HTTP 200 OK**, status dilihat dari field `status` di response body:

- `"status": "success"` → Operation successful
- `"status": "error"` → Operation failed
- `"status": "partial"` → Bulk operation partially successful

### Error Handling Best Practice

```javascript
// JavaScript/TypeScript example
async function submitTransaction(data) {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'mobileSubmitTransaction',
        username: 'petugas1',
        password: 'pass123',
        ...data
      })
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      console.log('Success:', result.data);
      return result.data;
    } else {
      console.error('Error:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
}
```

---

## 🧪 Testing Guide

### Test Scenario: Petugas Flow

**Pre-requisites:**
- Ada user petugas (username: `petugas1`, password: `pass123`)
- Ada minimal 1 customer dengan QR hash valid

**Test Steps:**

1. **Test Login**
   - Request: `mobileLogin`
   - Expected: Success dengan data user role petugas

2. **Test Scan QR Valid**
   - Request: `mobileScanQR` dengan QR hash valid
   - Expected: Success dengan data customer

3. **Test Scan QR Invalid**
   - Request: `mobileScanQR` dengan QR hash random
   - Expected: Error "Customer tidak ditemukan"

4. **Test Submit Transaksi**
   - Request: `mobileSubmitTransaction` dengan data valid
   - Expected: Success dengan TXID

5. **Test Get History Own**
   - Request: `mobileGetHistory`
   - Expected: Success, hanya muncul transaksi sendiri

6. **Test Delete Own Transaction**
   - Request: `mobileDeleteTransaction` dengan TXID sendiri
   - Expected: Success

7. **Test Delete Other's Transaction**
   - Request: `mobileDeleteTransaction` dengan TXID petugas lain
   - Expected: Error "hanya bisa menghapus transaksi sendiri"

### Test Scenario: Admin Flow

**Pre-requisites:**
- Ada user admin (username: `admin`, password: `admin123`)
- Ada beberapa transaksi dari berbagai petugas

**Test Steps:**

1. **Test Login Admin**
   - Request: `mobileLogin`
   - Expected: Success dengan data user role admin

2. **Test Get All History**
   - Request: `mobileGetHistory`
   - Expected: Success, muncul **semua transaksi** dari semua petugas

3. **Test Get Summary**
   - Request: `mobileGetHistorySummary`
   - Expected: Success dengan breakdown per petugas & per tanggal

4. **Test Delete Any Transaction**
   - Request: `mobileDeleteTransaction` dengan TXID dari petugas manapun
   - Expected: Success

5. **Test Bulk Delete**
   - Request: `mobileBulkDeleteTransactions` dengan multiple TXID
   - Expected: Success dengan summary deleted/failed

### Postman Test Scripts

Tambahkan script ini di tab **Tests** untuk auto-validation:

```javascript
// Test script untuk mobileLogin
pm.test("Status is success", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("success");
});

pm.test("User data exists", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property("id");
    pm.expect(jsonData.data).to.have.property("role");
});

// Save user data to environment
var jsonData = pm.response.json();
if (jsonData.status === "success") {
    pm.environment.set("user_id", jsonData.data.id);
    pm.environment.set("user_role", jsonData.data.role);
}
```

```javascript
// Test script untuk mobileSubmitTransaction
pm.test("Transaction submitted", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("success");
    pm.expect(jsonData.data).to.have.property("txid");
});

// Save TXID for later use
var jsonData = pm.response.json();
if (jsonData.status === "success" && jsonData.data.txid) {
    pm.environment.set("last_txid", jsonData.data.txid);
}
```

---

## 🔐 Security Notes

### HTTPS Wajib

⚠️ **CRITICAL:** Mobile API mengirim username & password di setiap request body.

**Gunakan HTTPS** untuk mencegah man-in-the-middle attack!

Google Apps Script otomatis menggunakan HTTPS.

### Rate Limiting

Tidak ada rate limiting di Google Apps Script level gratis. Untuk production:

- Implementasi rate limiting di client side
- Track request count per user
- Add exponential backoff untuk retry

### Password Storage

- Password di-hash dengan SHA-256 di backend
- Tidak ada plain text password di database
- Client harus store credentials securely (KeyStore/Keychain)

---

## 📚 Additional Resources

- **Web API Documentation:** Lihat README.md
- **Postman Collection:** `docs/Jimpitan_API.postman_collection.json`
- **Apps Script Source:** `docs/appscript/main_handlers.js`
- **Issue Tracker:** GitHub Issues

---

## 🆘 Troubleshooting

### Request Timeout

**Problem:** Request tidak dapat response
**Cause:** Google Apps Script execution limit (30 detik)
**Solution:** 
- Kurangi data yang diproses (pakai limit & pagination)
- Split bulk operation jadi chunks lebih kecil

### Authentication Failed

**Problem:** "Username atau password salah" padahal benar
**Cause:** 
- Password belum di-hash di database
- Whitespace di username/password
**Solution:**
- Run `migratePasswordsToHash()` di Apps Script
- Trim whitespace di client: `username.trim()`

### CORS Error

**Problem:** Browser blocked request
**Cause:** Postman desktop tidak ada CORS issue, browser ada
**Solution:**
- Gunakan Postman desktop untuk testing
- Untuk production mobile app, CORS tidak masalah (native app)

---

**Happy Testing! 📱💰**
