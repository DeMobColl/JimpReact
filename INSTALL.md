# 📖 Panduan Instalasi Cepat - Jimpitan App

Panduan step-by-step untuk instalasi dan setup aplikasi Jimpitan dari nol sampai siap digunakan.

## ⏱️ Estimasi Waktu: 30-45 menit

---

## Langkah 1: Persiapan (5 menit)

### Yang Anda Butuhkan:
- ✅ Komputer dengan Node.js v20 atau lebih baru
- ✅ Akun Google (untuk Google Apps Script & Sheets)
- ✅ Browser modern (Chrome/Firefox/Edge)
- ✅ Koneksi internet stabil

### Cek Node.js:
```bash
node --version
# Harus menampilkan v20.x.x atau lebih baru
```

Belum punya Node.js? Download di: https://nodejs.org/

---

## Langkah 2: Download & Install Project (5 menit)

### A. Clone atau Download Project

**Opsi 1 - Git Clone:**
```bash
git clone <repository-url>
cd JimpReact
```

**Opsi 2 - Download ZIP:**
1. Download ZIP dari repository
2. Extract ke folder pilihan Anda
3. Buka folder di terminal/command prompt

### B. Install Dependencies

```bash
npm install
```

⏳ Proses ini membutuhkan waktu 2-5 menit tergantung koneksi internet.

---

## Langkah 3: Setup Google Sheets Database (10 menit)

### A. Buat Google Sheets Baru

1. Buka https://sheets.google.com
2. Klik **+ Blank** untuk spreadsheet baru
3. Rename jadi **"Jimpitan Database"**

### B. Buat 5 Sheet dengan Header

**Sheet 1: Users**
1. Rename "Sheet1" jadi "Users"
2. Isi baris pertama (header):
   ```
   A1: ID
   B1: Nama
   C1: Role
   D1: Username
   E1: PasswordHash
   F1: Token
   G1: TokenExpiry
   H1: LastLogin
   ```

**Sheet 2: Customers**
1. Klik **+** untuk sheet baru, rename jadi "Customers"
2. Header:
   ```
   A1: ID
   B1: Blok
   C1: Nama
   D1: QRHash
   E1: CreatedAt
   ```

**Sheet 3: History**
1. Buat sheet baru "History"
2. Header:
   ```
   A1: TXID
   B1: CustomerID
   C1: Blok
   D1: Nama
   E1: Nominal
   F1: UserID
   G1: Petugas
   H1: Timestamp
   ```

**Sheet 4: Config**
1. Buat sheet baru "Config"
2. Header:
   ```
   A1: Key
   B1: Value
   ```
3. Isi baris 2-4:
   ```
   A2: nominalDefault          B2: 2000
   A3: allowPetugasWebLogin    B3: TRUE
   A4: configPassword          B4: (kosongkan dulu)
   ```

**Sheet 5: Sessions**
1. Buat sheet baru "Sessions"
2. Header:
   ```
   A1: SessionID
   B1: UserID
   C1: Token
   D1: CreatedAt
   E1: ExpiresAt
   ```

### C. Buat Admin User Pertama

Di sheet **Users**, isi baris 2:
```
A2: USR-001
B2: Admin
C2: admin
D2: admin
E2: (kosongkan)
F2: (kosongkan)
G2: (kosongkan)
H2: (kosongkan)
```

---

## Langkah 4: Setup Google Apps Script (15 menit)

### A. Buka Apps Script Editor

1. Di Google Sheets, klik menu **Extensions** → **Apps Script**
2. Editor baru akan terbuka di tab baru

### B. Copy Script Files

1. **Hapus** semua kode default yang ada
2. Buka folder `docs/appscript/` di project Anda
3. Copy-paste **semua file** ke Apps Script dengan urutan:

#### File 1: utils.js
- Klik **+** di sebelah Files → **Script**
- Rename jadi `utils`
- Copy-paste isi file `docs/appscript/utils.js`

#### File 2: auth.js
- Buat script baru, rename `auth`
- Copy-paste isi `docs/appscript/auth.js`

#### File 3: crud.js
- Buat script baru, rename `crud`
- Copy-paste isi `docs/appscript/crud.js`

#### File 4: customers.js
- Buat script baru, rename `customers`
- Copy-paste isi `docs/appscript/customers.js`

#### File 5: history.js
- Buat script baru, rename `history`
- Copy-paste isi `docs/appscript/history.js`

#### File 6: submit.js
- Buat script baru, rename `submit`
- Copy-paste isi `docs/appscript/submit.js`

#### File 7: config.js
- Buat script baru, rename `config`
- Copy-paste isi `docs/appscript/config.js`

#### File 8: main_handlers.js
- Buat script baru, rename `main_handlers`
- Copy-paste isi `docs/appscript/main_handlers.js`

### C. Hash Password Admin

