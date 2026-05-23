/**
 * lostIdCardRequiredFields.js
 *
 * Centralized list of profile fields required to fill the
 * "Cerere eliberare act de identitate — pierdere/furt" PDF.
 *
 * Used by:
 *  - LostIdCardDemo page (to show missing-field warnings)
 *  - PDF builder (to insert "[completați manual]" placeholders)
 */

export const LOST_ID_REQUIRED_FIELDS = [
  { key: 'first_name',           label: 'Prenume' },
  { key: 'last_name',            label: 'Nume de familie' },
  { key: 'cnp',                  label: 'CNP' },
  { key: 'sex',                  label: 'Sex' },
  { key: 'birth_date',           label: 'Data nașterii' },
  { key: 'birth_place',          label: 'Locul nașterii' },
  { key: 'father_name',          label: 'Prenumele tatălui' },
  { key: 'mother_name',          label: 'Prenumele mamei' },
  { key: 'address_line_1',       label: 'Adresa (stradă, număr)' },
  { key: 'city',                 label: 'Localitate' },
  { key: 'county',               label: 'Județ' },
  { key: 'marital_status',       label: 'Stare civilă' },
  { key: 'military_status',      label: 'Situație militară' },
  { key: 'last_graduated_school',label: 'Ultima școală absolvită' },
  { key: 'current_occupation',   label: 'Ocupația actuală' },
  { key: 'signature_file_url',   label: 'Semnătura solicitantului' },
];

export const LOST_ID_OPTIONAL_FIELDS = [
  { key: 'previous_name',                            label: 'Nume anterior' },
  { key: 'previous_domicile_address',                label: 'Adresa domiciliului anterior' },
  { key: 'minor_children',                           label: 'Copii minori' },
  { key: 'legal_representative_signature_file_url',  label: 'Semnătură reprezentant legal' },
];

/**
 * Returns the list of required fields missing from the profile.
 * Treats empty strings, null, undefined and empty arrays as missing.
 */
export function getMissingLostIdFields(profile) {
  if (!profile) return LOST_ID_REQUIRED_FIELDS;
  return LOST_ID_REQUIRED_FIELDS.filter(f => {
    const v = profile[f.key];
    if (v === null || v === undefined) return true;
    if (typeof v === 'string' && !v.trim()) return true;
    return false;
  });
}