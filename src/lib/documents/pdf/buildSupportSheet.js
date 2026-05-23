/**
 * Support Sheet Generator — pdf-lib
 * Generates a clearly-labelled NON-OFFICIAL preparation sheet.
 * Used for: physical_office_only, unavailable templates, notary docs.
 */
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { normalizeProfileForPdf } from '../profileFieldMap';

const COLORS = {
  navy:    rgb(0.05, 0.10, 0.20),
  blue:    rgb(0.15, 0.38, 0.92),
  accent:  rgb(0.02, 0.71, 0.84),
  white:   rgb(1, 1, 1),
  gray:    rgb(0.5, 0.5, 0.5),
  light:   rgb(0.93, 0.94, 0.96),
  warning: rgb(0.95, 0.75, 0.10),
  success: rgb(0.13, 0.77, 0.37),
  red:     rgb(0.92, 0.26, 0.21),
  dark:    rgb(0.12, 0.14, 0.20),
};

function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

/** Replace Romanian diacritics and other non-WinAnsi chars with ASCII equivalents */
function safe(text) {
  if (!text) return text;
  return String(text)
    .replace(/[ăÄƒ]/g, 'a').replace(/[ÄÂ]/g, 'A')
    .replace(/[âÂ]/g, 'a').replace(/[Â]/g, 'A')
    .replace(/[\u00E2]/g, 'a').replace(/[\u00C2]/g, 'A')
    .replace(/[\u0103]/g, 'a').replace(/[\u0102]/g, 'A')
    .replace(/[\u00EE]/g, 'i').replace(/[\u00CE]/g, 'I')
    .replace(/[\u0219\u015F]/g, 's').replace(/[\u0218\u015E]/g, 'S')
    .replace(/[\u021B\u0163]/g, 't').replace(/[\u021A\u0162]/g, 'T')
    .replace(/[^\x00-\xFF]/g, '?');
}

/**
 * Draw wrapped text, returns new Y position.
 */
function drawWrapped(page, text, x, y, maxWidth, fontSize, font, color) {
  if (!text) return y;
  const words = safe(String(text)).split(' ');
  let line = '';
  let currentY = y;
  const lineHeight = fontSize * 1.4;

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    const w = font.widthOfTextAtSize(test, fontSize);
    if (w > maxWidth && line) {
      page.drawText(line, { x, y: currentY, size: fontSize, font, color });
      currentY -= lineHeight;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) {
    page.drawText(line, { x, y: currentY, size: fontSize, font, color });
    currentY -= lineHeight;
  }
  return currentY;
}

/**
 * Main support sheet generator.
 */
