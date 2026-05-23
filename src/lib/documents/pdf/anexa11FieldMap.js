/**
 * anexa11FieldMap.js
 *
 * Coordinate map for the ANEXA nr. 11 — "Cerere pentru eliberarea actului
 * de identitate" template (Romanian SPCEP form).
 *
 * Coordinates are expressed in the template image's NORMALIZED space
 * (0..1 on both axes, origin top-left). The overlay builder converts them
 * to PDF points based on the actual rendered page size, so this map stays
 * resolution-independent.
 *
 * Calibrated against the user-provided scan at:
 *   https://media.base44.com/images/public/6a0e09b7f69b878e4b4b0039/691220c2c_image.png
 *
 * Field shapes:
 *   { kind: 'text',  x, y, w, h, align?, maxFontSize? }
 *   { kind: 'cnp',   x, y, w, h, slots: 13 }              // segmented digits
 *   { kind: 'check', x, y, size, valueWhen }              // X mark when match
 *   { kind: 'date',  x, y, w, h, slots: 3 }               // An | luna | zi
 *   { kind: 'image', x, y, w, h }                         // signature
 *   { kind: 'tableRow', x, y, w, h, cols: [..widths] }
 */

export const ANEXA11_TEMPLATE_URL =
  'https://media.base44.com/images/public/6a0e09b7f69b878e4b4b0039/691220c2c_image.png';

// All coordinates here are normalized (0..1) over the template image.
// They were calibrated visually against the provided scan; minor tuning
// is easy — adjust a single number and re-export.
export const ANEXA11_FIELDS = {
  // ── Header row ─────────────────────────────────────────────────────────
  spcep:           { kind: 'text', x: 0.115, y: 0.024, w: 0.27, h: 0.022 },
  municipiu:       { kind: 'text', x: 0.110, y: 0.048, w: 0.27, h: 0.020 },
  nr_inreg:        { kind: 'text', x: 0.067, y: 0.073, w: 0.10, h: 0.020 },
  data_inreg:      { kind: 'text', x: 0.215, y: 0.073, w: 0.16, h: 0.020 },

  // ── Subsemnatul block ──────────────────────────────────────────────────
  cnp: {
    kind: 'cnp',
    x: 0.470, y: 0.155, w: 0.435, h: 0.030, slots: 13,
  },
  nume:            { kind: 'text', x: 0.260, y: 0.187, w: 0.640, h: 0.030 },
  prenume:         { kind: 'text', x: 0.260, y: 0.218, w: 0.640, h: 0.030 },
  tata:            { kind: 'text', x: 0.260, y: 0.249, w: 0.640, h: 0.030 },
  mama:            { kind: 'text', x: 0.260, y: 0.279, w: 0.640, h: 0.030 },

  // ── Sex (checkboxes) ───────────────────────────────────────────────────
  sex_m:           { kind: 'check', x: 0.298, y: 0.317, size: 0.020, valueWhen: 'M' },
  sex_f:           { kind: 'check', x: 0.582, y: 0.317, size: 0.020, valueWhen: 'F' },

  // ── Loc și data nașterii ───────────────────────────────────────────────
  birth_place:     { kind: 'text', x: 0.260, y: 0.348, w: 0.640, h: 0.026 },
  birth_county:    { kind: 'text', x: 0.260, y: 0.376, w: 0.220, h: 0.026 },
  birth_date: {
    kind: 'date',
    x: 0.555, y: 0.376, w: 0.350, h: 0.026, slots: 3, // An | luna | zi
  },

  // ── Domiciliul actual ──────────────────────────────────────────────────
  dom_localitate:  { kind: 'text', x: 0.260, y: 0.413, w: 0.640, h: 0.024 },
  dom_strada:      { kind: 'text', x: 0.260, y: 0.439, w: 0.640, h: 0.024 },
  dom_nr:          { kind: 'text', x: 0.135, y: 0.466, w: 0.090, h: 0.024 },
  dom_bl:          { kind: 'text', x: 0.265, y: 0.466, w: 0.090, h: 0.024 },
  dom_sc:          { kind: 'text', x: 0.380, y: 0.466, w: 0.090, h: 0.024 },
  dom_etj:         { kind: 'text', x: 0.495, y: 0.466, w: 0.090, h: 0.024 },
  dom_apt:         { kind: 'text', x: 0.665, y: 0.466, w: 0.225, h: 0.024 },
  dom_judet:       { kind: 'text', x: 0.135, y: 0.494, w: 0.270, h: 0.024 },
  dom_tel:         { kind: 'text', x: 0.555, y: 0.494, w: 0.345, h: 0.024 },

  // ── Domiciliul anterior ────────────────────────────────────────────────
  dom_ant_localitate:{ kind: 'text', x: 0.260, y: 0.532, w: 0.640, h: 0.024 },
  dom_ant_strada:    { kind: 'text', x: 0.260, y: 0.558, w: 0.640, h: 0.024 },
  dom_ant_nr:        { kind: 'text', x: 0.135, y: 0.584, w: 0.090, h: 0.024 },
  dom_ant_bl:        { kind: 'text', x: 0.265, y: 0.584, w: 0.090, h: 0.024 },
  dom_ant_sc:        { kind: 'text', x: 0.380, y: 0.584, w: 0.090, h: 0.024 },
  dom_ant_etj:       { kind: 'text', x: 0.495, y: 0.584, w: 0.090, h: 0.024 },
  dom_ant_apt:       { kind: 'text', x: 0.665, y: 0.584, w: 0.225, h: 0.024 },
  dom_ant_judet:     { kind: 'text', x: 0.135, y: 0.611, w: 0.270, h: 0.024 },
  dom_ant_tel:       { kind: 'text', x: 0.555, y: 0.611, w: 0.345, h: 0.024 },

  // ── Nume anterior ──────────────────────────────────────────────────────
  nume_anterior:   { kind: 'text', x: 0.260, y: 0.640, w: 0.640, h: 0.024 },

  // ── Stare civilă (checkboxes) ──────────────────────────────────────────
  marital_single:   { kind: 'check', x: 0.302, y: 0.666, size: 0.018, valueWhen: 'single' },
  marital_married:  { kind: 'check', x: 0.470, y: 0.666, size: 0.018, valueWhen: 'married' },
  marital_divorced: { kind: 'check', x: 0.628, y: 0.666, size: 0.018, valueWhen: 'divorced' },
  marital_widowed:  { kind: 'check', x: 0.810, y: 0.666, size: 0.018, valueWhen: 'widowed' },

  // ── Situație militară (checkboxes) ─────────────────────────────────────
  mil_active:    { kind: 'check', x: 0.302, y: 0.694, size: 0.018, valueWhen: 'cadru_activ' },
  mil_recrut:    { kind: 'check', x: 0.470, y: 0.694, size: 0.018, valueWhen: 'recrut' },
  mil_rezervist: { kind: 'check', x: 0.628, y: 0.694, size: 0.018, valueWhen: 'rezervist' },
  mil_none:      { kind: 'check', x: 0.810, y: 0.694, size: 0.018, valueWhen: 'fara_obligatii_militare' },

  // ── Ultima școală / Ocupația ───────────────────────────────────────────
  school:          { kind: 'text', x: 0.260, y: 0.722, w: 0.640, h: 0.024 },
  occupation:      { kind: 'text', x: 0.260, y: 0.749, w: 0.640, h: 0.024 },

  // ── Copii minori — 6 rows ──────────────────────────────────────────────
  children_rows: {
    kind: 'tableRows',
    rows: 6,
    rowHeight: 0.0218,
    yStart: 0.785, // top of first row's text baseline area
    cols: [
      { key: '_nr',         x: 0.260, w: 0.034 }, // index — we draw 1..6 automatically
      { key: 'full_name',   x: 0.300, w: 0.290 },
      { key: 'birth_date',  x: 0.595, w: 0.195 },
      { key: 'birth_place', x: 0.793, w: 0.180 },
    ],
  },

  // ── Reason ─────────────────────────────────────────────────────────────
  reason:          { kind: 'text', x: 0.060, y: 0.927, w: 0.860, h: 0.030, maxFontSize: 10 },

  // ── Signatures + Date (bottom) ─────────────────────────────────────────
  sig_applicant:   { kind: 'image', x: 0.130, y: 0.967, w: 0.220, h: 0.040 },
  sig_guardian:    { kind: 'image', x: 0.580, y: 0.967, w: 0.220, h: 0.040 },
  id_series:       { kind: 'text', x: 0.760, y: 0.985, w: 0.060, h: 0.020 },
  id_number:       { kind: 'text', x: 0.860, y: 0.985, w: 0.110, h: 0.020 },
  date_segments: {
    kind: 'date',
    x: 0.110, y: 0.995, w: 0.580, h: 0.022, slots: 3,
  },
};

