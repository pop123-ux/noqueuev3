/**
 * buildPassportLossDeclarationPdf.js
 *
 * Generates a NoQueue *preparation* PDF for the "Pierdere/furt pașaport"
 * declaration. Auto-fills profile data and embeds the user's saved signature
 * from Seiful de Identitate.
 *
 * IMPORTANT: This is a preparation/draft document, NOT an official form.
 * The footer makes that explicit.
 *
 * Pure client-side, deterministic — no LLM, no profile data leaves the browser.
 */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/** Strip Romanian diacritics so Helvetica (WinAnsi) can render the text. */
function safe(text) {
  if (!text) return '';
  return String(text)
    .replace(/[ăâĂÂ]/g, c => (c === c.toUpperCase() ? 'A' : 'a'))
    .replace(/[îÎ]/g, c => (c === 'Î' ? 'I' : 'i'))
    .replace(/[șşȘŞ]/g, c => (c === c.toUpperCase() ? 'S' : 's'))
    .replace(/[țţȚŢ]/g, c => (c === c.toUpperCase() ? 'T' : 't'))
    .replace(/[^\x00-\xFF]/g, '?');
}

/** Wrap text into lines that fit within maxChars characters. */
function wrapText(text, maxChars = 95) {
  const paragraphs = String(text || '').split('\n');
  const lines = [];
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) { lines.push(''); continue; }
    const words = paragraph.split(/\s+/);
    let line = '';
    for (const w of words) {
      if (!w) continue;
      const next = (line ? line + ' ' : '') + w;
      if (next.length > maxChars) {
        if (line) lines.push(line);
        line = w;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

/** Fetch an image URL into an ArrayBuffer. Returns null on any failure. */
async function fetchImageBytes(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

/** Try PNG embed, fall back to JPG. Returns null if neither works. */
async function embedSignature(pdfDoc, bytes) {
  if (!bytes || bytes.byteLength === 0) return null;
  try { return await pdfDoc.embedPng(bytes); } catch {}
  try { return await pdfDoc.embedJpg(bytes); } catch {}
  return null;
}

/**
 * @param {object}  args
 * @param {object}  args.profile        UserPrivateProfile (or partial)
 * @param {string?} args.signatureUrl   Signature image URL from the vault
 * @param {object?} args.declaration    Optional { title, content } to render verbatim
 * @returns {Promise<Uint8Array>}       PDF bytes
 */
export async function buildPassportLossDeclarationPdf({ profile, signatureUrl, declaration }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const BLACK = rgb(0, 0, 0);
  const GRAY = rgb(0.45, 0.45, 0.45);
  const NAVY = rgb(0.04, 0.09, 0.22);
  const AMBER_BG = rgb(0.99, 0.95, 0.78);

  // ── Profile field resolution with safe fallbacks ────────────────────────
  const fullName =
    profile?.full_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim() ||
    '[Nume lipsa]';
  const cnp = profile?.cnp || profile?.cnp_masked || '[CNP lipsa]';
  const address =
    [profile?.address_line_1, profile?.city, profile?.county]
      .filter(Boolean).join(', ') || '[Adresa lipsa]';
  const date = new Intl.DateTimeFormat('ro-RO').format(new Date());

  // ── Header strip ────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 800, width: 595.28, height: 42, color: NAVY });
  page.drawText(safe('NoQueue · Pregatire document civic'), {
    x: 50, y: 820, size: 11, font: bold, color: rgb(1, 1, 1),
  });
  page.drawText(safe('Ciorna pregatita automat — verificati datele inainte de depunere'), {
    x: 50, y: 807, size: 8, font: italic, color: rgb(0.75, 0.85, 1),
  });

  // ── Title ───────────────────────────────────────────────────────────────
  const title = safe(declaration?.title || 'Declaratie privind pierderea/furtul pasaportului');
  const titleWidth = bold.widthOfTextAtSize(title, 16);
  page.drawText(title, {
    x: Math.max(50, (595.28 - titleWidth) / 2), y: 760, size: 16, font: bold, color: BLACK,
  });

  page.drawText(safe(`Generat de NoQueue · ${date}`), {
    x: 50, y: 738, size: 9, font: italic, color: GRAY,
  });
  page.drawLine({
    start: { x: 50, y: 728 }, end: { x: 545, y: 728 },
    thickness: 0.5, color: GRAY,
  });

  // ── Body ────────────────────────────────────────────────────────────────
  // Prefer a provided declaration.content (already personalized); fall back
  // to a generated paragraph block from the profile.
  let bodyParagraphs;
  if (declaration?.content) {
    // Strip the trailing "Semnatura:" line — we render that ourselves below.
    const lines = String(declaration.content).split('\n');
    const sigIdx = lines.findIndex(l =>
      l.trim().toLowerCase().startsWith('semnatura') ||
      l.trim().toLowerCase().startsWith('semnătura')
    );
    bodyParagraphs = (sigIdx >= 0 ? lines.slice(0, sigIdx) : lines)
      .join('\n').trim().split(/\n\n+/);
  } else {
    bodyParagraphs = [
      `Subsemnatul/Subsemnata ${safe(fullName)}, posesor/posesoare al/a cartii de identitate / CNP ${safe(cnp)}, cu domiciliul in ${safe(address)}, declar pe propria raspundere ca pasaportul meu a fost pierdut/furat si nu se mai afla in posesia mea.`,
      'Ma oblig sa predau pasaportul autoritatii in situatia in care acesta va fi gasit ulterior depunerii prezentei declaratii.',
      `Declarat la data de ${safe(date)}.`,
    ];
  }

  let y = 700;
  const LINE_H = 15;
  for (const para of bodyParagraphs) {
    const lines = wrapText(safe(para), 95);
    for (const line of lines) {
      page.drawText(line, { x: 50, y, size: 11, font, color: BLACK });
      y -= LINE_H;
    }
    y -= 8;
  }

  // ── Signature area ──────────────────────────────────────────────────────
  const SIG_LABEL_Y = 280;
  page.drawText(safe('Semnatura:'), {
    x: 50, y: SIG_LABEL_Y, size: 11, font: bold, color: BLACK,
  });

  const SIG_LINE_Y = SIG_LABEL_Y - 4;
  page.drawLine({
    start: { x: 145, y: SIG_LINE_Y },
    end:   { x: 360, y: SIG_LINE_Y },
    thickness: 0.6, color: BLACK,
  });

  let signatureEmbedded = false;
  if (signatureUrl) {
    const bytes = await fetchImageBytes(signatureUrl);
    const sigImg = await embedSignature(pdfDoc, bytes);
    if (sigImg) {
      const MAX_W = 160;
      const MAX_H = 65;
      const { width: iw, height: ih } = sigImg.scale(1);
      const scale = Math.min(MAX_W / iw, MAX_H / ih);
      page.drawImage(sigImg, {
        x: 150,
        y: SIG_LINE_Y + 2,
        width: iw * scale,
        height: ih * scale,
      });
      signatureEmbedded = true;
    }
  }

  if (!signatureEmbedded) {
    page.drawText(
      safe('Semnatura lipsa — adaugati semnatura in Seiful de Identitate.'),
      { x: 50, y: SIG_LABEL_Y - 28, size: 9, font: italic, color: rgb(0.7, 0.3, 0.1) }
    );
  }

  page.drawText(safe(`Data: ${date}`), {
    x: 400, y: SIG_LABEL_Y, size: 11, font, color: BLACK,
  });

  // ── Footer disclaimer ───────────────────────────────────────────────────
  page.drawRectangle({ x: 40, y: 40, width: 515, height: 36, color: AMBER_BG });
  const disclaimerLines = wrapText(
    'Document pregatit automat de NoQueue. Verificati datele inainte de depunere. Prototip demonstrativ — nu reprezinta o platforma oficiala a statului.',
    100,
  );
  let dy = 62;
  for (const line of disclaimerLines) {
    page.drawText(safe(line), { x: 48, y: dy, size: 8, font: italic, color: NAVY });
    dy -= 11;
  }

  return await pdfDoc.save();
}