export async function buildSupportSheet({ template, profile, caseData, missingFields = [] }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const oblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const margin = 48;
  const contentW = width - margin * 2;
  let y = height - margin;

  // ── Header bar ──────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 72, width, height: 72, color: COLORS.navy });
  page.drawText('NoQueue AI', { x: margin, y: height - 32, size: 16, font: bold, color: COLORS.white });
  page.drawText('Cluj-Napoca Civic Assistant', { x: margin, y: height - 48, size: 8, font: regular, color: rgb(0.6, 0.7, 0.85) });

  // NOT OFFICIAL stamp — top right
  const stampText = 'NOT AN OFFICIAL FORM';
  const stampW = bold.widthOfTextAtSize(stampText, 8);
  page.drawRectangle({ x: width - margin - stampW - 12, y: height - 54, width: stampW + 12, height: 18, color: COLORS.warning, borderRadius: 3 });
  page.drawText(stampText, { x: width - margin - stampW - 6, y: height - 44, size: 8, font: bold, color: COLORS.dark });

  y = height - 88;

  // ── Document title ─────────────────────────────────────────
  page.drawText(safe(template.titleRo || template.title).toUpperCase(), {
    x: margin, y, size: 13, font: bold, color: COLORS.blue,
  });
  y -= 16;
  page.drawText(safe(template.title), { x: margin, y, size: 9, font: regular, color: COLORS.gray });
  y -= 6;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.5, color: rgb(0.8, 0.85, 0.95) });
  y -= 14;

  // ── Disclaimer box ─────────────────────────────────────────
  const disclaimerLines = [
    'This is a NoQueue preparation sheet — NOT an official government form.',
    'Prepared for convenience only. Verify all requirements at the official institution before submitting.',
  ];
  const boxH = 36;
  page.drawRectangle({ x: margin, y: y - boxH + 10, width: contentW, height: boxH, color: rgb(1, 0.96, 0.82), borderRadius: 4 });
  page.drawText('! IMPORTANT', { x: margin + 8, y: y - 4, size: 7.5, font: bold, color: rgb(0.6, 0.4, 0) });
  for (let i = 0; i < disclaimerLines.length; i++) {
    page.drawText(disclaimerLines[i], { x: margin + 8, y: y - 14 - i * 10, size: 7, font: oblique, color: rgb(0.4, 0.3, 0) });
  }
  y -= boxH + 10;

  // ── Applicant identity block ────────────────────────────────
  const norm = normalizeProfileForPdf(profile);

  const sectionHeader = (label) => {
    y -= 6;
    page.drawRectangle({ x: margin, y: y - 4, width: contentW, height: 16, color: COLORS.light, borderRadius: 3 });
    page.drawText(safe(label).toUpperCase(), { x: margin + 6, y: y + 4, size: 7.5, font: bold, color: COLORS.navy });
    y -= 22;
  };

  const fieldRow = (label, value, missing = false) => {
    page.drawText(safe(label) + ':', { x: margin + 6, y, size: 8, font: bold, color: COLORS.gray });
    const valX = margin + 140;
    if (missing || !value) {
      page.drawText('[ MISSING - fill in before submitting ]', { x: valX, y, size: 8, font: regular, color: COLORS.red });
    } else {
      page.drawText(safe(String(value)), { x: valX, y, size: 8, font: regular, color: COLORS.dark });
    }
    y -= 13;
  };

  sectionHeader('Applicant — Date personale');
  fieldRow('Nume / Last name',    norm.last_name,    missingFields.includes('last_name'));
  fieldRow('Prenume / First name', norm.first_name,   missingFields.includes('first_name'));
  fieldRow('CNP',                  norm.cnp,          missingFields.includes('cnp'));
  fieldRow('Data nașterii',        norm.birth_date,   missingFields.includes('birth_date'));
  fieldRow('Locul nașterii',       norm.birth_place,  missingFields.includes('birth_place'));
  fieldRow('Tatăl',                norm.father_name,  false);
  fieldRow('Mama',                 norm.mother_name,  false);
  fieldRow('Seria / Nr. CI',       norm.id_series_number, missingFields.includes('id_series'));
  fieldRow('Valabilitate CI',      norm.id_expiry_date, false);
  fieldRow('Eliberată de',         norm.id_issued_by, false);

  sectionHeader('Contact & Domiciliu');
  fieldRow('Adresă',               norm.address_line_1,  missingFields.includes('address_line_1'));
  fieldRow('Localitate',           norm.city,            missingFields.includes('city'));
  fieldRow('Județ',                norm.county,          false);
  fieldRow('Email',                norm.email,           false);
  fieldRow('Telefon',              norm.phone,           false);

  // ── Procedure info ─────────────────────────────────────────
  sectionHeader(`Procedura — ${safe(template.institution)}`);
  y = drawWrapped(page, safe(`Instructiuni: ${template.instructionsShort || '-'}`), margin + 6, y, contentW - 12, 8, regular, COLORS.dark);
  y -= 4;
  if (template.onlineUrl) {
    page.drawText('Online:', { x: margin + 6, y, size: 8, font: bold, color: COLORS.gray });
    page.drawText(template.onlineUrl, { x: margin + 60, y, size: 8, font: regular, color: COLORS.blue });
    y -= 13;
  }
  if (template.sourceUrl) {
    page.drawText('Sursă oficială:', { x: margin + 6, y, size: 8, font: bold, color: COLORS.gray });
    page.drawText(template.sourceUrl, { x: margin + 100, y, size: 8, font: regular, color: COLORS.blue });
    y -= 13;
  }

  // ── Required attachments ───────────────────────────────────
  if (template.requiredAttachments?.length > 0) {
    sectionHeader('Documente necesare la ghișeu');
    for (const att of template.requiredAttachments) {
      page.drawText('-', { x: margin + 6, y, size: 9, font: bold, color: COLORS.blue });
      y = drawWrapped(page, safe(att), margin + 20, y, contentW - 26, 8, regular, COLORS.dark);
      y -= 2;
    }
    y -= 6;
  }

  // ── Status flags ───────────────────────────────────────────
  sectionHeader('Status & Acțiuni');
  const flags = [
    template.needsNotary          ? '[!] Necesita notariat' : null,
    template.needsPhysicalPresence ? '[!] Prezenta fizica obligatorie' : null,
    template.needsAppointment      ? '[!] Necesita programare' : null,
    template.needsManualReview     ? '[!] Necesita verificare manuala' : null,
    template.signatureMode === 'required' ? '[!] Semnatura obligatorie' : null,
    template.photoMode === 'required'     ? '[!] Fotografie necesara' : null,
  ].filter(Boolean);

  for (const flag of flags) {
    page.drawText(flag, { x: margin + 6, y, size: 8, font: regular, color: COLORS.dark });
    y -= 13;
  }

  if (missingFields.length > 0) {
    y -= 4;
    page.drawRectangle({ x: margin, y: y - 14, width: contentW, height: 20, color: rgb(1, 0.93, 0.93), borderRadius: 3 });
    page.drawText(`[!] ${missingFields.length} profile field(s) missing - complete your profile to fill these automatically.`,
      { x: margin + 6, y: y - 6, size: 8, font: bold, color: COLORS.red });
    y -= 24;
  }

  // ── Footer ─────────────────────────────────────────────────
  page.drawLine({ start: { x: margin, y: 32 }, end: { x: width - margin, y: 32 }, thickness: 0.5, color: rgb(0.8, 0.85, 0.95) });
  page.drawText('Prepared by NoQueue AI · Cluj-Napoca · NOT AN OFFICIAL DOCUMENT · Verify at official institution before submitting.',
    { x: margin, y: 18, size: 6.5, font: oblique, color: COLORS.gray });
  page.drawText(`Generated ${new Date().toLocaleString('en-GB')}`,
    { x: width - margin - 100, y: 18, size: 6.5, font: regular, color: COLORS.gray });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}