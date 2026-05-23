/**
 * buildLostIdCardOverlayPdf.js
 *
 * TEMPLATE-PRESERVING overlay builder for ANEXA nr. 11
 * ("Cerere pentru eliberarea actului de identitate").
 *
 * Unlike the previous redraw builder, this one:
 *   - Loads the ORIGINAL government form scan as the page background.
 *   - Detects nothing visually — instead uses a calibrated field map.
 *   - Overlays only text / X marks / signature image on top of the
 *     existing empty boxes, so the result looks like the genuine form
 *     filled in digitally.
 *
 * The original layout, borders, table grid, and typography of the
 * template are 100% preserved.
 *
 * Pure client-side & deterministic. No PII leaves the browser.
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ANEXA11_TEMPLATE_URL, ANEXA11_FIELDS, mapProfileToAnexa11 } from './anexa11FieldMap';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Strip Romanian diacritics — Helvetica is WinAnsi-only. */
function safe(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/[ăâĂÂ]/g, c => (c === c.toUpperCase() ? 'A' : 'a'))
    .replace(/[îÎ]/g, c => (c === 'Î' ? 'I' : 'i'))
    .replace(/[șşȘŞ]/g, c => (c === c.toUpperCase() ? 'S' : 's'))
    .replace(/[țţȚŢ]/g, c => (c === c.toUpperCase() ? 'T' : 't'))
    .replace(/[^\x00-\xFF]/g, '?');
}

