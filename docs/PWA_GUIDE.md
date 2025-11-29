# 📱 PWA Installation & Icon Generation Guide

## Langkah 1: Generate PWA Icons

Aplikasi PWA memerlukan icon dalam berbagai ukuran. Berikut cara generate icon:

### Opsi 1: Generate Otomatis (Recommended)

1. Install tool generator:
```bash
npm install -g pwa-asset-generator
```

2. Siapkan icon master (512x512 atau lebih besar, format PNG/SVG)
   - Simpan di folder project sebagai `icon-master.png`

3. Generate semua ukuran icon:
```bash
pwa-asset-generator icon-master.png ./public --icon-only --favicon
```

### Opsi 2: Generate Manual Online

1. Buka https://realfavicongenerator.net/
2. Upload icon master Anda
3. Pilih platform: iOS, Android, Windows, dll
4. Download zip hasil generate
5. Extract ke folder `public/`

### Opsi 3: Generate dengan Script (Recommended for this project)

Gunakan script Node.js yang sudah disediakan:

```bash
# Install dependencies
npm install sharp --save-dev

# Run icon generator
node scripts/generate-icons.js
```

Script akan otomatis generate semua ukuran yang dibutuhkan.

---

## Ukuran Icon yang Dibutuhkan

| Size | Purpose | File Name |
|------|---------|-----------|
| 72x72 | Android small | icon-72x72.png |
| 96x96 | Android medium | icon-96x96.png |
| 128x128 | Android large | icon-128x128.png |
| 144x144 | Android extra large | icon-144x144.png |
| 152x152 | iOS | icon-152x152.png |
| 192x192 | Android & Chrome | icon-192x192.png |
| 384x384 | Android | icon-384x384.png |
| 512x512 | Splash screen | icon-512x512.png |

---

## Langkah 2: Test PWA di Development

### Local Testing

1. Build aplikasi:
```bash
npm run build
```

2. Preview production build:
```bash
npm run preview
```

3. Akses di browser:
```
http://localhost:4173
```

4. Test PWA features:
   - Cek di DevTools → Application → Manifest
   - Cek di DevTools → Application → Service Workers
   - Test install prompt (mungkin tidak muncul di localhost)

### Mobile Testing (HTTPS Required)

PWA memerlukan HTTPS kecuali di localhost. Untuk test di mobile:

#### Opsi A: Deploy ke Hosting
```bash
# Deploy ke Netlify/Vercel
npm run build
# Upload folder dist/
```

#### Opsi B: Local HTTPS dengan ngrok
```bash
# Install ngrok
npm install -g ngrok

# Start app
npm run preview

# Di terminal baru, expose dengan HTTPS
ngrok http 4173
```

Buka URL HTTPS yang diberikan ngrok di mobile browser.

---

## Langkah 3: Verify PWA

### Check PWA Score

1. Buka aplikasi di Chrome
2. DevTools → Lighthouse
3. Run audit untuk "Progressive Web App"
4. Target score: 90+

### Check Service Worker

1. DevTools → Application → Service Workers
2. Pastikan status: "activated and is running"
3. Test offline mode:
   - Toggle "Offline" di DevTools → Network
   - Reload page, app harus tetap jalan

### Test Install

#### Android Chrome:
1. Buka app di Chrome
2. Klik menu (3 titik) → "Add to Home screen"
3. Atau banner install otomatis muncul

#### iOS Safari:
1. Buka app di Safari
2. Tap Share button (kotak dengan panah)
3. Scroll → "Add to Home Screen"

#### Desktop Chrome:
1. Klik icon install di address bar
2. Atau menu → "Install Jimpitan App"

---

## Langkah 4: Deploy PWA

### Netlify

1. Connect repository
2. Build settings:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
3. Environment variables: Add `VITE_SCRIPT_URL`
4. Deploy!

PWA akan otomatis terdeteksi dan dioptimasi.

### Vercel

```bash
vercel --prod
```

### Custom Server (Nginx)

