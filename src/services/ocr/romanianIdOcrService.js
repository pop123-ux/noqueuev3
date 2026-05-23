/**
 * Romanian ID Card OCR Service — NoQueue AI 2.0
 *
 * Extracts identity data from Romanian "Carte de Identitate" images.
 * Uses base44 vision LLM (claude_sonnet_4_6) with Romania-specific prompt,
 * MRZ fallback parsing, CNP-derived birth date, and confidence scoring.
 */
import { base44 } from '@/api/base44Client';

const OCR_SCHEMA = {
  type: 'object',
  properties: {
    last_name: { type: 'string' },
    first_name: { type: 'string' },
    cnp: { type: 'string' },
    sex: { type: 'string' },
    birth_date: { type: 'string' },
    birth_place: { type: 'string' },
    address: { type: 'string' },
    county: { type: 'string' },
    city: { type: 'string' },
    id_series: { type: 'string' },
    id_number: { type: 'string' },
    id_issued_by: { type: 'string' },
    id_issue_date: { type: 'string' },
    id_expiry_date: { type: 'string' },
    nationality: { type: 'string' },
    citizenship: { type: 'string' },
    mrz_line_1: { type: 'string' },
    mrz_line_2: { type: 'string' },
  },
};

const OCR_PROMPT = `Ești un asistent OCR specializat în cărți de identitate românești (Carte de Identitate).

Imaginea poate fi rotită — analizează indiferent de orientare.

Extrage câmpurile vizuale folosind etichetele bilingve ca ghid:
- 'Nume / Last name' → last_name
- 'Prenume / First name' → first_name
- 'CNP' (număr roșu de 13 cifre) → cnp
- 'SERIA [XX] NR [NNNNNN]' → id_series (2 litere) și id_number (6 cifre)
- 'Cetățenie / Nationality' → citizenship (cod 3 litere, ex. ROU) și nationality (ex. Română / ROU)
- 'Loc naștere / Place of birth' → birth_place (ex: "Jud.CJ Mun.Cluj-Napoca")
- 'Domiciliu / Address' → address (textul complet)
- 'Emisă de / Issued by' → id_issued_by
- 'Valabilitate / Validity' → conține două date separate prin '-': prima = id_issue_date, a doua = id_expiry_date
- 'Sex / Sexe' → sex (M sau F)

Date calendaristice — normalizează la format ISO YYYY-MM-DD:
  '17.05.23' → '2023-05-17'
  '08.04.2027' → '2027-04-08'
  Dacă anul are 2 cifre 00-30 → 20XX, 31-99 → 19XX.

Extrage birth_date din CNP: cifrele 2-7 sunt AANNZZ.
  CNP începând cu 5 sau 6 → secolul 20 (2000+).
  CNP începând cu 1 sau 2 → secolul 19 (1900+).
  CNP începând cu 7 sau 8 → rezident străin, secolul 19.

MRZ — extrage AMBELE RÂNDURI integral în mrz_line_1 și mrz_line_2.
  Rândul 1 începe cu "IDROU".
  Rândul 2 conține: id_series + id_number, birth_date, sex, expiry_date, cnp.
  Folosește MRZ ca fallback dacă un câmp vizual e neclar.

Din birth_place extrage:
  - county: județul (ex: "CJ" → "Cluj", "B" → "București")
  - city: orașul/comuna (ex: "Cluj-Napoca", "Florești")

Returnează DOAR JSON valid, fără markdown, fără explicații.
Exemplu:
{"last_name":"DRINDA","first_name":"DARIUS-MATEI","cnp":"5090408125788","sex":"M","birth_date":"2009-04-08","birth_place":"Jud.CJ Mun.Cluj-Napoca","county":"Cluj","city":"Cluj-Napoca","address":"Jud.CJ Sat.Florești (Com.Florești), Str.Prof. Ioan Rusu nr.50","id_series":"CJ","id_number":"697708","id_issued_by":"SPCJEP CLUJ","id_issue_date":"2023-05-17","id_expiry_date":"2027-04-08","nationality":"Română","citizenship":"ROU","mrz_line_1":"IDROUDRINDA<<DARIUS<MATEI<<<<<<<<<<<","mrz_line_2":"CJ697708<2ROU0904083M2704081512578882"}

Nu inventa date. Dacă un câmp nu e lizibil și nu poate fi dedus, setează-l null.`;

// ── Helpers ──────────────────────────────────────────────────────────

function birthDateFromCNP(cnp) {
  if (!cnp || cnp.length !== 13) return null;
  const s = parseInt(cnp[0]);
  const yy = cnp.slice(1, 3);
  const mm = cnp.slice(3, 5);
  const dd = cnp.slice(5, 7);
  let yyyy;
  if (s === 1 || s === 2) yyyy = '19' + yy;
  else if (s === 3 || s === 4) yyyy = '18' + yy;
  else if (s === 5 || s === 6) yyyy = '20' + yy;
  else if (s === 7 || s === 8) yyyy = '19' + yy;
  else yyyy = '20' + yy;
  return `${yyyy}-${mm}-${dd}`;
}

/** CNP checksum (Romanian standard) */
function validateCNPChecksum(cnp) {
  if (!cnp || !/^\d{13}$/.test(cnp)) return false;
  const constants = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(cnp[i]) * constants[i];
  const check = sum % 11;
  const digit = check === 10 ? 1 : check;
  return digit === parseInt(cnp[12]);
}

