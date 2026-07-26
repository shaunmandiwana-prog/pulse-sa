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

/** Check if Supabase is configured (not placeholder values) */
function isDBReady() {
    return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
}

/**
 * Get or create an agent record using phone number as identifier.
 * Stores agent_id in localStorage so the agent isn't re-created on every load.
 */
async function getOrCreateAgent(name, phone, address, extras = {}) {
    if (!isDBReady()) return null;
    const db = getDB();

    // Check localStorage for existing agent_id
    let agentId = localStorage.getItem('pulse_agent_id');
    if (agentId) return { id: agentId };

    // Try to find by phone
    const { data: existing } = await db
        .from('agents')
        .select('id')
        .eq('phone', phone)
        .single();

    if (existing) {
        localStorage.setItem('pulse_agent_id', existing.id);
        return existing;
    }

    // Build insert payload
    const payload = {
        name,
        phone,
        address,
        firstname:  extras.firstname  || null,
        surname:    extras.surname    || null,
        age:        extras.age        || null,
        email:      extras.email      || null,
        township:   extras.township   || null
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
            agent_id: created.id,
            points: 2500,
            transaction_type: 'welcome',
            reason: 'Welcome bonus — account created'
        });
        return created;
    }

    console.warn('[Pulse DB] Could not create agent:', error);
    return null;
}

/**
 * Save a completed gig and its points to the database.
 * Falls back silently if offline or DB not configured.
 */
async function saveGigToDatabase({ gigType, pointsEarned, bonusPoints = 0, summary, rawData, traderId = null }) {
    if (!isDBReady() || !navigator.onLine) return null;
    const db = getDB();
    const agentId = localStorage.getItem('pulse_agent_id');
    if (!agentId) return null;

    // Get GPS if available
    let gpsLat = null, gpsLng = null;
    if (navigator.geolocation) {
        await new Promise(resolve => {
            navigator.geolocation.getCurrentPosition(
                pos => { gpsLat = pos.coords.latitude; gpsLng = pos.coords.longitude; resolve(); },
                () => resolve(),
                { timeout: 3000 }
            );
        });
    }

    // Insert gig completion
    const { data: gig, error: gigErr } = await db
        .from('gig_completions')
        .insert({
            agent_id:     agentId,
            gig_type:     gigType,
            points_earned: pointsEarned,
            bonus_points: bonusPoints,
            trader_id:    traderId,
            summary,
            raw_data:     rawData,
            gps_lat:      gpsLat,
            gps_lng:      gpsLng
        })
        .select('id')
        .single();

    if (gigErr) { console.warn('[Pulse DB] Gig save error:', gigErr); return null; }

    // Insert points ledger entry (triggers auto-update of agent balance)
    const totalPts = pointsEarned + bonusPoints;
    await db.from('points_ledger').insert({
        agent_id:          agentId,
        points:            totalPts,
        transaction_type:  'earned',
        reason:            summary,
        gig_completion_id: gig.id
    });

    if (bonusPoints > 0) {
        await db.from('points_ledger').insert({
            agent_id:          agentId,
            points:            bonusPoints,
            transaction_type:  'bonus',
            reason:            'Quality bonus — complete/verified submission',
            gig_completion_id: gig.id
        });
    }

    return gig;
}

/**
 * Save a full trader profile to the traders table.
 * Returns the trader's UUID so it can be linked to the gig_completion.
 */
async function saveTraderProfile(profileData, agentId) {
    if (!isDBReady()) return null;
    const db = getDB();

    const { data, error } = await db
        .from('traders')
        .insert({ ...profileData, agent_id: agentId })
        .select('id')
        .single();

    if (error) { console.warn('[Pulse DB] Trader save error:', error); return null; }
    return data;
}

/**
 * Save a price basket reading.
 */
async function savePriceBasket(basketData) {
    if (!isDBReady()) return null;
    const db = getDB();
    const agentId = localStorage.getItem('pulse_agent_id');
    if (!agentId) return null;

    const { error } = await db
        .from('price_basket_readings')
        .insert({ ...basketData, agent_id: agentId });

    if (error) console.warn('[Pulse DB] Basket save error:', error);
}

/**
 * Save an infrastructure report.
 */
async function saveInfraReport(reportData) {
    if (!isDBReady()) return null;
    const db = getDB();
    const agentId = localStorage.getItem('pulse_agent_id');
    if (!agentId) return null;

    const { error } = await db
        .from('infrastructure_reports')
        .insert({ ...reportData, agent_id: agentId });

    if (error) console.warn('[Pulse DB] Infra save error:', error);
}

/**
 * Queue a submission for retry when offline.
 * Uses localStorage as offline queue.
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
