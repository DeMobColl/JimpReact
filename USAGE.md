# 📱 Panduan Penggunaan Jimpitan App

Panduan lengkap untuk menggunakan aplikasi Jimpitan sehari-hari.

---

## 🔐 Login & Logout

### Login

1. Buka aplikasi di browser
2. Masukkan **Username** dan **Password**
3. Klik **Login**
4. Anda akan diarahkan ke halaman Home

**Tips:**
- Password bersifat **case-sensitive** (huruf besar/kecil dibedakan)
- Jika lupa password, hubungi admin untuk reset
- Token login bertahan 7 hari - setelah itu harus login ulang

### Logout

Klik icon **Logout** (🚪) di pojok kanan atas navbar.

**Kapan harus logout?**
- Setelah selesai bekerja
- Saat menggunakan komputer/HP bersama
- Jika ingin ganti akun

---

## 👤 Panduan untuk Admin

### 1. Dashboard (Home)

Setelah login, Anda akan melihat:
- 📊 **Statistik hari ini**: Total transaksi, total nominal
- 👥 **User aktif**: Berapa petugas yang login hari ini
- 📈 **Grafik**: Tren transaksi mingguan/bulanan
- 🔔 **Notifikasi**: Update penting sistem

### 2. Manajemen User

#### Menambah User Baru

1. Klik menu **User** di navbar
2. Klik tombol **+ Tambah User**
3. Isi form:
   - **Nama Lengkap**: Nama lengkap user
   - **Username**: Username untuk login (huruf kecil, no space)
   - **Password**: Password minimal 6 karakter
   - **Role**: Pilih Admin atau Petugas
     - **Admin**: Akses penuh ke semua fitur
     - **Petugas**: Hanya bisa scan QR & input transaksi
4. Klik **Simpan**

**Tips:**
- Username harus unik (tidak boleh sama)
- Gunakan password yang mudah diingat tapi aman
- Catat username & password untuk diberikan ke user bersangkutan

#### Edit User

1. Pada list user, klik tombol **Edit** (✏️) di user yang ingin diedit
2. Ubah data yang diperlukan
3. **Password:** Kosongkan jika tidak ingin ganti password
4. Klik **Update**

#### Hapus User

1. Klik tombol **Hapus** (🗑️) di user yang ingin dihapus
2. Konfirmasi penghapusan
3. User dan data login-nya akan terhapus

⚠️ **PERHATIAN:** 
- Hapus user **TIDAK** menghapus transaksi yang pernah dicatat
- Transaksi lama tetap tercatat atas nama user tersebut
- Tidak bisa menghapus user sedang login

### 3. Manajemen Customer

#### Menambah Customer Baru

1. Klik menu **Customers**
2. Klik tombol **+ Tambah Customer**
3. Isi form:
   - **Blok/No Rumah**: Nomor blok atau nomor rumah
   - **Nama Lengkap**: Nama customer
4. Klik **Simpan**

**QR Code otomatis di-generate!** ✨

#### Melihat & Print QR Code

Setelah customer dibuat:
1. QR code langsung tampil di card customer
2. Klik **Lihat QR** untuk view fullscreen
3. Klik **Print QR** untuk print
4. Atau screenshot QR code dari layar

**Tips Print QR:**
- Print di kertas A4 atau sticker
- Pastikan QR jelas dan tidak blur
- Tempelkan di tempat yang mudah di-scan (pintu rumah, dinding)
- Jangan dilipat atau dicoret (QR tidak akan terbaca)

#### Edit Customer

1. Klik tombol **Edit** pada customer yang ingin diubah
2. Edit blok atau nama
3. Klik **Update**

**Catatan:** QR Hash **TIDAK BERUBAH** saat edit customer

#### Hapus Customer

1. Klik tombol **Hapus** pada customer
2. Konfirmasi penghapusan

⚠️ **PERHATIAN:**
- Hapus customer **TIDAK** menghapus riwayat transaksi
- QR code customer akan invalid setelah dihapus
- Tidak bisa di-scan lagi

#### Lihat History Customer

1. Klik tombol **History** (📋) pada customer
2. Akan muncul modal dengan semua transaksi customer tersebut
3. Lihat detail: tanggal, petugas, nominal

### 4. Riwayat Transaksi (History)

#### Melihat Semua Transaksi

1. Klik menu **Riwayat**
2. Anda akan melihat tabel semua transaksi dari semua petugas

#### Filter Transaksi

**Filter by Tanggal:**
1. Pilih **Tanggal Mulai** dan **Tanggal Akhir**
2. Klik **Filter** atau **Hari Ini** / **Minggu Ini** / **Bulan Ini**

**Filter by Petugas:**
1. Pilih nama petugas dari dropdown
2. Hanya transaksi petugas tersebut yang tampil

**Filter by Customer:**
1. Ketik nama customer di search box
2. Hasil akan filter otomatis

