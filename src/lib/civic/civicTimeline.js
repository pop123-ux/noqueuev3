/**
 * Civic Timeline helper — writes pseudo-immutable audit entries.
 *
 * IMPORTANT: This is a UI simulation only — not a real distributed ledger.
 * The "hash" is a short SHA-like fingerprint for visual trust, not crypto truth.
 */
import { base44 } from '@/api/base44Client';

/** Quick deterministic 8-char fingerprint (display-only). */
function fingerprint(input) {
  let h = 5381;
  const s = JSON.stringify(input);
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return (h >>> 0).toString(16).padStart(8, '0');
}

/**
 * Record a civic action on the user's timeline.
 * Best-effort; never throws to the caller.
 */
export async function recordCivicEvent({
  userId,
  eventType,
  title,
  description = '',
  iconKey = '',
  source = 'noqueue',
  resourceType = '',
  resourceId = '',
  actor = null,
}) {
  if (!userId || !eventType || !title) return null;
  try {
    // Chain previous hash for "immutable feel"
    let prevHash = '';
    try {
      const last = await base44.entities.CivicTimelineEvent.filter(
        { user_id: userId },
        '-created_date',
        1,
      );
      prevHash = last?.[0]?.action_hash || '';
    } catch {}

    const payload = {
      user_id: userId,
      event_type: eventType,
      title,
      description,
      icon_key: iconKey,
      actor: actor || userId,
      source,
      resource_type: resourceType,
      resource_id: resourceId,
      prev_hash: prevHash,
    };
    const actionHash = fingerprint({ ...payload, t: Date.now() });
    return await base44.entities.CivicTimelineEvent.create({
      ...payload,
      action_hash: actionHash,
    });
  } catch (err) {
    console.warn('[civicTimeline] failed to record', err);
    return null;
  }
}

export { fingerprint };