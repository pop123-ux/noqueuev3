/**
 * NoQueue AI — Civic Document Knowledge Base
 * Cluj-Napoca / Romania
 *
 * Future architecture:
 * - OCR parsing: upload → extract fields → AI autofill
 * - PDF validation engine
 * - Smart field extraction
 * - Document versioning + official source sync
 *
 * Source metadata stored per document for future RAG retrieval.
 */

export const civicDocuments = [

  // ──────────────────────────────────────────────
  // IDENTITY — ID RENEWAL
  // ──────────────────────────────────────────────
  {
    id: "cerere-ci-reinnoire",
    title: "Cerere pentru eliberarea actului de identitate",
    titleEn: "Application for Identity Card Issuance / Renewal",
    category: "id-renewal",
    categoryLabel: "ID Renewal",
    institution: "SPCLEP Cluj-Napoca",
    legalBasis: "OUG 97/2005, HG 839/2006",
    description: "Standard application form for renewing or replacing an identity card (carte de identitate / buletin).",
    descriptionRo: "Cerere standard pentru reînnoirea sau înlocuirea cărții de identitate.",
    eligibility: ["Romanian citizen", "Expired ID or ID expiring within 180 days", "Name/address change"],
    templateUrl: "https://evpers.ro/wp-content/uploads/2020/01/Cerere-eliberare-CI.pdf",
    sourceType: "official_page",
    sourceLabel: "evpers.ro — official SPCLEP form",
    attachments: [
      "Birth certificate (original + copy)",
      "Old ID card",
      "Proof of residence (contract, utility bill, owner declaration)",
      "Marriage certificate (if applicable)",
      "Payment proof (7 RON fee)"
    ],
    whoSigns: "The applicant (or legal guardian for minors)",
    whereSubmit: "SPCLEP Cluj-Napoca — Str. Constanța nr. 5",
    commonMistakes: ["Outdated proof of residence", "Missing copy of birth certificate", "Wrong fee amount"],
    complexity: "low",
    estimatedTime: "30–45 min at office, processed in 30 days",
    workflowIds: ["id-renewal"],
    canDoOnline: false,
    tags: ["id", "buletin", "carte identitate", "reinnoire", "renewal"],
    // Future: OCR fields for autofill
    ocrFields: ["CNP", "last_name", "first_name", "address", "county", "date_of_birth"]
  },

  // ──────────────────────────────────────────────
  // IDENTITY — LOST/STOLEN ID
  // ──────────────────────────────────────────────
  {
    id: "cerere-ci-pierdut",
    title: "Cerere eliberare CI în caz de pierdere/furt",
    titleEn: "Application for Replacement ID (Lost/Stolen)",
    category: "lost-id",
    categoryLabel: "Lost/Stolen ID",
    institution: "SPCLEP Cluj-Napoca",
    legalBasis: "OUG 97/2005 art. 23",
    description: "Application form for replacing a lost or stolen identity document. Must be accompanied by a police declaration.",
    descriptionRo: "Cerere pentru înlocuirea actului de identitate pierdut sau furat. Necesită declarație la poliție.",
    eligibility: ["ID reported lost or stolen", "Romanian citizen"],
    templateUrl: "https://evpers.ro/wp-content/uploads/2020/01/Cerere-eliberare-CI.pdf",
    sourceType: "official_page",
    sourceLabel: "evpers.ro — official SPCLEP form",
    attachments: [
      "Police loss/theft declaration (from IPJ Cluj or local precinct)",
      "Birth certificate (original + copy)",
      "Proof of residence",
      "Payment proof (7 RON fee, or 50 RON for urgent)"
    ],
    whoSigns: "The applicant",
    whereSubmit: "SPCLEP Cluj-Napoca — Str. Constanța nr. 5",
    commonMistakes: ["Not filing police report first", "Forgetting birth certificate copy"],
    complexity: "low",
    estimatedTime: "45 min — police report + SPCLEP visit same day",
    workflowIds: ["lost-id"],
    canDoOnline: false,
    tags: ["lost id", "stolen id", "pierdut", "furt", "buletin pierdut"],
    ocrFields: ["CNP", "last_name", "first_name", "address"]
  },

  {
    id: "declaratie-pierdere",
    title: "Declarație pierdere/furt act de identitate",
    titleEn: "Police Declaration — Lost/Stolen Identity Document",
    category: "lost-id",
    categoryLabel: "Lost/Stolen ID",
    institution: "IPJ Cluj — orice secție de poliție",
    legalBasis: "OUG 97/2005",
    description: "Formal declaration filed at the police station confirming loss or theft of ID. Required before applying for replacement.",
    descriptionRo: "Declarație la poliție privind pierderea sau furtul actului de identitate.",
    eligibility: ["Anyone reporting a lost/stolen ID"],
    templateUrl: null,
    sourceType: "physical_office_only",
    templateNote: "Filed directly at police station — no pre-download needed. Available at counter.",
    sourceLabel: "IPJ Cluj — in-person",
    attachments: ["No documents needed — just your oral/written statement"],
    whoSigns: "The applicant at the police counter",
    whereSubmit: "Any IPJ Cluj precinct or Calea Dorobanților nr. 9",
    commonMistakes: ["Going to wrong police station (any precinct works)", "Expecting a pre-printed form"],
    complexity: "low",
    estimatedTime: "10–15 min",
    workflowIds: ["lost-id"],
    canDoOnline: false,
    tags: ["declaratie pierdere", "politie", "lost id", "police report"]
  },

  // ──────────────────────────────────────────────
  // PASSPORT
  // ──────────────────────────────────────────────
  {
    id: "cerere-pasaport",
    title: "Cerere pentru eliberarea pașaportului simplu",
    titleEn: "Application for Standard Passport",
    category: "passport",
    categoryLabel: "Passport",
    institution: "Serviciul Pașapoarte Cluj",
    legalBasis: "Legea 248/2005",
    description: "Official application form for a new or renewed Romanian passport. Valid for adults and minors.",
    descriptionRo: "Cerere oficială pentru eliberarea pașaportului românesc — adulți sau minori.",
    eligibility: ["Romanian citizen", "Valid ID at time of application"],
    templateUrl: "https://www.spcp.ro/sites/default/files/Cerere_simplu_2020.pdf",
    sourceType: "official_page",
    sourceLabel: "spcp.ro — official Pașapoarte form",
    attachments: [
      "Valid ID card",
      "Old passport (if renewal)",
      "Payment proof — 258 RON (10-year) or 134 RON (5-year for minors under 14)",
      "Birth certificate for minors",
      "Both parents' consent for minors (notarized if one parent absent)"
    ],
    whoSigns: "The applicant (or parent for minors under 14)",
    whereSubmit: "Serviciul Pașapoarte Cluj — Str. Dorobanților nr. 6",
    commonMistakes: [
      "Not booking appointment in advance",
      "Payment done at wrong bank (use CEC Bank or online)",
      "Missing parental consent for child passport"
    ],
    complexity: "low",
    estimatedTime: "30–45 min at office, issued in 15 working days",
    workflowIds: ["passport-renewal", "temp-passport"],
    canDoOnline: true,
    onlineUrl: "https://www.epasaport.ro",
    tags: ["pasaport", "passport", "reinnoire pasaport", "child passport"],
    ocrFields: ["CNP", "last_name", "first_name", "date_of_birth", "place_of_birth"]
  },

  {
    id: "cerere-pasaport-temporar",
    title: "Cerere pașaport temporar (urgență)",
    titleEn: "Emergency Temporary Passport Application",
    category: "passport",
    categoryLabel: "Passport — Urgent",
    institution: "Serviciul Pașapoarte Cluj",
    legalBasis: "Legea 248/2005 art. 19",
    description: "Application for a temporary passport issued within 1–3 business days for documented urgent travel.",
    descriptionRo: "Pașaport temporar eliberat în regim de urgență — valabilitate 1 an.",
    eligibility: ["Documented urgent travel need", "Medical emergency, funeral, professional obligation"],
    templateUrl: "https://www.spcp.ro/sites/default/files/Cerere_simplu_2020.pdf",
    sourceType: "official_page",
    sourceLabel: "spcp.ro — same form, marked urgent",
    attachments: [
      "Valid ID",
      "Proof of urgency (flight ticket, medical certificate, employer letter)",
      "Payment proof — 450 RON",
      "Old passport if available"
    ],
    whoSigns: "The applicant",
    whereSubmit: "Serviciul Pașapoarte Cluj — walk-in, first thing in the morning",
    commonMistakes: ["Vague urgency proof rejected at counter", "Arriving after 10:00 — capacity fills fast"],
    complexity: "medium",
    estimatedTime: "1–3 business days",
    workflowIds: ["temp-passport"],
    canDoOnline: false,
    tags: ["urgent passport", "pasaport temporar", "emergency", "urgenta"],
    ocrFields: ["CNP", "last_name", "first_name"]
  },

  // ──────────────────────────────────────────────
  // DRIVER LICENSE
  // ──────────────────────────────────────────────
  {
    id: "cerere-permis-conducere",
    title: "Cerere preschimbare / reînnoire permis de conducere",
    titleEn: "Driving License Renewal Application",
    category: "driver-license",
    categoryLabel: "Driving License",
    institution: "DRPCIV Cluj",
    legalBasis: "OUG 195/2002, HG 1391/2006",
    description: "Application form for renewing a driving license (permis de conducere) due to expiry or category change.",
    descriptionRo: "Cerere pentru preschimbarea sau reînnoirea permisului de conducere.",
    eligibility: ["Valid ID", "Medical certificate from authorized clinic", "Expired or expiring license"],
    templateUrl: "https://www.drpciv.ro/sites/default/files/Cerere_permis.pdf",
    sourceType: "official_page",
    sourceLabel: "drpciv.ro — official DRPCIV form",
    attachments: [
      "Valid ID (original + copy)",
      "Old driving license",
      "Medical certificate — fișă medicală (max 6 months old)",
      "Payment proof — 130 RON",
      "Application form"
    ],
    whoSigns: "The applicant",
    whereSubmit: "DRPCIV Cluj — Str. Fabricii de Zahăr nr. 51",
    commonMistakes: [
      "Medical certificate older than 6 months",
      "Medical certificate from unauthorized clinic",
      "Missing category on renewal form"
    ],
    complexity: "low",
    estimatedTime: "30 days processing after submission",
    workflowIds: ["driving-license"],
    canDoOnline: true,
    onlineUrl: "https://www.drpciv.ro",
    tags: ["permis conducere", "driving license", "reinnoire permis", "expired license"],
    ocrFields: ["CNP", "last_name", "first_name", "license_categories"]
  },

  // ──────────────────────────────────────────────
  // VEHICLE REGISTRATION
  // ──────────────────────────────────────────────
  {
    id: "cerere-inmatriculare",
    title: "Cerere înmatriculare / transcriere vehicul",
    titleEn: "Vehicle Registration Application",
    category: "vehicle-registration",
    categoryLabel: "Vehicle Registration",
    institution: "DRPCIV Cluj",
    legalBasis: "OUG 195/2002",
    description: "Application for registering a new or used vehicle in Cluj County.",
    descriptionRo: "Cerere pentru înmatricularea sau transcrierea unui vehicul în Cluj.",
    eligibility: ["New vehicle owner", "Vehicle purchased in Romania or EU"],
    templateUrl: "https://www.drpciv.ro/sites/default/files/Cerere_inmatriculare.pdf",
    sourceType: "official_page",
    sourceLabel: "drpciv.ro — official form",
    attachments: [
      "Valid ID",
      "Carte de identitate vehicul (CIV)",
      "Contract de vânzare-cumpărare (purchase contract)",
      "RCA insurance (valid)",
      "Certificat fiscal from Direcția Taxe Locale",
      "ITP (roadworthiness — if used vehicle)",
      "Payment proof — 143 RON + 37 RON plates"
    ],
    whoSigns: "The new vehicle owner",
    whereSubmit: "DRPCIV Cluj — Str. Fabricii de Zahăr nr. 51",
    commonMistakes: ["Missing fiscal certificate", "RCA insurance not valid on visit day", "Missing ITP for used cars"],
    complexity: "medium",
    estimatedTime: "Same day if all documents ready",
    workflowIds: ["vehicle-registration"],
    canDoOnline: true,
    onlineUrl: "https://www.drpciv.ro",
    tags: ["inmatriculare", "vehicle registration", "masina", "car registration", "transciere"],
    ocrFields: ["owner_CNP", "VIN", "make", "model", "year"]
  },

  // ──────────────────────────────────────────────
  // ANAF
  // ──────────────────────────────────────────────
  {
    id: "cerere-certificat-fiscal-anaf",
    title: "Cerere certificat de atestare fiscală — persoane fizice",
    titleEn: "ANAF Fiscal Certificate Request — Individuals",
    category: "anaf",
    categoryLabel: "ANAF — Tax",
    institution: "ANAF Cluj-Napoca",
    legalBasis: "Codul de procedură fiscală, art. 158",
    description: "Request for a fiscal attestation certificate showing no outstanding national tax obligations. Required for property sales, company transactions, etc.",
    descriptionRo: "Cerere pentru certificat de atestare fiscală — necesar la vânzări imobiliare, tranzacții comerciale.",
    eligibility: ["Any natural person with Romanian CNP"],
    templateUrl: "https://static.anaf.ro/static/10/Anaf/formulare/Cerere_certificat_atestare_fiscala_PF_OPANAF_3654_2015.pdf",
    sourceType: "downloadable_pdf",
    sourceLabel: "anaf.ro — official ANAF form",
    attachments: ["Valid ID", "Request form signed", "SPV digital signature (for online)"],
    whoSigns: "The applicant (or authorized representative)",
    whereSubmit: "ANAF Cluj — Str. George Barițiu nr. 56 | or online via SPV",
    commonMistakes: ["Not using SPV for online submission", "Confusing local fiscal certificate (Primăria) with ANAF"],
    complexity: "low",
    estimatedTime: "Issued in 5 working days (online) or same day (in person)",
    workflowIds: ["anaf-tax"],
    canDoOnline: true,
    onlineUrl: "https://www.anaf.ro/anaf/internet/RO/cont-curent-spv",
    tags: ["certificat fiscal", "anaf", "atestare fiscala", "tax certificate", "cazier fiscal"],
    ocrFields: ["CNP", "last_name", "first_name", "address"]
  },

  {
    id: "cazier-fiscal",
    title: "Cerere eliberare cazier fiscal",
    titleEn: "Fiscal Criminal Record Request",
    category: "anaf",
    categoryLabel: "ANAF — Fiscal Record",
    institution: "ANAF Cluj-Napoca",
    legalBasis: "OG 75/2001",
    description: "Fiscal criminal record certificate showing any past tax infringements. Required for company director positions, government contracts.",
    descriptionRo: "Cazier fiscal pentru persoane fizice sau juridice — necesar pentru funcții de conducere, licitații.",
    eligibility: ["Individuals and legal entities with Romanian tax ID"],
    templateUrl: "https://static.anaf.ro/static/10/Anaf/formulare/070_OPANAF_3656_2021.pdf",
    sourceType: "downloadable_pdf",
    sourceLabel: "anaf.ro — official form 070",
    attachments: ["ID", "Form 070", "Company CUI (if for legal entity)"],
    whoSigns: "The applicant or legal representative",
    whereSubmit: "ANAF Cluj or online via SPV",
    commonMistakes: ["Confusing cazier fiscal with cazier judiciar (IPJ)"],
    complexity: "low",
    estimatedTime: "1–5 working days",
    workflowIds: ["anaf-tax"],
    canDoOnline: true,
    onlineUrl: "https://www.anaf.ro",
    tags: ["cazier fiscal", "fiscal record", "anaf", "070"]
  },

  // ──────────────────────────────────────────────
  // HEALTH INSURANCE
  // ──────────────────────────────────────────────
  {
    id: "cerere-asigurare-sanatate",
    title: "Declarație de asigurare CJAS — persoane fără venit",
    titleEn: "Health Insurance Self-Declaration — Uninsured Persons",
    category: "health-insurance",
    categoryLabel: "Health Insurance",
    institution: "CJAS Cluj",
    legalBasis: "Legea 95/2006 art. 213",
    description: "Self-declaration for health insurance coverage for individuals without employment income (voluntary contribution).",
    descriptionRo: "Declarație pentru asigurarea voluntară la CJAS pentru persoane fără venit.",
    eligibility: ["Not employed", "Not retired", "Not student (for specific exemptions)"],
    templateUrl: "https://cnas.ro/wp-content/uploads/2021/01/Declaratie-asigurat.pdf",
    sourceType: "official_page",
    sourceLabel: "cnas.ro — official CJAS form",
    attachments: ["Valid ID", "Proof of uninsured status (employer letter confirming end of contract, etc.)"],
    whoSigns: "The applicant",
    whereSubmit: "CJAS Cluj — Str. Constanța nr. 5 | or online via portal.cnas.ro",
    commonMistakes: ["Students on scholarship may qualify for exemption — check first"],
    complexity: "low",
    estimatedTime: "Same day processing",
    workflowIds: ["health-insurance"],
    canDoOnline: true,
    onlineUrl: "https://portal.cnas.ro",
    tags: ["asigurare sanatate", "cnas", "cjas", "health insurance", "fara venit"]
  },

  // ──────────────────────────────────────────────
  // BUSINESS REGISTRATION
  // ──────────────────────────────────────────────
  {
    id: "cerere-inregistrare-srl",
    title: "Cerere de înregistrare în registrul comerțului — SRL",
    titleEn: "Company Registration Application — SRL (Ltd)",
    category: "business-registration",
    categoryLabel: "Business Registration",
    institution: "Registrul Comerțului Cluj",
    legalBasis: "Legea 31/1990, Legea 265/2022",
    description: "Application for registering a new limited liability company (SRL) in Romania. Includes articles of association.",
    descriptionRo: "Cerere pentru înregistrarea unui SRL nou la Registrul Comerțului Cluj.",
    eligibility: ["Any natural person 18+ with Romanian or EU ID", "Must have registered office address"],
    templateUrl: "https://www.onrc.ro/templates/site/formulare/cerere_inregistrare.pdf",
    sourceType: "official_page",
    sourceLabel: "onrc.ro — official ONRC form",
    attachments: [
      "Act constitutiv (Articles of Association) — notarized or as simple written form",
      "Dovadă sediu social (registered office proof)",
      "ID of all associates and administrators",
      "Cazier judiciar (criminal record) for administrators",
      "Specimen de semnătură (signature specimen) — notarized",
      "Payment proof — 200 RON registration fee"
    ],
    whoSigns: "All associates and administrators (before notary or at ONRC counter)",
    whereSubmit: "Registrul Comerțului Cluj — Str. Horea nr. 65 | or online via portal.onrc.ro",
    commonMistakes: [
      "Articles of association missing mandatory clauses",
      "Registered office document insufficient (notarized owner consent needed)",
      "Forgetting cazier judiciar for director"
    ],
    complexity: "high",
    estimatedTime: "3–5 working days after submission",
    workflowIds: ["business-registration"],
    canDoOnline: true,
    onlineUrl: "https://portal.onrc.ro",
    tags: ["srl", "firma", "business registration", "onrc", "inregistrare firma", "company"]
  },

  {
    id: "act-constitutiv-srl",
    title: "Model act constitutiv SRL (unic asociat)",
    titleEn: "SRL Articles of Association Template — Single Member",
    category: "business-registration",
    categoryLabel: "Business Registration",
    institution: "Registrul Comerțului Cluj",
    legalBasis: "Legea 31/1990 art. 7",
    description: "Template articles of association for a single-member SRL. Must be customized with company name, object of activity, and capital.",
    descriptionRo: "Model de act constitutiv pentru SRL cu unic asociat.",
    eligibility: ["Single-person company founders"],
    templateUrl: "https://www.onrc.ro/templates/site/formulare/act_constitutiv_srl_1asociat.pdf",
    sourceType: "official_page",
    sourceLabel: "onrc.ro — model act constitutiv",
    attachments: ["Completed and signed by founder", "Notarized or as simple written act (post 2022)"],
    whoSigns: "The sole associate",
    whereSubmit: "Submitted with registration application at ONRC Cluj",
    commonMistakes: ["Using outdated template pre-2022 law changes", "Wrong CAEN activity code"],
    complexity: "medium",
    estimatedTime: "Preparation: 1–2 hours with guidance",
    workflowIds: ["business-registration"],
    canDoOnline: false,
    tags: ["act constitutiv", "srl", "articles of association", "company founding"],
    ocrFields: ["company_name", "associates", "capital", "CAEN_code", "registered_office"]
  },

  // ──────────────────────────────────────────────
  // RESIDENCE PERMIT
  // ──────────────────────────────────────────────
  {
    id: "cerere-permis-sedere",
    title: "Cerere permis de ședere — cetățeni non-UE",
    titleEn: "Residence Permit Application — Non-EU Citizens",
    category: "residence-permit",
    categoryLabel: "Residence Permit",
    institution: "Inspectoratul pentru Imigrări Cluj",
    legalBasis: "OUG 194/2002",
    description: "Application for a residence permit for non-EU citizens living or working in Cluj-Napoca.",
    descriptionRo: "Cerere pentru permis de ședere pentru cetățeni din afara UE.",
    eligibility: ["Non-EU citizen with valid long-stay visa or work/study permit"],
    templateUrl: "https://igi.mai.gov.ro/formulare/cerere-permis-sedere.pdf",
    sourceType: "official_page",
    sourceLabel: "igi.mai.gov.ro — official IGI form",
    attachments: [
      "Valid passport",
      "Long-stay visa (D visa) or previous permit",
      "Proof of accommodation in Cluj (contract/owner declaration)",
      "Work contract or enrollment proof",
      "Health insurance proof",
      "Income proof (3x minimum wage)",
      "Application fee — 259 RON"
    ],
    whoSigns: "The applicant in person (mandatory)",
    whereSubmit: "Inspectoratul pentru Imigrări Cluj — Str. Traian Moșoiu nr. 27 (appointment mandatory)",
    commonMistakes: [
      "Visiting without appointment — will be turned away",
      "Documents not translated by authorized translator",
      "Missing apostille on foreign documents"
    ],
    complexity: "high",
    estimatedTime: "30–90 days processing",
    workflowIds: ["residence-permit"],
    canDoOnline: false,
    tags: ["permis sedere", "residence permit", "imigrare", "visa", "non-EU", "foreigner"]
  },

  // ──────────────────────────────────────────────
  // STUDENT ADMINISTRATION
  // ──────────────────────────────────────────────
  {
    id: "adeverinta-student",
    title: "Adeverință de student (pentru acte administrative)",
    titleEn: "Student Certificate for Administrative Purposes",
    category: "student",
    categoryLabel: "Student Administration",
    institution: "Universitate / Secretariat facultate",
    legalBasis: "Legea educației 198/2023",
    description: "Official student certificate issued by university secretariat — required for health insurance, transport discounts, social benefits.",
    descriptionRo: "Adeverință de student necesară pentru asigurare de sănătate, transport, burse sociale.",
    eligibility: ["Enrolled student at Romanian university"],
    templateUrl: null,
    sourceType: "physical_office_only",
    templateNote: "Issued exclusively by your university secretariat. Cannot be downloaded — must be requested in person or online via university portal.",
    sourceLabel: "University secretariat — UBB Cluj, UTCN, USAMV, etc.",
    attachments: ["Student ID", "Enrollment status confirmation"],
    whoSigns: "University secretary (official stamp required)",
    whereSubmit: "Issued at university — then submitted to CJAS, transport, social services",
    commonMistakes: ["Using expired adeverință (usually valid 30–60 days)", "Wrong type of adeverință for specific purpose"],
    complexity: "low",
    estimatedTime: "1–5 working days depending on university",
    workflowIds: ["health-insurance", "social-benefits"],
    canDoOnline: true,
    onlineUrl: "https://studenți.ro or university portal",
    tags: ["adeverinta student", "student certificate", "university", "facultate", "UBB", "UTCN"]
  },

  // ──────────────────────────────────────────────
  // DIVORCE — NOTARY
  // ──────────────────────────────────────────────
  {
    id: "cerere-divort-notariat",
    title: "Cerere de divorț pe cale notarială",
    titleEn: "Notary Divorce Application — Mutual Consent",
    category: "divorce-notary",
    categoryLabel: "Divorce — Notary",
    institution: "Orice birou notarial din Cluj-Napoca",
    legalBasis: "Noul Cod Civil art. 375–378, Legea notarilor publici 36/1995",
    description: "Mutual consent divorce processed through a notary public. Fastest and least expensive divorce route — applicable when both spouses agree on all terms.",
    descriptionRo: "Divorț prin acord — procedura notarială. Cel mai rapid și simplu tip de divorț.",
    eligibility: [
      "Both spouses must consent",
      "No minor children (or children with agreed custody arrangement)",
      "No disputed property or financial matters",
      "Both spouses must appear in person before notary"
    ],
    templateUrl: null,
    sourceType: "physical_office_only",
    templateNote: "Application drafted by the notary — no pre-download required. Both spouses appear together.",
    sourceLabel: "Uniunea Națională a Notarilor Publici",
    attachments: [
      "Marriage certificate (original)",
      "Both spouses' ID cards",
      "Birth certificates of any minor children",
      "If children: notarized parental agreement on custody, alimony, surname",
      "Proof of matrimonial property (if relevant)"
    ],
    whoSigns: "Both spouses, before the notary",
    whereSubmit: "Any authorized notary in Cluj-Napoca",
    commonMistakes: [
      "Thinking children automatically block notary divorce — written agreement resolves this",
      "Not bringing original marriage certificate",
      "Assuming it's free — notary fee: ~500–1500 RON"
    ],
    complexity: "low",
    estimatedTime: "30 days waiting period after filing, then divorce certificate issued",
    workflowIds: ["divorce"],
    canDoOnline: false,
    tags: ["divort", "divorce", "notariat", "acord", "mutual consent", "divort notarial"]
  },

  // ──────────────────────────────────────────────
  // DIVORCE — CIVIL REGISTRY
  // ──────────────────────────────────────────────
  {
    id: "cerere-divort-stare-civila",
    title: "Cerere de divorț pe cale administrativă",
    titleEn: "Civil Registry Divorce Application",
    category: "divorce-civil",
    categoryLabel: "Divorce — Civil Registry",
    institution: "Starea Civilă Cluj-Napoca",
    legalBasis: "Noul Cod Civil art. 375",
    description: "Administrative divorce processed at the civil registry — mutual consent, no minor children, no property disputes. Free and fast.",
    descriptionRo: "Divorț administrativ la Starea Civilă — gratuit, rapid, fără minori.",
    eligibility: [
      "Both spouses fully agree",
      "No minor children",
      "No property disputes",
      "Marriage registered in Romanian civil registry"
    ],
    templateUrl: null,
    sourceType: "physical_office_only",
    templateNote: "Form provided at the Civil Registry counter. Both spouses must appear in person.",
    sourceLabel: "Starea Civilă Cluj-Napoca — in person",
    attachments: [
      "Marriage certificate (original)",
      "Both ID cards",
      "Completed application form (signed by both spouses)"
    ],
    whoSigns: "Both spouses at civil registry counter",
    whereSubmit: "Starea Civilă Cluj-Napoca — Str. Moților nr. 3",
    commonMistakes: ["Having minor children disqualifies this route", "Only one spouse appearing"],
    complexity: "low",
    estimatedTime: "30-day reflection period, then certificate in 1 day",
    workflowIds: ["divorce"],
    canDoOnline: false,
    tags: ["divort administrativ", "stare civila", "divorce civil registry", "fara minori"]
  },

  // ──────────────────────────────────────────────
  // DIVORCE — COURT
  // ──────────────────────────────────────────────
  {
    id: "cerere-divort-judecata",
    title: "Cerere de chemare în judecată — divorț contencios",
    titleEn: "Court Divorce Petition — Contested",
    category: "divorce-court",
    categoryLabel: "Divorce — Court",
    institution: "Judecătoria Cluj-Napoca",
    legalBasis: "Noul Cod Civil art. 373–379, Codul de procedură civilă",
    description: "Court divorce petition for contested divorces — including custody disputes, financial disagreements, or one spouse refusing consent.",
    descriptionRo: "Acțiune de divorț la judecătorie — divorț contestat, custodie, pensie alimentară.",
    eligibility: [
      "One or both spouses do not agree",
      "Disputed child custody",
      "Disputed financial/property matters",
      "Domestic violence situations"
    ],
    templateUrl: "https://www.just.ro/formulare/",
    sourceType: "official_page",
    sourceLabel: "just.ro — Ministry of Justice forms page",
    attachments: [
      "Marriage certificate",
      "Birth certificates of minor children",
      "Evidence of disputed matters (financial docs, property deeds)",
      "Custody assessment request (optional)",
      "Legal representation documents (if using lawyer)",
      "Court fee — 100 RON (first filing)"
    ],
    whoSigns: "The petitioner (and optionally their lawyer)",
    whereSubmit: "Judecătoria Cluj-Napoca — Calea Dorobanților nr. 2–4",
    commonMistakes: [
      "Not engaging a family law lawyer — strongly recommended",
      "Insufficient evidence for custody claims",
      "Wrong jurisdiction (file where spouses last lived together)"
    ],
    complexity: "high",
    estimatedTime: "6 months to 2+ years depending on complexity",
    workflowIds: ["divorce"],
    canDoOnline: false,
    tags: ["divort judecata", "court divorce", "contencios", "custodie", "pensie alimentara"]
  },

  // ──────────────────────────────────────────────
  // BIRTH CERTIFICATE
  // ──────────────────────────────────────────────
  {
    id: "cerere-certificat-nastere-duplicat",
    title: "Cerere eliberare duplicat certificat de naștere",
    titleEn: "Duplicate Birth Certificate Request",
    category: "civil-status",
    categoryLabel: "Civil Status",
    institution: "Starea Civilă Cluj-Napoca",
    legalBasis: "Legea 119/1996",
    description: "Request for a duplicate birth certificate when the original is lost or damaged.",
    descriptionRo: "Cerere pentru duplicat certificat de naștere — pierdut, deteriorat sau pentru uz oficial.",
    eligibility: ["Romanian citizen", "Parent or legal guardian for minors"],
    templateUrl: null,
    sourceType: "physical_office_only",
    templateNote: "Request form available at the Civil Registry counter. Cannot be downloaded in advance.",
    sourceLabel: "Starea Civilă Cluj-Napoca — in person",
    attachments: [
      "Valid ID",
      "Application form",
      "Proof of relationship (if requesting for another person)"
    ],
    whoSigns: "The person themselves or legal guardian",
    whereSubmit: "Starea Civilă Cluj-Napoca — Str. Moților nr. 3",
    commonMistakes: ["Third-party requests without proof of relationship rejected"],
    complexity: "low",
    estimatedTime: "1–5 working days",
    workflowIds: ["birth-certificate"],
    canDoOnline: false,
    tags: ["certificat nastere", "birth certificate", "duplicat", "nastere"]
  },

  // ──────────────────────────────────────────────
  // CRIMINAL RECORD
  // ──────────────────────────────────────────────
  {
    id: "cerere-cazier-judiciar",
    title: "Cerere eliberare cazier judiciar",
    titleEn: "Criminal Record Certificate Request",
    category: "police",
    categoryLabel: "Police Services",
    institution: "IPJ Cluj — Serviciul Cazier Judiciar",
    legalBasis: "Legea 290/2004",
    description: "Request for a criminal record certificate (cazier judiciar) for employment, travel, company directorship, or legal purposes.",
    descriptionRo: "Cazier judiciar — necesar pentru angajare, funcții publice, vize, înregistrare firmă.",
    eligibility: ["Any Romanian citizen (for themselves)"],
    templateUrl: null,
    sourceType: "online_form",
    templateNote: "Available online at e-cazier.mai.gov.ro — no pre-downloaded form needed. In-person: form at IPJ counter.",
    sourceLabel: "e-cazier.mai.gov.ro — recommended online route",
    attachments: ["Valid ID only"],
    whoSigns: "The applicant",
    whereSubmit: "Online: e-cazier.mai.gov.ro | In person: IPJ Cluj — Calea Dorobanților nr. 9",
    commonMistakes: ["Not using e-cazier — in-person adds 20+ minutes wait"],
    complexity: "low",
    estimatedTime: "Online: instant–24h | In person: 20 min",
    workflowIds: ["criminal-record"],
    canDoOnline: true,
    onlineUrl: "https://e-cazier.mai.gov.ro",
    tags: ["cazier judiciar", "criminal record", "police record", "e-cazier", "certificate"]
  }
];

