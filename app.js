// Pulse SA Core Logic (Extended version with FMCG & POS Gigs)

// --- GLOBAL STATE MANAGER ---
const globalState = {
    activeEvents: [], // Array of active shocks (e.g., 'water_cut')
    selectedLocation: null, // Track currently selected Ward or Metro
    selectedNodeId: null // Track currently selected Ontology Node
};

// 1. Initial State Database (Nodes & Links)
const ontologyData = {
    nodes: [
        // Traders (Informal SMEs)
        { id: 'mkhize_inhloko', label: "Mkhize's Inhloko", type: 'trader', township: 'Soweto', x: 220, y: 150, r: 10, properties: {
            // Identity & Profile
            'Name': "Bab' uMkhize's Inhloko",
            'Type': 'Street Food (Inhloko)',
            'Township': 'Soweto (Ward 15)',
            'Years Operating': '6 years',
            'Premises': 'Converted container (owned)',
            'Employees': '2',
            'Dependents': '4',
            'ID Verified': 'Yes',
            // Financial Behaviour
            'Bank Account': 'Capitec Savings',
            'Mobile Money': 'None',
            'Stokvel': 'Yes — R800/month',
            'Existing Loans': 'None',
            'Savings Method': 'Cash at home + stokvel',
            'Payment Methods': 'Cash only',
            // Stock & Product
            'Top Products': 'Cow heads, Tripe, Mageu, R20 airtime, Cigarettes',
            'Restock Frequency': 'Daily (meat)',
            'Fastest Seller': 'Cow heads',
            'Wanted But Unaffordable': 'Cold drinks fridge (R3,500)',
            'Primary Supplier': 'JHB Abattoir',
            // Transaction Patterns
            'Turnover (Good Day)': 'R3,800',
            'Turnover (Bad Day)': 'R1,200',
            'Busiest Hours': '11am–2pm & 5–8pm',
            'Wholesaler Terms': 'Cash on delivery',
            'Monthly Turnover (Reconciled)': 'R58,000 ±15%',
            'Customers Per Day': '~60',
            // Location & Infrastructure
            'GPS': '-26.2678, 27.8547',
            'Ward': '15',
            'Water Supply': 'Municipal water (operational)',
            'Electricity': 'Prepaid Eskom',
            'Distance to Wholesaler': '12km',
            'Restock Transport': 'Minibus taxi — R30 return',
            // Risk & Loss History
            'Previous Losses': 'Fire damage 2023 (~R5,000 stock lost)',
            'Insurance Status': 'None',
            'Biggest Challenge': 'Load shedding spoils meat',
            'Crime Incidents': '1 theft incident (2024)',
            'Infrastructure Disruptions': 'Water outages 2x/month',
            'Status': 'Active'
        }, locationData: { wardNo: 15, municName: 'City of Johannesburg' } },
        { id: 'sizwe_spaza', label: "Sizwe's Spaza", type: 'trader', township: 'Soweto', x: 120, y: 220, r: 10, properties: {
            // Identity & Profile
            'Name': "Sizwe's Spaza Shop",
            'Type': 'Spaza Shop',
            'Township': 'Soweto (Ward 15)',
            'Years Operating': '4 years',
            'Premises': 'Brick extension on house (owned)',
            'Employees': '1 (self + wife helps)',
            'Dependents': '3',
            'ID Verified': 'Yes',
            // Financial Behaviour
            'Bank Account': 'Capitec Savings + Standard Bank',
            'Mobile Money': 'MoMo (supplier payments)',
            'Stokvel': 'Yes — R500/month',
            'Existing Loans': 'None',
            'Savings Method': 'Capitec account',
            'Payment Methods': 'Cash + Capitec Pay',
            // Stock & Product
            'Top Products': 'Omo 500g, Coke 2L, Simba chips, White Star maize, Airtime',
            'Restock Frequency': 'Every 3 days (fast movers)',
            'Fastest Seller': 'Airtime then bread',
            'Wanted But Unaffordable': 'Bulk cooking oil (R200+ upfront)',
            'Primary Supplier': 'Metro Cash & Carry',
            // Transaction Patterns
            'Turnover (Good Day)': 'R6,200',
            'Turnover (Bad Day)': 'R1,800',
            'Busiest Hours': '6–8am & 4–7pm',
            'Wholesaler Terms': 'Cash on delivery',
            'Monthly Turnover (Reconciled)': 'R92,000 ±12%',
            'Customers Per Day': '~80',
            // Location & Infrastructure
            'GPS': '-26.2712, 27.8623',
            'Ward': '15',
            'Water Supply': 'Municipal water',
            'Electricity': 'Prepaid Eskom',
            'Distance to Wholesaler': '8km to Metro C&C',
            'Restock Transport': 'Own bakkie',
            // Risk & Loss History
            'Previous Losses': 'Robbed once 2024 (~R3,000 cash)',
            'Insurance Status': 'None',
            'Biggest Challenge': 'Cash flow gaps between restock',
            'Crime Incidents': 'None other',
            'Infrastructure Disruptions': 'Water outages 3x last month',
            'Status': 'Active'
        }, locationData: { wardNo: 15, municName: 'City of Johannesburg' } },
        { id: 'nomsa_salon', label: "Nomsa's Hair Salon", type: 'trader', township: 'Khayelitsha', x: 420, y: 150, r: 10, properties: {
            // Identity & Profile
            'Name': "Nomsa's Hair Salon",
            'Type': 'Hair Salon',
            'Township': 'Khayelitsha (Site C)',
            'Years Operating': '3 years',
            'Premises': 'Shipping container (rented R1,200/month)',
            'Employees': '3 (self + 2 braiders)',
            'Dependents': '2',
            'ID Verified': 'Yes',
            // Financial Behaviour
            'Bank Account': 'FNB Easy Account',
            'Mobile Money': 'None',
            'Stokvel': 'Yes — R400/month',
            'Existing Loans': 'None',
            'Savings Method': 'FNB + stokvel',
            'Payment Methods': 'Cash + Yoco card',
            // Stock & Product
            'Top Products': 'Braids, Relaxer treatment, Cornrows, Weaves, Hair products (Dark & Lovely)',
            'Restock Frequency': 'Weekly (products)',
            'Fastest Seller': 'Braids',
            'Wanted But Unaffordable': 'Hair dryer stand (R1,800)',
            'Primary Supplier': 'China Mall Cape Town',
            // Transaction Patterns
            'Turnover (Good Day)': 'R1,800',
            'Turnover (Bad Day)': 'R400',
            'Busiest Hours': 'Fri–Sat all day',
            'Wholesaler Terms': '30-day account with supplier',
            'Monthly Turnover (Reconciled)': 'R24,000 ±20%',
            'Customers Per Day': '~12',
            // Location & Infrastructure
            'GPS': '-34.0453, 18.6758',
            'Ward': '95',
            'Water Supply': 'Municipal water',
            'Electricity': 'Prepaid Eskom',
            'Distance to Wholesaler': '22km to supplier',
            'Restock Transport': 'Minibus taxi — R55 return',
            // Risk & Loss History
            'Previous Losses': 'None',
            'Insurance Status': 'None',
            'Biggest Challenge': 'Rent increases',
            'Crime Incidents': 'None',
            'Infrastructure Disruptions': 'Electricity outages weekly',
            'Status': 'Active'
        }, locationData: { wardNo: 95, municName: 'City of Cape Town' } },
        { id: 'gary_fruit', label: "Uncle Gary's Fruits", type: 'trader', township: 'Mitchells Plain', x: 500, y: 250, r: 10, properties: {
            // Identity & Profile
            'Name': "Uncle Gary's Fruits",
            'Type': 'Fruit Vendor',
            'Township': 'Mitchells Plain',
            'Years Operating': '8 years',
            'Premises': 'Open-air stall at taxi rank (no structure)',
            'Employees': '0 (solo operator)',
            'Dependents': '5',
            'ID Verified': 'Yes',
            // Financial Behaviour
            'Bank Account': 'None (unbanked)',
            'Mobile Money': 'None',
            'Stokvel': 'Burial society — R150/month',
            'Existing Loans': 'Mashonisa loan R1,500 at 30%/month',
            'Savings Method': 'Cash under mattress',
            'Payment Methods': 'Cash only',
            // Stock & Product
            'Top Products': 'Bananas, Apples, Oranges, Avocados, Seasonal fruit',
            'Restock Frequency': 'Daily (perishable)',
            'Fastest Seller': 'Bananas',
            'Wanted But Unaffordable': 'Cooler box for summer (R600)',
            'Primary Supplier': 'Epping Fresh Produce Market',
            // Transaction Patterns
            'Turnover (Good Day)': 'R1,200',
            'Turnover (Bad Day)': 'R300',
            'Busiest Hours': '6–9am commuter rush',
            'Wholesaler Terms': 'Cash on delivery',
            'Monthly Turnover (Reconciled)': 'R18,000 ±25%',
            'Customers Per Day': '~50',
            // Location & Infrastructure
            'GPS': '-34.0475, 18.6287',
            'Ward': '81',
            'Water Supply': 'Communal tap (200m away)',
            'Electricity': 'None (no electricity)',
            'Distance to Wholesaler': '15km to market',
            'Restock Transport': 'Minibus taxi — R52 return',
            // Risk & Loss History
            'Previous Losses': 'Stock spoilage due to heat (~R200/week in summer)',
            'Insurance Status': 'None',
            'Biggest Challenge': 'No cold storage',
            'Crime Incidents': '2 theft incidents (2025)',
            'Infrastructure Disruptions': 'No water disruptions',
            'Status': 'Active'
        }, locationData: { wardNo: 81, municName: 'City of Cape Town' } },
        
        // Transport Routes (Minibus Taxis)
        { id: 'route_soweto_sandton', label: "Soweto-Sandton Taxi", type: 'route', township: 'Soweto', x: 180, y: 70, r: 8, properties: { 'Name': 'Soweto to Sandton Taxi Route', 'Type': 'Minibus Taxi', 'Return Fare': 60, 'Avg Wait Time': '25 mins', 'Passenger Volume': 'High', 'Daily Cash Velocity': 'R48,000.00' }, locationData: { wardNo: 15, municName: 'City of Johannesburg' } },
        { id: 'route_khayelitsha_ct', label: "Khayelitsha-CBD Taxi", type: 'route', township: 'Khayelitsha', x: 380, y: 70, r: 8, properties: { 'Name': 'Khayelitsha to Cape Town CBD Route', 'Type': 'Minibus Taxi', 'Return Fare': 55, 'Avg Wait Time': '20 mins', 'Passenger Volume': 'High', 'Daily Cash Velocity': 'R62,000.00' }, locationData: { wardNo: 95, municName: 'City of Cape Town' } },
        { id: 'route_tembisa_midrand', label: "Tembisa-Midrand Taxi", type: 'route', township: 'Tembisa', x: 300, y: 200, r: 8, properties: { 'Name': 'Tembisa to Midrand Taxi Route', 'Type': 'Minibus Taxi', 'Return Fare': 45, 'Avg Wait Time': '15 mins', 'Passenger Volume': 'Medium', 'Daily Cash Velocity': 'R35,000.00' }, locationData: { wardNo: 5, municName: 'City of Ekurhuleni' } },
        
        // Infrastructure Nodes
        { id: 'infra_soweto_water', label: "Soweto Water Main", type: 'infrastructure', township: 'Soweto', x: 100, y: 350, r: 8, properties: { 'Name': 'Soweto Ward 15 Water Pipeline', 'Type': 'Municipal Water Node', 'Location': 'Soweto Ward 15', 'Status': 'Operational', 'Pressure': 'Normal' }, locationData: { wardNo: 15, municName: 'City of Johannesburg' } },
        { id: 'infra_khayelitsha_water', label: "Khayelitsha Water Main", type: 'infrastructure', township: 'Khayelitsha', x: 420, y: 350, r: 8, properties: { 'Name': 'Khayelitsha Site C Water Main', 'Type': 'Municipal Water Node', 'Location': 'Khayelitsha Site C', 'Status': 'Operational', 'Pressure': 'Normal' }, locationData: { wardNo: 95, municName: 'City of Cape Town' } },

        // Wholesalers
        { id: 'whole_abattoir', label: "JHB Butchery Wholesaler", type: 'infrastructure', township: 'Soweto', x: 50, y: 80, r: 8, properties: { 'Name': 'Johannesburg Abattoir Meat Wholesalers', 'Type': 'Wholesale Supply Node', 'Primary Item': 'Raw Cow Heads', 'Unit Price': 'R80.00' }, locationData: { wardNo: 15, municName: 'City of Johannesburg' } },
        { id: 'whole_metro', label: "Metro Cash & Carry", type: 'infrastructure', township: 'Soweto', x: 320, y: 320, r: 8, properties: { 'Name': 'Metro Cash & Carry Wholesalers', 'Type': 'Wholesale Supply Node', 'Primary Item': 'Bulk Grocery Staples', 'Inflation Rate': '8.2% YTD' }, locationData: { wardNo: 15, municName: 'City of Johannesburg' } }
    ],
    links: [
        // Water dependencies
        { source: 'infra_soweto_water', target: 'mkhize_inhloko' },
        { source: 'infra_soweto_water', target: 'sizwe_spaza' },
        { source: 'infra_khayelitsha_water', target: 'nomsa_salon' },
        
        // Supply dependencies
        { source: 'whole_abattoir', target: 'mkhize_inhloko' },
        { source: 'whole_metro', target: 'sizwe_spaza' },
        
        // Transport dependencies (passengers get dropped near ranks where traders operate)
        { source: 'route_soweto_sandton', target: 'mkhize_inhloko' },
        { source: 'route_khayelitsha_ct', target: 'nomsa_salon' }
    ]
};

