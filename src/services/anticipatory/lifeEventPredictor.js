/**
 * Life-Event Predictor — Anticipatory Intelligence Engine
 *
 * Analyzes UserPrivateProfile, IdentitySecret, and GovDocument data to
 * predict upcoming civic needs and surface proactive recommendations.
 *
 * Pure functions — no I/O, no side effects. Caller passes data, gets predictions.
 */

import { differenceInDays, differenceInYears, addDays, parseISO, isValid } from 'date-fns';

// ── Prediction severity levels ───────────────────────────────────────

export const SEVERITY = {
  CRITICAL: 'critical',   // <30 days or already overdue
  WARNING: 'warning',     // 30-90 days
  INFO: 'info',           // 90-365 days
  OPPORTUNITY: 'opportunity', // life-event suggestion
};

const SEV_RANK = { critical: 0, warning: 1, info: 2, opportunity: 3 };

// ── Document expiration windows (Romanian civic norms) ───────────────

const DOC_RENEWAL_WINDOWS = {
  id_card: { warn_days: 90, critical_days: 30, valid_years: 10, label: 'Carte de identitate' },
  passport: { warn_days: 90, critical_days: 30, valid_years: 5, label: 'Pașaport' },
  driver_license: { warn_days: 90, critical_days: 30, valid_years: 10, label: 'Permis auto' },
  health_insurance: { warn_days: 60, critical_days: 14, label: 'Asigurare medicală' },
  vehicle_registration: { warn_days: 30, critical_days: 7, label: 'Talon vehicul' },
  residency_permit: { warn_days: 90, critical_days: 30, label: 'Permis de ședere' },
  criminal_record: { warn_days: 30, critical_days: 7, valid_months: 6, label: 'Cazier judiciar' },
};

// ── Predictor helpers ────────────────────────────────────────────────

function safeDate(d) {
  if (!d) return null;
  try {
    const p = typeof d === 'string' ? parseISO(d) : new Date(d);
    return isValid(p) ? p : null;
  } catch { return null; }
}

function predictionForDoc(doc) {
  const expiry = safeDate(doc.expiry_date);
  const cfg = DOC_RENEWAL_WINDOWS[doc.document_type];
  if (!expiry || !cfg) return null;

  const days = differenceInDays(expiry, new Date());
  if (days > 365) return null; // too far out

  let severity, urgency_label, action_label;
  if (days < 0) {
    severity = SEVERITY.CRITICAL;
    urgency_label = `Expirat acum ${Math.abs(days)} zile`;
    action_label = 'Reînnoiește urgent';
  } else if (days <= cfg.critical_days) {
    severity = SEVERITY.CRITICAL;
    urgency_label = `Expiră în ${days} zile`;
    action_label = 'Programează reînnoirea';
  } else if (days <= cfg.warn_days) {
    severity = SEVERITY.WARNING;
    urgency_label = `Expiră în ${days} zile`;
    action_label = 'Începe procesul';
  } else {
    severity = SEVERITY.INFO;
    urgency_label = `Expiră în ${days} zile`;
    action_label = 'Notează în calendar';
  }

  return {
    id: `doc-expiry-${doc.id || doc.document_type}-${expiry.getTime()}`,
    type: 'document_expiration',
    severity,
    title: `${cfg.label} expiră în curând`,
    description: `${cfg.label} (${doc.ocr_document_number || doc.document_title || 'document'}) ${urgency_label.toLowerCase()}.`,
    urgency_label,
    action_label,
    action_route: doc.document_type === 'passport' ? '/start?workflow=passport-renewal' : '/cases',
    days_until: days,
    expires_at: expiry.toISOString(),
    related_document_id: doc.id,
    icon: 'FileWarning',
  };
}

