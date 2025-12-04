# 📚 Dokumentasi Jimpitan App - Index

Panduan lengkap untuk semua dokumentasi aplikasi Jimpitan.

---

## 🚀 Getting Started

Baru mulai? Baca dalam urutan ini:

1. **[README.md](../README.md)** - Overview lengkap aplikasi
2. **[INSTALL.md](../INSTALL.md)** - Panduan instalasi step-by-step (30-45 menit)
3. **[USAGE.md](../USAGE.md)** - Cara menggunakan aplikasi sehari-hari

---

## 👨‍💻 Untuk Developer

### Setup & Configuration
- **[README.md - Installation](../README.md#-instalasi)** - Setup development environment
- **[INSTALL.md](../INSTALL.md)** - Detailed installation guide
- **[.env Configuration](../README.md#-konfigurasi)** - Environment variables

### Architecture & Patterns
- **[.github/copilot-instructions.md](../.github/copilot-instructions.md)** - Panduan AI coding agents
  - Architecture overview
  - Key patterns & conventions
  - Development workflow
  - Gotchas & quirks

### API Documentation
- **[API_MOBILE_GUIDE.md](API_MOBILE_GUIDE.md)** - Complete mobile API documentation
  - Authentication (stateless)
  - Endpoint details
  - Request/response examples
  - Error handling
- **[TESTING_BY_ROLE.md](TESTING_BY_ROLE.md)** - Testing scenarios by role
  - Admin testing flow
  - Petugas testing flow
  - Permission boundaries
- **[Postman Collection](Jimpitan_API.postman_collection.json)** - Ready-to-use API collection
- **[Postman Environments](.)** - Pre-configured test environments
  - `Jimpitan_Production.postman_environment.json` (Admin)
  - `Jimpitan_Petugas.postman_environment.json` (Petugas)

---

## 👤 Untuk Admin Sistem

### Instalasi & Setup
- **[INSTALL.md](../INSTALL.md)** - Step-by-step installation
  - Google Sheets setup
  - Apps Script deployment
  - Frontend configuration

### Penggunaan Admin
- **[USAGE.md - Panduan Admin](../USAGE.md#-panduan-untuk-admin)** - Complete admin guide
  - Manajemen user
  - Manajemen customer
  - Lihat riwayat transaksi
  - Konfigurasi sistem
  - Export data

### Maintenance
- **[README.md - Troubleshooting](../README.md#-troubleshooting)** - Common issues & solutions
- **[README.md - FAQ](../README.md#-faq)** - Frequently asked questions

---

## 👷 Untuk Petugas

### Cara Pakai Aplikasi
- **[USAGE.md - Panduan Petugas](../USAGE.md#-panduan-untuk-petugas)** - Daily usage guide
  - Scan QR & input transaksi
  - Lihat riwayat transaksi sendiri
  - Tips penggunaan

### Tutorial
- **Tutorial built-in** - Klik icon 📖 di navbar aplikasi
- **[USAGE.md - Tips](../USAGE.md#-tips-penggunaan)** - Best practices

---

## 🔧 Backend (Google Apps Script)

### Source Code
Semua file backend ada di folder `appscript/`:

- **[main_handlers.js](appscript/main_handlers.js)** - Main request router (GET & POST)
- **[auth.js](appscript/auth.js)** - Authentication & token management
- **[crud.js](appscript/crud.js)** - User CRUD operations
- **[customers.js](appscript/customers.js)** - Customer management & QR generation
- **[history.js](appscript/history.js)** - Transaction history queries
- **[submit.js](appscript/submit.js)** - Transaction submissions
- **[config.js](appscript/config.js)** - System configuration management
- **[utils.js](appscript/utils.js)** - Shared utilities (hashing, timestamps)

### Deployment
- **[INSTALL.md - Apps Script Setup](../INSTALL.md#langkah-4-setup-google-apps-script-15-menit)** - Deploy instructions
- **[README.md - Manual Deployment](../README.md#backend-google-apps-script)** - Backend update process

---

## 📱 Mobile App Integration

### API Endpoints
- **[API_MOBILE_GUIDE.md](API_MOBILE_GUIDE.md)** - Complete API documentation
  - Mobile vs Web API differences
  - Authentication flow
  - All endpoints dengan examples
  - Response formats

### Testing
- **[TESTING_BY_ROLE.md](TESTING_BY_ROLE.md)** - Testing guide by role
  - Postman setup
  - Admin test scenarios
  - Petugas test scenarios
  - Permission testing
- **[Postman Collection](Jimpitan_API.postman_collection.json)** - Import to Postman

### Integration Examples
- **[API_MOBILE_GUIDE.md - Error Handling](API_MOBILE_GUIDE.md#️-error-handling)** - Best practices
- **[API_MOBILE_GUIDE.md - Security](API_MOBILE_GUIDE.md#-security-notes)** - Security considerations

---

## 🌐 Deployment

### Production Deployment
- **[README.md - Deployment](../README.md#-deployment)** - Deploy options
  - Netlify
  - Vercel
  - VPS/Server dengan Nginx

### Environment Setup
- **[README.md - Configuration](../README.md#-konfigurasi)** - Environment variables
- **[INSTALL.md - Step 5](../INSTALL.md#langkah-5-konfigurasi-frontend-5-menit)** - .env file setup

---

## 🔍 Quick Reference

### Common Tasks

| Task | Documentation |
|------|---------------|
| **Install aplikasi** | [INSTALL.md](../INSTALL.md) |
| **Login pertama kali** | [USAGE.md - Login](../USAGE.md#-login--logout) |
| **Tambah user baru** | [USAGE.md - Admin](../USAGE.md#1-menambah-user-baru) |
| **Tambah customer** | [USAGE.md - Admin](../USAGE.md#2-menambah-customer) |
| **Scan QR & submit** | [USAGE.md - Petugas](../USAGE.md#1-scan-qr--input-transaksi) |
| **Export data** | [USAGE.md - Export](../USAGE.md#export-data) |
| **Test API** | [TESTING_BY_ROLE.md](TESTING_BY_ROLE.md) |
| **Deploy production** | [README.md - Deployment](../README.md#-deployment) |
| **Troubleshoot error** | [README.md - Troubleshooting](../README.md#-troubleshooting) |

### File Locations

| What | Where |
|------|-------|
| **Main app** | `src/App.jsx` |
| **API calls** | `src/services/sheets.js` |
| **Auth context** | `src/contexts/AuthContext.jsx` |
| **Backend** | `docs/appscript/*.js` |
| **Postman collection** | `docs/Jimpitan_API.postman_collection.json` |
| **Environment files** | `docs/*.postman_environment.json` |
| **Build config** | `vite.config.js` |

---

## 📖 Documentation Structure

```
JimpReact/
├── README.md                    # Main documentation
├── INSTALL.md                   # Installation guide
├── USAGE.md                     # User manual
│
├── .github/
│   └── copilot-instructions.md  # AI agent guide
│
└── docs/
    ├── INDEX.md                 # This file
    ├── API_MOBILE_GUIDE.md      # Mobile API docs
    ├── TESTING_BY_ROLE.md       # Testing guide
    │
    ├── Jimpitan_API.postman_collection.json
    ├── Jimpitan_Production.postman_environment.json
    ├── Jimpitan_Petugas.postman_environment.json
    │
    └── appscript/               # Backend source
        ├── main_handlers.js
        ├── auth.js
        ├── crud.js
        ├── customers.js
        ├── history.js
        ├── submit.js
        ├── config.js
        └── utils.js
```

---

## 🆘 Need Help?

### By Topic

- **Installation issues** → [INSTALL.md - Troubleshooting](../INSTALL.md#-troubleshooting-instalasi)
- **Usage questions** → [USAGE.md - FAQ](../USAGE.md#-faq-penggunaan)
- **API errors** → [API_MOBILE_GUIDE.md - Error Handling](API_MOBILE_GUIDE.md#️-error-handling)
- **Production issues** → [README.md - Troubleshooting](../README.md#-troubleshooting)

### Contact

- 📧 GitHub Issues - Report bugs
- 💬 Discussions - Ask questions
- 📖 Documentation - Read guides

---

## 🔒 Security & Data Protection

### Network & Data Security
- **[NETWORK_SECURITY.md](NETWORK_SECURITY.md)** - Complete security implementation guide (400+ lines)
  - Implementation details
  - Development mode protection
  - Production hardening
  - Best practices
  - Testing guide
  
- **[NETWORK_SECURITY_QUICK.md](NETWORK_SECURITY_QUICK.md)** - Quick reference for developers
  - What's protected
  - How to use security functions
  - Troubleshooting quick tips
  - Security checklist

- **[SECURITY_CONFIG_REFERENCE.md](SECURITY_CONFIG_REFERENCE.md)** - Configuration guide
  - Environment variables
  - Build configuration
  - Customization examples
  - Production checklist
  - Debugging guide

- **[SECURITY_VISUAL_GUIDE.md](SECURITY_VISUAL_GUIDE.md)** - Visual explanations
  - Security overview diagram
  - Data flow comparison
  - Security levels visualization
  - Testing scenarios
  - Alert levels

### Implementation Details
- **[SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md)** - Technical implementation summary
  - Core features
  - Code examples
  - Files added/modified
  - Compatibility information

### Root Level Security Documentation
- **[../SECURITY_SUMMARY.md](../SECURITY_SUMMARY.md)** - High-level overview (in project root)
- **[../SECURITY_CHECKLIST.md](../SECURITY_CHECKLIST.md)** - Implementation verification checklist

---

## 🔄 Documentation Updates

**Last Updated:** December 5, 2025

**Version:** 3.0

**Changes (Latest):**
- ✅ **NEW:** Complete network security implementation
- ✅ **NEW:** 5 security documentation files created
- ✅ **NEW:** Data masking for sensitive information
- ✅ **NEW:** Request/response interception
- ✅ **NEW:** Production build hardening
- ✅ Added complete mobile API documentation
- ✅ Added Postman collection & environments
- ✅ Added role-based testing guide
- ✅ Updated README with API references
- ✅ Created comprehensive index

---

**Semoga dokumentasi ini membantu! 📚**
