import { clujInstitutions } from './clujInstitutions';
import workflows from './workflows';
import { retrieveDocuments } from './civicDocuments';

/**
 * Cluj-Focused Chat Engine
 * 
 * Current: Intelligent mock responses with pattern matching
 * Future: Replace callAI() with POST /api/chat → OpenAI GPT-4o or Claude
 * 
 * Architecture ready for:
 * - OpenAI API (OPENAI_API_KEY)
 * - Claude API
 * - Supabase RAG retrieval
 * - OCR document scanning
 * - Appointment booking APIs
 */

export function findBestWorkflow(message) {
  const lower = message.toLowerCase();
  let best = null, bestScore = 0;
  for (const wf of workflows) {
    let score = 0;
    for (const kw of wf.keywords) {
      if (lower.includes(kw.toLowerCase())) score += kw.length + 5;
    }
    if (lower.includes(wf.title.toLowerCase())) score += 15;
    if (score > bestScore) { bestScore = score; best = wf; }
  }
  return bestScore > 0 ? best : null;
}

export function findBestInstitution(institutionId) {
  return clujInstitutions.find(i => i.id === institutionId);
}

function getShortestQueueInstitution() {
  return [...clujInstitutions].sort((a, b) => a.queue.current - b.queue.current)[0];
}

function getOnlineInstitutions() {
  return clujInstitutions.filter(i => i.onlineServices);
}

function detectIntentType(message) {
  const lower = message.toLowerCase();
  if (lower.includes('queue') || lower.includes('wait') || lower.includes('shortest') || lower.includes('fastest') || lower.includes('coadă')) return 'queue-query';
  if (lower.includes('online') || lower.includes('digital') || lower.includes('internet')) return 'online-query';
  if (lower.includes('map') || lower.includes('location') || lower.includes('address') || lower.includes('where') || lower.includes('unde')) return 'location-query';
  if (lower.includes('document') || lower.includes('forget') || lower.includes('usually need') || lower.includes('missing')) return 'document-query';
  if (lower.includes('hello') || lower.includes('hi ') || lower.includes('salut') || lower.includes('buna')) return 'greeting';
  if (lower.includes('hour') || lower.includes('one hour') || lower.includes('busy') || lower.includes('time')) return 'time-query';
  return 'workflow-query';
}

