# MySQL Schema - Jimpitan Database

## Database: `jimpitan`

Struktur database MySQL yang menggantikan Google Sheets.

---

## 📊 Tables

### 1. `users` - Pengguna Sistem

Menyimpan admin dan petugas yang dapat login ke sistem.

```sql
CREATE TABLE users (
  id VARCHAR(20) PRIMARY KEY,           -- USR-001, USR-002, ...
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'petugas') NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- SHA-256 hash
  token VARCHAR(255) UNIQUE,            -- JWT token
  token_expiry DATETIME,                -- Token expiry time
  last_login DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,                  -- Soft delete
  
  INDEX idx_username (username),
  INDEX idx_token (token),
  INDEX idx_role (role),
  INDEX idx_deleted_at (deleted_at)
);
```

**Penjelasan Kolom:**
- `id`: Unique identifier untuk user (generated format USR-001)
- `role`: Menentukan akses - 'admin' (full access), 'petugas' (limited)
- `password_hash`: SHA-256 hash dari password (tidak pernah simpan plaintext)
- `token`: JWT token untuk authenticated requests
- `token_expiry`: Waktu token akan expire (default 7 hari)
- `deleted_at`: Untuk soft delete (tidak benar-benar hapus dari DB)

**Sample Data:**
```sql
INSERT INTO users (id, name, role, username, password_hash) VALUES
('USR-001', 'Administrator', 'admin', 'admin', 'xxx...hash...xxx'),
('USR-002', 'Petugas A', 'petugas', 'petugas_a', 'xxx...hash...xxx');
```

---

### 2. `customers` - Anggota Jimpitan

Menyimpan data anggota komunitas yang simpan uang (blok & nama).

```sql
CREATE TABLE customers (
  id VARCHAR(20) PRIMARY KEY,           -- CUST-001, CUST-002, ...
  blok VARCHAR(50) NOT NULL,            -- Block/ID number
  nama VARCHAR(255) NOT NULL,           -- Full name
  qr_hash VARCHAR(10) UNIQUE NOT NULL,  -- 10-char QR identifier
  total_setoran DECIMAL(12, 2) DEFAULT 0,   -- Sum of all deposits
  last_transaction DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,                  -- Soft delete
  
  INDEX idx_blok (blok),
  INDEX idx_qr_hash (qr_hash),
  INDEX idx_deleted_at (deleted_at)
);
```

**Penjelasan Kolom:**
- `id`: Unique ID customer (CUST-001, CUST-002, ...)
- `blok`: Nomor blok/rumah (misal: "A1", "B3")
- `nama`: Nama lengkap anggota
- `qr_hash`: Hash untuk QR code scanning (10 karakter)
- `total_setoran`: Total uang yang sudah disimpan (dihitung otomatis)
- `last_transaction`: Waktu transaksi terakhir

**Sample Data:**
```sql
INSERT INTO customers (id, blok, nama, qr_hash) VALUES
('CUST-001', 'A1', 'Budi Santoso', 'a1b2c3d4e5'),
('CUST-002', 'B2', 'Siti Nurhaliza', 'f6g7h8i9j0');
```

---

### 3. `transactions` - Setoran Uang

Menyimpan setiap transaksi setoran anggota.

```sql
CREATE TABLE transactions (
  id VARCHAR(20) PRIMARY KEY,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  customer_id VARCHAR(20) NOT NULL,
  blok VARCHAR(50) NOT NULL,            -- Denormalized untuk cepat
  nama VARCHAR(255) NOT NULL,           -- Denormalized untuk cepat
  nominal DECIMAL(12, 2) NOT NULL,
  user_id VARCHAR(20) NOT NULL,
  petugas VARCHAR(255) NOT NULL,        -- Denormalized staff name
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_customer_id (customer_id),
  INDEX idx_user_id (user_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_customer_timestamp (customer_id, timestamp DESC)
);
```

**Penjelasan Kolom:**
- `id`: Transaction ID (0001, 0002, ...)
- `timestamp`: Server-generated timestamp untuk konsistensi
- `customer_id`: FK ke `customers` table
- `blok`, `nama`: Denormalized data (copy dari customer untuk cepat query)
- `nominal`: Jumlah uang yang disimpan
- `user_id`: FK ke `users` - siapa staff yang mencatat
- `petugas`: Nama staff (denormalized)
- `deleted_at`: Soft delete untuk audit trail

