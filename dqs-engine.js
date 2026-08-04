/**
 * PULSE SA — Data Quality Score (DQS) Engine + Audit Controls
 * ════════════════════════════════════════════════════════════
 * Calculates a Data Quality Score (0-100) for every submission.
 * Implements ISA 500-aligned audit controls: Relevance & Reliability.
 *
 * DQS Components:
 *   40% — Mandatory field completeness
 *   20% — Optional field completeness
 *   15% — GPS verification
 *   15% — Price/value plausibility
 *   10% — Internal consistency
 *
 * Bonus Tiers:
 *   95%+ → Gold   (30% bonus)
 *   90%+ → Silver (20% bonus)
 *   80%+ → Bronze (10% bonus)
 *   <80% → None   (0% bonus)
 */

// ── Sector Configuration ──
const SECTOR_CONFIG = {
    kota_profile: {
        label: 'Kota / Fast-Food',
        mandatoryFields: ['business_name', 'township', 'price_basic', 'good_day_revenue', 'bad_day_revenue'],
        optionalFields: ['operator_name', 'years_trading', 'location_type', 'price_full', 'top_items', 'daily_units',
                         'bread_supplier', 'protein_source', 'chips_supplier', 'polony_brand', 'busy_hours',
                         'electricity', 'refrigeration', 'water_access', 'challenge', 'food_waste_pct', 'supplier_rating'],
        revenueFields: ['good_day_revenue', 'bad_day_revenue'],
        priceFields: ['price_basic', 'price_full'],
        priceRanges: {
            price_basic: { min: 10, max: 120, label: 'Basic kota price' },
            price_full:  { min: 25, max: 250, label: 'Full house kota price' }
        },
        revenueRange: { min: 50, max: 50000, label: 'Daily revenue' },
        consistencyChecks: [
            { rule: 'good_day >= bad_day', fields: ['good_day_revenue', 'bad_day_revenue'], msg: 'Good day revenue should be >= bad day revenue' },
            { rule: 'basic <= full', fields: ['price_basic', 'price_full'], msg: 'Basic kota price should be <= full house price' }
        ]
    },
    tavern_profile: {
        label: 'Tavern / Shebeen',
        mandatoryFields: ['tavern_name', 'township', 'license_status', 'good_day_revenue', 'bad_day_revenue'],
        optionalFields: ['operator_name', 'years_operating', 'capacity', 'premises_type', 'beer_brands', 'spirits',
                         'mixers', 'quart_price', 'can_price', 'supplier_type', 'delivery_frequency', 'peak_days',
                         'payment_methods', 'fridge_count', 'electricity', 'security', 'entertainment', 'food_sold'],
        revenueFields: ['good_day_revenue', 'bad_day_revenue'],
        priceFields: ['quart_price', 'can_price'],
        priceRanges: {
            quart_price: { min: 15, max: 80, label: 'Quart price' },
            can_price:   { min: 10, max: 50, label: 'Can/dumpy price' }
        },
        revenueRange: { min: 100, max: 100000, label: 'Daily revenue' },
        consistencyChecks: [
            { rule: 'good_day >= bad_day', fields: ['good_day_revenue', 'bad_day_revenue'], msg: 'Good day revenue should be >= bad day revenue' }
        ]
    },
    trader_profile: {
        label: 'Trader Profile',
        mandatoryFields: ['name', 'type', 'township'],
        optionalFields: ['bank_account', 'years_operating', 'premises_type', 'employees', 'payment_methods',
                         'top_products', 'fastest_seller', 'turnover_good_day', 'turnover_bad_day',
                         'insurance_status', 'biggest_challenge'],
        revenueFields: [],
        priceFields: [],
        priceRanges: {},
        revenueRange: null,
        consistencyChecks: []
    },
    price_basket: {
        label: 'Price Basket',
        mandatoryFields: ['trader_name', 'township'],
        optionalFields: ['bread_price', 'maize_price', 'oil_price', 'milk_price', 'eggs_price',
                         'sugar_price', 'airtime_price', 'sunflower_oil_price'],
        revenueFields: [],
        priceFields: ['bread_price', 'maize_price', 'oil_price', 'milk_price', 'eggs_price', 'sugar_price', 'airtime_price', 'sunflower_oil_price'],
        priceRanges: {
            bread_price:         { min: 8, max: 30, label: 'Bread (700g)' },
            maize_price:         { min: 15, max: 80, label: 'Maize meal (2.5kg)' },
            oil_price:           { min: 15, max: 60, label: 'Cooking oil (750ml)' },
            milk_price:          { min: 12, max: 35, label: 'Milk (1L)' },
            eggs_price:          { min: 15, max: 50, label: 'Eggs (6-pack)' },
            sugar_price:         { min: 10, max: 35, label: 'Sugar (1kg)' },
            airtime_price:       { min: 10, max: 12, label: 'Airtime (R10)' },
            sunflower_oil_price: { min: 40, max: 120, label: 'Sunflower oil (2L)' }
        },
        revenueRange: null,
        consistencyChecks: []
    },
    shelf_audit: {
        label: 'Shelf Audit',
        mandatoryFields: ['trader_name', 'location'],
        optionalFields: ['oil_brand', 'oil_price'],
        revenueFields: [],
        priceFields: ['oil_price'],
        priceRanges: { oil_price: { min: 30, max: 200, label: 'Sunflower Oil (2L)' } },
        revenueRange: null,
        consistencyChecks: []
    },
    infrastructure: {
        label: 'Infrastructure',
        mandatoryFields: ['issue_type', 'location'],
        optionalFields: ['township', 'severity', 'description', 'duration', 'scale', 'notes'],
        revenueFields: [],
        priceFields: [],
        priceRanges: {},
        revenueRange: null,
        consistencyChecks: []
    },
    foot_traffic: {
        label: 'Foot Traffic',
        mandatoryFields: ['trader_name', 'status'],
        optionalFields: [],
        revenueFields: [],
        priceFields: [],
        priceRanges: {},
        revenueRange: null,
        consistencyChecks: []
    }
};

