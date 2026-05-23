/**
 * saveImmigrationProfile — upsert the current user's ImmigrationProfile.
 *
 * Auth: requires logged-in user. user_id is taken from auth.me() (NEVER from body),
 * so users cannot write profiles for other accounts.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ALLOWED_FIELDS = [
  'is_eu', 'country', 'purpose', 'city', 'housing',
  'has_contract', 'needs_healthcare_registration', 'language',
  'arrival_date', 'family_size', 'status',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    if (!body.country || !body.purpose) {
      return Response.json(
        { error: 'country and purpose are required' },
        { status: 400 },
      );
    }

    // Whitelist incoming fields
    const clean = {};
    for (const k of ALLOWED_FIELDS) {
      if (body[k] !== undefined) clean[k] = body[k];
    }
    clean.user_id = user.email;

    // Upsert by user_id
    const existing = await base44.entities.ImmigrationProfile.filter(
      { user_id: user.email },
      '-created_date',
      1,
    );

    let profile;
    if (existing?.length > 0) {
      profile = await base44.entities.ImmigrationProfile.update(existing[0].id, clean);
    } else {
      profile = await base44.entities.ImmigrationProfile.create(clean);
    }

    return Response.json({ success: true, profile });
  } catch (err) {
    console.error('[saveImmigrationProfile]', err);
    return Response.json({ error: 'Could not save profile' }, { status: 500 });
  }
});