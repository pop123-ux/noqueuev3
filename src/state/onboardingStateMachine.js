/**
 * Onboarding State Machine — NoQueue AI 2.0 Identity Flow
 */

export const STATES = {
  EMAIL_ENTRY: 'EMAIL_ENTRY',
  ID_UPLOAD: 'ID_UPLOAD',
  OCR_PROCESSING: 'OCR_PROCESSING',
  REVIEW_DATA: 'REVIEW_DATA',
  TWO_FACTOR: 'TWO_FACTOR',
  PROFILE_GENERATED: 'PROFILE_GENERATED',
  COMPLETE: 'COMPLETE',
  ERROR: 'ERROR',
  MANUAL_ENTRY: 'MANUAL_ENTRY',
};

export const STATE_ORDER = [
  STATES.EMAIL_ENTRY,
  STATES.ID_UPLOAD,
  STATES.OCR_PROCESSING,
  STATES.REVIEW_DATA,
  STATES.TWO_FACTOR,
  STATES.PROFILE_GENERATED,
];

export const STATE_LABELS = {
  [STATES.EMAIL_ENTRY]: 'Email',
  [STATES.ID_UPLOAD]: 'Buletin',
  [STATES.OCR_PROCESSING]: 'OCR',
  [STATES.REVIEW_DATA]: 'Verificare',
  [STATES.TWO_FACTOR]: '2FA',
  [STATES.PROFILE_GENERATED]: 'Profil',
};

/** Next state in linear flow */
export function nextState(current) {
  const i = STATE_ORDER.indexOf(current);
  if (i === -1 || i === STATE_ORDER.length - 1) return STATES.COMPLETE;
  return STATE_ORDER[i + 1];
}

/** Previous state */
export function prevState(current) {
  const i = STATE_ORDER.indexOf(current);
  if (i <= 0) return STATES.EMAIL_ENTRY;
  return STATE_ORDER[i - 1];
}

/** Progress percentage (0–100) */
export function progressPercent(current) {
  if (current === STATES.COMPLETE) return 100;
  const i = STATE_ORDER.indexOf(current);
  if (i === -1) return 0;
  return Math.round(((i + 1) / STATE_ORDER.length) * 100);
}