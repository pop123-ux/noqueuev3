/**
 * Smart action definitions for each document type.
 * Each document type gets contextual AI-powered actions.
 */

export const DOCUMENT_ACTIONS = {
  id_card: [
    { id: 'renew', label: 'Renew ID Card', icon: '🔄', color: '#2563eb', description: 'Start the renewal process at SPCLEP', institutionId: 'spclep-cluj', procedureKey: 'id-renewal' },
    { id: 'change_address', label: 'Change Address', icon: '🏠', color: '#22c55e', description: 'Update your registered address', institutionId: 'spclep-cluj', procedureKey: 'change-address' },
    { id: 'lost', label: 'Report Lost ID', icon: '🚨', color: '#ef4444', description: 'Report a lost ID card to authorities', institutionId: 'ipj-cluj', procedureKey: 'lost-id' },
    { id: 'book', label: 'Book Appointment', icon: '📅', color: '#8b5cf6', description: 'Schedule a visit at Evidența Populației' },
  ],
  passport: [
    { id: 'renew', label: 'Renew Passport', icon: '🔄', color: '#8b5cf6', description: 'Start passport renewal process', institutionId: 'pasapoarte-cluj', procedureKey: 'passport-renewal' },
    { id: 'temp', label: 'Temporary Passport', icon: '⚡', color: '#facc15', description: 'Get emergency travel document', institutionId: 'pasapoarte-cluj' },
    { id: 'book', label: 'Book Online', icon: '🌐', color: '#22c55e', description: 'programari.pasapoarte.gov.ro', url: 'https://programari.pasapoarte.gov.ro' },
    { id: 'child', label: 'Child Passport', icon: '👶', color: '#ec4899', description: 'Passport for minor children' },
  ],
  driver_license: [
    { id: 'renew', label: 'Renew License', icon: '🔄', color: '#f97316', description: 'Renew your driving license', institutionId: 'drpciv-cluj', procedureKey: 'driving-license' },
    { id: 'medical', label: 'Medical Check', icon: '🏥', color: '#06b6d4', description: 'Required medical certificate for renewal' },
    { id: 'fines', label: 'Check Fines', icon: '🚨', color: '#ef4444', description: 'Check outstanding traffic fines' },
    { id: 'international', label: 'International Permit', icon: '🌍', color: '#22c55e', description: 'Get international driving permit' },
  ],
  vehicle_registration: [
    { id: 'transfer', label: 'Transfer Ownership', icon: '🔄', color: '#f97316', description: 'Transfer vehicle to new owner', institutionId: 'drpciv-cluj' },
    { id: 'tax', label: 'Pay Vehicle Tax', icon: '💰', color: '#facc15', description: 'Pay annual vehicle tax', institutionId: 'taxe-locale-cluj' },
    { id: 'insurance', label: 'Check Insurance', icon: '🛡️', color: '#22c55e', description: 'Verify RCA insurance status' },
    { id: 'plates', label: 'New License Plates', icon: '🚙', color: '#8b5cf6', description: 'Request new vehicle plates' },
  ],
  health_insurance: [
    { id: 'check', label: 'Check Status', icon: '✅', color: '#06b6d4', description: 'Verify insurance status online', url: 'https://portal.cnas.ro' },
    { id: 'card', label: 'Get Health Card', icon: '💳', color: '#22c55e', description: 'Request European health card', institutionId: 'cjas-cluj' },
    { id: 'register', label: 'Change Doctor', icon: '👨‍⚕️', color: '#8b5cf6', description: 'Register with a new family doctor' },
    { id: 'exempt', label: 'Check Exemptions', icon: '📋', color: '#facc15', description: 'Check if you qualify for exemptions' },
  ],
  tax_form: [
    { id: 'spv', label: 'Open SPV', icon: '🌐', color: '#facc15', description: 'Spațiul Privat Virtual — manage taxes online', url: 'https://spv.anaf.ro' },
    { id: 'debt', label: 'Check Tax Debt', icon: '💸', color: '#ef4444', description: 'Check outstanding tax obligations', institutionId: 'anaf-cluj' },
    { id: 'certificate', label: 'Fiscal Certificate', icon: '📄', color: '#22c55e', description: 'Get fiscal certificate (cazier fiscal)' },
    { id: 'property', label: 'Property Tax', icon: '🏘️', color: '#14b8a6', description: 'Pay local property taxes', institutionId: 'taxe-locale-cluj' },
  ],
  criminal_record: [
    { id: 'online', label: 'e-Cazier Online', icon: '🌐', color: '#2563eb', description: 'Get criminal record certificate online', url: 'https://e-cazier.mai.gov.ro' },
    { id: 'renew', label: 'New Certificate', icon: '🔄', color: '#22c55e', description: 'Request updated criminal record certificate', institutionId: 'ipj-cluj' },
    { id: 'apostille', label: 'Apostille', icon: '🔏', color: '#8b5cf6', description: 'Get document apostilled for international use' },
  ],
  birth_certificate: [
    { id: 'duplicate', label: 'Get Duplicate', icon: '📋', color: '#22c55e', description: 'Request duplicate birth certificate', institutionId: 'stare-civila-cluj' },
    { id: 'apostille', label: 'Apostille', icon: '🔏', color: '#8b5cf6', description: 'International apostille certificate' },
    { id: 'translation', label: 'Official Translation', icon: '🌍', color: '#f97316', description: 'Get certified document translation' },
  ],
  marriage_certificate: [
    { id: 'address', label: 'Update Residence', icon: '🏠', color: '#22c55e', description: 'Update address after marriage', institutionId: 'spclep-cluj' },
    { id: 'name_change', label: 'Name Change', icon: '✏️', color: '#ec4899', description: 'Process name change on all documents' },
    { id: 'duplicate', label: 'Get Duplicate', icon: '📋', color: '#06b6d4', description: 'Request duplicate certificate', institutionId: 'stare-civila-cluj' },
    { id: 'family_book', label: 'Family Register Book', icon: '📖', color: '#f97316', description: 'Get or update family register' },
  ],
  property_paper: [
    { id: 'cadastre', label: 'Cadastre Check', icon: '🗺️', color: '#14b8a6', description: 'Verify property cadastre at ANCPI' },
    { id: 'tax', label: 'Property Tax', icon: '💰', color: '#facc15', description: 'Pay local property tax', institutionId: 'taxe-locale-cluj' },
    { id: 'permit', label: 'Building Permit', icon: '🏗️', color: '#f97316', description: 'Apply for building/renovation permit', institutionId: 'primaria-cluj' },
  ],
  fine: [
    { id: 'pay', label: 'Pay Fine', icon: '💳', color: '#ef4444', description: 'Pay outstanding fine online', url: 'https://ghiseul.ro' },
    { id: 'contest', label: 'Contest Fine', icon: '⚖️', color: '#8b5cf6', description: 'Contest the fine legally' },
    { id: 'receipt', label: 'Get Receipt', icon: '🧾', color: '#22c55e', description: 'Download payment receipt' },
  ],
  residency_permit: [
    { id: 'renew', label: 'Renew Permit', icon: '🔄', color: '#8b5cf6', description: 'Renew residency permit', institutionId: 'imigrari-cluj' },
    { id: 'permanent', label: 'Permanent Residence', icon: '🏠', color: '#22c55e', description: 'Apply for permanent residence' },
    { id: 'book', label: 'Book Appointment', icon: '📅', color: '#facc15', description: 'Mandatory appointment for renewal' },
  ],
  other: [
    { id: 'classify', label: 'Classify Document', icon: '🤖', color: '#8b5cf6', description: 'Let AI classify this document' },
    { id: 'workflow', label: 'Find Workflow', icon: '🗺️', color: '#2563eb', description: 'Find relevant government workflow' },
  ],
};

export const RENEWAL_URGENCY_THRESHOLDS = {
  CRITICAL: 14,   // days — red, immediate action
  URGENT: 30,     // days — orange, act soon
  SOON: 90,       // days — yellow, plan ahead
};

export function getSmartActions(doc) {
  return DOCUMENT_ACTIONS[doc.document_type] || DOCUMENT_ACTIONS.other;
}

export function getRenewalUrgency(days) {
  if (days < 0) return { level: 'expired', label: 'EXPIRED', color: '#ef4444' };
  if (days <= RENEWAL_URGENCY_THRESHOLDS.CRITICAL) return { level: 'critical', label: 'RENEW NOW', color: '#ef4444' };
  if (days <= RENEWAL_URGENCY_THRESHOLDS.URGENT) return { level: 'urgent', label: 'ACT SOON', color: '#fb923c' };
  if (days <= RENEWAL_URGENCY_THRESHOLDS.SOON) return { level: 'soon', label: 'PLAN AHEAD', color: '#facc15' };
  return { level: 'valid', label: 'VALID', color: '#22c55e' };
}