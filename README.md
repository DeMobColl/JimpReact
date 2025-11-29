# 🏡 Jimpitan App

Aplikasi manajemen Jimpitan (arisan/tabungan komunitas) modern berbasis React dengan integrasi Google Sheets sebagai database. Aplikasi ini dilengkapi dengan fitur scan QR code untuk identifikasi pelanggan, pencatatan transaksi real-time, dan manajemen user berbasis role (Admin & Petugas).

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Panduan Penggunaan](#-panduan-penggunaan)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-faq)

## ✨ Fitur Utama

### Untuk Admin
- 📊 **Dashboard Admin** - Statistik lengkap transaksi dan aktivitas user
- 👥 **Manajemen User** - Tambah, edit, hapus user (admin & petugas)
- 🏠 **Manajemen Customer** - Kelola data pelanggan dengan QR code unik
- 📜 **Riwayat Lengkap** - Lihat semua transaksi dari semua petugas
- ⚙️ **Konfigurasi Sistem** - Atur nominal default, akses petugas, dll
- 📤 **Export Data** - Export ke Excel/PDF untuk pelaporan

### Untuk Petugas
- 📱 **Scan QR Code** - Scan QR pelanggan untuk identifikasi cepat
- 💰 **Input Transaksi** - Catat transaksi jimpitan dengan mudah
- 📋 **Riwayat Pribadi** - Lihat transaksi yang dicatat sendiri
- 🌙 **Dark Mode** - Mode gelap untuk kenyamanan mata

### Fitur Umum
- 🔐 **Autentikasi Aman** - Login dengan username/password, token-based auth
- 📱 **Responsive Design** - Tampilan optimal di desktop dan mobile
- ⚡ **Offline-First** - Cache data untuk performa lebih cepat
- 🔄 **Auto-Retry** - Retry otomatis jika request gagal
- 🎨 **Modern UI** - Antarmuka modern dengan Tailwind CSS

### 📱 Progressive Web App (PWA)
- 📥 **Installable** - Install ke home screen Android/iOS/Desktop
- ⚡ **Fast Loading** - Service worker caching untuk load super cepat
- 🔌 **Offline Support** - Bekerja tanpa koneksi internet
- 🎯 **App Shortcuts** - Quick access ke Scan QR dan History
- 🔔 **Update Notification** - Notifikasi otomatis saat ada update

## 🛠 Teknologi

### Frontend
- **React 18** - Library UI modern
- **Vite 6** - Build tool super cepat
- **React Router v7** - Routing & navigasi
- **Tailwind CSS 3** - Styling utility-first
- **html5-qrcode** - QR code scanner
- **qrcode.react** - QR code generator
- **ExcelJS & jsPDF** - Export data

### Backend
- **Google Apps Script** - Serverless backend
- **Google Sheets** - Database spreadsheet

## 📦 Persyaratan Sistem

### Development
- **Node.js** - v20.19.0 atau v22.12.0 ke atas
- **npm** - v9 ke atas (biasanya bundled dengan Node.js)
- **Browser Modern** - Chrome, Firefox, Edge, Safari (versi terbaru)
- **Akun Google** - Untuk Google Apps Script & Google Sheets

### Production
- **Web Server** - Nginx, Apache, atau hosting static (Netlify, Vercel)
- **HTTPS** - Wajib untuk QR scanner (akses kamera)

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd JimpReact
```

### 2. Install Dependencies

```bash
npm install
```

Proses ini akan menginstall semua dependencies yang diperlukan (~200MB).

### 3. Setup Google Apps Script Backend

#### A. Buat Google Sheets Database

1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru bernama **"Jimpitan Database"**
3. Buat 5 sheet dengan nama:
   - `Users` - Data pengguna
   - `Customers` - Data pelanggan
   - `History` - Riwayat transaksi
   - `Config` - Konfigurasi sistem
   - `Sessions` - Data session login

#### B. Setup Sheet Structure

**Sheet: Users**
| ID | Nama | Role | Username | PasswordHash | Token | TokenExpiry | LastLogin |
|----|------|------|----------|--------------|-------|-------------|-----------|

**Sheet: Customers**
| ID | Blok | Nama | QRHash | CreatedAt |
|----|------|------|--------|-----------|

**Sheet: History**
| TXID | CustomerID | Blok | Nama | Nominal | UserID | Petugas | Timestamp |
|------|------------|------|------|---------|--------|---------|-----------|

**Sheet: Config**
| Key | Value |
|-----|-------|
| nominalDefault | 2000 |
| allowPetugasWebLogin | TRUE |
| configPassword | (hash password) |

**Sheet: Sessions**
| SessionID | UserID | Token | CreatedAt | ExpiresAt |
|-----------|--------|-------|-----------|-----------|

#### C. Deploy Google Apps Script

1. Di Google Sheets, klik **Extensions** → **Apps Script**
2. Hapus kode default, copy-paste semua file dari folder `docs/appscript/`:
   - `utils.js`
   - `auth.js`
   - `crud.js`
   - `customers.js`
   - `history.js`
   - `submit.js`
   - `config.js`
   - `main_handlers.js`

3. **Deploy sebagai Web App:**
   - Klik **Deploy** → **New Deployment**
   - Pilih type: **Web app**
   - Description: "Jimpitan API v1"
   - Execute as: **Me**
   - Who has access: **Anyone** (important!)
   - Klik **Deploy**
   - **Copy Deployment URL** (akan digunakan di langkah berikutnya)

Format URL: `https://script.google.com/macros/s/AKfycby.../exec`

### 4. Buat User Admin Pertama

Setelah deploy, buat user admin pertama secara manual di sheet `Users`:

```
ID: USR-001
Nama: Admin
Role: admin
Username: admin
PasswordHash: (kosongkan dulu)
```

Lalu jalankan function `migratePasswordsToHash()` dari Apps Script editor untuk hash password default.

## ⚙️ Konfigurasi

### Environment Variables

Buat file `.env` di root project:

```env
# Google Apps Script Deployment URL (WAJIB)
VITE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

# Request Configuration (Opsional)
VITE_JSONP_TIMEOUT_MS=15000
VITE_REQUEST_MAX_CONCURRENT=3
VITE_REQUEST_CACHE_TTL_MS=30000
VITE_REQUEST_RETRY_MAX=3
VITE_REQUEST_RETRY_BASE_DELAY_MS=1000

# Developer Contact Information (Opsional)
VITE_DEV_WHATSAPP=6281234567890
VITE_DEV_EMAIL=admin@jimpitan.com
```

⚠️ **PENTING**: 
- Ganti `YOUR_DEPLOYMENT_ID` dengan ID deployment Anda dari langkah sebelumnya!
- Ganti nomor WhatsApp dan email dengan kontak developer Anda
- Jika `VITE_DEV_WHATSAPP` atau `VITE_DEV_EMAIL` tidak diisi, tombol kontak tidak akan muncul di halaman Home

### Konfigurasi Sistem (Via UI)

Setelah login sebagai admin, buka menu **Konfigurasi** untuk mengatur:

- **Nominal Default** - Nominal transaksi default
- **Akses Petugas Web** - Izinkan petugas login via web
- **Password Konfigurasi** - Password proteksi untuk settings

## 🎯 Menjalankan Aplikasi

### Development Mode

```bash
npm run dev
```

Aplikasi akan terbuka otomatis di `http://localhost:3000`

### Production Build

```bash
npm run build
```

File production akan ada di folder `dist/`

### Preview Production Build

```bash
npm run preview
```

## 📖 Panduan Penggunaan

### Login Pertama Kali

1. Buka aplikasi di browser
2. Login dengan kredensial admin:
   - Username: `admin`
   - Password: `admin123` (atau sesuai yang di-setup)
3. **Segera ganti password** setelah login pertama!

### Untuk Admin

#### 1. Menambah User Baru

1. Klik menu **User**
2. Klik tombol **+ Tambah User**
3. Isi form:
   - Nama lengkap
   - Username (unik)
   - Password
   - Role (Admin/Petugas)
4. Klik **Simpan**

#### 2. Menambah Customer

1. Klik menu **Customers**
2. Klik tombol **+ Tambah Customer**
3. Isi:
   - Blok/Nomor rumah
   - Nama lengkap
4. Klik **Simpan**
5. **QR Code otomatis di-generate** - bisa diprint atau di-scan langsung

#### 3. Melihat Riwayat Transaksi

1. Klik menu **Riwayat**
2. Gunakan filter:
   - **Tanggal** - Filter berdasarkan periode
   - **Petugas** - Filter transaksi petugas tertentu
   - **Customer** - Cari transaksi customer tertentu
3. Klik **Export** untuk download Excel/PDF

#### 4. Mengelola Konfigurasi

1. Klik menu **Konfigurasi**
2. Masukkan **Config Password** untuk akses
3. Ubah setting yang diperlukan:
   - Nominal default transaksi
   - Toggle akses petugas web
4. Klik **Simpan Perubahan**

### Untuk Petugas

#### 1. Scan QR & Input Transaksi

1. Klik menu **Scan QR**
2. **Izinkan akses kamera** saat diminta browser
3. Arahkan kamera ke QR code customer
4. Setelah terdeteksi, otomatis pindah ke form input
5. Isi nominal (atau gunakan nominal default)
6. Klik **Submit Transaksi**
7. Transaksi berhasil dicatat! ✅

#### 2. Input Manual (Tanpa QR)

1. Klik menu **Submit**
2. Pilih customer dari dropdown
3. Isi nominal
4. Klik **Submit**

#### 3. Lihat Riwayat Transaksi Sendiri

1. Klik menu **Riwayat Saya**
2. Lihat semua transaksi yang pernah dicatat
3. Filter berdasarkan tanggal jika perlu

### Tips Penggunaan

✅ **Gunakan QR Scanner** untuk input lebih cepat dan akurat
✅ **Dark Mode** tersedia di tombol bulan/matahari (pojok kanan atas)
✅ **Logout otomatis** setelah 7 hari atau jika token expired
✅ **Cache otomatis** mempercepat loading data yang sering diakses
✅ **Retry otomatis** jika koneksi terputus sementara
✅ **Install sebagai App** - Klik banner "Install App" untuk pengalaman native

### 📱 Install Aplikasi (PWA)

Aplikasi ini bisa diinstall ke home screen untuk pengalaman seperti native app:

**Android Chrome:**
1. Buka aplikasi di Chrome
2. Klik banner "Install App" yang muncul, ATAU
3. Menu (⋮) → "Add to Home screen"
4. Confirm install

**iOS Safari:**
1. Buka aplikasi di Safari
2. Tap Share button (□↑)
3. Scroll → "Add to Home Screen"
4. Tap "Add"

**Desktop Chrome/Edge:**
1. Klik icon install di address bar, ATAU
2. Klik banner "Install App"
3. Confirm install

**Keuntungan Install:**
- ⚡ Loading lebih cepat (cached)
- 🔌 Bekerja offline
- 📱 Tampilan fullscreen tanpa browser UI
- 🚀 Quick access dari home screen
- 🎯 App shortcuts langsung ke Scan QR atau History

📖 **Panduan lengkap:** Lihat [docs/PWA_GUIDE.md](docs/PWA_GUIDE.md)

## 🌐 Deployment

### Deploy ke Netlify

1. Push code ke GitHub repository
2. Login ke [Netlify](https://netlify.com)
3. Klik **New site from Git**
4. Pilih repository
5. Build settings:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
6. **Environment variables:**
   - Tambahkan `VITE_SCRIPT_URL` dengan deployment URL Apps Script
7. Klik **Deploy site**

### Deploy ke Vercel

```bash
npm install -g vercel
vercel login
vercel
```

Ikuti prompt, pastikan set environment variable `VITE_SCRIPT_URL`.

### Deploy ke VPS/Server

1. Build aplikasi:
   ```bash
   npm run build
   ```

2. Upload folder `dist/` ke server

3. Setup Nginx config:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       root /var/www/jimpitan/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. Setup SSL dengan Let's Encrypt (wajib untuk QR scanner):
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

## 🔧 Troubleshooting

### QR Scanner Tidak Bekerja

**Penyebab:** Browser memblokir akses kamera
**Solusi:**
- Pastikan menggunakan **HTTPS** (bukan HTTP)
- Atau gunakan `localhost` untuk development
- Check permission kamera di browser settings
- Coba browser lain (Chrome recommended)

### Error: "VITE_SCRIPT_URL tidak di-set"

**Penyebab:** Environment variable tidak terkonfigurasi
**Solusi:**
1. Pastikan file `.env` ada di root project
2. Isi `VITE_SCRIPT_URL` dengan deployment URL yang benar
3. Restart dev server (`npm run dev`)

### Login Gagal: "Token expired"

**Penyebab:** Token login sudah kedaluwarsa (>7 hari)
**Solusi:**
- Logout dan login ulang
- Token akan di-refresh otomatis

### Transaksi Tidak Muncul di History

**Penyebab:** Cache belum di-refresh
**Solusi:**
- Tunggu 30 detik (cache TTL)
- Atau refresh halaman manual (F5)
- Atau logout & login kembali (clear all cache)

### Error: "Callback not defined" (JSONP)

**Penyebab:** Request timeout atau blocked
**Solusi:**
- Check koneksi internet
- Pastikan Google Apps Script deployment masih aktif
- Cek CORS settings di Apps Script (harus "Anyone")

### Performance Lambat

**Optimasi:**
- Aktifkan request cache (default: ON)
- Kurangi `VITE_REQUEST_MAX_CONCURRENT` jika koneksi lambat
- Gunakan filter tanggal di History untuk load data lebih sedikit
- Clear browser cache jika terlalu besar
- **Install sebagai PWA** untuk caching optimal dan performa lebih cepat

### PWA Tidak Bisa Diinstall

**Penyebab:**
- PWA criteria belum terpenuhi
- Icons belum di-generate
- Sudah pernah dismiss install prompt
- Browser tidak support PWA

**Solusi:**
1. Generate icons: `npm run generate-icons`
2. Build production: `npm run build`
3. Deploy dengan HTTPS (wajib untuk mobile)
4. Test dengan Lighthouse: DevTools → Lighthouse → PWA
5. Clear browser data & coba Incognito mode
6. Gunakan Chrome/Edge (Safari iOS support terbatas)

📖 **PWA Troubleshooting lengkap:** Lihat [docs/PWA_GUIDE.md](docs/PWA_GUIDE.md#troubleshooting)

## ❓ FAQ

### Q: Apakah data aman disimpan di Google Sheets?
**A:** Ya, data di-encrypt dengan:
- Password di-hash menggunakan SHA-256
- Token session temporary (7 hari expiry)
- Akses Google Sheets hanya untuk owner
- HTTPS untuk semua komunikasi

### Q: Berapa banyak user/customer yang bisa dikelola?
**A:** Google Sheets mendukung hingga:
- 10 juta cells per spreadsheet
- ~50.000 rows per sheet (praktis)
- Recommend: <5.000 customer untuk performa optimal

### Q: Apakah bisa offline?
**A:** Ya, dengan PWA:
- **Static pages** di-cache untuk akses offline
- **Data history** tersimpan di cache (TTL 30 detik)
- Submit transaksi **butuh koneksi internet** (POST tidak di-cache)
- Install sebagai PWA untuk offline experience maksimal
- Rencana: background sync untuk offline submissions di v2.0

### Q: Bagaimana cara backup data?
**A:** 3 cara:
1. **Auto Google Drive backup** (fitur Google Sheets)
2. **Export manual** via menu History → Export Excel
3. **Apps Script backup** - buat script scheduled backup

### Q: Bisakah export data untuk keperluan laporan?
**A:** Ya! Menu History memiliki fitur:
- Export to Excel (.xlsx)
- Export to PDF
- Print-friendly view
- Filter berdasarkan periode & petugas

### Q: Apakah bisa custom nominal per customer?
**A:** Saat ini nominal di-input manual per transaksi. Custom nominal default per customer sedang dalam development roadmap.

### Q: Bagaimana cara menghapus transaksi yang salah?
**A:** 
- **Admin:** Bisa hapus transaksi dari menu Riwayat
- **Petugas:** Bisa hapus transaksi sendiri dari Riwayat Saya
- Hapus permanen dari sheet (tidak ada soft-delete)

## 📡 API Documentation

Dokumentasi lengkap API untuk integrasi mobile app:

### Web API (Token-based)
- 🔐 Authentication: Login sekali, gunakan token 7 hari
- 📊 JSONP requests untuk CORS workaround
- 📖 Lihat: `.github/copilot-instructions.md`

### Mobile API (Stateless)
- 📱 Stateless auth: Username + password di setiap request
- 🔄 POST requests dengan JSON response
- 📖 **Dokumentasi:** `docs/API_MOBILE_GUIDE.md`
- 📦 **Postman Collection:** `docs/Jimpitan_API.postman_collection.json`
- 🧪 **Testing Guide:** `docs/TESTING_BY_ROLE.md`

**Quick Links:**
- [Mobile API Guide](docs/API_MOBILE_GUIDE.md) - Complete endpoint documentation
- [Testing by Role](docs/TESTING_BY_ROLE.md) - Step-by-step testing scenarios
- [PWA Guide](docs/PWA_GUIDE.md) - Progressive Web App setup & testing
- [Postman Collection](docs/Jimpitan_API.postman_collection.json) - Import & test immediately
- [Documentation Index](docs/INDEX.md) - All documentation hub

### Endpoint Summary

**Admin Endpoints:**
- User CRUD (create, update, delete)
- Customer management
- View all transactions
- System configuration
- Bulk operations

**Petugas Endpoints:**
- QR scan & submit transaction
- View own transactions only
- Delete own transactions
- Bulk submit (offline mode)

## 📞 Support & Kontribusi

### Menemukan Bug?
Laporkan via GitHub Issues dengan detail:
- Browser & versi
- Screenshot error
- Steps to reproduce

### Ingin Kontribusi?
1. Fork repository
2. Buat branch fitur baru
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## 📄 License

MIT License - Bebas digunakan untuk keperluan komersial maupun non-komersial.

## 🎉 Credits

Dikembangkan untuk mempermudah pengelolaan jimpitan komunitas modern dengan teknologi terkini.

---

**Happy Jimpitan! 🏡💰**
