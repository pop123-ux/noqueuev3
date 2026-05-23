/**
 * passportPdfExporter.js
 * Generates a structured PDF that visually resembles the official
 * Romanian "Cerere pentru eliberarea unui nou pasaport" (Anexa 10)
 * 
 * CIORNA GENERATA — NOT AN OFFICIAL FORM
 * Review before submission at passport authority.
 */
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { mapProfileToPassportForm, toCharBoxes, parseDateBoxes } from './passportFieldMapper';

/** Strip Romanian diacritics for WinAnsi PDF encoding */
function safe(text) {
  if (!text) return '';
  return String(text)
    .replace(/[ăÂâ]/g, a => a === 'Â' ? 'A' : 'a')
    .replace(/[îÎ]/g, i => i === 'Î' ? 'I' : 'i')
    .replace(/[șşȘŞ]/g, s => s === 'Ș' || s === 'Ş' ? 'S' : 's')
    .replace(/[țţȚŢ]/g, t => t === 'Ț' || t === 'Ţ' ? 'T' : 't')
    .replace(/[^\x00-\xFF]/g, '?');
}

const BLACK = rgb(0, 0, 0);
const WHITE = rgb(1, 1, 1);
const GRAY_BG = rgb(0.82, 0.82, 0.82);
const DARK_GRAY = rgb(0.35, 0.35, 0.35);
const BLUE = rgb(0.1, 0.25, 0.75);
const RED = rgb(0.8, 0.1, 0.1);
const WARN_YELLOW = rgb(0.98, 0.85, 0.1);
const WARN_NAVY = rgb(0.04, 0.09, 0.22);
const LIGHT_BLUE_BG = rgb(0.85, 0.92, 0.98);
const BORDER = rgb(0.5, 0.5, 0.5);

const BOX_SIZE = 14;   // character box size in pts
const BOX_GAP = 1;     // gap between boxes

/**
 * Draw a row of individual character boxes
 * @param page       - pdf-lib page
 * @param chars      - array of single chars
 * @param x, y       - top-left origin (y is bottom of row in pdf-lib coords)
 * @param highlight  - 'missing' | 'filled' | 'normal'
 * @param font       - font to use
 */
function drawCharBoxes(page, chars, x, y, highlight = 'normal', font, fontSize = 8) {
  chars.forEach((ch, i) => {
    const bx = x + i * (BOX_SIZE + BOX_GAP);
    const isMissing = !ch && highlight === 'missing';
    const bg = isMissing ? rgb(1, 0.93, 0.88) : ch ? rgb(0.94, 0.97, 1) : WHITE;
    page.drawRectangle({ x: bx, y, width: BOX_SIZE, height: BOX_SIZE, color: bg });
    page.drawRectangle({ x: bx, y, width: BOX_SIZE, height: BOX_SIZE, borderColor: isMissing ? RED : BORDER, borderWidth: 0.6 });
    if (ch) {
      const cw = font.widthOfTextAtSize(ch, fontSize);
      page.drawText(ch, { x: bx + (BOX_SIZE - cw) / 2, y: y + 3, size: fontSize, font, color: BLUE });
    }
  });
}

/** Draw a filled or empty checkbox */
function drawCheckbox(page, x, y, checked, size = 11) {
  page.drawRectangle({ x, y, width: size, height: size, color: checked ? BLUE : WHITE, borderColor: BORDER, borderWidth: 0.8 });
  if (checked) {
    // Draw X
    const pad = 2;
    page.drawLine({ start: { x: x + pad, y: y + pad }, end: { x: x + size - pad, y: y + size - pad }, thickness: 1.5, color: WHITE });
    page.drawLine({ start: { x: x + size - pad, y: y + pad }, end: { x: x + pad, y: y + size - pad }, thickness: 1.5, color: WHITE });
  }
}

/** Draw a horizontal rule */
function hRule(page, x, y, w, thickness = 0.5, color = BORDER) {
  page.drawLine({ start: { x, y }, end: { x: x + w, y }, thickness, color });
}

/** Draw a labeled field row */
function drawLabeledRow(page, label, x, y, w, h, font, boldFont, fontSize = 8) {
  page.drawRectangle({ x, y, width: w, height: h, color: GRAY_BG });
  page.drawRectangle({ x, y, width: w, height: h, borderColor: BORDER, borderWidth: 0.5 });
  const lw = boldFont.widthOfTextAtSize(label, fontSize);
  page.drawText(label, { x: x + (w - lw) / 2, y: y + (h - fontSize) / 2 + 1, size: fontSize, font: boldFont, color: BLACK });
}

