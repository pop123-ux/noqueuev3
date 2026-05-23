/**
 * normalizeSignatureImage.js
 * Fetches a signature image and returns bytes ready for pdf-lib embedding.
 *
 * Strategy:
 * 1. Try direct fetch (works for same-origin / CORS-enabled URLs)
 * 2. Fall back to canvas-based loading via Image element (bypasses CORS for display)
 *    — always produces a valid PNG buffer that pdf-lib can embed
 */

const DEV = import.meta.env.DEV;
const log = (...a) => DEV && console.log('[SigNorm]', ...a);

/** Load image via canvas — bypasses CORS fetch restrictions */
async function imageUrlToCanvasPngBuffer(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // request CORS headers if server supports it
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 400;
      canvas.height = img.naturalHeight || 160;
      const ctx = canvas.getContext('2d');
      // White background so transparency doesn't become black in pdf-lib
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('canvas toBlob returned null')); return; }
          blob.arrayBuffer().then((buf) => {
            resolve({ buffer: buf, width: canvas.width, height: canvas.height });
          }).catch(reject);
        },
        'image/png'
      );
    };
    img.onerror = () => reject(new Error(`Image failed to load: ${url}`));
    img.src = url;
  });
}

/**
 * Main entry point.
 * @param {string} signatureUrl
 * @returns {{ bytes: ArrayBuffer, mimeType: string, width: number, height: number } | null}
 */
export async function normalizeSignatureImage(signatureUrl) {
  if (!signatureUrl) {
    log('No URL provided');
    return null;
  }

  log('Processing signature:', signatureUrl.substring(0, 80) + '...');

  // ── Strategy 1: direct fetch ────────────────────────────────────
  try {
    const resp = await fetch(signatureUrl, { cache: 'no-cache', mode: 'cors' });
    if (resp.ok) {
      const buffer = await resp.arrayBuffer();
      if (buffer.byteLength > 100) {
        log('Direct fetch succeeded, bytes:', buffer.byteLength);
        // Detect format via magic bytes
        const head = new Uint8Array(buffer.slice(0, 4));
        const isPng = head[0] === 0x89 && head[1] === 0x50;
        const isJpeg = head[0] === 0xff && head[1] === 0xd8;
        const mimeType = isJpeg ? 'image/jpeg' : 'image/png';
        log('Detected MIME (magic bytes):', mimeType);

        // Always go through canvas to normalize & flatten transparency
        const { buffer: normBuf, width, height } = await imageUrlToCanvasPngBuffer(signatureUrl);
        log('Canvas normalized, final bytes:', normBuf.byteLength, width, 'x', height);
        return { bytes: normBuf, mimeType: 'image/png', width, height };
      }
    } else {
      log('Direct fetch status:', resp.status);
    }
  } catch (e) {
    log('Direct fetch failed (likely CORS):', e.message);
  }

  // ── Strategy 2: canvas-only (no fetch) ─────────────────────────
  // This works even for cross-origin URLs that block fetch but allow <img>
  log('Falling back to canvas-only load');
  try {
    const { buffer, width, height } = await imageUrlToCanvasPngBuffer(signatureUrl);
    if (buffer.byteLength > 100) {
      log('Canvas-only succeeded, bytes:', buffer.byteLength, width, 'x', height);
      return { bytes: buffer, mimeType: 'image/png', width, height };
    }
  } catch (e) {
    log('Canvas-only failed:', e.message);
  }

  log('All strategies failed');
  return null;
}