// Expanded State datasets for Spaza oil brands & Merchant POS terminal counts
const brandAuditData = {
    'Sunfoil': 14,
    'D\'lite': 11,
    'Excella': 7,
    'Generic/Other': 3,
    'Out of Stock': 1
};

const posCensusData = {
    'None': 18,
    'Yoco': 8,
    'iKhokha': 4,
    'Kazang': 3
};

// ============================================
// DATA-GAP EXPLORER: StatsSA SESE 2023 + FinScope MSME 2024
// ============================================
// Each sector object combines verified national data with constructed coverage estimates.
// The 'zone' field classifies each into opportunity/saturated/neutral for the scatter plot.

const sectorData = [
    {
        name: 'Trade & Retail',
        seseSector: 'Wholesale & Retail Trade',
        seseShare2023: 42.1,       // % of informal economy (SESE 2023)
        seseShare2017: 44.8,       // % of informal economy (SESE 2017)
        growthPP: -2.7,            // percentage point change 2017-2023
        coverageScore: 8.5,        // Constructed: 0-10 fintech/analytics product coverage
        finscopeOwners: 1200000,   // FinScope 2024 estimated owners
        finscopeEmployees: 2400000,
        jobMultiplier: 2.0,
        zone: 'saturated',
        color: 'rgba(255, 0, 127, 0.8)',
        namedProducts: 'Capitec, A2Pay, Yebo Fresh, Vuleka, Kazang, Nomanini',
        narrative: 'Most crowded vertical. Every fintech and bank targets spaza retail and informal trade. Growth is actually declining as formal chains (Shoprite, USave) expand into townships.'
    },
    {
        name: 'Community & Social Services',
        seseSector: 'Community, Social & Personal Services',
        seseShare2023: 18.4,
        seseShare2017: 15.8,
        growthPP: +2.6,
        coverageScore: 1.5,
        finscopeOwners: 350000,
        finscopeEmployees: 980000,
        jobMultiplier: 2.8,
        zone: 'opportunity',
        color: 'rgba(168, 85, 247, 0.9)',
        namedProducts: 'Almost none — no dedicated fintech or analytics product',
        narrative: 'Fastest-growing non-trade sector. Includes childcare, tutoring, elder care, community health workers, security. Massive unmet demand for scheduling, payments, and micro-insurance products.'
    },
    {
        name: 'Informal Finance & Business Services',
        seseSector: 'Finance, Insurance, Real Estate & Business Services',
        seseShare2023: 9.2,
        seseShare2017: 4.5,
        growthPP: +4.7,
        coverageScore: 2.0,
        finscopeOwners: 180000,
        finscopeEmployees: 360000,
        jobMultiplier: 2.0,
        zone: 'opportunity',
        color: 'rgba(168, 85, 247, 0.7)',
        namedProducts: 'Mashonisa digital tools (very early), some stokvel apps',
        narrative: 'Highest absolute growth. Includes informal lenders (mashonisas), stokvels, burial societies, and unregistered insurance. Nobody has built a compliant digital platform for this layer yet.'
    },
    {
        name: 'Construction',
        seseSector: 'Construction',
        seseShare2023: 8.1,
        seseShare2017: 10.3,
        growthPP: -2.2,
        coverageScore: 3.0,
        finscopeOwners: 250000,
        finscopeEmployees: 1200000,
        jobMultiplier: 4.8,
        zone: 'neutral',
        color: 'rgba(255, 184, 0, 0.7)',
        namedProducts: 'Some generic SME tools (Bridgement, Lulalend)',
        narrative: 'Declining sector share but extremely high job multiplier (4.8x). A single construction micro-enterprise employs nearly 5 people on average. Under-served by specific construction project management and payment tools.'
    },
    {
        name: 'Manufacturing',
        seseSector: 'Manufacturing',
        seseShare2023: 7.8,
        seseShare2017: 8.5,
        growthPP: -0.7,
        coverageScore: 2.5,
        finscopeOwners: 250000,
        finscopeEmployees: 2400000,
        jobMultiplier: 9.6,
        zone: 'neutral',
        color: 'rgba(255, 184, 0, 0.6)',
        namedProducts: 'Almost none specific to informal manufacturing',
        narrative: 'Highest job multiplier in the entire informal economy (9.6x per FinScope). 250k owners employ 2.4M workers. Invisible to most analytics because SESE counts owners only, not employees.'
    },
    {
        name: 'Transport & Logistics',
        seseSector: 'Transport, Storage & Communication',
        seseShare2023: 6.8,
        seseShare2017: 7.2,
        growthPP: -0.4,
        coverageScore: 5.0,
        finscopeOwners: 300000,
        finscopeEmployees: 900000,
        jobMultiplier: 3.0,
        zone: 'neutral',
        color: 'rgba(0, 242, 254, 0.6)',
        namedProducts: 'Fleetio, WhereIsMyTransport, some ride-hail (Bolt)',
        narrative: 'Moderate coverage from ride-hail and fleet analytics. But minibus taxi associations operate almost entirely outside digital systems — massive cash pools moving through opaque cooperatives.'
    },
    {
        name: 'Agriculture',
        seseSector: 'Agriculture, Hunting, Forestry & Fishing',
        seseShare2023: 3.2,
        seseShare2017: 4.5,
        growthPP: -1.3,
        coverageScore: 4.0,
        finscopeOwners: 200000,
        finscopeEmployees: 600000,
        jobMultiplier: 3.0,
        zone: 'neutral',
        color: 'rgba(0, 242, 254, 0.4)',
        namedProducts: 'Khula, Aerobotics (mostly formal), some NGO tools',
        narrative: 'Declining share. Most agri-fintech targets commercial farms, not subsistence or small-scale township/rural operations. Gap exists but market is shrinking.'
    }
];

// Selected SME Trader Profile state (Merchant Portal view)
const merchantProfile = {
    name: "Bab' uMkhize's Food",
    baseScore: 735,
    lendingLimit: 5000,
    logsCompleted: 3
};

// State Variables
let walletBalance = 25.00;
let activeScreen = 'home';
let activeTab = 'datagap';
let selectedNodeId = null;

// Chart references
let taxiChart, foodChart, cashChart, fmcgChart, posChart, dataGapBubbleChart;

// Dynamic destinations based on origin
const destinationMapping = {
    'Soweto': [
        { label: 'Sandton CBD (Return)', fare: 60 },
        { label: 'Johannesburg CBD (Return)', fare: 46 },
        { label: 'Rosebank CBD (Return)', fare: 52 }
    ],
    'Khayelitsha': [
        { label: 'Cape Town CBD (Return)', fare: 55 },
        { label: 'Bellville (Return)', fare: 48 },
        { label: 'Somerset West (Return)', fare: 58 }
    ],
    'Tembisa': [
        { label: 'Midrand CBD (Return)', fare: 45 },
        { label: 'Kempton Park (Return)', fare: 32 },
        { label: 'Pretoria East (Return)', fare: 65 }
    ],
    'Mitchells Plain': [
        { label: 'Cape Town CBD (Return)', fare: 52 },
        { label: 'Claremont (Return)', fare: 42 },
        { label: 'Epping Industrial (Return)', fare: 36 }
    ]
};

// Initialize Application
window.addEventListener('DOMContentLoaded', () => {
    // Set time on phone
    updatePhoneTime();
    setInterval(updatePhoneTime, 60000);
    
    // Set active destinations
    updateTaxiDestinations();
    
    // Draw initial charts
    initCharts();
    
    // Draw KasiOntology Graph
    drawOntologyGraph();
    
    // Initial listings & portals
    renderWaterList();
    renderPriceAdvisories();
    updateCreditScoreUI();

    // Data-Gap Explorer
    initDataGapBubbleChart();
    renderSectorCards();
    renderMultiplierBars();
});

// Update Simulated phone clock
function updatePhoneTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    document.getElementById('phone-time').innerText = `${hours}:${minutes}`;
}

// 2. Navigation Functions
function showScreen(screenId) {
    document.querySelectorAll('.pwa-screen').forEach(scr => scr.classList.remove('active'));
    document.getElementById(`screen-${screenId}`).classList.add('active');
    activeScreen = screenId;
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(cont => cont.classList.remove('active'));
    
    document.getElementById(`tab-${tabId}`).classList.add('active');
    document.getElementById(`content-${tabId}`).classList.add('active');
    activeTab = tabId;
    
    if (tabId === 'ontology') {
        // Redraw graph to match container width changes
        setTimeout(drawOntologyGraph, 100);
    } else if (tabId === 'wardmap') {
        // Initialize map if it doesn't exist yet
        setTimeout(() => {
            if (!wardMap) {
                initWardMap();
            }
        }, 100);
    } else if (tabId === 'profile') {
        setTimeout(renderProfileOutput, 100);
    }
}

// Dynamic dropdown update
function updateTaxiDestinations() {
    const origin = document.getElementById('taxi-township').value;
    const destSelect = document.getElementById('taxi-destination');
    destSelect.innerHTML = '';
    
    const options = destinationMapping[origin];
    options.forEach(opt => {
        const el = document.createElement('option');
        el.value = opt.label;
        el.innerText = `${opt.label} - R${opt.fare}`;
        destSelect.appendChild(el);
    });
    
    // Trigger fare sync
    updateFareField();
}

function updateFareField() {
    const origin = document.getElementById('taxi-township').value;
    const destLabel = document.getElementById('taxi-destination').value;
    const option = destinationMapping[origin].find(opt => opt.label === destLabel);
    if (option) {
        document.getElementById('taxi-fare').value = option.fare;
    }
}

document.getElementById('taxi-destination').addEventListener('change', updateFareField);

// Adjust Kasi SME form fields dynamically based on category
function toggleItemPlaceholders() {
    const type = document.getElementById('vendor-type').value;
    const lblCost = document.getElementById('label-supply-cost');
    const lblPrice = document.getElementById('label-retail-price');
    const helpCost = document.getElementById('help-supply-cost');
    const helpPrice = document.getElementById('help-retail-price');
    
    const costInput = document.getElementById('vendor-supply-cost');
    const retailInput = document.getElementById('vendor-retail-price');
    
    if (type.includes('Inhloko')) {
        lblCost.innerText = "Wholesale Supply Cost per Unit (Rands)";
        lblPrice.innerText = "Consumer Price per Portion (Rands)";
        helpCost.innerText = "Cost paid to abattoir per raw cow head";
        helpPrice.innerText = "Price charged to customer per plate of inhloko";
        costInput.value = 80;
        retailInput.value = 45;
    } else if (type === 'Spaza Shop') {
        lblCost.innerText = "Wholesale Maize Sack Cost (10kg)";
        lblPrice.innerText = "Retail Price per Maize Sack (10kg)";
        helpCost.innerText = "Wholesale cash-and-carry purchase price";
        helpPrice.innerText = "Final price sold to community shopper";
        costInput.value = 110;
        retailInput.value = 135;
    } else if (type === 'Hair Salon') {
        lblCost.innerText = "Wholesale Fibers / Hairpiece Cost";
        lblPrice.innerText = "Retail Service Price (Braid)";
        helpCost.innerText = "Material supply cost";
        helpPrice.innerText = "Final service wage charged to client";
        costInput.value = 40;
        retailInput.value = 120;
    } else { // Fruit
        lblCost.innerText = "Bulk Crate Purchase Cost";
        lblPrice.innerText = "Retail Price per Bag / Bowl";
        helpCost.innerText = "Cost paid at Joburg Fresh Food Market";
        helpPrice.innerText = "Price charged per batch sold at street rank";
        costInput.value = 120;
        retailInput.value = 15;
    }
}