**Sample Data:**
```sql
INSERT INTO transactions (id, customer_id, blok, nama, nominal, user_id, petugas) VALUES
('0001', 'CUST-001', 'A1', 'Budi Santoso', 50000, 'USR-002', 'Petugas A'),
('0002', 'CUST-002', 'B2', 'Siti Nurhaliza', 100000, 'USR-002', 'Petugas A');
```

---

### 4. `sessions` - Session Management

Menyimpan active sessions (optional, untuk token blacklist).

```sql
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at)
);
```

---

### 5. `config` - Konfigurasi Sistem

Menyimpan setting global aplikasi.

```sql
CREATE TABLE config (
  id VARCHAR(50) PRIMARY KEY,
  petugas_web_login_enabled BOOLEAN DEFAULT true,
  mobile_app_version VARCHAR(20),
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Sample:**
```sql
INSERT INTO config (id, petugas_web_login_enabled, mobile_app_version)
VALUES ('default', true, '1.0.0');
```

---

## 🔑 Key Differences from Sheets

| Aspek | Google Sheets | MySQL |
|-------|---------------|-------|
| Storage | Cloud spreadsheet | Local/cloud database |
| Queries | Manual row filtering | SQL with indexes |
| Performance | Slow for large data | Fast with proper indexes |
| Transactions | Not ACID | Full ACID compliance |
| Soft Delete | Manual (row hiding) | `deleted_at` timestamp |
| Backups | Google Drive | Database backups |
| Scaling | Limited | Horizontal scaling |

---

## 📈 Performance Considerations

### Indexes

```sql
-- Frequently queried:
CREATE INDEX idx_users_token_expiry ON users(token, token_expiry);
CREATE INDEX idx_customers_created_at ON customers(created_at DESC);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_customer_timestamp ON transactions(customer_id, timestamp DESC);
```

### Denormalization

Data seperti `blok`, `nama` di table `transactions` adalah denormalized copy. Ini untuk:
- **Speed**: Tidak perlu JOIN untuk display history
- **Audit**: Preserve nilai saat transaksi terjadi (even if customer data berubah)

### Soft Deletes

Menggunakan `deleted_at` bukan `DELETE` untuk:
- **Audit trail**: Bisa lihat semua data termasuk yang dihapus
- **Recovery**: Bisa restore data jika diperlukan
- **Referential integrity**: Tidak break foreign keys

Queries harus selalu filter `WHERE deleted_at IS NULL`.

---

## 🔄 Migration dari Sheets

Script untuk migrasi dari Google Sheets ke MySQL:

```bash
# Export sheets ke CSV
# Jalankan importer:
go run scripts/migrate-from-sheets.go --users=users.csv --customers=customers.csv --transactions=transactions.csv
```

---

## 📋 Backup & Recovery

### Backup
```bash
mysqldump -u jimpitan -p jimpitan > jimpitan_backup.sql
```

### Restore
```bash
mysql -u jimpitan -p jimpitan < jimpitan_backup.sql
```

### Backup otomatis (Cron job)
```bash
# Setiap hari jam 2 AM
0 2 * * * mysqldump -u jimpitan -p$DB_PASS jimpitan | gzip > /backups/jimpitan_$(date +%Y%m%d).sql.gz
```

---

## 🔐 Security

1. **Password**: Selalu hash dengan SHA-256, jangan simpan plaintext
2. **Token**: Use JWT dengan secret key yang kuat
3. **User Permissions**: Implement role-based access control (RBAC)
4. **Soft Deletes**: Jangan benar-benar delete user data untuk audit
5. **Database User**: Berikan privilege minimal yang diperlukan

```sql
-- Example: Database user dengan privilege minimal
CREATE USER 'jimpitan'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON jimpitan.* TO 'jimpitan'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📚 Related Documents

- Backend Setup: `backend-go/README.md`
- Frontend Migration: `docs/GOLANG_MIGRATION.md`
- API Endpoints: `backend-go/README.md#-api-endpoints`
