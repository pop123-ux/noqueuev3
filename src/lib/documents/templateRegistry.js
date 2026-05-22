/**
 * Document Template Registry
 * Extends civicDocuments with generation-specific metadata.
 * 
 * fillMethod:
 *   - "support-sheet"  → generate a NoQueue preparation sheet (NON-OFFICIAL)
 *   - "coordinates"    → place text at fixed coords on official PDF
 *   - "acroform"       → fill AcroForm fields on official PDF
 *
 * sourceType mirrors civicDocuments: "downloadable_pdf" | "official_page" | "physical_office_only" | "online_form"
 * Only "downloadable_pdf" + valid runtimeTemplateUrl can attempt acroform/coordinates.
 * Everything else → support-sheet.
 */

export const templateRegistry = {

  "cerere-ci-reinnoire": {
    id: "cerere-ci-reinnoire",
    title: "Application for Identity Card — Renewal",
    titleRo: "Cerere eliberare act de identitate — reînnoire",
    category: "id-renewal",
    institution: "SPCLEP Cluj-Napoca",
    sourceUrl: "https://evpers.ro/wp-content/uploads/2020/01/Cerere-eliberare-CI.pdf",
    runtimeTemplateUrl: null, // CORS-blocked — use support sheet
    sourceType: "official_page",
    isOfficialSource: true,
    isOfficialSubmittable: false, // runtime template unavailable
    fillMethod: "support-sheet",
    profileFieldMap: {
      last_name: "last_name",
      first_name: "first_name",
      cnp: "cnp",
      birth_date: "birth_date",
      birth_place: "birth_place",
      address_line_1: "address_line_1",
      city: "city",
      county: "county",
      id_series: "id_series",
      id_number: "id_number",
      id_issued_by: "id_issued_by",
      id_expiry_date: "id_expiry_date",
      father_name: "father_name",
      mother_name: "mother_name",
    },
    requiredProfileFields: ["first_name", "last_name", "cnp", "birth_date", "address_line_1", "city"],
    requiredAssets: [],
    requiredAttachments: [
      "Birth certificate (original + copy)",
      "Old ID card",
      "Proof of residence (contract, utility bill, or owner declaration)",
      "Payment proof (7 RON fee)"
    ],
    signatureMode: "required",
    photoMode: "none",
    flattenAfterFill: false,
    instructionsShort: "Bring to SPCLEP Cluj-Napoca, Str. Constanța nr. 5. Arrive by 08:30.",
    needsNotary: false,
    needsPhysicalPresence: true,
    needsAppointment: false,
    needsManualReview: false,
    templateVersion: "2020-01",
    lastVerifiedAt: "2024-01-01",
  },

  "cerere-ci-pierdut": {
    id: "cerere-ci-pierdut",
    title: "Application for Replacement ID — Lost/Stolen",
    titleRo: "Cerere eliberare CI — pierdere/furt",
    category: "lost-id",
    institution: "SPCLEP Cluj-Napoca",
    sourceUrl: "https://evpers.ro/wp-content/uploads/2020/01/Cerere-eliberare-CI.pdf",
    runtimeTemplateUrl: null,
    sourceType: "official_page",
    isOfficialSource: true,
    isOfficialSubmittable: false,
    fillMethod: "support-sheet",
    profileFieldMap: {
      last_name: "last_name",
      first_name: "first_name",
      cnp: "cnp",
      birth_date: "birth_date",
      address_line_1: "address_line_1",
      city: "city",
    },
    requiredProfileFields: ["first_name", "last_name", "cnp", "birth_date", "address_line_1"],
    requiredAssets: [],
    requiredAttachments: [
      "Police loss/theft declaration (from any IPJ Cluj precinct)",
      "Birth certificate (original + copy)",
      "Proof of residence",
      "Payment proof (7 RON or 50 RON urgent)"
    ],
    signatureMode: "required",
    photoMode: "none",
    flattenAfterFill: false,
    instructionsShort: "Step 1: File police report at any Cluj precinct. Step 2: Go to SPCLEP with police declaration.",
    needsNotary: false,
    needsPhysicalPresence: true,
    needsAppointment: false,
    needsManualReview: false,
    templateVersion: "2020-01",
    lastVerifiedAt: "2024-01-01",
  },

  "cerere-pasaport": {
    id: "cerere-pasaport",
    title: "Application for Standard Passport",
    titleRo: "Cerere eliberare pașaport simplu",
    category: "passport",
    institution: "Serviciul Pașapoarte Cluj",
    sourceUrl: "https://www.spcp.ro/sites/default/files/Cerere_simplu_2020.pdf",
    runtimeTemplateUrl: null,
    sourceType: "official_page",
    isOfficialSource: true,
    isOfficialSubmittable: false,
    fillMethod: "support-sheet",
    profileFieldMap: {
      last_name: "last_name",
      first_name: "first_name",
      cnp: "cnp",
      birth_date: "birth_date",
      birth_place: "birth_place",
      id_series: "id_series",
      id_number: "id_number",
      id_issued_by: "id_issued_by",
    },
    requiredProfileFields: ["first_name", "last_name", "cnp", "birth_date", "birth_place", "id_series", "id_number"],
    requiredAssets: [],
    requiredAttachments: [
      "Valid ID card",
      "Old passport (if renewal)",
      "Payment proof — 258 RON (10-year) or 134 RON (under-14)",
      "Birth certificate for minors",
      "Both parents' consent if minor (notarized if one parent absent)"
    ],
    signatureMode: "required",
    photoMode: "required",
    flattenAfterFill: false,
    instructionsShort: "Book appointment at programari.pasapoarte.gov.ro. Pay at CEC Bank before visit.",
    needsNotary: false,
    needsPhysicalPresence: true,
    needsAppointment: true,
    needsManualReview: false,
    templateVersion: "2020",
    lastVerifiedAt: "2024-01-01",
  },

  "cerere-permis-conducere": {
    id: "cerere-permis-conducere",
    title: "Driving Licence Renewal Application",
    titleRo: "Cerere preschimbare permis de conducere",
    category: "driver-license",
    institution: "DRPCIV Cluj",
    sourceUrl: "https://www.drpciv.ro/sites/default/files/Cerere_permis.pdf",
    runtimeTemplateUrl: null,
    sourceType: "official_page",
    isOfficialSource: true,
    isOfficialSubmittable: false,
    fillMethod: "support-sheet",
    profileFieldMap: {
      last_name: "last_name",
      first_name: "first_name",
      cnp: "cnp",
      birth_date: "birth_date",
      address_line_1: "address_line_1",
      city: "city",
    },
    requiredProfileFields: ["first_name", "last_name", "cnp", "birth_date"],
    requiredAssets: [],
    requiredAttachments: [
      "Valid ID (original + copy)",
      "Old driving licence",
      "Medical certificate — fișă medicală (max 6 months old)",
      "Payment proof — 130 RON"
    ],
    signatureMode: "required",
    photoMode: "none",
    flattenAfterFill: false,
    instructionsShort: "Visit DRPCIV Cluj, Str. Fabricii de Zahăr nr. 51. Tuesday/Wednesday afternoons are least crowded.",
    needsNotary: false,
    needsPhysicalPresence: true,
    needsAppointment: false,
    needsManualReview: false,
    templateVersion: "current",
    lastVerifiedAt: "2024-01-01",
  },

  "cerere-certificat-fiscal-anaf": {
    id: "cerere-certificat-fiscal-anaf",
    title: "ANAF Fiscal Certificate Request",
    titleRo: "Cerere certificat de atestare fiscală",
    category: "anaf",
    institution: "ANAF Cluj-Napoca",
    sourceUrl: "https://static.anaf.ro/static/10/Anaf/formulare/Cerere_certificat_atestare_fiscala_PF_OPANAF_3654_2015.pdf",
    runtimeTemplateUrl: "https://static.anaf.ro/static/10/Anaf/formulare/Cerere_certificat_atestare_fiscala_PF_OPANAF_3654_2015.pdf",
    sourceType: "downloadable_pdf",
    isOfficialSource: true,
    isOfficialSubmittable: true,
    fillMethod: "support-sheet", // acroform fields not confirmed — use support sheet to be safe
    profileFieldMap: {
      last_name: "last_name",
      first_name: "first_name",
      cnp: "cnp",
      address_line_1: "address_line_1",
      city: "city",
      county: "county",
    },
    requiredProfileFields: ["first_name", "last_name", "cnp", "address_line_1"],
    requiredAssets: [],
    requiredAttachments: [
      "Valid ID",
      "Signed request form"
    ],
    signatureMode: "required",
    photoMode: "none",
    flattenAfterFill: false,
    instructionsShort: "Can be submitted online via SPV at anaf.ro. Issued in 5 working days online.",
    needsNotary: false,
    needsPhysicalPresence: false,
    needsAppointment: false,
    needsManualReview: false,
    onlineUrl: "https://www.anaf.ro/anaf/internet/RO/cont-curent-spv",
    templateVersion: "OPANAF-3654-2015",
    lastVerifiedAt: "2024-01-01",
  },

  "cerere-inregistrare-srl": {
    id: "cerere-inregistrare-srl",
    title: "Company Registration — SRL",
    titleRo: "Cerere înregistrare SRL",
    category: "business-registration",
    institution: "Registrul Comerțului Cluj",
    sourceUrl: "https://www.onrc.ro/templates/site/formulare/cerere_inregistrare.pdf",
    runtimeTemplateUrl: null,
    sourceType: "official_page",
    isOfficialSource: true,
    isOfficialSubmittable: false,
    fillMethod: "support-sheet",
    profileFieldMap: {
      last_name: "last_name",
      first_name: "first_name",
      cnp: "cnp",
      address_line_1: "address_line_1",
      city: "city",
      county: "county",
    },
    requiredProfileFields: ["first_name", "last_name", "cnp"],
    requiredAssets: [],
    requiredAttachments: [
      "Act constitutiv (Articles of Association) — notarized or simple written form",
      "Dovadă sediu social (registered office proof)",
      "ID of all associates and administrators",
      "Cazier judiciar (criminal record) for administrators",
      "Specimen de semnătură — notarized",
      "Payment proof — 200 RON"
    ],
    signatureMode: "required",
    photoMode: "none",
    flattenAfterFill: false,
    instructionsShort: "Can be submitted online at portal.onrc.ro. Complex cases: walk-in at Str. Horea nr. 65.",
    needsNotary: true,
    needsPhysicalPresence: false,
    needsAppointment: false,
    needsManualReview: true,
    onlineUrl: "https://portal.onrc.ro",
    templateVersion: "2022",
    lastVerifiedAt: "2024-01-01",
  },

  "cerere-divort-notariat": {
    id: "cerere-divort-notariat",
    title: "Divorce Preparation — Notary Route",
    titleRo: "Divorț pe cale notarială — fișă pregătire",
    category: "divorce-notary",
    institution: "Birou notarial Cluj-Napoca",
    sourceUrl: null,
    runtimeTemplateUrl: null,
    sourceType: "physical_office_only",
    isOfficialSource: false,
    isOfficialSubmittable: false,
    fillMethod: "support-sheet",
    profileFieldMap: {
      last_name: "last_name",
      first_name: "first_name",
      cnp: "cnp",
      birth_date: "birth_date",
      marital_status: "marital_status",
      address_line_1: "address_line_1",
    },
    requiredProfileFields: ["first_name", "last_name", "cnp"],
    requiredAssets: [],
    requiredAttachments: [
      "Marriage certificate (original)",
      "Both spouses' ID cards",
      "Birth certificates of any minor children",
      "Notarized parental agreement (if children involved)"
    ],
    signatureMode: "required",
    photoMode: "none",
    flattenAfterFill: false,
    instructionsShort: "Both spouses appear in person before any authorized notary in Cluj. 30-day reflection period applies.",
    needsNotary: true,
    needsPhysicalPresence: true,
    needsAppointment: true,
    needsManualReview: true,
    templateVersion: "preparation-only",
    lastVerifiedAt: "2024-01-01",
  },

  "cerere-cazier-judiciar": {
    id: "cerere-cazier-judiciar",
    title: "Criminal Record Certificate",
    titleRo: "Cazier judiciar",
    category: "police",
    institution: "IPJ Cluj / e-cazier",
    sourceUrl: "https://e-cazier.mai.gov.ro",
    runtimeTemplateUrl: null,
    sourceType: "online_form",
    isOfficialSource: true,
    isOfficialSubmittable: false,
    fillMethod: "support-sheet",
    profileFieldMap: {
      last_name: "last_name",
      first_name: "first_name",
      cnp: "cnp",
    },
    requiredProfileFields: ["first_name", "last_name", "cnp"],
    requiredAssets: [],
    requiredAttachments: ["Valid ID only"],
    signatureMode: "none",
    photoMode: "none",
    flattenAfterFill: false,
    instructionsShort: "Strongly recommended: use e-cazier.mai.gov.ro online — instant result. In person: IPJ Cluj, Calea Dorobanților nr. 9.",
    needsNotary: false,
    needsPhysicalPresence: false,
    needsAppointment: false,
    needsManualReview: false,
    onlineUrl: "https://e-cazier.mai.gov.ro",
    templateVersion: "online",
    lastVerifiedAt: "2024-01-01",
  },

  "cerere-asigurare-sanatate": {
    id: "cerere-asigurare-sanatate",
    title: "Health Insurance Self-Declaration",
    titleRo: "Declarație asigurare CJAS",
    category: "health-insurance",
    institution: "CJAS Cluj",
    sourceUrl: "https://cnas.ro/wp-content/uploads/2021/01/Declaratie-asigurat.pdf",
    runtimeTemplateUrl: null,
    sourceType: "official_page",
    isOfficialSource: true,
    isOfficialSubmittable: false,
    fillMethod: "support-sheet",
    profileFieldMap: {
      last_name: "last_name",
      first_name: "first_name",
      cnp: "cnp",
      address_line_1: "address_line_1",
    },
    requiredProfileFields: ["first_name", "last_name", "cnp"],
    requiredAssets: [],
    requiredAttachments: ["Valid ID", "Proof of uninsured status"],
    signatureMode: "required",
    photoMode: "none",
    flattenAfterFill: false,
    instructionsShort: "Check status first at portal.cnas.ro. Submit at CJAS Cluj, Str. Constanța nr. 5.",
    needsNotary: false,
    needsPhysicalPresence: false,
    needsAppointment: false,
    needsManualReview: false,
    onlineUrl: "https://portal.cnas.ro",
    templateVersion: "2021",
    lastVerifiedAt: "2024-01-01",
  },
};

/**
 * Get template by document ID
 */
export function getTemplate(docId) {
  return templateRegistry[docId] || null;
}

/**
 * Get all templates for a given procedure/workflow key
 */
export function getTemplatesForProcedure(procedureKey) {
  return Object.values(templateRegistry).filter(t =>
    t.category === procedureKey ||
    t.id.includes(procedureKey)
  );
}

/**
 * Map procedure_key to relevant document IDs
 */
export const procedureDocumentMap = {
  "id-renewal":            ["cerere-ci-reinnoire"],
  "lost-id":               ["cerere-ci-pierdut"],
  "passport-renewal":      ["cerere-pasaport"],
  "temp-passport":         ["cerere-pasaport"],
  "driving-license":       ["cerere-permis-conducere"],
  "vehicle-registration":  [],
  "anaf-tax":              ["cerere-certificat-fiscal-anaf"],
  "business-registration": ["cerere-inregistrare-srl"],
  "divorce":               ["cerere-divort-notariat"],
  "criminal-record":       ["cerere-cazier-judiciar"],
  "health-insurance":      ["cerere-asigurare-sanatate"],
};