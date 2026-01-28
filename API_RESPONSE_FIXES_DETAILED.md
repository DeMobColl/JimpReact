# API Response Compatibility - Detailed Fix Guide

## Overview

Backend uses REST API with consistent response format:
```json
{
  "status": "success|error",
  "message": "...",
  "data": { /* actual response */ }
}
```

Frontend has 4 critical issues and 3 warning issues preventing proper data handling.

---

## Fix #1: Add Missing deleteTransaction Function

**File:** `src/services/api.js`

**Add this function after the deleteCustomer function (around line 490):**

```javascript
/**
 * Delete transaction
 * @param {string} token
 * @param {string} transactionId
 */
export async function deleteTransaction(token, transactionId) {
  try {
    await apiCall(`/api/transactions?id=${transactionId}`, {
      method: "DELETE",
      token,
    });
    return { status: 'success', message: 'Transaction deleted successfully' };
  } catch (error) {
    throw new Error(`Failed to delete transaction: ${error.message}`);
  }
}
```

**File:** `src/pages/MyHistory.jsx`

**Update the import statement at the top (line 2):**

**Before:**
```javascript
import { getMyTransactionHistory } from '../services/api';
```

**After:**
```javascript
import { getMyTransactionHistory, deleteTransaction } from '../services/api';
```

---

## Fix #2: Add Missing Config Password Functions

**File:** `src/services/api.js`

**Add these functions at the end of the file, before the export statements (around line 700):**

```javascript
/**
 * Verify config password
 * NOTE: This endpoint needs to be implemented in the backend
 * @param {string} token
 * @param {string} password
 * @returns {Promise<{status: string}>}
 */
export async function verifyConfigPassword(token, password) {
  try {
    const response = await apiCall("/api/config/verify-password", {
      method: "POST",
      body: { password },
      token,
    });
    return response.data || response;
  } catch (error) {
    throw new Error(`Password verification failed: ${error.message}`);
  }
}

/**
 * Update config password
 * NOTE: This endpoint needs to be implemented in the backend
 * @param {string} token
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<{status: string}>}
 */
export async function updateConfigPassword(token, currentPassword, newPassword) {
  try {
    const response = await apiCall("/api/config/password", {
      method: "POST",
      body: { currentPassword, newPassword },
      token,
    });
    return response.data || response;
  } catch (error) {
    throw new Error(`Failed to update password: ${error.message}`);
  }
}
```

**File:** `src/pages/Config.jsx`

**Update the import statement (line 5):**

**Before:**
```javascript
import {
  getConfig,
  updateConfig
} from '../services/api';
```

**After:**
```javascript
import {
  getConfig,
  updateConfig,
  verifyConfigPassword,
  updateConfigPassword
} from '../services/api';
```

---

## Fix #3: Fix totalSetoran Field Name

**File:** `src/pages/Submit.jsx`

**Location:** Line 182, in the Customer Info Card section

**Before:**
```jsx
<div className="text-base md:text-lg font-bold">
  Rp {(customer.totalSetoran || 0).toLocaleString('id-ID')}
</div>
```

**After:**
```jsx
<div className="text-base md:text-lg font-bold">
  Rp {(customer.total_setoran || customer.totalSetoran || 0).toLocaleString('id-ID')}
</div>
```

**Explanation:**
- Backend returns `total_setoran` (snake_case) from Go model
- Added fallback to `totalSetoran` in case of format inconsistency
- Ensures graceful fallback to 0 if both are undefined

---

## Fix #4: Fix Transaction Export to Use Correct Field

**File:** `src/pages/History.jsx`

**Location 1:** Line 148-149, in the exportToPDF function

**Before:**
```javascript
const tableData = filteredTransactions.map((item, index) => [
  index + 1,
  item.id || '-',  // Wrong: this is transaction ID
  item.nama || '-',
  `Rp${Number(item.nominal || 0).toLocaleString('id-ID')}`,
  formatDateTime(item.waktu || item.timestamp),
  item.petugas || '-',
]);
```

**After:**
```javascript
const tableData = filteredTransactions.map((item, index) => [
  index + 1,
  item.blok || '-',  // Correct: customer block/ID
  item.nama || '-',
  `Rp${Number(item.nominal || 0).toLocaleString('id-ID')}`,
  formatDateTime(item.timestamp),
  item.petugas || '-',
]);
```

**Location 2:** Line 247, in the exportToExcel function

**Before:**
```javascript
const excelData = filteredTransactions.map((item, index) => ({
  'No': index + 1,
  'Blok': item.id || '-',  // Wrong field
  'Nama': item.nama || '-',
  'Nominal': Number(item.nominal || 0),
  'Waktu': formatDateTime(item.waktu || item.timestamp),
  'Petugas': item.petugas || '-',
}));
```

**After:**
```javascript
const excelData = filteredTransactions.map((item, index) => ({
  'No': index + 1,
  'Blok': item.blok || '-',  // Correct field
  'Nama': item.nama || '-',
  'Nominal': Number(item.nominal || 0),
  'Waktu': formatDateTime(item.timestamp),
  'Petugas': item.petugas || '-',
}));
```

