/**
 * Requirement Matcher
 * Compares procedure requirements against user's Profile Safe data.
 */
import { getExpiryInfo } from '@/components/vault/ExpirationBadge';

const PROFILE_TO_DOC_MAP = {
  'full_name': 'Carte de identitate / Pașaport',
  'cnp': 'Carte de identitate (CNP)',
  'birth_date': 'Certificat de naștere',
  'address_line_1': 'Dovada adresei de domiciliu',
  'phone': 'Date contact',
  'email': 'Date contact',
  'id_series': 'Carte de identitate',
  'id_number': 'Carte de identitate',
  'id_expiry_date': 'Carte de identitate',
  'father_name': 'Certificat de naștere',
  'mother_name': 'Certificat de naștere',
  'marital_status': 'Certificat căsătorie / Hotărâre divorț',
};

const DOC_TYPE_TO_REQUIREMENT = {
  'id_card': ['Carte de identitate', 'CI valabilă', 'Act de identitate'],
  'passport': ['Pașaport', 'Pasaport vechi'],
  'birth_certificate': ['Certificat de naștere'],
  'marriage_certificate': ['Certificat de căsătorie'],
  'driver_license': ['Permis de conducere vechi'],
  'health_insurance': ['Asigurare de sănătate', 'Card sănătate'],
  'tax_form': ['Certificat fiscal', 'Dovadă plată'],
  'property_paper': ['Titlu proprietate', 'Contract chirie'],
};

/**
 * Match a procedure's requirements against profile + uploaded docs.
 * Returns { available, missing, warnings }
 */
export function matchRequirements(procedure, profile, uploadedDocs = []) {
  const available = [];
  const missing = [];
  const warnings = [];

  if (!procedure) return { available, missing, warnings };

  // Check profile fields
  for (const field of (procedure.requiredProfileFields || [])) {
    const val = profile?.[field];
    const label = PROFILE_TO_DOC_MAP[field] || field;

    if (val && String(val).trim()) {
      // Check expiry for ID
      if (field === 'id_expiry_date') {
        const expiryInfo = getExpiryInfo(val);
        if (expiryInfo?.status === 'expired') {
          warnings.push({ type: 'expired', label: 'Carte de identitate expirată', detail: 'CI-ul din Seif este expirat.' });
        } else if (expiryInfo?.status === 'expiring_soon') {
          warnings.push({ type: 'expiring_soon', label: 'CI expiră curând', detail: `CI-ul expiră în ${expiryInfo.days} zile.` });
          available.push({ label, source: 'seif', value: val });
        } else {
          available.push({ label, source: 'seif', value: val });
        }
      } else {
        available.push({ label, source: 'seif', value: val });
      }
    } else {
      missing.push({ label, source: 'seif_missing', field });
    }
  }

  // Check uploaded documents
  const uploadedTypes = uploadedDocs.map(d => d.document_type);
  for (const [docType, labels] of Object.entries(DOC_TYPE_TO_REQUIREMENT)) {
    const uploaded = uploadedDocs.find(d => d.document_type === docType);
    if (uploaded) {
      // Check if it's expired
      if (uploaded.expiry_date) {
        const expiryInfo = getExpiryInfo(uploaded.expiry_date);
        if (expiryInfo?.status === 'expired') {
          warnings.push({ type: 'expired_doc', label: labels[0], detail: `Document din vault expirat (${uploaded.expiry_date})` });
        } else {
          available.push({ label: labels[0], source: 'vault', docId: uploaded.id, value: uploaded.document_title });
        }
      }
    }
  }

  return { available, missing, warnings };
}

/**
 * Calculate readiness score (0–100)
 */
export function getReadinessScore(available, missing, warnings) {
  const total = available.length + missing.length;
  if (total === 0) return 0;
  const base = (available.length / total) * 100;
  const penalty = warnings.filter(w => w.type === 'expired' || w.type === 'expired_doc').length * 15;
  return Math.max(0, Math.round(base - penalty));
}