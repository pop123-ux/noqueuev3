/**
 * passportFieldMapper.js
 * Maps Profile Safe data to structured passport form fields
 * Based on Romanian "Cerere pentru eliberarea unui nou pasaport" (Anexa 10)
 * 
 * Biometric fields (height, eye color) auto-default if missing from Seif
 */

import { getHeight, getEyeColor } from '@/lib/profile/profileBiometricSelector';

/** Split a string into individual chars padded to length */
export function toCharBoxes(str, length) {
  const chars = String(str || '').toUpperCase().replace(/\s/g, '').split('');
  const result = [];
  for (let i = 0; i < length; i++) {
    result.push(chars[i] || '');
  }
  return result;
}

/** Split date string (YYYY-MM-DD or DD.MM.YYYY) into { day, month, year } boxes */
export function parseDateBoxes(dateStr) {
  if (!dateStr) return { day: ['', ''], month: ['', ''], year: ['', '', '', ''] };
  let d, m, y;
  if (dateStr.includes('-')) {
    [y, m, d] = dateStr.split('-');
  } else if (dateStr.includes('.')) {
    [d, m, y] = dateStr.split('.');
  } else {
    return { day: ['', ''], month: ['', ''], year: ['', '', '', ''] };
  }
  return {
    day: (d || '').padStart(2, '').split(''),
    month: (m || '').padStart(2, '').split(''),
    year: (y || '').split(''),
  };
}

/**
 * Map profile → structured form field data
 * Returns an object matching each form section
 */
export function mapProfileToPassportForm(profile, options = {}) {
  const isUrgent = options.isUrgent ?? true;
  const hasPreviousPassport = !!(profile?.previous_passport_number);

  // CNP — 13 digits, one per box
  const cnpBoxes = toCharBoxes(profile?.cnp || '', 13);

  // Sex checkboxes
  const sex = (profile?.sex || '').toUpperCase();
  const sexM = sex === 'M';
  const sexF = sex === 'F';

  // Birth date boxes
  const birthDate = parseDateBoxes(profile?.birth_date);

  // Name boxes — 26 chars each
  const numeBoxes = toCharBoxes(profile?.last_name || '', 26);
  const prenumeBoxes = toCharBoxes(profile?.first_name || '', 26);
  const numeAnteriorBoxes = toCharBoxes(profile?.maiden_name || '', 26);

  // Father / mother — 18 chars each
  const tatBoxes = toCharBoxes(profile?.father_name || '', 18);
  const mamBoxes = toCharBoxes(profile?.mother_name || '', 18);

  // Birth place — 24 chars
  const locuNasterii = toCharBoxes(profile?.birth_place || '', 24);

  // County — 14 chars
  const judetBoxes = toCharBoxes(profile?.county || '', 14);

  // Domiciliu — free text
  const domiciliu = [profile?.address_line_1, profile?.city, profile?.county]
    .filter(Boolean).join(', ');

  // Phone — free text
  const telefon = profile?.phone || '';

  // ID document fields
  const idSeries = toCharBoxes(profile?.id_series || '', 2);
  const idNumber = toCharBoxes(profile?.id_number || '', 6);

  // Previous passport
  const prevPassportBoxes = toCharBoxes(profile?.previous_passport_number || '', 8);
  const prevPassportDate = parseDateBoxes(profile?.previous_passport_date || '');
  const prevPassportCounty = profile?.previous_passport_county || '';

  // Urgency
  const urgentDA = isUrgent;
  const urgentNU = !isUrgent;

  // ── Auto-filled fields ──────────────────────────────────────────────────
  // Submission date: current date in Bucharest timezone, DD/MM/YYYY
  const bucharestDate = new Date().toLocaleDateString('ro-RO', {
    timeZone: 'Europe/Bucharest',
    day: '2-digit', month: '2-digit', year: 'numeric',
  }); // "23.05.2026"
  const [subD, subM, subY] = bucharestDate.split('.');
  const submissionDateBoxes = [...(subD || '').split(''), ...(subM || '').split(''), ...(subY || '').split('')];

  // Height & eye color — AUTO-DEFAULT if missing from Seif
  const heightCm = String(getHeight(profile));
  const eyeColor = getEyeColor(profile);

  // Signature
  const signatureUrl = profile?.signature_file_url || null;

  // Missing fields detection
  const missing = [];
  if (!profile?.cnp) missing.push('CNP');
  if (!profile?.last_name) missing.push('Nume');
  if (!profile?.first_name) missing.push('Prenume');
  if (!profile?.birth_date) missing.push('Data nasterii');
  if (!profile?.birth_place) missing.push('Locul nasterii');
  if (!profile?.sex) missing.push('Sex');
  if (!profile?.county) missing.push('Judet');
  if (!profile?.address_line_1) missing.push('Domiciliu');
  if (!profile?.phone) missing.push('Telefon');
  if (!profile?.id_series) missing.push('Seria CI');
  if (!profile?.id_number) missing.push('Nr. CI');
  if (!profile?.father_name) missing.push('Prenumele tatalui');
  if (!profile?.mother_name) missing.push('Prenumele mamei');
  // Biometric fields now auto-default — only show missing if user explicitly cleared them
  if (profile?.height_cm === '' || profile?.height_cm === null) missing.push('Inaltime');
  if (profile?.eye_color === '' || profile?.eye_color === null) missing.push('Culoarea ochilor');
  if (!signatureUrl) missing.push('Semnatura');

  return {
    cnpBoxes,
    sexM, sexF,
    birthDate,
    numeBoxes,
    prenumeBoxes,
    numeAnteriorBoxes,
    tatBoxes,
    mamBoxes,
    locuNasterii,
    judetBoxes,
    domiciliu,
    telefon,
    idSeries,
    idNumber,
    hasPreviousPassport,
    prevPassportBoxes,
    prevPassportDate,
    prevPassportCounty,
    urgentDA,
    urgentNU,
    isUrgent,
    submissionDateBoxes,
    heightCm,
    eyeColor,
    signatureUrl,
    missing,
    filledCount: 16 - missing.length,
    readiness: Math.round(((16 - missing.length) / 16) * 100),
  };
}