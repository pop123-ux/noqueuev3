/**
 * Document Generation Service
 * Orchestrates PDF generation and entity persistence.
 */
import { base44 } from '@/api/base44Client';
import { buildSupportSheet } from './pdf/buildSupportSheet';
import { getMissingFields } from './profileFieldMap';

/**
 * Generate a single document and persist to GeneratedDocument entity.
 * Returns the GeneratedDocument record.
 */
export async function generateDocument({ docResult, profile, caseId, procedureKey }) {
  const { template } = docResult;
  const missingFields = getMissingFields(profile, template.requiredProfileFields || []);

  let pdfBytes = null;
  let status = docResult.status;
  let fillMethod = template.fillMethod;

  // Always use support-sheet for now (runtime templates need verified mirroring)
  // This is intentional — never serve fake official PDFs
  pdfBytes = await buildSupportSheet({
    template,
    profile: profile || {},
    caseData: { procedure_key: procedureKey },
    missingFields,
  });

  if (missingFields.length > 0) status = 'needs_review';
  else if (template.sourceType === 'physical_office_only') status = 'office_only';
  else status = 'ready';

  // Upload PDF to app storage
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const file = new File([blob], `${template.id}_${Date.now()}.pdf`, { type: 'application/pdf' });
  const { file_url } = await base44.integrations.Core.UploadFile({ file });

  const userId = (await base44.auth.me())?.email || 'unknown';

  const payload = {
    user_id: userId,
    case_id: caseId || '',
    document_key: template.id,
    document_title: template.title,
    status,
    fill_method: fillMethod,
    official_submittable: template.isOfficialSubmittable && missingFields.length === 0,
    source_type: template.sourceType,
    source_url: template.sourceUrl || '',
    source_label: template.institution,
    runtime_template_url: template.runtimeTemplateUrl || '',
    template_version: template.templateVersion || 'unknown',
    profile_snapshot_version: profile?.profile_version || 1,
    missing_profile_fields: missingFields,
    missing_assets: docResult.missing_assets || [],
    instruction_labels: docResult.special_instruction_labels || [],
    requires_notary: template.needsNotary || false,
    requires_physical_presence: template.needsPhysicalPresence || false,
    pdf_file_url: file_url,
    download_file_name: `NoQueue_${template.id}_${new Date().toISOString().slice(0, 10)}.pdf`,
    mime_type: 'application/pdf',
    drive_upload_status: 'not_uploaded',
    procedure_key: procedureKey || '',
  };

  const record = await base44.entities.GeneratedDocument.create(payload);
  return record;
}

/**
 * Generate all documents for a case.
 * Returns array of GeneratedDocument records.
 */
export async function generateDocumentsForCase({ routerResult, profile, caseId }) {
  const results = [];
  for (const docResult of routerResult.documents) {
    const record = await generateDocument({
      docResult,
      profile,
      caseId,
      procedureKey: routerResult.procedure_key,
    });
    results.push(record);
  }
  return results;
}

/**
 * Check if a document is stale (profile changed since generation).
 */
export function isDocumentStale(generatedDoc, currentProfile) {
  if (!generatedDoc || !currentProfile) return false;
  return (currentProfile.profile_version || 1) > (generatedDoc.profile_snapshot_version || 1);
}