export function buildClujResponse(message, settings, conversationHistory = [], context = {}) {
  const intentType = detectIntentType(message);
  const workflow = findBestWorkflow(message);
  const lang = settings?.language || 'english';
  const isRomanian = lang === 'romanian';
  const mode = settings?.guidanceMode || 'step-by-step';
  const style = settings?.responseStyle || 'balanced';
  const tone = settings?.tone || 'friendly';

  // Greetings
  if (intentType === 'greeting') {
    return {
      reply: isRomanian
        ? `Bună! Sunt **NoQueue AI**, asistentul tău civic pentru Cluj-Napoca. 🏙️\n\nTe pot ajuta cu:\n- Acte de identitate și pașapoarte\n- Permis de conducere și înmatriculări\n- Taxe ANAF și locale\n- Asigurare de sănătate\n- Permise de construire\n- Și multe altele\n\nCu ce te pot ajuta azi?`
        : `Hello! I'm **NoQueue AI**, your civic assistant for Cluj-Napoca. 🏙️\n\nI can help you with:\n- ID cards and passports\n- Driving licenses and vehicle registration\n- ANAF and local taxes\n- Health insurance\n- Building permits\n- And much more\n\nWhat do you need help with today?`,
      type: 'greeting',
      workflowId: null,
      institutionId: null,
      followUpQuestion: null,
      suggestedActions: ['Renew ID card', 'Passport renewal', 'ANAF help', 'Driving license', 'Health insurance'],
    };
  }

  // Queue query
  if (intentType === 'queue-query' && !workflow) {
    const best = getShortestQueueInstitution();
    const sorted = [...clujInstitutions].sort((a, b) => a.queue.current - b.queue.current).slice(0, 5);
    return {
      reply: isRomanian
        ? `Cele mai scurte cozi acum în Cluj-Napoca:\n\n${sorted.map((i, idx) => `${idx + 1}. **${i.name}** — ~${i.queue.current} min`).join('\n')}\n\n🏆 Cea mai bună opțiune acum: **${best.name}** cu ~${best.queue.current} minute de așteptare.\n\n_Datele reprezintă estimări simulate pentru MVP._`
        : `Here are the shortest queues right now in Cluj-Napoca:\n\n${sorted.map((i, idx) => `${idx + 1}. **${i.name}** — ~${i.queue.current} min`).join('\n')}\n\n🏆 Best option right now: **${best.name}** with ~${best.queue.current} minutes estimated wait.\n\n_Data represents simulated estimates for MVP._`,
      type: 'queue-summary',
      workflowId: null,
      institutionId: best.id,
      followUpQuestion: isRomanian ? 'Cu ce tip de problemă te pot ajuta?' : 'What type of procedure do you need help with?',
      suggestedActions: ['View all institutions', 'Find by service'],
    };
  }

  // Online query
  if (intentType === 'online-query' && !workflow) {
    const online = getOnlineInstitutions();
    return {
      reply: isRomanian
        ? `Servicii disponibile **online** în Cluj-Napoca:\n\n${online.map(i => `• **${i.name}** — ${i.services.slice(0, 2).join(', ')}`).join('\n')}\n\n💡 **Recomandare:** Începe întotdeauna online când e posibil. Economisești 30-90 de minute.\n\nCe serviciu specific cauți?`
        : `Services available **online** in Cluj-Napoca:\n\n${online.map(i => `• **${i.name}** — ${i.services.slice(0, 2).join(', ')}`).join('\n')}\n\n💡 **Tip:** Always try online first when available. You'll save 30-90 minutes of waiting.\n\nWhich specific service are you looking for?`,
      type: 'online-list',
      workflowId: null,
      institutionId: null,
      followUpQuestion: null,
      suggestedActions: ['Renew passport online', 'ANAF SPV', 'e-Cazier'],
    };
  }

  // Time/busy query
  if (intentType === 'time-query' && !workflow) {
    return {
      reply: isRomanian
        ? `Dacă ai o oră liberă azi, iată ce poți rezolva rapid:\n\n✅ **Sub 30 minute** (du-te acum):\n1. Direcția Taxe și Impozite Locale — 18 min coadă\n2. IPJ Cluj (cazier) — 20 min coadă\n3. Starea Civilă — 26 min coadă\n\n⏱️ **30-45 minute** (în funcție de orar):\n4. SPCLEP Cluj-Napoca — 24 min\n5. CJAS Cluj — 34 min\n\n**Recomandare:** Evită DRPCIV și ANAF azi — cozile sunt lungi.\n\nCe procedură trebuie să faci?`
        : `If you have one hour today, here's what you can realistically get done:\n\n✅ **Under 30 minutes** (go now):\n1. Local Taxes Office — 18 min queue\n2. IPJ Cluj (criminal record) — 20 min queue\n3. Starea Civilă — 26 min queue\n\n⏱️ **30-45 minutes** (depending on your timing):\n4. SPCLEP Cluj-Napoca — 24 min\n5. CJAS Cluj — 34 min\n\n**Avoid today:** DRPCIV and ANAF have long queues right now.\n\nWhat procedure do you need to complete?`,
      type: 'time-recommendation',
      workflowId: null,
      institutionId: null,
      followUpQuestion: null,
      suggestedActions: ['Local taxes', 'Criminal record', 'Health insurance'],
    };
  }

  // Workflow matched
  if (workflow) {
    const inst = clujInstitutions.find(i => i.id === workflow.institutionId) ||
      clujInstitutions.find(i => i.workflowIds.includes(workflow.id));

    const docList = mode === 'checklist'
      ? workflow.documents.map((d, i) => `- [ ] ${d}`).join('\n')
      : workflow.documents.map((d, i) => `${i + 1}. ${d}`).join('\n');

    const nextStepsList = mode === 'timeline'
      ? workflow.nextSteps.map((s, i) => `**Day ${i === 0 ? 'Before' : i}:** ${s}`).join('\n')
      : workflow.nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n');

    const tonePrefix = {
      professional: '',
      friendly: 'I can definitely help with that! ',
      casual: 'Sure, ',
      government: 'As per administrative procedures, ',
      concierge: "Absolutely — I'll guide you through every step. ",
    }[tone] || '';

    const reply = isRomanian
      ? `${tonePrefix}Am identificat: **${workflow.title}** 📋\n\n${workflow.description}\n\n**Documente necesare:**\n${docList}\n\n🏛️ **Instituție recomandată:**\n${inst ? `**${inst.name}**\n📍 ${inst.address}\n⏱️ Coadă estimată: ~${inst.queue.current} minute\n🕐 Cel mai bun moment: ${workflow.bestTime}` : workflow.institution}\n\n${workflow.online ? '🌐 **Disponibil parțial online** — verifică mai întâi.' : '🚶 **Vizită fizică necesară**'}\n\n⚠️ **Greșeala frecventă:** ${workflow.commonMistake}\n\n**Pași următori:**\n${nextStepsList}\n\n⏳ **Timp de procesare:** ${workflow.processingTime}\n\n---\n_⚖️ Verifică cerințele finale la instituție înainte de a depune documentele._`
      : `${tonePrefix}I found the right procedure: **${workflow.title}** 📋\n\n${workflow.description}\n\n**Required documents:**\n${docList}\n\n🏛️ **Recommended institution:**\n${inst ? `**${inst.name}**\n📍 ${inst.address}\n⏱️ Estimated queue: ~${inst.queue.current} minutes\n🕐 Best visiting time: ${workflow.bestTime}` : workflow.institution}\n\n${workflow.online ? '🌐 **Partially available online** — check this first before visiting.' : '🚶 **In-person visit required**'}\n\n⚠️ **Common mistake:** ${workflow.commonMistake}\n\n**Next steps:**\n${nextStepsList}\n\n⏳ **Processing time:** ${workflow.processingTime}\n\n---\n_⚖️ Please verify final requirements with the official institution before submitting._`;

    // Retrieve civic documents for this workflow
    const retrievedDocs = retrieveDocuments(message, workflow.id);

    return {
      reply,
      type: 'workflow-guidance',
      workflowId: workflow.id,
      institutionId: inst?.id || workflow.institutionId,
      documents: workflow.documents,
      retrievedDocuments: retrievedDocs,
      queueEstimate: inst?.queue.current || workflow.queue,
      warnings: [workflow.commonMistake],
      bestVisitTime: workflow.bestTime,
      followUpQuestion: workflow.urgency === 'critical'
        ? (isRomanian ? 'Este urgent? Pot prioritiza soluția.' : 'Is this urgent? I can prioritize the fastest solution.')
        : (isRomanian ? 'Vrei să îți pregătesc un checklist personalizat?' : 'Would you like me to generate a personalized preparation checklist?'),
      suggestedActions: ['Generate checklist', 'View institution', 'Check queue', 'Find online option'],
    };
  }

  // Fallback
  return {
    reply: isRomanian
      ? `Înțeleg că ai nevoie de ajutor. Poți descrie mai detaliat ce procedură dorești?\n\nExemple:\n• "Vreau să îmi reînnoiesc buletinul"\n• "Am nevoie de pașaport urgent"\n• "Permisul meu a expirat"\n• "Am o problemă cu ANAF"\n\nSunt specializat **exclusiv** în procedurile din **Cluj-Napoca**. 🏙️`
      : `I'd be happy to help! Could you describe what you need a bit more?\n\nTry something like:\n• "I need to renew my ID card"\n• "I need a passport urgently"\n• "My driving license expired"\n• "I have an ANAF tax issue"\n\nI'm specialized **exclusively** in **Cluj-Napoca** procedures. 🏙️`,
    type: 'clarification',
    workflowId: null,
    institutionId: null,
    followUpQuestion: null,
    suggestedActions: ['ID card', 'Passport', 'Driving license', 'ANAF', 'Health insurance'],
  };
}