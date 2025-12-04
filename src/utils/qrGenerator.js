import QRCode from 'qrcode';

/**
 * Generate individual QR card images using canvas rendering (same as QRCard)
 * Each card uses the exact same styling as QRCard download
 * @param {Array} customers - Array of customer objects with {id, nama, blok, qrHash}
 * @param {Function} onProgress - Callback for progress updates (current, total)
 * @returns {Promise<Array>} Array of {filename, blob} objects
 */
export async function generateQRCards(customers, onProgress = null) {
  const cards = [];
  const total = customers.length;

  for (let index = 0; index < customers.length; index++) {
    const customer = customers[index];
    
    // Report progress
    if (onProgress) {
      onProgress(index + 1, total);
    }

    try {
      // Validate customer data
      if (!customer.nama || !customer.blok || !customer.qrHash) {
        console.warn(`Skipping customer ${customer.id} - missing required fields`);
        continue;
      }

      // Create card canvas (same as QRCard component)
      const cardCanvas = document.createElement('canvas');
      const ctx = cardCanvas.getContext('2d');
      
      // Card dimensions (portrait orientation)
      cardCanvas.width = 800;
      cardCanvas.height = 1000;
      
      // Background - Soft gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, cardCanvas.height);
      bgGradient.addColorStop(0, '#f8fafc');
      bgGradient.addColorStop(1, '#e0e7ff');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, cardCanvas.width, cardCanvas.height);
      
      // Soft rounded border
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.strokeRect(30, 30, cardCanvas.width - 60, cardCanvas.height - 60);
      
      // Top accent bar - soft gradient
      const accentGradient = ctx.createLinearGradient(0, 50, 0, 150);
      accentGradient.addColorStop(0, '#6366f1');
      accentGradient.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = accentGradient;
      ctx.fillRect(50, 50, cardCanvas.width - 100, 8);
      
      // Logo/Icon area - soft circle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cardCanvas.width / 2, 120, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e0e7ff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Logo emoji
      ctx.font = 'bold 56px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏡', cardCanvas.width / 2, 120);
      
      // Title
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 42px Arial';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('Jimpitan', cardCanvas.width / 2, 210);
      
      // Divider line
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(200, 240);
      ctx.lineTo(600, 240);
      ctx.stroke();
      
      // Customer name - soft card
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 4;
      ctx.fillRect(80, 270, cardCanvas.width - 160, 90);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
      // Customer name text
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 38px Arial';
      ctx.fillText(customer.nama, cardCanvas.width / 2, 315);
      
      // Blok with icon
      ctx.fillStyle = '#64748b';
      ctx.font = '26px Arial';
      ctx.fillText(`📍 Blok ${customer.blok}`, cardCanvas.width / 2, 350);
      
      // QR Code container - soft shadow
      const qrSize = 400;
      const qrX = (cardCanvas.width - qrSize) / 2;
      const qrY = 400;
      
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 8;
      ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
      // Generate QR code image
      const qrDataUrl = await new Promise((resolve) => {
        QRCode.toDataURL(customer.qrHash, {
          width: 600,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        }, (error, url) => {
          if (!error) {
            resolve(url);
          } else {
            console.error('QR generation error:', error);
            resolve(null);
          }
        });
      });
      
      // Draw QR code on canvas
      if (qrDataUrl) {
        const qrImage = new Image();
        qrImage.onerror = () => {
          console.error('Failed to load QR image');
        };
        qrImage.src = qrDataUrl;
        
        // Wait for image to load then draw
        await new Promise((resolve) => {
          qrImage.onload = () => {
            ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
            
            // Bottom instruction area - soft background
            ctx.fillStyle = '#f1f5f9';
            ctx.fillRect(80, 860, cardCanvas.width - 160, 80);
            
            // Instruction text
            ctx.fillStyle = '#475569';
            ctx.font = '24px Arial';
            ctx.fillText('Scan QR untuk mencatat', cardCanvas.width / 2, 900);
            
            ctx.font = 'bold 26px Arial';
            ctx.fillStyle = '#6366f1';
            ctx.fillText('Jimpitan', cardCanvas.width / 2, 930);
            
            resolve();
          };
          qrImage.onerror = () => {
            console.error('QR image load failed');
            resolve();
          };
        });
      }
      
      // Convert canvas to blob
      const blob = await new Promise((resolve) => {
        cardCanvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 0.95);
      });
      
      if (blob) {
        const filename = `Jimpitan_QR_${customer.blok}_${customer.nama}.png`;
        cards.push({
          filename: sanitizeFilename(filename),
          blob
        });
      }
    } catch (error) {
      console.error(`Failed to generate card for ${customer.id}:`, error);
    }
  }

  return cards;
}

/**
 * Create ZIP file from card images
 * @param {Array} cards - Array of {filename, blob} objects
 * @param {string} zipName - Name of the ZIP file
 * @returns {Promise<Blob>} ZIP blob
 */
export async function createZipFromCards(cards, zipName = 'qr-codes') {
  // Dynamically import JSZip
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  // Add each card to the zip
  for (const card of cards) {
    zip.file(card.filename, card.blob);
  }

  // Generate the zip file
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Download ZIP file
 * @param {Blob} blob - ZIP blob
 * @param {string} filename - Output filename
 */
export function downloadZIP(blob, filename = 'qr-codes.zip') {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Sanitize filename but preserve .png extension
 */
function sanitizeFilename(filename) {
  // Separate name and extension
  const lastDot = filename.lastIndexOf('.');
  const name = lastDot > 0 ? filename.substring(0, lastDot) : filename;
  const ext = lastDot > 0 ? filename.substring(lastDot) : '';
  
  // Sanitize name only
  const sanitized = name
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
  
  return sanitized + ext;
}

/**
 * Get unique bloks from customers (normalize to string)
 * @param {Array} customers - Array of customer objects
 * @returns {Array} Unique bloks sorted
 */
export function getUniqueBloks(customers) {
  const bloks = [...new Set(customers.map(c => String(c.blok).trim()))];
  return bloks.sort((a, b) => {
    // Try to sort numerically if both are numbers
    const aNum = parseInt(a, 10);
    const bNum = parseInt(b, 10);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    return a.localeCompare(b);
  });
}
