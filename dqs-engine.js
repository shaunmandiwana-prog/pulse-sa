/**
 * PULSE SA - Data Quality Score (DQS) Engine + Audit Controls
 * ════════════════════════════════════════════════════════════
 * Calculates a Data Quality Score (0-100) for every submission.
 * Implements ISA 500-aligned audit controls: Relevance & Reliability.
 *
 * DQS Components:
 *   40% - Mandatory field completeness
 *   20% - Optional field completeness
 *   15% - GPS verification
 *   15% - Price/value plausibility
 *   10% - Internal consistency
 *
 * Bonus Tiers:
 *   95%+ → Gold   (30% bonus)
 *   90%+ → Silver (20% bonus)
 *   80%+ → Bronze (10% bonus)
 *   <80% → None   (0% bonus)
 */

// -- Sector Configuration --
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
                         'insurance_status', 'biggest_challenge', 'oil_brand', 'bread_brand', 'beverage_brand', 'brand_switch', 'photo', 'trader_id'],
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
    receipt_snap: {
        label: 'Receipt Snap',
        mandatoryFields: ['trader_name', 'township', 'receipt_amount'],
        optionalFields: ['supplier', 'receipt_date', 'photo'],
        revenueRange: { label: 'Receipt Amount', min: 50, max: 100000 },
        revenueFields: ['receipt_amount'],
        consistencyChecks: [],
        priceRanges: {}
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
        return { score: 50, tier: 'None', tierEmoji: '', bonus: 0, breakdown: {}, flags: ['Unknown gig type - default score applied'] };
    }

    const flags = [];
    let mandatoryScore = 0;
    let optionalScore = 0;
    let gpsScore = 0;
    let priceScore = 0;
    let consistencyScore = 0;

    // -- 1. Mandatory field completeness (40%) --
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

    // -- 2. Optional field completeness (20%) --
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

    // -- 3. GPS & Coverage Zone Geofencing (15%) --
    let geoResult = { inZone: true, status: 'unassigned', distKm: 0 };
    const auditFlags = [];

    if (options.hasGPS && options.gpsCoords) {
        const agentWard = options.agentWard || (typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('pulse_agent_ward') || 'null') : null);
        geoResult = verifyGPSInCoverageZone(options.gpsCoords, agentWard);

        if (geoResult.inZone) {
            gpsScore = 100;
            if (agentWard && agentWard.wardNo) {
                flags.push(`📍 GPS verified in assigned coverage zone (Ward ${agentWard.wardNo}, ${agentWard.municipality || 'Assigned Area'})`);
            }
        } else if (geoResult.status === 'out_of_zone') {
            gpsScore = 20; // Major GPS penalty for logging outside assigned area
            auditFlags.push('OUT_OF_ZONE_SUBMISSION');
            flags.push(`⚠️ OUT OF ASSIGNED ZONE: Logged ${geoResult.distKm}km from assigned Ward ${geoResult.assignedWardNo} (${geoResult.municipality})`);
        } else {
            gpsScore = 80;
        }

        // Velocity Check (ISA 520: Analytical Procedures / Impossible Travel)
        const velResult = checkVelocity(options.gpsCoords);
        if (velResult.flagged) {
            auditFlags.push(velResult.flag);
            flags.push(`🚨 ${velResult.reason}`);
            gpsScore = Math.max(0, gpsScore - 40); // Severe penalty for impossible travel velocity
        }
    } else {
        gpsScore = 0;
        auditFlags.push('NO_GPS_CAPTURED');
        flags.push('No GPS verification — agent location not confirmed');
    }

    // Anomaly Pattern Detection (ISA 240: Fraud Triangle)
    const anomalyResult = detectAnomalies(gigType, rawData);
    if (anomalyResult.hasAnomalies) {
        anomalyResult.anomalyFlags.forEach(af => {
            if (!auditFlags.includes(af)) auditFlags.push(af);
        });
        anomalyResult.notes.forEach(an => {
            flags.push(`🔍 Pattern Note: ${an}`);
        });
    }

    // -- 4. Price/value plausibility (15%) --
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
                flags.push(`${range.label}: R${val} outside expected range (R${range.min}-R${range.max})`);
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

    // -- 5. Internal consistency (10%) --
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

    // -- Calculate weighted total --
    const weightedScore = Math.round(
        (mandatoryScore * 0.40) +
        (optionalScore  * 0.20) +
        (gpsScore       * 0.15) +
        (priceScore     * 0.15) +
        (consistencyScore * 0.10)
    );

    const score = Math.min(100, Math.max(0, weightedScore));

    // -- Determine tier and bonus --
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

    // Out-of-zone penalty / verified-zone boost
    const isOutOfZone = !geoResult.inZone && geoResult.status === 'out_of_zone';
    if (isOutOfZone) {
        bonusPct = Math.max(0, bonusPct - 0.15); // Forfeit quality bonus
    } else if (geoResult.inZone && options.hasGPS) {
        bonusPct = Math.min(0.35, bonusPct + 0.05); // +5% Verified Zone bonus
    }

    return {
        score,
        tier,
        tierEmoji,
        bonusPct,
        isOutOfZone,
        coverageStatus: geoResult.status,
        coverageDistanceKm: geoResult.distKm || 0,
        assignedWardNo: geoResult.assignedWardNo || null,
        auditFlags,
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

// -- Audit Controls --

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
 * Check submission speed - soft flag if agent is submitting too fast.
 */
function checkSubmissionSpeed() {
    const subs = JSON.parse(localStorage.getItem('pulse_submissions') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const todayCount = subs.filter(s => s.date && s.date.startsWith(today)).length;
    if (todayCount >= 20) {
        return { flagged: true, msg: `Agent has submitted ${todayCount} gigs today - review for quality` };
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
        dqsResult.flags.forEach(f => { breakdownHTML += `* ${f}<br>`; });
        breakdownHTML += '</div>';
    }

    const bonusHTML = bonusPoints > 0
        ? `<div style="color:#10b981;font-weight:700;font-size:1.1rem;margin-top:6px;">+${bonusPoints} quality bonus! (${Math.round(dqsResult.bonusPct * 100)}%)</div>`
        : '';

    // Out of coverage zone alert banner
    let zoneAlertHTML = '';
    if (dqsResult.isOutOfZone) {
        zoneAlertHTML = `
            <div style="background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);border-radius:8px;padding:8px 10px;margin-top:10px;font-size:0.7rem;color:#fbbf24;text-align:left;line-height:1.4;">
                <i class="fa-solid fa-triangle-exclamation" style="margin-right:4px;"></i><strong>Coverage Zone Notice:</strong> Logged ${dqsResult.coverageDistanceKm}km outside your assigned Ward ${dqsResult.assignedWardNo || ''}. Tagged for Head Office quality review.
            </div>
        `;
    }

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
            ${zoneAlertHTML}
            ${breakdownHTML}
            <button onclick="document.getElementById('dqs-overlay').remove()" style="margin-top:16px;padding:10px 32px;background:var(--teal, #00d4aa);color:#000;border:none;border-radius:8px;font-weight:700;font-size:0.95rem;cursor:pointer;">Got it</button>
        </div>
    `;
    document.body.appendChild(overlay);

    // Auto-dismiss after 8 seconds
    setTimeout(() => { const el = document.getElementById('dqs-overlay'); if (el) el.remove(); }, 8000);

    // Auto-dispatch Fraud Anomaly Alert if 2+ audit flags detected (ISA 240)
    if (dqsResult.auditFlags && dqsResult.auditFlags.length >= 2) {
        if (typeof dispatchFraudAnomalyAlert === 'function') {
            const agentId = (typeof localStorage !== 'undefined' ? localStorage.getItem('pulse_agent_id') : null) || 'PSA-ZA-2026';
            const agentName = (typeof localStorage !== 'undefined' ? localStorage.getItem('pulse_agent_name') : null) || 'Field Agent';
            dispatchFraudAnomalyAlert({
                agentId,
                agentName,
                gigType: tierLabel || 'Field Gig Submission',
                summary: dqsResult.flags.join('; '),
                auditFlags: dqsResult.auditFlags,
                dqsScore: dqsResult.score,
                details: dqsResult.flags.join('\n')
            });
        }
    }

    return { bonusPoints, totalPoints };
}

// ═══════════════════════════════════════════════════
// COVERAGE ZONE GEOFENCING (ISA 315 / 500)
// ═══════════════════════════════════════════════════

/**
 * Calculates distance between two GPS coordinates in meters.
 */
function calculateDistanceMetersDQS(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371e3;
    const phi1 = Number(lat1) * Math.PI / 180;
    const phi2 = Number(lat2) * Math.PI / 180;
    const deltaPhi = (Number(lat2) - Number(lat1)) * Math.PI / 180;
    const deltaLambda = (Number(lon2) - Number(lon1)) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Verifies whether the submission GPS coordinates fall within the agent's
 * assigned home ward and adjacent coverage zone (typically ~8.5km radius).
 * Implements ISA 315 preventive control and ISA 500 audit verification.
 */
function verifyGPSInCoverageZone(gpsCoords, agentWard) {
    if (!agentWard || !agentWard.wardNo) {
        return { verified: true, inZone: true, status: 'unassigned', distKm: 0 };
    }

    if (!gpsCoords || !gpsCoords.lat || !gpsCoords.lng) {
        return {
            verified: false,
            inZone: false,
            status: 'no_gps',
            distKm: 0,
            assignedWardNo: agentWard.wardNo,
            municipality: agentWard.municipality || 'Assigned Area'
        };
    }

    // Check distance from agent's registered home GPS coordinates
    const hLat = agentWard.gpsLat || agentWard.lat;
    const hLng = agentWard.gpsLng || agentWard.lng;

    if (hLat && hLng) {
        const distMeters = calculateDistanceMetersDQS(gpsCoords.lat, gpsCoords.lng, hLat, hLng);
        const distKm = distMeters !== null ? Math.round((distMeters / 1000) * 10) / 10 : 0;

        // Home ward zone: <= 5.0km
        if (distKm <= 5.0) {
            return {
                verified: true,
                inZone: true,
                status: 'home_ward_zone',
                distKm,
                assignedWardNo: agentWard.wardNo,
                municipality: agentWard.municipality || 'Assigned Area'
            };
        }

        // Adjacent ward coverage zone: <= 8.5km
        if (distKm <= 8.5) {
            return {
                verified: true,
                inZone: true,
                status: 'adjacent_ward_zone',
                distKm,
                assignedWardNo: agentWard.wardNo,
                municipality: agentWard.municipality || 'Assigned Area'
            };
        }

        // Out of coverage zone: > 8.5km
        return {
            verified: false,
            inZone: false,
            status: 'out_of_zone',
            distKm,
            assignedWardNo: agentWard.wardNo,
            municipality: agentWard.municipality || 'Assigned Area',
            flag: 'OUT_OF_ZONE_SUBMISSION'
        };
    }

    // Fallback if home GPS coordinates were not saved
    return {
        verified: true,
        inZone: true,
        status: 'unverified_home_gps',
        distKm: 0,
        assignedWardNo: agentWard.wardNo,
        municipality: agentWard.municipality || 'Assigned Area'
    };
}

/**
 * Checks for physically impossible travel velocity between successive submissions.
 * ISA 520: Analytical Procedures — Substantive Testing of Data Integrity.
 */
function checkVelocity(currentGPS, currentTimestamp = null, previousSubmissions = null) {
    if (!currentGPS || !currentGPS.lat || !currentGPS.lng) {
        return { flagged: false, velocityKmh: 0, distanceKm: 0, timeMinutes: 0 };
    }

    const subs = previousSubmissions || (typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('pulse_submissions') || '[]') : []);
    if (!subs || subs.length === 0) {
        return { flagged: false, velocityKmh: 0, distanceKm: 0, timeMinutes: 0 };
    }

    // Find the most recent previous submission with a timestamp and GPS
    const nowTime = currentTimestamp ? new Date(currentTimestamp).getTime() : Date.now();
    let prevSub = null;
    for (const sub of subs) {
        if (sub.date && (sub.data && ((sub.data.gps_lat && sub.data.gps_lng) || (sub.data.gpsLat && sub.data.gpsLng) || sub.gpsCoords))) {
            prevSub = sub;
            break;
        }
    }

    if (!prevSub) {
        return { flagged: false, velocityKmh: 0, distanceKm: 0, timeMinutes: 0 };
    }

    const prevTime = new Date(prevSub.date).getTime();
    const timeDiffMinutes = (nowTime - prevTime) / (1000 * 60);

    // Ignore if previous submission is older than 6 hours or negative clock skew
    if (timeDiffMinutes > 360 || timeDiffMinutes <= 0) {
        return { flagged: false, velocityKmh: 0, distanceKm: 0, timeMinutes: timeDiffMinutes };
    }

    const pLat = prevSub.data.gps_lat || prevSub.data.gpsLat || (prevSub.gpsCoords && prevSub.gpsCoords.lat);
    const pLng = prevSub.data.gps_lng || prevSub.data.gpsLng || (prevSub.gpsCoords && prevSub.gpsCoords.lng);

    if (!pLat || !pLng) {
        return { flagged: false, velocityKmh: 0, distanceKm: 0, timeMinutes: timeDiffMinutes };
    }

    const distMeters = calculateDistanceMetersDQS(currentGPS.lat, currentGPS.lng, pLat, pLng);
    const distKm = distMeters !== null ? distMeters / 1000 : 0;
    const timeHours = timeDiffMinutes / 60;
    const velocityKmh = timeHours > 0 ? distKm / timeHours : 0;

    // Velocity Threshold 1: Teleportation / rapid submissions from different locations (>65 km/h over >2km)
    if (distKm > 2.0 && velocityKmh > 65.0) {
        return {
            flagged: true,
            flag: 'IMPOSSIBLE_TRAVEL_VELOCITY',
            velocityKmh: Math.round(velocityKmh),
            distanceKm: Math.round(distKm * 10) / 10,
            timeMinutes: Math.round(timeDiffMinutes),
            reason: `Impossible travel speed: ${Math.round(velocityKmh)} km/h across ${Math.round(distKm * 10) / 10} km in ${Math.round(timeDiffMinutes)} minutes.`
        };
    }

    // Velocity Threshold 2: Instant duplicate spam (< 1 minute between submissions > 500m apart)
    if (timeDiffMinutes < 1.0 && distKm > 0.5) {
        return {
            flagged: true,
            flag: 'RAPID_LOCATION_LEAP',
            velocityKmh: Math.round(velocityKmh),
            distanceKm: Math.round(distKm * 10) / 10,
            timeMinutes: Math.round(timeDiffMinutes),
            reason: `Suspiciously fast leap: ${Math.round(distMeters)}m in under 60 seconds.`
        };
    }

    return { flagged: false, velocityKmh: Math.round(velocityKmh), distanceKm: Math.round(distKm * 10) / 10, timeMinutes: Math.round(timeDiffMinutes) };
}

/**
 * Detects Fraud Triangle patterns in field data collection.
 * ISA 240: The Auditor's Responsibilities Relating to Fraud in an Audit of Financial Statements.
 */
function detectAnomalies(gigType, rawData, currentTimestamp = null, previousSubmissions = null) {
    const anomalyFlags = [];
    const notes = [];
    const subs = previousSubmissions || (typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('pulse_submissions') || '[]') : []);

    // 1. Unusual Hours Check (Midnight to 5:00 AM)
    const now = currentTimestamp ? new Date(currentTimestamp) : new Date();
    const hour = now.getHours();
    if (hour >= 0 && hour < 5) {
        anomalyFlags.push('UNUSUAL_HOURS_SUBMISSION');
        notes.push('Logged during unusual night hours (00:00 - 05:00)');
    }

    // 2. Round-Number / Fabrication Indicator (e.g. exactly R1000, R2000, R5000 with no variance)
    const revenueFields = ['good_day_revenue', 'bad_day_revenue', 'turnover_good_day', 'turnover_bad_day', 'receipt_amount'];
    let roundNumberCount = 0;
    let checkedRevFields = 0;
    for (const f of revenueFields) {
        if (rawData && rawData[f]) {
            const val = parseFloat(rawData[f]);
            if (!isNaN(val) && val > 0) {
                checkedRevFields++;
                if (val >= 500 && val % 500 === 0) {
                    roundNumberCount++;
                }
            }
        }
    }
    if (checkedRevFields >= 2 && roundNumberCount === checkedRevFields) {
        let priorRoundCount = 0;
        subs.slice(0, 3).forEach(s => {
            const d = s.data || {};
            for (const f of revenueFields) {
                const v = parseFloat(d[f]);
                if (!isNaN(v) && v >= 500 && v % 500 === 0) priorRoundCount++;
            }
        });
        if (priorRoundCount >= 3) {
            anomalyFlags.push('SUSPICIOUS_ROUND_VALUES_PATTERN');
            notes.push('Repeated perfect round-number estimates without realistic variation');
        }
    }

    // 3. Persistent GPS Concealment (>60% submissions without GPS)
    if (subs.length >= 6) {
        const recent = subs.slice(0, 10);
        const noGPSCount = recent.filter(s => !(s.data && (s.data.gps_lat || s.data.gpsLat || s.gpsCoords))).length;
        if (noGPSCount / recent.length >= 0.6) {
            anomalyFlags.push('PERSISTENT_GPS_CONCEALMENT');
            notes.push(`High GPS refusal rate (${Math.round((noGPSCount / recent.length) * 100)}% of recent submissions missing GPS)`);
        }
    }

    // 4. Submission Flooding / High-Volume Speed Run (>20 submissions today)
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySubs = subs.filter(s => s.date && s.date.startsWith(todayStr));
    if (todaySubs.length >= 20) {
        anomalyFlags.push('HIGH_VOLUME_VELOCITY');
        notes.push(`High daily volume: ${todaySubs.length + 1} submissions logged today`);
    }

    return {
        hasAnomalies: anomalyFlags.length > 0,
        anomalyFlags,
        notes
    };
}

console.log('[Pulse DQS] Engine loaded - v3.0 with ISA 240/520 Velocity & Fraud Analytics');
