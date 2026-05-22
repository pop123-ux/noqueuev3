/**
 * Document Router — Hidden LLM-backed document selection
 * Deterministic first, LLM for disambiguation only.
 * Never shows raw LLM output to users.
 */
import { base44 } from '@/api/base44Client';
import { templateRegistry, procedureDocumentMap } from './templateRegistry';
import { getMissingFields } from './profileFieldMap';
import { retrieveDocuments } from '@/lib/data/civicDocuments';

/**
 * Deterministic procedure → document mapping.
 * Returns list of template IDs for a given procedure key.
 */
function deterministicDocIds(procedureKey, userQuery) {
  // Direct mapping
  const direct = procedureDocumentMap[procedureKey];
  if (direct && direct.length > 0) return direct;

  // Fuzzy key match
  const lower = (procedureKey || '').toLowerCase();
  for (const [key, ids] of Object.entries(procedureDocumentMap)) {
    if (lower.includes(key) || key.includes(lower)) return ids;
  }

  // Fall back to civicDocuments retrieval
  const retrieved = retrieveDocuments(userQuery || procedureKey || '');
  return retrieved.map(d => d.id).filter(id => templateRegistry[id]);
}

/**
 * Build a document result item from template + profile.
 */
function buildDocumentResult(template, profile, llmHints = {}) {
  const missingFields = getMissingFields(profile, template.requiredProfileFields || []);
  const missingAssets = (template.requiredAssets || []).filter(asset => {
    if (asset === 'signature' && !profile?.signature_file_url) return true;
    if (asset === 'headshot' && !profile?.headshot_file_url) return true;
    return false;
  });

  const hasAllRequired = missingFields.length === 0;
  const isOfficeOnly = template.sourceType === 'physical_office_only';

  let status = 'ready';
  if (missingFields.length > 0) status = 'missing_profile_data';
  else if (template.needsManualReview) status = 'needs_review';

  const labels = [];
  if (template.fillMethod === 'support-sheet') {
    if (isOfficeOnly) labels.push('Office-only form');
    else labels.push('NoQueue prep sheet');
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
    generate_now: hasAllRequired && !isOfficeOnly,
    fill_method: template.fillMethod,
    official_submittable: template.isOfficialSubmittable && hasAllRequired,
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
    cloud_filename: `NoQueue_${template.id}_${new Date().toISOString().slice(0, 10)}.pdf`,
    source_url: template.sourceUrl,
    source_type: template.sourceType,
    institution: template.institution,
    required_attachments: template.requiredAttachments || [],
    needs_notary_flag: template.needsNotary || false,
    template,
    status,
  };
}

/**
 * Route a user request to documents.
 * Returns structured result — no prose for users.
 */
export async function routeDocuments(userRequest, procedureKey, profile) {
  // Step 1: Deterministic lookup
  let docIds = deterministicDocIds(procedureKey, userRequest);

  // Step 2: LLM disambiguation if needed
  if (docIds.length === 0 || !procedureKey) {
    const registryList = Object.values(templateRegistry).map(t =>
      `${t.id}: ${t.title} | category: ${t.category} | institution: ${t.institution}`
    ).join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a hidden document router for Romanian civic procedures in Cluj-Napoca.
User request: "${userRequest}"
Detected procedure: "${procedureKey || 'unknown'}"

Available document templates:
${registryList}

Select only document IDs that apply to this user's need.
Do NOT invent document IDs. Do NOT include documents not in the list.
Output strict JSON only.`,
      response_json_schema: {
        type: "object",
        properties: {
          procedure_title: { type: "string" },
          document_ids: { type: "array", items: { type: "string" } },
          reason: { type: "string" }
        }
      }
    });

    docIds = (result.document_ids || []).filter(id => templateRegistry[id]);
  }

  // Step 3: Build results
  const documents = docIds.map(id => {
    const template = templateRegistry[id];
    if (!template) return null;
    return buildDocumentResult(template, profile);
  }).filter(Boolean);

  return {
    procedure_key: procedureKey,
    documents,
    total: documents.length,
    ready_count: documents.filter(d => d.status === 'ready').length,
    missing_data_count: documents.filter(d => d.status === 'missing_profile_data').length,
  };
}