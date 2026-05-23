/**
 * findNearbyInstitutions — returns Institution records matching a city
 * and optional set of service types.
 *
 * Auth: requires logged-in user (no PII returned, but rate-limit via auth).
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const city = (body.city || '').trim();
    const types = Array.isArray(body.types) ? body.types : [];

    // Single base query, then filter types in memory (Base44 filter doesn't support $in everywhere)
    const query = city ? { city } : {};
    const all = await base44.entities.Institution.filter(query, 'name', 100);

    const filtered = types.length
      ? all.filter((i) => types.includes(i.type))
      : all;

    return Response.json({
      success: true,
      city: city || null,
      types,
      count: filtered.length,
      institutions: filtered,
    });
  } catch (err) {
    console.error('[findNearbyInstitutions]', err);
    return Response.json({ error: 'Could not look up institutions' }, { status: 500 });
  }
});