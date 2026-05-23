const workflows = [
  {
    id: "lost-id",
    title: "Lost ID Card",
    description: "Replace a lost or stolen identity card (carte de identitate / buletin).",
    keywords: ["lost id", "lost buletin", "carte identitate pierduta", "buletin pierdut"],
    documents: [
      "Birth certificate (original + copy)",
      "Proof of residence (adeverință de domiciliu)",
      "Loss declaration / police declaration",
      "Application form (from institution)",
      "Existing document copy if available"
    ],
    institution: "Direcția de Evidență a Persoanelor Cluj",
    institutionId: "spclep-cluj",
    queue: 24,
    bestTime: "Tuesday–Thursday, 09:00–11:00",
    commonMistake: "Proof of residence is missing or outdated.",
    urgency: "high",
    online: false,
    processingTime: "30 days (standard), 10 days (urgent)",
    nextSteps: ["File police report if stolen", "Gather documents", "Visit institution", "Pay fee", "Collect new ID"]
  },
  {
    id: "id-renewal",
    title: "ID Renewal",
    description: "Renew an expired identity card before or after expiration date.",
    keywords: ["renew id", "expired id", "buletin expirat", "carte identitate expirata"],
    documents: [
      "Old ID card",
      "Birth certificate (original + copy)",
      "Marriage certificate (if applicable)",
      "Proof of residence",
      "Application form"
    ],
    institution: "Direcția de Evidență a Persoanelor Cluj",
    institutionId: "spclep-cluj",
    queue: 22,
    bestTime: "Tuesday–Thursday, 09:00–11:00",
    commonMistake: "People forget civil status documents after marriage/divorce.",
    urgency: "medium",
    online: false,
    processingTime: "30 days",
    nextSteps: ["Gather all documents", "Visit institution during low-traffic hours", "Pay fee", "Collect new ID"]
  },
  {
    id: "change-address",
    title: "Change of Address",
    description: "Update your official domicile / residence address on your ID.",
    keywords: ["change address", "schimbare domiciliu", "mutare adresa"],
    documents: [
      "Current ID card",
      "Proof of new residence (contract/ownership)",
      "Owner declaration (if renting)",
      "Application form"
    ],
    institution: "Direcția de Evidență a Persoanelor Cluj",
    institutionId: "spclep-cluj",
    queue: 28,
    bestTime: "Wednesday, 10:00–12:00",
    commonMistake: "Owner approval is missing when renting.",
    urgency: "medium",
    online: false,
    processingTime: "30 days (new ID issued)",
    nextSteps: ["Get owner declaration notarized if needed", "Visit institution", "Get new ID with updated address"]
  },
  {
    id: "passport-renewal",
    title: "Passport Renewal",
    description: "Renew your Romanian passport (pașaport) before or after expiry.",
    keywords: ["passport", "pasaport", "renew passport", "pasaport expirat"],
    documents: [
      "Current ID card",
      "Old passport",
      "Payment proof (taxa)",
      "Appointment confirmation (if online booking)"
    ],
    institution: "Serviciul Public Comunitar de Pașapoarte Cluj",
    institutionId: "pasapoarte-cluj",
    queue: 31,
    bestTime: "Tuesday–Thursday, 08:30–10:30",
    commonMistake: "Payment proof is not prepared before arrival.",
    urgency: "medium",
    online: true,
    processingTime: "15 working days",
    nextSteps: ["Book appointment online if possible", "Pay fee at Treasury", "Visit with all documents", "Collect passport"]
  },
  {
    id: "temp-passport",
    title: "Temporary Passport",
    description: "Get an emergency/temporary passport for urgent travel.",
    keywords: ["temporary passport", "emergency passport", "pasaport temporar urgent"],
    documents: [
      "Current ID card",
      "Proof of urgency (flight ticket, medical docs)",
      "Payment proof",
      "Old passport (if available)"
    ],
    institution: "Serviciul Public Comunitar de Pașapoarte Cluj",
    institutionId: "pasapoarte-cluj",
    queue: 38,
    bestTime: "Monday–Friday, first thing in the morning",
    commonMistake: "Urgency proof is unclear or not accepted.",
    urgency: "critical",
    online: false,
    processingTime: "1–3 days",
    nextSteps: ["Gather urgency proof", "Visit institution immediately", "Pay expedited fee"]
  },
  {
    id: "driving-license",
    title: "Driving License Renewal",
    description: "Renew an expired or soon-to-expire driving license (permis de conducere).",
    keywords: ["driving license", "permis", "permis expirat", "renew license"],
    documents: [
      "Current ID card",
      "Old driving license",
      "Medical certificate (fișa medicală)",
      "Payment proof",
      "Application form"
    ],
    institution: "DRPCIV Cluj",
    institutionId: "drpciv-cluj",
    queue: 36,
    bestTime: "Wednesday–Thursday, 09:00–11:00",
    commonMistake: "Medical certificate is missing or expired.",
    urgency: "medium",
    online: true,
    processingTime: "30 days",
    nextSteps: ["Get medical certificate first", "Pay fee", "Book appointment", "Visit DRPCIV"]
  },
  {
    id: "vehicle-registration",
    title: "Vehicle Registration",
    description: "Register a new or used vehicle (înmatriculare auto).",
    keywords: ["register car", "inmatriculare", "vehicle registration", "masina noua"],
    documents: [
      "Current ID card",
      "Vehicle documents (carte de identitate vehicul)",
      "Proof of ownership (contract)",
      "RCA insurance (valid)",
      "Fiscal certificate",
      "Payment proof"
    ],
    institution: "DRPCIV Cluj",
    institutionId: "drpciv-cluj",
    queue: 45,
    bestTime: "Tuesday, 08:30–10:00",
    commonMistake: "Fiscal certificate or insurance proof is missing.",
    urgency: "medium",
    online: true,
    processingTime: "Same day (if all docs ready)",
    nextSteps: ["Get fiscal certificate from local taxes", "Buy RCA insurance", "Visit DRPCIV with all docs"]
  },
  {
    id: "local-taxes",
    title: "Local Taxes / Tax Certificate",
    description: "Pay local taxes or get a fiscal certificate (certificat fiscal) for property or vehicle.",
    keywords: ["local taxes", "impozite locale", "certificat fiscal", "tax certificate"],
    documents: [
      "Current ID card",
      "Property/vehicle details",
      "Request form",
      "Payment proof (if applicable)"
    ],
    institution: "Direcția Taxe și Impozite Locale Cluj-Napoca",
    institutionId: "taxe-locale",
    queue: 18,
    bestTime: "Any weekday, 10:00–13:00",
    commonMistake: "People confuse local taxes with ANAF national tax issues.",
    urgency: "low",
    online: true,
    processingTime: "Same day",
    nextSteps: ["Determine if it's local or national tax", "Visit local tax office", "Pay and get certificate"]
  },
  {
    id: "anaf-tax",
    title: "ANAF Tax Situation",
    description: "Check tax debts, get fiscal record (cazier fiscal), or resolve ANAF issues.",
    keywords: ["anaf", "tax debt", "datorii anaf", "cazier fiscal", "fiscal record"],
    documents: [
      "Current ID card",
      "Request form",
      "Company documents (if applicable)",
      "Digital account credentials (for online)"
    ],
    institution: "ANAF Cluj",
    institutionId: "anaf-cluj",
    queue: 40,
    bestTime: "Wednesday, 09:00–11:00",
    commonMistake: "Going to city hall for national tax problems.",
    urgency: "medium",
    online: true,
    processingTime: "1–5 days",
    nextSteps: ["Try online first via SPV", "If physical visit needed, gather all docs", "Visit ANAF"]
  },
  {
    id: "health-insurance",
    title: "Health Insurance Status",
    description: "Check or prove your health insurance status (asigurare de sănătate).",
    keywords: ["health insurance", "cnas", "card sanatate", "insurance status"],
    documents: [
      "Current ID card",
      "Employment/student/pension proof",
      "Request form",
      "Health insurance card (if available)"
    ],
    institution: "CAS Cluj / CNAS system",
    institutionId: "cas-cluj",
    queue: 34,
    bestTime: "Tuesday–Thursday, 09:00–12:00",
    commonMistake: "Not bringing employment or student status proof.",
    urgency: "medium",
    online: true,
    processingTime: "Same day",
    nextSteps: ["Check online first", "Bring status proof", "Visit CAS if needed"]
  },
  {
    id: "birth-certificate",
    title: "Birth Certificate Duplicate",
    description: "Get a duplicate birth certificate (certificat de naștere).",
    keywords: ["birth certificate", "certificat nastere", "duplicate birth certificate"],
    documents: [
      "Current ID card",
      "Application form",
      "Proof of relationship (if for another person)"
    ],
    institution: "Starea Civilă Cluj-Napoca",
    institutionId: "starea-civila",
    queue: 26,
    bestTime: "Tuesday–Thursday, 10:00–12:00",
    commonMistake: "Requesting a document for another person without proof of relationship.",
    urgency: "low",
    online: false,
    processingTime: "1–5 days",
    nextSteps: ["Visit Starea Civilă with ID", "Fill form", "Pay fee", "Collect duplicate"]
  },
  {
    id: "criminal-record",
    title: "Criminal Record Certificate",
    description: "Obtain a criminal record certificate (cazier judiciar) for employment, travel, or legal purposes.",
    keywords: ["criminal record", "cazier judiciar", "police record"],
    documents: [
      "Current ID card",
      "Application form (if needed)"
    ],
    institution: "IPJ Cluj / Police criminal record service",
    institutionId: "ipj-cluj",
    queue: 20,
    bestTime: "Any weekday, 09:00–11:00",
    commonMistake: "Going to the wrong police unit.",
    urgency: "low",
    online: true,
    processingTime: "Same day (in person), 5 days (online)",
    nextSteps: ["Try online via e-cazier", "Or visit IPJ Cluj with ID"]
  },
  {
    id: "urbanism-certificate",
    title: "Building / Urbanism Certificate",
    description: "Obtain an urbanism certificate or building permit for construction projects.",
    keywords: ["urbanism certificate", "certificat urbanism", "building permit", "autorizatie constructie"],
    documents: [
      "ID / company details",
      "Property ownership documents",
      "Cadastral plan (plan cadastral)",
      "Request form",
      "Payment proof"
    ],
    institution: "Primăria Cluj-Napoca — Urbanism Department",
    institutionId: "primaria-cluj",
    queue: 50,
    bestTime: "Tuesday, 09:00–11:00",
    commonMistake: "Missing cadastral documents.",
    urgency: "low",
    online: false,
    processingTime: "30 days",
    nextSteps: ["Get cadastral plan from OCPI", "Prepare ownership docs", "Submit to Urbanism"]
  },
  {
    id: "parking-permit",
    title: "Parking Permit",
    description: "Apply for a residential parking permit (abonament parcare) in Cluj-Napoca.",
    keywords: ["parking permit", "abonament parcare", "loc parcare"],
    documents: [
      "Current ID card",
      "Vehicle registration certificate",
      "Proof of residence",
      "Request form"
    ],
    institution: "Primăria Cluj-Napoca — Parking Department",
    institutionId: "primaria-cluj",
    queue: 29,
    bestTime: "Wednesday, 10:00–13:00",
    commonMistake: "Vehicle address does not match residence address.",
    urgency: "low",
    online: true,
    processingTime: "5–10 days",
    nextSteps: ["Ensure addresses match", "Submit request online or in person"]
  },
  {
    id: "social-benefits",
    title: "Social Benefits / Student Support",
    description: "Apply for social aid, student benefits, or other social support programs.",
    keywords: ["social aid", "ajutor social", "student support", "benefits"],
    documents: [
      "Current ID card",
      "Income proof (adeverință de venit)",
      "Household documents",
      "Student certificate (if applicable)",
      "Application form"
    ],
    institution: "Direcția de Asistență Socială și Medicală Cluj-Napoca",
    institutionId: "asistenta-sociala",
    queue: 33,
    bestTime: "Monday–Wednesday, 09:00–12:00",
    commonMistake: "Income proof is incomplete or outdated.",
    urgency: "medium",
    online: false,
    processingTime: "15–30 days",
    nextSteps: ["Gather all income and household docs", "Visit social services", "Follow up on application"]
  }
];

export default workflows;