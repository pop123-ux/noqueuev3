/**
 * generateIntegrationChecklist — produces a personalized relocation task list
 * for the current user based on their ImmigrationProfile.
 *
 * Pure rules engine (no LLM call) — deterministic, fast, demo-stable.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function buildTasks(profile) {
  const isEU = !!profile.is_eu;
  const tasks = [];
  let order = 1;

  const push = (t) => tasks.push({ order: order++, completed: false, ...t });

  // ── Step 1: Residency ──────────────────────────────────────────
  if (isEU) {
    push({
      key: 'eu_registration_certificate',
      title: 'Register as EU citizen with IGI',
      description: 'Apply for an EU registration certificate at the Immigration Office (IGI) within 90 days of arrival.',
      category: 'immigration',
      institution_slug: 'igi-cluj',
      estimated_days: 14,
      priority: 1,
      required_documents: ['Passport / ID card', 'Proof of address', 'Proof of purpose (work/study/family)'],
    });
  } else {
    push({
      key: 'long_stay_visa',
      title: 'Obtain long-stay visa (D-type) from Romanian consulate',
      description: 'Apply at the Romanian consulate in your country before traveling.',
      category: 'immigration',
      estimated_days: 60,
      priority: 1,
      required_documents: ['Passport', 'Purpose proof', 'Accommodation proof', 'Health insurance'],
    });
    push({
      key: 'temporary_residence_permit',
      title: 'Apply for temporary residence permit',
      description: 'Within 30 days of arrival, submit your residence permit application at IGI Cluj.',
      category: 'immigration',
      institution_slug: 'igi-cluj',
      estimated_days: 30,
      priority: 1,
      required_documents: ['Visa', 'Passport', 'Proof of address', 'Purpose documents', 'Application fee receipt'],
    });
  }

  // ── Step 2: Address ────────────────────────────────────────────
  if (profile.housing && profile.housing !== 'not_yet') {
    push({
      key: 'address_registration',
      title: 'Register your address (mențiune de domiciliu)',
      description: 'Register your Romanian address at the local Direcția de Evidență a Persoanelor.',
      category: 'civic',
      institution_slug: 'evidenta-cluj',
      estimated_days: 7,
      priority: 2,
      required_documents: ['ID/Passport', 'Rental contract or property deed', 'Owner consent if rented'],
    });
  } else {
    push({
      key: 'find_housing',
      title: 'Secure long-term housing',
      description: 'Many bureaucratic steps require a registered address. Lock down housing first.',
      category: 'housing',
      estimated_days: 14,
      priority: 2,
    });
  }

  // ── Step 3: Work / Study ───────────────────────────────────────
  if (profile.purpose === 'work' && !profile.has_contract) {
    push({
      key: 'work_authorization',
      title: 'Obtain work authorization (for non-EU)',
      description: isEU
        ? 'EU citizens can work freely — just notify the employer.'
        : 'Your employer must obtain a work authorization (autorizație de muncă) from IGI before you sign a contract.',
      category: 'labor',
      estimated_days: 45,
      priority: 2,
    });
  }
  if (profile.purpose === 'study') {
    push({
      key: 'enrollment_proof',
      title: 'Submit enrollment certificate',
      description: 'Bring your enrollment certificate from your Romanian university to IGI.',
      category: 'education',
      estimated_days: 5,
      priority: 2,
    });
  }

  // ── Step 4: Healthcare ─────────────────────────────────────────
  if (profile.needs_healthcare_registration !== false) {
    push({
      key: 'health_insurance_registration',
      title: 'Register for Romanian health insurance (CNAS)',
      description: 'Register at CAS Cluj. Employed users are registered by their employer.',
      category: 'health',
      institution_slug: 'cas-cluj',
      estimated_days: 7,
      priority: 3,
      required_documents: ['ID / Residence permit', 'Employment contract OR voluntary insurance form'],
    });
    push({
      key: 'family_doctor',
      title: 'Register with a family doctor',
      description: 'Choose a Romanian medic de familie close to your address.',
      category: 'health',
      estimated_days: 3,
      priority: 4,
    });
  }

  // ── Step 5: Tax & banking ──────────────────────────────────────
  push({
    key: 'fiscal_registration',
    title: 'Register with ANAF (fiscal record)',
    description: 'Required for salary, freelancing, property or any taxable activity.',
    category: 'tax',
    institution_slug: 'anaf-cluj',
    estimated_days: 5,
    priority: 4,
  });
  push({
    key: 'bank_account',
    title: 'Open a Romanian bank account',
    description: 'Needed for salary deposits, utilities, and most contracts.',
    category: 'banking',
    estimated_days: 2,
    priority: 5,
  });

  // ── Step 6: Family ─────────────────────────────────────────────
  if ((profile.family_size || 1) > 1) {
    push({
      key: 'family_reunification',
      title: 'Initiate family-member residency',
      description: `You declared ${profile.family_size} people. Each family member needs their own permit / registration.`,
      category: 'immigration',
      estimated_days: 30,
      priority: 3,
    });
  }

  // ── Step 7: Language ───────────────────────────────────────────
  if (profile.language && profile.language !== 'RO') {
    push({
      key: 'romanian_basics',
      title: 'Learn essential Romanian phrases',
      description: 'Most administrative interactions are conducted in Romanian. A basics course helps a lot.',
      category: 'education',
      estimated_days: 30,
      priority: 6,
    });
  }

  return tasks;
}

/** Integration score: 0-100 based on completeness signals from profile only. */
function computeBaselineScore(profile) {
  let score = 0;
  if (profile.country) score += 10;
  if (profile.purpose) score += 10;
  if (profile.city) score += 10;
  if (profile.housing && profile.housing !== 'not_yet') score += 15;
  if (profile.has_contract) score += 15;
  if (profile.arrival_date) score += 10;
  if (profile.language) score += 5;
  return Math.min(100, score);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profiles = await base44.entities.ImmigrationProfile.filter(
      { user_id: user.email },
      '-created_date',
      1,
    );
    if (!profiles?.length) {
      return Response.json(
        { error: 'No ImmigrationProfile found. Call saveImmigrationProfile first.' },
        { status: 404 },
      );
    }

    const profile = profiles[0];
    const tasks = buildTasks(profile);
    const baselineScore = computeBaselineScore(profile);

    return Response.json({
      success: true,
      profile_id: profile.id,
      baseline_integration_score: baselineScore,
      total_tasks: tasks.length,
      estimated_total_days: tasks.reduce((s, t) => s + (t.estimated_days || 0), 0),
      tasks,
    });
  } catch (err) {
    console.error('[generateIntegrationChecklist]', err);
    return Response.json({ error: 'Could not generate checklist' }, { status: 500 });
  }
});