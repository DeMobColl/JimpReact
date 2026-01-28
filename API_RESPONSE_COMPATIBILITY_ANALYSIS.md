# API Response Compatibility Analysis - React Pages

**Analysis Date:** January 28, 2026  
**Backend:** Go REST API  
**Response Format:** `{ status, message, data: {} }`

---

## Summary of Findings

### Critical Issues: 3
### Warning Issues: 5
### Info Issues: 2

---

## 1. **Submit.jsx** ❌ CRITICAL

### Issue 1.1: Missing Field Name Mapping for `totalSetoran`
**Location:** [src/pages/Submit.jsx#L182](src/pages/Submit.jsx#L182)  
**Severity:** CRITICAL - Will display "NaN" to user

**Problem:**
```jsx
<div className="text-base md:text-lg font-bold">
  Rp {(customer.totalSetoran || 0).toLocaleString('id-ID')}
</div>
```

Backend returns `total_setoran` (snake_case) from models, but code uses `totalSetoran` (camelCase).

**Current Flow:**
- API returns: `{ total_setoran: 100000 }`
- Code accesses: `customer.totalSetoran` → `undefined`
- Result: `Rp NaN` displayed to user

**Fix:**
```jsx
Rp {(customer.total_setoran || customer.totalSetoran || 0).toLocaleString('id-ID')}
```

---

### Issue 1.2: Customer Field Not Extracted from Response Wrapper
**Location:** [src/services/api.js#L432](src/services/api.js#L432)  
**Severity:** CRITICAL - May return partial data

**Problem:**
```javascript
export async function getCustomerByQRHash(token, qrHash) {
  const response = await apiCall(`/api/customers/qr?qr_hash=${qrHash}`, { ... });
  return response.data || response;  // ← Might return { status, message, data: {...} }
}
```

Backend handler returns: `{ status: "success", message: "...", data: { id, blok, nama, qr_hash, ... } }`

If response parsing returns the full wrapper object, Submit.jsx tries to access `customer.id`, `customer.blok`, etc. on the wrapper object instead of the inner data object.

**Fix:**
```javascript
export async function getCustomerByQRHash(token, qrHash) {
  try {
    const response = await apiCall(`/api/customers/qr?qr_hash=${qrHash}`, { ... });
    return response.data || response;
  } catch (error) {
    throw new Error(`Failed to fetch customer: ${error.message}`);
  }
}
```

Should ensure it always returns the inner data object, not the wrapper.

---

## 2. **Customers.jsx** ❌ CRITICAL

### Issue 2.1: Inconsistent Field Name Handling for QR Hash
**Location:** [src/pages/Customers.jsx#L67-73](src/pages/Customers.jsx#L67-73)  
**Severity:** CRITICAL - Defensive, but indicates API inconsistency

**Problem:**
```javascript
const sanitizedData = (customersArray || []).map(customer => ({
  ...customer,
  id: customer.id || '',
  blok: customer.blok || '',
  nama: customer.nama || '',
  qr_hash: customer.qr_hash || customer.qrHash || '',  // ← Fallback to camelCase
  created_at: customer.created_at || customer.createdAt || '',
  total_setoran: customer.total_setoran || customer.totalSetoran || 0,
  last_transaction: customer.last_transaction || customer.lastTransaction || null
}));
```

This is good defensive programming, but indicates the backend is **inconsistent**. The code normalizes both `qr_hash` and `qrHash`, `created_at` and `createdAt`, etc.

**Root Cause:** Backend Go models use snake_case JSON tags (correct), but somewhere in the response chain they might be converted to camelCase or there's a format mismatch.

**Recommendation:** Ensure backend consistently returns snake_case (Go default).

---

### Issue 2.2: Response Parsing for Create/Update Operations
**Location:** [src/pages/Customers.jsx#L170-180](src/pages/Customers.jsx#L170-180)  
**Severity:** WARNING - May fail response validation

**Problem:**
```javascript
const response = await createCustomer(token, submitData);
if (response && (response.status === 'success' || response.id)) {
  toast.success('Customer berhasil ditambahkan');
}
```

The code checks `response.status === 'success'`, but the backend returns:
```json
{
  "status": "success",
  "message": "Customer created successfully",
  "data": { "id": "...", "blok": "...", ... }
}
```

So `response.status` is likely correct, but the check should verify the structure more carefully.

**Fix:**
```javascript
if (response && response.status === 'success') {
  toast.success('Customer berhasil ditambahkan');
  handleCloseForm();
  await loadCustomers();
}
```

---

## 3. **History.jsx** ⚠️ WARNING

### Issue 3.1: Multiple Timestamp Field Names Not Handled
**Location:** [src/pages/History.jsx#L47-54](src/pages/History.jsx#L47-54)  
**Severity:** WARNING - May show incorrect dates in filters

**Problem:**
```javascript
const filteredTransactions = transactions.filter(tx => {
  let matchesDate = true;
  const txDate = new Date(tx.timestamp || tx.waktu);  // ← Fallback to waktu
  ...
});
```

Code tries both `timestamp` and `waktu` (Indonesian for "time"), but backend only returns `timestamp`. The `waktu` field doesn't exist in the Go model.

**Also:**
```javascript
const formatDateTime = (timestamp) => {
  if (timestamp && typeof timestamp === 'string' && timestamp.includes('/')) {
    return timestamp;  // Assume pre-formatted
  }
  const date = new Date(timestamp);
  ...
};
```

This assumes timestamps might be pre-formatted with `/` characters, which is odd. The backend returns ISO timestamps.

**Fix:**
```javascript
const txDate = new Date(tx.timestamp);
if (isNaN(txDate.getTime())) {
  return false;  // Invalid date, skip
}
```

---

### Issue 3.2: Export Functions Reference Wrong Field
**Location:** [src/pages/History.jsx#L148-149](src/pages/History.jsx#L148-149)  
**Severity:** WARNING - Excel/PDF exports may show wrong data

**Problem:**
```javascript
const tableData = filteredTransactions.map((item, index) => [
  index + 1,
  item.id || '-',  // ← Should this be blok?
  item.nama || '-',
  ...
]);
```

The table exports `item.id` as "Blok" column, but transaction objects have `id` (transaction ID) and `blok` (block/customer block). The header says "Blok" but the data is "transaction ID".

**Also in line 247:**
```javascript
'Blok': item.id || '-',  // ← Wrong field
```

Should be:
```javascript
'Blok': item.blok || '-',
```

---

## 4. **MyHistory.jsx** ⚠️ WARNING

### Issue 4.1: Field Name Normalization Comments Indicate Confusion
**Location:** [src/pages/MyHistory.jsx#L60-70](src/pages/MyHistory.jsx#L60-70)  
**Severity:** INFO - Code works but could be cleaner

**Problem:**
```javascript
const cleaned = rows.map(r => ({
  txid: String(r.txid || ''),
  timestamp: String(r.timestamp || ''),
  customer_id: String(r.customer_id || ''),
  blok: String(r.blok || r.id || ''),  // ← Fallback to r.id
  nominal: Number(r.nominal || r.amount || 0),  // ← Fallback to r.amount
  ...
}));
```

Multiple fallbacks suggest uncertainty about field names:
- `r.blok` OR `r.id` (should only be `blok`)
- `r.nominal` OR `r.amount` (should only be `nominal`)

**Root Cause:** Either old API format or copy-paste from legacy code.

**Fix:** Trust the backend model. Remove fallbacks:
```javascript
const cleaned = rows.map(r => ({
  txid: String(r.id || ''),
  timestamp: String(r.timestamp || ''),
  customer_id: String(r.customer_id || ''),
  blok: String(r.blok || ''),
  nama: String(r.nama || ''),
  nominal: Number(r.nominal || 0),
  ...
}));
```

---

### Issue 4.2: Missing deleteTransaction Function
**Location:** [src/pages/MyHistory.jsx#L189-200](src/pages/MyHistory.jsx#L189-200)  
**Severity:** CRITICAL - Feature Will Crash

**Problem:**
```javascript
const handleConfirm = async () => {
  if (!confirmData) return;
  const { transaction } = confirmData;
  setLoading(true);
  try {
    const res = await deleteTransaction(token, transaction.txid);  // ← NOT IMPORTED
    if (res.status !== 'success') throw new Error(res.message || 'Gagal hapus');
    ...
  }
};
```

The function `deleteTransaction` is called but never imported from `../services/api`.

**Import missing:**
```javascript
import { getMyTransactionHistory, deleteTransaction } from '../services/api';
```

Also, the function `deleteTransaction` doesn't exist in [src/services/api.js](src/services/api.js). Only `TransactionHandler.DeleteTransaction` exists in backend.

**Fix:** Add to api.js:
```javascript
export async function deleteTransaction(token, transactionId) {
  try {
    await apiCall(`/api/transactions?id=${transactionId}`, {
      method: "DELETE",
      token,
    });
    return { status: 'success' };
  } catch (error) {
    throw new Error(`Failed to delete transaction: ${error.message}`);
  }
}
```

Then import it in MyHistory.jsx.

---

## 5. **Users.jsx** ⚠️ WARNING

### Issue 5.1: Missing lastLogin Field Handling
**Location:** [src/pages/Users.jsx](src/pages/Users.jsx)  
**Severity:** INFO - Code doesn't display lastLogin but backend returns it

**Problem:**
The backend User model includes:
```go
LastLogin *time.Time `json:"last_login,omitempty"`
```

But Users.jsx never displays or handles this field. Not a bug, just unused data.

---

## 6. **Config.jsx** ⚠️ WARNING

### Issue 6.1: verifyConfigPassword Function Not Imported
**Location:** [src/pages/Config.jsx#L40-57](src/pages/Config.jsx#L40-57)  
**Severity:** CRITICAL - Password dialog will crash

**Problem:**
```javascript
const response = await verifyConfigPassword(token, password);
```

But `verifyConfigPassword` is not imported or defined in api.js.

**Also:** `updateConfigPassword` is called at line 98 but not imported.

**Fix:** Add to api.js:
```javascript
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

Also import these functions in Config.jsx.

---

## 7. **ImportUserModal.jsx** ✅ OK

**Status:** No critical issues found. Response handling is done in parent component.

---

## 8. **ImportCustomerModal.jsx** ✅ OK

**Status:** No critical issues found. Response handling is done in parent component.

---

## Root Cause Analysis

### Backend Response Format (Correct)
All backend endpoints follow this pattern:
```json
{
  "status": "success|error",
  "message": "...",
  "data": { /* actual object or array */ }
}
```

### Frontend Issues (Inconsistent Handling)

1. **api.js service layer partially handles unwrapping**: Some functions correctly extract `response.data`, others assume direct format
2. **Page components don't consistently handle snake_case vs camelCase**: Customers.jsx has defensive fallbacks, others don't
3. **Missing API functions**: Config.jsx and MyHistory.jsx call functions that don't exist
4. **Field name confusion**: Multiple fallback attempts (`r.nominal || r.amount`) suggest legacy code

---

## Recommended Fixes (Priority Order)

### 🔴 CRITICAL - Fix First
1. Add `deleteTransaction` function to api.js and import in MyHistory.jsx (blocks delete feature)
2. Add `verifyConfigPassword` and `updateConfigPassword` to api.js and import in Config.jsx (blocks config page)
3. Fix Submit.jsx `customer.totalSetoran` → `customer.total_setoran` (displays wrong data)
4. Verify getCustomerByQRHash returns inner data object, not wrapper

### 🟠 WARNING - Fix Second
5. Fix History.jsx export functions to use `item.blok` instead of `item.id`
6. Remove unnecessary field fallbacks in MyHistory.jsx (`r.blok || r.id`)
7. Remove unnecessary waktu fallback in History.jsx

### 🟢 INFO - Fix Third
8. Document why Customers.jsx has multiple field name fallbacks or standardize backend format

---

## Testing Recommendations

1. **Submit Transaction:**
   - Scan QR code → Submit transaction → Verify customer name and total_setoran display correctly
   - Verify transaction appears in MyHistory

2. **View History:**
   - Admin: View all transactions, export to PDF/Excel
   - Petugas: View only their own transactions (MyHistory)
   - Verify delete functionality works

3. **Config Page:**
   - Verify password dialog appears
   - Test verifying and changing config password

4. **Data Consistency:**
   - Check browser console for no `undefined` field accesses
   - Verify all exports show correct columns (Blok, not ID)

---

## Appendix: Backend Response Examples

### GetCustomerByQRHash
**Request:** `GET /api/customers/qr?qr_hash=abc123`  
**Response:**
```json
{
  "status": "success",
  "message": "Customer found",
  "data": {
    "id": "CUST-001",
    "blok": "A1",
    "nama": "John Doe",
    "qr_hash": "abc123",
    "total_setoran": 150000,
    "last_transaction": "2026-01-28T10:30:00Z",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

### GetTransactionHistory
**Request:** `GET /api/transactions`  
**Response:**
```json
{
  "status": "success",
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "id": "TXID-001",
      "timestamp": "2026-01-28T10:30:00Z",
      "customer_id": "CUST-001",
      "blok": "A1",
      "nama": "John Doe",
      "nominal": 50000,
      "user_id": "USR-001",
      "petugas": "Budi"
    }
  ]
}
```

### GetMyTransactionHistory
**Request:** `GET /api/transactions/my-history` (with Bearer token)  
**Response:** Same as GetTransactionHistory, but filtered by user_id from token