1. Di Apps Script editor, klik file `auth.js`
2. Cari function `migratePasswordsToHash()`
3. Pilih function ini di dropdown (di samping tombol Run)
4. Klik **Run**
5. **Authorize** saat diminta (klik Review Permissions → pilih akun → Allow)
6. Tunggu sampai selesai
7. Cek sheet Users - kolom PasswordHash sekarang terisi

### D. Deploy sebagai Web App

1. Klik tombol **Deploy** (pojok kanan atas) → **New deployment**
2. Klik ⚙️ icon di samping "Select type" → pilih **Web app**
3. Isi form:
   - **Description:** "Jimpitan API v1.0"
   - **Execute as:** Me (your_email@gmail.com)
   - **Who has access:** **Anyone** ⚠️ PENTING!
4. Klik **Deploy**
5. **COPY URL** yang muncul (format: `https://script.google.com/macros/s/AKfycby.../exec`)
6. Simpan URL ini - akan digunakan di langkah berikutnya!

---

## Langkah 5: Konfigurasi Frontend (5 menit)

### A. Buat File .env

Di root folder project (JimpReact), buat file baru bernama `.env`:

**Windows (PowerShell):**
```powershell
New-Item -Path .env -ItemType File
notepad .env
```

**Mac/Linux:**
```bash
touch .env
nano .env
```

### B. Isi File .env

Paste konfigurasi berikut, **GANTI URL** dengan deployment URL Anda:

```env
# WAJIB: Ganti dengan URL deployment Apps Script Anda!
VITE_SCRIPT_URL=https://script.google.com/macros/s/AKfycby_GANTI_INI_/exec

# Opsional - biarkan default
VITE_JSONP_TIMEOUT_MS=15000
VITE_REQUEST_MAX_CONCURRENT=3
VITE_REQUEST_CACHE_TTL_MS=30000

# Opsional - Info kontak developer (akan muncul di halaman Home untuk Admin)
VITE_DEV_WHATSAPP=6281234567890
VITE_DEV_EMAIL=admin@jimpitan.com
```

⚠️ **PENTING:** 
- Pastikan `VITE_SCRIPT_URL` sudah benar!
- `VITE_DEV_WHATSAPP` dan `VITE_DEV_EMAIL` opsional - jika tidak diisi, tombol kontak tidak akan muncul

Save dan tutup file.

---

## Langkah 6: Jalankan Aplikasi! 🚀

### Development Mode

```bash
npm run dev
```

Browser akan terbuka otomatis di `http://localhost:3000`

### Login Pertama Kali

```
Username: admin
Password: admin123
```

(Password default dari hasil hash - atau sesuai yang Anda setup)

---

## ✅ Verifikasi Instalasi

Cek apakah semua bekerja dengan baik:

1. ✅ **Login berhasil?** → Auth OK
2. ✅ **Bisa tambah customer?** → Customer management OK
3. ✅ **QR code ter-generate?** → QR system OK
4. ✅ **Scan QR berhasil?** → Scanner OK (butuh HTTPS di production)
5. ✅ **Submit transaksi berhasil?** → Transaction OK
6. ✅ **Data muncul di History?** → History OK

Jika semua ✅, **SELAMAT! Instalasi berhasil!** 🎉

---

## 🔧 Troubleshooting Instalasi

### Error: "Cannot find module"
```bash
# Hapus node_modules dan reinstall
rm -rf node_modules package-lock.json
npm install
```

### Error: "VITE_SCRIPT_URL tidak di-set"
- Cek file `.env` ada di root folder (sejajar dengan `package.json`)
- Cek isi `.env` sudah benar (tidak ada typo)
- Restart dev server: `Ctrl+C` lalu `npm run dev` lagi

### Apps Script Error: "ReferenceError: ... is not defined"
- Pastikan **semua 8 file** sudah di-copy ke Apps Script
- Urutan file tidak masalah, tapi semua harus ada
- Cek tidak ada typo saat copy-paste

### Authorization Error saat Deploy
- Klik **Review Permissions**
- Pilih akun Google Anda
- Klik **Advanced** → **Go to ... (unsafe)** → **Allow**
- Ini normal untuk Apps Script project pribadi

### QR Scanner tidak muncul
- Gunakan HTTPS atau localhost (HTTP biasa akan diblock browser)
- Allow permission kamera saat browser meminta
- Coba browser lain (Chrome paling reliable)

---

## 📚 Langkah Selanjutnya

Setelah instalasi berhasil:

1. **Ganti password admin** (menu Konfigurasi)
2. **Tambah petugas** (menu User)
3. **Tambah customer** (menu Customers)
4. **Print QR code** customer untuk di-tempel
5. **Test scan & submit** transaksi
6. **Setup production deployment** jika perlu

---

## 🆘 Butuh Bantuan?

- 📖 Baca `README.md` untuk panduan lengkap
- 🐛 Cek Troubleshooting section
- 💬 Buka GitHub Issues untuk laporan bug
- 📧 Kontak developer untuk support

---

**Selamat menggunakan Jimpitan App! 🏡💰**
