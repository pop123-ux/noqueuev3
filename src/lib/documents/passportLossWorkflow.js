/**
 * Lost Passport → New Passport Workflow
 * The single polished end-to-end demo for the hackathon.
 * Generates all documents from Identity Vault data.
 */

export const PASSPORT_LOSS_STEPS = [
  { id: 'identity', label: 'Identity Verified', icon: '🔐', description: 'Identity Vault data loaded' },
  { id: 'declaration', label: 'Loss Declaration', icon: '📄', description: 'Auto-generated from profile' },
  { id: 'packet', label: 'Preparation Packet', icon: '📦', description: 'Complete submission bundle' },
  { id: 'checklist', label: 'Document Checklist', icon: '✅', description: 'Readiness verification' },
  { id: 'appointment', label: 'Appointment Ready', icon: '📅', description: 'Nearest office located' },
];

export const PASSPORT_REQUIRED_DOCS = [
  { id: 'id-card',       label: 'Carte de identitate (buletin) valabila', required: true,  fromVault: true,  note: 'Va fi verificata la ghiseu' },
  { id: 'declaration',   label: 'Declaratie pierdere/furt pasaport',      required: true,  fromVault: false, note: 'Generata automat de NoQueue', generated: true },
  { id: 'photo',         label: 'Fotografie tip pasaport (3.5×4.5 cm)',   required: true,  fromVault: false, note: '2 fotografii recente' },
  { id: 'fee-proof',     label: 'Dovada platii taxei de pasaport',        required: true,  fromVault: false, note: 'Taxa standard: 258 RON | Urgenta: 958 RON' },
  { id: 'birth-cert',    label: 'Certificat de nastere (original)',        required: true,  fromVault: false, note: 'Original + copie' },
  { id: 'old-passport',  label: 'Pasaportul vechi (daca il aveti)',       required: false, fromVault: false, note: 'Optional – predat la ghiseu daca exista' },
  { id: 'police-report', label: 'Declaratie politie (daca a fost furat)', required: false, fromVault: false, note: 'Necesara daca pasaportul a fost furat' },
];

export const PASSPORT_INSTITUTION = {
  id: 'pasapoarte-cluj',
  name: 'Serviciul Public Comunitar de Pașapoarte Cluj',
  address: 'Str. Avram Iancu 28, Cluj-Napoca',
  phone: '+40 264 591 626',
  hours: 'Luni–Joi: 08:30–16:30 | Vineri: 08:30–14:00',
  queue: 31,
  bestTime: 'Marti–Joi, 08:30–10:30',
  appointmentUrl: 'https://pasapoarte.mai.gov.ro/',
  mapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Str.+Avram+Iancu+28+Cluj-Napoca',
  lat: 46.7712,
  lng: 23.5899,
};

export const ONLINE_RESOURCES = [
  { label: 'Programare online – pasapoarte.mai.gov.ro', url: 'https://pasapoarte.mai.gov.ro/', icon: '🌐' },
  { label: 'Plata taxei – ghiseul.ro', url: 'https://www.ghiseul.ro/', icon: '💳' },
  { label: 'Verificare status cerere – roevid.ro', url: 'https://www.roevid.ro/', icon: '🔍' },
  { label: 'e-Cazier (cazier judiciar online)', url: 'https://www.ecazier.ro/', icon: '📋' },
];

export function generateLossDeclaration(profile) {
  const today = new Date().toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const name = profile?.full_name || `${profile?.last_name || '___'} ${profile?.first_name || '___'}`;
  const cnp = profile?.cnp || profile?.id_number || '______________';
  const address = profile?.address_line_1
    ? `${profile.address_line_1}, ${profile.city || 'Cluj-Napoca'}, ${profile.county || 'Cluj'}`
    : '___________________________';

  return {
    title: 'Declarație privind pierderea/furtul pașaportului',
    date: today,
    content: `Subsemnatul/a ${name}, posesor/posesoare al/a Cărții de identitate / CNP ${cnp}, cu domiciliul în ${address}, declar pe propria răspundere că pașaportul meu a fost pierdut/furat și nu se mai află în posesia mea.\n\nMă oblig să predau pașaportul la autorități în situația în care acesta va fi găsit ulterior depunerii prezentei declarații.\n\nDeclarat la data de ${today}.\n\nSemnătura: ___________________________`,
    legalNote: 'Declarație generată cu ajutorul platformei NoQueue. Necesită semnătură olografă la depunere.',
    profile: { name, cnp, address, date: today },
  };
}

export function generatePreparationPacket(profile) {
  const decl = generateLossDeclaration(profile);
  const missingFields = [];
  if (!profile?.first_name && !profile?.full_name) missingFields.push('Nume complet');
  if (!profile?.cnp && !profile?.id_number) missingFields.push('CNP');
  if (!profile?.address_line_1) missingFields.push('Adresă');
  if (!profile?.birth_date) missingFields.push('Data nașterii');

  return {
    declaration: decl,
    missingFields,
    completeness: Math.round(((7 - missingFields.length) / 7) * 100),
    institution: PASSPORT_INSTITUTION,
    requiredDocs: PASSPORT_REQUIRED_DOCS,
    onlineResources: ONLINE_RESOURCES,
    generatedAt: new Date().toISOString(),
  };
}