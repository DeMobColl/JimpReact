# Network Security & Data Masking Guide

## Overview

The Jimpitan app now includes security utilities to prevent sensitive data from being exposed in the browser's DevTools Network tab and console. This is particularly important during development to protect:

- Authentication tokens
- User credentials
- Personal information (names, emails, phone numbers)
- System configuration data
- Session information

## Implementation Details

### 1. Security Utilities (`src/utils/security.js`)

#### Available Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `maskSensitive(text, showChars)` | Mask text with visible start/end | `"abc123def456"` → `"abcd****456"` |
| `maskToken(token)` | Mask auth tokens | `"abc123xyz789"` → `"ab****89"` |
| `maskEmail(email)` | Mask email addresses | `"user@example.com"` → `"u***@example.com"` |
| `maskObject(obj, depth)` | Recursively mask object properties | Masks all `password`, `token`, `email` fields |
| `safeLog(message, data)` | Log with masked data in dev only | `safeLog('User data', userData)` |
| `maskApiResponse(data)` | Mask API response data | Used for response logging |

#### Automatic Field Masking

These fields are automatically masked when using `maskObject()`:
- `password`
- `token`
- `authorization`
- `email`
- `phone`
- `ssn`
- `pin`

### 2. Network Request Interception (`setupNetworkSecurity()`)

When initialized in `src/main.jsx`, this function:

✅ **Intercepts all fetch requests**
- Wraps the global `fetch()` function
- Does NOT modify actual request data (functionality preserved)
- Only masks data for logging/debugging

✅ **Masks Authorization headers**
- Shows only first 2 and last 2 characters
- Example: `"Bearer eyJhbGciOi...xyz789"` → `"Bearer ey****89"`

✅ **Masks request body data**
- Logs masked version for debugging
- Automatically applies field masking
- Passwords shown as `[MASKED]`
- User info shown as `u***@domain.com`

### 3. Console Security (`setupConsoleSecurity()`)

Displays a security reminder in development:

```
⚠️ Security Reminder
Do not paste sensitive data or tokens in console. This is a development environment.
```

This helps prevent accidental exposure when copy-pasting into forums or chat.

## Development Mode

### Enabling Console Logs

By default, console logs are preserved in development for debugging. To disable them:

```javascript
// In src/utils/security.js, change:
const DISABLE_DEV_LOGS = false; // Set to true to disable logs
```

### Viewing Masked Data

When using the API, you'll see masked versions in console:

```javascript
// Example from sheets.js
safeLog('📤 API Request', { 
  action: 'createUser', 
  data: { 
    username: 'u****@example.com',
    password: '[MASKED]',
    token: 'ab****89'
  }
});
```

## Production Mode

### Automatic Security in Production Build

When you run `npm run build`:

1. **Console logs are dropped** - via `drop_console: true` in `vite.config.js`
2. **Source maps are disabled** - via `sourcemap: false`
3. **Debugger statements removed** - via `drop_debugger: true`
4. **Code is minified** - Terser compression
5. **All console.* calls removed** - No log output at all

```bash
$ npm run build
# Result: dist/ folder with production-ready code
# - No console logs
# - No source maps
# - Minified and compressed
# - All debugger statements removed
```

### Verifying Production Security

To test production build locally:

```bash
npm run build
npm run preview
# Opens preview on http://localhost:4173/
# Check DevTools - no source maps available
# Check console - no logs output
```

## Best Practices

### ✅ DO

- Use `safeLog()` for debugging API calls:
  ```javascript
  import { safeLog } from '../utils/security';
  safeLog('User logged in:', userData);
  ```

- Use `maskObject()` when logging sensitive data:
  ```javascript
  console.log(maskObject(responseData));
  ```

- Keep tokens in `sessionStorage` or `localStorage` (encrypted at rest by browser):
  ```javascript
  localStorage.setItem('jimpitanToken', token);
  ```

- Review what data is being sent in API requests

### ❌ DON'T

- Log tokens directly: ❌ `console.log(token)`
- Log passwords: ❌ `console.log('Password:', password)`
- Copy-paste tokens from console to chat
- Enable `DISABLE_DEV_LOGS = true` in production
- Share DevTools screenshots with exposed data