/**
 * Calculate the Data Quality Score for a submission.
 * @param {string} gigType - e.g. 'kota_profile', 'tavern_profile'
 * @param {object} rawData - the submitted data
 * @param {object} options - { hasGPS: boolean }
 * @returns {{ score: number, tier: string, tierEmoji: string, bonus: number, breakdown: object, flags: string[] }}
 */
function calculateDQS(gigType, rawData, options = {}) {
    const config = SECTOR_CONFIG[gigType];
    if (!config) {
        return { score: 50, tier: 'None', tierEmoji: '', bonus: 0, breakdown: {}, flags: ['Unknown gig type — default score applied'] };
    }

    const flags = [];
    let mandatoryScore = 0;
    let optionalScore = 0;
    let gpsScore = 0;
    let priceScore = 0;
    let consistencyScore = 0;

    // ── 1. Mandatory field completeness (40%) ──
    const mandatoryTotal = config.mandatoryFields.length;
    if (mandatoryTotal > 0) {
        const filled = config.mandatoryFields.filter(f => {
            const val = rawData[f];
            return val !== null && val !== undefined && val !== '';
        }).length;
        mandatoryScore = (filled / mandatoryTotal) * 100;
        if (filled < mandatoryTotal) {
            flags.push(`Missing ${mandatoryTotal - filled} mandatory field(s)`);
        }
    } else {
        mandatoryScore = 100;
    }

    // ── 2. Optional field completeness (20%) ──
    const optionalTotal = config.optionalFields.length;
    if (optionalTotal > 0) {
        const filled = config.optionalFields.filter(f => {
            const val = rawData[f];
            return val !== null && val !== undefined && val !== '';
        }).length;
        optionalScore = (filled / optionalTotal) * 100;
    } else {
        optionalScore = 100;
    }

    // ── 3. GPS verification (15%) ──
    if (options.hasGPS) {
        gpsScore = 100;
    } else {
        gpsScore = 0;
        flags.push('No GPS verification — agent location not confirmed');
    }

    // ── 4. Price/value plausibility (15%) ──
    const priceChecks = Object.keys(config.priceRanges);
    if (priceChecks.length > 0) {
        let plausibleCount = 0;
        let checkedCount = 0;
        for (const field of priceChecks) {
            const val = parseFloat(rawData[field]);
            if (isNaN(val) || !rawData[field]) continue; // Skip empty
            checkedCount++;
            const range = config.priceRanges[field];
            if (val >= range.min && val <= range.max) {
                plausibleCount++;
            } else {
                flags.push(`${range.label}: R${val} outside expected range (R${range.min}–R${range.max})`);
            }
        }
        // Also check revenue ranges
        if (config.revenueRange) {
            for (const field of config.revenueFields) {
                const val = parseFloat(rawData[field]);
                if (isNaN(val) || !rawData[field]) continue;
                checkedCount++;
                if (val >= config.revenueRange.min && val <= config.revenueRange.max) {
                    plausibleCount++;
                } else {
                    flags.push(`${config.revenueRange.label}: R${val} outside expected range`);
                }
            }
        }
        priceScore = checkedCount > 0 ? (plausibleCount / checkedCount) * 100 : 100;
    } else if (config.revenueRange) {
        let plausibleCount = 0;
        let checkedCount = 0;
        for (const field of config.revenueFields) {
            const val = parseFloat(rawData[field]);
            if (isNaN(val) || !rawData[field]) continue;
            checkedCount++;
            if (val >= config.revenueRange.min && val <= config.revenueRange.max) {
                plausibleCount++;
            } else {
                flags.push(`${config.revenueRange.label}: R${val} outside expected range`);
            }
        }
        priceScore = checkedCount > 0 ? (plausibleCount / checkedCount) * 100 : 100;
    } else {
        priceScore = 100;
    }

    // ── 5. Internal consistency (10%) ──
    if (config.consistencyChecks.length > 0) {
        let passed = 0;
        for (const check of config.consistencyChecks) {
            const [f1, f2] = check.fields;
            const v1 = parseFloat(rawData[f1]);
            const v2 = parseFloat(rawData[f2]);
            if (isNaN(v1) || isNaN(v2)) { passed++; continue; } // Can't check if empty
            if (check.rule === 'good_day >= bad_day' && v1 >= v2) { passed++; }
            else if (check.rule === 'basic <= full' && v1 <= v2) { passed++; }
            else {
                flags.push(check.msg);
            }
        }
        consistencyScore = (passed / config.consistencyChecks.length) * 100;
    } else {
        consistencyScore = 100;
    }

    // ── Calculate weighted total ──
    const weightedScore = Math.round(
        (mandatoryScore * 0.40) +
        (optionalScore  * 0.20) +
        (gpsScore       * 0.15) +
        (priceScore     * 0.15) +
        (consistencyScore * 0.10)
    );

    const score = Math.min(100, Math.max(0, weightedScore));

    // ── Determine tier and bonus ──
    let tier, tierEmoji, bonusPct;
    if (score >= 95) {
        tier = 'Gold'; tierEmoji = '🥇'; bonusPct = 0.30;
    } else if (score >= 90) {
        tier = 'Silver'; tierEmoji = '🥈'; bonusPct = 0.20;
    } else if (score >= 80) {
        tier = 'Bronze'; tierEmoji = '🥉'; bonusPct = 0.10;
    } else {
        tier = 'Standard'; tierEmoji = ''; bonusPct = 0;
    }

    return {
        score,
        tier,
        tierEmoji,
        bonusPct,
        breakdown: {
            mandatory: Math.round(mandatoryScore),
            optional: Math.round(optionalScore),
            gps: Math.round(gpsScore),
            plausibility: Math.round(priceScore),
            consistency: Math.round(consistencyScore)
        },
        flags
    };
}

