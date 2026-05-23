/**
 * buildLostIdCardApplicationPdf.js
 *
 * Generates a NoQueue *preparation* PDF for the
 * "CERERE pentru ELIBERAREA ACTULUI DE IDENTITATE — ANEXA nr. 11"
 * in case of pierdere/furt.
 *
 * Style matches buildPassportLossDeclarationPdf.js: a NoQueue-branded
 * draft, not a coordinate overlay onto an official template. This keeps
 * the document legible and clearly marked as a preparation draft.
 *
 * Pure client-side, deterministic — no LLM, no profile data leaves the browser.
 *
 * @param {object}  args
 * @param {object}  args.profile        UserPrivateProfile (or partial)
 * @param {string}  args.reason         User-editable reason text
 * @param {string?} args.signatureUrl   Override for applicant signature (else from profile)
 * @returns {Promise<Uint8Array>}
 */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/** Strip Romanian diacritics so Helvetica (WinAnsi) can render the text. */
function safe(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/[ăâĂÂ]/g, c => (c === c.toUpperCase() ? 'A' : 'a'))
    .replace(/[îÎ]/g, c => (c === 'Î' ? 'I' : 'i'))
    .replace(/[șşȘŞ]/g, c => (c === c.toUpperCase() ? 'S' : 's'))
    .replace(/[țţȚŢ]/g, c => (c === c.toUpperCase() ? 'T' : 't'))
    .replace(/[^\x00-\xFF]/g, '?');
}

/** Wrap into lines of <= maxChars. */
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

const MILITARY_LABELS = {
  cadru_activ:             'Cadru activ',
  recrut:                  'Recrut',
  rezervist:               'Rezervist',
  fara_obligatii_militare: 'Fără obligații militare',
  not_applicable:          'Nu este cazul',
};

const MARITAL_LABELS = {
  single:   'Necăsătorit/ă',
  married:  'Căsătorit/ă',
  divorced: 'Divorțat/ă',
  widowed:  'Văduv/ă',
};

const PLACEHOLDER = '[completați manual]';

function valueOrPlaceholder(v) {
  if (v === null || v === undefined) return PLACEHOLDER;
  if (typeof v === 'string' && !v.trim()) return PLACEHOLDER;
  return String(v);
}

