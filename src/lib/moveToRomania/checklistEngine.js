/**
 * Move to Romania — checklist generation engine
 * Builds a personalized integration plan from the onboarding answers.
 */

const ALL_STEPS = [
  {
    id: 'residence-permit',
    icon: '🛂',
    titleKey: 'residence_permit',
    title: { en: 'Residence permit / registration certificate', ro: 'Permis de ședere', ua: 'Дозвіл на проживання', fr: 'Permis de séjour' },
    why: {
      en: 'Required to live legally in Romania for more than 90 days.',
      ro: 'Necesar pentru a locui legal în România peste 90 zile.',
      ua: 'Потрібен для легального проживання в Румунії понад 90 днів.',
      fr: 'Requis pour vivre légalement plus de 90 jours.',
    },
    docs: ['Passport / national ID', 'Proof of address (rental contract or property deed)', 'Proof of financial means', 'Health insurance', '4 photos (3x4 cm)'],
    institutionId: 'imigrari-cluj',
    institutionFallback: 'spclep-cluj',
    estimatedTime: '2-4 weeks',
    cost: '120 RON',
    deadline: '30 days after arrival',
    appliesTo: (a) => a.residence === 'yes' || a.citizenship === 'non_eu',
    requireDocs: true,
  },
  {
    id: 'address-registration',
    icon: '🏠',
    title: { en: 'Address registration (mențiune de reședință)', ro: 'Înregistrare reședință', ua: 'Реєстрація адреси', fr: 'Enregistrement d\'adresse' },
    why: {
      en: 'You must register your Romanian address with local authorities.',
      ro: 'Trebuie să-ți declari adresa la autorități.',
      ua: 'Ви повинні зареєструвати свою адресу у місцевих органах.',
      fr: 'Vous devez enregistrer votre adresse auprès des autorités.',
    },
    docs: ['Passport / ID', 'Rental contract or housing proof', 'Owner consent (if rented)'],
    institutionId: 'spclep-cluj',
    estimatedTime: '1 day',
    cost: 'Free',
    deadline: '15 days after move-in',
    appliesTo: (a) => a.housing === 'yes',
    requireDocs: true,
  },
  {
    id: 'health-cnas',
    icon: '🏥',
    title: { en: 'Health insurance (CNAS) registration', ro: 'Înregistrare CNAS', ua: 'Реєстрація в CNAS', fr: 'Assurance santé CNAS' },
    why: {
      en: 'Free public healthcare requires CNAS registration.',
      ro: 'Accesul la sistemul medical public necesită înregistrare CNAS.',
      ua: 'Безкоштовна медицина потребує реєстрації в CNAS.',
      fr: 'L\'accès aux soins publics nécessite une inscription CNAS.',
    },
    docs: ['Residence permit', 'Employment contract OR proof of income', 'Personal ID number (CNP)'],
    institutionId: 'cjas-cluj',
    estimatedTime: '1-2 weeks',
    cost: 'Variable (10% of income)',
    appliesTo: (a) => a.healthcare === 'yes' || a.reason === 'work',
    requireDocs: true,
  },
  {
    id: 'anaf-tax',
    icon: '💼',
    title: { en: 'ANAF tax registration', ro: 'Înregistrare fiscală ANAF', ua: 'Реєстрація в ANAF', fr: 'Enregistrement fiscal ANAF' },
    why: {
      en: 'Required to work, open a business, or buy property.',
      ro: 'Necesar pentru a lucra, deschide o firmă sau cumpăra proprietate.',
      ua: 'Потрібно для роботи, бізнесу або купівлі нерухомості.',
      fr: 'Requis pour travailler ou créer une entreprise.',
    },
    docs: ['Residence permit', 'Passport', 'Address proof'],
    institutionId: 'anaf-cluj',
    estimatedTime: '1 day',
    cost: 'Free',
    appliesTo: (a) => a.reason === 'work' || a.reason === 'business' || a.contract === 'yes',
    requireDocs: false,
  },
  {
    id: 'employment-contract',
    icon: '📄',
    title: { en: 'Employment contract review', ro: 'Verificare contract de muncă', ua: 'Перевірка трудового договору', fr: 'Vérification du contrat' },
    why: {
      en: 'Ensures your contract is registered with REVISAL and meets Romanian labor law.',
      ro: 'Asigură că contractul tău e înregistrat în REVISAL.',
      ua: 'Гарантує реєстрацію договору в REVISAL.',
      fr: 'Garantit l\'enregistrement de votre contrat dans REVISAL.',
    },
    docs: ['Signed contract', 'REVISAL extract from employer', 'Job description'],
    institutionId: 'anaf-cluj',
    estimatedTime: '1-3 days',
    cost: 'Free',
    appliesTo: (a) => a.contract === 'yes' || a.reason === 'work',
    requireDocs: false,
  },
  {
    id: 'bank-account',
    icon: '🏦',
    title: { en: 'Open a Romanian bank account', ro: 'Deschidere cont bancar', ua: 'Відкриття банківського рахунку', fr: 'Ouvrir un compte bancaire' },
    why: {
      en: 'Salary, rent and utilities require a Romanian IBAN.',
      ro: 'Salariul, chiria și utilitățile au nevoie de IBAN românesc.',
      ua: 'Зарплата та комунальні платежі потребують румунського IBAN.',
      fr: 'Salaire et factures nécessitent un IBAN roumain.',
    },
    docs: ['Passport', 'Residence permit', 'Proof of address', 'Employment contract (optional)'],
    institutionId: null,
    estimatedTime: '30-60 min (same day)',
    cost: 'Free at most banks',
    appliesTo: () => true,
    requireDocs: true,
  },
  {
    id: 'city-hall',
    icon: '🏛️',
    title: { en: 'Local city hall procedures', ro: 'Proceduri Primărie', ua: 'Процедури в мерії', fr: 'Démarches mairie' },
    why: {
      en: 'Local taxes, parking permits, and resident benefits.',
      ro: 'Taxe locale, parcare, beneficii rezidenți.',
      ua: 'Місцеві податки та паркування.',
      fr: 'Taxes locales et stationnement.',
    },
    docs: ['Residence proof', 'Tax form (if applicable)'],
    institutionId: 'primaria-cluj',
    estimatedTime: '1 day',
    cost: 'Variable',
    appliesTo: () => true,
    requireDocs: false,
  },
  {
    id: 'translation',
    icon: '🌐',
    title: { en: 'Document translation & apostille', ro: 'Traducere și apostilă', ua: 'Переклад і апостиль', fr: 'Traduction et apostille' },
    why: {
      en: 'Foreign documents (diplomas, certificates) must be officially translated.',
      ro: 'Documentele străine trebuie traduse oficial.',
      ua: 'Іноземні документи потребують офіційного перекладу.',
      fr: 'Les documents étrangers doivent être traduits officiellement.',
    },
    docs: ['Original document', 'Apostille (from home country)'],
    institutionId: null,
    estimatedTime: '2-5 days',
    cost: '50-150 RON per page',
    appliesTo: (a) => a.citizenship === 'non_eu',
    requireDocs: false,
  },
  {
    id: 'embassy',
    icon: '🛡️',
    title: { en: 'Embassy / consulate registration', ro: 'Înregistrare ambasadă', ua: 'Реєстрація в посольстві', fr: 'Inscription consulat' },
    why: {
      en: 'Stay connected to your home country for emergencies.',
      ro: 'Pentru asistență consulară în caz de urgență.',
      ua: 'Для консульської допомоги в надзвичайних ситуаціях.',
      fr: 'Pour l\'assistance consulaire en cas d\'urgence.',
    },
    docs: ['Passport', 'Romanian address'],
    institutionId: null,
    estimatedTime: '30 min online',
    cost: 'Free',
    appliesTo: () => true,
    requireDocs: false,
  },
];

export function generateChecklist(answers) {
  return ALL_STEPS
    .filter(step => step.appliesTo(answers))
    .map(step => ({
      ...step,
      status: 'not_started', // not_started | missing_docs | ready | appointment | completed
    }));
}

export function computeProgress(checklist) {
  if (!checklist.length) return { percent: 0, completed: 0, total: 0, ready: 0, remaining: 0, timeSaved: '0h' };
  const completed = checklist.filter(c => c.status === 'completed').length;
  const ready = checklist.filter(c => c.status === 'ready' || c.status === 'completed').length;
  const remaining = checklist.filter(c => c.status !== 'completed').length;
  const percent = Math.round((completed / checklist.length) * 100);
  // Each step saves ~30-45 min of figuring-out time
  const timeSavedHours = Math.round(checklist.length * 0.7);
  return {
    percent, completed, total: checklist.length, ready, remaining,
    timeSaved: `${timeSavedHours}-${timeSavedHours + 4}h`,
  };
}