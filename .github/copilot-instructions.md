# Jimpitan App - AI Coding Agent Instructions

## Project Overview
React-based "Jimpitan" (community savings) management system with Google Apps Script backend. QR code scanning for customer identification, transaction recording, and role-based access (admin/petugas). The app operates primarily offline-first with JSONP requests to Google Sheets as the database.

## Architecture

### Frontend Stack
- **React 18** with React Router DOM v7 for routing
- **Vite 6** for build tooling with code splitting (react-vendor, qr-vendor, export-vendor chunks)
- **Tailwind CSS 3** with dark mode support via `class` strategy
- Path aliasing: `@` → `./src`

### Backend: Google Apps Script
Backend lives in `docs/appscript/` (not auto-deployed - must be manually copied to Google Apps Script editor):
- `main_handlers.js` - Request routing for both GET (JSONP) and POST endpoints
- `auth.js` - Token-based authentication (7-day expiry), password hashing
- `submit.js` - Transaction submissions
- `crud.js` - User CRUD operations
- `customers.js` - Customer management with QR hash generation
- `history.js` - Transaction history queries
- `config.js` - System configuration with protected settings
- `utils.js` - Shared utilities (hashing, timestamps, token generation)

**Critical:** Google Sheets serves as the database with sheets: Users, Customers, History, Config, Sessions

### API Communication Pattern
**JSONP for GET requests** (CORS workaround):
- Creates dynamic `<script>` tags with callback functions
- Timeout: 15s (configurable via `VITE_JSONP_TIMEOUT_MS`)
- All GET requests in `sheets.js` use `createJSONPRequest()`

**POST with `no-cors` mode** for mutations:
- User CRUD, customer updates use `fetch()` with `mode: 'no-cors'`
- Returns opaque responses - success assumed if no error thrown

**Request Queue & Cache** (`services/requestManager.js`):
- Max 3 concurrent requests (configurable via `VITE_REQUEST_MAX_CONCURRENT`)
- 30s cache TTL for GET operations
- Exponential backoff retry (3 attempts default)
- Cache invalidation on mutations (e.g., `requestCache.delete()` after user creation)

### Authentication Flow
1. Login via `loginWithSheet()` → backend generates token + expiry
2. Token stored in localStorage: `jimpitanToken`, `jimpitanCurrentUser`
3. `AuthContext` verifies token on mount and every 30 min
4. Token invalidation triggers global `tokenInvalidHandler` → auto-logout + redirect to `/login`
5. `ProtectedRoute` guards all authenticated pages, `adminOnly` prop for admin-restricted routes

### Key Patterns

#### Page Structure
All pages wrapped in `<PageLayout>` for consistent responsive card UI:
```jsx
<PageLayout title="Page Title" maxWidth="max-w-4xl">
  {/* content */}
</PageLayout>
```

#### Loading States
Use `<LoadingSpinner>` component:
- `fullscreen` - centers overlay
- `loading` prop - controls visibility
- `text` prop - optional message

#### Notifications
`useToast()` hook for alerts:
```jsx
const toast = useToast();
toast.success('Operation successful');
toast.error('Error occurred', 'Optional details');
toast.warning('Warning message');
```

#### Dark Mode
`useDarkMode()` hook syncs with localStorage and applies `class="dark"` to `<html>`:
```jsx
const { isDark, toggleTheme } = useDarkMode();
```

#### Role-Based Rendering
```jsx
const { isAdmin } = useAuth();
{isAdmin && <AdminOnlyComponent />}
{!isAdmin && <PetugasView />}
```

## Development Workflow

### Environment Setup
Create `.env` in project root:
```
VITE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
VITE_JSONP_TIMEOUT_MS=15000
VITE_REQUEST_MAX_CONCURRENT=3
VITE_REQUEST_CACHE_TTL_MS=30000
```

### Commands
- `npm run dev` - Dev server on port 3000, auto-opens browser
- `npm run build` - Production build with Terser (drops console/debugger)
- `npm run preview` - Preview production build
- `npm run lint` - ESLint check

### Build Optimizations
- Manual chunk splitting for vendors (see `vite.config.js`)
- `drop_console` and `drop_debugger` in production
- Lazy-loaded pages via `React.lazy()`
- Path aliases prevent deep relative imports

## Common Tasks

### Adding New Pages
1. Create page in `src/pages/YourPage.jsx`
2. Lazy import in `App.jsx`:
   ```jsx
   const YourPage = lazy(() => import('./pages/YourPage'));
   ```
3. Add route with protection:
   ```jsx
   <Route path="/yourpage" element={<ProtectedRoute adminOnly><YourPage /></ProtectedRoute>} />
   ```
4. Add nav link in `App.jsx` desktop/mobile menus

### API Integration
All API calls go through `services/sheets.js`:
- GET operations use JSONP via `createJSONPRequest()`
- POST mutations use `fetch()` with `no-cors`
- Always invalidate cache after mutations:
  ```javascript
  requestCache.delete(`getCacheKey_${params}`);
  ```
- Token passed as param for authenticated endpoints

### Styling Conventions
- Use Tailwind utility classes (no custom CSS files except `assets/main.css` for global resets)
- Dark mode: `dark:` prefix for dark variants
- Responsive: mobile-first with `md:` and `lg:` breakpoints
- Gradient backgrounds: `bg-gradient-to-br from-slate-50 via-blue-50/30...`
- Buttons: pre-defined classes in `assets/button-styles.css` (`.btn-primary`, `.btn-secondary`, etc.)

### Transaction Flow
1. **ScanQR** (`/scanqr`) - Uses `html5-qrcode` library to scan QR hash
2. Navigate to **Submit** (`/submit?qrHash=xxx`) - Fetch customer via `getCustomerByQRHash()`
3. Submit transaction via `submitToSheet()` - Creates record with `customer_id`, `user_id`, `petugas`, `nominal`
4. View in **History** (admin) or **MyHistory** (petugas)

### Customer QR Generation
Customers have unique QR hash generated in backend (`customers.js`):
```javascript
var qrHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, customerId + timestamp)
```
Frontend displays QR with `qrcode.react` library (`<QRCodeSVG value={qrHash} />`)

## Gotchas & Quirks

- **JSONP callbacks must be unique** - Uses timestamp + random string
- **No POST response data** - `no-cors` mode returns opaque responses, assume success if no error
- **Token expiry handling** - Global handler in `AuthContext` via `setTokenInvalidHandler()`
- **Manual backend deployment** - `docs/appscript/` files must be manually copied to Google Apps Script
- **Cache invalidation** - Must manually clear cache after mutations (e.g., `requestCache.delete()`)
- **Mobile menu z-index** - Fixed positioning with backdrop at `z-40`, menu at `z-50`
- **Performance tracking** - `utils/performance.js` measures API calls, disabled in production
- **Sheet structure** - Google Sheets column order matters; changes require backend updates

## Testing
No automated tests currently. Manual testing workflow:
1. Test with dev server (`npm run dev`)
2. Test admin vs petugas roles separately
3. Verify QR scanning on mobile devices (requires HTTPS or localhost)
4. Check dark mode toggle
5. Test cache invalidation after mutations

## Key Files Reference
- `src/App.jsx` - Main routing, nav menu, role-based UI
- `src/contexts/AuthContext.jsx` - Auth state, token management, session persistence
- `src/services/sheets.js` - All Google Apps Script API calls
- `src/services/requestManager.js` - Queue, cache, retry logic
- `src/components/ProtectedRoute.jsx` - Route guards
- `vite.config.js` - Build config, chunk splitting, path aliases
- `docs/appscript/main_handlers.js` - Backend request router
