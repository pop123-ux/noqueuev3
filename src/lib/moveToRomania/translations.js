/**
 * Move to Romania — multilingual strings
 * Languages: EN, RO, UA, FR
 */
export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ro', label: 'Română', flag: '🇷🇴' },
  { code: 'ua', label: 'Українська', flag: '🇺🇦' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export const t = {
  // Header
  title: {
    en: 'Move to Romania', ro: 'Mută-te în România',
    ua: 'Переїзд до Румунії', fr: 'Déménager en Roumanie',
  },
  subtitle: {
    en: 'Step-by-step help for settling into Romanian bureaucracy.',
    ro: 'Ghid pas cu pas pentru birocrația din România.',
    ua: 'Покрокова допомога в адаптації до румунської бюрократії.',
    fr: 'Aide étape par étape pour vous installer en Roumanie.',
  },
  // Onboarding questions
  q_citizenship: {
    en: 'Are you an EU or non-EU citizen?', ro: 'Ești cetățean UE sau non-UE?',
    ua: 'Ви громадянин ЄС чи не-ЄС?', fr: 'Êtes-vous citoyen UE ou hors UE?',
  },
  q_country: {
    en: 'What country are you from?', ro: 'Din ce țară ești?',
    ua: 'З якої ви країни?', fr: 'De quel pays venez-vous?',
  },
  q_reason: {
    en: 'Why are you moving to Romania?', ro: 'De ce te muți în România?',
    ua: 'Чому ви переїжджаєте до Румунії?', fr: 'Pourquoi déménagez-vous en Roumanie?',
  },
  q_city: {
    en: 'Which Romanian city are you moving to?', ro: 'În ce oraș te muți?',
    ua: 'У яке місто Румунії ви переїжджаєте?', fr: 'Dans quelle ville?',
  },
  q_housing: {
    en: 'Do you already have housing?', ro: 'Ai deja locuință?',
    ua: 'У вас вже є житло?', fr: 'Avez-vous déjà un logement?',
  },
  q_contract: {
    en: 'Do you already have a work contract?', ro: 'Ai deja un contract de muncă?',
    ua: 'У вас вже є трудовий договір?', fr: 'Avez-vous déjà un contrat de travail?',
  },
  q_healthcare: {
    en: 'Do you need healthcare registration?', ro: 'Ai nevoie de înregistrare medicală?',
    ua: 'Чи потрібна вам реєстрація в системі охорони здоров\'я?', fr: 'Avez-vous besoin d\'enregistrement de santé?',
  },
  q_residence: {
    en: 'Do you need help with residence permit documents?', ro: 'Ai nevoie de ajutor cu permisul de ședere?',
    ua: 'Чи потрібна вам допомога з документами на проживання?', fr: 'Avez-vous besoin d\'aide avec le permis de séjour?',
  },
  // Common UI
  yes: { en: 'Yes', ro: 'Da', ua: 'Так', fr: 'Oui' },
  no: { en: 'No', ro: 'Nu', ua: 'Ні', fr: 'Non' },
  eu: { en: 'EU citizen', ro: 'Cetățean UE', ua: 'Громадянин ЄС', fr: 'Citoyen UE' },
  non_eu: { en: 'Non-EU citizen', ro: 'Non-UE', ua: 'Не громадянин ЄС', fr: 'Hors UE' },
  next: { en: 'Next', ro: 'Înainte', ua: 'Далі', fr: 'Suivant' },
  back: { en: 'Back', ro: 'Înapoi', ua: 'Назад', fr: 'Retour' },
  start: { en: 'Start integration', ro: 'Începe integrarea', ua: 'Розпочати інтеграцію', fr: 'Commencer' },
  finish: { en: 'Generate my checklist', ro: 'Generează lista mea', ua: 'Створити мій список', fr: 'Générer ma liste' },
  // Reasons
  work: { en: 'Work', ro: 'Muncă', ua: 'Робота', fr: 'Travail' },
  study: { en: 'Study', ro: 'Studii', ua: 'Навчання', fr: 'Études' },
  family: { en: 'Family', ro: 'Familie', ua: 'Сім\'я', fr: 'Famille' },
  business: { en: 'Business', ro: 'Afaceri', ua: 'Бізнес', fr: 'Affaires' },
  refugee: { en: 'Refugee / protection', ro: 'Refugiat / protecție', ua: 'Біженець', fr: 'Réfugié' },
  long_stay: { en: 'Long stay', ro: 'Ședere lungă', ua: 'Тривале перебування', fr: 'Long séjour' },
  // Checklist
  checklist_title: {
    en: 'Your integration checklist', ro: 'Lista ta de integrare',
    ua: 'Ваш контрольний список', fr: 'Votre liste d\'intégration',
  },
  progress_label: {
    en: 'Integration progress', ro: 'Progres integrare',
    ua: 'Прогрес інтеграції', fr: 'Progrès d\'intégration',
  },
  docs_ready: {
    en: 'Documents ready', ro: 'Documente pregătite',
    ua: 'Документи готові', fr: 'Documents prêts',
  },
  forms_completed: {
    en: 'Forms completed', ro: 'Formulare completate',
    ua: 'Форми заповнені', fr: 'Formulaires remplis',
  },
  institutions_left: {
    en: 'Institutions to visit', ro: 'Instituții de vizitat',
    ua: 'Установи для відвідування', fr: 'Institutions à visiter',
  },
  time_saved: {
    en: 'Estimated time saved', ro: 'Timp estimat economisit',
    ua: 'Заощаджений час', fr: 'Temps économisé',
  },
  // Status
  not_started: { en: 'Not started', ro: 'Neînceput', ua: 'Не розпочато', fr: 'Non commencé' },
  missing_docs: { en: 'Missing documents', ro: 'Documente lipsă', ua: 'Бракує документів', fr: 'Documents manquants' },
  ready: { en: 'Ready to submit', ro: 'Gata de depunere', ua: 'Готово до подання', fr: 'Prêt à soumettre' },
  appointment: { en: 'Appointment needed', ro: 'Programare necesară', ua: 'Потрібен запис', fr: 'RDV nécessaire' },
  completed: { en: 'Completed', ro: 'Finalizat', ua: 'Завершено', fr: 'Terminé' },
  // Card labels
  what_you_need: { en: 'What you need', ro: 'Ce ai nevoie', ua: 'Що потрібно', fr: 'Ce dont vous avez besoin' },
  where_to_go: { en: 'Where to go', ro: 'Unde să mergi', ua: 'Куди йти', fr: 'Où aller' },
  what_next: { en: 'What happens next', ro: 'Ce urmează', ua: 'Що далі', fr: 'Étape suivante' },
  how_long: { en: 'How long it takes', ro: 'Cât durează', ua: 'Скільки часу', fr: 'Durée' },
  cost: { en: 'Cost', ro: 'Cost', ua: 'Вартість', fr: 'Coût' },
  autofill: { en: 'Auto-fill form', ro: 'Completare automată', ua: 'Авто-заповнення', fr: 'Remplissage auto' },
  upload: { en: 'Upload document', ro: 'Încarcă document', ua: 'Завантажити', fr: 'Téléverser' },
  view_map: { en: 'View on map', ro: 'Vezi pe hartă', ua: 'Показати на карті', fr: 'Voir sur la carte' },
  why_it_matters: { en: 'Why it matters', ro: 'De ce contează', ua: 'Чому це важливо', fr: 'Pourquoi c\'est important' },
};

export function tr(key, lang = 'en') {
  return t[key]?.[lang] || t[key]?.en || key;
}