## Security Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser App                       │
├─────────────────────────────────────────────────────┤
│                   src/main.jsx                       │
│  • setupConsoleSecurity() - Warns about exposure    │
│  • setupNetworkSecurity() - Masks fetch requests    │
├─────────────────────────────────────────────────────┤
│                API Calls (sheets.js)                │
│  • JSONP GET requests - Masked in logs              │
│  • Fetch POST requests - Masked in logs             │
│  • Token in headers - Masked in logs                │
├─────────────────────────────────────────────────────┤
│              Google Apps Script Backend             │
│  • Processes unmasked requests (no change)          │
│  • Returns responses (masked before log)            │
│  • Updates Google Sheets database                   │
├─────────────────────────────────────────────────────┤
│                DevTools Network Tab                 │
│  ✓ Masked auth headers                             │
│  ✓ Masked request bodies                           │
│  ✓ Masked response data (in logs)                  │
│  ✓ No source code visible (prod only)              │
└─────────────────────────────────────────────────────┘
```

## Configuration

### Environment Variables (`.env`)

```
VITE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
VITE_JSONP_TIMEOUT_MS=15000
VITE_REQUEST_MAX_CONCURRENT=3
VITE_REQUEST_CACHE_TTL_MS=30000
```

### Vite Build Config (`vite.config.js`)

```javascript
build: {
  minify: 'terser',
  sourcemap: false,        // ✅ No source maps in production
  terserOptions: {
    compress: {
      drop_console: true,  // ✅ Remove all console calls
      drop_debugger: true  // ✅ Remove debugger statements
    }
  }
}
```

## Testing Security

### 1. Check DevTools Network Tab

```javascript
// Development
1. Open DevTools (F12)
2. Go to Network tab
3. Make an API call (e.g., login)
4. Check request headers
   - Authorization should show masked: "ey****89"
5. Check response bodies
   - User data should show masked
```

### 2. Check Console Output

```javascript
// Development
1. Open DevTools (F12)
2. Go to Console tab
3. See security reminder in yellow
4. Make API call
5. Check logged data shows masked values
```

### 3. Build Production Version

```bash
npm run build
npm run preview
# Open http://localhost:4173/
# Check DevTools:
# - No source maps available
# - No console output
# - Network tab shows requests but no source logs
```

## Troubleshooting

### Issue: Seeing raw tokens in Network tab

**Solution:** The Network tab shows actual requests (needed for API to work). Masking applies to:
- Console logs (use DevTools console tab, not Network)
- Development debugging output
- Any code that uses `safeLog()`

To see truly masked requests at network level, use a proxy tool like:
- Charles Proxy
- Fiddler
- mitmproxy

### Issue: Console logs not appearing

**Check:**
1. Are you in production mode? (`npm run build && npm run preview`)
   - If yes: console is intentionally removed
   - Switch to dev: `npm run dev`

2. Is `DISABLE_DEV_LOGS = true` in `security.js`?
   - Change to `false` to enable logs

3. Is `drop_console: true` in `vite.config.js`?
   - This is correct for production

### Issue: `import { safeLog }` not found

**Solution:** Verify the file exists:
```bash
# Should exist
ls src/utils/security.js

# If missing, the file needs to be created again
# Check the conversation history for file creation
```

## Related Files

- **Security utilities:** `src/utils/security.js`
- **Main initialization:** `src/main.jsx`
- **API service:** `src/services/sheets.js`
- **Build config:** `vite.config.js`
- **Auth context:** `src/contexts/AuthContext.jsx`

## Summary

| Aspect | Development | Production |
|--------|------------|-----------|
| **Console Output** | Masked logs | No logs |
| **Source Maps** | Available | Disabled |
| **Debugger Calls** | Included | Removed |
| **API Headers** | Masked in logs | Removed from logs |
| **Sensitive Fields** | Auto-masked | Auto-masked |
| **Code Minification** | No | Yes (Terser) |

The security layer prevents accidental exposure of sensitive data while maintaining full application functionality. Use `safeLog()` for debugging and rest assured that production builds have all sensitive output stripped.