/** Detect age-based life events (e.g. teen turning 14 = first ID, 18 = passport eligibility) */
function predictionForBirthDate(birthDate) {
  const bd = safeDate(birthDate);
  if (!bd) return [];
  const age = differenceInYears(new Date(), bd);
  const predictions = [];

  // Romania: first ID at 14
  if (age >= 13 && age < 14) {
    predictions.push({
      id: `life-first-id-${bd.getTime()}`,
      type: 'life_event',
      severity: SEVERITY.OPPORTUNITY,
      title: 'Vârsta pentru prima carte de identitate',
      description: 'În Romania, cartea de identitate se eliberează începând cu vârsta de 14 ani. Pregătește documentele.',
      urgency_label: 'Pregătire',
      action_label: 'Vezi procedura',
      action_route: '/cases',
      icon: 'UserPlus',
    });
  }

  // Romania: at 18 — adult ID, eligible for passport renewal cycle
  if (age >= 17 && age < 18) {
    predictions.push({
      id: `life-adult-id-${bd.getTime()}`,
      type: 'life_event',
      severity: SEVERITY.OPPORTUNITY,
      title: 'În curând 18 ani — buletinul de adult',
      description: 'La 18 ani trebuie să schimbi cartea de identitate. Începe pregătirea documentelor.',
      urgency_label: 'În maximum 1 an',
      action_label: 'Vezi cerințele',
      action_route: '/cases',
      icon: 'UserPlus',
    });
  }

  return predictions;
}

/** Detect marital-status driven predictions */
function predictionForMaritalStatus(profile) {
  const out = [];
  if (profile.marital_status === 'married' && !profile.last_name_change_processed) {
    // Could prompt name-change workflow — skipped without explicit signal
  }
  return out;
}

/** Detect address change opportunities */
function predictionForAddress(profile, documents) {
  if (!profile.address_line_1) return [];
  // If profile address differs from latest GovDocument OCR address → suggest updates
  const idDoc = documents.find(d => d.document_type === 'id_card');
  if (idDoc && idDoc.ocr_address && profile.address_line_1) {
    const profileAddr = profile.address_line_1.toLowerCase().replace(/\s+/g, ' ').trim();
    const docAddr = idDoc.ocr_address.toLowerCase().replace(/\s+/g, ' ').trim();
    // Very loose mismatch detection
    if (profileAddr.length > 8 && docAddr.length > 8) {
      const overlap = profileAddr.split(' ').filter(w => docAddr.includes(w)).length;
      const total = profileAddr.split(' ').length;
      if (overlap / total < 0.4) {
        return [{
          id: 'life-address-mismatch',
          type: 'life_event',
          severity: SEVERITY.WARNING,
          title: 'Adresa de pe buletin pare diferită',
          description: 'Adresa din profil nu se potrivește cu cea de pe cartea de identitate. Probabil ai nevoie de actualizare.',
          urgency_label: 'Recomandare',
          action_label: 'Actualizează datele',
          action_route: '/vault',
          icon: 'Home',
        }];
      }
    }
  }
  return [];
}

// ── Main API ─────────────────────────────────────────────────────────

/**
 * Generate predictions from user data.
 * @param {Object} args
 * @param {Object} args.profile  - UserPrivateProfile
 * @param {Array}  args.documents - GovDocument[]
 * @returns {Array} Predictions sorted by severity then days_until
 */
export function predictCivicNeeds({ profile = {}, documents = [] }) {
  const predictions = [];

  documents.forEach(d => {
    const p = predictionForDoc(d);
    if (p) predictions.push(p);
  });

  predictions.push(...predictionForBirthDate(profile.birth_date));
  predictions.push(...predictionForMaritalStatus(profile));
  predictions.push(...predictionForAddress(profile, documents));

  // Sort: critical first, then by days_until
  predictions.sort((a, b) => {
    const sevDiff = (SEV_RANK[a.severity] ?? 9) - (SEV_RANK[b.severity] ?? 9);
    if (sevDiff !== 0) return sevDiff;
    return (a.days_until ?? 999) - (b.days_until ?? 999);
  });

  return predictions;
}

/** Aggregate counts for dashboard tile */
export function summarizePredictions(predictions) {
  return {
    total: predictions.length,
    critical: predictions.filter(p => p.severity === SEVERITY.CRITICAL).length,
    warning: predictions.filter(p => p.severity === SEVERITY.WARNING).length,
    opportunities: predictions.filter(p => p.severity === SEVERITY.OPPORTUNITY).length,
  };
}

export { addDays };