async function fetchBytes(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

async function embedImage(pdfDoc, bytes) {
  if (!bytes || bytes.byteLength === 0) return null;
  try { return await pdfDoc.embedPng(bytes); } catch {}
  try { return await pdfDoc.embedJpg(bytes); } catch {}
  return null;
}

/** Pick the largest font size (capped) that fits text within boxWidth. */
function fitFontSize(font, text, boxWidth, { max = 11, min = 6 } = {}) {
  if (!text) return max;
  let size = max;
  while (size > min && font.widthOfTextAtSize(text, size) > boxWidth) {
    size -= 0.5;
  }
  return size;
}

// ── Drawing primitives, in PDF-points ─────────────────────────────────────

function drawTextInBox(page, font, text, box, opts = {}) {
  const value = safe(text).toUpperCase ? safe(text) : '';
  const str = safe(text);
  if (!str) return;
  const maxFont = opts.maxFontSize || 11;
  const padding = 1.5;
  const innerW = box.w - padding * 2;
  const size = fitFontSize(font, str, innerW, { max: maxFont, min: 6 });
  const textWidth = font.widthOfTextAtSize(str, size);
  const ascent = size * 0.78;
  // Vertically center within the box; PDF y origin is bottom-left.
  const baselineY = box.y + (box.h - ascent) / 2;
  let x = box.x + padding;
  if (opts.align === 'center') x = box.x + (box.w - textWidth) / 2;
  if (opts.align === 'right')  x = box.x + box.w - padding - textWidth;
  page.drawText(str, { x, y: baselineY, size, font, color: rgb(0.05, 0.08, 0.25) });
  // Use of `value` is intentional — keeps lint happy and reserves uppercase
  // formatting as a hook for future field-level rules.
  void value;
}

function drawCheckMark(page, x, y, size) {
  // Crisp "X" centered in the cell using two strokes.
  const inset = size * 0.18;
  page.drawLine({
    start: { x: x + inset,        y: y + inset },
    end:   { x: x + size - inset, y: y + size - inset },
    thickness: 1.4,
    color: rgb(0.05, 0.08, 0.25),
  });
  page.drawLine({
    start: { x: x + inset,        y: y + size - inset },
    end:   { x: x + size - inset, y: y + inset },
    thickness: 1.4,
    color: rgb(0.05, 0.08, 0.25),
  });
}

function drawCnpDigits(page, font, raw, box) {
  const digits = String(raw || '').replace(/\D/g, '').slice(0, 13);
  if (!digits.length) return;
  const cellW = box.w / 13;
  const size = Math.min(box.h * 0.7, 12);
  for (let i = 0; i < digits.length; i++) {
    const ch = digits[i];
    const charW = font.widthOfTextAtSize(ch, size);
    const cx = box.x + i * cellW + (cellW - charW) / 2;
    const cy = box.y + (box.h - size * 0.78) / 2;
    page.drawText(ch, { x: cx, y: cy, size, font, color: rgb(0.05, 0.08, 0.25) });
  }
}

function drawDateSegments(page, font, segments, box) {
  if (!Array.isArray(segments) || segments.length !== 3) return;
  const slotW = box.w / 3;
  segments.forEach((seg, i) => {
    const str = safe(seg);
    if (!str) return;
    const size = Math.min(box.h * 0.7, 11);
    const w = font.widthOfTextAtSize(str, size);
    const x = box.x + i * slotW + (slotW - w) / 2;
    const y = box.y + (box.h - size * 0.78) / 2;
    page.drawText(str, { x, y, size, font, color: rgb(0.05, 0.08, 0.25) });
  });
}

// ── Box conversion: normalized → PDF points (origin bottom-left) ──────────

function makeBoxConverter(pageW, pageH) {
  return (n) => ({
    x: n.x * pageW,
    // Invert Y: the field map uses top-left origin to match the scan.
    y: pageH - (n.y + n.h) * pageH,
    w: n.w * pageW,
    h: n.h * pageH,
  });
}

function makePointConverter(pageW, pageH) {
  // For square-ish elements (checkbox marks, signatures): convert top-left
  // (x, y, size_or_w, h) where y is from top.
  return (x, yTop, w, h) => ({
    x: x * pageW,
    y: pageH - (yTop + h) * pageH,
    w: w * pageW,
    h: h * pageH,
  });
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * @param {object}  args
 * @param {object}  args.profile
 * @param {string}  args.reason
 * @param {string?} args.signatureUrl       Applicant signature override
 * @param {string?} args.templateUrl        Override template image URL
 * @returns {Promise<Uint8Array>}
 */
export async function buildLostIdCardOverlayPdf({
  profile = {},
  reason,
  signatureUrl,
  templateUrl,
} = {}) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Embed template image (background).
  const bgBytes = await fetchBytes(templateUrl || ANEXA11_TEMPLATE_URL);
  const bgImg = await embedImage(pdfDoc, bgBytes);

  // Default A4 in points. If we have the image, use its native aspect ratio
  // scaled to A4 width so nothing is distorted.
  const A4_W = 595.28;
  const A4_H = 841.89;
  let pageW = A4_W;
  let pageH = A4_H;
  if (bgImg) {
    const ratio = bgImg.height / bgImg.width;
    pageW = A4_W;
    pageH = Math.min(A4_H * 1.15, A4_W * ratio);
  }
  const page = pdfDoc.addPage([pageW, pageH]);

  // Draw the original scan as the background — fills the entire page.
  if (bgImg) {
    page.drawImage(bgImg, { x: 0, y: 0, width: pageW, height: pageH });
  }

  const values = mapProfileToAnexa11(profile, { reason });
  const toBox = makeBoxConverter(pageW, pageH);
  const toPt  = makePointConverter(pageW, pageH);

  // ── Walk the field map and overlay each present value ───────────────────
  for (const [key, field] of Object.entries(ANEXA11_FIELDS)) {
    const value = values[key];

    if (field.kind === 'text') {
      if (!value) continue;
      drawTextInBox(page, font, value, toBox(field), {
        maxFontSize: field.maxFontSize || 11,
        align: field.align,
      });
      continue;
    }

    if (field.kind === 'cnp') {
      drawCnpDigits(page, font, value, toBox(field));
      continue;
    }

    if (field.kind === 'date') {
      drawDateSegments(page, font, value, toBox(field));
      continue;
    }

    if (field.kind === 'check') {
      if (!value || value !== field.valueWhen) continue;
      const cell = toPt(field.x, field.y, field.size, field.size);
      drawCheckMark(page, cell.x, cell.y, cell.w);
      continue;
    }

    if (field.kind === 'image') {
      // Signatures handled separately below.
      continue;
    }

    if (field.kind === 'tableRows') {
      const rows = Array.isArray(values[key]) ? values[key] : [];
      if (rows.length === 0) continue;
      for (let i = 0; i < Math.min(rows.length, field.rows); i++) {
        const yTop = field.yStart + i * field.rowHeight;
        // Index column
        const idxBox = toPt(field.cols[0].x, yTop, field.cols[0].w, field.rowHeight);
        drawTextInBox(page, font, String(i + 1), idxBox, { align: 'center', maxFontSize: 10 });
        // Data columns
        for (let c = 1; c < field.cols.length; c++) {
          const col = field.cols[c];
          const v = rows[i]?.[col.key];
          if (!v) continue;
          const cellBox = toPt(col.x, yTop, col.w, field.rowHeight);
          drawTextInBox(page, font, v, cellBox, { maxFontSize: 9 });
        }
      }
      continue;
    }
  }

  // ── Applicant signature ────────────────────────────────────────────────
  const applicantSigUrl = signatureUrl || profile.signature_file_url || '';
  if (applicantSigUrl) {
    const sigBytes = await fetchBytes(applicantSigUrl);
    const sigImg = await embedImage(pdfDoc, sigBytes);
    if (sigImg) {
      const f = ANEXA11_FIELDS.sig_applicant;
      const box = toPt(f.x, f.y, f.w, f.h);
      const { width: iw, height: ih } = sigImg.scale(1);
      const scale = Math.min(box.w / iw, box.h / ih);
      page.drawImage(sigImg, {
        x: box.x,
        y: box.y,
        width: iw * scale,
        height: ih * scale,
      });
    }
  }

  // ── Guardian signature (only when applicable) ──────────────────────────
  if (profile.is_minor_applicant || profile.represented_by_legal_guardian) {
    const guardianUrl = profile.legal_representative_signature_file_url || '';
    if (guardianUrl) {
      const gBytes = await fetchBytes(guardianUrl);
      const gImg = await embedImage(pdfDoc, gBytes);
      if (gImg) {
        const f = ANEXA11_FIELDS.sig_guardian;
        const box = toPt(f.x, f.y, f.w, f.h);
        const { width: iw, height: ih } = gImg.scale(1);
        const scale = Math.min(box.w / iw, box.h / ih);
        page.drawImage(gImg, {
          x: box.x,
          y: box.y,
          width: iw * scale,
          height: ih * scale,
        });
      }
    }
  }

  // ── Discreet NoQueue watermark in the bottom margin ───────────────────
  // Stays well below the form so it never overlaps any official content.
  const watermark = safe(
    'Pregatit cu NoQueue · Prototip demonstrativ pentru hackathon — verificati datele inainte de depunere.'
  );
  page.drawText(watermark, {
    x: 24,
    y: 10,
    size: 7,
    font: italic,
    color: rgb(0.45, 0.5, 0.65),
  });

  return await pdfDoc.save();
}