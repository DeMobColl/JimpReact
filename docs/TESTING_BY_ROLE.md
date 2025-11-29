# 🚀 Quick Start Guide - Testing API by Role

Panduan cepat testing Jimpitan API menggunakan Postman berdasarkan role user.

---

## 📦 Setup Awal (5 Menit)

### 1. Import ke Postman

1. Download 3 file dari folder `docs/`:
   - `Jimpitan_API.postman_collection.json` (Collection)
   - `Jimpitan_Production.postman_environment.json` (Environment Admin)
   - `Jimpitan_Petugas.postman_environment.json` (Environment Petugas)

2. Buka Postman → **Import** → Drag & drop ketiga file

3. Setelah import, akan ada:
   - ✅ 1 Collection: "Jimpitan App API"
   - ✅ 2 Environments: "Jimpitan - Production" & "Jimpitan - Petugas Test"

### 2. Konfigurasi Environment

**Environment 1: Production (Admin)**
1. Pilih environment "Jimpitan - Production"
2. Klik icon mata 👁️ → **Edit**
3. Update variable `base_url` dengan deployment URL Anda
4. Save

**Environment 2: Petugas Test**
1. Pilih environment "Jimpitan - Petugas Test"
2. Klik icon mata 👁️ → **Edit**
3. Update variable `base_url` dengan deployment URL Anda
4. Update `username` dan `password` sesuai data petugas Anda
5. Save

### 3. Test Connection

1. Pilih environment "Jimpitan - Production"
2. Buka request **Health Check** di collection
3. Klik **Send**
4. Expected response:
```json
callback({
  "status": "success",
  "message": "✅ Jimpitan App API Active",
  ...
})
```

✅ **Jika berhasil, lanjut ke testing berdasarkan role!**

---

## 👤 Testing Role: ADMIN

### Scenario 1: Manajemen User Complete Flow

**Step 1: Login sebagai Admin**
```
Request: Web Endpoints → Authentication → Login
Variables akan otomatis ter-set jika ada test script
```

**Step 2: Lihat Semua User**
```
Request: Web Endpoints → Users → Get All Users
Verifikasi: Ada list user dengan role admin & petugas
```

**Step 3: Tambah User Petugas Baru**
```
Request: Web Endpoints → Users → Create User
Body:
{
  "action": "createUser",
  "token": "{{token}}",
  "name": "Petugas Baru",
  "username": "petugasbaru",
  "password": "pass12345",
  "role": "petugas"
}
Expected: User berhasil dibuat
```

**Step 4: Edit User**
```
Request: Web Endpoints → Users → Update User
Body: Ganti nama user
Expected: User berhasil diupdate
```

**Step 5: Hapus User**
```
Request: Web Endpoints → Users → Delete User
Body: userId dari user yang baru dibuat
Expected: User berhasil dihapus
```

---

### Scenario 2: Manajemen Customer & QR

**Step 1: Lihat Semua Customer**
```
Request: Web Endpoints → Customers → Get All Customers
Expected: List semua customer dengan QR hash
```

**Step 2: Tambah Customer Baru**
```
Request: Web Endpoints → Customers → Create Customer
Params:
- token: {{token}}
- blok: B-205
- nama: Testing Customer
Expected: Customer dibuat dengan QR hash otomatis
```

**Step 3: Copy QR Hash**
```
Dari response, copy value "qrHash"
Save ke environment variable "qr_hash" untuk testing selanjutnya
```

**Step 4: Test Scan QR**
```
Request: Web Endpoints → Customers → Get Customer by QR Hash
Params: qrHash = {{qr_hash}}
Expected: Data customer sesuai
```

**Step 5: Update Customer**
```
Request: Web Endpoints → Customers → Update Customer
Ganti blok atau nama
Expected: Customer terupdate, QR hash tetap sama
```

---

### Scenario 3: Monitor Semua Transaksi

**Step 1: Lihat Semua History**
```
Request: Web Endpoints → Transactions → Get All History
Expected: Semua transaksi dari semua petugas
```

**Step 2: Lihat Transaksi Spesifik User**
```
Request: Web Endpoints → Transactions → Get User Transactions
Expected: Transaksi dari user yang login (admin)
```

**Step 3: Hapus Transaksi Any User**
```
Request: Web Endpoints → Transactions → Delete Transaction
Params: txid = (pilih TXID dari history)
Expected: Transaksi terhapus (admin bisa hapus transaksi siapa saja)
```