// ──────────────────────────────────────────────
// RETRIEVAL ENGINE
// ──────────────────────────────────────────────

export function retrieveDocuments(query, workflowId = null) {
  const lower = query?.toLowerCase() || '';

  // Direct workflow match
  if (workflowId) {
    const byWorkflow = civicDocuments.filter(d => d.workflowIds.includes(workflowId));
    if (byWorkflow.length > 0) return byWorkflow;
  }

  // Tag + text match
  const scored = civicDocuments.map(doc => {
    let score = 0;
    for (const tag of doc.tags) {
      if (lower.includes(tag)) score += tag.length + 5;
    }
    if (lower.includes(doc.category)) score += 8;
    if (lower.includes(doc.categoryLabel?.toLowerCase())) score += 8;
    if (doc.title.toLowerCase().split(' ').some(w => lower.includes(w) && w.length > 3)) score += 3;
    return { doc, score };
  });

  return scored
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.doc)
    .slice(0, 5);
}

export const divorceCategories = {
  notary: {
    id: "divorce-notary",
    label: "Notary Divorce",
    conditions: "Mutual consent • No contested matters",
    color: "#22c55e",
    documents: ["cerere-divort-notariat"]
  },
  civil: {
    id: "divorce-civil",
    label: "Civil Registry Divorce",
    conditions: "Mutual consent • No minor children • Free",
    color: "#06b6d4",
    documents: ["cerere-divort-stare-civila"]
  },
  court: {
    id: "divorce-court",
    label: "Court Divorce",
    conditions: "Contested terms • Custody disputes • Complex",
    color: "#ef4444",
    documents: ["cerere-divort-judecata"]
  }
};

export function classifyDivorce({ hasConsent, hasMinors, hasDisputes }) {
  if (!hasConsent || hasDisputes) return divorceCategories.court;
  if (hasConsent && !hasMinors) return divorceCategories.civil;
  return divorceCategories.notary;
}

export default civicDocuments;