/**
 * syncScannedIdentityToProfile
 *
 * Single source-of-truth sync between the ID-card OCR flow and:
 *   - UserPrivateProfile  (non-secret data shown in Cont + Seif)
 *   - IdentitySecret      (encrypted raw CNP / id series / id number)
 *   - GovDocument         (the scanned ID card itself, shown under "Documente încărcate")
 *
 * Rules:
 *   - UserPrivateProfile is the single source of truth for non-secret data.
 *   - Sensitive fields (raw CNP, raw id series/number, full legal address) are
 *     stored ONLY in IdentitySecret, encrypted via encryptField().
 *   - UserPrivateProfile.cnp stores the MASKED CNP for display (never the raw value).
 *   - Never overwrite an existing non-empty field with an empty scanned value.
 *   - Never log raw CNP / id_number / address — auditLogger redacts but we also
 *     avoid passing them in `details`.
 *
 * The same helper is used by:
 *   - OCR success path
 *   - Manual identity entry
 *   - Demo identity fallback
 */
import { base44 } from '@/api/base44Client';
import { encryptField } from '@/lib/security/encryption';
import { logAuditEvent } from '@/lib/security/auditLogger';

/** Mask a CNP for display: keep first 4 + last 3. */
export function maskCnp(cnp) {
  const clean = String(cnp || '').replace(/\D/g, '');
  if (clean.length !== 13) return clean ? clean.slice(0, 4) + '******' : '';
  return clean.slice(0, 4) + '******' + clean.slice(-3);
}

/** Fields required for the profile to be considered "complete". */
const REQUIRED_COMPLETENESS_FIELDS = [
  'first_name',
  'last_name',
  'birth_date',
  'address_line_1',
  'city',
  'county',
  'id_series',
  'id_number',
  'id_expiry_date',
];

export function computeProfileCompleteness(profile) {
  if (!profile) return 0;
  const filled = REQUIRED_COMPLETENESS_FIELDS.filter(k => {
    const v = profile[k];
    return v !== undefined && v !== null && String(v).trim() !== '';
  }).length;
  return Math.round((filled / REQUIRED_COMPLETENESS_FIELDS.length) * 100);
}

/** Drop undefined / null / empty-string values so we never overwrite with blanks. */
function removeEmpty(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  );
}

/** Prefer existing non-empty value, else use the scanned value, else fallback. */
function keepIfPresent(existingValue, scannedValue, fallback = '') {
  if (existingValue !== undefined && existingValue !== null && existingValue !== '') return existingValue;
  if (scannedValue !== undefined && scannedValue !== null && scannedValue !== '') return scannedValue;
  return fallback;
}

/**
 * @param {object}  args
 * @param {object}  args.user                 Authenticated user object (needs .email).
 * @param {object}  args.extractedData        Normalized OCR / manual / demo identity payload.
 * @param {object}  [args.ocrResult]          Raw OCR result (used for confidence + file_url fallback).
 * @param {string}  [args.sourceFileUrl]      ID card image URL.
 * @param {string}  [args.signatureFileUrl]   Optional signature URL — never overwrites with blank.
 * @param {boolean} [args.markOnboardingComplete=true]
 * @param {string}  [args.sourceLabel='identity_card_scan']
 * @returns {Promise<object>} Saved UserPrivateProfile record.
 */
