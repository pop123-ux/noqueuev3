/**
 * documentRouter.js
 *
 * Two responsibilities:
 *
 *  1. detectLostIdIntent() — lightweight intent detection used by
 *     NoQueueAIChat to navigate "Mi-am pierdut buletinul" directly to
 *     /demo/lost-id-card instead of falling back to generic chat.
 *
 *  2. routeDocuments() — given a free-text query + (optional) procedure key,
 *     return the document templates that should be generated for the case.
 *     Consumed by pages/CaseStart.jsx via generateDocumentsForCase().
 */

import { templateRegistry, procedureDocumentMap } from './templateRegistry';

// ── Lost ID intent ────────────────────────────────────────────────────────

const LOST_ID_PHRASES = [
  'mi-am pierdut buletinul',
  'mi am pierdut buletinul',
  'buletin pierdut',
  'pierdut buletinul',
  'pierdut buletin',
  'carte de identitate pierduta',
  'carte de identitate pierdută',
  'ci pierdut',
  'ci pierduta',
  'mi s-a furat buletinul',
  'mi s a furat buletinul',
  'buletin furat',
  'furat buletin',
  'lost id card',
  'stolen id card',
  'lost identity card',
  'lost buletin',
];

const norm = (s) => String(s || '').toLowerCase().trim();

/**
 * @param {string} text
 * @returns {null | { intent: 'lost_id_card', confidence: number, route: string }}
 */
export function detectLostIdIntent(text) {
  if (!text) return null;
  const lower = norm(text);
  for (const phrase of LOST_ID_PHRASES) {
    if (lower.includes(phrase)) {
      return {
        intent: 'lost_id_card',
        confidence: 0.98,
        route: '/demo/lost-id-card',
      };
    }
  }
  return null;
}

// ── Procedure → templates routing (legacy CaseStart contract) ─────────────

// Free-text keyword → procedure key lookup. Kept conservative — CaseStart
// already passes an explicit procedure_key when available; this only helps
// when the caller has nothing better.
const QUERY_TO_PROCEDURE = [
  { rx: /lost\s*id|buletin\s*pierdut|pierdut\s*buletin|ci\s*pierdut|furat\s*buletin/i, key: 'lost-id' },
  { rx: /renew\s*id|reinnoire\s*ci|buletin\s*expirat|carte\s*de\s*identitate\s*expirat/i, key: 'id-renewal' },
  { rx: /schimbare\s*domiciliu|change\s*address|mutare\s*adresa/i, key: 'domicile-change' },
  { rx: /pasaport\s*urgent|urgent\s*passport/i, key: 'passport-urgent' },
  { rx: /pasaport|passport|pașaport/i, key: 'passport' },
  { rx: /permis\s*de\s*conducere|driving\s*licen[cs]e|permis/i, key: 'driver-license' },
  { rx: /anaf|certificat\s*fiscal|cazier\s*fiscal|spv/i, key: 'anaf-tax' },
  { rx: /srl|registru\s*comertului|company\s*registration/i, key: 'business-registration' },
  { rx: /divor[ţt]/i, key: 'divorce' },
  { rx: /cazier\s*judiciar|criminal\s*record/i, key: 'criminal-record' },
  { rx: /asigurare\s*sanatate|health\s*insurance|cjas|cnas/i, key: 'health-insurance' },
  { rx: /notar|notary/i, key: 'notary' },
  { rx: /declaratie/i, key: 'declaration' },
];

function resolveProcedureKey(query, explicitKey) {
  if (explicitKey && procedureDocumentMap[explicitKey]) return explicitKey;
  const text = String(query || '');
  for (const { rx, key } of QUERY_TO_PROCEDURE) {
    if (rx.test(text)) return key;
  }
  return 'generic-request';
}

/**
 * Resolve a list of document templates for a case.
 *
 * @param {string} query                Free-text user description
 * @param {string?} procedureKey        Optional explicit procedure key
 * @param {object?} _profile            Reserved for future profile-based filtering
 * @returns {Promise<{
 *   procedure_key: string,
 *   documents: Array<{ template: object, status: string, missing_assets: string[], special_instruction_labels: string[] }>
 * }>}
 */
export async function routeDocuments(query, procedureKey, _profile) {
  const key = resolveProcedureKey(query, procedureKey);
  const templateIds = procedureDocumentMap[key] || ['cerere-generica'];

  const documents = templateIds
    .map(id => templateRegistry[id])
    .filter(Boolean)
    .map(template => ({
      template,
      status: 'needs_review',
      missing_assets: [],
      special_instruction_labels: template.needsPhysicalPresence
        ? ['Requires in-person submission']
        : [],
    }));

  return { procedure_key: key, documents };
}