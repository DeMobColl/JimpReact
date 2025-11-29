# PWA Icon Generator Instructions

## Quick Start

1. **Prepare your master icon:**
   - Create a square PNG image (512x512 or larger recommended)
   - Transparent background preferred
   - Simple design that scales well
   - Save as `icon-master.png` in project root

2. **Install dependencies:**
```bash
npm install sharp --save-dev
```

3. **Generate icons:**
```bash
node scripts/generate-icons.js
```

4. **Verify:**
   - Check `public/` folder for generated icons
   - Test in browser DevTools → Application → Manifest

## Manual Alternative (Without Script)

If you don't want to use the script, you can:

1. **Online Tool:** Use https://realfavicongenerator.net/
   - Upload your icon
   - Download generated package
   - Extract to `public/` folder

2. **Manual Creation:** Use any image editor (Photoshop, GIMP, etc.)
   - Create icons for each size: 72, 96, 128, 144, 152, 192, 384, 512
   - Save as `icon-{size}x{size}.png`

## For Testing (Temporary Icons)

If you just want to test PWA without custom icons:

1. Copy `favicon.svg` as base
2. Convert to PNG at different sizes
3. Or use any placeholder icon temporarily

The PWA will work with any valid icon, though custom branding is recommended for production.
