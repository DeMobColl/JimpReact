# Setup Guide - Jimpitan dengan Backend Go + MySQL

Panduan lengkap setup aplikasi Jimpitan dari scratch dengan backend Go dan database MySQL.

## 📋 Prerequisites

### Installed & Running:
- **Node.js** 18+ dan npm
- **Go** 1.21+
- **MySQL** 8.0+
- **Git**

### Tools (Optional but recommended):
- **Postman** - untuk test API
- **DBeaver** atau **MySQL Workbench** - untuk manage database
- **VSCode** dengan extensions Go dan MySQL

---

## 🔧 Langkah 1: Setup Database MySQL

### 1.1 Login ke MySQL

```bash
mysql -u root -p
# Masukkan password root MySQL
```

### 1.2 Create Database & User

```sql
-- Create database
CREATE DATABASE jimpitan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user dengan password
CREATE USER 'jimpitan'@'localhost' IDENTIFIED BY 'jimpitan123';

-- Grant privileges
GRANT ALL PRIVILEGES ON jimpitan.* TO 'jimpitan'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SHOW GRANTS FOR 'jimpitan'@'localhost';
EXIT;
```

### 1.3 Import Schema

```bash
cd ../jimpitan-backend
mysql -u jimpitan -p jimpitan < migrations/001_initial_schema.sql
mysql -u jimpitan -p jimpitan < migrations/002_add_indexes.sql
# Masukkan password: jimpitan123
```

### 1.4 Verify Database

```bash
mysql -u jimpitan -p jimpitan
SHOW TABLES;
DESC users;
DESC customers;
DESC transactions;
EXIT;
```

---

## 🚀 Langkah 2: Setup Backend Go

### 2.1 Navigate to Backend

```bash
cd ../jimpitan-backend
```

### 2.2 Setup Environment

```bash
cp .env.example .env
```

Edit `.env` (sesuaikan dengan setup MySQL Anda):
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=jimpitan
DB_PASSWORD=jimpitan123
DB_NAME=jimpitan

PORT=8080
ENV=development

JWT_SECRET=your-super-secret-key-change-this-in-production-12345
JWT_EXPIRY_HOURS=168

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 2.3 Download Dependencies

```bash
go mod download
go mod tidy
```

### 2.4 Build & Run

**Development (Terminal 1):**
```bash
make dev
# atau manual:
go run cmd/server/main.go
```

**Production:**
```bash
make build
make run
```

### 2.5 Verify Backend Running

```bash
# Test health check
curl http://localhost:8080/api/health

# Expected response:
# {"status":"success","message":"Jimpitan App API Active","data":{...}}
```

---

## 💻 Langkah 3: Setup Frontend

### 3.1 Navigate to Frontend

```bash
cd ..
# Anda sekarang di root JimpReact directory
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Setup Environment

```bash
cp .env.example .env
```

Edit `.env` untuk backend Go:
```env
VITE_API_URL=http://localhost:8080
VITE_API_TIMEOUT_MS=15000
VITE_REQUEST_MAX_CONCURRENT=3
VITE_REQUEST_CACHE_TTL_MS=30000
```

### 3.4 Create Initial Admin User

**Opsi 1: SQL Command**
```sql
-- Generate password hash (bash):
echo -n "admin123" | sha256sum
-- Copy hash result

mysql -u jimpitan -p jimpitan
INSERT INTO users (id, name, role, username, password_hash, created_at, updated_at)
VALUES ('USR-001', 'Administrator', 'admin', 'admin', 'PASTE_HASH_HERE', NOW(), NOW());
EXIT;
```

**Opsi 2: Go Script**
```bash
cd backend-go
# Create file: scripts/create-user.go
go run scripts/create-user.go --name="Administrator" --role="admin" --username="admin" --password="admin123"
```

### 3.5 Start Frontend (Terminal 2)

```bash
npm run dev
```

Browser akan auto-open ke `http://localhost:5173`

---

## 🧪 Langkah 4: Testing

### 4.1 Login Test

Frontend akan auto-open. Try login:
- **Username**: `admin`
- **Password**: `admin123`

Expected:
- ✅ Redirect ke `/home` page
- ✅ Token disimpan di localStorage
- ✅ Navbar menunjukkan nama user

### 4.2 API Testing dengan cURL

**1. Login & Get Token:**
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.data.token')

echo "Token: $TOKEN"
```

**2. Get Customers:**
```bash
curl -X GET http://localhost:8080/api/customers \
  -H "Authorization: Bearer $TOKEN"
```

**3. Create Customer:**
```bash
curl -X POST http://localhost:8080/api/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"blok":"A1","nama":"Test Customer"}'
```

**4. Submit Transaction:**
```bash
curl -X POST http://localhost:8080/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id":"CUST-001",
    "blok":"A1",
    "nama":"Test Customer",
    "nominal":50000,
    "user_id":"USR-001",
    "petugas":"Admin"
  }'
