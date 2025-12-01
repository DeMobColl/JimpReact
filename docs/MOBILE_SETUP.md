# Setup Google Sheets untuk Mobile API

## Struktur Sheet Users

Sheet **Users** harus memiliki kolom berikut (total 10 kolom):

| Kolom | Nama | Tipe | Keterangan |
|-------|------|------|------------|
| A | ID | String | User ID (USR-001, USR-002, ...) |
| B | Name | String | Nama lengkap user |
| C | Role | String | Role: "admin" atau "petugas" |
| D | Username | String | Username untuk login |
| E | Password | String | Password hash (SHA-256) |
| F | Token | String | Web token (untuk web app) |
| G | Token Expiry | Date | Web token expiry |
| H | Last Login | Date | Waktu login terakhir |
| **I** | **Token Mobile** | **String** | **Mobile token (untuk mobile app)** ⭐ |
| **J** | **Token Mobile Expiry** | **Date** | **Mobile token expiry** ⭐ |

### Header Row (Row 1):
```
ID | Name | Role | Username | Password | Token | Token Expiry | Last Login | Token Mobile | Token Mobile Expiry
```

## Migrasi dari Struktur Lama

Jika sheet Users Anda hanya memiliki 8 kolom (tanpa Token Mobile), lakukan langkah berikut:

### Cara Manual:
1. Buka Google Sheet **Users**
2. Klik kolom **I** (setelah Last Login)
3. Klik kanan → **Insert 2 columns right**
4. Ubah header kolom I menjadi **Token Mobile**
5. Ubah header kolom J menjadi **Token Mobile Expiry**

### Cara Otomatis (via Apps Script):
1. Buka Tools → Script editor di Google Sheets
2. Buat file baru bernama `migration_mobile.js`
3. Copy paste script berikut:

```javascript
function addMobileTokenColumns() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var usersSheet = ss.getSheetByName('Users');
  
  if (!usersSheet) {
    Logger.log('ERROR: Sheet Users tidak ditemukan');
    return;
  }
  
  // Cek jumlah kolom saat ini
  var lastColumn = usersSheet.getLastColumn();
  
  if (lastColumn < 10) {
    // Insert 2 kolom baru di posisi I dan J
    usersSheet.insertColumnsAfter(lastColumn, 10 - lastColumn);
    
    // Set header untuk kolom I dan J
    usersSheet.getRange(1, 9).setValue('Token Mobile');
    usersSheet.getRange(1, 10).setValue('Token Mobile Expiry');
    
    Logger.log('✅ Kolom Token Mobile berhasil ditambahkan!');
  } else {
    Logger.log('⚠️ Kolom sudah ada (total: ' + lastColumn + ' kolom)');
  }
}
```

4. Run function `addMobileTokenColumns()`
5. Authorize script jika diminta
6. Cek log untuk memastikan berhasil

## Contoh Data Users

| ID | Name | Role | Username | Password | Token | Token Expiry | Last Login | Token Mobile | Token Mobile Expiry |
|----|------|------|----------|----------|-------|--------------|------------|--------------|---------------------|
| USR-001 | Administrator | admin | admin | c9cddf4205cb7b... | 0Jy1rz8Tj... | 2025-12-06T... | 2025-11-29T... | | |
| USR-002 | Udin | petugas | udin | e2a47d699b25d... | | | 2025-11-29T... | a1b2c3d4e5f6... | 2025-12-08T... |
| USR-003 | Qwerty | admin | qwerty | daaad6e56048... | | | 2025-11-29T... | | |
| USR-004 | Asdf | petugas | asdf | 312433c28349fe... | | | | f7g8h9i0j1k2... | 2025-12-07T... |

### Catatan:
- **Admin** tidak bisa login via mobile (Token Mobile kosong)
- **Petugas** bisa punya web token DAN mobile token sekaligus
- Token mobile terpisah dari web token
- Kedua token bisa aktif bersamaan

## Deployment Apps Script

Setelah menambahkan kolom baru, deploy ulang Apps Script:

1. Buka Apps Script Editor
2. Pastikan semua file ter-update:
   - `main_handlers.js` (dengan routing mobile)
   - `mobile_auth.js` (fungsi autentikasi mobile)
   - `mobile_handlers.js` (handler endpoint mobile)
   - File lainnya tetap sama
3. Klik **Deploy** → **Manage deployments**
4. Klik ikon ⚙️ → **New version**
5. Copy **Web app URL** yang baru
6. Update `baseUrl` di Postman environment

## Testing

1. **Import Postman Collection:**
   - Import `Jimpitan_Mobile_API.postman_collection.json`
   - Import `Jimpitan_Mobile_Petugas.postman_environment.json`

2. **Update Environment:**
   - Set `baseUrl` dengan deployment URL Anda
   - Set `username` dan `password` petugas yang valid

3. **Test Login:**
   - Run request **Mobile Login**
   - Cek environment variable `mobileToken` ter-set otomatis

4. **Test Scan QR:**
   - Pastikan ada customer dengan QR Hash
   - Update `qrHash` di environment
   - Run request **Scan QR Code**

5. **Test Submit Transaction:**
   - Run request **Submit Transaction**
   - Cek sheet Jimpitan untuk transaksi baru

6. **Test Get History:**
   - Run request **Get History**
   - Harus muncul transaksi yang baru dibuat

7. **Test Delete:**
   - Run request **Delete Transaction**
   - Cek sheet Jimpitan, transaksi harus terhapus

## Troubleshooting

### Kolom tidak ditemukan
**Masalah:** Error saat akses kolom I atau J  
**Solusi:** Pastikan sheet Users sudah punya 10 kolom (A-J)

### Token tidak ter-save
**Masalah:** Login berhasil tapi token mobile kosong di sheet  
**Solusi:** Cek permission Apps Script untuk write ke sheet

### Admin bisa login via mobile
**Masalah:** Admin berhasil login via mobile  
**Solusi:** Cek fungsi `handleMobileLogin()`, harus reject jika role !== 'petugas'

---

**File terkait:**
- `docs/appscript/mobile_auth.js` - Autentikasi mobile
- `docs/appscript/mobile_handlers.js` - Handler endpoint mobile
- `docs/appscript/main_handlers.js` - Routing mobile
- `docs/MOBILE_API.md` - Dokumentasi API lengkap