// 3. Analytics Charts Initialization (Chart.js)
function initCharts() {
    // Chart 1: Minibus Taxi commute cost comparison
    const ctxTaxi = document.getElementById('chart-taxi').getContext('2d');
    taxiChart = new Chart(ctxTaxi, {
        type: 'bar',
        data: {
            labels: ['Soweto - Sandton', 'Khayelitsha - CBD', 'Tembisa - Midrand', 'Mitchells Plain - CBD'],
            datasets: [
                {
                    label: 'Pulse Live Commute Avg (Rands)',
                    data: [60, 55, 45, 52],
                    backgroundColor: 'rgba(0, 242, 254, 0.65)',
                    borderColor: 'rgba(0, 242, 254, 1)',
                    borderWidth: 1.5,
                    borderRadius: 6
                },
                {
                    label: 'Stats SA National Base Transit',
                    data: [22.50, 22.50, 22.50, 22.50],
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    type: 'line',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#f3f4f6', font: { family: 'Plus Jakarta Sans', size: 10 } } }
            },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans' } } },
                x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans' } } }
            }
        }
    });

    // Chart 2: Spaza Oil Brand Share (NEW)
    const ctxFmcg = document.getElementById('chart-fmcg-brand').getContext('2d');
    fmcgChart = new Chart(ctxFmcg, {
        type: 'doughnut',
        data: {
            labels: ['Sunfoil', 'D\'lite', 'Excella', 'Generic', 'OOS'],
            datasets: [{
                data: [14, 11, 7, 3, 1],
                backgroundColor: [
                    'rgba(255, 184, 0, 0.7)',
                    'rgba(255, 107, 53, 0.7)',
                    'rgba(0, 242, 254, 0.7)',
                    'rgba(168, 85, 247, 0.7)',
                    'rgba(255, 0, 127, 0.4)'
                ],
                borderColor: [
                    'rgba(255, 184, 0, 1)',
                    'rgba(255, 107, 53, 1)',
                    'rgba(0, 242, 254, 1)',
                    'rgba(168, 85, 247, 1)',
                    'rgba(255, 0, 127, 1)'
                ],
                borderWidth: 1.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            cutout: '60%'
        }
    });

    // Chart 3: POS Payment Terminal share (NEW)
    const ctxPos = document.getElementById('chart-pos-share').getContext('2d');
    posChart = new Chart(ctxPos, {
        type: 'bar',
        data: {
            labels: ['None (Cash Only)', 'Yoco', 'iKhokha', 'Kazang'],
            datasets: [{
                label: 'Log Count',
                data: [18, 8, 4, 3],
                backgroundColor: [
                    'rgba(255, 255, 255, 0.1)',
                    'rgba(0, 242, 254, 0.7)',
                    'rgba(255, 184, 0, 0.7)',
                    'rgba(168, 85, 247, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 255, 255, 0.3)',
                    'rgba(0, 242, 254, 1)',
                    'rgba(255, 184, 0, 1)',
                    'rgba(168, 85, 247, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#9ca3af', font: { size: 9 } } },
                y: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 9 } } }
            }
        }
    });

    // Chart 4: Kasi Food Inflation Index
    const ctxFood = document.getElementById('chart-food-inflation').getContext('2d');
    foodChart = new Chart(ctxFood, {
        type: 'line',
        data: {
            labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Live'],
            datasets: [{
                label: 'Trader Profit Margins (%)',
                data: [35, 34.2, 33, 31.8, 30.5, 31.2],
                borderColor: 'rgba(255, 107, 53, 1)',
                backgroundColor: 'rgba(255, 107, 53, 0.15)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#9ca3af', font: { size: 9 } } },
                x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 9 } } }
            }
        }
    });

    // Chart 5: Cash vs Digital velocity
    const ctxCash = document.getElementById('chart-cash-velocity').getContext('2d');
    cashChart = new Chart(ctxCash, {
        type: 'doughnut',
        data: {
            labels: ['Cash', 'Digital/E-Wallet'],
            datasets: [{
                data: [64.5, 35.5],
                backgroundColor: ['rgba(255, 184, 0, 0.7)', 'rgba(0, 242, 254, 0.7)'],
                borderColor: ['rgba(255, 184, 0, 1)', 'rgba(0, 242, 254, 1)'],
                borderWidth: 1.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            cutout: '70%'
        }
    });
}

// 4. Update Calculations & Refresh Charts
function recalculateDashboard() {
    // 1. Calculate Average Taxi Fares
    const taxiNodes = ontologyData.nodes.filter(n => n.type === 'route');
    const avgFare = taxiNodes.reduce((sum, n) => sum + n.properties['Return Fare'], 0) / taxiNodes.length;
    document.getElementById('text-avg-fare').innerText = `R${avgFare.toFixed(2)}`;
    
    // Update Taxi Chart data
    taxiChart.data.datasets[0].data = taxiNodes.map(n => n.properties['Return Fare']);
    taxiChart.update();

    // 2. Refresh Spaza Oil brand share (Pie Chart)
    const brandLabels = Object.keys(brandAuditData);
    const brandCounts = Object.values(brandAuditData);
    fmcgChart.data.datasets[0].data = brandCounts;
    fmcgChart.update();
    
    // Determine top brand dynamically
    let topBrand = 'Sunfoil';
    let maxCount = 0;
    Object.entries(brandAuditData).forEach(([b, count]) => {
        if (count > maxCount && b !== 'Out of Stock') {
            maxCount = count;
            topBrand = b;
        }
    });
    document.getElementById('text-top-brand').innerText = topBrand;

    // 3. Refresh POS payment terminal distribution
    const posCounts = Object.values(posCensusData);
    posChart.data.datasets[0].data = posCounts;
    posChart.update();
    
    // Calculate POS percentages
    const totalMerchants = Object.values(posCensusData).reduce((sum, v) => sum + v, 0);
    const cashMerchants = posCensusData['None'];
    const posMerchants = totalMerchants - cashMerchants;
    const cashPct = totalMerchants > 0 ? (cashMerchants / totalMerchants * 100) : 55;
    const posPct = 100 - cashPct;
    
    document.getElementById('val-cash-dominance').innerText = `${cashPct.toFixed(1)}%`;
    document.getElementById('val-pos-penetration').innerText = `${posPct.toFixed(1)}%`;

    // 4. Calculate average profit margins of traders
    const traders = ontologyData.nodes.filter(n => n.type === 'trader' && n.properties['Status'] === 'Active');
    let totalMargin = 0;
    let totalVendors = 0;
    traders.forEach(t => {
        let marginStr = t.properties['Margin'];
        if (marginStr) {
            let marginVal = parseFloat(marginStr.replace('%', ''));
            totalMargin += marginVal;
            totalVendors++;
        }
    });
    const avgMargin = totalVendors > 0 ? (totalMargin / totalVendors) : 0;
    document.getElementById('text-margin').innerText = `${avgMargin.toFixed(1)}%`;
    
    // Update Food inflation chart (last element represents live avg)
    foodChart.data.datasets[0].data[5] = parseFloat(avgMargin.toFixed(1));
    foodChart.update();

    // 5. Cash vs Digital percentages
    let cashCount = 0;
    let digitalCount = 0;
    traders.forEach(t => {
        const mode = t.properties['Payments'];
        if (mode.includes('Cash Only')) {
            cashCount += 1.0;
        } else if (mode.includes('Mostly Cash')) {
            cashCount += 0.7;
            digitalCount += 0.3;
        } else { // Mostly Digital
            cashCount += 0.2;
            digitalCount += 0.8;
        }
    });
    const totalTransactions = cashCount + digitalCount;
    const cashVelocityPct = totalTransactions > 0 ? (cashCount / totalTransactions * 100) : 64.5;
    const digVelocityPct = 100 - cashVelocityPct;
    
    document.getElementById('val-pure-cash').innerText = `${cashVelocityPct.toFixed(1)}%`;
    document.getElementById('val-digital').innerText = `${digVelocityPct.toFixed(1)}%`;
    
    cashChart.data.datasets[0].data = [cashVelocityPct, digVelocityPct];
    cashChart.update();

    // 6. Outages
    renderWaterList();
}

function renderWaterList() {
    const list = document.getElementById('water-list');
    list.innerHTML = '';
    
    const waterNodes = ontologyData.nodes.filter(n => n.id.includes('infra_') && n.id.includes('water'));
    let activeCuts = 0;
    
    waterNodes.forEach(node => {
        const isBroken = node.properties['Status'] === 'Broken / Water Outage';
        if (isBroken) activeCuts++;
        
        const row = document.createElement('div');
        row.className = 'water-outage-row';
        row.innerHTML = `
            <span class="name">${node.properties['Location']}</span>
            <span class="duration">${node.properties['Status']}</span>
            <span class="status-dot ${isBroken ? 'active' : 'clear'}"></span>
        `;
        list.appendChild(row);
    });
    
    document.getElementById('active-water-cuts').innerText = `${activeCuts} Wards`;
}

// 5. Submit Survey Handlers
function submitTaxiSurvey(event) {
    event.preventDefault();
    
    const origin = document.getElementById('taxi-township').value;
    const dest = document.getElementById('taxi-destination').value;
    const fare = parseFloat(document.getElementById('taxi-fare').value);
    
    // Find matching route node
    const route = ontologyData.nodes.find(n => n.type === 'route' && n.township === origin);
    if (route) {
        route.properties['Return Fare'] = fare;
        route.properties['Avg Wait Time'] = `${document.getElementById('taxi-wait').value} mins`;
        route.properties['Name'] = `${origin} to ${dest}`;
    }
    
    // Reward payout
    addRewards(5.00, `Logged commute fare: ${origin} to ${dest}`);
    
    // Recalculate
    recalculateDashboard();
    
    // Update graph representation
    drawOntologyGraph();
    
    // Reset & return
    document.getElementById('form-taxi').reset();
    showScreen('home');
}

function submitVendorSurvey(event) {
    event.preventDefault();
    
    const name = document.getElementById('vendor-name').value;
    const township = document.getElementById('vendor-township').value;
    const type = document.getElementById('vendor-type').value;
    const cost = parseFloat(document.getElementById('vendor-supply-cost').value);
    const retail = parseFloat(document.getElementById('vendor-retail-price').value);
    const payMode = document.getElementById('vendor-payments').value;
    
    const hasWaterOutage = document.querySelector('input[name="vendor-water"]:checked').value === 'Yes';
    
    // Calculate Margin
    const margin = ((retail - cost) / retail * 100).toFixed(1) + '%';
    
    // Check if vendor already exists or create new node
    let vendor = ontologyData.nodes.find(n => n.type === 'trader' && n.properties['Name'] === name);
    
    if (!vendor) {
        // Create new node dynamically
        const id = 'vendor_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const nodeX = 150 + Math.random() * 300;
        const nodeY = 100 + Math.random() * 200;
        
        vendor = {
            id: id,
            label: name.split(' ')[0],
            type: 'trader',
            township: township,
            x: nodeX,
            y: nodeY,
            r: 10,
            properties: {
                'Name': name,
                'Type': type,
                'Township': township,
                'Daily Turnover': 'R1,800.00', // Mock baseline
                'Wholesale Price': `R${cost.toFixed(2)}`,
                'Consumer Price': `R${retail.toFixed(2)}`,
                'Margin': margin,
                'Payments': payMode,
                'Water Cut': hasWaterOutage ? 'Yes' : 'No',
                'Status': hasWaterOutage ? 'Disabled' : 'Active',
                'POS Device': 'None'
            }
        };
        
        ontologyData.nodes.push(vendor);
        
        // Link to nearest water pipeline
        const waterNode = ontologyData.nodes.find(n => n.type === 'infrastructure' && n.township === township && n.id.includes('water'));
        if (waterNode) {
            ontologyData.links.push({ source: waterNode.id, target: id });
        }
    } else {
        // Update properties
        vendor.properties['Wholesale Price'] = `R${cost.toFixed(2)}`;
        vendor.properties['Consumer Price'] = `R${retail.toFixed(2)}`;
        vendor.properties['Margin'] = margin;
        vendor.properties['Payments'] = payMode;
        vendor.properties['Water Cut'] = hasWaterOutage ? 'Yes' : 'No';
        if (hasWaterOutage) {
            vendor.properties['Status'] = 'Disabled';
        } else {
            // Check if global infrastructure node is broken before reactivating
            const waterLink = ontologyData.links.find(l => l.target === vendor.id && l.source.includes('water'));
            const parentWater = waterLink ? ontologyData.nodes.find(n => n.id === waterLink.source) : null;
            if (parentWater && parentWater.properties['Status'] === 'Broken / Water Outage') {
                vendor.properties['Status'] = 'Disabled';
            } else {
                vendor.properties['Status'] = 'Active';
            }
        }
    }
    
    // Reward payout
    addRewards(15.00, `Logged Kasi SME: ${name}`);
    
    // SME Portal state updates: Completed vendor log increases Bab' uMkhize's credit score
    if (name.includes('Mkhize')) {
        merchantProfile.logsCompleted++;
        merchantProfile.baseScore = Math.min(845, 735 + (merchantProfile.logsCompleted - 3) * 15);
        merchantProfile.lendingLimit = 5000 + (merchantProfile.logsCompleted - 3) * 1500;
        updateCreditScoreUI();
    }
    
    // Recalculate
    recalculateDashboard();
    
    // Rerun simulation to see ripple effects
    runSimulation();
    
    // Redraw Graph
    drawOntologyGraph();
    
    // Reset Form & Return
    document.getElementById('form-vendor').reset();
    showScreen('home');
}

// Brand Survey Handler (NEW)
function submitBrandSurvey(event) {
    event.preventDefault();
    
    const brand = document.getElementById('fmcg-oil-brand').value;
    const price = parseFloat(document.getElementById('fmcg-oil-price').value);
    const spazaName = document.getElementById('fmcg-spaza-name').value;
    const township = document.getElementById('fmcg-township').value;
    
    // Update local state datasets
    if (brandAuditData[brand] !== undefined) {
        brandAuditData[brand]++;
    } else {
        brandAuditData['Generic/Other']++;
    }
    
    // Find spaza node in ontology and append/update Top Brand property
    const spazaNode = ontologyData.nodes.find(n => n.type === 'trader' && n.properties['Name'].toLowerCase().includes(spazaName.toLowerCase()));
    if (spazaNode) {
        spazaNode.properties['Top Oil Brand'] = brand;
        spazaNode.properties['Oil Price (2L)'] = `R${price.toFixed(2)}`;
    }
    
    // Reward payout
    addRewards(10.00, `Audit Spaza Brand: ${brand} in ${spazaName}`);
    
    // Recalculate dashboard & charts
    recalculateDashboard();
    
    // Reset Form & Return
    document.getElementById('form-fmcg').reset();
    showScreen('home');
}

// POS Survey Handler (NEW)
function submitPosSurvey(event) {
    event.preventDefault();
    
    const brand = document.getElementById('pos-terminal-brand').value;
    const vendorName = document.getElementById('pos-vendor-name').value;
    const township = document.getElementById('pos-township').value;
    
    // Update datasets
    if (posCensusData[brand] !== undefined) {
        posCensusData[brand]++;
    } else {
        posCensusData['None']++;
    }
    
    // Update matching merchant's POS property and payment modes
    const vendor = ontologyData.nodes.find(n => n.type === 'trader' && n.properties['Name'].toLowerCase().includes(vendorName.toLowerCase()));
    if (vendor) {
        vendor.properties['POS Device'] = brand;
        if (brand !== 'None') {
            vendor.properties['Payments'] = brand === 'Yoco' ? 'Mixed (Mostly Digital)' : 'Mixed (Mostly Cash)';
        } else {
            vendor.properties['Payments'] = 'Cash Only';
        }
    }
    
    // Reward payout
    addRewards(5.00, `POS Census: ${brand} at ${vendorName}`);
    
    // Recalculate & redraw
    recalculateDashboard();
    drawOntologyGraph();
    
    // Reset Form & Return
    document.getElementById('form-pos').reset();
    showScreen('home');
}

function submitWaterSurvey(event) {
    event.preventDefault();
    
    const township = document.getElementById('water-township').value;
    const duration = document.getElementById('water-duration').value;
    
    // --- GLOBAL STATE RIPPLE ---
    globalState.activeEvents.push(`water_cut_${township.toLowerCase()}`);
    
    // Find matching water node
    const waterNode = ontologyData.nodes.find(n => n.type === 'infrastructure' && n.township === township && n.id.includes('water'));
    let affectedWardNo = null;
    let affectedMunicipality = null;

    if (waterNode) {
        waterNode.properties['Status'] = 'Broken / Water Outage';
        waterNode.properties['Pressure'] = 'Zero Bar';
        if (waterNode.locationData) {
            affectedWardNo = waterNode.locationData.wardNo;
            affectedMunicipality = waterNode.locationData.municName;
        }
    }
    
    // Disable all traders connected to this water node
    const affectedLinks = ontologyData.links.filter(l => l.source === waterNode?.id);
    affectedLinks.forEach(l => {
        const targetNode = ontologyData.nodes.find(n => n.id === l.target);
        if (targetNode) {
            targetNode.properties['Status'] = 'Disabled';
            targetNode.properties['Water Cut'] = 'Yes';
        }
    });

    // Reward payout
    addRewards(2.00, `Reported Water Cut in ${township}`);
    
    // Recalculate
    recalculateDashboard();
    
    // Sync dashboard Simulator values if needed
    if (document.getElementById('sim-water-location').value === township || document.getElementById('sim-water-location').value === 'All') {
        document.getElementById('sim-water-outage').checked = true;
    }
    
    // Rerun simulation calculations
    runSimulation();
    
    // Redraw graph
    drawOntologyGraph();
    
    // Ripple to Ward Map: If map is loaded, flash the affected ward red
    if (wardMap && wardGeoLayer && affectedWardNo) {
        wardGeoLayer.eachLayer(function(layer) {
            if (layer.feature.properties.WardNo === affectedWardNo) {
                layer.setStyle({
                    fillColor: '#ff4444',
                    fillOpacity: 0.8,
                    color: '#ff0000',
                    weight: 3
                });
                layer.bindTooltip("CRITICAL: Water Infrastructure Offline", {permanent: true, direction: "top", className: "danger-tooltip"}).openTooltip();
            }
        });
    }
    
    // Ripple to Macro Data Gap: Flash the macro chart
    flashMacroChart();

    // Reset & Return
    document.getElementById('form-water').reset();
    showScreen('home');
}

// 6. Wallet Rewards & CashOuts
function addRewards(amount, description) {
    walletBalance += amount;
    document.getElementById('pwa-balance').innerText = walletBalance.toFixed(2);
    document.getElementById('wallet-balance-display').innerText = walletBalance.toFixed(2);
    
    // Append history
    const history = document.getElementById('earning-history');
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
        <div class="item-desc">${description}</div>
        <div class="item-amt positive">+R${amount.toFixed(2)}</div>
    `;
    history.insertBefore(item, history.firstChild);
    
    // Trigger SMS notification
    showSMSNotification("Pulse Rewards", `Awe! You earned R${amount.toFixed(2)} for survey: "${description.substring(0,25)}...". Redeemed to your in-app wallet balance.`);
}

function simulateWithdrawal(type) {
    if (walletBalance <= 0) {
        showSMSNotification("Pulse Balance", "Eish! Your balance is R0.00. Complete some gigs to earn.");
        return;
    }
    
    const amount = walletBalance;
    walletBalance = 0;
    document.getElementById('pwa-balance').innerText = '0.00';
    document.getElementById('wallet-balance-display').innerText = '0.00';
    
    // Append negative history item
    const history = document.getElementById('earning-history');
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
        <div class="item-desc">Withdrawal via ${type}</div>
        <div class="item-amt negative">-R${amount.toFixed(2)}</div>
    `;
    history.insertBefore(item, history.firstChild);
    
    // Withdrawal SMS Toast
    if (type === 'Airtime') {
        showSMSNotification("MTN Payout", `Y'ello! R${amount.toFixed(2)} airtime recharge successful. Ref: PULSE-${Math.floor(1000 + Math.random()*9000)}. Sharp sharp for using Pulse SA!`, true);
    } else {
        showSMSNotification("Capitec CashSend", `Capitec CashSend: You have successfully sent R${amount.toFixed(2)}. Use Code: *120*321# and PIN: 4589 to withdraw cash at any ATM.`, true);
    }
    
    showScreen('home');
}

function showSMSNotification(sender, message, isPayout = false) {
    const wrapper = document.getElementById('sms-wrapper');
    const now = new Date();
    let min = now.getMinutes();
    min = min < 10 ? '0' + min : min;
    
    const toast = document.createElement('div');
    toast.className = `sms-toast ${isPayout ? 'payout' : ''}`;
    toast.innerHTML = `
        <div class="sms-header">
            <span class="sms-sender"><i class="fa-solid fa-message"></i> ${sender}</span>
            <span>Just Now</span>
        </div>
        <div class="sms-body">${message}</div>
    `;
    
    wrapper.appendChild(toast);
    
    // Remove after 6 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 6000);
}

// 7. SME Merchant Portal Rendering
function updateCreditScoreUI() {
    const score = merchantProfile.baseScore;
    document.getElementById('credit-score-num').innerText = score;
    document.getElementById('merchant-name-display').innerText = merchantProfile.name;
    
    const ratingText = document.querySelector('.score-rating');
    const circle = document.getElementById('credit-circle');
    
    // Calculate circle dashoffset
    // Radius is 28, Circumference = 2 * PI * 28 = 175.9
    // Score range 300 to 850 (range size = 550)
    const pct = Math.max(0, Math.min(1, (score - 300) / 550));
    const offset = 175 - (pct * 175);
    circle.style.strokeDashoffset = offset;
    
    if (score >= 720) {
        ratingText.innerText = "Vetted (Excellent Risk)";
        ratingText.className = "score-rating text-blue";
        circle.style.stroke = "var(--accent-teal)";
    } else if (score >= 650) {
        ratingText.innerText = "Vetted (Low Risk)";
        ratingText.className = "score-rating text-gold";
        circle.style.stroke = "var(--accent-gold)";
    } else {
        ratingText.innerText = "Borderline Risk";
        ratingText.className = "score-rating text-orange";
        circle.style.stroke = "var(--accent-orange)";
    }
    
    // Update Underwriting Verification Badges based on logs completed
    const invoiceMatch = Math.min(99, 90 + (merchantProfile.logsCompleted - 3) * 3);
    const trafficMatch = Math.min(98, 82 + (merchantProfile.logsCompleted - 3) * 4);
    let trustClass = "B (Medium Trust)";
    if (score >= 750) trustClass = "A+ (Excellent Trust)";
    else if (score >= 720) trustClass = "A (High Trust)";

    document.getElementById('val-audit-invoice').innerText = `${invoiceMatch}% Match`;
    document.getElementById('val-audit-traffic').innerText = `${trafficMatch}% Verified`;
    document.getElementById('val-audit-trust').innerText = trustClass;

    // Display stock loan limit
    document.querySelector('.loan-amount').innerText = `R${merchantProfile.lendingLimit.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
}

function renderPriceAdvisories() {
    const container = document.getElementById('merchant-advisories');
    container.innerHTML = '';
    
    // Baseline advisories
    const advisories = [
        {
            title: "Bulk Maize Saving Opportunity",
            desc: "Save on supplies: Metro Cash & Carry (Ward 15) is selling 10kg Maize Meal for R110 this week. Group orders are open to save on delivery.",
            type: "saving"
        },
        {
            title: "Fuel Inflation Warning",
            desc: "LPG Gas refills logged up R2.50 per kg at Sandton Rank depot. Recommend switching to Metro wholesale depot to secure bulk pricing.",
            type: "warning"
        }
    ];
    
    advisories.forEach(adv => {
        const card = document.createElement('div');
        card.className = `advisory-card ${adv.type}`;
        card.innerHTML = `
            <strong>${adv.title}</strong>
            <p>${adv.desc}</p>
        `;
        container.appendChild(card);
    });
}

// 8. Graph Rendering (SVG Canvas)
function inspectWardInOntology(wardNo, municName) {
    globalState.selectedLocation = { wardNo, municName };
    switchTab('ontology');
    drawOntologyGraph();
}

function viewNodeOnMap(wardNo, municName) {
    switchTab('wardmap');
    const queryClause = `MUNICNAME='${municName}'`;
    document.getElementById('metro-selector').value = queryClause;
    loadMetroWards(queryClause, wardNo);
}

function clearOntologyFilter() {
    globalState.selectedLocation = null;
    drawOntologyGraph();
}

function drawOntologyGraph() {
    const svg = document.getElementById('ontology-graph');
    if (!svg) return;
    svg.innerHTML = '';
    
    // Add Filter Badge if active
    if (globalState.selectedLocation) {
        const badge = document.createElementNS("http://www.w3.org/2000/svg", "text");
        badge.setAttribute("x", 20);
        badge.setAttribute("y", 20);
        badge.setAttribute("fill", "var(--accent-teal)");
        badge.setAttribute("font-size", "12px");
        badge.setAttribute("font-family", "sans-serif");
        badge.textContent = `[ Filter Active: Ward ${globalState.selectedLocation.wardNo} (${globalState.selectedLocation.municName}) ]  Click here to clear`;
        badge.setAttribute("cursor", "pointer");
        badge.setAttribute("onclick", "clearOntologyFilter()");
        svg.appendChild(badge);
    }
    
    // Add Marker definition for arrows
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
        <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.2)" />
        </marker>
        <marker id="arrow-risk" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ff007f" />
        </marker>
    `;
    svg.appendChild(defs);
    
    // 1. Draw Links (Edges)
    ontologyData.links.forEach(link => {
        const sourceNode = ontologyData.nodes.find(n => n.id === link.source);
        const targetNode = ontologyData.nodes.find(n => n.id === link.target);
        
        if (sourceNode && targetNode) {
            // Filter logic for links
            let opacity = 0.6;
            if (globalState.selectedLocation) {
                const sLoc = sourceNode.locationData;
                const tLoc = targetNode.locationData;
                const sMatch = sLoc && sLoc.wardNo === globalState.selectedLocation.wardNo && sLoc.municName === globalState.selectedLocation.municName;
                const tMatch = tLoc && tLoc.wardNo === globalState.selectedLocation.wardNo && tLoc.municName === globalState.selectedLocation.municName;
                if (!sMatch && !tMatch) opacity = 0.1;
            }

            const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
            
            // Draw path straight line
            const d = `M ${sourceNode.x} ${sourceNode.y} L ${targetNode.x} ${targetNode.y}`;
            line.setAttribute("d", d);
            line.style.opacity = opacity;
            
            // Check if parent node is in risk status (Broken water pipeline)
            const parentRisk = sourceNode.properties['Status'] === 'Broken / Water Outage';
            if (parentRisk) {
                line.setAttribute("class", "node-link active-risk");
                line.setAttribute("marker-end", "url(#arrow-risk)");
            } else {
                line.setAttribute("class", "node-link");
                line.setAttribute("marker-end", "url(#arrow)");
            }
            
            svg.appendChild(line);
        }
    });
    
    // 2. Draw Nodes (Vertices)
    ontologyData.nodes.forEach(node => {
        // Filter logic based on globalState
        let opacity = 1.0;
        if (globalState.selectedLocation && node.locationData) {
            if (node.locationData.wardNo !== globalState.selectedLocation.wardNo || 
                node.locationData.municName !== globalState.selectedLocation.municName) {
                opacity = 0.15; // Fade out nodes not in the selected ward
            }
        } else if (globalState.selectedLocation) {
            opacity = 0.15; // Fade out nodes without location data if a filter is active
        }

        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("class", "node-circle");
        g.setAttribute("onclick", `selectNode('${node.id}')`);
        g.style.opacity = opacity;
        
        // Outer glow/ring if selected or warning
        const outerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        outerCircle.setAttribute("cx", node.x);
        outerCircle.setAttribute("cy", node.y);
        
        const isSelected = selectedNodeId === node.id;
        const isDisabled = node.properties['Status'] === 'Disabled' || node.properties['Status'] === 'Broken / Water Outage';
        
        if (isSelected) {
            outerCircle.setAttribute("r", node.r + 6);
            outerCircle.setAttribute("fill", "transparent");
            outerCircle.setAttribute("stroke", "var(--accent-gold)");
            outerCircle.setAttribute("stroke-width", "2");
            outerCircle.setAttribute("stroke-dasharray", "3 2");
            g.appendChild(outerCircle);
        } else if (isDisabled) {
            outerCircle.setAttribute("r", node.r + 4);
            outerCircle.setAttribute("fill", "rgba(255, 0, 127, 0.15)");
            outerCircle.setAttribute("stroke", "var(--accent-crimson)");
            outerCircle.setAttribute("stroke-width", "1");
            g.appendChild(outerCircle);
        }
        
        // Inner Circle Node
        const innerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        innerCircle.setAttribute("cx", node.x);
        innerCircle.setAttribute("cy", node.y);
        innerCircle.setAttribute("r", node.r);
        
        // Set colors based on type
        let color = '#fff';
        if (node.type === 'trader') color = 'var(--accent-orange)';
        else if (node.type === 'route') color = 'var(--accent-gold)';
        else if (node.type === 'infrastructure') color = 'var(--accent-teal)';
        
        if (isDisabled) color = 'var(--accent-crimson)';
        
        innerCircle.setAttribute("fill", color);
        g.appendChild(innerCircle);
        
        // Node Text Labels
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", node.x);
        text.setAttribute("y", node.y + node.r + 14);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("class", "node-label");
        
        if (isSelected) {
            text.setAttribute("fill", "#fff");
            text.setAttribute("font-weight", "700");
        }
        
        text.textContent = node.label;
        g.appendChild(text);
        
        svg.appendChild(g);
    });
}

function selectNode(nodeId) {
    selectedNodeId = nodeId;
    
    // Redraw graph highlighting selected
    drawOntologyGraph();
    
    // Open Inspector details
    const node = ontologyData.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    document.getElementById('inspector-empty').classList.add('hidden');
    const details = document.getElementById('inspector-details');
    details.classList.remove('hidden');
    
    document.getElementById('inspect-node-title').innerText = node.properties['Name'] || node.label;
    
    const typeTag = document.getElementById('inspect-node-type');
    typeTag.innerText = node.properties['Type'] || node.type;
    typeTag.className = `node-type-tag ${node.type}`;
    
    // Properties Table
    const propBody = document.getElementById('inspect-properties');
    propBody.innerHTML = '';
    
    Object.entries(node.properties).forEach(([key, val]) => {
        let actionHTML = '';
        if ((key === 'Township' || key === 'Location') && node.locationData) {
            actionHTML = `<br><button onclick="viewNodeOnMap(${node.locationData.wardNo}, '${node.locationData.municName.replace(/'/g, "\\'")}')" style="margin-top: 4px; background: rgba(0, 242, 254, 0.2); color: var(--accent-teal); border: 1px solid var(--accent-teal); padding: 4px 8px; border-radius: 4px; font-size: 0.65rem; cursor: pointer;"><i class="fa-solid fa-map-location-dot"></i> View on Map</button>`;
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${key}</td>
            <td>${val} ${actionHTML}</td>
        `;
        propBody.appendChild(row);
    });
    
    // Render Relations
    const relContainer = document.getElementById('inspect-relations');
    relContainer.innerHTML = '';
    
    // Outbound connections
    const outLinks = ontologyData.links.filter(l => l.source === nodeId);
    outLinks.forEach(link => {
        const target = ontologyData.nodes.find(n => n.id === link.target);
        if (target) {
            const item = document.createElement('div');
            item.className = 'relation-item';
            item.innerHTML = `
                <strong>Feeds/Supplies</strong>
                <span>${target.label}</span>
            `;
            relContainer.appendChild(item);
        }
    });
    
    // Inbound connections
    const inLinks = ontologyData.links.filter(l => l.target === nodeId);
    inLinks.forEach(link => {
        const source = ontologyData.nodes.find(n => n.id === link.source);
        if (source) {
            const item = document.createElement('div');
            item.className = 'relation-item';
            item.innerHTML = `
                <strong>Depends On</strong>
                <span>${source.label}</span>
            `;
            relContainer.appendChild(item);
        }
    });
    
    if (outLinks.length === 0 && inLinks.length === 0) {
        relContainer.innerHTML = '<span class="relation-item">No direct structural dependencies</span>';
    }
    
    // Risk Inspector Box
    const riskBox = document.getElementById('inspect-risk-box');
    const riskText = document.getElementById('inspect-risk-text');
    
    const isBroken = node.properties['Status'] === 'Disabled' || node.properties['Status'] === 'Broken / Water Outage';
    if (isBroken) {
        riskBox.className = 'detail-section risk-card active-alert';
        if (node.type === 'trader') {
            riskText.innerText = "CRITICAL: This informal business is SHUT DOWN due to localized water infrastructure failure. Daily Kasi GDP loss estimated at " + node.properties['Daily Turnover'] + ".";
        } else {
            riskText.innerText = "CRITICAL FAILURE: Pipeline ruptured or supply closed. Extinguishing pressure downstream and shutting down connected informal micro-SMEs.";
        }
    } else {
        riskBox.className = 'detail-section risk-card';
        riskText.innerText = "No active risk markers detected. Operations and cash velocity normal.";
    }
}

// 9. Kasi Impact Simulator Calculations
function runSimulation() {
    const isWaterOutage = document.getElementById('sim-water-outage').checked;
    const targetLoc = document.getElementById('sim-water-location').value;
    const fareHikePct = parseInt(document.getElementById('sim-taxi-hike').value);
    
    let disabledTradersCount = 0;
    let cashAtRisk = 0;
    
    // 1. Reset node active statuses in memory
    ontologyData.nodes.forEach(node => {
        if (node.type === 'trader') {
            // Reset base state
            node.properties['Status'] = node.properties['Water Cut'] === 'Yes' ? 'Disabled' : 'Active';
        }
        if (node.type === 'infrastructure' && node.id.includes('water')) {
            node.properties['Status'] = 'Operational';
        }
    });
    
    // 2. Apply Water Outage shock
    if (isWaterOutage) {
        ontologyData.nodes.forEach(node => {
            if (node.type === 'infrastructure' && node.id.includes('water')) {
                if (targetLoc === 'All' || node.township === targetLoc) {
                    node.properties['Status'] = 'Broken / Water Outage';
                    
                    // Disable all connected traders
                    const links = ontologyData.links.filter(l => l.source === node.id);
                    links.forEach(link => {
                        const trader = ontologyData.nodes.find(n => n.id === link.target);
                        if (trader) {
                            trader.properties['Status'] = 'Disabled';
                        }
                    });
                }
            }
        });
    }
    
    // 3. Apply Taxi Fare Hike shock to route nodes
    ontologyData.nodes.forEach(node => {
        if (node.type === 'route') {
            // Apply percentage hike
            const baseFare = node.id === 'route_soweto_sandton' ? 60 : (node.id === 'route_khayelitsha_ct' ? 55 : 45);
            const hikeAmt = baseFare * (fareHikePct / 100);
            node.properties['Return Fare'] = baseFare + hikeAmt;
        }
    });

    // 4. Calculate final outcome statistics
    ontologyData.nodes.forEach(node => {
        if (node.type === 'trader' && node.properties['Status'] === 'Disabled') {
            disabledTradersCount++;
            const turnover = parseFloat(node.properties['Daily Turnover'].replace('R', '').replace(',', ''));
            cashAtRisk += turnover;
        }
    });
    
    // 5. Update outcome UI cards
    const cardTraders = document.getElementById('out-traders');
    const cardCash = document.getElementById('out-cash');
    const cardCommute = document.getElementById('out-commute');
    
    cardTraders.querySelector('.val').innerText = disabledTradersCount;
    cardCash.querySelector('.val').innerText = `R${cashAtRisk.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    cardCommute.querySelector('.val').innerText = `${fareHikePct}%`;
    
    // Toggle warning states on cards
    if (disabledTradersCount > 0) {
        cardTraders.classList.add('active-risk');
        cardCash.classList.add('active-risk');
    } else {
        cardTraders.classList.remove('active-risk');
        cardCash.classList.remove('active-risk');
    }
    
    if (fareHikePct > 0) {
        cardCommute.classList.add('active-risk');
    } else {
        cardCommute.classList.remove('active-risk');
    }
    
    // Simulation Status Alert Box Text
    const alertBox = document.getElementById('out-alert');
    const alertText = document.getElementById('out-alert-text');
    
    if (isWaterOutage || fareHikePct > 0) {
        alertBox.className = 'outcome-card double-width active-alert';
        let report = `CRITICAL ALERT: Dynamic Township Ontology indicates active economic degradation. `;
        if (isWaterOutage) {
            report += `Water outage in ${targetLoc === 'All' ? 'multiple wards' : targetLoc} has paralyzed ${disabledTradersCount} cash-intensive SME traders, locking out R${cashAtRisk.toLocaleString()} of daily purchasing flow. `;
        }
        if (fareHikePct > 0) {
            report += `A taxi fare spike of ${fareHikePct}% increases commuting costs for entry-level workseekers by roughly R10-R20 daily, severely driving up labor market discouragement (NEET rates) in mapped spatial sectors.`;
        }
        alertText.innerText = report;
    } else {
        alertBox.className = 'outcome-card double-width';
        alertText.innerText = 'The network is currently operating at base baseline values. No simulation shocks are active. The Kasi cash flow remains stable.';
    }
    
    // Refresh SVG graph rendering
    drawOntologyGraph();
    
    // If a node is currently inspected, refresh the inspection side panel to show disabled state
    if (selectedNodeId) {
        selectNode(selectedNodeId);
    }
    
    // Refresh main charts
    recalculateDashboard();
    
    // Ripple to Macro Chart if shock is active
    if (isWaterOutage || fareHikePct > 0) {
        flashMacroChart();
    }
    
    // Ripple to Ward Map
    if (isWaterOutage) {
        flashMapWards(targetLoc);
    } else {
        clearMapFlashes();
    }
}

// --- GLOBAL STATE VISUAL RIPPLES ---
function flashMapWards(targetLoc) {
    if (!wardGeoLayer) return;
    
    wardGeoLayer.eachLayer(layer => {
        const props = layer.feature.properties;
        let isAffected = false;
        
        // Match targetLoc to specific wards
        if (targetLoc === 'All') {
            isAffected = true;
        } else if (targetLoc === 'Soweto' && props.WardNo === 15) {
            isAffected = true;
        } else if (targetLoc === 'Khayelitsha' && (props.WardNo === 94 || props.WardNo === 98)) {
            isAffected = true;
        } else if (targetLoc === 'Alexandra' && props.WardNo === 105) {
            isAffected = true;
        }
        
        if (isAffected) {
            layer.setStyle({
                fillColor: 'rgba(255, 68, 68, 0.8)',
                fillOpacity: 0.8,
                color: '#ff0000',
                weight: 3
            });
            
            // Add warning text to popup if not already there
            let content = layer.getPopup().getContent();
            if (!content.includes('CRITICAL: Water Infrastructure Offline')) {
                layer.setPopupContent(`<div class="danger-tooltip" style="padding: 10px; margin-bottom: 10px; border-radius: 5px;"><i class="fa-solid fa-triangle-exclamation"></i> CRITICAL: Water Infrastructure Offline</div>` + content);
            }
        }
    });
}

function clearMapFlashes() {
    if (!wardGeoLayer) return;
    wardGeoLayer.eachLayer(layer => {
        // Reset to default style
        wardGeoLayer.resetStyle(layer);
        
        // Remove danger tooltip
        let content = layer.getPopup().getContent();
        if (content.includes('CRITICAL: Water Infrastructure Offline')) {
            content = content.replace(/<div class="danger-tooltip".*?<\/div>/, '');
            layer.setPopupContent(content);
        }
    });
}
// 10. DATA-GAP EXPLORER RENDERING
// ============================================

function initDataGapBubbleChart() {
    const ctx = document.getElementById('chart-datagap-bubble');
    if (!ctx) return;

    // Prepare bubble dataset from sectorData
    const bubbles = sectorData.map(s => ({
        x: s.coverageScore,
        y: s.growthPP,
        r: Math.max(6, s.seseShare2023 / 2.5)  // Scale bubble size
    }));

    const colors = sectorData.map(s => s.color);
    const borderColors = sectorData.map(s => s.color.replace(/[\d.]+\)$/, '1)'));

    dataGapBubbleChart = new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: [{
                label: 'Informal Economy Sectors',
                data: bubbles,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 1.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const sector = sectorData[context.dataIndex];
                            return [
                                sector.name,
                                `Growth: ${sector.growthPP > 0 ? '+' : ''}${sector.growthPP} pp`,
                                `Coverage: ${sector.coverageScore}/10`,
                                `Share: ${sector.seseShare2023}%`
                            ];
                        }
                    },
                    backgroundColor: 'rgba(18, 20, 27, 0.95)',
                    titleColor: '#f3f4f6',
                    bodyColor: '#9ca3af',
                    borderColor: 'rgba(168, 85, 247, 0.3)',
                    borderWidth: 1,
                    padding: 10,
                    bodyFont: { family: 'Plus Jakarta Sans', size: 11 },
                    titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: '700' }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Fintech / Analytics Coverage Score (0–10) • Pulse Estimated',
                        color: '#6b7280',
                        font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' }
                    },
                    min: 0,
                    max: 10,
                    grid: { color: 'rgba(255,255,255,0.03)' },
                    ticks: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans', size: 9 } }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Growth (pp change 2017–2023) • StatsSA SESE',
                        color: '#6b7280',
                        font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' }
                    },
                    min: -4,
                    max: 6,
                    grid: { color: 'rgba(255,255,255,0.03)' },
                    ticks: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans', size: 9 } }
                }
            }
        },
        plugins: [{
            // Custom plugin to draw the "Opportunity Zone" background rectangle
            id: 'opportunityZone',
            beforeDraw(chart) {
                const { ctx, scales: { x, y } } = chart;
                const xStart = x.getPixelForValue(0);
                const xEnd = x.getPixelForValue(3.5);
                const yStart = y.getPixelForValue(6);
                const yEnd = y.getPixelForValue(0.5);

                ctx.save();
                ctx.fillStyle = 'rgba(168, 85, 247, 0.04)';
                ctx.strokeStyle = 'rgba(168, 85, 247, 0.12)';
                ctx.setLineDash([6, 4]);
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.rect(xStart, yStart, xEnd - xStart, yEnd - yStart);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
        }]
    });
}

