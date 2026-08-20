/**
 * PULSE SA - AI Question Suggestion Engine
 * ═════════════════════════════════════════
 * Smart question bank with contextual suggestions per business type.
 * Works offline (curated bank) with optional Gemini API upgrade.
 *
 * Architecture:
 *   1. QUESTION_BANK - Pre-curated high-value questions per sector
 *   2. suggestQuestions() - Picks relevant questions based on context
 *   3. renderSuggestions() - Displays toggleable question cards in-form
 *   4. collectAIAnswers() - Gathers answers from AI-suggested fields
 *
 * To enable Gemini API: Set GEMINI_API_KEY below and set USE_GEMINI = true
 */

// -- Gemini API Configuration (set when ready) --
const GEMINI_API_KEY = '';  // Paste your key here
const USE_GEMINI = false;   // Set true to enable live AI
const GEMINI_MODEL = 'gemini-2.0-flash';

// -- Pre-Curated Question Bank --
// Each question has: id, text, type (text/number/select), options (for select),
// placeholder, category, dataValue (who buys this data), priority (1-5)
const QUESTION_BANK = {

    kota_profile: [
        // Demand & Competition
        { id: 'ai-kt-competitors', text: 'How many other kota stands within 200m?', type: 'select',
          options: ['None', '1-2', '3-5', '6+'], category: 'Competition',
          dataValue: 'Market density intelligence for FMCGs', priority: 5 },
        { id: 'ai-kt-unique-item', text: 'What is your most unique menu item?', type: 'text',
          placeholder: 'e.g. Cheese russian kota with extra atchar', category: 'Menu',
          dataValue: 'Product innovation trends for food brands', priority: 3 },
        { id: 'ai-kt-delivery', text: 'Do you offer delivery?', type: 'select',
          options: ['No', 'Yes - self-delivery', 'Yes - via WhatsApp/phone orders', 'Yes - via app (Mr D, Uber Eats)'],
          category: 'Operations', dataValue: 'Digital adoption for fintech/delivery platforms', priority: 4 },
        { id: 'ai-kt-social', text: 'Do you use social media for marketing?', type: 'select',
          options: ['No', 'WhatsApp Status', 'Facebook', 'Instagram', 'TikTok'],
          category: 'Digital', dataValue: 'Digital literacy for telco/advertising partners', priority: 3 },
        { id: 'ai-kt-peak-season', text: 'When is your busiest season?', type: 'select',
          options: ['Month-end', 'School holidays', 'December', 'No difference', 'Summer'],
          category: 'Seasonality', dataValue: 'Demand forecasting for FMCG supply chains', priority: 4 },
        { id: 'ai-kt-monthly-spend', text: 'Estimated monthly ingredient spend (R)', type: 'number',
          placeholder: 'e.g. 8000', category: 'Finance',
          dataValue: 'Credit scoring for banks / micro-lenders', priority: 5 },
        { id: 'ai-kt-waste-type', text: 'What ingredient do you waste the most?', type: 'text',
          placeholder: 'e.g. Lettuce, bread', category: 'Operations',
          dataValue: 'Supply chain efficiency for FMCGs', priority: 3 },
        { id: 'ai-kt-power-impact', text: 'How does load shedding affect your business?', type: 'select',
          options: ['No impact', 'Lose some stock', 'Close early', 'Cannot operate at all'],
          category: 'Infrastructure', dataValue: 'Energy impact data for DFIs/municipalities', priority: 4 },
        { id: 'ai-kt-growth', text: 'What would help you grow the most?', type: 'select',
          options: ['More capital/stock', 'Better location', 'Equipment (fridge/stove)', 'Marketing/signage', 'Staff'],
          category: 'Needs', dataValue: 'Product development for banks/insurers', priority: 5 },
        { id: 'ai-kt-loan-interest', text: 'Would you apply for a small business loan if available?', type: 'select',
          options: ['Yes - definitely', 'Maybe - depends on terms', 'No - too risky', 'Already have one'],
          category: 'Finance', dataValue: 'Lead generation for micro-lenders', priority: 5 }
    ],

    tavern_profile: [
        { id: 'ai-tv-popular-brand', text: 'Which single beer brand sells the most?', type: 'text',
          placeholder: 'e.g. Castle Lager', category: 'Brands',
          dataValue: 'Brand dominance intelligence for SABMiller/Heineken', priority: 5 },
        { id: 'ai-tv-stockout', text: 'Which brand runs out most often?', type: 'text',
          placeholder: 'e.g. Black Label quarts', category: 'Supply',
          dataValue: 'Distribution gap intel for liquor distributors', priority: 5 },
        { id: 'ai-tv-events', text: 'Do you host events or live entertainment?', type: 'select',
          options: ['No', 'Weekends only', 'Monthly events', 'Weekly', 'Special occasions'],
          category: 'Social', dataValue: 'Event marketing for brands', priority: 3 },
        { id: 'ai-tv-safety', text: 'Any safety incidents in the last 6 months?', type: 'select',
          options: ['None', 'Theft', 'Fight/assault', 'Break-in', 'Multiple'],
          category: 'Risk', dataValue: 'Risk scoring for insurers', priority: 4 },
        { id: 'ai-tv-credit', text: 'Do you give customers credit/tabs?', type: 'select',
          options: ['No - cash only', 'Yes - to regulars', 'Yes - most customers', 'Yes - and often not repaid'],
          category: 'Finance', dataValue: 'Credit behavior data for banks', priority: 4 },
        { id: 'ai-tv-monthend', text: 'Revenue increase on month-end weekends (%)?', type: 'select',
          options: ['No change', '25-50% more', '50-100% more', 'More than double'],
          category: 'Seasonality', dataValue: 'Demand forecasting for liquor brands', priority: 4 },
        { id: 'ai-tv-underage', text: 'How do you handle underage customers?', type: 'select',
          options: ['Check IDs strictly', 'Check sometimes', 'Rely on appearance', 'Difficult to enforce'],
          category: 'Compliance', dataValue: 'Compliance data for liquor boards', priority: 3 },
        { id: 'ai-tv-music', text: 'What type of music system?', type: 'select',
          options: ['Phone/Bluetooth speaker', 'Hi-fi system', 'DJ setup', 'Jukebox', 'No music'],
          category: 'Social', dataValue: 'Equipment market sizing for electronics brands', priority: 2 },
        { id: 'ai-tv-food-revenue', text: 'What % of revenue comes from food?', type: 'select',
          options: ['0% - no food', 'Under 10%', '10-25%', '25-50%', 'Over 50%'],
          category: 'Revenue', dataValue: 'Food-alcohol bundling intel for FMCGs', priority: 4 },
        { id: 'ai-tv-competitors', text: 'How many other taverns/shebeens within 500m?', type: 'select',
          options: ['None', '1-2', '3-5', '6+'], category: 'Competition',
          dataValue: 'Market density for distributors', priority: 5 }
    ],

    trader_profile: [
        { id: 'ai-tp-digital-payment', text: 'Would you accept digital payments if a free device was offered?', type: 'select',
          options: ['Yes - definitely', 'Maybe', 'No - customers prefer cash', 'Already have one'],
          category: 'Digital', dataValue: 'Lead gen for payment providers (Yoco, iKhokha)', priority: 5 },
        { id: 'ai-tp-insurance-interest', text: 'Would you buy business insurance for R50/month?', type: 'select',
          options: ['Yes', 'Maybe - need more info', 'No - too expensive', 'No - don\'t trust insurance'],
          category: 'Insurance', dataValue: 'Product design for micro-insurers', priority: 5 },
        { id: 'ai-tp-competitor-count', text: 'How many competitors within 200m?', type: 'select',
          options: ['None', '1-2', '3-5', '6+'], category: 'Competition',
          dataValue: 'Market density intelligence', priority: 4 },
        { id: 'ai-tp-smartphone', text: 'Does the trader have a smartphone?', type: 'select',
          options: ['Yes - Android', 'Yes - iPhone', 'Feature phone only', 'No phone'],
          category: 'Digital', dataValue: 'Digital readiness for fintech/apps', priority: 4 },
        { id: 'ai-tp-training', text: 'Has the trader received any business training?', type: 'select',
          options: ['No', 'Yes - government program', 'Yes - NGO', 'Yes - self-taught (YouTube etc)', 'Yes - mentorship'],
          category: 'Development', dataValue: 'Training program impact for DFIs', priority: 3 },
        { id: 'ai-tp-rent', text: 'Monthly rent/site fee (R)', type: 'number',
          placeholder: 'e.g. 1500 (0 if own premises)', category: 'Finance',
          dataValue: 'Cost structure data for credit models', priority: 4 },
        { id: 'ai-tp-family', text: 'How many family members depend on this business income?', type: 'select',
          options: ['1 (just me)', '2-3', '4-6', '7+'], category: 'Social Impact',
          dataValue: 'Impact reporting for DFIs/CSR', priority: 3 },
        { id: 'ai-tp-savings', text: 'Does the trader save regularly?', type: 'select',
          options: ['No', 'Yes - stokvel', 'Yes - bank account', 'Yes - cash at home', 'Yes - mobile money'],
          category: 'Finance', dataValue: 'Financial behavior for banks', priority: 4 }
    ],

    price_basket: [
        { id: 'ai-pb-price-change', text: 'Have prices changed in the last month?', type: 'select',
          options: ['No change', 'Some items up', 'Most items up', 'Some items down'],
          category: 'Pricing', dataValue: 'Inflation tracking for economists/FMCG', priority: 5 },
        { id: 'ai-pb-out-of-stock', text: 'Which items are currently out of stock?', type: 'text',
          placeholder: 'e.g. Cooking oil, eggs', category: 'Supply',
          dataValue: 'Supply chain disruption intelligence', priority: 5 },
        { id: 'ai-pb-brand-switch', text: 'Has the trader switched any brands recently?', type: 'text',
          placeholder: 'e.g. Switched from Sunfoil to D\'lite', category: 'Brands',
          dataValue: 'Brand loyalty/switching data for FMCGs', priority: 4 },
        { id: 'ai-pb-bulk-price', text: 'Does trader get bulk/wholesale pricing?', type: 'select',
          options: ['No - buys retail', 'Yes - cash & carry', 'Yes - wholesaler account', 'Yes - group buying'],
          category: 'Sourcing', dataValue: 'Procurement behavior for supply chain partners', priority: 4 }
    ],

    receipt_snap: [
        {
            id: 'ai-rs-frequency',
            question: 'How often does this trader buy from this supplier?',
            type: 'select',
            options: ['Daily', 'Every 2-3 days', 'Weekly', 'Fortnightly', 'Monthly']
        },
        {
            id: 'ai-rs-payment',
            question: 'How did they pay for this purchase?',
            type: 'select',
            options: ['Cash', 'Card/EFT', 'Account/Credit', 'Mixed']
        },
        {
            id: 'ai-rs-transport',
            question: 'How was the stock transported?',
            type: 'select',
            options: ['Own vehicle', 'Taxi with stock', 'Wholesaler delivery', 'Hired bakkie']
        }
    ],

    infrastructure: [
        { id: 'ai-ir-businesses-closed', text: 'How many businesses had to close because of this disruption?', type: 'select',
          options: ['None', '1-3', '4-10', 'More than 10', 'Entire area'],
          category: 'Impact', dataValue: 'Economic impact data for municipalities/DFIs', priority: 5 },
        { id: 'ai-ir-reported', text: 'Has this been reported to the municipality?', type: 'select',
          options: ['No', 'Yes - no response', 'Yes - acknowledged', 'Yes - being fixed'],
          category: 'Governance', dataValue: 'Service delivery tracking for municipalities', priority: 4 }
    ],

    foot_traffic: [
        { id: 'ai-ft-queue', text: 'Any queue visible?', type: 'select',
          options: ['No queue', 'Short queue (1-3)', 'Medium queue (4-8)', 'Long queue (9+)'],
          category: 'Activity', dataValue: 'Demand intensity verification', priority: 4 },
        { id: 'ai-ft-delivery', text: 'Any delivery vehicles present?', type: 'select',
          options: ['No', 'Yes - wholesaler truck', 'Yes - bakkie/car with stock', 'Yes - motorcycle'],
          category: 'Supply', dataValue: 'Supply chain activity verification', priority: 3 }
    ]
};