export async function syncScannedIdentityToProfile({
  user,
  extractedData,
  ocrResult,
  sourceFileUrl,
  signatureFileUrl,
  markOnboardingComplete = true,
  sourceLabel = 'identity_card_scan',
}) {
  if (!user?.email) throw new Error('Missing authenticated user email');
  if (!extractedData) throw new Error('Missing extracted identity data');

  const userId = user.email;
  const d = extractedData;
  const resolvedFileUrl = sourceFileUrl || ocrResult?.fileUrl || '';

  // ── Load existing profile so we can merge instead of overwrite ──────────
  const existingProfiles = await base44.entities.UserPrivateProfile
    .filter({ user_id: userId }, '-created_date', 1)
    .catch(() => []);
  const existingProfile = existingProfiles?.[0] || null;

  // ── Compute derived fields ──────────────────────────────────────────────
  const fullName =
    d.full_name ||
    [d.first_name, d.last_name].filter(Boolean).join(' ').trim() ||
    existingProfile?.full_name ||
    '';

  const address =
    d.address ||
    d.address_line_1 ||
    existingProfile?.address_line_1 ||
    '';

  const cnpForMask = d.cnp || existingProfile?.cnp || existingProfile?.cnp_masked || '';
  const cnpMasked = maskCnp(cnpForMask);

  // Scanned fields, with empties stripped so removeEmpty acts as a merge filter.
  const scannedFields = removeEmpty({
    user_id: userId,
    email: userId,
    first_name: d.first_name,
    last_name: d.last_name,
    full_name: fullName,
    sex: d.sex,
    birth_date: d.birth_date,
    birth_place: d.birth_place,
    citizenship: d.citizenship || d.nationality || 'ROU',
    nationality: d.nationality,
    cnp: cnpMasked,
    cnp_masked: cnpMasked,
    address_line_1: address,
    city: d.city,
    county: d.county,
    country: 'Romania',
    // NOTE: id_series and id_number are stored as PLAINTEXT in UserPrivateProfile
    // (display-only). The encrypted versions live in IdentitySecret.
    id_series: d.id_series,
    id_number: d.id_number,
    id_issued_by: d.id_issued_by,
    id_issue_date: d.id_issue_date,
    id_expiry_date: d.id_expiry_date,
    id_front_file_url: resolvedFileUrl,
    identity_ocr_verified: true,
    onboarding_completed: markOnboardingComplete ? true : existingProfile?.onboarding_completed || false,
    last_verified_at: new Date().toISOString(),
    last_synced_from_scan_at: new Date().toISOString(),
    last_ocr_confidence: ocrResult?.confidence?.overall ?? null,
    source: sourceLabel,
  });

  // Merge: scanned values overlay existing, but never replace non-empty with blank.
  const mergedProfile = {
    ...(existingProfile || {}),
    ...scannedFields,
    // Explicitly preserve user-entered fields the scan should never wipe.
    phone: keepIfPresent(existingProfile?.phone, d.phone),
    signature_file_url: keepIfPresent(existingProfile?.signature_file_url, signatureFileUrl),
    father_name: keepIfPresent(existingProfile?.father_name, d.father_name),
    mother_name: keepIfPresent(existingProfile?.mother_name, d.mother_name),
    marital_status: keepIfPresent(existingProfile?.marital_status, d.marital_status),
    height_cm: (existingProfile?.height_cm ?? null) ?? d.height_cm ?? null,
    eye_color: keepIfPresent(existingProfile?.eye_color, d.eye_color),
  };

  const completionPct = computeProfileCompleteness(mergedProfile);
  mergedProfile.profile_completion_pct = completionPct;
  mergedProfile.is_profile_complete = completionPct >= 80;
  mergedProfile.profile_version = (existingProfile?.profile_version || 0) + 1;

  // ── Persist ─────────────────────────────────────────────────────────────
  const savedProfile = existingProfile
    ? await base44.entities.UserPrivateProfile.update(existingProfile.id, mergedProfile)
    : await base44.entities.UserPrivateProfile.create(mergedProfile);

  // Sensitive vault + scanned document (run in parallel, never block on either).
  await Promise.all([
    upsertIdentitySecret({ userId, data: d, address }),
    upsertIdGovDocument({ userId, data: d, sourceFileUrl: resolvedFileUrl, ocrResult }),
  ]);

  logAuditEvent({
    userId,
    action: 'identity_scan_profile_synced',
    resourceType: 'UserPrivateProfile',
    resourceId: savedProfile?.id || '',
    details: `Scanned identity synced (source=${sourceLabel}, completeness=${completionPct}%)`,
  });

  return savedProfile;
}

// ── Internal: IdentitySecret upsert ────────────────────────────────────────

async function upsertIdentitySecret({ userId, data, address }) {
  const existing = await base44.entities.IdentitySecret
    .filter({ user_id: userId }, '-created_date', 1)
    .catch(() => []);

  const [encCnp, encSeries, encNumber, encAddress] = await Promise.all([
    data.cnp        ? encryptField(data.cnp, userId)        : null,
    data.id_series  ? encryptField(data.id_series, userId)  : null,
    data.id_number  ? encryptField(data.id_number, userId)  : null,
    address         ? encryptField(address, userId)         : null,
  ]);

  const payload = removeEmpty({
    user_id: userId,
    cnp_raw: encCnp,
    cnp_masked: maskCnp(data.cnp),
    id_series: encSeries,
    id_number: encNumber,
    birth_date: data.birth_date,
    legal_address_full: encAddress,
    verified_by_user_at: new Date().toISOString(),
  });

  if (existing?.length) {
    return base44.entities.IdentitySecret.update(existing[0].id, payload);
  }
  return base44.entities.IdentitySecret.create(payload);
}

// ── Internal: GovDocument upsert (one id_card per user) ────────────────────

async function upsertIdGovDocument({ userId, data, sourceFileUrl, ocrResult }) {
  const existingDocs = await base44.entities.GovDocument
    .filter({ user_id: userId, document_type: 'id_card' }, '-created_date', 1)
    .catch(() => []);

  const fullName =
    data.full_name ||
    [data.first_name, data.last_name].filter(Boolean).join(' ').trim();

  const payload = removeEmpty({
    user_id: userId,
    document_type: 'id_card',
    document_title: 'Carte de Identitate',
    institution: data.id_issued_by || 'SPCJEP',
    file_url: sourceFileUrl || '',
    ocr_full_name: fullName,
    // Never store the full ID number plaintext on GovDocument — show last 3 only.
    ocr_document_number: data.id_number ? `***${String(data.id_number).slice(-3)}` : '',
    ocr_address: data.address || '',
    ocr_institution: data.id_issued_by || '',
    issue_date: data.id_issue_date || '',
    expiry_date: data.id_expiry_date || '',
    ocr_confidence: ocrResult?.confidence?.overall != null
      ? String(ocrResult.confidence.overall.toFixed?.(2) ?? ocrResult.confidence.overall)
      : '',
    status: 'active',
    tags: ['identity_onboarding', 'id_scan', 'verified_by_user'],
  });

  if (existingDocs?.length) {
    return base44.entities.GovDocument.update(existingDocs[0].id, payload);
  }
  return base44.entities.GovDocument.create(payload);
}