function renderSectorCards() {
    const container = document.getElementById('sector-cards-list');
    if (!container) return;
    container.innerHTML = '';

    sectorData.forEach((sector, index) => {
        const card = document.createElement('div');
        card.className = `sector-card ${sector.zone}`;
        card.onclick = () => highlightSector(index);

        const zoneLabel = sector.zone === 'opportunity' ? 'Opportunity'
            : sector.zone === 'saturated' ? 'Saturated' : 'Monitor';

        card.innerHTML = `
            <div class="sector-card-header">
                <h5>${sector.name}</h5>
                <span class="sector-zone-tag ${sector.zone}">${zoneLabel}</span>
            </div>
            <div class="sector-card-stats">
                <div class="sector-stat">
                    <span class="s-val">${sector.growthPP > 0 ? '+' : ''}${sector.growthPP}pp</span>
                    <span class="s-lbl">Growth (SESE)</span>
                </div>
                <div class="sector-stat">
                    <span class="s-val">${sector.coverageScore}/10</span>
                    <span class="s-lbl">Coverage (Est.)</span>
                </div>
                <div class="sector-stat">
                    <span class="s-val">${sector.seseShare2023}%</span>
                    <span class="s-lbl">Sector Share</span>
                </div>
                <div class="sector-stat">
                    <span class="s-val">${sector.jobMultiplier}x</span>
                    <span class="s-lbl">Job Multiplier</span>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function highlightSector(index) {
    const sector = sectorData[index];

    // Highlight selected card
    document.querySelectorAll('.sector-card').forEach((c, i) => {
        c.classList.toggle('active', i === index);
    });

    // Flash the corresponding bubble by temporarily enlarging it
    if (dataGapBubbleChart) {
        const dataset = dataGapBubbleChart.data.datasets[0];
        dataset.data.forEach((pt, i) => {
            const base = Math.max(6, sectorData[i].seseShare2023 / 2.5);
            pt.r = (i === index) ? base * 1.6 : base;
        });
        dataGapBubbleChart.update();

        // Reset after 1.5 seconds
        setTimeout(() => {
            dataset.data.forEach((pt, i) => {
                pt.r = Math.max(6, sectorData[i].seseShare2023 / 2.5);
            });
            dataGapBubbleChart.update();
        }, 1500);
    }
}

function renderMultiplierBars() {
    const container = document.getElementById('multiplier-bars');
    if (!container) return;
    container.innerHTML = '';

    // Sort by job multiplier descending
    const sorted = [...sectorData].sort((a, b) => b.jobMultiplier - a.jobMultiplier);
    const maxMult = sorted[0].jobMultiplier;

    sorted.forEach(sector => {
        const pct = (sector.jobMultiplier / maxMult * 100).toFixed(0);
        const isHighlight = sector.jobMultiplier >= 4;
        const isLow = sector.jobMultiplier < 2.5;
        const barClass = isHighlight ? 'highlight' : (isLow ? 'low' : 'normal');

        const row = document.createElement('div');
        row.className = 'multiplier-bar-row';
        row.innerHTML = `
            <span class="mult-label">${sector.name}</span>
            <div class="mult-bar-track">
                <div class="mult-bar-fill ${barClass}" style="width: ${pct}%">${sector.jobMultiplier}x</div>
            </div>
            <span class="mult-owners">${(sector.finscopeOwners / 1000).toFixed(0)}k owners</span>
        `;
        container.appendChild(row);
    });
}

// ==========================================
// WARD MAP LOGIC
// ==========================================

let wardMap = null;
let wardGeoLayer = null;

function initWardMap() {
    wardMap = L.map('ward-map').setView([-26.2041, 28.0473], 10); // Center JHB

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(wardMap);

    // Load default metro
    loadMetroWards("MUNICNAME='City of Johannesburg'");
}

function loadMetroWards(queryClause, highlightWardNo = null) {
    if (!queryClause || !wardMap) return;

    const countLabel = document.getElementById('ward-count-label');
    const selectedLabel = document.getElementById('ward-selected-label');
    
    // Extract name for display
    let displayName = queryClause.split('=')[1].replace(/'/g, '');
    
    countLabel.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Loading live boundaries for ${displayName}...`;
    selectedLabel.textContent = '';

    // MDB Wards 2026 Feature Service query
    const url = `https://services7.arcgis.com/oeoyTUJC8HEeYsRB/arcgis/rest/services/MDBWards2026/FeatureServer/0/query?where=${encodeURIComponent(queryClause)}&outFields=*&outSR=4326&f=geojson`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (wardGeoLayer) {
                wardMap.removeLayer(wardGeoLayer);
            }

            wardGeoLayer = L.geoJSON(data, {
                style: function (feature) {
                    return {
                        color: 'rgba(168, 85, 247, 0.5)',
                        weight: 1.2,
                        fillColor: 'rgba(168, 85, 247, 0.08)',
                        fillOpacity: 0.4
                    };
                },
                onEachFeature: function (feature, layer) {
                    const props = feature.properties;
                    const popupContent = `
                        <div class="ward-popup-title">Ward ${props.WardNo}</div>
                        <div class="ward-popup-row"><span>ID:</span> <strong>${props.WardID}</strong></div>
                        <div class="ward-popup-row"><span>Municipality:</span> <strong>${props.MUNICNAME}</strong></div>
                        <div class="ward-popup-row"><span>District:</span> <strong>${props.DISTRICT}</strong></div>
                        <div class="ward-popup-row"><span>Province:</span> <strong>${props.Province}</strong></div>
                        <div style="margin-top: 10px; text-align: center;">
                            <button onclick="inspectWardInOntology(${props.WardNo}, '${props.MUNICNAME.replace(/'/g, "\\'")}')" style="background: var(--accent-purple); color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 0.7rem; cursor: pointer; width: 100%; font-weight: bold;">
                                <i class="fa-solid fa-circle-nodes"></i> Inspect Nodes in Ward
                            </button>
                        </div>
                    `;
                    layer.bindPopup(popupContent);

                    layer.on({
                        mouseover: function (e) {
                            var l = e.target;
                            l.setStyle({
                                fillColor: 'rgba(0, 242, 254, 0.3)',
                                fillOpacity: 0.6,
                                color: 'rgba(0, 242, 254, 0.8)',
                                weight: 2
                            });
                            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                                l.bringToFront();
                            }
                            selectedLabel.textContent = `Ward ${layer.feature.properties.WardNo} | ${layer.feature.properties.MUNICNAME}`;
                        },
                        mouseout: function (e) {
                            wardGeoLayer.resetStyle(e.target);
                            selectedLabel.textContent = '';
                        }
                    });
                }
            }).addTo(wardMap);

            if (data.features && data.features.length > 0) {
                if (highlightWardNo) {
                    let targetLayer = null;
                    wardGeoLayer.eachLayer(layer => {
                        if (layer.feature.properties.WardNo === highlightWardNo) {
                            targetLayer = layer;
                        }
                    });
                    
                    if (targetLayer) {
                        wardMap.fitBounds(targetLayer.getBounds());
                        targetLayer.openPopup();
                        targetLayer.setStyle({
                            fillColor: '#00f2fe',
                            fillOpacity: 0.6,
                            color: '#00f2fe',
                            weight: 3
                        });
                    } else {
                        wardMap.fitBounds(wardGeoLayer.getBounds());
                    }
                } else {
                    wardMap.fitBounds(wardGeoLayer.getBounds());
                }
                countLabel.innerHTML = `<i class="fa-solid fa-layer-group"></i> Loaded ${data.features.length} wards from MDB 2026 delimitations`;
                
                // Re-apply any active simulation flashes
                if (document.getElementById('sim-water-outage') && document.getElementById('sim-water-outage').checked) {
                    flashMapWards(document.getElementById('sim-water-location').value);
                }
            } else {
                countLabel.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> No wards found for this query.`;
            }
        })
        .catch(err => {
            console.error('Error loading MDB wards:', err);
            countLabel.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Error loading live data. Please try again.`;
        });
}