/**
 * Map a normalized UserPrivateProfile + reason input into the raw value
 * each field expects. Returned object keys correspond to ANEXA11_FIELDS keys.
 *
 * Unknown / missing values are returned as empty strings — the overlay
 * builder treats those as "do not draw".
 */
export function mapProfileToAnexa11(profile = {}, { reason } = {}) {
  const splitBirthDate = (iso) => {
    if (!iso || typeof iso !== 'string') return ['', '', ''];
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? [m[1], m[2], m[3]] : ['', '', ''];
  };

  const today = new Date();
  const todaySegments = [
    String(today.getFullYear()),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ];

  const children = Array.isArray(profile.minor_children) ? profile.minor_children : [];

  return {
    spcep:        profile.id_issued_by || '',
    municipiu:    profile.city || '',
    nr_inreg:     '',
    data_inreg:   '',

    cnp:          (profile.cnp || profile.cnp_masked || '').replace(/\D/g, ''),
    nume:         profile.last_name || '',
    prenume:      profile.first_name || '',
    tata:         profile.father_name || '',
    mama:         profile.mother_name || '',

    sex_m:        profile.sex,
    sex_f:        profile.sex,

    birth_place:  profile.birth_place || '',
    birth_county: profile.county || '',
    birth_date:   splitBirthDate(profile.birth_date),

    dom_localitate: profile.city || '',
    dom_strada:     profile.address_line_1 || '',
    dom_nr:         '',
    dom_bl:         '',
    dom_sc:         '',
    dom_etj:        '',
    dom_apt:        profile.address_line_2 || '',
    dom_judet:      profile.county || '',
    dom_tel:        profile.phone || '',

    dom_ant_localitate: profile.previous_domicile_city || '',
    dom_ant_strada:     profile.previous_domicile_address || '',
    dom_ant_judet:      profile.previous_domicile_county || '',

    nume_anterior: profile.previous_name || '',

    marital_single:   profile.marital_status,
    marital_married:  profile.marital_status,
    marital_divorced: profile.marital_status,
    marital_widowed:  profile.marital_status,

    mil_active:    profile.military_status,
    mil_recrut:    profile.military_status,
    mil_rezervist: profile.military_status,
    mil_none:      profile.military_status,

    school:     profile.last_graduated_school || '',
    occupation: profile.current_occupation || '',

    children_rows: children.slice(0, 6).map(c => ({
      full_name:   c.full_name || '',
      birth_date:  c.birth_date || '',
      birth_place: c.birth_place || '',
    })),

    reason: (reason && String(reason).trim()) || '',

    id_series: profile.id_series || '',
    id_number: profile.id_number || '',

    date_segments: todaySegments,
  };
}