// ── Audit Controls ──

/**
 * Check if a submission should be HARD BLOCKED.
 * Returns { blocked: boolean, reason: string }
 */
function checkHardBlocks(gigType, rawData, options = {}) {
    // HARD BLOCK 1: GPS mismatch (if we have GPS + reported location)
    if (options.gpsCoords && rawData.township) {
        const townshipGPS = {
            // Gauteng: City of Johannesburg
            'Soweto':          { lat: -26.27, lng: 27.85, radius: 0.15 },
            'Alexandra':       { lat: -26.10, lng: 28.10, radius: 0.08 },
            'Diepsloot':       { lat: -25.93, lng: 28.02, radius: 0.08 },
            'Orange Farm':     { lat: -26.48, lng: 27.86, radius: 0.10 },
            'Ivory Park':      { lat: -25.98, lng: 28.18, radius: 0.08 },
            'Cosmo City':      { lat: -26.01, lng: 27.93, radius: 0.06 },
            'Lenasia':         { lat: -26.33, lng: 27.83, radius: 0.08 },
            'Eldorado Park':   { lat: -26.29, lng: 27.90, radius: 0.06 },
            'Meadowlands':     { lat: -26.22, lng: 27.89, radius: 0.06 },
            'Diepkloof':       { lat: -26.24, lng: 27.93, radius: 0.06 },
            'Orlando':         { lat: -26.24, lng: 27.90, radius: 0.06 },
            'Dobsonville':     { lat: -26.22, lng: 27.86, radius: 0.06 },
            'Protea Glen':     { lat: -26.30, lng: 27.81, radius: 0.06 },
            'Zola':            { lat: -26.24, lng: 27.84, radius: 0.05 },
            // Gauteng: Ekurhuleni
            'Tembisa':         { lat: -25.99, lng: 28.23, radius: 0.10 },
            'Katlehong':       { lat: -26.33, lng: 28.15, radius: 0.10 },
            'Vosloorus':       { lat: -26.35, lng: 28.20, radius: 0.08 },
            'Thokoza':         { lat: -26.36, lng: 28.14, radius: 0.06 },
            'Etwatwa':         { lat: -26.18, lng: 28.42, radius: 0.08 },
            'Daveyton':        { lat: -26.15, lng: 28.42, radius: 0.08 },
            'KwaThema':        { lat: -26.28, lng: 28.39, radius: 0.08 },
            'Tsakane':         { lat: -26.35, lng: 28.38, radius: 0.08 },
            // Gauteng: Tshwane
            'Mamelodi':        { lat: -25.72, lng: 28.40, radius: 0.10 },
            'Soshanguve':      { lat: -25.53, lng: 28.09, radius: 0.12 },
            'Atteridgeville':  { lat: -25.78, lng: 28.08, radius: 0.08 },
            'Hammanskraal':    { lat: -25.40, lng: 28.28, radius: 0.10 },
            'Ga-Rankuwa':      { lat: -25.61, lng: 28.07, radius: 0.08 },
            'Mabopane':        { lat: -25.50, lng: 28.10, radius: 0.08 },
            'Winterveld':      { lat: -25.47, lng: 28.05, radius: 0.10 },
            // Gauteng: Sedibeng / West Rand
            'Sebokeng':        { lat: -26.57, lng: 27.84, radius: 0.10 },
            'Evaton':          { lat: -26.53, lng: 27.85, radius: 0.08 },
            'Sharpeville':     { lat: -26.68, lng: 27.87, radius: 0.06 },
            'Kagiso':          { lat: -26.16, lng: 27.78, radius: 0.06 },
            // Western Cape: City of Cape Town
            'Khayelitsha':     { lat: -34.04, lng: 18.68, radius: 0.12 },
            'Mitchells Plain': { lat: -34.05, lng: 18.62, radius: 0.10 },
            'Gugulethu':       { lat: -33.98, lng: 18.57, radius: 0.06 },
            'Nyanga':          { lat: -33.99, lng: 18.58, radius: 0.06 },
            'Langa':           { lat: -33.95, lng: 18.53, radius: 0.05 },
            'Philippi':        { lat: -34.01, lng: 18.59, radius: 0.08 },
            'Delft':           { lat: -33.97, lng: 18.63, radius: 0.06 },
            'Dunoon':          { lat: -33.83, lng: 18.55, radius: 0.05 },
            // KZN: eThekwini
            'Umlazi':          { lat: -29.97, lng: 30.89, radius: 0.10 },
            'KwaMashu':        { lat: -29.75, lng: 30.97, radius: 0.08 },
            'Inanda':          { lat: -29.72, lng: 30.92, radius: 0.10 },
            'Ntuzuma':         { lat: -29.76, lng: 30.94, radius: 0.06 },
            'Clermont':        { lat: -29.82, lng: 30.87, radius: 0.06 },
            'Chatsworth':      { lat: -29.92, lng: 30.89, radius: 0.08 },
            'Phoenix':         { lat: -29.72, lng: 31.01, radius: 0.08 },
            // Eastern Cape
            'Mdantsane':       { lat: -32.96, lng: 27.75, radius: 0.10 },
            'Motherwell':      { lat: -33.82, lng: 25.72, radius: 0.08 },
            'Ibhayi (Zwide)':  { lat: -33.85, lng: 25.60, radius: 0.08 },
            'New Brighton':    { lat: -33.85, lng: 25.62, radius: 0.06 },
            // Free State
            'Botshabelo':      { lat: -29.27, lng: 26.72, radius: 0.10 },
            'Mangaung (Bloemfontein)': { lat: -29.12, lng: 26.22, radius: 0.12 }
        };
        const expected = townshipGPS[rawData.township];
        if (expected && options.gpsCoords.lat && options.gpsCoords.lng) {
            const dist = Math.sqrt(
                Math.pow(options.gpsCoords.lat - expected.lat, 2) +
                Math.pow(options.gpsCoords.lng - expected.lng, 2)
            );
            if (dist > expected.radius) {
                return { blocked: true, reason: `GPS location does not match reported township (${rawData.township}). You appear to be ${Math.round(dist * 111)}km away.` };
            }
        }
    }

    // HARD BLOCK 2: Impossible revenue values
    const revenueFields = ['good_day_revenue', 'bad_day_revenue', 'turnover_good_day', 'turnover_bad_day'];
    for (const f of revenueFields) {
        const val = parseFloat(rawData[f]);
        if (!isNaN(val) && val > 500000) {
            return { blocked: true, reason: `Revenue of R${val.toLocaleString()} is impossibly high. Please correct this value.` };
        }
    }

    // HARD BLOCK 3: Negative prices
    const allFields = Object.entries(rawData);
    for (const [key, val] of allFields) {
        if (key.includes('price') || key.includes('revenue') || key.includes('turnover')) {
            const num = parseFloat(val);
            if (!isNaN(num) && num < 0) {
                return { blocked: true, reason: `Negative value detected for ${key}. Please correct.` };
            }
        }
    }

    return { blocked: false, reason: '' };
}

