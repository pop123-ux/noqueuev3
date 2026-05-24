/**
 * secureAiClient — Frontend wrapper for AI calls that routes through the
 * privacy-first backend (functions/secureAiInvoke).
 *
 * Use this INSTEAD of `base44.integrations.Core.InvokeLLM(...)` whenever
 * the prompt may contain user PII (names, CNP, addresses, emails, phones, ID series).
 *
 * Same signature as InvokeLLM — drop-in replacement:
 *
 *   import { secureAiClient } from '@/lib/ai/secureAiClient';
 *   const result = await secureAiClient.invoke({
 *     prompt: 'My name is Ion Popescu, CNP 1900101123456...',
 *     response_json_schema: { type: 'object', properties: { ... } },
 *   });
 *   // result is either a string or the parsed JSON object (matches InvokeLLM)
 *
 * The backend tokenizes PII → AI sees only placeholders → response is
 * locally rehydrated before returning here.
 */

import { base44 } from '@/api/base44Client';

async function invoke({ prompt, response_json_schema, add_context_from_internet, model, file_urls } = {}) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('secureAiClient.invoke: prompt (string) is required');
  }

  const res = await base44.functions.invoke('secureAiInvoke', {
    prompt,
    response_json_schema,
    add_context_from_internet,
    model,
    file_urls,
  });

  const data = res?.data;
  if (!data) throw new Error('secureAiClient: empty response');
  if (data.error) throw new Error(data.error);

  // Match InvokeLLM's return shape: string OR parsed object (when schema was provided)
  return data.response;
}

export const secureAiClient = { invoke };
export default secureAiClient;