---

### Scenario 4: Mobile API - Admin Full Access

**Setup:** Switch environment ke "Jimpitan - Production"

**Step 1: Mobile Login**
```
Request: Mobile Endpoints → Mobile - Login
Body sudah terisi otomatis dari environment
Expected: Login berhasil dengan role admin
```

**Step 2: Get All History via Mobile**
```
Request: Mobile Endpoints → Mobile - Get History
Body:
{
  "action": "mobileGetHistory",
  "username": "{{username}}",
  "password": "{{password}}",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "limit": 100
}
Expected: Semua transaksi dari semua petugas (bukan hanya admin)
```

**Step 3: Get Summary Report**
```
Request: Mobile Endpoints → Mobile - Get History Summary
Expected: Summary dengan breakdown per petugas dan per tanggal
```

**Step 4: Bulk Delete Transactions**
```
Request: Mobile Endpoints → Mobile - Bulk Delete Transactions
Body: Array of TXID
Expected: Multiple transaksi terhapus sekaligus
```

---

## 👷 Testing Role: PETUGAS

### Scenario 1: Daily Transaction Flow

**Setup:** Switch environment ke "Jimpitan - Petugas Test"

**Step 1: Mobile Login Petugas**
```
Request: Mobile Endpoints → Mobile - Login
Expected: Login berhasil dengan role petugas
```

**Step 2: Scan QR Customer**
```
Request: Mobile Endpoints → Mobile - Scan QR
Body:
{
  "action": "mobileScanQR",
  "username": "{{username}}",
  "password": "{{password}}",
  "qrHash": "PASTE_QR_HASH_HERE"
}
Expected: Data customer sesuai QR
```

**Cara dapat QR Hash untuk testing:**
1. Login sebagai admin (ganti environment)
2. Request: Get All Customers
3. Copy qrHash dari salah satu customer
4. Paste ke request Scan QR di step ini

**Step 3: Submit Transaksi**
```
Request: Mobile Endpoints → Mobile - Submit Transaction
Body:
{
  "action": "mobileSubmitTransaction",
  "username": "{{username}}",
  "password": "{{password}}",
  "customer_id": "CUST-001",
  "id": "A-101",
  "nama": "John Doe",
  "nominal": 2000
}
Expected: Transaksi tercatat dengan TXID
```

**Step 4: Lihat History Sendiri**
```
Request: Mobile Endpoints → Mobile - Get History
Expected: Hanya transaksi yang dicatat oleh petugas ini
TIDAK muncul transaksi petugas lain
```

**Step 5: Hapus Transaksi Sendiri**
```
Request: Mobile Endpoints → Mobile - Delete Transaction
Body: TXID dari transaksi sendiri
Expected: Berhasil dihapus
```

**Step 6: Test Hapus Transaksi Orang Lain (Should Fail)**
```
Request: Mobile Endpoints → Mobile - Delete Transaction
Body: TXID dari transaksi petugas lain (atau admin)
Expected: ERROR - "Anda hanya bisa menghapus transaksi sendiri"
```

---

### Scenario 2: Bulk Submit (Offline Mode)

**Use Case:** Petugas kumpul data offline, submit sekaligus saat online

**Step 1: Bulk Submit Multiple Transactions**
```
Request: Mobile Endpoints → Mobile - Bulk Submit
Body:
{
  "action": "mobileBulkSubmit",
  "username": "{{username}}",
  "password": "{{password}}",
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
      "nominal": 2500
    }
  ]
}
Expected: 3 transaksi berhasil tercatat
```

**Step 2: Verifikasi History**
```
Request: Mobile Endpoints → Mobile - Get History
Expected: 3 transaksi baru muncul di list
```

---

### Scenario 3: Test Permission Boundaries

**Test 1: Petugas Coba Akses Get All Users (Should Fail)**
```
Environment: Jimpitan - Petugas Test
Request: Web Endpoints → Users → Get All Users
Expected: ERROR - "Akses ditolak" atau "Admin only"
```

**Test 2: Petugas Coba Create Customer (Should Fail)**
```
Request: Web Endpoints → Customers → Create Customer
Expected: ERROR - Permission denied (admin only)
```

**Test 3: Petugas Coba Hapus Customer (Should Fail)**
```
Request: Web Endpoints → Customers → Delete Customer
Expected: ERROR - Permission denied
```