Tambahkan header PWA di nginx config:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL config
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /var/www/jimpitan/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # PWA Headers
    location ~* \.(json|webmanifest)$ {
        add_header Cache-Control "public, max-age=604800";
        add_header Access-Control-Allow-Origin "*";
    }
    
    location /sw.js {
        add_header Cache-Control "no-cache";
        add_header Service-Worker-Allowed "/";
    }
}
```

---

## Features PWA yang Sudah Diimplementasi

### ✅ Core Features
- [x] Web App Manifest
- [x] Service Worker dengan cache strategy
- [x] Install prompt (custom UI)
- [x] Offline fallback
- [x] App icons (semua ukuran)
- [x] Shortcuts (quick actions)

### ✅ Enhanced Features
- [x] Network status detection
- [x] Update notification
- [x] Cache management
- [x] Platform-specific install instructions

### 🔮 Future Features (Roadmap)
- [ ] Background sync untuk offline transactions
- [ ] Push notifications
- [ ] Periodic background sync
- [ ] Share target (receive shared content)

---

## Testing Checklist

### PWA Installation Test

- [ ] **Desktop Chrome**: Install button muncul di address bar
- [ ] **Desktop Chrome**: Install prompt banner muncul
- [ ] **Android Chrome**: "Add to Home Screen" option tersedia
- [ ] **Android Chrome**: Install banner otomatis muncul
- [ ] **iOS Safari**: "Add to Home Screen" bekerja
- [ ] **Installed App**: Buka dari home screen (standalone mode)
- [ ] **Installed App**: Splash screen muncul saat loading

### Offline Test

- [ ] **Offline Mode**: App tetap bisa dibuka
- [ ] **Offline Mode**: Static pages ter-cache
- [ ] **Network Recovery**: Auto-sync saat online kembali
- [ ] **Network Indicator**: Status online/offline terlihat

### Performance Test

- [ ] **First Load**: < 3 detik
- [ ] **Subsequent Load**: < 1 detik (dari cache)
- [ ] **Service Worker**: Registered & activated
- [ ] **Cache**: Assets ter-cache dengan baik

### Lighthouse Audit

- [ ] **Performance**: 90+
- [ ] **Accessibility**: 90+
- [ ] **Best Practices**: 90+
- [ ] **SEO**: 90+
- [ ] **PWA**: 90+

---

## Troubleshooting

### Install Prompt Tidak Muncul

**Causes:**
- Aplikasi belum memenuhi PWA criteria
- Sudah pernah dismiss prompt
- Browser tidak support (gunakan Chrome/Edge)
- HTTPS tidak aktif

**Solutions:**
1. Check Lighthouse audit untuk requirement yang kurang
2. Clear browser data & site data
3. Gunakan Incognito mode
4. Deploy dengan HTTPS

### Service Worker Tidak Register

**Causes:**
- Running di HTTP (bukan HTTPS atau localhost)
- Service Worker file tidak ditemukan
- Scope configuration salah

**Solutions:**
1. Ensure running di HTTPS atau localhost
2. Check `public/sw.js` exists
3. Check console errors di DevTools

### Offline Mode Tidak Bekerja

**Causes:**
- Service Worker belum activated
- Cache strategy salah
- API requests tidak di-handle

**Solutions:**
1. Check Service Worker status di DevTools
2. Hard refresh (Ctrl+Shift+R)
3. Unregister & register ulang SW

### Icons Tidak Muncul

**Causes:**
- Icon files tidak ada di `public/`
- Path di manifest.json salah
- Ukuran icon tidak sesuai

**Solutions:**
1. Generate icons dengan script
2. Verify paths di manifest.json
3. Clear cache & reload

---

## Resources

- [PWA Builder](https://www.pwabuilder.com/) - PWA testing & validation
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) - Automated PWA audits
- [Workbox](https://developers.google.com/web/tools/workbox) - Advanced service worker patterns
- [Web.dev PWA](https://web.dev/progressive-web-apps/) - PWA best practices

---

## Support

Jika ada issue dengan PWA:
1. Check browser compatibility (Chrome/Edge recommended)
2. Verify HTTPS aktif
3. Check DevTools console untuk errors
4. Test dengan Lighthouse audit

**Minimum Browser Requirements:**
- Chrome 89+
- Edge 89+
- Safari 14+ (limited support)
- Firefox 89+ (limited support)

---

**PWA Installation Complete! 🎉**
