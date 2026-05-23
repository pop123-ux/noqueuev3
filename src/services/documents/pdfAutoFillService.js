/**
 * PDF Auto-Fill Service — Passport Application Draft
 * Maps Profile Safe data → editable draft object → exportable PDF
 */
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { passportProcedure, matchPassportProfile } from '@/lib/rag/passportProcedure';

/** Safe ASCII-only text for pdf-lib WinAnsi encoding */
function safe(text) {
  if (!text) return '';
  return String(text)
    .replace(/[\u0103]/g, 'a').replace(/[\u0102]/g, 'A')
    .replace(/[\u00E2]/g, 'a').replace(/[\u00C2]/g, 'A')
    .replace(/[\u00EE]/g, 'i').replace(/[\u00CE]/g, 'I')
    .replace(/[\u0219\u015F]/g, 's').replace(/[\u0218\u015E]/g, 'S')
    .replace(/[\u021B\u0163]/g, 't').replace(/[\u021A\u0162]/g, 'T')
    .replace(/[^\x00-\xFF]/g, '?');
}

/** Build the editable draft object from profile */
export function generatePassportDraft(profile) {
  const { filled, missing, readiness } = matchPassportProfile(profile);

  const editableFields = {
    full_name: [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || '',
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    cnp: profile?.cnp || '',
    birth_date: profile?.birth_date || '',
    birth_place: profile?.birth_place || '',
    father_name: profile?.father_name || '',
    mother_name: profile?.mother_name || '',
    id_series: profile?.id_series || '',
    id_number: profile?.id_number || '',
    address: profile?.address_line_1 || '',
    city: profile?.city || '',
    county: profile?.county || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    citizenship: profile?.citizenship || 'Roman/Romana',
    country: 'Romania',
    urgency_type: 'urgent',
    request_type: 'ELIBERAREA PASAPORTULUI SIMPLU ELECTRONIC',
  };

  return {
    id: `passport_draft_${Date.now()}`,
    type: 'passport_request',
    generatedAt: new Date().toISOString(),
    procedure: passportProcedure,
    fieldsUsed: filled.map(f => f.key),
    missingFields: missing.map(f => f.key),
    missingFieldLabels: missing.map(f => f.label),
    filledFieldLabels: filled.map(f => f.label),
    editableFields,
    readiness,
    reviewRequired: true,
  };
}

/** Generate the PDF bytes from a draft object */
export async function exportPassportPdf(draft) {
  const f = draft.editableFields;
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const regular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const bold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const navy = rgb(0.05, 0.10, 0.22);
  const blue = rgb(0.15, 0.38, 0.92);
  const gray = rgb(0.45, 0.45, 0.45);
  const black = rgb(0, 0, 0);
  const white = rgb(1, 1, 1);
  const warning = rgb(0.95, 0.75, 0.05);
  const red = rgb(0.85, 0.15, 0.15);
  const lightBlue = rgb(0.90, 0.94, 1.0);

  const margin = 50;
  let y = height - margin;

  // ── DRAFT WATERMARK BANNER ─────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 28, width, height: 28, color: warning });
  const warnText = 'CIORNA GENERATA - VERIFICATI INAINTE DE DEPUNERE - NOT AN OFFICIAL FORM';
  const warnW = helveticaBold.widthOfTextAtSize(warnText, 7.5);
  page.drawText(warnText, {
    x: (width - warnW) / 2, y: height - 18,
    size: 7.5, font: helveticaBold, color: navy,
  });

  y = height - 50;

  // ── HEADER ─────────────────────────────────────────────────────
  // Institution top left
  page.drawText('CONSULATUL GENERAL AL ROMANIEI', { x: margin, y, size: 9, font: bold, color: black });
  y -= 13;
  page.drawText('/ Serviciul Pasapoarte Cluj-Napoca', { x: margin, y, size: 8, font: regular, color: gray });

  // Nr. field top left
  y -= 20;
  page.drawText('Nr. _____________ / _____________', { x: margin, y, size: 8.5, font: regular, color: black });

  // APROB block - top right
  page.drawText('APROB', { x: width - margin - 80, y: height - 65, size: 10, font: bold, color: black });
  page.drawText('Serviciul Pasapoarte Cluj', { x: width - margin - 95, y: height - 80, size: 8, font: regular, color: black });

  y -= 30;

  // ── TITLE ──────────────────────────────────────────────────────
  const title1 = 'C  E  R  E  R  E';
  const title2 = 'pentru efectuarea de servicii consulare';
  const t1w = bold.widthOfTextAtSize(title1, 14);
  const t2w = regular.widthOfTextAtSize(title2, 10);
  page.drawText(title1, { x: (width - t1w) / 2, y, size: 14, font: bold, color: black });
  y -= 18;
  page.drawText(title2, { x: (width - t2w) / 2, y, size: 10, font: regular, color: black });
  y -= 30;

  // ── DIVIDER ────────────────────────────────────────────────────
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.5, color: gray });
  y -= 20;

  // ── BODY TEXT ─────────────────────────────────────────────────
  const contentW = width - margin * 2;

  function field(value, fallback = '________________________') {
    return value && value.trim() ? safe(value) : fallback;
  }

  // Line 1: Subsemnatul(a)
  const fullName = field(f.full_name, '_________________________________');
  page.drawText('Subsemnatul(a) ', { x: margin, y, size: 9.5, font: regular, color: black });
  const nameX = margin + regular.widthOfTextAtSize('Subsemnatul(a) ', 9.5);
  page.drawText(fullName, { x: nameX, y, size: 9.5, font: bold, color: f.full_name ? blue : red });
  y -= 16;

  // Line 2: nascut/a data de
  const birthDateStr = field(f.birth_date, '________________');
  const birthPlace = field(f.city || f.birth_place, '________________');
  const country = field(f.country, 'Romania');
  page.drawText(`nascut/a la data de ${birthDateStr}, in localitatea ${birthPlace}, tara ${country},`, {
    x: margin, y, size: 9.5, font: regular, color: black,
  });
  y -= 16;

  // Line 3: Buletin identitate
  const idSeries = field(f.id_series, '____');
  const idNumber = field(f.id_number, '______');
  page.drawText(`avand buletinul de identitate, seria ${idSeries}, nr. ${idNumber}, cu domiciliul in tara`, {
    x: margin, y, size: 9.5, font: regular, color: black,
  });
  y -= 16;

  // Line 4: Adresa
  const addr = field(f.address, '______________________________');
  const cityStr = field(f.city, '________________');
  page.drawText(`${country}, localitatea ${cityStr}, strada ${addr},`, {
    x: margin, y, size: 9.5, font: regular, color: black,
  });
  y -= 16;

  // Line 5: rog sa mi se aprobe
  page.drawText('rog sa mi se aprobe efectuarea urmatorului serviciu consular:', {
    x: margin, y, size: 9.5, font: regular, color: black,
  });
  y -= 28;

  // ── SERVICE TITLE ──────────────────────────────────────────────
  const svcTitle = safe(f.request_type);
  const svcW = bold.widthOfTextAtSize(svcTitle, 12);
  page.drawText(svcTitle, { x: (width - svcW) / 2, y, size: 12, font: bold, color: black });
  y -= 28;

  // ── URGENCY BANNER ─────────────────────────────────────────────
  if (f.urgency_type === 'urgent') {
    page.drawRectangle({ x: margin, y: y - 8, width: contentW, height: 22, color: lightBlue });
    page.drawText('REGIM DE URGENTA - Taxa: 1032 RON (de 4x taxa standard)', {
      x: margin + 8, y: y + 6, size: 8.5, font: helveticaBold, color: navy,
    });
    y -= 26;
  }
  y -= 10;

  // ── ATTACHED DOCUMENTS ─────────────────────────────────────────
  page.drawText('Anexez urmatoarele documente:', { x: margin, y, size: 10, font: bold, color: black });
  y -= 16;

  const docs = passportProcedure.requiredDocuments.filter(d => !d.generated);
  for (const doc of docs) {
    page.drawText('>', { x: margin + 8, y, size: 10, font: bold, color: blue });
    page.drawText(safe(doc.label), { x: margin + 22, y, size: 9, font: regular, color: black });
    y -= 13;
  }

  y -= 16;

  // ── NOTA ───────────────────────────────────────────────────────
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.4, color: rgb(0.8, 0.8, 0.8) });
  y -= 14;
  page.drawText('Nota: Taxa se plateste la orice banca (CEC, BCR, BRD) sau online inainte de depunere.', {
    x: margin, y, size: 7.5, font: regular, color: gray,
  });
  y -= 12;
  page.drawText('In cazul MINORILOR se prezinta certificatele de nastere ale parintilor si acordul notarial.', {
    x: margin, y, size: 7.5, font: regular, color: gray,
  });
  y -= 12;
  page.drawText('Programare online: programari.pasapoarte.mai.gov.ro', {
    x: margin, y, size: 7.5, font: regular, color: blue,
  });

  y -= 28;

  // ── MISSING FIELDS WARNING ─────────────────────────────────────
  if (draft.missingFieldLabels?.length > 0) {
    page.drawRectangle({ x: margin, y: y - 18, width: contentW, height: 26, color: rgb(1, 0.93, 0.88) });
    page.drawText(`[!] ${draft.missingFieldLabels.length} campuri lipsa din Seif: ${draft.missingFieldLabels.slice(0, 4).join(', ')}${draft.missingFieldLabels.length > 4 ? '...' : ''}`,
      { x: margin + 8, y: y - 6, size: 7.5, font: helveticaBold, color: red });
    y -= 36;
  }

  y -= 10;

  // ── PHONE & SIGNATURE ─────────────────────────────────────────
  const phoneStr = field(f.phone, '_________________________');
  page.drawText('Numarul de telefon la care pot fi contactat: ', { x: margin, y, size: 9.5, font: regular, color: black });
  const phoneX = margin + regular.widthOfTextAtSize('Numarul de telefon la care pot fi contactat: ', 9.5);
  page.drawText(phoneStr, { x: phoneX, y, size: 9.5, font: bold, color: f.phone ? blue : red });

  y -= 36;

  // Date + Semnatura
  page.drawText('Data ________________________', { x: margin, y, size: 9.5, font: regular, color: black });
  page.drawText('Semnatura _______________________', { x: width - margin - 180, y, size: 9.5, font: regular, color: black });

  y -= 16;
  page.drawText('/EM/', { x: margin, y, size: 8, font: regular, color: gray });

  // ── FOOTER ─────────────────────────────────────────────────────
  page.drawLine({ start: { x: margin, y: 36 }, end: { x: width - margin, y: 36 }, thickness: 0.4, color: rgb(0.8, 0.8, 0.8) });
  page.drawText('Generat de NoQueue AI · Cluj-Napoca · CIORNA NEOFICIALA · Verificati la institutie inainte de depunere.',
    { x: margin, y: 22, size: 6, font: helvetica, color: gray });
  page.drawText(`Generat: ${new Date().toLocaleString('ro-RO')}`,
    { x: width - margin - 110, y: 22, size: 6, font: helvetica, color: gray });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}