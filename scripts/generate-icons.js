/**
 * Icon Generator Script for PWA
 * Generates all required icon sizes from a master icon
 * 
 * Usage:
 * 1. Place your master icon (512x512 or larger) as 'icon-master.png' in project root
 * 2. Install sharp: npm install sharp --save-dev
 * 3. Run: node scripts/generate-icons.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prefer PNG master, fallback to SVG if PNG not present
let MASTER_ICON = path.join(__dirname, '..', 'icon-master.png');
const MASTER_SVG = path.join(__dirname, '..', 'icon-master.svg');
if (!fs.existsSync(MASTER_ICON) && fs.existsSync(MASTER_SVG)) {
  MASTER_ICON = MASTER_SVG;
}
const OUTPUT_DIR = path.join(__dirname, '..', 'public');

// Icon sizes required for PWA
const SIZES = [
  72,   // Android small
  96,   // Android medium
  128,  // Android large
  144,  // Android extra large
  152,  // iOS
  192,  // Android & Chrome
  384,  // Android
  512   // Splash screen
];

// Favicon sizes
const FAVICON_SIZES = [16, 32, 48];

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  // Check if master icon exists
  if (!fs.existsSync(MASTER_ICON)) {
    console.error('❌ Master icon not found!');
    console.error(`   Please place your icon as: ${MASTER_ICON}`);
    console.error('   Recommended: 512x512 or 1024x1024 PNG with transparent background\n');
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    // Get master icon info
    const metadata = await sharp(MASTER_ICON).metadata();
    console.log(`📐 Master icon: ${metadata.width}x${metadata.height} ${metadata.format}\n`);

    if (metadata.width < 512 || metadata.height < 512) {
      console.warn('⚠️  Warning: Master icon is smaller than 512x512');
      console.warn('   Recommended minimum: 512x512 for best quality\n');
    }

    // Generate each size
    for (const size of SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
      
      await sharp(MASTER_ICON)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated: icon-${size}x${size}.png`);
    }

    // Generate favicons
    console.log('\n🎨 Generating favicons...\n');
    
    for (const size of FAVICON_SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `favicon-${size}x${size}.png`);
      
      await sharp(MASTER_ICON)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated: favicon-${size}x${size}.png`);
    }

    // Generate apple-touch-icon (180x180 for retina)
    const appleTouchPath = path.join(OUTPUT_DIR, 'apple-touch-icon.png');
    await sharp(MASTER_ICON)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(appleTouchPath);
    
    console.log('✅ Generated: apple-touch-icon.png');

    console.log('\n✨ All icons generated successfully!\n');
    console.log('📋 Next steps:');
    console.log('   1. Check generated icons in public/ folder');
    console.log('   2. Update manifest.json if needed');
    console.log('   3. Test PWA installation\n');

  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

// Run generator
generateIcons().catch(console.error);
