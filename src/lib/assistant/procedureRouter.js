/**
 * Deterministic Procedure Router
 * Intent matching first → workflow launch. LLM only for ambiguity fallback.
 */

import workflows from '@/lib/data/workflows';

// Exact quick-action → workflow ID mapping (instant, deterministic)
const QUICK_ACTION_MAP = {
  'renew-id': 'id-renewal',
  'passport': 'passport-renewal',
  'anaf': 'anaf-tax',
  'driving': 'driving-license',
  'health': 'health-insurance',
  'queue': null, // special: queue overview
  'online': null, // special: online overview
  'student': 'social-benefits',
  'business': 'anaf-tax',
  'criminal-record': 'criminal-record',
  'vehicle': 'vehicle-registration',
  'address': 'change-address',
};

// Keyword-to-workflow index built from the registry
const KEYWORD_INDEX = [];
for (const wf of workflows) {
  for (const kw of wf.keywords) {
    KEYWORD_INDEX.push({ kw: kw.toLowerCase(), workflowId: wf.id, weight: kw.length + 3 });
  }
  // Title words also match
  KEYWORD_INDEX.push({ kw: wf.title.toLowerCase(), workflowId: wf.id, weight: 20 });
}

// Extra synonym aliases
const SYNONYMS = {
  'id card': 'id-renewal',
  'buletin': 'id-renewal',
  'carte de identitate': 'id-renewal',
  'reinnoire buletin': 'id-renewal',
  'renew id': 'id-renewal',
  'lost id': 'lost-id',
  'pierdut buletin': 'lost-id',
  'pierdut buletinul': 'lost-id',
  'furat buletinul': 'lost-id',
  'passport': 'passport-renewal',
  'pasaport': 'passport-renewal',
  'reinnoire pasaport': 'passport-renewal',
  'renew passport': 'passport-renewal',
  'new passport': 'passport-renewal',
  'pasaport nou': 'passport-renewal',
  // Urgent passport intent → route to passport-renewal (PassportWorkspace handles urgent draft)
  // The workspace already passes { isUrgent: true } to the PDF exporter, so urgent and standard
  // share the same Export PDF Draft pipeline — the UI shows an "Urgent request" badge.
  'urgent passport': 'passport-renewal',
  'pasaport urgent': 'passport-renewal',
  'pașaport urgent': 'passport-renewal',
  'pasaport de urgenta': 'passport-renewal',
  'pașaport de urgență': 'passport-renewal',
  'am nevoie de pasaport': 'passport-renewal',
  'am nevoie de pașaport': 'passport-renewal',
  'vreau pasaport': 'passport-renewal',
  'vreau pașaport': 'passport-renewal',
  'i need a passport': 'passport-renewal',
  // True loss/theft → temp passport
  'pierdut pasaportul': 'temp-passport',
  'pierdut pasaport': 'temp-passport',
  'furat pasaport': 'temp-passport',
  'lost passport': 'temp-passport',
  'stolen passport': 'temp-passport',
  'pasaport minor': 'passport-renewal',
  'pasaport copil': 'passport-renewal',
  'passport for child': 'passport-renewal',
  'passport minor': 'passport-renewal',
  'driving license': 'driving-license',
  'permis': 'driving-license',
  'permis de conducere': 'driving-license',
  'driver license': 'driving-license',
  'reinnoire permis': 'driving-license',
  'anaf': 'anaf-tax',
  'spv': 'anaf-tax',
  'cazier fiscal': 'anaf-tax',
  'health insurance': 'health-insurance',
  'asigurare sanatate': 'health-insurance',
  'card sanatate': 'health-insurance',
  'criminal record': 'criminal-record',
  'cazier judiciar': 'criminal-record',
  'register car': 'vehicle-registration',
  'inmatriculare': 'vehicle-registration',
  'inmatriculare masina': 'vehicle-registration',
  'change address': 'change-address',
  'schimbare domiciliu': 'change-address',
  'schimb domiciliu': 'change-address',
  'birth certificate': 'birth-certificate',
  'certificat nastere': 'birth-certificate',
  'parking': 'parking-permit',
  'parcare': 'parking-permit',
  'loc de parcare': 'parking-permit',
};

export function routeByQuickAction(actionId) {
  const workflowId = QUICK_ACTION_MAP[actionId];
  if (!workflowId) return null;
  return workflows.find(w => w.id === workflowId) || null;
}

export function routeByText(text) {
  const lower = text.toLowerCase().trim();

  // 1. Check synonyms first (exact/substring)
  for (const [syn, wfId] of Object.entries(SYNONYMS)) {
    if (lower.includes(syn)) {
      const wf = workflows.find(w => w.id === wfId);
      if (wf) return wf;
    }
  }

  // 2. Keyword scoring
  const scores = {};
  for (const entry of KEYWORD_INDEX) {
    if (lower.includes(entry.kw)) {
      scores[entry.workflowId] = (scores[entry.workflowId] || 0) + entry.weight;
    }
  }

  let bestId = null, bestScore = 0;
  for (const [id, score] of Object.entries(scores)) {
    if (score > bestScore) { bestScore = score; bestId = id; }
  }

  if (bestId && bestScore >= 3) {
    return workflows.find(w => w.id === bestId) || null;
  }

  return null;
}

// Special intent detection (queue / online queries)
export function detectSpecialIntent(text) {
  const lower = text.toLowerCase();
  if (/queue|shortest|wait|coadă|fastest/i.test(lower)) return 'queue-overview';
  if (/online|digital|internet|virtual/i.test(lower)) return 'online-overview';
  return null;
}

/**
 * Detect passport intent + urgency for the NoQueue AI → PassportWorkspace bridge.
 * Returns null if the text is not a passport request.
 * Returns { intent, baseIntent, urgency, confidence } when a passport flow is detected.
 *
 * This is the single source of truth for routing "Am nevoie de pașaport urgent" and
 * its variants directly to the existing My Cases → Export PDF Draft (PassportWorkspace).
 */
export function detectPassportIntent(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  const hasPassport = /pasaport|pașaport|passport/.test(lower);
  if (!hasPassport) return null;

  // Loss/theft → not handled here (temp-passport flow)
  if (/pierdut|furat|lost|stolen/.test(lower)) return null;

  const isUrgent = /urgent|urgență|urgenta|emergency|urgently/.test(lower);
  return {
    intent: isUrgent ? 'passport_urgent' : 'passport_renewal',
    baseIntent: 'passport_renewal',
    urgency: isUrgent ? 'urgent' : 'normal',
    confidence: 0.98,
  };
}