/**
 * Get smart question suggestions based on business type and already-filled data.
 * Prioritises questions that fill data gaps.
 * @param {string} gigType - e.g. 'kota_profile'
 * @param {object} existingData - fields already filled by the agent
 * @param {number} maxQuestions - max suggestions to return (default 5)
 * @returns {Array} sorted question suggestions
 */
function suggestQuestions(gigType, existingData = {}, maxQuestions = 5) {
    const bank = QUESTION_BANK[gigType];
    if (!bank || bank.length === 0) return [];

    // Load business profile for intelligent filtering
    let profile = {};
    try {
        const stored = localStorage.getItem('pulse_business_profile');
        if (stored) profile = JSON.parse(stored);
    } catch(e) { /* no profile yet */ }

    // Map business categories to relevant gig question types
    const categoryRelevance = {
        'Kota / Fast Food': ['kota_profile', 'price_basket', 'receipt_snap'],
        'Braai Stand': ['kota_profile', 'price_basket', 'receipt_snap'],
        'Bakery': ['kota_profile', 'price_basket', 'receipt_snap'],
        'Tavern / Shebeen': ['tavern_profile', 'price_basket', 'receipt_snap'],
        'Spaza Shop': ['trader_profile', 'price_basket', 'receipt_snap'],
        'Tuck Shop': ['trader_profile', 'price_basket', 'receipt_snap'],
        'Hair Salon / Barber': ['trader_profile'],
        'Mechanic / Panel Beater': ['trader_profile'],
        'Fruit & Veg Vendor': ['trader_profile', 'price_basket'],
        'Street Food Vendor': ['kota_profile', 'price_basket'],
        'Hawker': ['trader_profile', 'price_basket']
    };

    // Score and filter questions based on profile gaps
    const scored = bank.map(q => {
        let score = q.priority || 3;

        // Boost insurance questions if business has no insurance
        if (q.category === 'Insurance' && profile.insurance_status === 'None') score += 2;
        
        // Boost digital payment questions if business is unbanked or cash-only
        if (q.category === 'Digital' && (profile.bank_account === 'None (Unbanked)' || profile.cash_card_split === 'Mostly Cash (80%+)')) score += 2;
        
        // Boost finance questions if business has no formal registration
        if (q.category === 'Finance' && (!profile.cipc_registered || profile.cipc_registered === 'No')) score += 1;
        
        // Boost compliance questions for taverns without licenses
        if (q.category === 'Compliance' && profile.business_category === 'Tavern / Shebeen') score += 1;
        
        // Boost competition questions if area data is sparse
        if (q.category === 'Competition') score += 1;
        
        // Penalise questions already answered in existing gig data
        const answeredKeys = Object.keys(existingData).map(k => k.toLowerCase());
        if (answeredKeys.some(k => q.id.includes(k) || (q.text && q.text.toLowerCase().includes(k)))) score -= 3;

        return { ...q, score };
    });

    // Sort by adjusted score (highest first)
    const sorted = scored.sort((a, b) => b.score - a.score);
    return sorted.slice(0, maxQuestions);
}