/**
 * Check submission speed — soft flag if agent is submitting too fast.
 */
function checkSubmissionSpeed() {
    const subs = JSON.parse(localStorage.getItem('pulse_submissions') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const todayCount = subs.filter(s => s.date && s.date.startsWith(today)).length;
    if (todayCount >= 20) {
        return { flagged: true, msg: `Agent has submitted ${todayCount} gigs today — review for quality` };
    }
    return { flagged: false, msg: '' };
}

/**
 * Try to get GPS coordinates.
 * Returns a promise that resolves to { lat, lng } or null.
 */
function getGPSPosition() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) { resolve(null); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve(null),
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        );
    });
}

/**
 * Show the DQS result to the agent as a toast/modal.
 */
function showDQSResult(dqsResult, basePoints) {
    const bonusPoints = Math.round(basePoints * dqsResult.bonusPct);
    const totalPoints = basePoints + bonusPoints;

    let tierLabel = '';
    if (dqsResult.tier !== 'Standard') {
        tierLabel = `${dqsResult.tierEmoji} ${dqsResult.tier} Quality`;
    }

    // Build breakdown text
    let breakdownHTML = '';
    if (dqsResult.flags.length > 0) {
        breakdownHTML = '<div style="margin-top:8px;font-size:0.75rem;color:#f59e0b;text-align:left;">';
        breakdownHTML += '<strong>Audit Notes:</strong><br>';
        dqsResult.flags.forEach(f => { breakdownHTML += `• ${f}<br>`; });
        breakdownHTML += '</div>';
    }

    const bonusHTML = bonusPoints > 0
        ? `<div style="color:#10b981;font-weight:700;font-size:1.1rem;margin-top:6px;">+${bonusPoints} quality bonus! (${Math.round(dqsResult.bonusPct * 100)}%)</div>`
        : '';

    // Use the existing toast or create a modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'dqs-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;';
    overlay.innerHTML = `
        <div style="background:var(--surface, #1a1a2e);border-radius:16px;padding:24px;max-width:320px;width:90%;text-align:center;border:1px solid rgba(255,255,255,0.1);">
            <div style="font-size:2.5rem;">${dqsResult.tierEmoji || '📋'}</div>
            <div style="font-size:1.3rem;font-weight:800;color:var(--text, #fff);margin:8px 0;">${tierLabel || 'Submission Complete'}</div>
            <div style="font-size:0.85rem;color:var(--text-muted, #aaa);margin-bottom:4px;">Data Quality Score</div>
            <div style="font-size:2rem;font-weight:900;color:${dqsResult.score >= 90 ? '#10b981' : dqsResult.score >= 80 ? '#f59e0b' : '#ef4444'};">${dqsResult.score}/100</div>
            <div style="display:flex;justify-content:space-around;margin:12px 0;font-size:0.7rem;color:var(--text-muted, #aaa);">
                <div><div style="font-weight:700;color:var(--text, #fff);">${dqsResult.breakdown.mandatory}%</div>Fields</div>
                <div><div style="font-weight:700;color:var(--text, #fff);">${dqsResult.breakdown.gps}%</div>GPS</div>
                <div><div style="font-weight:700;color:var(--text, #fff);">${dqsResult.breakdown.plausibility}%</div>Values</div>
                <div><div style="font-weight:700;color:var(--text, #fff);">${dqsResult.breakdown.consistency}%</div>Logic</div>
            </div>
            ${bonusHTML}
            ${breakdownHTML}
            <button onclick="document.getElementById('dqs-overlay').remove()" style="margin-top:16px;padding:10px 32px;background:var(--teal, #00d4aa);color:#000;border:none;border-radius:8px;font-weight:700;font-size:0.95rem;cursor:pointer;">Got it</button>
        </div>
    `;
    document.body.appendChild(overlay);

    // Auto-dismiss after 8 seconds
    setTimeout(() => { const el = document.getElementById('dqs-overlay'); if (el) el.remove(); }, 8000);

    return { bonusPoints, totalPoints };
}

console.log('[Pulse DQS] Engine loaded — v1.0');
