/**
 * normalizeSignatureImage.js
 * Fetches a signature image from a URL, detects its format,
 * and returns bytes ready for pdf-lib embedding.
 */

const DEV = import.meta.env.DEV;

function log(...args) {
  if (DEV) console.log('[SignatureNorm]', ...args);
}

/**
 * Detect MIME type from the first bytes of an ArrayBuffer (magic bytes).
 * Falls back to URL inspection if ambiguous.
 */
function detectMimeType(buffer, url = '') {
  const bytes = new Uint8Array(buffer.slice(0, 8));

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 &&
    bytes[2] === 0x4e && bytes[3] === 0x47
  ) {
    return 'image/png';
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }

  // Fallback: URL inspection (strip query string first)
  const urlPath = url.split('?')[0].toLowerCase();
  if (urlPath.endsWith('.png')) return 'image/png';
  if (urlPath.endsWith('.jpg') || urlPath.endsWith('.jpeg')) return 'image/jpeg';
  if (urlPath.endsWith('.webp')) return 'image/jpeg'; // pdf-lib doesn't support webp natively

  // Default assume PNG
  return 'image/png';
}

/**
 * Convert a transparent PNG to a white-background JPEG-friendly PNG
 * using an offscreen canvas (browser only).
 * This avoids pdf-lib rendering issues with transparency.
 */
async function flattenTransparency(buffer) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([buffer], { type: 'image/png' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      // White background for transparent areas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (flatBlob) => {
          if (!flatBlob) { reject(new Error('Canvas toBlob failed')); return; }
          flatBlob.arrayBuffer().then(resolve).catch(reject);
        },
        'image/png'
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image load failed during transparency flatten'));
    };
    img.src = url;
  });
}

/**
 * Main entry point.
 * @param {string} signatureUrl - URL to the uploaded signature image
 * @returns {{ bytes: ArrayBuffer, mimeType: string, width: number, height: number } | null}
 */
export async function normalizeSignatureImage(signatureUrl) {
  if (!signatureUrl) {
    log('No signature URL provided');
    return null;
  }

  log('Fetching signature from:', signatureUrl);

  let buffer;
  try {
    const resp = await fetch(signatureUrl, { cache: 'no-cache' });
    if (!resp.ok) {
      log('Fetch failed:', resp.status, resp.statusText);
      return null;
    }
    buffer = await resp.arrayBuffer();
    log('Fetched bytes:', buffer.byteLength);
  } catch (err) {
    log('Fetch error:', err.message);
    return null;
  }

  if (!buffer || buffer.byteLength === 0) {
    log('Empty buffer received');
    return null;
  }

  const mimeType = detectMimeType(buffer, signatureUrl);
  log('Detected MIME type:', mimeType);

  // Get natural dimensions via an Image element
  let width = 200;
  let height = 80;
  try {
    const dims = await new Promise((resolve, reject) => {
      const blob = new Blob([buffer], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(); };
      img.src = url;
    });
    width = dims.width;
    height = dims.height;
    log('Image dimensions:', width, 'x', height);
  } catch {
    log('Could not read image dimensions, using defaults');
  }

  // For PNGs, flatten transparency so pdf-lib renders correctly
  let finalBuffer = buffer;
  if (mimeType === 'image/png') {
    try {
      finalBuffer = await flattenTransparency(buffer);
      log('Transparency flattened, new size:', finalBuffer.byteLength);
    } catch (err) {
      log('Transparency flatten failed, using raw buffer:', err.message);
      finalBuffer = buffer;
    }
  }

  return { bytes: finalBuffer, mimeType, width, height };
}