/**
 * Use Gemini API to generate contextual questions (when enabled).
 * Falls back to local bank if API fails or is disabled.
 */
async function suggestQuestionsAI(gigType, existingData = {}, maxQuestions = 5) {
    // Always start with local suggestions
    const localSuggestions = suggestQuestions(gigType, existingData, maxQuestions);

    if (!USE_GEMINI || !GEMINI_API_KEY) {
        return localSuggestions;
    }

    try {
        const sectorLabels = {
            kota_profile: 'Kota / Fast-Food Stand',
            tavern_profile: 'Tavern / Shebeen',
            trader_profile: 'Informal Trader (Spaza Shop)',
            price_basket: 'Price Basket Monitor',
            receipt_snap: 'Receipt Snap (Wholesale Purchase)',
            infrastructure: 'Infrastructure Report',
            foot_traffic: 'Foot Traffic Verification'
        };

        const prompt = `You are a data collection specialist for Pulse SA, a company that collects structured data about South Africa's informal township economy. 

An agent is profiling a ${sectorLabels[gigType] || gigType} business. They have already captured these data points:
${JSON.stringify(existingData, null, 2)}

Suggest ${maxQuestions} additional HIGH-VALUE questions that would be useful for:
- Banks (credit scoring, micro-loans)
- FMCG brands (market intelligence, distribution)
- Insurers (risk assessment)
- Municipalities (service delivery, compliance)

Return ONLY a JSON array where each item has: 
{"id": "ai-gen-N", "text": "question text", "type": "text|number|select", "options": ["opt1","opt2"] (only for select), "category": "short category", "dataValue": "who buys this data and why", "priority": 4}

Do NOT include questions already covered by the existing data. Focus on South African township context.`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
                })
            }
        );

        if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Extract JSON array from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const aiQuestions = JSON.parse(jsonMatch[0]);
            // Merge: AI questions + local bank (deduplicated)
            const combined = [...aiQuestions, ...localSuggestions];
            const seen = new Set();
            return combined.filter(q => {
                if (seen.has(q.id)) return false;
                seen.add(q.id);
                return true;
            }).slice(0, maxQuestions);
        }

        return localSuggestions; // Fallback
    } catch (err) {
        console.warn('[Pulse AI] Gemini API failed, using local bank:', err.message);
        return localSuggestions;
    }
}

