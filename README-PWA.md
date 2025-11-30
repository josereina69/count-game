# PWA Testing Guide

This application has been configured as a Progressive Web App (PWA) with offline support.

## Testing the PWA

### Using Chrome DevTools

1. **Open DevTools** (F12 or Right-click → Inspect)

2. **Application Tab → Manifest**
   - Verify the manifest is loaded correctly
   - Check that all icons are referenced and loading
   - Confirm app name, theme color, and display mode are set

3. **Application Tab → Service Workers**
   - Verify the service worker is registered and activated
   - Test "Update on reload" checkbox for development
   - Check the "Offline" checkbox to test offline mode

4. **Lighthouse Audit**
   - Go to Lighthouse tab in DevTools
   - Select "Progressive Web App" category
   - Run the audit to check PWA compliance

### Testing Offline Mode

1. Load the application while online
2. Open DevTools → Network tab
3. Check "Offline" or use Application → Service Workers → Offline
4. Refresh the page - it should still load from cache
5. Firestore data will be available from IndexedDB persistence

### Installing the PWA

- On desktop Chrome/Edge: Click the install icon in the address bar
- On mobile: Use "Add to Home Screen" from browser menu

## Technical Details

### Service Worker Strategy

- **Navigation requests**: Network-first (always tries to get latest HTML)
- **Static assets**: Cache-first (serves from cache when available)
- **Firebase requests**: Not cached (real-time data should always be fresh)

### Firestore Persistence

The app enables IndexedDB persistence for Firestore, which means:
- Read queries work offline with cached data
- Writes are queued and synced when back online
- Multi-tab usage may show warnings (normal behavior)

### Files Involved

- `public/manifest.json` - PWA manifest configuration
- `public/icons/` - App icons (192, 256, 384, 512 px)
- `src/service-worker.js` - Service worker implementation
- `src/serviceWorkerRegistration.js` - Registration helper
- `src/index.js` - Service worker registration call
- `src/App.js` - Firestore persistence initialization

## Notes

- The icons included are placeholders. Replace them with your own branded icons for production.
- The service worker only registers in production builds or on localhost.
- For best results, test PWA features in an incognito window to avoid cache conflicts.