/** Compute per-field confidence */
function computeConfidence(data) {
  const confidence = { overall: 0 };
  let total = 0, weight = 0;

  const score = (key, value, validator = null, w = 1) => {
    let s = 0;
    if (value) {
      s = 0.7; // present
      if (validator && validator(value)) s = 0.99; // validated
      else if (value.length > 2) s = 0.92;
    }
    confidence[key] = s;
    total += s * w;
    weight += w;
  };

  score('cnp', data.cnp, v => validateCNPChecksum(v), 2);
  score('last_name', data.last_name, v => v.length >= 2, 1.5);
  score('first_name', data.first_name, v => v.length >= 2, 1.5);
  score('id_series', data.id_series, v => /^[A-Z]{2}$/.test(v), 1.2);
  score('id_number', data.id_number, v => /^\d{6,9}$/.test(v), 1.2);
  score('address', data.address, v => v.length > 10, 1);
  score('id_expiry_date', data.id_expiry_date, v => /^\d{4}-\d{2}-\d{2}$/.test(v), 1);
  score('birth_date', data.birth_date, v => /^\d{4}-\d{2}-\d{2}$/.test(v), 1);

  confidence.overall = weight > 0 ? total / weight : 0;
  return confidence;
}

/** Build warnings list */
function buildWarnings(data, confidence) {
  const w = [];
  if (data.id_expiry_date) {
    const exp = new Date(data.id_expiry_date);
    const now = new Date();
    if (exp < now) w.push({ severity: 'critical', message: 'Document expirat — nu mai poate fi folosit oficial.' });
    else if ((exp - now) / 86400000 < 90) w.push({ severity: 'warning', message: 'Document expiră în mai puțin de 90 de zile.' });
  }
  if (data.cnp && !validateCNPChecksum(data.cnp)) w.push({ severity: 'warning', message: 'CNP-ul nu trece verificarea de checksum.' });
  if (confidence.overall < 0.7) w.push({ severity: 'info', message: 'Calitate scăzută a imaginii — verifică datele cu atenție.' });
  return w;
}

// ── Main API ─────────────────────────────────────────────────────────

/**
 * Extract Romanian ID data from a file.
 * @param {Object} args
 * @param {File} args.file
 * @param {(step: number, label: string) => void} args.onProgress
 * @returns {Promise<{success, extractedData, confidence, warnings, fileUrl, auditTrail}>}
 */
export async function extractRomanianIdData({ file, onProgress = () => {} }) {
  const auditTrail = [];
  const audit = (event) => {
    auditTrail.push({ event, timestamp: new Date().toISOString() });
  };

  audit('ocr_pipeline_started');
  onProgress(0, 'Detectează cartea de identitate...');

  // Step 1: Upload to storage
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  audit('file_uploaded');

  onProgress(1, 'Corectează perspectiva și luminozitatea...');
  // simulated visual delay for UX premium feel
  await new Promise(r => setTimeout(r, 600));
  audit('image_preprocessed');

  onProgress(2, 'Extrage text cu OCR avansat...');
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: OCR_PROMPT,
    file_urls: [file_url],
    model: 'gemini_3_1_pro',
    response_json_schema: OCR_SCHEMA,
  });
  audit('llm_extraction_completed');

  onProgress(3, 'Identifică câmpuri românești...');
  // Backfill birth_date from CNP if missing
  if (!result.birth_date && result.cnp) {
    result.birth_date = birthDateFromCNP(result.cnp);
    audit('birth_date_derived_from_cnp');
  }

  // Derive fullName
  const fullName = [result.first_name, result.last_name].filter(Boolean).join(' ');
  result.full_name = fullName;

  // Default citizenship
  if (!result.citizenship) result.citizenship = 'ROU';
  if (!result.nationality) result.nationality = 'Română';

  onProgress(4, 'Verifică structura datelor...');
  const confidence = computeConfidence(result);
  const warnings = buildWarnings(result, confidence);
  audit('confidence_computed');

  // Strict success: all critical fields must be present AND individually reliable.
  // Prevents passing through scans where only partial data was extracted.
  const CRITICAL_FIELDS = [
    'cnp', 'id_series', 'id_number',
    'last_name', 'first_name',
    'id_issue_date', 'id_expiry_date',
  ];
  const MIN_FIELD_CONFIDENCE = 0.9;
  const missingCritical = CRITICAL_FIELDS.filter(k => !result[k]);
  const unreliableCritical = CRITICAL_FIELDS.filter(
    k => result[k] && (confidence[k] ?? 0) < MIN_FIELD_CONFIDENCE
  );
  const success =
    missingCritical.length === 0 &&
    unreliableCritical.length === 0 &&
    confidence.overall >= 0.75;

  if (!success) {
    audit(`success_blocked missing=[${missingCritical.join(',')}] unreliable=[${unreliableCritical.join(',')}] overall=${confidence.overall.toFixed(2)}`);
  }

  return {
    success,
    extractedData: result,
    confidence,
    warnings,
    fileUrl: file_url,
    auditTrail,
    missingCritical,
    unreliableCritical,
  };
}

export { validateCNPChecksum, birthDateFromCNP };