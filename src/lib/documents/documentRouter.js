/**
 * Document Router
 * Maps user intent to document templates deterministically, with LLM fallback.
 */
import { base44 } from '@/api/base44Client';
import { templateRegistry, procedureDocumentMap } from './templateRegistry';
import { getMissingFields } from './profileFieldMap';

// Keyword → procedure key mapping (deterministic, fastest path)
const INTENT_MAP = [
  { keys: ['lost id', 'pierdut ci', 'stolen id', 'furat ci', 'lost card'],             proc: 'lost-id' },
  { keys: ['renew id', 'reinnoire ci', 'new id', 'ci nou', 'act de identitate'],        proc: 'id-renewal' },
  { keys: ['address change', 'schimbare adresa', 'domiciliu', 'moved', 'new address'],  proc: 'domicile-change' },
  { keys: ['passport history', 'istoric pasaport', 'passport records', 'evidenta pasapoarte'], proc: 'passport-history' },
  { keys: ['rneps', 'date rneps', 'national passport registry'],                         proc: 'rneps' },
  { keys: ['urgent passport', 'pasaport urgent', 'emergency passport'],                  proc: 'passport-urgent' },
  { keys: ['passport', 'pasaport'],                                                       proc: 'passport' },
  { keys: ['declaratie', 'declaration', 'self declaration', 'proprie raspundere'],       proc: 'declaration' },
  { keys: ['notary', 'notariat', 'notarial'],                                            proc: 'notary' },
  { keys: ['driving license', 'permis conducere', 'driver license', 'driving licence'], proc: 'driver-license' },
  { keys: ['anaf', 'fiscal certificate', 'certificat fiscal', 'tax certificate'],        proc: 'anaf-tax' },
  { keys: ['company', 'srl', 'register company', 'inregistrare firma', 'business reg'], proc: 'business-registration' },
  { keys: ['divorce', 'divort', 'divortul'],                                             proc: 'divorce' },
  { keys: ['cazier', 'criminal record', 'antecedente penale'],                           proc: 'criminal-record' },
  { keys: ['health insurance', 'asigurare sanatate', 'cjas', 'cnas'],                   proc: 'health-insurance' },
  { keys: ['cerere', 'request', 'petition', 'generic request'],                          proc: 'generic-request' },
];

function detectProcedureKey(userRequest) {
  const lower = (userRequest || '').toLowerCase();
  for (const entry of INTENT_MAP) {
    if (entry.keys.some(k => lower.includes(k))) return entry.proc;
  }
  return null;
}

function buildDocumentResult(template, profile) {
  const missingFields = getMissingFields(profile, template.requiredProfileFields || []);
  const missingAssets = (template.requiredAssets || []).filter(asset => {
    if (asset === 'signature' && !profile?.signature_file_url) return true;
    if (asset === 'headshot' && !profile?.headshot_file_url) return true;
    return false;
  });

  const isOfficeOnly = template.sourceType === 'physical_office_only';
  let status = 'ready';
  if (missingFields.length > 0) status = 'missing_profile_data';
  else if (template.needsManualReview) status = 'needs_review';

  const labels = [];
  if (template.fillMethod === 'support-sheet') {
    labels.push(isOfficeOnly ? 'Office-only form' : 'NoQueue prep sheet');
  } else {
    labels.push('Ready to print');
  }
  if (template.signatureMode === 'required') labels.push('Needs signature');
  if (template.needsNotary) labels.push('Needs notarisation');
  if (template.needsPhysicalPresence) labels.push('In-person required');
  if (template.needsAppointment) labels.push('Appointment needed');
  if (template.onlineUrl) labels.push('Can do online');
  if (missingFields.length > 0) labels.push(`${missingFields.length} profile field(s) missing`);

  return {
    document_id: template.id,
    title: template.title,
    titleRo: template.titleRo,
    generate_now: missingFields.length === 0 && !isOfficeOnly,
    fill_method: template.fillMethod,
    official_submittable: template.isOfficialSubmittable && missingFields.length === 0,
    requires_profile_fields: template.requiredProfileFields || [],
    missing_profile_fields: missingFields,
    requires_assets: template.requiredAssets || [],
    missing_assets: missingAssets,
    requires_manual_review: template.needsManualReview || false,
    needs_notary: template.needsNotary || false,
    needs_physical_presence: template.needsPhysicalPresence || false,
    needs_appointment: template.needsAppointment || false,
    online_url: template.onlineUrl || null,
    special_instruction_labels: labels,
    reason_short: template.instructionsShort || '',
    source_url: template.sourceUrl,
    source_type: template.sourceType,
    institution: template.institution,
    required_attachments: template.requiredAttachments || [],
    template,
    status,
  };
}

/**
 * Route a user request to document templates.
 * Returns structured result — never raw prose.
 */
export async function routeDocuments(userRequest, procedureKey, profile) {
  // 1. Detect procedure key from user intent if not provided
  const detectedKey = procedureKey || detectProcedureKey(userRequest);

  // 2. Get document IDs from procedure map
  let docIds = detectedKey ? (procedureDocumentMap[detectedKey] || []) : [];

  // 3. LLM fallback if still no match
  if (docIds.length === 0) {
    const registryList = Object.values(templateRegistry)
      .map(t => `${t.id}: ${t.title} | category: ${t.category}`)
      .join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Romanian civic document router. Map this user request to document template IDs.
User request: "${userRequest}"

Available templates:
${registryList}

Return only IDs from the list above that match the user's need. Output strict JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          procedure_key: { type: "string" },
          procedure_title: { type: "string" },
          document_ids: { type: "array", items: { type: "string" } },
        }
      }
    });

    docIds = (result.document_ids || []).filter(id => templateRegistry[id]);
    if (!procedureKey && result.procedure_key) {
      procedureKey = result.procedure_key;
    }
  }

  const documents = docIds
    .map(id => templateRegistry[id] ? buildDocumentResult(templateRegistry[id], profile) : null)
    .filter(Boolean);

  return {
    procedure_key: detectedKey || procedureKey || 'unknown',
    documents,
    total: documents.length,
    ready_count: documents.filter(d => d.status === 'ready').length,
    missing_data_count: documents.filter(d => d.status === 'missing_profile_data').length,
  };
}