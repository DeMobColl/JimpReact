# 🚀 Jimpitan Backend - Go Implementation

Backend Go + MySQL menggantikan Google Apps Script + Sheets.

**Lokasi**: `../jimpitan-backend` (folder terpisah dari JimpReact)

## ⚡ Quick Start

```bash
# Navigate to backend folder
cd ../jimpitan-backend

# Setup database
mysql -u root -p
CREATE DATABASE jimpitan CHARACTER SET utf8mb4;
CREATE USER 'jimpitan'@'localhost' IDENTIFIED BY 'jimpitan123';
GRANT ALL PRIVILEGES ON jimpitan.* TO 'jimpitan'@'localhost';
EXIT;

# Run migrations
mysql -u jimpitan -p jimpitan < migrations/001_initial_schema.sql
mysql -u jimpitan -p jimpitan < migrations/002_add_indexes.sql

# Setup environment
cp .env.example .env
# Edit .env dengan DB credentials

# Start backend
make dev
# or: go run cmd/server/main.go
```

Backend akan jalan di: `http://localhost:8080`

## 📋 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/login` | Login user |
| GET | `/api/verifyToken` | Verify JWT |
| POST | `/api/logout` | Logout user |
| GET | `/api/users` | List users |
| POST | `/api/users` | Create user |
| GET | `/api/customers` | List customers |
| GET | `/api/customers/qr?qr_hash=xxx` | Get by QR |
| POST | `/api/transactions` | Submit transaction |
| GET | `/api/transactions` | List transactions |
| DELETE | `/api/transactions?id=xxx` | Delete transaction |

## 📚 Documentation

- **Setup Guide**: `docs/GOLANG_SETUP_GUIDE.md`
- **Frontend Migration**: `docs/GOLANG_MIGRATION.md`
- **Database Schema**: `docs/MYSQL_SCHEMA.md`
- **Full Backend Docs**: `backend-go/README.md`
- **Implementation Summary**: `docs/IMPLEMENTATION_SUMMARY.md`

## 🔐 Authentication

Uses JWT tokens with 7-day expiry.

```bash
# Get token
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Use token in requests
curl -X GET http://localhost:8080/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🗄️ Database

MySQL dengan tables:
- `users` - Accounts
- `customers` - Members dengan QR
- `transactions` - Setoran history
- `sessions` - Active sessions
- `config` - System settings

## 🛠️ Development

```bash
cd backend-go

# Development mode (auto-reload)
make dev

# Build binary
make build

# Run tests
make test

# Run migrations
make migrate
```

## 📖 More Info

Lihat `docs/GOLANG_SETUP_GUIDE.md` untuk setup lengkap dari scratch.

---

**Current Branch**: `db-mysql`
**Status**: ✅ Backend Complete | ⏳ Frontend Integration