```

### 4.3 Test dengan Postman

1. Import collection: `docs/Jimpitan_API.postman_collection.json`
2. Set environment variable `base_url=http://localhost:8080`
3. Get token dari login request
4. Use token di Authorization header untuk protected endpoints

---

## 📁 Project Structure Setelah Setup

```
nodejs/
├── jimpitan-backend/           ← Backend Go (separate folder)
│   ├── cmd/server/
│   │   └── main.go
│   ├── internal/
│   ├── migrations/
│   ├── .env                    ← Database credentials
│   ├── go.mod
│   ├── Makefile
│   └── README.md
│
└── JimpReact/
    ├── src/                    ← Frontend React (modified)
│   ├── services/
│   │   ├── api.js             ← NEW (menggantikan sheets.js)
│   │   └── requestManager.js  ← Updated
│   ├── contexts/
│   │   └── AuthContext.jsx    ← Updated untuk JWT
│   └── pages/                 ← All imports updated
│
├── docs/                       ← Documentation
│   ├── GOLANG_MIGRATION.md    ← NEW
│   ├── MYSQL_SCHEMA.md        ← NEW
│   └── appscript/             ← Old (for reference)
│
├── .env                        ← NEW (Frontend)
└── package.json
```

---

## 🔄 Workflow Sehari-hari

### Terminal Setup

**Terminal 1 - Backend:**
```bash
cd ../jimpitan-backend
make dev
# atau: go run cmd/server/main.go
```

**Terminal 2 - Frontend:**
```bash
cd ../JimpReact
npm run dev
```

**Terminal 3 - Database (optional):**
```bash
mysql -u jimpitan -p
```

### Development Workflow

1. **Edit code** di `src/` atau `backend-go/`
2. **Frontend auto-reload** (Vite)
3. **Backend auto-reload** (air atau manual restart)
4. **Test di browser**: http://localhost:5173

---

## ⚠️ Common Issues & Solutions

### Issue: "Cannot connect to database"

**Error:**
```
Failed to initialize database: failed to open database
```

**Solution:**
```bash
# Check MySQL running:
mysql -u root -p
# atau:
service mysql status

# Check .env credentials:
cat backend-go/.env | grep DB_

# Verify user & database:
mysql -u jimpitan -p
SHOW DATABASES;
EXIT;
```

---

### Issue: "Port 8080 already in use"

**Error:**
```
listen tcp :8080: bind: address already in use
```

**Solution:**
```bash
# Find process:
lsof -i :8080

# Kill process:
kill -9 <PID>

# Or use different port:
# Edit backend-go/.env: PORT=8081
```

---

### Issue: "Token invalid/expired"

**Error:**
```
401 Unauthorized: Token tidak valid atau sudah kadaluarsa
```

**Solution:**
- Clear localStorage: DevTools → Application → Clear All
- Login lagi
- Check token expiry di response

---

### Issue: "CORS error" dari frontend

**Error:**
```
Access to XMLHttpRequest at 'http://localhost:8080...' blocked by CORS policy
```

**Solution:**
```bash
# Check backend-go/.env:
CORS_ALLOWED_ORIGINS=http://localhost:5173

# If using different port, add it:
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 📚 Next Steps

1. **Backup**: Backup database sebelum production
2. **SSL/TLS**: Setup HTTPS di production
3. **Auth**: Change JWT_SECRET ke nilai yang kuat
4. **Database**: Setup automated backups
5. **Monitoring**: Setup logging & monitoring
6. **Deployment**: Deploy ke server production

---

## 🚀 Production Deployment

### Backend Go

```bash
# Build binary
cd ../jimpitan-backend
make build

# Deploy binary to server
scp backend-go-server user@server:/app/jimpitan/

# Setup systemd service (Linux)
# Create: /etc/systemd/system/jimpitan.service
# Start: systemctl start jimpitan
```

### Frontend

```bash
# Build production bundle
npm run build

# Deploy dist/ ke web server
scp -r dist/ user@server:/var/www/jimpitan/
```

### Database

```bash
# Backup sebelum migrate
mysqldump -u jimpitan -p jimpitan > backup.sql

# Jalankan migrations di production
cd ../jimpitan-backend
mysql -u jimpitan -p jimpitan < migrations/001_initial_schema.sql
```

---

## 📖 Related Documentation

- [Backend Go README](../backend-go/README.md)
- [MySQL Schema](./MYSQL_SCHEMA.md)
- [Frontend Migration Guide](./GOLANG_MIGRATION.md)
- [API Documentation](./Jimpitan_API.postman_collection.json)
