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
  'passport': 'passport-renewal',
  'pasaport': 'passport-renewal',
  'urgent passport': 'temp-passport',
  'pasaport urgent': 'temp-passport',
  'driving license': 'driving-license',
  'permis': 'driving-license',
  'driver license': 'driving-license',
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
  'change address': 'change-address',
  'schimbare domiciliu': 'change-address',
  'birth certificate': 'birth-certificate',
  'certificat nastere': 'birth-certificate',
  'parking': 'parking-permit',
  'parcare': 'parking-permit',
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