**Test 4: Petugas Lihat History All (Should See Own Only)**
```
Request: Mobile Endpoints → Mobile - Get History
Expected: SUCCESS tapi hanya muncul transaksi sendiri
```

✅ **Semua test di atas harus gagal/restricted untuk petugas**

---

## 🔄 Comparison Testing: Admin vs Petugas

Test yang sama, hasil berbeda berdasarkan role.

### Test Case: Get History

**Admin Version:**
```
Environment: Jimpitan - Production
Request: Mobile - Get History
Result: Melihat SEMUA transaksi dari semua petugas
```

**Petugas Version:**
```
Environment: Jimpitan - Petugas Test  
Request: Mobile - Get History
Result: Melihat HANYA transaksi sendiri
```

### Test Case: Delete Transaction

**Admin Version:**
```
Environment: Jimpitan - Production
Request: Mobile - Delete Transaction (ANY TXID)
Result: SUCCESS - Admin bisa hapus transaksi siapa saja
```

**Petugas Version:**
```
Environment: Jimpitan - Petugas Test
Request: Mobile - Delete Transaction (OTHER's TXID)
Result: ERROR - "Hanya bisa menghapus transaksi sendiri"
```

---

## 📊 Test Checklist

### ✅ Admin Testing Checklist

- [ ] Login admin berhasil
- [ ] Create user petugas berhasil
- [ ] Update user berhasil
- [ ] Delete user berhasil
- [ ] Create customer berhasil (QR auto-generated)
- [ ] Update customer berhasil
- [ ] Delete customer berhasil
- [ ] Lihat semua history (include transaksi petugas)
- [ ] Hapus transaksi any user berhasil
- [ ] Get config berhasil
- [ ] Update config berhasil
- [ ] Mobile: Get history summary dengan breakdown
- [ ] Mobile: Bulk delete multiple transactions

### ✅ Petugas Testing Checklist

- [ ] Login petugas berhasil
- [ ] Scan QR valid berhasil
- [ ] Scan QR invalid return error
- [ ] Submit transaksi berhasil
- [ ] Bulk submit berhasil
- [ ] Lihat history sendiri (hanya transaksi sendiri)
- [ ] Hapus transaksi sendiri berhasil
- [ ] Hapus transaksi orang lain GAGAL (expected)
- [ ] Akses create user GAGAL (expected)
- [ ] Akses create customer GAGAL (expected)
- [ ] Akses config GAGAL (expected)

---

## 🐛 Troubleshooting

### "Token is undefined"

**Cause:** Belum login atau token expired
**Fix:** 
1. Run request "Login" dulu
2. Pastikan test script menyimpan token ke environment
3. Check environment variable `token` terisi

### "Username atau password salah"

**Cause:** Credentials di environment tidak sesuai database
**Fix:**
1. Check sheet "Users" di Google Sheets
2. Verify username exact match (case-sensitive)
3. Pastikan password sudah di-hash (run `migratePasswordsToHash()`)

### "Customer tidak ditemukan"

**Cause:** QR hash invalid atau customer sudah dihapus
**Fix:**
1. Get fresh customer list via "Get All Customers"
2. Copy qrHash yang valid
3. Update environment variable `qr_hash`

### Request Timeout

**Cause:** Google Apps Script execution limit (30 detik)
**Fix:**
1. Kurangi limit di request (default: 100 → 50)
2. Kurangi date range filter
3. Split bulk operation jadi lebih kecil

---

## 💡 Pro Tips

1. **Use Test Scripts** - Automate variable saving:
```javascript
// Di tab Tests
var data = pm.response.json();
pm.environment.set("token", data.data.token);
pm.environment.set("last_txid", data.data.txid);
```

2. **Duplicate Requests** - Create variations for different test cases

3. **Use Runner** - Run entire folder dengan Postman Runner untuk regression testing

4. **Monitor Mode** - Schedule runs untuk health monitoring

5. **Share Collection** - Export & share dengan team untuk consistent testing

---

## 📚 Next Steps

Setelah testing manual dengan Postman:

1. **Implement in Mobile App** - Use tested endpoints di Flutter/React Native
2. **Setup CI/CD Testing** - Automate testing dengan Newman
3. **Performance Testing** - Test dengan concurrent requests
4. **Load Testing** - Test limits Google Apps Script

---

**Happy Testing! 🚀**