async function fetchImageBytes(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

async function embedSignature(pdfDoc, bytes) {
  if (!bytes || bytes.byteLength === 0) return null;
  try { return await pdfDoc.embedPng(bytes); } catch {}
  try { return await pdfDoc.embedJpg(bytes); } catch {}
  return null;
}

async function drawSignatureAt(pdfDoc, page, url, x, y, maxW, maxH) {
  if (!url) return false;
  const bytes = await fetchImageBytes(url);
  const img = await embedSignature(pdfDoc, bytes);
  if (!img) return false;
  const { width: iw, height: ih } = img.scale(1);
  const scale = Math.min(maxW / iw, maxH / ih);
  page.drawImage(img, { x, y, width: iw * scale, height: ih * scale });
  return true;
}

export async function buildLostIdCardApplicationPdf({ profile = {}, reason, signatureUrl }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const BLACK = rgb(0, 0, 0);
  const GRAY = rgb(0.45, 0.45, 0.45);
  const NAVY = rgb(0.04, 0.09, 0.22);
  const AMBER_BG = rgb(0.99, 0.95, 0.78);
  const LIGHT_BG = rgb(0.96, 0.97, 1);

  // ── Resolved fields ────────────────────────────────────────────────────
  const fullName =
    profile.full_name ||
    [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim();
  const cnp = profile.cnp || profile.cnp_masked || '';
  const sex = profile.sex || '';
  const birthDate = profile.birth_date || '';
  const birthPlace = profile.birth_place || '';
  const father = profile.father_name || '';
  const mother = profile.mother_name || '';
  const addr = profile.address_line_1 || '';
  const addr2 = profile.address_line_2 || '';
  const city = profile.city || '';
  const county = profile.county || '';
  const phone = profile.phone || '';
  const prevName = profile.previous_name || '';
  const prevDomicile = [
    profile.previous_domicile_address,
    profile.previous_domicile_city,
    profile.previous_domicile_county,
  ].filter(Boolean).join(', ');
  const marital = MARITAL_LABELS[profile.marital_status] || '';
  const military = MILITARY_LABELS[profile.military_status] || '';
  const school = profile.last_graduated_school || '';
  const occupation = profile.current_occupation || '';
  const reasonText = (reason && String(reason).trim()) || 'Pierderea actului de identitate';
  const applicantSig = signatureUrl || profile.signature_file_url || '';
  const guardianSig = profile.legal_representative_signature_file_url || '';
  const showGuardian = !!(profile.is_minor_applicant || profile.represented_by_legal_guardian);
  const date = new Intl.DateTimeFormat('ro-RO').format(new Date());
  const children = Array.isArray(profile.minor_children) ? profile.minor_children : [];

  // ── Header strip ───────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 800, width: 595.28, height: 42, color: NAVY });
  page.drawText(safe('NoQueue · Cerere eliberare act de identitate'), {
    x: 50, y: 820, size: 11, font: bold, color: rgb(1, 1, 1),
  });
  page.drawText(safe('Pregătit automat din Seiful de Identitate — verificați înainte de depunere'), {
    x: 50, y: 807, size: 8, font: italic, color: rgb(0.75, 0.85, 1),
  });

  // ── Title ──────────────────────────────────────────────────────────────
  const title1 = safe('CERERE pentru ELIBERAREA ACTULUI DE IDENTITATE');
  const tw1 = bold.widthOfTextAtSize(title1, 14);
  page.drawText(title1, { x: (595.28 - tw1) / 2, y: 768, size: 14, font: bold, color: BLACK });

  const title2 = safe('(pierdere / furt)  —  ANEXA nr. 11');
  const tw2 = font.widthOfTextAtSize(title2, 10);
  page.drawText(title2, { x: (595.28 - tw2) / 2, y: 752, size: 10, font: italic, color: GRAY });

  page.drawLine({
    start: { x: 50, y: 742 }, end: { x: 545, y: 742 },
    thickness: 0.5, color: GRAY,
  });

  // ── To institution ─────────────────────────────────────────────────────
  let y = 724;
  page.drawText(safe('Către: SERVICIUL PUBLIC COMUNITAR DE EVIDENȚĂ A PERSOANELOR'), {
    x: 50, y, size: 10, font: bold, color: BLACK,
  });
  y -= 13;
  page.drawText(safe(`Municipiul / Orașul: ${valueOrPlaceholder(city)}     Județul: ${valueOrPlaceholder(county)}`), {
    x: 50, y, size: 10, font, color: BLACK,
  });
  y -= 13;
  page.drawText(safe(`Data: ${date}`), { x: 50, y, size: 10, font, color: BLACK });

  // ── Section: Date personale ───────────────────────────────────────────
  y -= 22;
  page.drawRectangle({ x: 45, y: y - 4, width: 505, height: 18, color: LIGHT_BG });
  page.drawText(safe('1. DATELE SOLICITANTULUI'), {
    x: 50, y, size: 10, font: bold, color: NAVY,
  });
  y -= 22;

  const LINE_H = 14;
  const drawRow = (label, value) => {
    page.drawText(safe(label), { x: 50, y, size: 9, font: bold, color: BLACK });
    page.drawText(safe(valueOrPlaceholder(value)), { x: 200, y, size: 9, font, color: BLACK });
    y -= LINE_H;
  };

  drawRow('Nume:', profile.last_name);
  drawRow('Prenume:', profile.first_name);
  drawRow('Nume anterior:', prevName || '—');
  drawRow('CNP:', cnp);
  drawRow('Sex:', sex);
  drawRow('Data nașterii:', birthDate);
  drawRow('Locul nașterii:', birthPlace);
  drawRow('Prenumele tatălui:', father);
  drawRow('Prenumele mamei:', mother);
  drawRow('Stare civilă:', marital);
  drawRow('Situație militară:', military);
  drawRow('Ultima școală absolvită:', school);
  drawRow('Ocupația actuală:', occupation);

  // ── Section: Adresa actuală ───────────────────────────────────────────
  y -= 8;
  page.drawRectangle({ x: 45, y: y - 4, width: 505, height: 18, color: LIGHT_BG });
  page.drawText(safe('2. DOMICILIUL'), { x: 50, y, size: 10, font: bold, color: NAVY });
  y -= 22;

  drawRow('Adresă (stradă, nr.):', addr);
  drawRow('Bloc, scară, etaj, ap.:', addr2 || '—');
  drawRow('Localitate:', city);
  drawRow('Județ:', county);
  drawRow('Telefon:', phone || '—');

  if (prevDomicile) {
    drawRow('Domiciliu anterior:', prevDomicile);
  }

  // ── Section: Copii minori (if any) ────────────────────────────────────
  if (children.length > 0) {
    y -= 8;
    page.drawRectangle({ x: 45, y: y - 4, width: 505, height: 18, color: LIGHT_BG });
    page.drawText(safe('3. COPII MINORI'), { x: 50, y, size: 10, font: bold, color: NAVY });
    y -= 18;

    page.drawText(safe('#'), { x: 50, y, size: 8, font: bold, color: GRAY });
    page.drawText(safe('Nume și prenume'), { x: 75, y, size: 8, font: bold, color: GRAY });
    page.drawText(safe('Data nașterii'), { x: 290, y, size: 8, font: bold, color: GRAY });
    page.drawText(safe('Locul nașterii'), { x: 400, y, size: 8, font: bold, color: GRAY });
    y -= 12;

    children.slice(0, 6).forEach((c, i) => {
      page.drawText(safe(String(i + 1)), { x: 50, y, size: 9, font, color: BLACK });
      page.drawText(safe(c.full_name || '—'), { x: 75, y, size: 9, font, color: BLACK });
      page.drawText(safe(c.birth_date || '—'), { x: 290, y, size: 9, font, color: BLACK });
      page.drawText(safe(c.birth_place || '—'), { x: 400, y, size: 9, font, color: BLACK });
      y -= 12;
    });
  }

  // ── Section: Reason ────────────────────────────────────────────────────
  y -= 8;
  page.drawRectangle({ x: 45, y: y - 4, width: 505, height: 18, color: LIGHT_BG });
  page.drawText(safe('4. MOTIVUL SOLICITĂRII'), { x: 50, y, size: 10, font: bold, color: NAVY });
  y -= 22;

  page.drawText(safe('Rog să mi se elibereze actul de identitate pentru motivul:'), {
    x: 50, y, size: 9, font: italic, color: GRAY,
  });
  y -= 14;

  const reasonLines = wrapText(reasonText, 95);
  for (const line of reasonLines) {
    page.drawText(safe(line), { x: 50, y, size: 10, font, color: BLACK });
    y -= LINE_H;
  }

  // ── Signature area ─────────────────────────────────────────────────────
  // Place near the bottom; keep stable y irrespective of content above.
  const SIG_BAND_Y = 160;
  page.drawLine({
    start: { x: 50, y: SIG_BAND_Y + 50 }, end: { x: 545, y: SIG_BAND_Y + 50 },
    thickness: 0.4, color: GRAY,
  });

  // Applicant
  page.drawText(safe('Semnătura solicitant'), {
    x: 60, y: SIG_BAND_Y + 38, size: 9, font: bold, color: BLACK,
  });
  page.drawLine({
    start: { x: 60, y: SIG_BAND_Y + 4 }, end: { x: 260, y: SIG_BAND_Y + 4 },
    thickness: 0.6, color: BLACK,
  });
  const appSigOk = await drawSignatureAt(
    pdfDoc, page, applicantSig, 70, SIG_BAND_Y + 8, 170, 30
  );
  if (!appSigOk) {
    page.drawText(safe('— lipsă semnătură —'), {
      x: 70, y: SIG_BAND_Y + 14, size: 9, font: italic, color: rgb(0.7, 0.3, 0.1),
    });
  }

  // Legal representative (only if relevant)
  if (showGuardian) {
    page.drawText(safe('Semnătura părinte / reprezentant legal'), {
      x: 320, y: SIG_BAND_Y + 38, size: 9, font: bold, color: BLACK,
    });
    page.drawLine({
      start: { x: 320, y: SIG_BAND_Y + 4 }, end: { x: 540, y: SIG_BAND_Y + 4 },
      thickness: 0.6, color: BLACK,
    });
    const gOk = await drawSignatureAt(
      pdfDoc, page, guardianSig, 330, SIG_BAND_Y + 8, 190, 30
    );
    if (!gOk) {
      page.drawText(safe('— lipsă semnătură reprezentant —'), {
        x: 330, y: SIG_BAND_Y + 14, size: 9, font: italic, color: rgb(0.7, 0.3, 0.1),
      });
    }
    if (profile.legal_representative_full_name) {
      page.drawText(
        safe(`Nume: ${profile.legal_representative_full_name}`),
        { x: 320, y: SIG_BAND_Y - 10, size: 8, font, color: GRAY }
      );
    }
  }

  // Date below
  page.drawText(safe(`Data: ${date}`), {
    x: 60, y: SIG_BAND_Y - 18, size: 9, font, color: BLACK,
  });

  // ── Footer disclaimer ─────────────────────────────────────────────────
  page.drawRectangle({ x: 40, y: 40, width: 515, height: 40, color: AMBER_BG });
  const disclaimerLines = wrapText(
    'Document pregătit automat de NoQueue pe baza datelor din Seiful de Identitate. Verificați datele înainte de depunere. Prototip demonstrativ — nu reprezintă o platformă oficială a statului.',
    100,
  );
  let dy = 66;
  for (const line of disclaimerLines) {
    page.drawText(safe(line), { x: 48, y: dy, size: 8, font: italic, color: NAVY });
    dy -= 11;
  }

  return await pdfDoc.save();
}