// --- GLOBAL STATE VISUAL RIPPLES ---
function flashMacroChart() {
    // Find the 'Trade' and 'Community Services' bubbles and add a pulsing red glow
    const tradeBubble = document.getElementById('bubble-trade');
    const commBubble = document.getElementById('bubble-community');
    if (tradeBubble) {
        tradeBubble.style.boxShadow = '0 0 20px 5px rgba(255, 68, 68, 0.8)';
        tradeBubble.style.borderColor = '#ff4444';
        setTimeout(() => {
            tradeBubble.style.boxShadow = '';
            tradeBubble.style.borderColor = '';
        }, 3000);
    }
    if (commBubble) {
        commBubble.style.boxShadow = '0 0 20px 5px rgba(255, 68, 68, 0.8)';
        commBubble.style.borderColor = '#ff4444';
        setTimeout(() => {
            commBubble.style.boxShadow = '';
            commBubble.style.borderColor = '';
        }, 3000);
    }
}

// ============================================
// PROFILE STEP NAVIGATOR (PWA Multi-Step Form)
// ============================================

const stepLabels = {
    1: 'Step 1 of 6: Identity & Profile',
    2: 'Step 2 of 6: Financial Behaviour',
    3: 'Step 3 of 6: Stock & Products',
    4: 'Step 4 of 6: Transaction Patterns',
    5: 'Step 5 of 6: Location & Infrastructure',
    6: 'Step 6 of 6: Risk & Loss History'
};

