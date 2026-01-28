# Implementation Checklist - API Response Fixes

**Start Date:** January 28, 2026  
**Estimated Time:** 15 minutes  
**Complexity:** Low (mostly imports and one-line changes)

---

## Phase 1: Add Missing Functions to API Service

### ✓ Task 1.1: Add deleteTransaction Function

**File:** `src/services/api.js`

**Location:** After line 490 (after `bulkDeleteCustomers` function)

**Action:** Copy and paste this code:

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

**Checklist:**
- [ ] Code pasted correctly
- [ ] No syntax errors (check VS Code)
- [ ] Save file

---

### ✓ Task 1.2: Add verifyConfigPassword Function

**File:** `src/services/api.js`

**Location:** End of file (before any remaining exports, around line 700)

**Action:** Copy and paste this code:

```javascript
/**
 * Verify config password
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
```

**Checklist:**
- [ ] Code pasted correctly
- [ ] No syntax errors
- [ ] Save file

---

### ✓ Task 1.3: Add updateConfigPassword Function

**File:** `src/services/api.js`

**Location:** Right after Task 1.2 (immediately after verifyConfigPassword)

**Action:** Copy and paste this code:

```javascript
/**
 * Update config password
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

**Checklist:**
- [ ] Code pasted correctly
- [ ] No syntax errors
- [ ] Save file

---

## Phase 2: Update Imports

### ✓ Task 2.1: Update MyHistory.jsx Imports

**File:** `src/pages/MyHistory.jsx`

**Current (Line 1):**
```javascript
import { getMyTransactionHistory } from '../services/api';
```

**Change to:**
```javascript
import { getMyTransactionHistory, deleteTransaction } from '../services/api';
```

**Checklist:**
- [ ] Changed line 1
- [ ] Saved file
- [ ] No red squigglies in VS Code

---

### ✓ Task 2.2: Update Config.jsx Imports

**File:** `src/pages/Config.jsx`

**Current (Lines 7-10):**
```javascript
import {
  getConfig,
  updateConfig
} from '../services/api';
```

**Change to:**
```javascript
import {
  getConfig,
  updateConfig,
  verifyConfigPassword,
  updateConfigPassword
} from '../services/api';
```

**Checklist:**
- [ ] Updated import statement
- [ ] All 4 imports listed
- [ ] Saved file
- [ ] No red squigglies in VS Code

---

## Phase 3: Fix Field Names

### ✓ Task 3.1: Fix Submit.jsx totalSetoran Field

**File:** `src/pages/Submit.jsx`

**Current (Line 182):**
```jsx
Rp {(customer.totalSetoran || 0).toLocaleString('id-ID')}
```

**Change to:**
```jsx
Rp {(customer.total_setoran || customer.totalSetoran || 0).toLocaleString('id-ID')}
```

**Verification:**
- [ ] Line 182 changed
- [ ] Fallback chain correct: `total_setoran` → `totalSetoran` → `0`
- [ ] Saved file
- [ ] Syntax highlighting looks correct

---

### ✓ Task 3.2: Fix History.jsx PDF Export - Line 148

**File:** `src/pages/History.jsx`

**Current (Line 148):**
```javascript
const tableData = filteredTransactions.map((item, index) => [
  index + 1,
  item.id || '-',
  item.nama || '-',
```

**Change to:**
```javascript
const tableData = filteredTransactions.map((item, index) => [
  index + 1,
  item.blok || '-',
  item.nama || '-',
```

**Verification:**
- [ ] Changed `item.id` to `item.blok`
- [ ] Same line indentation maintained
- [ ] Saved file

---

### ✓ Task 3.3: Fix History.jsx Excel Export - Line 247

**File:** `src/pages/History.jsx`

**Current (around Line 247):**
```javascript
const excelData = filteredTransactions.map((item, index) => ({
  'No': index + 1,
  'Blok': item.id || '-',
  'Nama': item.nama || '-',
```

**Change to:**
```javascript
const excelData = filteredTransactions.map((item, index) => ({
  'No': index + 1,
  'Blok': item.blok || '-',
  'Nama': item.nama || '-',
```

**Verification:**
- [ ] Changed `item.id` to `item.blok`
- [ ] Same line indentation maintained
- [ ] Saved file

---

### ✓ Task 3.4: Fix History.jsx formatDateTime Call - Line 149

**File:** `src/pages/History.jsx`

**Current (Line 149):**
```javascript
formatDateTime(item.waktu || item.timestamp),
```

**Change to:**
```javascript
formatDateTime(item.timestamp),
```

**Verification:**
- [ ] Removed `item.waktu ||` fallback
- [ ] Only `item.timestamp` remains
- [ ] Saved file

---

### ✓ Task 3.5: Fix History.jsx Excel Export formatDateTime - Line 250

**File:** `src/pages/History.jsx`

**Current (around Line 250):**
```javascript
'Waktu': formatDateTime(item.waktu || item.timestamp),
```

**Change to:**
```javascript
'Waktu': formatDateTime(item.timestamp),
```

**Verification:**
- [ ] Removed `item.waktu ||` fallback
- [ ] Only `item.timestamp` remains
- [ ] Saved file

---

## Phase 4: Code Cleanup (Optional)

### ⊘ Task 4.1: Simplify MyHistory.jsx Field Mapping (Optional)

**File:** `src/pages/MyHistory.jsx`

**Current (Lines 66-68):**
```javascript
const cleaned = rows.map(r => ({
  txid: String(r.txid || ''),
  timestamp: String(r.timestamp || ''),
  customer_id: String(r.customer_id || ''),
  blok: String(r.blok || r.id || ''),
  nama: String(r.nama || ''),
  nominal: Number(r.nominal || r.amount || 0),
  user_id: String(r.user_id || ''),
  petugas: String(r.petugas || currentUser?.name || '')
}));
```

**Change to (Optional - improves clarity):**
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

**Why:** Removes unnecessary fallbacks to clarify what fields are expected

**Verification:**
- [ ] Removed `|| r.id` from blok line
- [ ] Removed `|| r.amount` from nominal line
- [ ] Saved file
- [ ] (Optional - can skip if you prefer defensive code)

---

## Verification & Testing

### ✓ Task 5.1: Verify No Syntax Errors

**Action:** In VS Code, check each modified file:

```
src/services/api.js
  [ ] No red squigglies
  [ ] No "unexpected token" errors
  [ ] Can press Ctrl+S without error dialog

src/pages/MyHistory.jsx
  [ ] No red squigglies
  [ ] Import shows deleteTransaction
  [ ] Can press Ctrl+S without error dialog

src/pages/Config.jsx
  [ ] No red squigglies
  [ ] Import shows all 4 functions
  [ ] Can press Ctrl+S without error dialog

src/pages/Submit.jsx
  [ ] No red squigglies
  [ ] totalSetoran fallback chain visible
  [ ] Can press Ctrl+S without error dialog

src/pages/History.jsx
  [ ] No red squigglies
  [ ] Both export functions use item.blok
  [ ] waktu fallbacks removed
  [ ] Can press Ctrl+S without error dialog
```

---

### ✓ Task 5.2: Test in Development Server

**Action:** Run development server and test each feature

```bash
npm run dev
```

**Test Cases:**

1. **MyHistory Delete (Tests Task 1.1 + 2.1)**
   - [ ] Open /my-history
   - [ ] See list of transactions
   - [ ] Click delete button on one transaction
   - [ ] See confirmation dialog
   - [ ] Confirm deletion
   - [ ] Transaction disappears
   - [ ] No console errors

2. **Submit Transaction (Tests Task 3.1)**
   - [ ] Scan QR code (or navigate with qrHash)
   - [ ] See customer info
   - [ ] Verify "Total Setoran" shows a number (not NaN)
   - [ ] Submit transaction
   - [ ] Verify it appears in MyHistory

3. **Config Page (Tests Task 1.2, 1.3 + 2.2)**
   - [ ] Navigate to /config (might need to implement in Home.jsx)
   - [ ] See password verification dialog
   - [ ] Enter password
   - [ ] See configuration options
   - [ ] Note: Backend endpoints not yet implemented, so these will fail gracefully

4. **History Export (Tests Task 3.2-3.5)**
   - [ ] Navigate to /history (admin only)
   - [ ] Click "Export PDF"
   - [ ] Open PDF, verify "Blok" column shows customer block (like "A1"), not transaction ID
   - [ ] Click "Export Excel"
   - [ ] Open Excel, verify same for Blok column
   - [ ] No console errors

---

### ✓ Task 5.3: Check Browser Console

**Action:** Open browser DevTools (F12) → Console tab

```
Expected: No errors related to:
  [ ] "deleteTransaction is not defined"
  [ ] "verifyConfigPassword is not defined"
  [ ] "updateConfigPassword is not defined"
  [ ] Any "undefined" field access errors
  [ ] "NaN" in numeric displays
```

---

## Rollback Plan

If any issue occurs:

1. **Revert single file:**
   ```bash
   git checkout src/pages/Submit.jsx
   ```

2. **Revert all changes:**
   ```bash
   git checkout src/services/api.js src/pages/MyHistory.jsx src/pages/Config.jsx src/pages/Submit.jsx src/pages/History.jsx
   ```

3. **Check status:**
   ```bash
   git status
   ```

---

## Completion Summary

### Phase Completion Status

- [ ] **Phase 1:** All 3 API functions added to src/services/api.js
- [ ] **Phase 2:** Both import statements updated (MyHistory.jsx, Config.jsx)
- [ ] **Phase 3:** All 5 field name fixes applied
- [ ] **Phase 4:** Optional cleanup done (or skipped)
- [ ] **Phase 5:** All tests passed, no console errors

### Final Verification

- [ ] All 4 critical issues fixed
- [ ] All 3 warning issues cleaned up (or deferred)
- [ ] Development server runs without errors
- [ ] Features work as expected
- [ ] Ready to commit and push

---

## Commit Message Template

```
fix: Fix API response compatibility issues

CRITICAL FIXES:
- Add deleteTransaction function to api.js (fixes MyHistory delete)
- Add verifyConfigPassword and updateConfigPassword to api.js (fixes Config)
- Fix Submit.jsx to use correct total_setoran field name
- Fix History.jsx exports to use blok instead of id for customer block

CLEANUP:
- Remove unnecessary waktu fallback in History.jsx
- Remove unnecessary field fallbacks in MyHistory.jsx

Fixes:
- MyHistory delete button crash
- Config page password form crash
- Submit page showing "NaN" for total setoran
- History PDF/Excel exports showing wrong Blok column
```

---

## Notes

- Backend endpoints `/api/config/verify-password` and `/api/config/password` still need to be implemented in Go backend
- All frontend fixes are complete and can be merged independently
- No database migrations needed
- No environment variable changes needed

---

**Status:** Ready to implement  
**Last Updated:** January 28, 2026
