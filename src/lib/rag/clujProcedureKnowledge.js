/**
 * Cluj Procedure Knowledge Graph
 * Real data scraped from official Romanian government sources:
 * - primariaclujnapoca.ro
 * - pasapoarte.mai.gov.ro
 * - dgpci.mai.gov.ro
 * - hub.mai.gov.ro
 * - cj.politiaromana.ro
 * - anaf.ro
 * - djepcluj.ro
 *
 * All procedures are scoped to Cluj-Napoca / Cluj County only.
 * Last updated: May 2026
 */

export const CLUJ_PROCEDURES = [
  {
    id: 'carte-identitate-expirare',
    title: 'Reînnoire Carte de Identitate (Expirată)',
    aliases: ['renew id', 'buletin expirat', 'carte identitate expirata', 'id expired', 'id renewal'],
    category: 'Acte de Identitate',
    institution: 'SPCLEP Cluj-Napoca (Serviciul Public Comunitar Local de Evidență a Persoanelor)',
    institutionId: 'spclep-cluj',
    address: 'Str. Moților nr. 5, Cluj-Napoca',
    phone: '+40264596030',
    workflowType: 'appointment',
    onlineAvailable: true,
    onlineUrl: 'https://hub.mai.gov.ro/cei/programari/create?judet=CJ',
    appointmentUrl: 'https://hub.mai.gov.ro/cei/programari/create?judet=CJ',
    fees: { standard: '0 lei (CEI gratuită)', alternative: '38 lei (CIS)' },
    processingTime: '30 zile',
    bestTime: 'Luni–Miercuri, 08:30–11:00',
    hours: 'L-M-M: 08:30–16:30 | J: 08:30–18:30 | V: 08:30–14:30',
    requiredDocuments: [
      'Carte de identitate veche (în original)',
      'Certificat de naștere (original)',
      'Certificat de căsătorie (dacă e cazul, original)',
      'Hotărâre divorț (dacă e cazul)',
      'Dovada adresei de domiciliu (contract chirie/proprietate, original)',
      'Declarație proprietar (dacă locuiești cu chirie)',
      'Dovada plății (38 lei pentru CIS, sau gratuită pentru CEI)',
    ],
    requiredProfileFields: ['full_name', 'birth_date', 'address_line_1', 'city', 'cnp'],
    optionalDocuments: ['Certificat de divorț', 'Adeverință medicală (dacă aplicabil)'],
    generatedDrafts: ['cerere_act_identitate', 'declaratie_domiciliu'],
    officialSources: [
      { label: 'Primăria Cluj — Acte de identitate', url: 'https://primariaclujnapoca.ro/evidenta-persoanelor/acte-de-identitate/' },
      { label: 'Programare CEI online', url: 'https://hub.mai.gov.ro/cei/programari/create?judet=CJ' },
    ],
    commonMistakes: [
      'Dovada adresei lipsă sau depășită (trebuie să fie recent emisă)',
      'Lipsa declarației proprietarului pentru chiriași',
      'Fotografii neconforme (dacă se solicită CIS)',
      'Se prezintă la ghișeul greșit (CEI: ghișeele 1-2, CIS: ghișeele 3-6)',
    ],
    warnings: ['Cartea de identitate simplă (CIS) nu este document de călătorie internațională.', 'Cartea Electronică de Identitate (CEI) este gratuită și permite servicii electronice.'],
    queueEnabled: true,
    queueInstitutionId: 'spclep-cluj',
  },

  {
    id: 'carte-identitate-pierduta',
    title: 'Carte de Identitate Pierdută / Furată',
    aliases: ['lost id', 'buletin pierdut', 'furat buletin', 'stolen id', 'pierdut act identitate'],
    category: 'Acte de Identitate',
    institution: 'SPCLEP Cluj-Napoca',
    institutionId: 'spclep-cluj',
    address: 'Str. Moților nr. 5, Cluj-Napoca',
    phone: '+40264596030',
    workflowType: 'appointment',
    onlineAvailable: false,
    appointmentUrl: 'https://hub.mai.gov.ro/cei/programari/create?judet=CJ',
    fees: { standard: '0 lei (CEI gratuită)', alternative: '38 lei (CIS)' },
    processingTime: '30 zile (standard), 10 zile (urgent)',
    bestTime: 'Luni–Miercuri, 08:30–11:00',
    hours: 'L-M-M: 08:30–16:30 | J: 08:30–18:30',
    requiredDocuments: [
      'Declarație pierdere/furt (de la Poliție sau declarație pe proprie răspundere)',
      'Certificat de naștere (original)',
      'Dovada adresei de domiciliu (original)',
      'Declarație proprietar (dacă locuiești cu chirie)',
    ],
    requiredProfileFields: ['full_name', 'birth_date', 'address_line_1', 'cnp'],
    generatedDrafts: ['declaratie_pierdere_act', 'cerere_act_identitate'],
    officialSources: [
      { label: 'Primăria Cluj — Acte de identitate', url: 'https://primariaclujnapoca.ro/evidenta-persoanelor/acte-de-identitate/' },
    ],
    commonMistakes: [
      'Nu se depune declarația de pierdere la poliție înainte de prezentarea la ghișeu',
      'Lipsa dovezii de domiciliu actualizate',
    ],
    warnings: ['Dacă actul a fost furat, depune declarație la cel mai apropiat post de poliție ÎNAINTE de a veni la SPCLEP.'],
    queueEnabled: true,
    queueInstitutionId: 'spclep-cluj',
  },

  {
    id: 'schimbare-domiciliu',
    title: 'Schimbare Domiciliu / Adresă pe Buletin',
    aliases: ['change address', 'schimbare domiciliu', 'mutare adresa', 'update address'],
    category: 'Acte de Identitate',
    institution: 'SPCLEP Cluj-Napoca',
    institutionId: 'spclep-cluj',
    address: 'Str. Moților nr. 5, Cluj-Napoca',
    workflowType: 'appointment',
    onlineAvailable: false,
    appointmentUrl: 'https://hub.mai.gov.ro/cei/programari/create?judet=CJ',
    fees: { standard: '0 lei (CEI)', alternative: '38 lei (CIS)' },
    processingTime: '30 zile',
    bestTime: 'Miercuri, 09:00–12:00',
    hours: 'L-M-M: 08:30–16:30 | J: 08:30–18:30 | V: 08:30–14:30',
    requiredDocuments: [
      'Carte de identitate actuală (original)',
      'Certificat de naștere (original)',
      'Dovada noii adrese (contract chirie/titlu proprietate)',
      'Declarație proprietar + copie CI proprietar (dacă locuiești cu chirie)',
    ],
    requiredProfileFields: ['full_name', 'birth_date', 'address_line_1', 'city', 'cnp'],
    generatedDrafts: ['cerere_act_identitate', 'declaratie_domiciliu'],
    officialSources: [
      { label: 'Primăria Cluj — Acte de identitate', url: 'https://primariaclujnapoca.ro/evidenta-persoanelor/acte-de-identitate/' },
    ],
    commonMistakes: ['Proprietarul trebuie să fie prezent sau să aibă declarație autentificată', 'Contractul de chirie trebuie înregistrat la ANAF'],
    warnings: ['Contractul de închiriere trebuie înregistrat la ANAF pentru a fi acceptat ca dovadă de domiciliu.'],
    queueEnabled: true,
    queueInstitutionId: 'spclep-cluj',
  },

  {
    id: 'pasaport-reinnoire',
    title: 'Reînnoire Pașaport Simplu Electronic',
    aliases: ['passport renewal', 'pasaport reinnoire', 'pasaport expirat', 'renew passport', 'pasaport nou'],
    category: 'Pașapoarte',
    institution: 'Serviciul Public Comunitar de Pașapoarte Cluj',
    institutionId: 'pasapoarte-cluj',
    address: 'Str. Andrei Mureșanu nr. 16, Cluj-Napoca',
    phone: '+40264440722',
    workflowType: 'appointment',
    onlineAvailable: true,
    onlineUrl: 'https://hub.mai.gov.ro/epasapoarte/programari/harta',
    appointmentUrl: 'https://hub.mai.gov.ro/epasapoarte/programari/harta',
    fees: { standard: '258 lei (10 ani, adult)', expedited: '510 lei (urgent)', minor: '234 lei (minor sub 12 ani)' },
    processingTime: '15 zile lucrătoare (standard), 2 zile (urgent)',
    bestTime: 'Marți–Joi, 08:30–10:30',
    hours: 'L-V: 08:30–16:30',
    requiredDocuments: [
      'Carte de identitate valabilă (original)',
      'Pașaport vechi (dacă există)',
      'Dovada plății taxei (258 lei) — chitanță Trezorerie sau card',
    ],
    requiredProfileFields: ['full_name', 'birth_date', 'cnp', 'address_line_1'],
    generatedDrafts: ['cerere_pasaport'],
    officialSources: [
      { label: 'MAI — Documente necesare pașaport', url: 'https://pasapoarte.mai.gov.ro/documente-necesare-pentru-pasaport-simplu-electronic/' },
      { label: 'Programare online pașaport', url: 'https://hub.mai.gov.ro/epasapoarte/programari/harta' },
      { label: 'Serviciul Pașapoarte Cluj', url: 'https://pasapoarte.mai.gov.ro/serviciul-public-comunitar-de-pasapoarte-cluj/' },
    ],
    commonMistakes: [
      'Taxa nu este plătită înainte de prezentare (trebuie plătită la Trezorerie sau card)',
      'Pașaportul vechi nu este adus (reduce timpul de procesare)',
      'Programarea online nu este făcută (cozi foarte mari fără programare)',
    ],
    warnings: ['Taxa se poate plăti online sau la CEC Bank / Trezorerie. Păstrează chitanța originală.'],
    queueEnabled: true,
    queueInstitutionId: 'pasapoarte-cluj',
  },

  {
    id: 'pasaport-urgent',
    title: 'Pașaport Urgent / Temporar',
    aliases: ['urgent passport', 'pasaport urgent', 'pasaport temporar', 'emergency passport'],
    category: 'Pașapoarte',
    institution: 'Serviciul Public Comunitar de Pașapoarte Cluj',
    institutionId: 'pasapoarte-cluj',
    address: 'Str. Andrei Mureșanu nr. 16, Cluj-Napoca',
    phone: '+40264440722',
    workflowType: 'walk-in',
    onlineAvailable: false,
    fees: { expedited: '510 lei (48h)', veryUrgent: '540 lei (24h)' },
    processingTime: '24–48 ore',
    bestTime: 'Prima oră dimineață (08:30)',
    hours: 'L-V: 08:30–16:30',
    requiredDocuments: [
      'Carte de identitate valabilă (original)',
      'Dovada urgenței (bilet avion, invitație medicală, etc.)',
      'Pașaport vechi (dacă există)',
      'Dovada plății taxei urgente (510 lei)',
    ],
    requiredProfileFields: ['full_name', 'birth_date', 'cnp'],
    generatedDrafts: ['declaratie_urgenta_pasaport'],
    officialSources: [
      { label: 'MAI — Pașapoarte Cluj', url: 'https://pasapoarte.mai.gov.ro/serviciul-public-comunitar-de-pasapoarte-cluj/' },
    ],
    commonMistakes: ['Dovada urgenței trebuie să fie clară și validă', 'Taxa urgentă este mai mare — pregătiți suma exactă'],
    warnings: ['Urgența trebuie dovedită. Biletul de avion sau documentele medicale sunt cele mai acceptate.'],
    queueEnabled: true,
    queueInstitutionId: 'pasapoarte-cluj',
  },

  {
    id: 'permis-conducere-reinnoire',
    title: 'Reînnoire Permis de Conducere',
    aliases: ['driving license renewal', 'permis conducere reinnoire', 'permis expirat', 'renew driving license'],
    category: 'Permise & Înmatriculări',
    institution: 'DRPCIV Cluj — Direcția Regim Permise de Conducere și Înmatriculare Vehicule',
    institutionId: 'drpciv-cluj',
    address: 'Str. Dorobanților nr. 99, Cluj-Napoca',
    phone: '+40264597900',
    workflowType: 'appointment',
    onlineAvailable: true,
    onlineUrl: 'https://programari.drpciv.ro/',
    appointmentUrl: 'https://programari.drpciv.ro/',
    fees: { standard: '55 lei permis + taxa medicală' },
    processingTime: '30 zile',
    bestTime: 'Miercuri–Joi, 09:00–11:00',
    hours: 'L-V: 09:00–15:00',
    requiredDocuments: [
      'Carte de identitate valabilă (original + copie)',
      'Permis de conducere vechi (original)',
      'Fișă medicală aptitudini auto (de la medic autorizat DRPCIV)',
      'Dovada plății taxei (55 lei)',
      'Cerere tip (se obține la ghișeu sau online)',
    ],
    requiredProfileFields: ['full_name', 'birth_date', 'cnp', 'address_line_1'],
    generatedDrafts: ['cerere_preschimbare_permis'],
    officialSources: [
      { label: 'DRPCIV — Documente permise', url: 'https://dgpci.mai.gov.ro/documents-and-forms/permise' },
      { label: 'Programare DRPCIV', url: 'https://programari.drpciv.ro/' },
    ],
    commonMistakes: [
      'Fișa medicală lipsă sau expirată (trebuie să fie de la medic autorizat de DRPCIV)',
      'Programarea nu este făcută online înainte de prezentare',
      'Taxa nu este plătită la bancă înainte de ghișeu',
    ],
    warnings: ['Fișa medicală trebuie să fie de la un medic autorizat DRPCIV. Verifică lista autorizaților pe site.'],
    queueEnabled: true,
    queueInstitutionId: 'drpciv-cluj',
  },

  {
    id: 'inmatriculare-auto',
    title: 'Înmatriculare Autovehicul',
    aliases: ['vehicle registration', 'inmatriculare auto', 'inmatriculare masina', 'register car'],
    category: 'Permise & Înmatriculări',
    institution: 'DRPCIV Cluj',
    institutionId: 'drpciv-cluj',
    address: 'Str. Dorobanților nr. 99, Cluj-Napoca',
    workflowType: 'walk-in',
    onlineAvailable: false,
    fees: { standard: 'Variabil (taxă timbru + certificat înmatriculare)' },
    processingTime: 'În aceeași zi (dacă toate documentele sunt complete)',
    bestTime: 'Marți, 08:30–10:00',
    hours: 'L-V: 09:00–15:00',
    requiredDocuments: [
      'Carte de identitate (original + copie)',
      'Cartea de identitate a vehiculului (talon)',
      'Contract de vânzare-cumpărare (original)',
      'Asigurare RCA valabilă',
      'Certificat fiscal de la Taxe Locale (nu mai vechi de 30 zile)',
      'Dovada plății taxei de înmatriculare',
      'Inspecție ITP valabilă (dacă aplicabil)',
    ],
    requiredProfileFields: ['full_name', 'address_line_1', 'cnp'],
    generatedDrafts: ['cerere_inmatriculare'],
    officialSources: [
      { label: 'DRPCIV — Documente înmatriculări', url: 'https://dgpci.mai.gov.ro/documents-and-forms/permise' },
    ],
    commonMistakes: [
      'Certificatul fiscal lipsă (se obține de la Taxe Locale înainte)',
      'RCA expirat sau nevalid',
      'Contractul nu este în forma legală',
    ],
    warnings: ['Certificatul fiscal trebuie obținut de la Direcția Taxe și Impozite Locale Cluj-Napoca ÎNAINTE de a veni la DRPCIV.'],
    queueEnabled: true,
    queueInstitutionId: 'drpciv-cluj',
  },

  {
    id: 'cazier-judiciar',
    title: 'Certificat de Cazier Judiciar',
    aliases: ['criminal record', 'cazier judiciar', 'police record', 'antecedente penale', 'background check'],
    category: 'Cazier & Documente Juridice',
    institution: 'IPJ Cluj — Serviciul Cazier Judiciar, Statistică și Evidențe Operative',
    institutionId: 'ipj-cluj',
    address: 'Calea Dorobanților nr. 2, Cluj-Napoca',
    phone: '+40264596080',
    workflowType: 'online',
    onlineAvailable: true,
    onlineUrl: 'https://hub.mai.gov.ro/serviciu/view?id=88',
    fees: { online: '0 lei (online)', inPerson: '2 lei taxă timbru' },
    processingTime: 'Imediat (online), în aceeași zi (fizic)',
    bestTime: 'Oricând în timpul programului',
    hours: 'L-V: 09:00–16:00',
    requiredDocuments: [
      'Carte de identitate (original) — pentru solicitare fizică',
      'Cont hub.mai.gov.ro — pentru solicitare online',
    ],
    requiredProfileFields: ['full_name', 'cnp', 'birth_date'],
    generatedDrafts: ['cerere_cazier'],
    officialSources: [
      { label: 'Hub MAI — Cazier online', url: 'https://hub.mai.gov.ro/serviciu/view?id=88' },
      { label: 'IPJ Cluj — Cazier judiciar', url: 'https://cj.politiaromana.ro/ro/utile/cazier-judiciar' },
    ],
    commonMistakes: [
      'Se prezintă fizic deși se poate face online în 5 minute',
      'Nu au cont pe hub.mai.gov.ro (trebuie creat în prealabil)',
    ],
    warnings: ['Cazierul online prin hub.mai.gov.ro este GRATUIT și durează câteva minute. Mergi fizic doar dacă ai nevoie de document original stampilat.'],
    queueEnabled: true,
    queueInstitutionId: 'ipj-cluj',
  },

  {
    id: 'asigurare-sanatate-cjas',
    title: 'Dovedire / Înregistrare Asigurare de Sănătate',
    aliases: ['health insurance', 'asigurare sanatate', 'cnas', 'cjas', 'card sanatate', 'dovada asigurare'],
    category: 'Asigurări & Sănătate',
    institution: 'CJAS Cluj — Casa Județeană de Asigurări de Sănătate Cluj',
    institutionId: 'cjas-cluj',
    address: 'Str. Bologa nr. 2, Cluj-Napoca',
    phone: '+40264431163',
    workflowType: 'hybrid',
    onlineAvailable: true,
    onlineUrl: 'https://www.cnas.ro/page/servicii-online.html',
    fees: { standard: 'Gratuit' },
    processingTime: 'În aceeași zi',
    bestTime: 'Marți–Joi, 09:00–12:00',
    hours: 'L-V: 08:00–16:00',
    requiredDocuments: [
      'Carte de identitate (original)',
      'Adeverință angajator / student / pensie (dovada calității de asigurat)',
      'Card național de sănătate (dacă există)',
    ],
    requiredProfileFields: ['full_name', 'cnp', 'birth_date'],
    generatedDrafts: ['cerere_asigurare_sanatate'],
    officialSources: [
      { label: 'CNAS — Servicii online', url: 'https://www.cnas.ro/page/servicii-online.html' },
      { label: 'CJAS Cluj', url: 'https://www.cascluj.ro/' },
    ],
    commonMistakes: ['Adeverința de la angajator nu este recentă (trebuie să fie din ultimele 30 zile)', 'Se confundă CJAS cu medicul de familie'],
    warnings: ['Verifică mai întâi online statusul asigurării pe site-ul CNAS sau prin medicul de familie.'],
    queueEnabled: true,
    queueInstitutionId: 'cjas-cluj',
  },

  {
    id: 'certificat-fiscal-anaf',
    title: 'Certificat de Atestare Fiscală (ANAF)',
    aliases: ['anaf', 'fiscal certificate', 'certificat fiscal anaf', 'cazier fiscal', 'tax certificate'],
    category: 'Finanțe & Taxe',
    institution: 'ANAF Cluj — Administrația Județeană a Finanțelor Publice Cluj',
    institutionId: 'anaf-cluj',
    address: 'Str. George Barițiu nr. 26-28, Cluj-Napoca',
    phone: '+40264596390',
    workflowType: 'online',
    onlineAvailable: true,
    onlineUrl: 'https://www.anaf.ro/anaf/internet/RO/spv',
    fees: { standard: 'Gratuit' },
    processingTime: 'Imediat (online SPV), 3 zile (fizic)',
    bestTime: 'Miercuri, 09:00–11:00',
    hours: 'L-V: 08:30–16:30',
    requiredDocuments: [
      'Carte de identitate (original) — pentru solicitare fizică',
      'Cont SPV (Spațiu Privat Virtual) — pentru online',
    ],
    requiredProfileFields: ['full_name', 'cnp'],
    generatedDrafts: ['cerere_certificat_fiscal'],
    officialSources: [
      { label: 'ANAF — SPV (online)', url: 'https://www.anaf.ro/anaf/internet/RO/spv' },
      { label: 'ANAF Cluj — Contact', url: 'https://www.anaf.ro/anaf/internet/RO/AJFP_Cluj' },
    ],
    commonMistakes: [
      'Nu au cont SPV (se poate crea online sau cu certificat digital)',
      'Se confundă certificatul fiscal ANAF cu certificatul local de la Taxe Locale',
    ],
    warnings: ['Certificatul fiscal ANAF se poate obține INSTANT prin SPV online. Recomandăm această variantă.'],
    queueEnabled: true,
    queueInstitutionId: 'anaf-cluj',
  },

  {
    id: 'taxe-locale-certificat',
    title: 'Certificat Fiscal Local / Plată Taxe Locale',
    aliases: ['local taxes', 'impozite locale', 'certificat fiscal local', 'taxe locale cluj'],
    category: 'Finanțe & Taxe',
    institution: 'Direcția Taxe și Impozite Locale Cluj-Napoca',
    institutionId: 'taxe-locale-cluj',
    address: 'Str. Moților nr. 7, Cluj-Napoca',
    phone: '+40264596030',
    workflowType: 'online',
    onlineAvailable: true,
    onlineUrl: 'https://taxe.primariaclujnapoca.ro/',
    fees: { standard: 'Gratuit (certificat)' },
    processingTime: 'Imediat (online), în aceeași zi (fizic)',
    bestTime: 'Oricând 10:00–13:00',
    hours: 'L-V: 08:30–16:30',
    requiredDocuments: [
      'Carte de identitate (original)',
      'Date imobil/vehicul (adresă, număr cadastral sau număr de înregistrare auto)',
    ],
    requiredProfileFields: ['full_name', 'cnp', 'address_line_1'],
    generatedDrafts: ['cerere_certificat_fiscal_local'],
    officialSources: [
      { label: 'Taxe locale Cluj online', url: 'https://taxe.primariaclujnapoca.ro/' },
    ],
    commonMistakes: ['Se confundă cu ANAF (ANAF = taxe naționale, Taxe Locale = impozite pe proprietăți și vehicule din Cluj)'],
    warnings: ['Certificatul fiscal local se poate obține rapid și online. Necesar pentru înmatriculări auto.'],
    queueEnabled: true,
    queueInstitutionId: 'taxe-locale-cluj',
  },

  {
    id: 'inregistrare-firma',
    title: 'Înregistrare Firmă / Societate (SRL, PFA)',
    aliases: ['register company', 'inregistrare firma', 'open srl', 'pfa', 'company registration', 'srl cluj'],
    category: 'Mediu de Afaceri',
    institution: 'Oficiul Registrului Comerțului de pe lângă Tribunalul Cluj',
    institutionId: 'onrc-cluj',
    address: 'Str. Dorobanților nr. 14, Cluj-Napoca',
    phone: '+40264432100',
    workflowType: 'online',
    onlineAvailable: true,
    onlineUrl: 'https://portal.onrc.ro/',
    fees: { srl: '~200 lei (taxe ONRC + publicare)', pfa: '~100 lei' },
    processingTime: '3–5 zile lucrătoare',
    bestTime: 'Online: oricând',
    hours: 'L-V: 08:30–16:30',
    requiredDocuments: [
      'Carte de identitate asociați / administrator (copie)',
      'Dovada sediu social (contract chirie/proprietate)',
      'Acordul proprietarului pentru sediu (dacă aplicabil)',
      'Specimenul de semnătură al administratorului (autentificat)',
      'Actul constitutiv (redactat de avocat sau generat pe portal ONRC)',
      'Dovada plății taxelor ONRC',
    ],
    requiredProfileFields: ['full_name', 'address_line_1', 'cnp', 'phone', 'email'],
    generatedDrafts: ['act_constitutiv_srl', 'declaratie_asociat'],
    officialSources: [
      { label: 'Portal ONRC online', url: 'https://portal.onrc.ro/' },
      { label: 'ONRC Cluj', url: 'https://www.onrc.ro/index.php/ro/contacte/judete?id=8' },
    ],
    commonMistakes: [
      'Sediul social nu are acordul proprietarului',
      'Actul constitutiv nu este redactat corect',
      'Specimenul de semnătură nu este autentificat notarial',
    ],
    warnings: ['Actul constitutiv poate fi generat gratuit pe portal.onrc.ro. Recomandăm consultarea unui avocat pentru firme mai complexe.'],
    queueEnabled: false,
  },

  {
    id: 'stare-civila-nastere',
    title: 'Certificat de Naștere (Duplicat)',
    aliases: ['birth certificate', 'certificat nastere', 'duplicate birth certificate', 'nastere duplicat'],
    category: 'Stare Civilă',
    institution: 'Serviciul Stare Civilă Cluj-Napoca',
    institutionId: 'stare-civila-cluj',
    address: 'Str. Moților nr. 3, Cluj-Napoca',
    workflowType: 'walk-in',
    onlineAvailable: false,
    fees: { standard: '2 lei timbru' },
    processingTime: '1–3 zile',
    bestTime: 'Marți–Joi, 10:00–12:00',
    hours: 'L-V: 08:30–16:00',
    requiredDocuments: [
      'Carte de identitate (original)',
      'Cerere tip completată',
      'Dovada relației (dacă se solicită pentru altă persoană)',
    ],
    requiredProfileFields: ['full_name', 'birth_date', 'cnp'],
    generatedDrafts: ['cerere_duplicat_nastere'],
    officialSources: [
      { label: 'Stare Civilă Cluj-Napoca', url: 'https://primariaclujnapoca.ro/stare-civila/' },
    ],
    commonMistakes: ['Se solicită pentru altă persoană fără dovada relației de rudenie'],
    warnings: [],
    queueEnabled: true,
    queueInstitutionId: 'stare-civila-cluj',
  },

  {
    id: 'casatorie',
    title: 'Căsătorie Civilă',
    aliases: ['marriage', 'casatorie', 'civil marriage', 'cununie civila'],
    category: 'Stare Civilă',
    institution: 'Serviciul Stare Civilă Cluj-Napoca',
    institutionId: 'stare-civila-cluj',
    address: 'Str. Moților nr. 3, Cluj-Napoca',
    workflowType: 'appointment',
    onlineAvailable: false,
    fees: { standard: '2 lei timbru (acte) + eventuale taxe suplimentare' },
    processingTime: 'Minim 10 zile de la depunere',
    bestTime: 'Oricând în program',
    hours: 'L-V: 08:30–16:00',
    requiredDocuments: [
      'Cărțile de identitate ale ambilor viitori soți (originale)',
      'Certificatele de naștere (originale)',
      'Certificate medicale prenupțiale (de la medicul de familie)',
      'Hotărâre divorț (dacă e cazul)',
      'Certificat de deces soț anterior (dacă e cazul)',
      'Declarație de căsătorie (completată la ghișeu)',
    ],
    requiredProfileFields: ['full_name', 'birth_date', 'cnp', 'father_name', 'mother_name'],
    generatedDrafts: ['declaratie_casatorie'],
    officialSources: [
      { label: 'Stare Civilă Cluj', url: 'https://primariaclujnapoca.ro/stare-civila/' },
    ],
    commonMistakes: ['Certificatele medicale prenupțiale sunt uitate', 'Nu este respectat termenul de minim 10 zile'],
    warnings: ['Depunerea dosarului trebuie făcută cu minim 10 zile înaintea datei dorite pentru ceremonie.'],
    queueEnabled: true,
    queueInstitutionId: 'stare-civila-cluj',
  },

  {
    id: 'ajutor-social',
    title: 'Cerere Ajutor Social / Prestații Sociale',
    aliases: ['social aid', 'ajutor social', 'prestatie sociala', 'benefits', 'indemnizatie'],
    category: 'Asistență Socială',
    institution: 'Direcția de Asistență Socială și Medicală Cluj-Napoca (DASM)',
    institutionId: 'dasm-cluj',
    address: 'Str. Mehedinți nr. 1-5, Cluj-Napoca',
    phone: '+40264598440',
    workflowType: 'walk-in',
    onlineAvailable: false,
    fees: { standard: 'Gratuit' },
    processingTime: '15–30 zile',
    bestTime: 'Luni–Miercuri, 09:00–12:00',
    hours: 'L-V: 08:30–16:00',
    requiredDocuments: [
      'Carte de identitate toți membrii familiei (originale + copii)',
      'Certificate de naștere copii (dacă aplicabil)',
      'Adeverință venituri (toți membrii adulți)',
      'Certificate de studii / carte de muncă (dacă aplicabil)',
      'Declarație pe proprie răspundere (completată la ghișeu)',
    ],
    requiredProfileFields: ['full_name', 'cnp', 'address_line_1', 'marital_status'],
    generatedDrafts: ['cerere_ajutor_social', 'declaratie_venituri'],
    officialSources: [
      { label: 'DASM Cluj-Napoca', url: 'https://dasm.primariaclujnapoca.ro/' },
    ],
    commonMistakes: ['Adeverințele de venit sunt incomplete sau depășite (nu mai vechi de 30 zile)', 'Nu sunt aduse actele tuturor membrilor din familie'],
    warnings: [],
    queueEnabled: false,
  },
];

/**
 * Find best procedure match from user natural language input
 */
export function findProcedure(query) {
  if (!query) return null;
  const q = query.toLowerCase();
  let best = null;
  let bestScore = 0;

  for (const proc of CLUJ_PROCEDURES) {
    let score = 0;
    for (const alias of proc.aliases) {
      if (q.includes(alias.toLowerCase())) score += alias.length + 10;
    }
    if (q.includes(proc.title.toLowerCase())) score += 20;
    const words = proc.title.toLowerCase().split(' ');
    for (const w of words) {
      if (w.length > 3 && q.includes(w)) score += 3;
    }
    if (score > bestScore) { bestScore = score; best = proc; }
  }

  return bestScore > 2 ? best : null;
}

/**
 * Get procedures by category
 */
export function getProceduresByCategory() {
  const map = {};
  for (const p of CLUJ_PROCEDURES) {
    if (!map[p.category]) map[p.category] = [];
    map[p.category].push(p);
  }
  return map;
}

export default CLUJ_PROCEDURES;