/**
 * Render suggestion cards into a target container.
 * @param {string} containerId - DOM id of the container
 * @param {Array} questions - array of question objects
 */
function renderSuggestions(containerId, questions) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (questions.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;padding:8px;">No additional suggestions for this submission.</p>';
        return;
    }

    container.innerHTML = `
        <div style="margin-bottom:8px;display:flex;align-items:center;gap:8px;">
            <span style="font-size:0.8rem;color:var(--teal);font-weight:700;">💡 AI-Suggested Questions</span>
            <span style="font-size:0.65rem;color:var(--text-muted);">(optional - earn bonus points)</span>
        </div>
    `;

    questions.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = 'ai-question-card';
        card.style.cssText = 'background:rgba(0,242,254,0.05);border:1px solid rgba(0,242,254,0.15);border-radius:10px;padding:12px;margin-bottom:8px;transition:all 0.3s;';

        let inputHTML = '';
        if (q.type === 'select' && q.options) {
            inputHTML = `<select id="${q.id}" style="width:100%;padding:8px;border-radius:6px;background:var(--bg-card);color:var(--text);border:1px solid var(--border);font-size:0.85rem;">
                <option value="">- Select -</option>
                ${q.options.map(o => `<option value="${o}">${o}</option>`).join('')}
            </select>`;
        } else if (q.type === 'number') {
            inputHTML = `<div class="currency-row" style="display:flex;align-items:center;gap:6px;">
                <span style="color:var(--text-muted);font-weight:600;">R</span>
                <input type="number" id="${q.id}" placeholder="${q.placeholder || ''}" min="0" style="flex:1;padding:8px;border-radius:6px;background:var(--bg-card);color:var(--text);border:1px solid var(--border);font-size:0.85rem;">
            </div>`;
        } else {
            inputHTML = `<input type="text" id="${q.id}" placeholder="${q.placeholder || ''}" style="width:100%;padding:8px;border-radius:6px;background:var(--bg-card);color:var(--text);border:1px solid var(--border);font-size:0.85rem;box-sizing:border-box;">`;
        }

        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px;">
                <label style="font-size:0.8rem;font-weight:600;color:var(--text);flex:1;">${q.text}</label>
                <span style="font-size:0.6rem;background:rgba(168,85,247,0.2);color:var(--purple);padding:2px 6px;border-radius:4px;white-space:nowrap;margin-left:8px;">${q.category}</span>
            </div>
            ${inputHTML}
            <div style="font-size:0.6rem;color:var(--text-muted);margin-top:4px;">📊 ${q.dataValue}</div>
        `;
        container.appendChild(card);
    });
}

/**
 * Collect answers from AI-suggested question fields.
 * @param {Array} questions - the questions that were rendered
 * @returns {object} key-value pairs of answered questions
 */
function collectAIAnswers(questions) {
    const answers = {};
    questions.forEach(q => {
        const el = document.getElementById(q.id);
        if (el && el.value && el.value !== '') {
            answers[q.id] = {
                question: q.text,
                answer: el.value,
                category: q.category
            };
        }
    });
    return answers;
}

console.log('[Pulse AI] Question suggestion engine loaded - v1.0');
console.log(`[Pulse AI] Mode: ${USE_GEMINI ? 'Gemini API' : 'Local question bank'}`);
console.log(`[Pulse AI] Question bank: ${Object.keys(QUESTION_BANK).length} sectors, ${Object.values(QUESTION_BANK).flat().length} total questions`);
