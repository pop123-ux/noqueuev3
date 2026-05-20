import workflows from './workflows';
import institutions from './institutions';

/**
 * Mock chat response generator.
 * Replace mockChatResponse() with POST /api/chat when OpenAI API is integrated.
 * 
 * Future response shape:
 * {
 *   reply: string,
 *   workflowId: string,
 *   institutionId: string,
 *   documents: string[],
 *   queueEstimate: number,
 *   warnings: string[],
 *   bestVisitTime: string
 * }
 * 
 * Environment variable for future use: OPENAI_API_KEY
 */

function findWorkflow(message) {
  const lower = message.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const wf of workflows) {
    let score = 0;
    for (const kw of wf.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        score += kw.length;
      }
    }
    // Also match on title
    if (lower.includes(wf.title.toLowerCase())) {
      score += 10;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = wf;
    }
  }
  return bestMatch;
}

function findInstitution(institutionId) {
  return institutions.find(i => i.id === institutionId);
}

export function mockChatResponse(message) {
  const workflow = findWorkflow(message);

  if (!workflow) {
    return {
      reply: `I understand you need help. Could you tell me more about what bureaucracy task you're dealing with?\n\nFor example, try:\n• "I lost my ID card"\n• "I need to renew my passport"\n• "My driving license expired"\n• "I need a fiscal certificate"\n\nI can help with 15 different procedures in Cluj-Napoca.`,
      workflowId: null,
      institutionId: null,
      documents: [],
      queueEstimate: null,
      warnings: [],
      bestVisitTime: null
    };
  }

  const inst = findInstitution(workflow.institutionId);
  const docList = workflow.documents.map((d, i) => `${i + 1}. ${d}`).join('\n');

  const reply = `I can help with that! This looks like: **${workflow.title}**\n\n${workflow.description}\n\n📋 **What you need:**\n${docList}\n\n🏛️ **Best office:**\n${workflow.institution}\n${inst ? `📍 ${inst.address}` : ''}\n\n⏱️ **Estimated queue:** ${workflow.queue} minutes\n🕐 **Best time to go:** ${workflow.bestTime}\n${workflow.online ? '🌐 **Online option available** — check if you can start online first.' : '🚶 **In-person visit required**'}\n⏳ **Processing time:** ${workflow.processingTime}\n\n⚠️ **Before you go:**\n${workflow.commonMistake}\n\n📌 **Next steps:**\n${workflow.nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n---\n*⚖️ Please verify final requirements with the official institution before submitting.*`;

  return {
    reply,
    workflowId: workflow.id,
    institutionId: workflow.institutionId,
    documents: workflow.documents,
    queueEstimate: workflow.queue,
    warnings: [workflow.commonMistake],
    bestVisitTime: workflow.bestTime
  };
}