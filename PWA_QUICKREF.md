# 🚀 PWA Quick Reference Card

## 📦 Install & Generate Icons

```bash
# Install dependencies untuk icon generator
npm install sharp --save-dev

# Generate icons dari icon-master.svg
npm run generate-icons

# Build production
npm run build

# Preview production
npm run preview
```

## 📱 Test PWA Locally

### 1. Development Mode
```bash
npm run dev  # Service worker TIDAK aktif di dev mode
```

### 2. Production Mode
```bash
npm run build && npm run preview
```

### 3. Check PWA
- Open: http://localhost:4173
- DevTools → Application → Manifest
- DevTools → Application → Service Workers
- DevTools → Lighthouse → PWA Audit

## 🌐 Test di Mobile (HTTPS Required)

### Option A: ngrok (Quick Test)
```bash
# Terminal 1
npm run preview

# Terminal 2
npx ngrok http 4173
# Buka HTTPS URL di mobile browser
```

### Option B: Deploy to Netlify
```bash
# Push to GitHub, then:
# 1. Connect repo di Netlify
# 2. Build command: npm run build
# 3. Publish dir: dist
# 4. Add env: VITE_SCRIPT_URL
```

## 🔍 Verify PWA

### Lighthouse Audit
1. DevTools → Lighthouse
2. Select "Progressive Web App"
3. Click "Generate report"
4. **Target Score: 90+**

### Install Test Checklist
- [ ] Desktop: Install icon di address bar
- [ ] Android: "Add to Home Screen" menu
- [ ] iOS: Share → "Add to Home Screen"
- [ ] Standalone: Opens without browser UI
- [ ] Offline: Works in airplane mode

## 🎨 Icon Files Structure

```
public/
├── icon-72x72.png      # Android small
├── icon-96x96.png      # Android medium
├── icon-128x128.png    # Android large
├── icon-144x144.png    # Android XL
├── icon-152x152.png    # iOS
├── icon-192x192.png    # Chrome/Android
├── icon-384x384.png    # Android
├── icon-512x512.png    # Splash screen
├── apple-touch-icon.png # iOS (180x180)
└── manifest.json       # PWA manifest
```

## 🛠️ Troubleshooting

### Install Prompt Tidak Muncul
```bash
# 1. Clear browser data
# 2. Hard refresh (Ctrl+Shift+R)
# 3. Try Incognito mode
# 4. Check Lighthouse requirements
```

### Service Worker Error
```bash
# Check status
# DevTools → Application → Service Workers

# Unregister & reload
# DevTools → Application → Service Workers → Unregister
# Then reload page
```

### Icons Tidak Muncul
```bash
# Regenerate icons
npm run generate-icons

# Clear cache
# DevTools → Application → Clear storage
```

## 📖 Full Documentation

- **PWA Guide:** `docs/PWA_GUIDE.md` (400+ lines)
- **PWA Summary:** `PWA_SUMMARY.md`
- **Icon Instructions:** `scripts/ICON_INSTRUCTIONS.md`

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| PWA Builder | https://www.pwabuilder.com/ |
| Lighthouse | Chrome DevTools → Lighthouse |
| ngrok | https://ngrok.com/ |
| Netlify | https://www.netlify.com/ |

## 💡 Pro Tips

1. **Always test PWA in production mode** (`npm run preview`)
2. **HTTPS required** for mobile PWA install
3. **Service worker auto-updates** on page reload
4. **Cache TTL:** 30 days for images, 5 min for API
5. **Offline:** Static pages cached, API requests need online

---

**For detailed guide:** See `docs/PWA_GUIDE.md`
