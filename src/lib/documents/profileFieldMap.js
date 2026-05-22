/**
 * Canonical profile field mapping for Romanian bureaucratic forms.
 * Maps profile entity fields → human-readable Romanian form labels.
 */

export const REQUIRED_FIELDS_LABELS = {
  first_name:       "First name (Prenume)",
  last_name:        "Last name (Nume)",
  full_name:        "Full name",
  cnp:              "CNP (Personal Numeric Code)",
  sex:              "Sex / Gender",
  birth_date:       "Date of birth",
  birth_place:      "Place of birth",
  father_name:      "Father's first name",
  mother_name:      "Mother's first name",
  email:            "Email address",
  phone:            "Phone number",
  citizenship:      "Citizenship",
  address_line_1:   "Address (Street)",
  city:             "City",
  county:           "County (Județ)",
  postal_code:      "Postal code",
  country:          "Country",
  id_series:        "ID series (Serie CI)",
  id_number:        "ID number (Nr. CI)",
  id_issued_by:     "ID issued by (Emisă de)",
  id_issue_date:    "ID issue date",
  id_expiry_date:   "ID expiry date",
  marital_status:   "Marital status",
  signature_file_url:  "Signature (uploaded image)",
  id_front_file_url:   "ID card — front scan",
  id_back_file_url:    "ID card — back scan",
  headshot_file_url:   "Headshot / photo",
};

/**
 * Check which required fields are missing from a profile.
 * Returns array of field keys that are empty/null.
 */
export function getMissingFields(profile, requiredFields) {
  if (!profile) return requiredFields;
  return requiredFields.filter(field => {
    const val = profile[field];
    return !val || (typeof val === 'string' && val.trim() === '');
  });
}

/**
 * Compute profile completeness score (0–100).
 */
export function getProfileCompleteness(profile) {
  if (!profile) return 0;
  const allFields = Object.keys(REQUIRED_FIELDS_LABELS);
  const assetFields = ['signature_file_url', 'id_front_file_url', 'id_back_file_url'];
  const coreFields = allFields.filter(f => !assetFields.includes(f));
  
  let score = 0;
  const coreWeight = 70;
  const assetWeight = 30;

  const coreFilled = coreFields.filter(f => profile[f] && String(profile[f]).trim() !== '').length;
  score += Math.round((coreFilled / coreFields.length) * coreWeight);

  const assetFilled = assetFields.filter(f => profile[f] && String(profile[f]).trim() !== '').length;
  score += Math.round((assetFilled / assetFields.length) * assetWeight);

  return Math.min(score, 100);
}

/**
 * Validate Romanian CNP (13-digit personal numeric code).
 * Returns { valid: boolean, error?: string }
 */
export function validateCNP(cnp) {
  if (!cnp) return { valid: false, error: "CNP is required" };
  const clean = String(cnp).replace(/\s/g, '');
  if (!/^\d{13}$/.test(clean)) return { valid: false, error: "CNP must be exactly 13 digits" };
  
  const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(clean[i]) * weights[i];
  const remainder = sum % 11;
  const checkDigit = remainder === 10 ? 1 : remainder;
  
  if (parseInt(clean[12]) !== checkDigit) return { valid: false, error: "CNP checksum invalid" };
  return { valid: true };
}

/**
 * Extract birth date from CNP (returns ISO string or null).
 */
export function birthDateFromCNP(cnp) {
  if (!cnp || cnp.length < 7) return null;
  const s = String(cnp)[0];
  const yy = cnp.substring(1, 3);
  const mm = cnp.substring(3, 5);
  const dd = cnp.substring(5, 7);

  let year;
  if (['1', '2'].includes(s)) year = 1900 + parseInt(yy);
  else if (['3', '4'].includes(s)) year = 1800 + parseInt(yy);
  else if (['5', '6'].includes(s)) year = 2000 + parseInt(yy);
  else return null;

  const date = `${year}-${mm}-${dd}`;
  if (isNaN(Date.parse(date))) return null;
  return date;
}

/**
 * Normalize profile data for PDF filling.
 * Returns a flat map of field names → formatted string values.
 */
export function normalizeProfileForPdf(profile) {
  if (!profile) return {};
  
  const fmt = (v) => (v ? String(v).trim() : '');
  const fmtDate = (v) => {
    if (!v) return '';
    const d = new Date(v);
    if (isNaN(d)) return fmt(v);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  };

  return {
    full_name: fmt(profile.full_name) || `${fmt(profile.last_name)} ${fmt(profile.first_name)}`.trim(),
    first_name: fmt(profile.first_name),
    last_name: fmt(profile.last_name),
    cnp: fmt(profile.cnp),
    sex: fmt(profile.sex),
    birth_date: fmtDate(profile.birth_date),
    birth_date_iso: fmt(profile.birth_date),
    birth_place: fmt(profile.birth_place),
    father_name: fmt(profile.father_name),
    mother_name: fmt(profile.mother_name),
    email: fmt(profile.email),
    phone: fmt(profile.phone),
    citizenship: fmt(profile.citizenship) || 'RO',
    address_line_1: fmt(profile.address_line_1),
    address_line_2: fmt(profile.address_line_2),
    city: fmt(profile.city),
    county: fmt(profile.county),
    postal_code: fmt(profile.postal_code),
    country: fmt(profile.country) || 'Romania',
    address_full: [profile.address_line_1, profile.city, profile.county].filter(Boolean).join(', '),
    id_series: fmt(profile.id_series),
    id_number: fmt(profile.id_number),
    id_series_number: `${fmt(profile.id_series)} ${fmt(profile.id_number)}`.trim(),
    id_issued_by: fmt(profile.id_issued_by),
    id_issue_date: fmtDate(profile.id_issue_date),
    id_expiry_date: fmtDate(profile.id_expiry_date),
    marital_status: fmt(profile.marital_status),
    date_signed: fmtDate(new Date().toISOString()),
    
    // Romanian form vocabulary
    subsemnatul: profile.sex === 'F'
      ? `Subsemnata ${fmt(profile.last_name)} ${fmt(profile.first_name)}`
      : `Subsemnatul ${fmt(profile.last_name)} ${fmt(profile.first_name)}`,
    nascut_la: `Născut${profile.sex === 'F' ? 'ă' : ''} la data de ${fmtDate(profile.birth_date)}`,
    domiciliat_in: `Domiciliat${profile.sex === 'F' ? 'ă' : ''} în ${fmt(profile.address_line_1)}, ${fmt(profile.city)}, ${fmt(profile.county)}`,
    posesor_ci: `Posesor${profile.sex === 'F' ? 'a' : ''} al CI/BI seria ${fmt(profile.id_series)} nr. ${fmt(profile.id_number)}, eliberat de ${fmt(profile.id_issued_by)}`,
    in_localitatea: `în localitatea ${fmt(profile.birth_place)}, jud.`,
  };
}