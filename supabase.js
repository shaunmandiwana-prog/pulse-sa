/**
 * PULSE SA — Supabase Connection Layer
 * ─────────────────────────────────────
 * HOW TO CONFIGURE:
 * 1. Go to https://supabase.com → your project → Settings → API
 * 2. Copy "Project URL"  → paste below as SUPABASE_URL
 * 3. Copy "anon public"  → paste below as SUPABASE_ANON_KEY
 * ─────────────────────────────────────
 */

const SUPABASE_URL      = 'https://oqsclkzjmhlyoaugzwyn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_e84DPG8NGNEQnVCMlkAbDA_mHlsWKd1';

// Initialise Supabase client (loaded via CDN in agent.html)
let _supabase = null;
function getDB() {
    if (!_supabase && window.supabase) {
        _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return _supabase;
}

/** Check if Supabase is configured and client is available */
function isDBReady() {
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL') return false;
    if (SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') return false;
    return !!getDB();
}

/** Returns true if the stored agent_id is a real DB UUID (not a local fallback) */
function hasRealAgentId() {
    const id = localStorage.getItem('pulse_agent_id');
    return id && !id.startsWith('local_');
}

/**
 * Get or create an agent record using phone number as identifier.
 * Stores agent_id in localStorage so the agent isn't re-created on every load.
 * Handles retry if a previous 'local_' fallback ID exists.
 */
async function getOrCreateAgent(name, phone, address, extras = {}) {
    if (!isDBReady()) {
        console.warn('[Pulse DB] DB not ready — saving locally only');
        return null;
    }
    const db = getDB();

    // If we already have a real UUID, return it immediately
    const existingId = localStorage.getItem('pulse_agent_id');
    if (existingId && !existingId.startsWith('local_')) {
        return { id: existingId };
    }

    // Clear any stale local_ fallback so we can retry
    if (existingId && existingId.startsWith('local_')) {
        localStorage.removeItem('pulse_agent_id');
    }

    // Try to find by phone (agent may already exist from another device)
    const { data: existing } = await db
        .from('agents')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();

    if (existing) {
        localStorage.setItem('pulse_agent_id', existing.id);
        return existing;
    }

    // Build insert payload
    const payload = {
        name,
        phone,
        address:   address   || null,
        firstname: extras.firstname || null,
        surname:   extras.surname   || null,
        age:       extras.age       || null,
        email:     extras.email     || null,
        pin:       extras.pin       || null,
        township:  extras.township  || null
    };

    // Create new agent
    const { data: created, error } = await db
        .from('agents')
        .insert(payload)
        .select('id')
        .single();

    if (created) {
        localStorage.setItem('pulse_agent_id', created.id);
        // Log welcome points
        await db.from('points_ledger').insert({
            agent_id:         created.id,
            points:           2500,
            transaction_type: 'welcome',
            reason:           'Welcome bonus — account created'
        }).catch(() => {});
        return created;
    }

    console.warn('[Pulse DB] Could not create agent:', error?.message);
    return null;
}

/**
 * Try to sync a locally-saved profile to the database.
 * Called when the profile screen opens — helps users whose
 * onboarding ran offline or while RLS was blocking.
 */
async function syncAgentToDatabase() {
    if (!isDBReady() || !navigator.onLine) return;
    if (hasRealAgentId()) return; // Already in DB

    const name      = localStorage.getItem('pulse_agent_name');
    const phone     = localStorage.getItem('pulse_agent_phone') || '';
    const address   = localStorage.getItem('pulse_agent_address') || '';
    const firstname = localStorage.getItem('pulse_agent_firstname') || '';
    const email     = localStorage.getItem('pulse_agent_email') || '';

    if (!name) return;

    const agent = await getOrCreateAgent(name, phone, address, { firstname, email });
    if (agent) console.log('[Pulse DB] Agent synced to DB:', agent.id);
}

/**
 * Save a completed gig and its points to the database.
 * Always saves to localStorage first for offline history.
 * Skips DB insert if no real agent_id is available.
 */
async function saveGigToDatabase({ gigType, pointsEarned, bonusPoints = 0, summary, rawData, traderId = null }) {
    // Local submission history is now handled by addLocalSubmission() in agent.html
    console.log('[Pulse DB] saveGigToDatabase called:', { gigType, pointsEarned });

    if (!isDBReady()) { console.warn('[Pulse DB] DB not ready'); return null; }
    if (!navigator.onLine) { console.warn('[Pulse DB] Offline'); return null; }

    const agentId = localStorage.getItem('pulse_agent_id');
    if (!agentId) { console.warn('[Pulse DB] No agent_id'); return null; }

    // Skip DB save if agent_id is a local fallback (not a valid UUID)
    if (agentId.startsWith('local_')) {
        console.warn('[Pulse DB] Agent not in DB yet — submission saved locally only');
        syncAgentToDatabase().catch(() => {});
        return null;
    }

    const db = getDB();
    console.log('[Pulse DB] Inserting gig for agent:', agentId);

    // Build payload with only core fields to avoid column mismatch errors
    const gigPayload = {
        agent_id:      agentId,
        gig_type:      gigType,
        points_earned: pointsEarned,
        bonus_points:  bonusPoints,
        summary:       summary
    };

    // Try to add optional fields — these may or may not exist as columns
    // raw_data: jsonb column for storing the captured form data
    if (rawData) gigPayload.raw_data = rawData;

    // Insert gig completion
    const { data: gig, error: gigErr } = await db
        .from('gig_completions')
        .insert(gigPayload)
        .select('id')
        .single();

    if (gigErr) {
        console.error('[Pulse DB] Gig save FAILED:', gigErr.message, gigErr.details, gigErr.hint);
        // If the error is about extra columns, try again with minimal fields
        if (gigErr.message && (gigErr.message.includes('column') || gigErr.message.includes('raw_data'))) {
            console.log('[Pulse DB] Retrying with minimal fields...');
            const { data: gig2, error: gigErr2 } = await db
                .from('gig_completions')
                .insert({
                    agent_id:      agentId,
                    gig_type:      gigType,
                    points_earned: pointsEarned,
                    bonus_points:  bonusPoints,
                    summary:       summary
                })
                .select('id')
                .single();
            if (gigErr2) {
                console.error('[Pulse DB] Retry also FAILED:', gigErr2.message);
                return null;
            }
            console.log('[Pulse DB] Retry succeeded, gig id:', gig2.id);
            return gig2;
        }
        return null;
    }

    console.log('[Pulse DB] Gig saved, id:', gig.id);

    // Insert points ledger entry
    const totalPts = pointsEarned + bonusPoints;
    const { error: ledgerErr } = await db.from('points_ledger').insert({
        agent_id:          agentId,
        points:            totalPts,
        transaction_type:  'earned',
        reason:            summary,
        gig_completion_id: gig.id
    });
    if (ledgerErr) console.warn('[Pulse DB] Ledger save error:', ledgerErr.message);

    // Update agent's running balance in the agents table
    try {
        const { data: agentRow } = await db
            .from('agents')
            .select('points_balance, total_earned')
            .eq('id', agentId)
            .single();
        if (agentRow) {
            await db.from('agents').update({
                points_balance: (agentRow.points_balance || 0) + totalPts,
                total_earned:   (agentRow.total_earned   || 0) + totalPts,
                last_active:    new Date().toISOString()
            }).eq('id', agentId);
        }
    } catch(e) { /* non-critical */ }

    return gig;
}

/**
 * Save a submission to localStorage for immediate local history.
 */
function saveSubmissionLocally({ gigType, pointsEarned, summary, rawData }) {
    const GIG_LABELS = {
        trader_profile:  { label: 'Trader Profile Visit', icon: '🏪' },
        shelf_audit:     { label: 'Spaza Shelf Audit',    icon: '🛒' },
        price_basket:    { label: 'Price Basket Monitor', icon: '🧺' },
        foot_traffic:    { label: 'Foot-Traffic Verify',  icon: '🚶' },
        infrastructure:  { label: 'Infrastructure Report',icon: '💧' }
    };
    const meta = GIG_LABELS[gigType] || { label: gigType, icon: '📋' };
    const subs = JSON.parse(localStorage.getItem('pulse_submissions') || '[]');
    subs.unshift({
        id:      Date.now(),
        type:    gigType,
        label:   meta.label,
        icon:    meta.icon,
        points:  pointsEarned,
        summary: summary,
        data:    rawData,
        date:    new Date().toISOString()
    });
    if (subs.length > 100) subs.splice(100); // Keep last 100
    localStorage.setItem('pulse_submissions', JSON.stringify(subs));
}

/**
 * Fetch this agent's submissions from the database.
 * Returns an array or null if offline/unavailable.
 */
async function fetchMySubmissions() {
    if (!isDBReady() || !navigator.onLine || !hasRealAgentId()) return null;
    const db = getDB();
    const agentId = localStorage.getItem('pulse_agent_id');

    const { data, error } = await db
        .from('gig_completions')
        .select('id, gig_type, points_earned, summary, submitted_at')
        .eq('agent_id', agentId)
        .order('submitted_at', { ascending: false })
        .limit(50);

    if (error) { console.warn('[Pulse DB] Fetch submissions error:', error.message); return null; }
    return data;
}

/**
 * Update agent profile fields in the database.
 */
async function updateAgentProfile(updates) {
    if (!isDBReady() || !hasRealAgentId()) return false;
    const db = getDB();
    const agentId = localStorage.getItem('pulse_agent_id');

    const { error } = await db
        .from('agents')
        .update({ ...updates, last_active: new Date().toISOString() })
        .eq('id', agentId);

    if (error) { console.warn('[Pulse DB] Profile update error:', error.message); return false; }
    return true;
}

/**
 * Save a full trader profile to the traders table.
 */
async function saveTraderProfile(profileData, agentId) {
    if (!isDBReady() || !agentId || agentId.startsWith('local_')) return null;
    const db = getDB();

    const { data, error } = await db
        .from('traders')
        .insert({ ...profileData, agent_id: agentId })
        .select('id')
        .single();

    if (error) { console.warn('[Pulse DB] Trader save error:', error.message); return null; }
    return data;
}

/**
 * Save a price basket reading.
 */
async function savePriceBasket(basketData) {
    console.log('[Pulse DB] savePriceBasket called:', basketData);
    if (!isDBReady() || !hasRealAgentId()) { console.warn('[Pulse DB] Price basket: DB not ready or no agent'); return; }
    const db = getDB();
    const agentId = localStorage.getItem('pulse_agent_id');

    const payload = {
        agent_id:           agentId,
        trader_name:        basketData.trader_name    || null,
        township:           basketData.township       || null,
        bread_price:        basketData.bread_price    || null,
        maize_price:        basketData.maize_price    || null,
        oil_price:          basketData.oil_price      || null,
        milk_price:         basketData.milk_price     || null,
        eggs_price:         basketData.eggs_price     || null,
        sugar_price:        basketData.sugar_price    || null,
        airtime_price:      basketData.airtime_price  || null,
        sunflower_oil_price: basketData.sunflower_oil_price || null
    };
    console.log('[Pulse DB] Price basket payload:', payload);

    const { error } = await db
        .from('price_basket_readings')
        .insert(payload);

    if (error) console.error('[Pulse DB] Basket save FAILED:', error.message, error.details, error.hint);
    else console.log('[Pulse DB] Price basket saved successfully!');
}

/**
 * Save an infrastructure report.
 */
async function saveInfraReport(reportData) {
    console.log('[Pulse DB] saveInfraReport called:', reportData);
    if (!isDBReady() || !hasRealAgentId()) { console.warn('[Pulse DB] Infra report: DB not ready or no agent'); return; }
    const db = getDB();
    const agentId = localStorage.getItem('pulse_agent_id');

    const payload = {
        agent_id:    agentId,
        issue_type:  reportData.issue_type  || null,
        location:    reportData.location    || null,
        township:    reportData.township    || reportData.location || null,
        severity:    reportData.severity    || null,
        description: reportData.description || null
    };
    console.log('[Pulse DB] Infra report payload:', payload);

    const { error } = await db
        .from('infrastructure_reports')
        .insert(payload);

    if (error) console.error('[Pulse DB] Infra save FAILED:', error.message, error.details, error.hint);
    else console.log('[Pulse DB] Infra report saved successfully!');
}

/**
 * Queue a submission for retry when offline.
 */
function queueOffline(payload) {
    const queue = JSON.parse(localStorage.getItem('pulse_offline_queue') || '[]');
    queue.push({ ...payload, queuedAt: new Date().toISOString() });
    localStorage.setItem('pulse_offline_queue', JSON.stringify(queue));
}

/**
 * Flush the offline queue when connectivity is restored.
 */
async function flushOfflineQueue() {
    if (!navigator.onLine || !isDBReady()) return;
    const queue = JSON.parse(localStorage.getItem('pulse_offline_queue') || '[]');
    if (!queue.length) return;

    console.log(`[Pulse DB] Flushing ${queue.length} offline submissions...`);
    for (const item of queue) {
        await saveGigToDatabase(item);
    }
    localStorage.removeItem('pulse_offline_queue');
    console.log('[Pulse DB] Offline queue flushed.');
}

// Auto-flush when coming back online
window.addEventListener('online', flushOfflineQueue);
