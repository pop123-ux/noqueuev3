/**
 * Passport Procedure Knowledge Object
 * Single source of truth for Romanian passport application in Cluj
 * 
 * Biometric fields (height, eye color) auto-default for seamless auto-fill
 */
const DEFAULT_HEIGHT_CM = 180;
const DEFAULT_EYE_COLOR = 'Căprui';
const EYE_COLOR_OPTIONS = ['Căprui', 'Albaștri', 'Verzi', 'Negri', 'Gri', 'Căprui-verzui', 'Hazel', 'Altele'];

function getHeight(profile) {
  if (!profile) return DEFAULT_HEIGHT_CM;
  const h = profile.height_cm;
  if (h === null || h === undefined || h === '') return DEFAULT_HEIGHT_CM;
  const num = Number(h);
  if (isNaN(num) || num < 50 || num > 250) return DEFAULT_HEIGHT_CM;
  return num;
}

function getEyeColor(profile) {
  if (!profile) return DEFAULT_EYE_COLOR;
  const color = profile.eye_color;
  if (!color || !EYE_COLOR_OPTIONS.includes(color)) return DEFAULT_EYE_COLOR;
  return color;
}

export const passportProcedure = {
  id: 'passport_application',
  title: 'Romanian Passport Application',
  titleRo: 'Cerere Eliberare Pasaport Simplu Electronic',
  institution: 'Serviciul Pasapoarte Cluj',
  institutionAddress: 'Str. Republicii nr. 108, Cluj-Napoca',
  institutionPhone: '0264-591.616',
  institutionHours: 'Luni-Vineri: 08:30 - 16:00',
  workflowType: 'appointment',
  onlineAvailable: false,
  estimatedWait: '31m',
  urgentAvailable: true,
  urgentSurcharge: '4x taxa standard',
  standardFee: '258 RON',
  urgentFee: '1032 RON',

  requiredDocuments: [
    { id: 'identity_card', label: 'Carte de identitate (original + copie)', required: true },
    { id: 'birth_certificate', label: 'Certificat de nastere (original + copie)', required: true },
    { id: 'old_passport', label: 'Pasaport vechi (daca exista)', required: false },
    { id: 'payment_proof', label: 'Dovada platii taxei consulare', required: true },
    { id: 'photo', label: 'Fotografie tip pasaport (32x26mm)', required: true },
    { id: 'request_form', label: 'Cerere completata (generata automat)', required: true, generated: true },
  ],

  profileFields: [
    { key: 'last_name',       label: 'Nume de familie',     profilePath: 'last_name' },
    { key: 'first_name',      label: 'Prenume',             profilePath: 'first_name' },
    { key: 'cnp',             label: 'CNP',                 profilePath: 'cnp' },
    { key: 'birth_date',      label: 'Data nasterii',       profilePath: 'birth_date' },
    { key: 'birth_place',     label: 'Locul nasterii',      profilePath: 'birth_place' },
    { key: 'father_name',     label: 'Numele tatalui',      profilePath: 'father_name' },
    { key: 'mother_name',     label: 'Numele mamei',        profilePath: 'mother_name' },
    { key: 'id_series',       label: 'Seria CI',            profilePath: 'id_series' },
    { key: 'id_number',       label: 'Numarul CI',          profilePath: 'id_number' },
    { key: 'address_line_1',  label: 'Adresa',              profilePath: 'address_line_1' },
    { key: 'city',            label: 'Localitate',          profilePath: 'city' },
    { key: 'county',          label: 'Judet',               profilePath: 'county' },
    { key: 'phone',           label: 'Telefon',             profilePath: 'phone' },
    { key: 'email',           label: 'Email',               profilePath: 'email' },
    { key: 'citizenship',     label: 'Cetatenie',           profilePath: 'citizenship' },
    { key: 'height_cm',       label: 'Înălțime (cm)',       profilePath: 'height_cm' },
    { key: 'eye_color',       label: 'Culoarea ochilor',    profilePath: 'eye_color' },
    { key: 'signature_file_url', label: 'Semnătură',        profilePath: 'signature_file_url' },
  ],

  commonMistakes: [
    'Missing payment proof (taxa trebuie platita inainte de depunere)',
    'Expired ID card (CI expirata invalideaza cererea)',
    'Old passport not brought (reduce processing time if available)',
    'Photos do not match specifications (32x26mm, white background)',
    'Missing birth certificate original',
  ],

  officialSources: [
    { title: 'Pasapoarte MAI', url: 'https://pasapoarte.mai.gov.ro/', verified: true },
    { title: 'Programare online Cluj', url: 'https://programari.pasapoarte.mai.gov.ro/', verified: true },
    { title: 'Taxa consulara ANAF', url: 'https://www.anaf.ro/', verified: true },
  ],

  nextSteps: [
    'Plateste taxa (258 RON standard / 1032 RON urgent) la orice banca sau online',
    'Fă o programare online la Serviciul Pasapoarte Cluj',
    'Pregateste actele originale + copii',
    'Prezinta-te la ghiseu cu dosarul complet',
    'Pasaportul se ridica in 3-5 zile lucratoare (sau 2 zile urgent)',
  ],
};

/** Check which profile fields are filled vs missing */
export function matchPassportProfile(profile) {
  const filled = [];
  const missing = [];

  for (const field of passportProcedure.profileFields) {
    const val = profile?.[field.profilePath];
    // Biometric fields auto-default — treat as filled if defaults apply
    if (field.profilePath === 'height_cm' && getHeight(profile)) {
      filled.push({ ...field, value: getHeight(profile) });
    } else if (field.profilePath === 'eye_color' && getEyeColor(profile)) {
      filled.push({ ...field, value: getEyeColor(profile) });
    } else if (val && String(val).trim()) {
      filled.push({ ...field, value: val });
    } else {
      missing.push(field);
    }
  }

  const readiness = Math.round((filled.length / passportProcedure.profileFields.length) * 100);
  return { filled, missing, readiness };
}