/**
 * RAG Answer Builder
 * Combines procedure knowledge + profile matching + AI to generate a structured case plan.
 */
import { secureAiClient } from '@/lib/ai/secureAiClient';
import { findProcedure, CLUJ_PROCEDURES } from './clujProcedureKnowledge';
import { clujInstitutions } from '@/lib/data/clujInstitutions';

function getInstitution(institutionId) {
  return clujInstitutions.find(i => i.id === institutionId);
}

/**
 * Build structured RAG answer for a case.
 * Returns full enriched case plan.
 */
export async function buildRagAnswer(userQuery, profile = null) {
  const procedure = findProcedure(userQuery);
  const inst = procedure ? getInstitution(procedure.queueInstitutionId) : null;

  const procedureContext = procedure
    ? `Procedure: ${procedure.title}
Institution: ${procedure.institution}
Address: ${procedure.address}
Online available: ${procedure.onlineAvailable}
Online URL: ${procedure.onlineUrl || 'N/A'}
Workflow type: ${procedure.workflowType}
Required documents: ${procedure.requiredDocuments.join(', ')}
Fees: ${JSON.stringify(procedure.fees)}
Processing time: ${procedure.processingTime}
Common mistakes: ${procedure.commonMistakes.join('; ')}
Warnings: ${procedure.warnings.join('; ')}`
    : 'No specific Cluj procedure matched. Provide general guidance.';

  const profileContext = profile
    ? `User profile available: name=${profile.full_name || profile.first_name || 'unknown'}, CNP=${profile.cnp ? 'YES' : 'NO'}, address=${profile.address_line_1 ? 'YES' : 'NO'}`
    : 'No profile data available.';

  const prompt = `You are NoQueue AI — a specialized civic assistant for Cluj-Napoca, Romania.
The user has the following civic need: "${userQuery}"

Official procedure data:
${procedureContext}

${profileContext}

Current queue estimate at relevant institution: ${inst ? `~${inst.queue.current} minutes` : 'Unknown'}

Generate a practical, specific action plan. Be concise and actionable.
IMPORTANT: 
- If procedure can be done online, make that the PRIMARY recommendation.
- Mention exact fees, processing times, and common pitfalls.
- Do NOT fabricate document requirements not listed above.
- Mark everything as "AI-generated preparation plan — verify at institution."
- Respond in Romanian if the query is in Romanian, otherwise English.`;

  const schema = {
    type: 'object',
    properties: {
      summary: { type: 'string', description: 'Short 1-2 sentence summary of what the user needs to do' },
      recommended_channel: { type: 'string', description: 'online / appointment / walk-in' },
      immediate_action: { type: 'string', description: 'The very first thing the user should do right now' },
      next_steps: { type: 'array', items: { type: 'string' }, description: 'Ordered list of actionable steps' },
      time_estimate: { type: 'string', description: 'Total estimated time for the whole process' },
      cost_estimate: { type: 'string', description: 'Estimated total cost' },
      online_shortcut: { type: 'string', description: 'If available online, describe exactly how' },
      important_warnings: { type: 'array', items: { type: 'string' } },
    }
  };

  // Privacy: route through secureAiClient — user query + profile name may be present.
  const aiPlan = await secureAiClient.invoke({ prompt, response_json_schema: schema });

  return {
    procedure,
    institution: inst,
    aiPlan,
    officialSources: procedure?.officialSources || [],
    generatedDraftKeys: procedure?.generatedDrafts || [],
    commonMistakes: procedure?.commonMistakes || [],
    requiredDocuments: procedure?.requiredDocuments || [],
    workflowType: procedure?.workflowType || 'walk-in',
    onlineAvailable: procedure?.onlineAvailable || false,
    onlineUrl: procedure?.onlineUrl || null,
  };
}