function nextProfileStep(step) {
    // Hide all steps
    document.querySelectorAll('.profile-step').forEach(s => s.classList.remove('active'));
    // Show target step
    document.getElementById(`profile-step-${step}`).classList.add('active');
    // Update dots
    for (let i = 1; i <= 6; i++) {
        const dot = document.getElementById(`step-dot-${i}`);
        dot.classList.remove('active', 'done');
        if (i < step) dot.classList.add('done');
        if (i === step) dot.classList.add('active');
    }
    // Update label
    document.getElementById('step-label').textContent = stepLabels[step];
    // Scroll to top of form
    const screen = document.getElementById('screen-survey-vendor');
    if (screen) screen.scrollTop = 0;
}

function submitTraderProfile(event) {
    event.preventDefault();
    
    const name = document.getElementById('tp-name').value || 'New Trader';
    const type = document.getElementById('tp-type').value;
    const township = document.getElementById('tp-township').value;
    
    // Add R25 to wallet
    walletBalance += 25.00;
    document.getElementById('pwa-balance').innerText = walletBalance.toFixed(2);
    document.getElementById('wallet-balance-display').innerText = walletBalance.toFixed(2);
    
    // Add to earning history
    const histList = document.getElementById('earning-history');
    const newEntry = document.createElement('div');
    newEntry.className = 'history-item';
    newEntry.innerHTML = `
        <div class="item-desc">Full Trader Profile: ${name} (${township})</div>
        <div class="item-amt positive">+R25.00</div>
    `;
    histList.prepend(newEntry);
    
    // Show SMS notification
    showSmsNotification(`✅ Profile submitted! ${name} (${type}, ${township}) — 37 data points collected. +R25.00 earned.`);
    
    // Reset form and go back to step 1
    nextProfileStep(1);
    showScreen('home');
}

// ============================================
// TRADER PROFILE OUTPUT TAB (Institutional Lenses)
// ============================================

let activeLens = 'bank';

