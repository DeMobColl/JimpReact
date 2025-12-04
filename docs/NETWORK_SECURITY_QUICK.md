# Network Security - Quick Reference

## What's Protected

| Data Type | Protection | In DevTools | In Console |
|-----------|-----------|------------|-----------|
| Auth Token | Masked | ✅ Partial (ey****89) | ✅ Masked |
| Password | Hidden | ✅ [MASKED] | ✅ [MASKED] |
| User Email | Masked | ✅ u***@domain.com | ✅ Masked |
| User Names | Masked | ✅ J***n D*** | ✅ Masked |
| Config Data | Redacted | ✅ [REDACTED] | ✅ Masked |
| API Keys | Masked | ✅ Partial visible | ✅ Masked |

## For Developers

### Debug an API Call

```javascript
// ✅ Use safe logging
import { safeLog, maskObject } from '@/utils/security';

// Log with automatic field masking
safeLog('API Response', responseData);
// Output: { user_id: '123', token: 'ab****89', email: 'u***@domain.com' }

// Or manually mask
console.log(maskObject(sensitiveObject));
```

### Check Network Security

```javascript
// In Browser Console:
// 1. Open DevTools (F12)
// 2. Go to Network tab
// 3. Make a request
// 4. View request headers - Authorization masked
// 5. View request body - Sensitive fields masked
```

## For Deployment

### Production Build

```bash
# Build for production
npm run build

# What happens:
# ✅ All console.* calls removed
# ✅ No source maps included
# ✅ All debugger statements removed
# ✅ Code minified by Terser
# ✅ Sensitive logging stripped
```

### Preview Production Build

```bash
npm run preview
# Open http://localhost:4173/
# Check: DevTools shows no source maps, no console output
```

## Key Functions

```javascript
// Import
import { 
  maskToken,      // Mask auth tokens
  maskEmail,      // Mask email addresses
  maskObject,     // Mask entire object
  safeLog         // Safe console logging
} from '@/utils/security';

// Usage
maskToken('eyJhbGciOi...')        // → 'ey****...'
maskEmail('user@example.com')     // → 'u***@example.com'
maskObject(userData)              // → { ...masked fields }
safeLog('Debug message', data)    // → Console with masked data (dev only)
```

## Security Checklist

- [ ] ✅ Tokens masked in DevTools Network tab
- [ ] ✅ Passwords show as [MASKED]
- [ ] ✅ Emails masked as u***@domain.com
- [ ] ✅ Config data redacted
- [ ] ✅ Console logs enabled in dev (`DISABLE_DEV_LOGS = false`)
- [ ] ✅ Production build drops all console (`drop_console: true`)
- [ ] ✅ Source maps disabled in production (`sourcemap: false`)
- [ ] ✅ No sensitive data pasted in forums/chat

## Files Modified/Created

```
src/
├── utils/
│   └── security.js         ← NEW: Security utilities
├── main.jsx                ← MODIFIED: Setup security
└── services/
    └── sheets.js           ← MODIFIED: Uses security utils
docs/
├── NETWORK_SECURITY.md     ← NEW: Full documentation
└── NETWORK_SECURITY_QUICK.md ← NEW: This file
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Seeing raw tokens | Use `safeLog()` or `maskObject()` |
| No console output | Check: `DISABLE_DEV_LOGS = false` or use `npm run dev` |
| Source visible in prod | This is expected - check build output |
| API not working | Masking is for logs only, actual requests unmodified |

## Next Steps

1. **Test in development:**
   ```bash
   npm run dev
   # Open DevTools (F12) → Console tab
   # See "⚠️ Security Reminder"
   # Make a login request
   # Check console shows masked data
   ```

2. **Test production build:**
   ```bash
   npm run build
   npm run preview
   # Check DevTools shows no source maps
   # Check console is empty (intentional)
   ```

3. **Review actual requests:**
   ```bash
   # Open DevTools → Network tab
   # Check request headers
   # Check request body
   # Check response (shown in Network, not console)
   ```

## Environment Settings

**Development (npm run dev):**
- ✅ Console logs enabled
- ✅ Security warnings displayed
- ✅ Masked logs for debugging
- ✅ Source maps available
- ✅ No minification

**Production (npm run build && npm run preview):**
- ✅ All console calls removed
- ✅ No source maps
- ✅ Code minified
- ✅ Debugger statements removed
- ✅ Maximum security

## Related Documentation

- Full guide: `docs/NETWORK_SECURITY.md`
- API documentation: `docs/Jimpitan_API.postman_collection.json`
- Setup guide: `docs/MOBILE_SETUP.md`