**Gabungan Filter:**
- Bisa kombinasi filter tanggal + petugas + customer
- Klik **Reset** untuk clear semua filter

#### Export Data

**Export ke Excel:**
1. Klik tombol **Export Excel** 📊
2. File `.xlsx` akan otomatis download
3. Buka dengan Microsoft Excel / Google Sheets / LibreOffice

**Export ke PDF:**
1. Klik tombol **Export PDF** 📄
2. File PDF akan otomatis download
3. Bisa diprint atau dishare

**Isi Export:**
- Semua data sesuai filter yang aktif
- Header: Tanggal export, periode data
- Footer: Total transaksi & total nominal
- Format tabel rapi dan print-friendly

#### Hapus Transaksi

1. Klik tombol **Hapus** (🗑️) di transaksi yang ingin dihapus
2. Konfirmasi penghapusan
3. Transaksi akan terhapus permanen dari database

⚠️ **Hati-hati:** Penghapusan tidak bisa di-undo!

### 5. Konfigurasi Sistem

#### Akses Konfigurasi

1. Klik menu **Konfigurasi**
2. Masukkan **Config Password**
3. Klik **Verifikasi**

**Lupa Config Password?**
- Check di Google Sheets → Sheet "Config" → baris "configPassword"
- Atau reset manual di Apps Script

#### Setting yang Bisa Diubah

**1. Nominal Default**
- Nominal yang otomatis terisi saat input transaksi
- Petugas tetap bisa ubah manual saat input
- Format: angka tanpa titik/koma (contoh: `2000`)

**2. Akses Petugas Web**
- Toggle ON/OFF: Izinkan petugas login via web
- OFF: Petugas tidak bisa login (hanya admin)
- Berguna saat maintenance atau audit

**3. Config Password**
- Password untuk proteksi halaman konfigurasi
- Klik **Ganti Password**
- Masukkan password lama & password baru
- Klik **Update**

**Setelah Ubah Setting:**
- Klik **Simpan Perubahan**
- Setting langsung aktif
- Tidak perlu reload halaman

---

## 👷 Panduan untuk Petugas

### 1. Scan QR & Input Transaksi

#### Via QR Scanner (Recommended)

1. Klik menu **Scan QR**
2. **Allow** akses kamera saat browser meminta
3. Arahkan kamera ke QR code customer
4. Tunggu sampai QR terdeteksi (biasanya 1-2 detik)
5. Otomatis pindah ke halaman Submit
6. **Cek data customer** (nama & blok sudah otomatis terisi)
7. Isi **Nominal** (atau gunakan nominal default)
8. Klik **Submit Transaksi**
9. ✅ Transaksi berhasil dicatat!

**Tips Scan QR:**
- Pastikan cahaya cukup terang
- Jarak ideal: 10-20 cm dari kamera
- QR harus lurus (tidak miring)
- Tunggu sampai kotak hijau muncul
- Jika gagal, coba scan ulang

**Troubleshooting Scan:**
- **Kamera tidak muncul:** Check permission browser
- **QR tidak terdeteksi:** Pastikan QR tidak blur/rusak
- **"Customer tidak ditemukan":** QR invalid atau customer sudah dihapus

#### Input Manual (Tanpa Scan)

Jika QR rusak atau tidak bisa scan:

1. Klik menu **Submit** (atau dari Scan QR klik "Input Manual")
2. **Pilih Customer** dari dropdown
   - Ketik nama untuk search cepat
3. Isi **Nominal**
4. Klik **Submit Transaksi**

### 2. Lihat Riwayat Transaksi Sendiri

#### My History

1. Klik menu **Riwayat Saya**
2. Anda akan melihat semua transaksi yang **pernah Anda catat**

**Fitur:**
- Filter by tanggal
- Search by nama customer
- Lihat total transaksi & nominal Anda
- Hapus transaksi (jika salah input)

#### Hapus Transaksi Sendiri

1. Klik tombol **Hapus** pada transaksi
2. Konfirmasi
3. Transaksi terhapus

**Catatan:**
- Hanya bisa hapus transaksi sendiri
- Tidak bisa hapus transaksi petugas lain
- Admin bisa hapus semua transaksi

### 3. Tips untuk Petugas

✅ **DO:**
- Scan QR untuk akurasi & kecepatan
- Cek nama customer sebelum submit
- Logout setelah selesai (jika HP/PC sharing)
- Lapor admin jika ada masalah

❌ **DON'T:**
- Jangan share password ke orang lain
- Jangan input transaksi palsu
- Jangan hapus transaksi yang sudah benar
- Jangan lupa logout di device bersama

---

## 🎨 Fitur Umum

### Dark Mode (Mode Gelap)

**Aktifkan Dark Mode:**
- Klik icon **Bulan** 🌙 di navbar (pojok kanan atas)
- Tampilan akan berubah jadi tema gelap