**Explanation:**
- Transaction model has both `id` (transaction ID) and `blok` (customer block)
- Export header says "Blok" so should use `item.blok`
- Also removed unnecessary `|| item.waktu` fallback since backend only returns `timestamp`

---

## Warning Fix #1: Remove Unnecessary waktu Fallback

**File:** `src/pages/History.jsx`

**Location:** Line 50 and other places where `tx.timestamp || tx.waktu` appears

**Before:**
```javascript
const txDate = new Date(tx.timestamp || tx.waktu);
```

**After:**
```javascript
const txDate = new Date(tx.timestamp);
```

**Explanation:**
- Backend only returns `timestamp` field
- `waktu` (Indonesian for "time") is not in the response
- Removing unnecessary fallback simplifies code

---

## Warning Fix #2: Remove Unnecessary Field Fallbacks

**File:** `src/pages/MyHistory.jsx`

**Location:** Lines 66-68, in the transaction normalization map function

**Before:**
```javascript
const cleaned = rows.map(r => ({
  txid: String(r.txid || ''),
  timestamp: String(r.timestamp || ''),
  customer_id: String(r.customer_id || ''),
  blok: String(r.blok || r.id || ''),  // Unnecessary fallback
  nama: String(r.nama || ''),
  nominal: Number(r.nominal || r.amount || 0),  // Unnecessary fallback
  user_id: String(r.user_id || ''),
  petugas: String(r.petugas || currentUser?.name || '')
}));
```

**After:**
```javascript
const cleaned = rows.map(r => ({
  txid: String(r.id || ''),
  timestamp: String(r.timestamp || ''),
  customer_id: String(r.customer_id || ''),
  blok: String(r.blok || ''),
  nama: String(r.nama || ''),
  nominal: Number(r.nominal || 0),
  user_id: String(r.user_id || ''),
  petugas: String(r.petugas || currentUser?.name || '')
}));
```

**Explanation:**
- Backend Transaction model only has `blok` (not `id` for block)
- Backend only has `nominal` (not `amount`)
- Removed unnecessary fallbacks to clarify field expectations

---

## Info Fix #1: Standardize Field Name Handling in Customers

**File:** `src/pages/Customers.jsx`

**Current State:** Lines 67-73 have good defensive fallbacks:

```javascript
const sanitizedData = (customersArray || []).map(customer => ({
  ...customer,
  id: customer.id || '',
  blok: customer.blok || '',
  nama: customer.nama || '',
  qr_hash: customer.qr_hash || customer.qrHash || '',
  created_at: customer.created_at || customer.createdAt || '',
  total_setoran: customer.total_setoran || customer.totalSetoran || 0,
  last_transaction: customer.last_transaction || customer.lastTransaction || null
}));
```

**Recommendation:**
This code is intentionally defensive due to potential format inconsistencies. Either:

**Option A:** Keep as-is (safer, handles format variations)
```javascript
// Keep the code as-is for maximum compatibility
```

**Option B:** Standardize backend to always use snake_case
```javascript
// Then simplify to:
const sanitizedData = (customersArray || []).map(customer => ({
  ...customer,
  id: customer.id || '',
  blok: customer.blok || '',
  nama: customer.nama || '',
  qr_hash: customer.qr_hash || '',
  created_at: customer.created_at || '',
  total_setoran: customer.total_setoran || 0,
  last_transaction: customer.last_transaction || null
}));
```

**Recommendation:** Keep Option A (current defensive approach) unless backend is guaranteed to always return snake_case.

---

## Testing Checklist

After applying all fixes, test these scenarios:

- [ ] **Submit Transaction:** Scan QR → verify customer name and total display correctly
- [ ] **Delete Transaction:** Click delete button on transaction → verify it deletes
- [ ] **Config Page:** Enter config password → verify authentication works
- [ ] **History Export:** Export to PDF → verify "Blok" column shows customer block, not transaction ID
- [ ] **History Export:** Export to Excel → verify correct columns
- [ ] **MyHistory:** View own transactions → verify delete button works
- [ ] **Browser Console:** No undefined field errors

---

## Backend Endpoints Status

These endpoints are **NOT YET IMPLEMENTED** in the Go backend:

1. ❌ `POST /api/config/verify-password` - Needed for Config.jsx
2. ❌ `POST /api/config/password` - Needed for Config.jsx

These should be added to the backend to make Config page fully functional.

---

## Summary

| Fix # | Severity | File | Issue | Status |
|-------|----------|------|-------|--------|
| 1 | 🔴 CRITICAL | MyHistory.jsx | Missing deleteTransaction function | Blocked feature |
| 2 | 🔴 CRITICAL | Config.jsx | Missing password functions | Blocked page |
| 3 | 🔴 CRITICAL | Submit.jsx | Wrong field name totalSetoran | Wrong display |
| 4 | 🔴 CRITICAL | History.jsx | Export uses wrong field | Wrong export |
| 5 | 🟠 WARNING | History.jsx | Unnecessary waktu fallback | Code smell |
| 6 | 🟠 WARNING | MyHistory.jsx | Unnecessary fallbacks | Code smell |
| 7 | 🟠 INFO | Customers.jsx | Defensive format handling | Intentional |