export async function exportStructuredPassportPdf(profile, options = {}) {
  const data = mapProfileToPassportForm(profile, options);

  const pdfDoc = await PDFDocument.create();
  // Slightly wider than A4 to match form proportions
  const PAGE_W = 595;
  const PAGE_H = 842;
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);

  const regular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const bold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const boldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);
  const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // ── DRAFT WATERMARK BANNER ──────────────────────────────────────
  page.drawRectangle({ x: 0, y: PAGE_H - 22, width: PAGE_W, height: 22, color: WARN_YELLOW });
  const warnTxt = 'CIORNA GENERATA - VERIFICATI INAINTE DE DEPUNERE - Generated draft - review before submission';
  const warnW = helvBold.widthOfTextAtSize(warnTxt, 7);
  page.drawText(warnTxt, { x: (PAGE_W - warnW) / 2, y: PAGE_H - 15, size: 7, font: helvBold, color: WARN_NAVY });

  // ── OUTER BORDER ────────────────────────────────────────────────
  const ML = 30, MR = 30, MT = 30, MB = 30;
  const formX = ML;
  const formY = MB;
  const formW = PAGE_W - ML - MR;
  const formH = PAGE_H - MT - MB - 25; // 25 for banner

  page.drawRectangle({ x: formX, y: PAGE_H - 25 - MT - formH, width: formW, height: formH, borderColor: rgb(0.4, 0.55, 0.7), borderWidth: 2 });

  // ── TITLE AREA ──────────────────────────────────────────────────
  let curY = PAGE_H - 25 - MT - 12; // starting y inside form

  // "CERERE" + "Anexa 10"
  const titleUnder = 'CERERE';
  const titleW = bold.widthOfTextAtSize(titleUnder, 16);
  const titleX = (PAGE_W - titleW) / 2 - 30;
  page.drawText(titleUnder, { x: titleX, y: curY, size: 16, font: bold, color: BLACK });
  // Underline
  page.drawLine({ start: { x: titleX, y: curY - 1 }, end: { x: titleX + titleW, y: curY - 1 }, thickness: 1, color: BLACK });

  // Anexa 10
  page.drawText('Anexa 10', { x: formX + formW - 80, y: curY, size: 11, font: regular, color: BLACK });

  curY -= 18;
  const sub = 'pentru eliberarea unui nou pasaport';
  const subW = bold.widthOfTextAtSize(sub, 11);
  page.drawText(sub, { x: (PAGE_W - subW) / 2, y: curY, size: 11, font: bold, color: BLACK });

  curY -= 18;

  // ── ROW 1: CNP + SEX + DATA NASTERII ───────────────────────────
  const ROW_H = BOX_SIZE + 10;
  const rowY = curY - ROW_H;

  // Outer row border
  page.drawRectangle({ x: formX, y: rowY - 2, width: formW, height: ROW_H + 16, borderColor: BORDER, borderWidth: 0.5 });

  // CNP label
  drawLabeledRow(page, 'CNP', formX, rowY - 2, 28, ROW_H + 16, regular, bold, 8);

  // CNP boxes — 13 boxes
  const cnpStartX = formX + 30;
  drawCharBoxes(page, data.cnpBoxes, cnpStartX, rowY + 2, data.missing.includes('CNP') ? 'missing' : 'filled', bold, 8);

  // SEX label
  const sexLabelX = cnpStartX + 13 * (BOX_SIZE + BOX_GAP) + 8;
  page.drawText('Sex', { x: sexLabelX, y: rowY + 6, size: 9, font: bold, color: BLACK });

  // M checkbox
  const mBoxX = sexLabelX + 22;
  drawCheckbox(page, mBoxX, rowY + 2, data.sexM, 12);
  page.drawText('M', { x: mBoxX + 14, y: rowY + 3, size: 8, font: regular, color: BLACK });

  // F checkbox
  const fBoxX = mBoxX + 28;
  drawCheckbox(page, fBoxX, rowY + 2, data.sexF, 12);
  page.drawText('F', { x: fBoxX + 14, y: rowY + 3, size: 8, font: regular, color: BLACK });

  // DATA NASTERII label + boxes
  const dataNastX = fBoxX + 28;
  page.drawText('Data nasterii', { x: dataNastX, y: rowY + 6, size: 8, font: bold, color: BLACK });

  const dnBoxStart = dataNastX + 66;
  // Z Z L L A A A A
  const dayBoxes = (data.birthDate.day || ['', '']).slice(0, 2);
  const monBoxes = (data.birthDate.month || ['', '']).slice(0, 2);
  const yearBoxes = (data.birthDate.year || ['', '', '', '']).slice(0, 4);

  const bdMissing = data.missing.includes('Data nasterii') ? 'missing' : 'filled';
  drawCharBoxes(page, dayBoxes, dnBoxStart, rowY + 2, bdMissing, bold, 8);
  drawCharBoxes(page, monBoxes, dnBoxStart + 2 * (BOX_SIZE + BOX_GAP) + 4, rowY + 2, bdMissing, bold, 8);
  drawCharBoxes(page, yearBoxes, dnBoxStart + 4 * (BOX_SIZE + BOX_GAP) + 8, rowY + 2, bdMissing, bold, 8);

  // Z Z L L A A A A labels
  const labelY = rowY - 6;
  ['Z', 'Z', 'L', 'L', 'A', 'A', 'A', 'A'].forEach((lbl, i) => {
    const offsetGroups = [0, 1, 2, 3, 4, 5, 6, 7];
    let bx;
    if (i < 2) bx = dnBoxStart + i * (BOX_SIZE + BOX_GAP);
    else if (i < 4) bx = dnBoxStart + 2 * (BOX_SIZE + BOX_GAP) + 4 + (i - 2) * (BOX_SIZE + BOX_GAP);
    else bx = dnBoxStart + 4 * (BOX_SIZE + BOX_GAP) + 8 + (i - 4) * (BOX_SIZE + BOX_GAP);
    page.drawText(lbl, { x: bx + 3, y: labelY, size: 7, font: regular, color: DARK_GRAY });
  });

  curY = rowY - 10;

  // ── ROW 2: NUMELE ───────────────────────────────────────────────
  const numeRowY = curY - ROW_H;
  page.drawRectangle({ x: formX, y: numeRowY, width: formW, height: ROW_H + 6, borderColor: BORDER, borderWidth: 0.5 });
  drawLabeledRow(page, 'Numele', formX, numeRowY, 48, ROW_H + 6, regular, bold, 8);
  drawCharBoxes(page, data.numeBoxes, formX + 50, numeRowY + 4, data.missing.includes('Nume') ? 'missing' : 'filled', bold, 8);
  curY = numeRowY - 4;

  // ── ROW 3: PRENUMELE ────────────────────────────────────────────
  const prenRowY = curY - ROW_H;
  page.drawRectangle({ x: formX, y: prenRowY, width: formW, height: ROW_H + 6, borderColor: BORDER, borderWidth: 0.5 });
  drawLabeledRow(page, 'Prenumele', formX, prenRowY, 52, ROW_H + 6, regular, bold, 8);
  drawCharBoxes(page, data.prenumeBoxes, formX + 54, prenRowY + 4, data.missing.includes('Prenume') ? 'missing' : 'filled', bold, 8);
  curY = prenRowY - 4;

  // ── ROW 4: NUMELE ANTERIOR ──────────────────────────────────────
  const naRowY = curY - ROW_H;
  page.drawRectangle({ x: formX, y: naRowY, width: formW, height: ROW_H + 6, borderColor: BORDER, borderWidth: 0.5 });
  drawLabeledRow(page, 'Numele anterior', formX, naRowY, 72, ROW_H + 6, regular, bold, 8);
  drawCharBoxes(page, data.numeAnteriorBoxes, formX + 74, naRowY + 4, 'normal', bold, 8);
  curY = naRowY - 4;

  // ── ROW 5: TATA + MAMA ──────────────────────────────────────────
  const parentRowY = curY - ROW_H;
  // Split row in half
  const halfW = formW / 2;
  page.drawRectangle({ x: formX, y: parentRowY, width: formW, height: ROW_H + 18, borderColor: BORDER, borderWidth: 0.5 });
  page.drawLine({ start: { x: formX + halfW, y: parentRowY }, end: { x: formX + halfW, y: parentRowY + ROW_H + 18 }, thickness: 0.5, color: BORDER });

  // Labels row (above boxes)
  const parentLblY = parentRowY + ROW_H + 4;
  page.drawText('Prenumele tatalui', { x: formX + halfW / 2 - 35, y: parentLblY, size: 8, font: bold, color: BLACK });
  page.drawText('Prenumele mamei', { x: formX + halfW + halfW / 2 - 33, y: parentLblY, size: 8, font: bold, color: BLACK });

  const tatMissing = data.missing.includes('Prenumele tatalui') ? 'missing' : 'filled';
  const mamMissing = data.missing.includes('Prenumele mamei') ? 'missing' : 'filled';
  drawCharBoxes(page, data.tatBoxes, formX + 4, parentRowY + 4, tatMissing, bold, 8);
  drawCharBoxes(page, data.mamBoxes, formX + halfW + 4, parentRowY + 4, mamMissing, bold, 8);

  curY = parentRowY - 4;

  // ── ROW 6: LOC NASTERE + JUDET ──────────────────────────────────
  const locRowY = curY - ROW_H;
  page.drawRectangle({ x: formX, y: locRowY, width: formW, height: ROW_H + 6, borderColor: BORDER, borderWidth: 0.5 });
  drawLabeledRow(page, 'Locul nasterii', formX, locRowY, 62, ROW_H + 6, regular, bold, 8);

  const locMissing = data.missing.includes('Locul nasterii') ? 'missing' : 'filled';
  drawCharBoxes(page, data.locuNasterii, formX + 64, locRowY + 4, locMissing, bold, 8);

  // Judet
  const judetLblX = formX + 64 + 24 * (BOX_SIZE + BOX_GAP) + 8;
  page.drawText('Judetul', { x: judetLblX, y: locRowY + 6, size: 8, font: bold, color: BLACK });
  drawCharBoxes(page, data.judetBoxes, judetLblX + 42, locRowY + 4, data.missing.includes('Judet') ? 'missing' : 'filled', bold, 8);

  curY = locRowY - 4;

  // ── ROW 7: DOMICILIUL ───────────────────────────────────────────
  const domRowY = curY - 20;
  page.drawRectangle({ x: formX, y: domRowY, width: formW, height: 22, borderColor: BORDER, borderWidth: 0.5 });
  drawLabeledRow(page, 'Domiciliul', formX, domRowY, 46, 22, regular, bold, 8);

  const domText = safe(data.domiciliu || '');
  const domColor = data.missing.includes('Domiciliu') ? RED : BLUE;
  page.drawText(domText || '(lipsa din Seif)', {
    x: formX + 50, y: domRowY + 6, size: 8, font: domText ? bold : regular,
    color: domText ? domColor : RED, maxWidth: formW - 56,
  });
  curY = domRowY - 2;

  // ── ROW 8: TELEFON ──────────────────────────────────────────────
  const telRowY = curY - 20;
  page.drawRectangle({ x: formX, y: telRowY, width: formW, height: 22, borderColor: BORDER, borderWidth: 0.5 });
  drawLabeledRow(page, 'Telefon', formX, telRowY, 38, 22, regular, bold, 8);
  const telText = safe(data.telefon || '');
  page.drawText(telText || '(lipsa)', {
    x: formX + 42, y: telRowY + 6, size: 9, font: telText ? bold : regular,
    color: telText ? BLUE : RED,
  });
  curY = telRowY - 4;

  // ── DECLARATION SECTION ─────────────────────────────────────────
  const declRowY = curY - 20;
  page.drawRectangle({ x: formX, y: declRowY, width: formW, height: 20, color: GRAY_BG, borderColor: BORDER, borderWidth: 0.5 });
  const declTxt = 'Declar pe propria raspundere ca (marcati cu X situatia corespunzatoare)';
  const dtW = boldItalic.widthOfTextAtSize(declTxt, 8.5);
  page.drawText(declTxt, { x: (PAGE_W - dtW) / 2, y: declRowY + 5, size: 8.5, font: boldItalic, color: BLACK });
  curY = declRowY - 2;

  // ── PASSPORT POSSESSION ROW ─────────────────────────────────────
  const possRowY = curY - 34;
  page.drawRectangle({ x: formX, y: possRowY, width: formW, height: 36, borderColor: BORDER, borderWidth: 0.5 });

  // Left half — nu posed
  const halfBound = formX + formW * 0.38;
  drawCheckbox(page, formX + 6, possRowY + 12, !data.hasPreviousPassport, 12);
  page.drawText('nu posed pasaport simplu', { x: formX + 22, y: possRowY + 15, size: 8, font: bold, color: BLACK });

  // Vertical divider
  page.drawLine({ start: { x: halfBound, y: possRowY }, end: { x: halfBound, y: possRowY + 36 }, thickness: 0.5, color: BORDER });

  // Right half — posed/am posedat
  drawCheckbox(page, halfBound + 6, possRowY + 22, data.hasPreviousPassport, 12);
  page.drawText('posed (am posedat) pasaportul simplu nr.', {
    x: halfBound + 22, y: possRowY + 24, size: 7.5, font: bold, color: BLACK,
  });

  // Previous passport number boxes (8 chars)
  drawCharBoxes(page, data.prevPassportBoxes, halfBound + 22, possRowY + 8, data.hasPreviousPassport ? 'filled' : 'normal', bold, 7);

  // "eliberat la data de"
  page.drawText('eliberat la data de', { x: formX + 4, y: possRowY + 2, size: 7, font: regular, color: BLACK });
  // prev passport date boxes
  const prevDayBoxes = (data.prevPassportDate.day || ['', '']).slice(0, 2);
  const prevMonBoxes = (data.prevPassportDate.month || ['', '']).slice(0, 2);
  const prevYrBoxes = (data.prevPassportDate.year || ['', '', '', '']).slice(0, 4);
  const prevDateX = formX + 80;
  drawCharBoxes(page, prevDayBoxes, prevDateX, possRowY - 8, 'normal', bold, 7);
  drawCharBoxes(page, prevMonBoxes, prevDateX + 2 * (BOX_SIZE + BOX_GAP) + 3, possRowY - 8, 'normal', bold, 7);
  drawCharBoxes(page, prevYrBoxes, prevDateX + 4 * (BOX_SIZE + BOX_GAP) + 6, possRowY - 8, 'normal', bold, 7);

  curY = possRowY - 14;

  // ── MA LEGITIMEZ ROW ────────────────────────────────────────────
  const legRowY = curY - 52;
  page.drawRectangle({ x: formX, y: legRowY, width: formW, height: 54, borderColor: BORDER, borderWidth: 0.5 });

  // Left label
  page.drawText('Ma', { x: formX + 4, y: legRowY + 42, size: 9, font: bold, color: BLACK });
  page.drawText('legitimez', { x: formX + 4, y: legRowY + 30, size: 9, font: bold, color: BLACK });
  page.drawText('cu (marcati', { x: formX + 4, y: legRowY + 18, size: 7.5, font: regular, color: BLACK });
  page.drawText('cu X)', { x: formX + 4, y: legRowY + 8, size: 7.5, font: regular, color: BLACK });

  // 4 ID types with checkboxes
  const idTypes = [
    { label: 'carte de identitate', checked: true },
    { label: 'buletin de identitate', checked: false },
    { label: 'adeverinta provizorie de identitate', checked: false },
    { label: 'certificat de nastere', checked: false },
  ];
  const legItemX = formX + 50;
  idTypes.forEach((item, i) => {
    const iy = legRowY + 42 - i * 12;
    drawCheckbox(page, legItemX, iy - 1, item.checked, 10);
    page.drawText(item.label, { x: legItemX + 13, y: iy, size: 7.5, font: regular, color: BLACK });
  });

  // Seria + Nr CI
  const seriaX = formX + formW * 0.5;
  page.drawText('seria', { x: seriaX, y: legRowY + 42, size: 8, font: regular, color: BLACK });
  drawCharBoxes(page, data.idSeries, seriaX + 28, legRowY + 34, data.missing.includes('Seria CI') ? 'missing' : 'filled', bold, 8);

  page.drawText('nr', { x: seriaX + 60, y: legRowY + 42, size: 8, font: regular, color: BLACK });
  drawCharBoxes(page, data.idNumber, seriaX + 72, legRowY + 34, data.missing.includes('Nr. CI') ? 'missing' : 'filled', bold, 8);

  page.drawText('eliberat la', { x: seriaX + 160, y: legRowY + 42, size: 8, font: regular, color: BLACK });

  page.drawText('data de', { x: seriaX, y: legRowY + 20, size: 8, font: regular, color: BLACK });
  // ID issue date boxes
  const ciDate = parseDateBoxes(profile?.id_issue_date || '');
  drawCharBoxes(page, (ciDate.day || ['','']).slice(0,2), seriaX + 42, legRowY + 14, 'normal', bold, 7);
  drawCharBoxes(page, (ciDate.month || ['','']).slice(0,2), seriaX + 42 + 2*(BOX_SIZE+BOX_GAP)+3, legRowY + 14, 'normal', bold, 7);
  drawCharBoxes(page, (ciDate.year || ['','','','']).slice(0,4), seriaX + 42 + 4*(BOX_SIZE+BOX_GAP)+6, legRowY + 14, 'normal', bold, 7);

  curY = legRowY - 4;

  // ── URGENCY ROW ─────────────────────────────────────────────────
  const urgRowY = curY - 26;
  page.drawRectangle({ x: formX, y: urgRowY, width: formW, height: 28, color: GRAY_BG, borderColor: BORDER, borderWidth: 0.8 });

  page.drawText('Solicit eliberarea pasaportului in regim de urgenta.', {
    x: formX + 6, y: urgRowY + 10, size: 9, font: bold, color: BLACK,
  });

  // DA checkbox
  const daX = formX + formW * 0.58;
  drawCheckbox(page, daX, urgRowY + 8, data.urgentDA, 13);
  page.drawText('DA', { x: daX + 15, y: urgRowY + 10, size: 8.5, font: bold, color: data.urgentDA ? BLUE : BLACK });

  // NU checkbox
  const nuX = daX + 45;
  drawCheckbox(page, nuX, urgRowY + 8, data.urgentNU, 13);
  page.drawText('NU', { x: nuX + 15, y: urgRowY + 10, size: 8.5, font: bold, color: data.urgentNU ? RED : BLACK });

  page.drawText('(Marcati cu X)', { x: nuX + 36, y: urgRowY + 10, size: 7, font: regular, color: DARK_GRAY });

  curY = urgRowY - 4;

  // ── SEMNALMENTE + DATA ──────────────────────────────────────────
  const signRowH = 52;
  const signRowY = curY - signRowH;
  page.drawRectangle({ x: formX, y: signRowY, width: formW, height: signRowH, borderColor: BORDER, borderWidth: 0.5 });

  // Semnalmente (left third)
  const thirdW = formW / 3;
  page.drawRectangle({ x: formX, y: signRowY, width: thirdW, height: signRowH, color: GRAY_BG, borderColor: BORDER, borderWidth: 0.5 });
  page.drawText('Semnalmente', { x: formX + 6, y: signRowY + signRowH - 14, size: 8, font: bold, color: BLACK });

  // Inaltimea box + value
  page.drawRectangle({ x: formX + 4, y: signRowY + 6, width: 32, height: 18, color: WHITE, borderColor: data.heightCm ? rgb(0.2,0.6,0.2) : BORDER, borderWidth: data.heightCm ? 1 : 0.5 });
  page.drawText('Inaltimea', { x: formX + 4, y: signRowY + signRowH - 28, size: 7, font: regular, color: DARK_GRAY });
  if (data.heightCm) {
    const htW = bold.widthOfTextAtSize(data.heightCm, 9);
    page.drawText(data.heightCm, { x: formX + 4 + (32 - htW) / 2, y: signRowY + 10, size: 9, font: bold, color: BLUE });
  }
  page.drawText('cm', { x: formX + 40, y: signRowY + 10, size: 7, font: regular, color: DARK_GRAY });

  // Culoarea ochilor box + value
  const eyeBoxX = formX + 54;
  const eyeBoxW = thirdW - 62;
  page.drawRectangle({ x: eyeBoxX, y: signRowY + 6, width: eyeBoxW, height: 18, color: WHITE, borderColor: data.eyeColor ? rgb(0.2,0.6,0.2) : BORDER, borderWidth: data.eyeColor ? 1 : 0.5 });
  page.drawText('Culoarea ochilor', { x: eyeBoxX, y: signRowY + signRowH - 28, size: 7, font: regular, color: DARK_GRAY });
  if (data.eyeColor) {
    const eyeTxt = safe(data.eyeColor);
    const eyeW = bold.widthOfTextAtSize(eyeTxt, 7.5);
    page.drawText(eyeTxt, { x: eyeBoxX + (eyeBoxW - eyeW) / 2, y: signRowY + 10, size: 7.5, font: bold, color: BLUE });
  }

  // Data depunerii (middle third) — auto-filled
  const midThirdX = formX + thirdW;
  page.drawText('Data depunerii cererii', { x: midThirdX + 6, y: signRowY + signRowH - 14, size: 8, font: bold, color: BLACK });
  // Draw submission date boxes with auto values
  drawCharBoxes(page, data.submissionDateBoxes, midThirdX + 6, signRowY + 10, 'filled', bold, 8);
  // Small AUTO label
  page.drawText('AUTO', { x: midThirdX + 6, y: signRowY + 4, size: 6, font: helv, color: rgb(0.2, 0.5, 0.2) });

  // Semnatura (right third)
  const sigThirdX = formX + thirdW * 2;
  page.drawRectangle({ x: sigThirdX, y: signRowY, width: thirdW, height: signRowH, borderColor: BORDER, borderWidth: 0.5 });
  page.drawText('Semnatura', { x: sigThirdX + (thirdW / 2) - 20, y: signRowY + 4, size: 8, font: bold, color: BLACK });

  // Embed actual signature image from vault
  if (data.signatureUrl) {
    try {
      const sigResp = await fetch(data.signatureUrl);
      const sigBuf = await sigResp.arrayBuffer();
      const sigUrl = data.signatureUrl.toLowerCase();
      let embeddedSig;
      if (sigUrl.includes('.png') || sigUrl.includes('png')) {
        embeddedSig = await pdfDoc.embedPng(sigBuf);
      } else {
        embeddedSig = await pdfDoc.embedJpg(sigBuf);
      }
      const { width: imgW, height: imgH } = embeddedSig.scale(1);
      // Fit into signature area preserving aspect ratio
      const maxW = thirdW - 12;
      const maxH = signRowH - 18;
      const scale = Math.min(maxW / imgW, maxH / imgH);
      const dw = imgW * scale;
      const dh = imgH * scale;
      const drawX = sigThirdX + (thirdW - dw) / 2;
      const drawY = signRowY + 12 + (maxH - dh) / 2;
      page.drawImage(embeddedSig, { x: drawX, y: drawY, width: dw, height: dh });
    } catch {
      page.drawText('[semnatura din Seif]', { x: sigThirdX + 6, y: signRowY + signRowH - 22, size: 7, font: regular, color: BLUE });
    }
  } else {
    // Missing signature warning
    page.drawRectangle({ x: sigThirdX + 4, y: signRowY + 14, width: thirdW - 8, height: signRowH - 24, color: rgb(1, 0.96, 0.88), borderColor: rgb(0.9, 0.7, 0.2), borderWidth: 0.5 });
    page.drawText('! Semnatura lipsa din Seif', { x: sigThirdX + 6, y: signRowY + 22, size: 6.5, font: helv, color: RED });
  }

  curY = signRowY - 8;

  // ── LEGAL FOOTER ─────────────────────────────────────────────────
  page.drawText('Cererea completata cu date inexacte si omisiuni este nula de drept.', {
    x: formX, y: curY - 10, size: 7.5, font: regular, color: BLACK,
  });
  page.drawText('Sunt de acord cu prelucrarea datelor prezentate in conformitate cu Legea 677/2001.', {
    x: formX, y: curY - 22, size: 7.5, font: boldItalic, color: BLACK,
  });

  // ── BOTTOM FOOTER ────────────────────────────────────────────────
  page.drawLine({ start: { x: formX, y: 28 }, end: { x: formX + formW, y: 28 }, thickness: 0.4, color: BORDER });
  page.drawText('Generat de NoQueue AI · CIORNA NEOFICIALA · Generated draft — review before submission at passport authority', {
    x: formX, y: 18, size: 5.5, font: helv, color: DARK_GRAY,
  });
  const genDate = new Date().toLocaleString('ro-RO');
  page.drawText(`Generat: ${safe(genDate)} · pasapoarte.mai.gov.ro`, {
    x: PAGE_W - MR - 180, y: 18, size: 5.5, font: helv, color: DARK_GRAY,
  });

  // ── MISSING FIELDS STAMP ─────────────────────────────────────────
  if (data.missing.length > 0) {
    page.drawRectangle({ x: formX, y: 32, width: formW, height: 16, color: rgb(1, 0.93, 0.85) });
    page.drawText(
      `[!] ${data.missing.length} camp(uri) lipsa din Seif: ${data.missing.slice(0, 5).join(', ')}${data.missing.length > 5 ? '...' : ''}`,
      { x: formX + 4, y: 37, size: 6.5, font: helvBold, color: RED }
    );
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}