**Kembali ke Light Mode:**
- Klik icon **Matahari** ☀️
- Tampilan kembali terang

**Kenapa Dark Mode?**
- Lebih nyaman untuk mata di malam hari
- Hemat baterai (untuk OLED screen)
- Terlihat lebih modern

Setting dark mode tersimpan otomatis - tidak perlu set ulang saat login.

### Tutorial Penggunaan

Bingung cara pakai? Ada tutorial built-in!

1. Klik icon **Buku** 📖 di navbar
2. Atau klik menu **Tutorial**
3. Tutorial interaktif akan muncul
4. Step-by-step dengan gambar

**Tutorial berbeda** untuk Admin & Petugas sesuai role Anda.

### Notifikasi & Toast

Aplikasi akan menampilkan notifikasi pop-up untuk:
- ✅ **Success** (hijau): Aksi berhasil
- ❌ **Error** (merah): Ada error/gagal
- ⚠️ **Warning** (kuning): Peringatan
- ℹ️ **Info** (biru): Informasi umum

Notifikasi otomatis hilang setelah 3-5 detik.

---

## 🔒 Keamanan & Privacy

### Password

**Password yang Baik:**
- Minimal 8 karakter
- Kombinasi huruf + angka
- Jangan gunakan: tanggal lahir, nama, "123456"

**Ganti Password:**
- Admin bisa ganti password user lain
- Petugas hubungi admin untuk ganti password
- Config password diganti via menu Konfigurasi

### Session & Token

- Token login valid 7 hari
- Setelah 7 hari, harus login ulang
- Token di-refresh otomatis jika masih aktif
- Logout menghapus token dari sistem

### Data Privacy

- Data customer & transaksi hanya bisa diakses user yang login
- Google Sheets database hanya bisa diakses owner spreadsheet
- Password di-hash (tidak bisa dilihat plain text)
- Komunikasi via HTTPS (encrypted)

---

## 📊 Shortcut & Tips Produktivitas

### Keyboard Shortcuts

- **Tab**: Pindah antar input field
- **Enter**: Submit form (saat di input terakhir)
- **Esc**: Tutup modal/dialog
- **Ctrl+F**: Search (di halaman History)

### Best Practices

**Untuk Admin:**
- Export data secara rutin (backup)
- Check log aktivitas petugas
- Update konfigurasi saat dibutuhkan
- Print QR customer baru segera

**Untuk Petugas:**
- Input transaksi segera (jangan ditunda)
- Double-check nominal sebelum submit
- Lapor admin jika ada QR rusak
- Logout di device sharing

**Untuk Semua:**
- Gunakan dark mode malam hari
- Manfaatkan filter untuk cari data cepat
- Bookmark aplikasi di browser
- Check history rutin untuk validasi data

---

## ❓ FAQ Penggunaan

### Q: Bisa edit transaksi yang sudah di-submit?
**A:** Tidak bisa edit. Hanya bisa **hapus** lalu input ulang. Ini untuk audit trail.

### Q: Berapa lama cache data tersimpan?
**A:** Cache otomatis expire setelah 30 detik. Untuk data terbaru, bisa manual refresh (F5).

### Q: Bisa input transaksi tanggal kemarin?
**A:** Saat ini tidak bisa. Transaksi selalu tercatat dengan timestamp saat submit. Fitur backdate sedang dikembangkan.

### Q: Maksimal berapa nominal transaksi?
**A:** Tidak ada limit hard-coded. Tapi untuk keamanan, nominal besar (>100.000) akan muncul konfirmasi.

### Q: Bisa input transaksi offline?
**A:** Tidak bisa. Submit transaksi memerlukan koneksi internet. Offline queue akan ada di versi mendatang.

### Q: Dashboard tidak update real-time?
**A:** Dashboard update setiap 30 detik (cache). Untuk update instant, refresh halaman (F5).

### Q: Petugas bisa lihat transaksi petugas lain?
**A:** Tidak. Petugas hanya bisa lihat transaksi sendiri di "Riwayat Saya". Admin bisa lihat semua.

### Q: QR code bisa di-scan berkali-kali?
**A:** Ya! QR code permanent. Bisa di-scan unlimited untuk input transaksi berbeda.

### Q: Apa bedanya "Submit" dengan "Scan QR"?
**A:** 
- **Scan QR:** Otomatis detect customer via QR camera
- **Submit:** Manual pilih customer dari list
- Hasil akhir sama: transaksi tercatat

---

## 🆘 Perlu Bantuan?

**Jika mengalami kendala:**
1. Cek FAQ di atas
2. Lihat Tutorial (icon 📖)
3. Baca Troubleshooting di README.md
4. Hubungi admin sistem Anda
5. Laporkan bug via GitHub Issues

---

**Semoga panduan ini membantu! Happy Jimpitan! 🏡💰**