function switchLens(lens) {
    activeLens = lens;
    document.querySelectorAll('.lens-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lens-${lens}`).classList.add('active');
    renderProfileOutput();
}

function renderProfileOutput() {
    const selectEl = document.getElementById('profile-trader-select');
    if (!selectEl) return;
    const traderId = selectEl.value;
    const trader = ontologyData.nodes.find(n => n.id === traderId);
    if (!trader) return;

    const card = document.getElementById('profile-output-card');
    const p = trader.properties;
    const today = new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
    const refId = 'PSA-' + traderId.toUpperCase().slice(0,4) + '-' + Math.floor(1000 + Math.random() * 9000);

    const vs = {
        'sizwe_spaza':    { wholesale:94, footTraffic:88, consistency:91, overall:91, riskTier:'B+', riskLabel:'Low-Medium Risk',    riskColor:'#10b981', decision:'APPROVE',      loanMin:'R5,000',  loanMax:'R10,000', premium:'R120-R180', stockVal:'R12,000-R18,000', coverType:'Stock + Business Interruption', shelfScore:87, distOpp:'HIGH',   compGap:'Cooking oil (bulk), cold drinks' },
        'mkhize_inhloko': { wholesale:91, footTraffic:85, consistency:88, overall:88, riskTier:'B',  riskLabel:'Medium Risk',         riskColor:'#f59e0b', decision:'APPROVE',      loanMin:'R3,000',  loanMax:'R8,000',  premium:'R150-R220', stockVal:'R5,000-R8,000',   coverType:'Stock + Fire Cover',            shelfScore:74, distOpp:'MEDIUM', compGap:'Cold drinks, packaged snacks' },
        'nomsa_salon':    { wholesale:82, footTraffic:78, consistency:85, overall:82, riskTier:'B',  riskLabel:'Medium Risk',         riskColor:'#f59e0b', decision:'CONDITIONAL', loanMin:'R2,000',  loanMax:'R5,000',  premium:'R80-R120',  stockVal:'R4,000-R7,000',   coverType:'Equipment + Liability',         shelfScore:68, distOpp:'MEDIUM', compGap:'Professional hair products, retail-pack dye' },
        'gary_fruit':     { wholesale:72, footTraffic:90, consistency:68, overall:73, riskTier:'C+', riskLabel:'Medium-High Risk',   riskColor:'#ef4444', decision:'CONDITIONAL', loanMin:'R1,000',  loanMax:'R3,000',  premium:'R60-R100',  stockVal:'R2,000-R4,000',   coverType:'Stock Only (Perishables)',      shelfScore:61, distOpp:'LOW',    compGap:'Packaged produce, value-add juices' }
    };
    const v = vs[traderId] || vs['sizwe_spaza'];
    const decisionColour = v.decision === 'APPROVE' ? '#10b981' : '#f59e0b';
    const decisionBg     = v.decision === 'APPROVE' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)';
    const decisionBorder = v.decision === 'APPROVE' ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)';

    function scoreMeter(label, val, color) {
        return '<div style="margin-bottom:12px;">'
            + '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">'
            + '<span style="font-size:0.68rem;color:var(--text-secondary);">' + label + '</span>'
            + '<span style="font-size:0.72rem;font-weight:800;color:' + color + ';">' + val + '%</span></div>'
            + '<div style="background:rgba(255,255,255,0.05);border-radius:4px;height:6px;overflow:hidden;">'
            + '<div style="width:' + val + '%;height:100%;background:' + color + ';border-radius:4px;"></div>'
            + '</div></div>';
    }

    /* ── BANK LENS ── */
    if (activeLens === 'bank') {
        card.innerHTML =
        '<div style="background:linear-gradient(135deg,rgba(0,242,254,0.06),rgba(168,85,247,0.06));border:1px solid rgba(0,242,254,0.12);border-radius:16px;padding:18px 20px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">'
            + '<div><div style="font-size:0.58rem;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent-teal);margin-bottom:4px;">Pulse SA \u00b7 Credit Intelligence Unit</div>'
            + '<div style="font-size:1rem;font-weight:800;color:var(--text-primary);">' + (p['Name']||trader.label) + '</div>'
            + '<div style="font-size:0.68rem;color:var(--text-secondary);margin-top:2px;">' + p['Type'] + ' \u00b7 ' + p['Township'] + ' \u00b7 ' + p['Ward'] + '</div></div>'
            + '<div style="text-align:right;flex-shrink:0;">'
            + '<div style="font-size:0.58rem;color:var(--text-secondary);">Ref: <span style="color:var(--accent-teal);font-weight:700;">' + refId + '</span></div>'
            + '<div style="font-size:0.58rem;color:var(--text-secondary);margin-top:2px;">Generated: ' + today + '</div>'
            + '<div style="margin-top:6px;background:rgba(0,242,254,0.08);border:1px solid rgba(0,242,254,0.2);border-radius:6px;padding:3px 8px;font-size:0.58rem;font-weight:800;color:var(--accent-teal);">Pulse Credit Profile \u00b7 API v1.0</div>'
            + '</div></div>'

        + '<div style="background:' + decisionBg + ';border:2px solid ' + decisionBorder + ';border-radius:14px;padding:16px 20px;margin-bottom:16px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">'
            + '<div style="width:52px;height:52px;border-radius:50%;background:' + decisionColour + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;">'
            + '<i class="fa-solid ' + (v.decision==='APPROVE'?'fa-circle-check':'fa-circle-exclamation') + '" style="color:#fff;font-size:1.3rem;"></i></div>'
            + '<div style="flex:1;">'
            + '<div style="font-size:0.6rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:' + decisionColour + ';">Pulse Credit Decision</div>'
            + '<div style="font-size:1.05rem;font-weight:800;color:var(--text-primary);margin:2px 0;">' + v.decision + ' \u2014 Stock Working Capital Loan</div>'
            + '<div style="font-size:0.72rem;color:var(--text-secondary);">Recommended facility: <strong style="color:var(--text-primary);">' + v.loanMin + ' \u2013 ' + v.loanMax + '</strong> \u00b7 Risk Tier: <strong style="color:' + v.riskColor + ';">' + v.riskTier + ' (' + v.riskLabel + ')</strong></div></div>'
            + '<div style="text-align:right;flex-shrink:0;"><div style="font-size:1.6rem;font-weight:900;color:' + v.riskColor + ';">' + v.overall + '<span style="font-size:0.7rem;">/100</span></div>'
            + '<div style="font-size:0.58rem;color:var(--text-secondary);">Pulse Score</div></div></div>'

        + '<div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:14px;padding:16px 20px;margin-bottom:16px;">'
            + '<div style="font-size:0.62rem;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-secondary);margin-bottom:12px;"><i class="fa-solid fa-shield-halved" style="color:var(--accent-teal);margin-right:6px;"></i>3-Factor Verification Audit</div>'
            + scoreMeter('Wholesaler Cross-Check Match Rate', v.wholesale, '#00f2fe')
            + scoreMeter('Foot-Traffic Confirmation Score', v.footTraffic, '#a855f7')
            + scoreMeter('Longitudinal Consistency (6-month)', v.consistency, '#10b981')
            + '<div style="font-size:0.65rem;color:var(--text-secondary);margin-top:8px;padding-top:8px;border-top:1px solid var(--border-color);">Auditable arithmetic reconciliation \u2014 no black-box AI. Available for bank compliance review on request.</div></div>'

        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">'
            + '<div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:14px;padding:16px;">'
            + '<div style="font-size:0.62rem;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-secondary);margin-bottom:10px;"><i class="fa-solid fa-fingerprint" style="color:var(--accent-teal);margin-right:6px;"></i>Identity & KYC</div>'
            + '<div style="display:flex;flex-direction:column;gap:7px;font-size:0.72rem;">'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Business Type</span><span style="font-weight:700;">' + p['Type'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Years Operating</span><span style="font-weight:700;">' + p['Years Operating'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Premises</span><span style="font-weight:700;">' + p['Premises'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">SA ID Verified</span><span style="font-weight:700;color:#10b981;">' + p['ID Verified'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Bank Account</span><span style="font-weight:700;">' + p['Bank Account'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Employees</span><span style="font-weight:700;">' + p['Employees'] + '</span></div>'
            + '</div></div>'
            + '<div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:14px;padding:16px;">'
            + '<div style="font-size:0.62rem;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-secondary);margin-bottom:10px;"><i class="fa-solid fa-chart-line" style="color:#a855f7;margin-right:6px;"></i>Revenue & Cashflow</div>'
            + '<div style="display:flex;flex-direction:column;gap:7px;font-size:0.72rem;">'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Monthly Turnover</span><span style="font-weight:700;color:#00f2fe;">' + p['Monthly Turnover (Reconciled)'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Good Day</span><span style="font-weight:700;">' + p['Turnover (Good Day)'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Bad Day</span><span style="font-weight:700;">' + p['Turnover (Bad Day)'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Customers/Day</span><span style="font-weight:700;">' + p['Customers Per Day'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Existing Debt</span><span style="font-weight:700;">' + p['Existing Loans'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Wholesaler Terms</span><span style="font-weight:700;">' + p['Wholesaler Terms'] + '</span></div>'
            + '</div></div></div>'

        + '<div style="background:' + decisionBg + ';border:1px solid ' + decisionBorder + ';border-radius:14px;padding:16px 20px;margin-bottom:16px;">'
            + '<div style="font-size:0.62rem;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:' + decisionColour + ';margin-bottom:8px;"><i class="fa-solid fa-file-circle-check" style="margin-right:6px;"></i>Credit Officer Recommendation</div>'
            + '<p style="font-size:0.75rem;line-height:1.65;color:var(--text-primary);">Reconciled monthly turnover of <strong>' + p['Monthly Turnover (Reconciled)'] + '</strong> with <strong>' + v.wholesale + '% wholesaler match rate</strong> supports a working capital facility. Recommend <strong>closed-loop stock voucher</strong> redeemable exclusively at <strong>' + p['Primary Supplier'] + '</strong> \u2014 eliminates cash diversion risk and creates a verifiable audit trail.</p></div>'

        + '<div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:16px 20px;">'
            + '<div style="font-size:0.62rem;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-secondary);margin-bottom:10px;"><i class="fa-solid fa-code" style="color:var(--accent-teal);margin-right:6px;"></i>API Payload \u2014 What Your Credit Engine Receives</div>'
            + '<pre style="font-size:0.6rem;color:#00f2fe;line-height:1.6;overflow-x:auto;margin:0;white-space:pre-wrap;">{"pulse_ref":"' + refId + '","trader":"' + (p['Name']||trader.label) + '","decision":"' + v.decision + '","risk_tier":"' + v.riskTier + '","pulse_score":' + v.overall + ',"loan_range":{"min":"' + v.loanMin + '","max":"' + v.loanMax + '"},"monthly_turnover_verified":"' + p['Monthly Turnover (Reconciled)'] + '","wholesaler_match":' + v.wholesale + ',"verification":"3-factor_reconciliation","generated":"' + today + '"}</pre></div>';

    /* ── FMCG LENS ── */
    } else if (activeLens === 'fmcg') {
        const oppColor = v.distOpp==='HIGH' ? '#10b981' : v.distOpp==='MEDIUM' ? '#f59e0b' : '#ef4444';
        card.innerHTML =
        '<div style="background:linear-gradient(135deg,rgba(16,185,129,0.06),rgba(245,158,11,0.04));border:1px solid rgba(16,185,129,0.15);border-radius:16px;padding:18px 20px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">'
            + '<div><div style="font-size:0.58rem;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#10b981;margin-bottom:4px;">Pulse SA \u00b7 Shelf Intelligence Unit</div>'
            + '<div style="font-size:1rem;font-weight:800;color:var(--text-primary);">' + (p['Name']||trader.label) + '</div>'
            + '<div style="font-size:0.68rem;color:var(--text-secondary);margin-top:2px;">' + p['Type'] + ' \u00b7 ' + p['Township'] + ' \u00b7 ' + p['Ward'] + '</div></div>'
            + '<div style="text-align:right;flex-shrink:0;"><div style="font-size:0.58rem;color:var(--text-secondary);">Ref: <span style="color:#10b981;font-weight:700;">' + refId + '</span></div>'
            + '<div style="font-size:0.58rem;color:var(--text-secondary);margin-top:2px;">Generated: ' + today + '</div>'
            + '<div style="margin-top:6px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:6px;padding:3px 8px;font-size:0.58rem;font-weight:800;color:#10b981;">Pulse Shelf Intelligence \u00b7 Report</div></div></div>'

        + '<div style="background:rgba(16,185,129,0.06);border:2px solid rgba(16,185,129,0.2);border-radius:14px;padding:16px 20px;margin-bottom:16px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">'
            + '<div style="width:52px;height:52px;border-radius:12px;background:' + oppColor + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fa-solid fa-bullseye" style="color:#fff;font-size:1.2rem;"></i></div>'
            + '<div style="flex:1;"><div style="font-size:0.6rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:' + oppColor + ';">Distribution Opportunity</div>'
            + '<div style="font-size:1rem;font-weight:800;color:var(--text-primary);margin:2px 0;">' + v.distOpp + ' PRIORITY OUTLET</div>'
            + '<div style="font-size:0.72rem;color:var(--text-secondary);">Shelf score: <strong style="color:' + oppColor + ';">' + v.shelfScore + '/100</strong> \u00b7 Daily foot traffic: <strong>' + p['Customers Per Day'] + '</strong> \u00b7 Busiest: <strong>' + p['Busiest Hours'] + '</strong></div></div></div>'

        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">'
            + '<div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:14px;padding:16px;">'
            + '<div style="font-size:0.62rem;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-secondary);margin-bottom:10px;"><i class="fa-solid fa-boxes-stacked" style="color:#10b981;margin-right:6px;"></i>Current Shelf Presence</div>'
            + '<div style="display:flex;flex-direction:column;gap:7px;font-size:0.72rem;">'
            + '<div style="display:flex;justify-content:space-between;gap:8px;"><span style="color:var(--text-secondary);flex-shrink:0;">Top Products</span><span style="font-weight:700;font-size:0.63rem;text-align:right;">' + p['Top Products'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Fastest Seller</span><span style="font-weight:700;color:#10b981;">' + p['Fastest Seller'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Restock Cycle</span><span style="font-weight:700;">' + p['Restock Frequency'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Supplier</span><span style="font-weight:700;font-size:0.65rem;">' + p['Primary Supplier'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Monthly Revenue</span><span style="font-weight:700;">' + p['Monthly Turnover (Reconciled)'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Restock Transport</span><span style="font-weight:700;">' + p['Restock Transport'] + '</span></div>'
            + '</div></div>'
            + '<div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:14px;padding:16px;">'
            + '<div style="font-size:0.62rem;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-secondary);margin-bottom:10px;"><i class="fa-solid fa-location-dot" style="color:#f59e0b;margin-right:6px;"></i>Reach & Access</div>'
            + '<div style="display:flex;flex-direction:column;gap:7px;font-size:0.72rem;">'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Township</span><span style="font-weight:700;">' + p['Township'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">GPS</span><span style="font-weight:700;font-size:0.63rem;">' + p['GPS'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Ward</span><span style="font-weight:700;">' + p['Ward'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Distance to Depot</span><span style="font-weight:700;">' + p['Distance to Wholesaler'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Payment Methods</span><span style="font-weight:700;">' + p['Payment Methods'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Customers/Day</span><span style="font-weight:700;">' + p['Customers Per Day'] + '</span></div>'
            + '</div></div></div>'

        + '<div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:14px;padding:16px 20px;margin-bottom:16px;">'
            + '<div style="font-size:0.62rem;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#f59e0b;margin-bottom:8px;"><i class="fa-solid fa-triangle-exclamation" style="margin-right:6px;"></i>Distribution Gap \u2014 Unmet Demand</div>'
            + '<p style="font-size:0.75rem;line-height:1.65;color:var(--text-primary);">Trader reports demand for <strong>' + p['Wanted But Unaffordable'] + '</strong> but cannot afford the upfront cost. <strong>Competitor gap: ' + v.compGap + '.</strong> Direct delivery or consignment stocking could capture this unmet revenue.</p></div>'

        + '<div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.18);border-radius:14px;padding:16px 20px;">'
            + '<div style="font-size:0.62rem;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#10b981;margin-bottom:8px;"><i class="fa-solid fa-lightbulb" style="margin-right:6px;"></i>Shelf Intelligence Recommendation</div>'
            + '<p style="font-size:0.75rem;line-height:1.65;color:var(--text-primary);">High-traffic outlet serving <strong>' + p['Customers Per Day'] + '</strong> in <strong>' + p['Township'] + '</strong>. Peak window <strong>' + p['Busiest Hours'] + '</strong>. Currently sourcing via <strong>' + p['Primary Supplier'] + '</strong>. Direct delivery or pre-order platform could displace competitor SKUs and grow your brand footprint in Ward ' + p['Ward'] + '. Priority: <strong style="color:' + oppColor + ';">' + v.distOpp + '</strong>.</p></div>';

    /* ── INSURER LENS ── */
    } else if (activeLens === 'insurer') {
        const riskScore = Math.round((v.wholesale*0.3)+(v.consistency*0.4)+(v.footTraffic*0.3));
        const hasLoss = p['Previous Losses'] && p['Previous Losses'] !== 'None' && p['Previous Losses'] !== 'No previous losses';
        card.innerHTML =
        '<div style="background:linear-gradient(135deg,rgba(168,85,247,0.06),rgba(239,68,68,0.04));border:1px solid rgba(168,85,247,0.15);border-radius:16px;padding:18px 20px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">'
            + '<div><div style="font-size:0.58rem;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#a855f7;margin-bottom:4px;">Pulse SA \u00b7 Risk Intelligence Unit</div>'
            + '<div style="font-size:1rem;font-weight:800;color:var(--text-primary);">' + (p['Name']||trader.label) + '</div>'
            + '<div style="font-size:0.68rem;color:var(--text-secondary);margin-top:2px;">' + p['Type'] + ' \u00b7 ' + p['Township'] + ' \u00b7 ' + p['Ward'] + '</div></div>'
            + '<div style="text-align:right;flex-shrink:0;"><div style="font-size:0.58rem;color:var(--text-secondary);">Ref: <span style="color:#a855f7;font-weight:700;">' + refId + '</span></div>'
            + '<div style="font-size:0.58rem;color:var(--text-secondary);margin-top:2px;">Generated: ' + today + '</div>'
            + '<div style="margin-top:6px;background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2);border-radius:6px;padding:3px 8px;font-size:0.58rem;font-weight:800;color:#a855f7;">Pulse Risk Profile \u00b7 Underwriting</div></div></div>'

        + '<div style="background:rgba(168,85,247,0.06);border:2px solid rgba(168,85,247,0.2);border-radius:14px;padding:16px 20px;margin-bottom:16px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">'
            + '<div style="width:60px;height:60px;border-radius:50%;background:conic-gradient(#a855f7 ' + riskScore + '%, rgba(255,255,255,0.05) 0%);display:flex;align-items:center;justify-content:center;flex-shrink:0;">'
            + '<div style="width:44px;height:44px;border-radius:50%;background:var(--bg-card);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;color:#a855f7;">' + riskScore + '</div></div>'
            + '<div style="flex:1;"><div style="font-size:0.6rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#a855f7;">Underwriting Decision</div>'
            + '<div style="font-size:1rem;font-weight:800;color:var(--text-primary);margin:2px 0;">INSURABLE \u2014 ' + v.coverType + '</div>'
            + '<div style="font-size:0.72rem;color:var(--text-secondary);">Recommended premium: <strong style="color:var(--text-primary);">' + v.premium + '/month</strong> \u00b7 Stock value: <strong>' + v.stockVal + '</strong></div></div>'
            + '<div style="text-align:right;flex-shrink:0;"><div style="font-size:0.6rem;color:var(--text-secondary);">Risk tier</div>'
            + '<div style="font-size:1.2rem;font-weight:900;color:' + v.riskColor + ';">' + v.riskTier + '</div>'
            + '<div style="font-size:0.58rem;color:var(--text-secondary);">' + v.riskLabel + '</div></div></div>'

        + '<div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:14px;padding:16px 20px;margin-bottom:16px;">'
            + '<div style="font-size:0.62rem;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-secondary);margin-bottom:12px;"><i class="fa-solid fa-triangle-exclamation" style="color:#a855f7;margin-right:6px;"></i>Risk Factor Assessment</div>'
            + scoreMeter('Business Stability Score (longitudinal)', v.consistency, '#a855f7')
            + scoreMeter('Revenue Reliability (wholesaler-verified)', v.wholesale, '#00f2fe')
            + scoreMeter('Operational Presence (foot-traffic)', v.footTraffic, '#10b981')
            + '</div>'

        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">'
            + '<div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:14px;padding:16px;">'
            + '<div style="font-size:0.62rem;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-secondary);margin-bottom:10px;"><i class="fa-solid fa-shield-halved" style="color:#a855f7;margin-right:6px;"></i>Risk Profile</div>'
            + '<div style="display:flex;flex-direction:column;gap:7px;font-size:0.72rem;">'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Premises Type</span><span style="font-weight:700;">' + p['Premises'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Previous Losses</span><span style="font-weight:700;color:' + (hasLoss?'#ef4444':'#10b981') + ';">' + p['Previous Losses'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Crime Incidents</span><span style="font-weight:700;">' + p['Crime Incidents'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Infrastructure Risk</span><span style="font-weight:700;">' + p['Infrastructure Disruptions'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Current Insurance</span><span style="font-weight:700;color:#f59e0b;">' + p['Insurance Status'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Dependents</span><span style="font-weight:700;">' + p['Dependents'] + '</span></div>'
            + '</div></div>'
            + '<div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:14px;padding:16px;">'
            + '<div style="font-size:0.62rem;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-secondary);margin-bottom:10px;"><i class="fa-solid fa-coins" style="color:#f59e0b;margin-right:6px;"></i>Asset & Revenue Base</div>'
            + '<div style="display:flex;flex-direction:column;gap:7px;font-size:0.72rem;">'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Est. Stock Value</span><span style="font-weight:700;color:#00f2fe;">' + v.stockVal + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Monthly Revenue</span><span style="font-weight:700;">' + p['Monthly Turnover (Reconciled)'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Years Operating</span><span style="font-weight:700;">' + p['Years Operating'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Employees</span><span style="font-weight:700;">' + p['Employees'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;gap:6px;"><span style="color:var(--text-secondary);flex-shrink:0;">Biggest Challenge</span><span style="font-weight:700;font-size:0.63rem;text-align:right;">' + p['Biggest Challenge'] + '</span></div>'
            + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-secondary);">Water Supply</span><span style="font-weight:700;">' + p['Water Supply'] + '</span></div>'
            + '</div></div></div>'

        + '<div style="background:rgba(168,85,247,0.06);border:1px solid rgba(168,85,247,0.2);border-radius:14px;padding:16px 20px;">'
            + '<div style="font-size:0.62rem;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#a855f7;margin-bottom:8px;"><i class="fa-solid fa-file-signature" style="margin-right:6px;"></i>Underwriting Recommendation</div>'
            + '<p style="font-size:0.75rem;line-height:1.65;color:var(--text-primary);">Recommended cover: <strong>' + v.coverType + '</strong> at <strong>' + v.premium + '/month</strong>. Estimated insured stock value: <strong>' + v.stockVal + '</strong>. '
            + (hasLoss ? '<strong style="color:#f59e0b;">Previous loss event recorded \u2014 apply appropriate loading.</strong> ' : 'Clean loss history supports standard pricing. ')
            + ((p['Premises']||'').toLowerCase().includes('container') ? 'Container premises: apply moderate fire risk loading. ' : '')
            + 'This business is currently uninsured \u2014 first policy represents new premium income with no prior claims liability.</p></div>';
    }
}

// ============================================
// PRICE BASKET MONITOR — Submit Handler
// ============================================
function submitBasketSurvey(event) {
    event.preventDefault();
    const township = document.getElementById('basket-township').value;
    const name = document.getElementById('basket-name').value || 'Unknown Trader';
    const itemIds = ['b-bread','b-maize','b-oil','b-milk','b-eggs','b-sugar','b-airtime','b-sunoil'];
    const logged = itemIds.filter(id => {
        const el = document.getElementById(id);
        return el && el.value !== '';
    }).length;

    walletBalance += 8.00;
    document.getElementById('pwa-balance').innerText = walletBalance.toFixed(2);
    document.getElementById('wallet-balance-display').innerText = walletBalance.toFixed(2);

    const histList = document.getElementById('earning-history');
    const newEntry = document.createElement('div');
    newEntry.className = 'history-item';
    newEntry.innerHTML = `<div class="item-desc">Price Basket: ${name} (${township}) — ${logged} items logged</div><div class="item-amt positive">+R8.00</div>`;
    histList.prepend(newEntry);

    showSmsNotification(`🧺 Price basket submitted! ${logged} prices logged at ${name}, ${township}. +R8.00 earned.`);
    document.getElementById('form-basket').reset();
    showScreen('home');
}

// ============================================
// FOOT-TRAFFIC VERIFICATION — Submit Handler
// ============================================
function submitFootTrafficSurvey(event) {
    event.preventDefault();
    const traderId = document.getElementById('ft-trader').value;
    const statusEl = document.querySelector('input[name="ft-status"]:checked');
    const customers = document.getElementById('ft-customers').value;
    const note = document.getElementById('ft-note').value;
    if (!statusEl) return;

    const trader = ontologyData.nodes.find(n => n.id === traderId);
    const traderName = trader ? (trader.properties['Name'] || trader.label) : traderId;
    if (trader) {
        trader._footTrafficChecks = (trader._footTrafficChecks || 0) + 1;
        trader._lastStatus = statusEl.value;
    }

    walletBalance += 3.00;
    document.getElementById('pwa-balance').innerText = walletBalance.toFixed(2);
    document.getElementById('wallet-balance-display').innerText = walletBalance.toFixed(2);

    const histList = document.getElementById('earning-history');
    const newEntry = document.createElement('div');
    newEntry.className = 'history-item';
    const statusIcon = statusEl.value === 'Open' ? '✅' : statusEl.value === 'Closed' ? '❌' : '⚠️';
    newEntry.innerHTML = `<div class="item-desc">${statusIcon} Verified: ${traderName} — ${statusEl.value} (~${customers} customers)</div><div class="item-amt positive">+R3.00</div>`;
    histList.prepend(newEntry);

    const noteText = note ? ` Note: ${note}` : '';
    showSmsNotification(`👀 Verification logged! ${traderName}: ${statusEl.value}, ~${customers} customers visible.${noteText} +R3.00 earned.`);
    document.getElementById('form-foottraffic').reset();
    showScreen('home');
}
