# PWA Testing Guide

This document describes how to test the Progressive Web App (PWA) features of Count Game.

## PWA Features

This application includes the following PWA capabilities:

1. **Service Worker** - Caches static assets for offline access
2. **Web App Manifest** - Enables "Add to Home Screen" functionality
3. **Firestore IndexedDB Persistence** - Enables offline data access

## Testing with Chrome DevTools

### 1. Manifest

1. Open Chrome DevTools (F12 or Cmd+Opt+I)
2. Go to **Application** tab
3. Click on **Manifest** in the sidebar
4. Verify:
   - App name displays correctly
   - Icons are listed with proper sizes (192x192, 256x256, 384x384, 512x512)
   - Theme color and background color are set
   - Display mode is "standalone"

### 2. Service Workers

1. In the **Application** tab, click on **Service Workers**
2. Verify:
   - Service worker is registered and active
   - The status shows "activated and running"
3. Test offline functionality:
   - Check the "Offline" checkbox
   - Reload the page - it should still work
   - Uncheck "Offline" when done

### 3. Cache Storage

1. In the **Application** tab, click on **Cache Storage**
2. Verify that `count-game-cache-v1` exists
3. Check that static assets (HTML, icons, manifest) are cached

### 4. IndexedDB (Firestore Persistence)

1. In the **Application** tab, click on **IndexedDB**
2. Look for Firestore-related databases (firebaseLocalStorageDb, etc.)
3. These databases store offline Firestore data

## Testing with Lighthouse

1. Open Chrome DevTools
2. Go to **Lighthouse** tab
3. Select:
   - Mode: Navigation
   - Device: Mobile
   - Categories: ✅ Progressive Web App
4. Click "Analyze page load"
5. Review the PWA score and recommendations

## Install as App

### Desktop (Chrome)

1. Look for the install icon (⊕) in the address bar
2. Click "Install"
3. The app will open in its own window

### Mobile (Android Chrome)

1. Tap the menu (⋮) button
2. Select "Add to Home screen" or "Install app"
3. The app will appear on your home screen

## Firestore Persistence Notes

- **Multi-tab limitation**: IndexedDB persistence works only in one tab at a time. If you open multiple tabs, only the first tab will have offline persistence enabled.
- **Browser support**: Some browsers (especially older versions or private browsing mode) may not support IndexedDB persistence.
- **Data sync**: When you go back online, any pending writes will automatically sync to the server.

## Troubleshooting

### Service Worker not registering

- Make sure you're running in production build (`npm run build`) or localhost
- Check the console for any registration errors
- Try unregistering the service worker and reloading

### Offline mode not working

- Check that the service worker is active in DevTools
- Verify that the required assets are in cache storage
- Clear the cache and reload to re-fetch assets

### Icons not appearing

- Verify icon files exist in `/public/icons/`
- Check that manifest.json references the correct paths
- Ensure icons are valid PNG files with correct dimensions
