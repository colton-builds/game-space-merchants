
<!DOCTYPE html>
<html>
<head>
   <meta charset="utf-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Solar System Trader - Phase D Settings</title> <!-- Updated Title -->
   <style>
       body { padding: 0; margin: 0; overflow: hidden; background-color: black; font-family: 'Courier New', Courier, monospace; color: #eee; }
       canvas { display: block; }
   </style>
   <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.js"></script>
</head>
<body>
   <main></main>

<script>
// --- Global Variables & Settings ---
let star; let planets = []; let player; let scaleFactor = 0.5; const MIN_ZOOM = 0.05; const MAX_ZOOM = 3.0; let playerState = 'LOADING'; let isPaused = false; let gameFont; let G = 0.55; const G_INCREMENT = 0.05; const MIN_G = 0.0; const MAX_G = 3.0; const LAUNCH_SPEED_MULTIPLIER = 0.07; const MAX_LAUNCH_SPEED = 12; const TRAJECTORY_STEPS = 250; const TRAJECTORY_DT = 0.9; const SIMULATION_DT = 0.5; const TRAJECTORY_RECALC_THRESHOLD_SQ = 5*5; const ESCAPE_POD_COST = 500; const PLAYER_PLANET_ROTATION_SPEED = 0.05; const BOOST_DURATION_FRAMES = 15;
// D.3: Make constants let for modification
let BOOST_FORCE_MAGNITUDE = 0.08;
const TONS_PER_UNIT = 10; const MAX_CARGO_UNITS = 10; const MAX_CARGO_TONS = MAX_CARGO_UNITS * TONS_PER_UNIT;
let GAME_MINUTE_INTERVAL_FRAMES = 60 * 1;
let gameTickCounter = 0;

// --- State Management & Time Dilation ---
let currentView = 'GAME';
let currentTimeScaleFactor = 1.0;
let targetTimeScaleFactor = 1.0;
// D.3: Make constant let for modification
let TIME_DILATION_FACTOR = 0.2;
const TIME_SCALE_EASING = 0.1;

// --- Trade Report & Map State ---
let selectedReportCommodity = "Energy Units";
let reportSortColumn = "Planet";
let reportSortDirection = "ASC";
let selectedMapCommodity = null;
let selectedMapPlanet = null;

// --- Event System State ---
let activeEvents = [];
let eventHistory = [];
const MAX_LOG_ENTRIES = 50;
let eventCheckTimer = 0;
const EVENT_CHECK_INTERVAL_FRAMES = 60 * 5;
// D.3: Make constant let for modification
let MAX_ACTIVE_EVENTS = 3;

// --- Event Log UI State ---
let eventLogPanelVisible = false;
let eventLogFilterType = 'All';
let eventLogFilterLocation = 'All';
let eventLogScrollOffset = 0;

// --- Tunable Parameters ---
let eventFrequencyMultiplier = 1.0;
let economicVolatilityFactor = 1.0;
// D.3: Add new event type frequency multipliers
let envEventFreqMult = 1.0;
let ecoEventFreqMult = 1.0;
let socEventFreqMult = 1.0;
let techEventFreqMult = 1.0;

// --- D.1: Settings View State ---
let activeSettingsCategory = 'Physics'; // Default category
let keyBindings = {}; // Populated in initializeGame
let keyCodes = {}; // Populated in initializeGame
let rebindingAction = null; // Action name waiting for key press
let enteredSettingsViaPause = false; // How was settings opened?

// --- UI Elements ---
let tradeMenu = { visible: false, x: 20, y: 0, w: 520, h: 500, planet: null, mode: 'BUY', actionButtons: [] };
let uiButtons = {
   minimap: null, largeMapClose: null, eject: null,
   gravityIncrease: null, gravityDecrease: null,
   pauseResume: null, pauseRestart: null,
   tradeModeToggle: null,
   mapNavMap: null, mapNavTradeReport: null,
   reportBackButton: null, reportCommodityItems: [], reportHeaders: [],
   reportCommodityListArea: null, reportTableArea: null,
   mapCommodityItems: [], mapCommodityListArea: null,
   eventLogFilterTypeAll: null, eventLogFilterTypeEco: null, /* ... other filter buttons ... */
   eventLogFilterLocAll: null, eventLogFilterLocSelected: null,
   pauseSettingsEventFreqDec: null, pauseSettingsEventFreqInc: null,
   // D.1, D.2: Settings UI Buttons
   pauseSettings: null, // Button on pause menu to open settings
   settingsClose: null, // Optional close button for settings view
   settingsMenuItems: [], // Buttons for the left menu
   // D.3: Buttons for simple settings
   settingsGravityDec: null, settingsGravityInc: null,
   settingsBoostDec: null, settingsBoostInc: null,
   settingsTimeDilationDec: null, settingsTimeDilationInc: null,
   settingsEconomyTickDec: null, settingsEconomyTickInc: null,
   settingsEventFreqDec: null, settingsEventFreqInc: null,
   settingsMaxEventsDec: null, settingsMaxEventsInc: null,
   settingsEnvFreqDec: null, settingsEnvFreqInc: null,
   settingsEcoFreqDec: null, settingsEcoFreqInc: null,
   settingsSocFreqDec: null, settingsSocFreqInc: null,
   settingsTechFreqDec: null, settingsTechFreqInc: null,
   // D.6: Buttons for key rebinding
   keyRebindButtons: {} // Keyed by actionName
};
let showEscapeConfirmation = false;

// --- Commodity & Recipe Data ---
const availableCommodities = [ /* Unchanged */ { name: "Energy Units", basePrice: 15 }, { name: "HydroFuel", basePrice: 50 }, { name: "Ore-X", basePrice: 180 }, { name: "Cryo Crystals", basePrice: 350 }, { name: "Bio-Mass", basePrice: 100 }, { name: "Food/Supplies", basePrice: 150 }, { name: "Volatiles", basePrice: 25 }, { name: "Heavy Machinery", basePrice: 1200 }, { name: "Quantum Bits", basePrice: 800 }, { name: "Travelers", basePrice: 250 } ];
const ProductionRecipes = { /* Unchanged */ "HydroFuel": { "inputs": { "Energy Units": 3 }, "outputQty": 1, "producedBy": ["Energy Production", "Industrial/Manufacturing"] }, "Food/Supplies": { "inputs": { "Bio-Mass": 1, "Energy Units": 0.5 }, "outputQty": 1, "producedBy": ["Agricultural", "Settlement/Colony"] }, "Heavy Machinery": { "inputs": { "Ore-X": 2, "Energy Units": 4 }, "outputQty": 1, "producedBy": ["Industrial/Manufacturing"] }, "Quantum Bits": { "inputs": { "Cryo Crystals": 1, "Ore-X": 0.5, "Energy Units": 8 }, "outputQty": 1, "producedBy": ["Industrial/Manufacturing", "Research/Scientific"] } };
const PlanetDefinitions = [ /* Unchanged */ { name: "Mercury Prime", orbitRadius: 200, radius: 12, color: { levels: [180, 150, 100] }, orbitSpeed: 0.004, mass: 500, hasMoons: false, archetype: "Volcanic/Molten", economy: "Energy Production", settings: { storageCapacities: { "Energy Units": 50000, "Ore-X": 5000, "HydroFuel": 1000 }, initialTonnageRatio: { "Energy Units": 0.8 }, productionRates: { "Energy Units": 15 }, consumptionRates: { "Ore-X": 0.2 } }, description: "Scorched..." }, { name: "Veridia", orbitRadius: 350, radius: 25, color: { levels: [100, 200, 100] }, orbitSpeed: 0.0025, mass: 2500, hasMoons: true, archetype: "Terran/Habitable", economy: "Agricultural", settings: { storageCapacities: { "Bio-Mass": 40000, "Food/Supplies": 10000, "Energy Units": 5000, "Volatiles": 3000 }, initialTonnageRatio: { "Bio-Mass": 0.7, "Food/Supplies": 0.4 }, productionRates: { "Bio-Mass": 12, "Food/Supplies": 4 }, consumptionRates: { "Energy Units": 3, "Volatiles": 1 } }, description: "A lush..." }, { name: "Terra Nova", orbitRadius: 550, radius: 30, color: { levels: [100, 150, 255] }, orbitSpeed: 0.0018, mass: 4000, hasMoons: true, archetype: "Terran/Habitable", economy: "Settlement/Colony", settings: { storageCapacities: { "Food/Supplies": 15000, "Energy Units": 10000, "Volatiles": 8000, "Travelers": 2000, "Bio-Mass": 5000, "Heavy Machinery": 2000 }, initialTonnageRatio: { "Food/Supplies": 0.6, "Energy Units": 0.5, "Travelers": 0.5 }, productionRates: { "Bio-Mass": 2, "Food/Supplies": 1 }, consumptionRates: { "Food/Supplies": 5, "Energy Units": 6, "Volatiles": 3, "Heavy Machinery": 0.5 } }, description: "Considered..." }, { name: "Ares Station", orbitRadius: 780, radius: 20, color: { levels: [220, 100, 80] }, orbitSpeed: 0.0012, mass: 1800, hasMoons: false, archetype: "Orbital", economy: "Industrial/Manufacturing", settings: { storageCapacities: { "Ore-X": 30000, "Cryo Crystals": 15000, "Energy Units": 25000, "Quantum Bits": 2000, "Heavy Machinery": 5000, "Volatiles": 10000, "HydroFuel": 5000 }, initialTonnageRatio: { "Ore-X": 0.3, "Cryo Crystals": 0.2, "Quantum Bits": 0.1, "Heavy Machinery": 0.1 }, productionRates: { "Quantum Bits": 2, "Heavy Machinery": 3, "HydroFuel": 2 }, consumptionRates: { "Ore-X": 6, "Cryo Crystals": 3, "Energy Units": 15, "Volatiles": 2 } }, description: "A sprawling..." }, { name: "Jupiter Maximus", orbitRadius: 1200, radius: 60, color: { levels: [200, 180, 150] }, orbitSpeed: 0.0008, mass: 10000, hasMoons: true, archetype: "Gas Giant", economy: "Volatiles Harvesting", settings: { storageCapacities: { "Volatiles": 80000, "Energy Units": 10000, "Food/Supplies": 3000, "Heavy Machinery": 500 }, initialTonnageRatio: { "Volatiles": 0.6 }, productionRates: { "Volatiles": 20 }, consumptionRates: { "Energy Units": 5, "Food/Supplies": 1, "Heavy Machinery": 0.2 } }, description: "Dominating..." }, { name: "Saturnus Rings", orbitRadius: 1600, radius: 50, color: { levels: [210, 190, 140] }, orbitSpeed: 0.0005, mass: 8000, hasMoons: true, archetype: "Gas Giant", economy: "Volatiles Harvesting", settings: { storageCapacities: { "Volatiles": 60000, "Energy Units": 8000, "Food/Supplies": 2500, "Heavy Machinery": 300 }, initialTonnageRatio: { "Volatiles": 0.5 }, productionRates: { "Volatiles": 15 }, consumptionRates: { "Energy Units": 4, "Food/Supplies": 0.8, "Heavy Machinery": 0.1 } }, description: "Famous..." }, { name: "Cryos", orbitRadius: 2100, radius: 40, color: { levels: [150, 220, 255] }, orbitSpeed: 0.0003, mass: 5000, hasMoons: false, archetype: "Ice World/Cryonic", economy: "Mining", settings: { storageCapacities: { "Cryo Crystals": 20000, "Volatiles": 15000, "Energy Units": 12000, "Food/Supplies": 4000, "Heavy Machinery": 1500 }, initialTonnageRatio: { "Cryo Crystals": 0.6, "Volatiles": 0.4 }, productionRates: { "Cryo Crystals": 5, "Volatiles": 2 }, consumptionRates: { "Energy Units": 7, "Food/Supplies": 2, "Heavy Machinery": 0.8 } }, description: "A perpetually..." }, { name: "Xylos", orbitRadius: 2600, radius: 35, color: { levels: [180, 120, 200] }, orbitSpeed: 0.0002, mass: 3500, hasMoons: false, archetype: "Rocky/Barren", economy: "Mining", settings: { storageCapacities: { "Ore-X": 35000, "Energy Units": 9000, "Food/Supplies": 2000, "Heavy Machinery": 2500 }, initialTonnageRatio: { "Ore-X": 0.7 }, productionRates: { "Ore-X": 8 }, consumptionRates: { "Energy Units": 4, "Food/Supplies": 0.5, "Heavy Machinery": 1 } }, description: "A desolate..." } ];
const Events = [ /* Copied from provided data */ {"id":"EVT_SOLAR_FLARE","name":"Major Solar Flare","type":"Environmental","headline":"Intense Solar Flare Erupts!","frequency":0.2,"duration":5,"conditions":{"maxOrbitRadius":600},"effects":[{"target":"commodity","commodity":"Energy Units","property":"supplyTons","changeType":"multiply","value":0.1,"scope":"local","reason":"Solar panel output crippled"},{"target":"commodity","commodity":"Travelers","property":"demandTons","changeType":"multiply","value":0.5,"scope":"local","reason":"Transport disrupted"}]},{"id":"EVT_MAGNETIC_STORM","name":"Magnetic Storm","type":"Environmental","headline":"Severe Magnetic Storm Batters Planet!","frequency":0.15,"duration":8,"conditions":{"archetype":["Rocky/Barren","Terran/Habitable"]},"effects":[{"target":"production","commodity":"Quantum Bits","property":"rate","changeType":"multiply","value":0.3,"scope":"local","reason":"Sensitive manufacturing offline"},{"target":"consumption","commodity":"Energy Units","property":"rate","changeType":"multiply","value":1.3,"scope":"local","reason":"Increased shielding power draw"}]},{"id":"EVT_ICE_STORM","name":"Cryo-Storm","type":"Environmental","headline":"Vicious Cryo-Storm Halts Surface Operations!","frequency":0.25,"duration":6,"conditions":{"archetype":["Ice World/Cryonic"]},"effects":[{"target":"production","commodity":"Volatiles","property":"rate","changeType":"multiply","value":0.2,"scope":"local","reason":"Harvesting impossible"},{"target":"production","commodity":"Cryo Crystals","property":"rate","changeType":"multiply","value":0.2,"scope":"local","reason":"Mining impossible"},{"target":"consumption","commodity":"Energy Units","property":"rate","changeType":"multiply","value":1.5,"scope":"local","reason":"Life support working overtime"}]},{"id":"EVT_MINING_BOOM","name":"Mining Boom","type":"Economic","headline":"Rich Vein Discovered - Mining Boom!","frequency":0.3,"duration":15,"conditions":{"economy":["Mining"]},"effects":[{"target":"production","commodity":"Ore-X","property":"rate","changeType":"multiply","value":1.8,"scope":"local"},{"target":"production","commodity":"Cryo Crystals","property":"rate","changeType":"multiply","value":1.5,"scope":"local"},{"target":"consumption","commodity":"Heavy Machinery","property":"rate","changeType":"multiply","value":1.4,"scope":"local","reason":"Expansion needs equipment"},{"target":"commodity","commodity":"Travelers","property":"demandTons","changeType":"add","value":50,"scope":"local","reason":"Influx of workers needed"}]},{"id":"EVT_MARKET_CRASH","name":"Market Crash","type":"Economic","headline":"Sector Market Crash - Luxury Goods Hit Hard!","frequency":0.1,"duration":10,"conditions":{},"effects":[{"target":"commodity","commodity":"Quantum Bits","property":"demandTons","changeType":"multiply","value":0.2,"scope":"global","reason":"Demand plummets"},{"target":"commodity","commodity":"Cryo Crystals","property":"demandTons","changeType":"multiply","value":0.5,"scope":"global","reason":"Demand reduces"}]},{"id":"EVT_EQUIP_FAILURE","name":"Equipment Failure","type":"Economic","headline":"Critical Equipment Failure Disrupts Production!","frequency":0.2,"duration":7,"conditions":{"economy":["Industrial/Manufacturing","Mining","Energy Production","Volatiles Harvesting"]},"effects":[{"target":"production","property":"rate","changeType":"multiply","value":0.4,"scope":"local","reason":"Overall production reduced"},{"target":"commodity","commodity":"Heavy Machinery","property":"demandTons","changeType":"add","value":20,"scope":"local","reason":"Replacement parts needed urgently"}]},{"id":"EVT_WORKER_STRIKE","name":"Worker Strike","type":"Social/Political","headline":"Massive Worker Strike Halts Operations!","frequency":0.15,"duration":8,"conditions":{"economy":["Industrial/Manufacturing","Mining","Agricultural","Volatiles Harvesting"]},"effects":[{"target":"production","property":"rate","changeType":"multiply","value":0.1,"scope":"local"},{"target":"commodity","commodity":"Travelers","property":"supplyTons","changeType":"add","value":30,"scope":"local","reason":"Workers attempting to leave"}]},{"id":"EVT_FESTIVAL","name":"Planetary Festival","type":"Social/Political","headline":"Annual Planetary Festival Begins!","frequency":0.1,"duration":10,"conditions":{"economy":["Settlement/Colony","Agricultural","Trade Hub"]},"effects":[{"target":"consumption","commodity":"Food/Supplies","property":"rate","changeType":"multiply","value":1.5,"scope":"local","reason":"Feasting and celebration"},{"target":"commodity","commodity":"Travelers","property":"demandTons","changeType":"add","value":80,"scope":"local","reason":"Tourists and visitors arriving"}]},{"id":"EVT_POLITICAL_UNREST","name":"Political Unrest","type":"Social/Political","headline":"Growing Political Unrest Disrupts Order!","frequency":0.1,"duration":12,"conditions":{"economy":["Settlement/Colony","Industrial/Manufacturing"]},"effects":[{"target":"production","property":"rate","changeType":"multiply","value":0.7,"scope":"local","reason":"General disruption"},{"target":"commodity","commodity":"Travelers","property":"supplyTons","changeType":"add","value":60,"scope":"local","reason":"People fleeing instability"}]},{"id":"EVT_TECH_BREAKTHROUGH","name":"Efficiency Breakthrough","type":"Technological","headline":"Efficiency Breakthrough Boosts Production!","frequency":0.05,"duration":20,"conditions":{"economy":["Industrial/Manufacturing","Energy Production"]},"effects":[{"target":"production","property":"rate","changeType":"multiply","value":1.2,"scope":"local","reason":"Improved process efficiency"}]} ];


// --- p5.js Core Functions ---
function preload() {}
function setup() { createCanvas(windowWidth, windowHeight); colorMode(RGB, 255); initializeGame(); }

function initializeGame() {
   console.log("Initializing Game - Phase D Settings");
   planets = []; star = new Star(0, 0, 80, color(255, 200, 0), 20000);
   PlanetDefinitions.forEach(def => { let planetColor = color(def.color.levels[0], def.color.levels[1], def.color.levels[2]); planets.push(new Planet(def.name, def.orbitRadius, def.radius, planetColor, def.orbitSpeed, def.mass, def.hasMoons, def.archetype, def.economy, def.settings, def.description)); });
   planets.forEach(p => p.initializeMarket());
   player = new Player(planets[2]); playerState = 'ON_PLANET'; tradeMenu.visible = true; tradeMenu.planet = player.currentPlanet;
   currentView = 'GAME'; currentTimeScaleFactor = 1.0; targetTimeScaleFactor = 1.0;
   selectedReportCommodity = "Energy Units"; reportSortColumn = "Planet"; reportSortDirection = "ASC";
   selectedMapCommodity = null; selectedMapPlanet = null;
   showEscapeConfirmation = false; isPaused = false; scaleFactor = 0.5; gameTickCounter = 0;
   tradeMenu.mode = 'BUY';
   activeEvents = []; eventHistory = []; eventCheckTimer = 0;
   eventLogPanelVisible = false; eventLogFilterType = 'All'; eventLogFilterLocation = 'All'; eventLogScrollOffset = 0;
   eventFrequencyMultiplier = 1.0; economicVolatilityFactor = 1.0;

   // D.1 & D.5: Initialize Settings State & Key Bindings
   activeSettingsCategory = 'Physics';
   keyBindings = {
      PAUSE: 'P', MAP_TOGGLE: 'M', SETTINGS_OPEN: 'O', TRADE_REPORT: 'I',
      BOOST: ' ', // Spacebar represented by ' '
      EJECT: 'Escape',
      ROTATE_LEFT: 'ArrowLeft', ROTATE_RIGHT: 'ArrowRight'
   };
   // Populate keyCodes (important for checking in keyPressed)
   // Need to include common keys and p5 constants
   keyCodes = {
       'P': 80, 'M': 77, 'O': 79, 'I': 73, ' ': 32,
       'Escape': ESCAPE, // p5 constant
       'ArrowLeft': LEFT_ARROW, // p5 constant
       'ArrowRight': RIGHT_ARROW // p5 constant
       // Add more if needed (e.g., numbers, Enter)
   };
   rebindingAction = null;
   enteredSettingsViaPause = false;

    // D.3: Initialize Event Type Multipliers
    envEventFreqMult = 1.0;
    ecoEventFreqMult = 1.0;
    socEventFreqMult = 1.0;
    techEventFreqMult = 1.0;

   calculateUIPositions(); loop();
}

function calculateUIPositions() {
   tradeMenu.x = 20; tradeMenu.y = height - tradeMenu.h - 20;
   let minimapSize = min(width, height) * 0.15; uiButtons.minimap = { x: width - minimapSize - 20, y: 20, w: minimapSize, h: minimapSize, centerX: width - minimapSize / 2 - 20, centerY: 20 + minimapSize / 2, radius: minimapSize * 0.45 };
   let navBtnW = 150; let navBtnH = 30; let navBtnSpacing = 10; let totalNavWidth = navBtnW * 2 + navBtnSpacing; let navStartX = width / 2 - totalNavWidth / 2; let navY = 20;
   uiButtons.mapNavMap = { x: navStartX, y: navY, w: navBtnW, h: navBtnH };
   uiButtons.mapNavTradeReport = { x: navStartX + navBtnW + navBtnSpacing, y: navY, w: navBtnW, h: navBtnH };
   uiButtons.largeMapClose = { x: width - 60, y: navY, w: 40, h: navBtnH };
   uiButtons.eject = { x: width / 2 - 50, y: 20, w: 100, h: 30 }; uiButtons.gravityDecrease = { x: 20, y: height - 50, w: 25, h: 25 }; uiButtons.gravityIncrease = { x: 55 + 100, y: height - 50, w: 25, h: 25 };
   let menuW = 200, menuH = 150; let btnW = 120, btnH = 35; let pauseBtnSpacing = 15; let menuX = width/2 - menuW/2; let menuY = height/2 - menuH/2; uiButtons.pauseResume = { x: width/2 - btnW/2, y: menuY + 35, w: btnW, h: btnH }; uiButtons.pauseRestart = { x: width/2 - btnW/2, y: uiButtons.pauseResume.y + btnH + pauseBtnSpacing, w: btnW, h: btnH };
   // D.1: Add Settings button below Restart on Pause Menu
   uiButtons.pauseSettings = { x: width/2 - btnW/2, y: uiButtons.pauseRestart.y + btnH + pauseBtnSpacing, w: btnW, h: btnH };

   uiButtons.tradeModeToggle = { x: tradeMenu.x + tradeMenu.w - 120 - 15, y: tradeMenu.y + 45, w: 120, h: 25 };
   uiButtons.reportBackButton = { x: 20, y: navY, w: 80, h: navBtnH };
   let reportCommodityListX = 20; let reportCommodityListY = uiButtons.reportBackButton.y + uiButtons.reportBackButton.h + 20; let reportCommodityListW = 150; let reportCommodityListH = height - reportCommodityListY - 30;
   let reportTableX = reportCommodityListX + reportCommodityListW + 20; let reportTableY = reportCommodityListY; let reportTableW = width - reportTableX - 30; let reportTableH = reportCommodityListH;
   uiButtons.reportCommodityListArea = { x: reportCommodityListX, y: reportCommodityListY, w: reportCommodityListW, h: reportCommodityListH };
   uiButtons.reportTableArea = { x: reportTableX, y: reportTableY, w: reportTableW, h: reportTableH };
   let mapCommodityListX = 20; let mapCommodityListY = uiButtons.mapNavMap.y + uiButtons.mapNavMap.h + 20; let mapCommodityListW = 150; let mapCommodityListH = height - mapCommodityListY - 30;
   uiButtons.mapCommodityListArea = { x: mapCommodityListX, y: mapCommodityListY, w: mapCommodityListW, h: mapCommodityListH };

   // D.6 & C.6: Pause Settings Button Positions (Recalculate based on new pause menu size if needed)
   let pauseMenuHeightAdjusted = 300; // Estimate height needed for settings button
   let settingsStartY = uiButtons.pauseRestart.y + uiButtons.pauseRestart.h + 30; // Position below buttons
   let settingBtnW = 25; let settingBtnH = 25; let settingLabelW = 100; let settingValueW = 40; let settingSpacing = 5;
   let settingX = menuX + 15;
   uiButtons.pauseSettingsEventFreqDec = { x: settingX + settingLabelW, y: settingsStartY - settingBtnH / 2, w: settingBtnW, h: settingBtnH };
   uiButtons.pauseSettingsEventFreqInc = { x: settingX + settingLabelW + settingBtnW + settingValueW + settingSpacing, y: settingsStartY - settingBtnH / 2, w: settingBtnW, h: settingBtnH };
   // Add positions for other settings buttons here...

   // Calculate positions for buttons *within* the main settings panel (relative) later in draw functions
}

// --- D.5: Key Binding Helper Functions ---
function getKeyCodeForAction(actionName) {
    const keyName = keyBindings[actionName];
    return keyCodes[keyName] ?? null; // Return null if key or action not found
}

function getKeyNameForAction(actionName) {
    // Special handling for spacebar display
    if (keyBindings[actionName] === ' ') return 'Space';
    return keyBindings[actionName] ?? 'None';
}
// --- End D.5 ---

// --- Main Draw Loop --- (Added SETTINGS view)
function draw() {
   background(5, 5, 15);
   handleGameUpdates();

   switch (currentView) {
       case 'GAME':
           drawGameView();
           break;
       case 'LARGE_MAP':
           drawLargeMapView();
           break;
       case 'TRADE_REPORT':
           drawTradeReportView();
           break;
       case 'SETTINGS': // D.1
           drawSettingsView();
           break;
   }

   if (showEscapeConfirmation) drawEscapeConfirmation();
   if (playerState === 'GAME_OVER') drawGameOver();
   if (isPaused) drawPauseMenu();
}

// --- Update Loop --- (Modified for Settings View Pause)
function handleGameUpdates() {
    // Time Scale Easing & Pause Handling
    // D.1: Ensure settings view also forces timescale to 0
    if (!isPaused && currentView !== 'SETTINGS' && playerState !== 'GAME_OVER') {
        if (abs(currentTimeScaleFactor - targetTimeScaleFactor) > 0.001) {
            currentTimeScaleFactor = lerp(currentTimeScaleFactor, targetTimeScaleFactor, TIME_SCALE_EASING);
        } else {
            currentTimeScaleFactor = targetTimeScaleFactor;
        }
        if (abs(currentTimeScaleFactor) < 0.001 && targetTimeScaleFactor === 0.0) {
            currentTimeScaleFactor = 0.0;
        }
    } else if (isPaused || currentView === 'SETTINGS' || playerState === 'GAME_OVER') { // Settings view forces pause
        currentTimeScaleFactor = 0.0;
        // Don't force targetTimeScaleFactor here, allow it to be restored when exiting settings/pause
        // targetTimeScaleFactor = 0.0;
    }

    // Core Simulation Updates (Conditional on timescale > 0)
    if (!isPaused && currentView !== 'SETTINGS' && playerState !== 'GAME_OVER' && playerState !== 'LOADING' && currentTimeScaleFactor > 0) {
        updateEventManager();
        applyActiveEventEffects();
        planets.forEach(p => p.update());
        player.update(planets, star);
        gameTickCounter += currentTimeScaleFactor;
        if (gameTickCounter >= GAME_MINUTE_INTERVAL_FRAMES) {
            runEconomyTick();
            gameTickCounter -= GAME_MINUTE_INTERVAL_FRAMES;
        }
    }

    // Player Rotation (Not scaled, only in GAME view)
    if (!isPaused && currentView === 'GAME' && playerState === 'ON_PLANET') {
        // D.5: Use key binding check
        if (keyIsDown(getKeyCodeForAction('ROTATE_LEFT'))) player.rotateOnPlanet(-PLAYER_PLANET_ROTATION_SPEED);
        if (keyIsDown(getKeyCodeForAction('ROTATE_RIGHT'))) player.rotateOnPlanet(PLAYER_PLANET_ROTATION_SPEED);
    }
}

// --- Economy Tick ---
function runEconomyTick() { planets.forEach(p => p.economyUpdate()); }

// --- Input Handlers ---
function mouseWheel(event) { /* Unchanged */ if ((currentView === 'LARGE_MAP' || isPaused)) { let logArea = { x: width - 320, y: 60, w: 300, h: height - 80 }; if (isMouseOver(logArea)) { let scrollAmount = Math.sign(event.delta) * 3; eventLogScrollOffset = constrain(eventLogScrollOffset + scrollAmount, 0, max(0, eventHistory.length - 5)); return false; } } if (currentView === 'GAME' || currentView === 'LARGE_MAP') { let zoomDelta = event.delta * -0.001; scaleFactor = constrain(scaleFactor + zoomDelta * scaleFactor, MIN_ZOOM, MAX_ZOOM); console.log("Zoom:", scaleFactor.toFixed(2)); } return false; }

function mousePressed() {
   // Highest priority: Pause Menu clicks
   if (isPaused) {
       if (isMouseOver(uiButtons.pauseResume)) { /* Resume logic unchanged */ isPaused = false; switch(currentView) { case 'GAME': targetTimeScaleFactor = 1.0; break; case 'LARGE_MAP': case 'TRADE_REPORT': targetTimeScaleFactor = TIME_DILATION_FACTOR; break; default: targetTimeScaleFactor = 1.0; } console.log("Game Resumed, target time scale:", targetTimeScaleFactor); return; }
       if (isMouseOver(uiButtons.pauseRestart)) { /* Restart logic unchanged */ console.log("Restarting..."); initializeGame(); return; }
       // D.1: Check for Settings button click on Pause Menu
        if (uiButtons.pauseSettings && isMouseOver(uiButtons.pauseSettings)) {
            enteredSettingsViaPause = true;
            currentView = 'SETTINGS';
            targetTimeScaleFactor = 0.0; // Ensure pause
            currentTimeScaleFactor = 0.0; // Force immediate pause
            isPaused = false; // Exit explicit pause state
            rebindingAction = null;
            console.log("View -> SETTINGS (From Pause)");
            return;
        }
       // C.6 Pause Settings controls moved to SETTINGS view case
       return; // Click on pause overlay
   }

   // Other Overlays / Game States
   if (playerState === 'GAME_OVER') return;
   if (showEscapeConfirmation) { handleEscapeConfirmClick(); return; }

    // --- D.1/D.2: Handle Settings View Clicks ---
    if (currentView === 'SETTINGS') {
        // Optional: Check Close button first
        // if (uiButtons.settingsClose && isMouseOver(uiButtons.settingsClose)) { /* Handle close/exit */ return; }

        // Check menu item clicks
        if (uiButtons.settingsMenuItems) {
             for (const item of uiButtons.settingsMenuItems) {
                 if (isMouseOver(item.rect)) {
                     if (activeSettingsCategory !== item.category) {
                         activeSettingsCategory = item.category;
                         console.log("Settings category ->", activeSettingsCategory);
                         rebindingAction = null; // Cancel rebind when switching category
                     }
                     return; // Consume click
                 }
             }
        }

        // Check for clicks within the active panel
        handleSettingsPanelClick(); // Delegate to helper

        return; // Consume clicks on settings background
    }
    // --- End D.1/D.2 ---


    // Map/Report Nav button clicks (Common to both views)
    if (currentView === 'LARGE_MAP' || currentView === 'TRADE_REPORT') { /* Nav button handling unchanged */ if (isMouseOver(uiButtons.mapNavMap)) { if (currentView !== 'LARGE_MAP') { currentView = 'LARGE_MAP'; console.log("View -> LARGE_MAP (from Report)"); } return; } if (isMouseOver(uiButtons.mapNavTradeReport)) { if (currentView !== 'TRADE_REPORT') { currentView = 'TRADE_REPORT'; console.log("View -> TRADE_REPORT (from Map)"); } return; } }

   // View-Specific UI Interactions
   switch (currentView) {
        case 'GAME': /* GAME view clicks unchanged */ if (tradeMenu.visible && playerState === 'ON_PLANET' && mouseIsInTradeMenu()) { if (isMouseOver(uiButtons.tradeModeToggle)) { tradeMenu.mode = (tradeMenu.mode === 'SELL') ? 'BUY' : 'SELL'; console.log("Trade mode:", tradeMenu.mode); return; } if (handleTradeMenuClick()) { return; } return; } if (isMouseOver(uiButtons.minimap)) { currentView = 'LARGE_MAP'; targetTimeScaleFactor = TIME_DILATION_FACTOR; console.log("View -> LARGE_MAP"); return; } if (isMouseOver(uiButtons.gravityIncrease)) { G = constrain(G + G_INCREMENT, MIN_G, MAX_G); return; } if (isMouseOver(uiButtons.gravityDecrease)) { G = constrain(G - G_INCREMENT, MIN_G, MAX_G); return; } if (playerState === 'IN_SPACE' && isMouseOver(uiButtons.eject)) { showEscapeConfirmation = true; return; } if (playerState === 'ON_PLANET') { playerState = 'AIMING'; player.startAiming(); tradeMenu.visible = false; return; } break;
        case 'LARGE_MAP': /* Map specific clicks unchanged */ if (isMouseOver(uiButtons.largeMapClose)) { currentView = 'GAME'; targetTimeScaleFactor = 1.0; console.log("View -> GAME"); return; } if (uiButtons.mapCommodityItems) { for (const item of uiButtons.mapCommodityItems) { if (isMouseOver(item.rect)) { if (selectedMapCommodity !== item.name) { selectedMapCommodity = item.name; console.log("Selected Map Commodity Filter:", selectedMapCommodity); } return; } } } let mapCenterYOffsetLM = (uiButtons.mapNavMap ? uiButtons.mapNavMap.y + uiButtons.mapNavMap.h + 15 : 30) + 30; let maxOrbitLM = 0; planets.forEach(p => { if (p.orbitRadius > maxOrbitLM) maxOrbitLM = p.orbitRadius; }); let mapRadiusLM = min(width * 0.8, height * 0.7) * 0.5; let mapScaleLM = mapRadiusLM / maxOrbitLM; let mapCXLM = width / 2; let mapCYLM = height / 2 + mapCenterYOffsetLM / 3; let clickedPlanet = null; for (const p of planets) { let pX = mapCXLM + p.pos.x * mapScaleLM; let pY = mapCYLM + p.pos.y * mapScaleLM; let pS = max(3, p.radius * mapScaleLM * 0.5); if (distSq(mouseX, mouseY, pX, pY) < (pS + 2) * (pS + 2)) { clickedPlanet = p; break; } } if (clickedPlanet) { if (selectedMapPlanet === clickedPlanet) { selectedMapPlanet = null; eventLogFilterLocation = 'All'; } else { selectedMapPlanet = clickedPlanet; eventLogFilterLocation = selectedMapPlanet.name; eventLogScrollOffset = 0; } console.log("Selected Map Planet:", selectedMapPlanet ? selectedMapPlanet.name : 'None'); return; } return; break;
        case 'TRADE_REPORT': /* Report specific clicks unchanged */ if (isMouseOver(uiButtons.reportBackButton)) { currentView = 'LARGE_MAP'; console.log("View -> LARGE_MAP (from Report Back)"); return; } for (const item of uiButtons.reportCommodityItems) { if (isMouseOver(item.rect)) { if (selectedReportCommodity !== item.name) { selectedReportCommodity = item.name; console.log("Selected Report Commodity:", selectedReportCommodity); } return; } } for (const header of uiButtons.reportHeaders) { if (isMouseOver(header.rect)) { if (reportSortColumn === header.column) { reportSortDirection = (reportSortDirection === 'ASC' ? 'DESC' : 'ASC'); } else { reportSortColumn = header.column; reportSortDirection = 'ASC'; } console.log(`Sorting Report by: ${reportSortColumn} ${reportSortDirection}`); return; } } return; break;
   }
}

function mouseReleased() { if (isPaused) return; if (currentView === 'GAME' && playerState === 'AIMING') { player.launch(planets, star); playerState = 'IN_SPACE'; } }

// --- D.5: Refactored KeyPressed ---
function keyPressed() {
    // D.6: Handle key capture for rebinding FIRST if active
    if (currentView === 'SETTINGS' && rebindingAction !== null) {
        // Special handling for certain keys (use key name for consistency)
        let capturedKey;
        if (keyCode === ESCAPE) capturedKey = 'Escape';
        else if (keyCode === LEFT_ARROW) capturedKey = 'ArrowLeft';
        else if (keyCode === RIGHT_ARROW) capturedKey = 'ArrowRight';
        else if (keyCode === UP_ARROW) capturedKey = 'ArrowUp'; // Add if needed
        else if (keyCode === DOWN_ARROW) capturedKey = 'ArrowDown'; // Add if needed
        else if (keyCode === 32) capturedKey = ' '; // Store spacebar as ' '
        else if (keyCode === ENTER) capturedKey = 'Enter'; // Add if needed
        else if (keyCode === SHIFT) capturedKey = 'Shift'; // Add if needed
        else if (keyCode === CONTROL) capturedKey = 'Control'; // Add if needed
        else if (keyCode === ALT) capturedKey = 'Alt'; // Add if needed
        else capturedKey = key.toUpperCase(); // Default to uppercase char for consistency

        let capturedKeyCode = keyCode; // Store the actual code

        // --- Validation ---
        // Optional: Cancel on Esc?
        if (capturedKeyCode === ESCAPE) {
            console.log("Rebind cancelled by Esc");
            rebindingAction = null;
            return; // Consume Esc press
        }

        // Check if key is already bound to another action
        let existingAction = null;
        for (const otherAction in keyBindings) {
            if (otherAction !== rebindingAction && keyBindings[otherAction] === capturedKey) {
                existingAction = otherAction;
                break;
            }
        }

        if (existingAction) {
            console.log(`Key "${capturedKey}" already bound to ${existingAction}. Cannot rebind.`);
            // Show visual feedback?
            rebindingAction = null; // Cancel
        } else {
            // Apply Rebind
            console.log(`Rebinding ${rebindingAction} from ${keyBindings[rebindingAction]} to ${capturedKey} (Code: ${capturedKeyCode})`);
            keyBindings[rebindingAction] = capturedKey;
            keyCodes[capturedKey] = capturedKeyCode; // Update/add keyCode lookup
            rebindingAction = null; // Finish rebinding
        }
        return; // Consume the key press used for rebinding
    }

    // --- Settings View Exit (D.1) ---
    if (currentView === 'SETTINGS' && keyCode === getKeyCodeForAction('EJECT')) { // Default Esc
        // If rebindingAction was active, it would have been cancelled above
        if (enteredSettingsViaPause) {
            currentView = 'GAME'; // Assuming return to game, but paused
            isPaused = true;
            targetTimeScaleFactor = 0.0;
            console.log("View -> Paused (From Settings)");
        } else {
            currentView = 'GAME';
            targetTimeScaleFactor = 1.0;
            console.log("View -> GAME (From Settings)");
        }
        return; // Consume Esc key
    }

    // --- Pause Toggle (Refactored) ---
    if (keyCode === getKeyCodeForAction('PAUSE')) { // Default 'P'
        isPaused = !isPaused;
        if (isPaused) {
            targetTimeScaleFactor = 0.0; currentTimeScaleFactor = 0.0; console.log("Paused");
        } else {
             // Restore target time scale based on the underlying view
             switch(currentView) {
                 case 'GAME': targetTimeScaleFactor = 1.0; break;
                 case 'LARGE_MAP': case 'TRADE_REPORT': case 'SETTINGS': targetTimeScaleFactor = TIME_DILATION_FACTOR; break; // Keep dilated if pause during map/report/settings? Or resume fully? Let's keep dilated for now.
                 default: targetTimeScaleFactor = 1.0;
             }
            // If exiting pause AND settings simultaneously, game should resume fully
            if (currentView === 'SETTINGS') targetTimeScaleFactor = 1.0; // Override if settings was open

            console.log("Resumed, target time scale:", targetTimeScaleFactor);
        }
        return;
    }

    if (isPaused) return; // No other actions while paused

    // Game Over Restart (Refactored)
    if (playerState === 'GAME_OVER') {
        if (keyCode === getKeyCodeForAction('BOOST')) { // Default Space
             initializeGame();
        }
        return;
    }

    // Escape Confirmation Handling (Refactored)
    if (showEscapeConfirmation) {
        if (keyCode === ENTER) { // Use ENTER instead of action binding for confirmation
            player.ejectToNearestPlanet(planets);
            showEscapeConfirmation = false;
        } else if (keyCode === getKeyCodeForAction('EJECT')) { // Default Esc
            showEscapeConfirmation = false;
        }
        return; // Consume keys while confirmation is visible
    }

    // --- Settings Hotkey (D.1) ---
    if (keyCode === getKeyCodeForAction('SETTINGS_OPEN') && currentView !== 'SETTINGS') { // Default 'O'
         enteredSettingsViaPause = false;
         currentView = 'SETTINGS';
         targetTimeScaleFactor = 0.0; // Ensure pause
         currentTimeScaleFactor = 0.0; // Force immediate pause
         rebindingAction = null;
         console.log("View -> SETTINGS (Hotkey)");
         return;
    }

    // --- Trade Report Hotkey (D.1) ---
    if (keyCode === getKeyCodeForAction('TRADE_REPORT') && currentView !== 'TRADE_REPORT' && currentView !== 'SETTINGS') { // Default 'I'
        if (currentView === 'GAME') { // Allow from GAME
             currentView = 'TRADE_REPORT';
             targetTimeScaleFactor = TIME_DILATION_FACTOR;
             console.log("View -> TRADE_REPORT (Hotkey)");
             return;
        } else if (currentView === 'LARGE_MAP') { // Allow from MAP
             currentView = 'TRADE_REPORT';
             targetTimeScaleFactor = TIME_DILATION_FACTOR; // Keep dilated
             console.log("View -> TRADE_REPORT (Hotkey)");
             return;
        }
    }


    // --- Map Toggle (Refactored) ---
    if (keyCode === getKeyCodeForAction('MAP_TOGGLE')) { // Default 'M'
        switch (currentView) {
            case 'GAME': currentView = 'LARGE_MAP'; targetTimeScaleFactor = TIME_DILATION_FACTOR; console.log("View -> LARGE_MAP"); break;
            case 'LARGE_MAP': currentView = 'GAME'; targetTimeScaleFactor = 1.0; console.log("View -> GAME"); break;
            case 'TRADE_REPORT': currentView = 'LARGE_MAP'; targetTimeScaleFactor = TIME_DILATION_FACTOR; console.log("View -> LARGE_MAP (from Report via M)"); break;
            // Cannot toggle map from Settings via M
        }
        return;
    }


    // --- In-Game Actions (Only if currentView is GAME) ---
    if (currentView === 'GAME') {
        // Boost (Refactored)
        if (keyCode === getKeyCodeForAction('BOOST') && playerState === 'IN_SPACE') { // Default Space
            player.activateBoost();
            return;
        }
         // Show Eject Confirmation (Refactored, only if not handled by settings exit)
         if (keyCode === getKeyCodeForAction('EJECT') && playerState === 'IN_SPACE') { // Default Esc
             showEscapeConfirmation = true;
             return;
         }
         // Note: Player rotation is handled by keyIsDown in handleGameUpdates
    }
}
// --- End D.5 ---


// --- Helper Functions ---
function handleEscapeConfirmClick() { /* Unchanged */ let boxW=300,bH=120,bX=width/2-bW/2,bY=height/2-bH/2; let btnY=bY+bH-45,btnW=100,btnH=30; let yBtn={x:bX+bW/2-btnW-10,y:btnY,w:btnW,h:btnH}; let nBtn={x:bX+bW/2+10,y:btnY,w:btnW,h:btnH}; if(isMouseOver(yBtn)){player.ejectToNearestPlanet(planets);showEscapeConfirmation=false;return;} if(isMouseOver(nBtn)){showEscapeConfirmation=false;return;} if(!isMouseOver({x:bX,y:bY,w:bW,h:bH})){showEscapeConfirmation=false;} }
function screenToWorld(screenX, screenY) { /* Unchanged */ let wX=player.pos.x+(screenX-width/2)/scaleFactor; let wY=player.pos.y+(screenY-height/2)/scaleFactor; return createVector(wX,wY); }
function isMouseOver(buttonRect) { /* Unchanged */ if(!buttonRect)return false; return mouseX>=buttonRect.x&&mouseX<=buttonRect.x+buttonRect.w&&mouseY>=buttonRect.y&&mouseY<=buttonRect.y+buttonRect.h; }
function drawStarfield() { /* Unchanged */ push(); stroke(255,255,255,150); strokeWeight(max(1,1/scaleFactor)); randomSeed(42); let sR=15000; for(let i=0;i<800;i++){point(random(-sR,sR),random(-sR,sR));} randomSeed(); pop(); }
function calculateTotalAccelerationAt(position, planets, star) { /* Unchanged */ let totalAcc=createVector(0,0); totalAcc.add(star.getGravityForce(position)); planets.forEach(p=>{totalAcc.add(p.getGravityForce(position));}); return totalAcc;}
function distSq(x1, y1, x2, y2) { /* Unchanged */ let dx=x2-x1;let dy=y2-y1;return dx*dx+dy*dy; }
function getSupplyDemandRating(marketDataEntry, planetInstance) { /* Unchanged */ if (!marketDataEntry) return { supply: 'N/A', demand: 'N/A', multiplier: 1.0 }; let supplyRating = 'Medium'; let demandRating = 'Medium'; if (marketDataEntry.maxCapacityTons > 0) { let ratio = marketDataEntry.currentSupplyTons / marketDataEntry.maxCapacityTons; if (ratio < 0.15) supplyRating = 'Very Low'; else if (ratio < 0.35) supplyRating = 'Low'; else if (ratio > 0.85) supplyRating = 'Very High'; else if (ratio > 0.65) supplyRating = 'High'; } else { if (marketDataEntry.currentSupplyTons > 50 * TONS_PER_UNIT) supplyRating = 'Very High'; else if (marketDataEntry.currentSupplyTons < 5 * TONS_PER_UNIT) supplyRating = 'Very Low'; } let prodRate = marketDataEntry.productionRate || 0; let consRate = marketDataEntry.consumptionRate || 0; let demandMultiplier = 1.0; if (planetInstance && planetInstance.productionStatus && planetInstance.productionStatus[marketDataEntry.commodityName]) { demandMultiplier = planetInstance.productionStatus[marketDataEntry.commodityName].demandMultiplier || 1.0; } let effectiveConsRate = consRate * demandMultiplier; if (effectiveConsRate > prodRate * 2 && effectiveConsRate > 1) demandRating = 'High'; if (effectiveConsRate > prodRate * 4 && effectiveConsRate > 2) demandRating = 'Very High'; if (prodRate > effectiveConsRate * 2 && prodRate > 1) demandRating = 'Low'; if (prodRate > effectiveConsRate * 4 && prodRate > 2) demandRating = 'Very Low'; if (consRate === 0 && prodRate === 0 && marketDataEntry.maxCapacityTons > 0 && marketDataEntry.currentSupplyTons < 0.1 * marketDataEntry.maxCapacityTons) demandRating = 'Low'; else if (consRate === 0 && prodRate === 0) demandRating = 'None'; if (demandMultiplier > 1.5 && demandRating === 'Medium') demandRating = 'High'; if (demandMultiplier > 2.5 && (demandRating === 'High' || demandRating === 'Medium')) demandRating = 'Very High'; return { supply: supplyRating, demand: demandRating, multiplier: demandMultiplier }; }
function convertRatingStringToNum(ratingString) { /* Unchanged */ switch (ratingString) { case 'Very Low': return 0; case 'Low': return 1; case 'Medium': return 2; case 'High': return 3; case 'Very High': return 4; default: return 0; } }

// --- C.1: Event Engine Functions ---
function updateEventManager() { /* Unchanged */ for (let i = activeEvents.length - 1; i >= 0; i--) { let event = activeEvents[i]; event.remainingFrames -= 1 * currentTimeScaleFactor; if (event.remainingFrames <= 0) { logEvent(event, 'ended'); activeEvents.splice(i, 1); } } eventCheckTimer += 1 * currentTimeScaleFactor; if (eventCheckTimer >= EVENT_CHECK_INTERVAL_FRAMES) { eventCheckTimer -= EVENT_CHECK_INTERVAL_FRAMES; if (activeEvents.length >= MAX_ACTIVE_EVENTS) { return; } for (const potentialEvent of Events) { let baseTriggerChance = potentialEvent.frequency * (EVENT_CHECK_INTERVAL_FRAMES / (60 * 60)); let actualTriggerChance = baseTriggerChance * eventFrequencyMultiplier; if (random(0, 1) < actualTriggerChance) { tryActivateEvent(potentialEvent); } } } }
function tryActivateEvent(eventDefinition) { /* Unchanged */ const alreadyActive = activeEvents.some(e => e.eventId === eventDefinition.id); if (alreadyActive) return; let targetPlanet = null; let scope = eventDefinition.effects[0]?.scope; let meetsConditions = true; if (scope === 'local') { let potentialTargets = []; for (const planet of planets) { let localConditionsMet = true; const conditions = eventDefinition.conditions; if (conditions.archetype && !conditions.archetype.includes(planet.archetype)) localConditionsMet = false; if (conditions.economy && !conditions.economy.includes(planet.economyType)) localConditionsMet = false; if (conditions.maxOrbitRadius && planet.orbitRadius > conditions.maxOrbitRadius) localConditionsMet = false; if (localConditionsMet) { potentialTargets.push(planet); } } if (potentialTargets.length === 0) { meetsConditions = false; } else { targetPlanet = random(potentialTargets); } } else { meetsConditions = true; } if (meetsConditions) { const durationMinutes = eventDefinition.duration; const durationFrames = durationMinutes * GAME_MINUTE_INTERVAL_FRAMES; const newEvent = { eventId: eventDefinition.id, eventDefinition: eventDefinition, targetPlanet: targetPlanet, startTime: frameCount, durationFrames: durationFrames, remainingFrames: durationFrames }; activeEvents.push(newEvent); logEvent(newEvent, 'started'); console.log(`EVENT ACTIVATED: ${newEvent.eventId} ${targetPlanet ? `on ${targetPlanet.name}` : '(Global)'}`); } }
// --- C.2: Event Effect Application ---
function applyActiveEventEffects() { /* Unchanged */ planets.forEach(p => p.resetEventModifiers()); activeEvents.forEach(event => { const definition = event.eventDefinition; const targetPlanetInstance = event.targetPlanet; definition.effects.forEach(effect => { const scope = effect.scope; if (scope === 'local' && targetPlanetInstance) { targetPlanetInstance.applyEventEffectModifier(effect); } else if (scope === 'global') { planets.forEach(p => { p.applyEventEffectModifier(effect); }); } }); }); }
// --- C.3: Event Logging ---
function logEvent(event, status) { /* Unchanged */ const timestamp = floor(frameCount / GAME_MINUTE_INTERVAL_FRAMES); let message = ""; let location = "System-Wide"; if (event.targetPlanet) location = event.targetPlanet.name; const headline = event.eventDefinition.headline; const eventName = event.eventDefinition.name; const eventType = event.eventDefinition.type; if (status === 'started') { message = `[Min ${timestamp}] ALERT: ${headline} (${location})`; } else if (status === 'ended') { message = `[Min ${timestamp}] INFO: Effects of "${eventName}" ended (${location})`; } if (message) { const logEntry = { timestamp: timestamp, message: message, eventId: event.eventId, eventName: eventName, eventType: eventType, scope: event.eventDefinition.effects[0]?.scope, location: location, status: status }; eventHistory.unshift(logEntry); if (eventHistory.length > MAX_LOG_ENTRIES) { eventHistory.pop(); } console.log(message); } }


// --- Classes ---
class Star { /* Unchanged */ constructor(x,y,r,c,m){this.pos=createVector(x,y);this.radius=r;this.color=c;this.mass=m;this.flareSize=r*1.5;} draw(){push();let fA=map(sin(frameCount*0.02),-1,1,50,150);fill(this.color.levels[0],this.color.levels[1],this.color.levels[2],fA);noStroke();ellipse(this.pos.x,this.pos.y,this.flareSize*map(sin(frameCount*0.02+PI/4),-1,1,0.9,1.1));fill(this.color);ellipse(this.pos.x,this.pos.y,this.radius*2);fill(this.color.levels[0],this.color.levels[1],this.color.levels[2],100);ellipse(this.pos.x,this.pos.y,this.radius*2.5);pop();} getGravityForce(tP){let f=p5.Vector.sub(this.pos,tP);let dSq=constrain(f.magSq(),this.radius*this.radius,Infinity);let s=(G*this.mass)/dSq;f.setMag(s);return f;}}
class Planet {
   constructor(name, orbitRadius, radius, clr, orbitSpeed, mass, hasMoons, archetype, economyType, settings, description) { this.name = name; this.orbitRadius = orbitRadius; this.radius = radius; this.color = clr; this.orbitSpeed = orbitSpeed; this.mass = mass; this.angle = random(TWO_PI); this.pos = createVector(); this.moons = []; this.minimapHighlight = false; this.archetype = archetype; this.economyType = economyType; this.settings = settings; this.description = description; this.marketData = {};
        this.productionStatus = {};
        // C.2: Initialize event modifiers
        this.eventModifiers = { productionRates: {}, consumptionRates: {}, supplyTonsAdd: {}, demandTonsAdd: {} };
        if (hasMoons) { let numMoons=floor(random(1,4)); for (let i=0; i<numMoons; i++) { let mOR=this.radius+random(this.radius*0.5,this.radius*1.5); let mR=constrain(random(this.radius*0.1,this.radius*0.25),1,10); let mS=random(0.01,0.05)*(random()>0.5?1:-1); let mC=lerpColor(this.color,color(200),random(0.5,0.8)); let mA=random(TWO_PI); this.moons.push(new Moon(this, mOR, mR, mC, mS, mA)); } }
        this.updatePosition();
   }
   initializeMarket() { /* Unchanged */ console.log(`Initializing market for ${this.name} (${this.economyType})`); availableCommodities.forEach(c => { let commodityName = c.name; let capacity = this.settings.storageCapacities[commodityName] || 100 * TONS_PER_UNIT; let initialRatio = this.settings.initialTonnageRatio[commodityName] || 0.5; let initialTonnage = floor(capacity * initialRatio); let prodRate = this.settings.productionRates[commodityName] || 0; let consRate = this.settings.consumptionRates[commodityName] || 0; this.marketData[commodityName] = { maxCapacityTons: capacity, currentSupplyTons: constrain(initialTonnage, 0, capacity), productionRate: prodRate, consumptionRate: consRate, buyPrice: c.basePrice, sellPrice: c.basePrice, commodityName: commodityName }; }); this.updateMarketPrices(); }

    economyUpdate() { // Incorporates C.2 changes
        let currentTickStatus = {};
        for (const outputCommodity in ProductionRecipes) {
            const recipe = ProductionRecipes[outputCommodity];
            if (recipe.producedBy.includes(this.economyType)) {
                const outputData = this.marketData[outputCommodity]; if (!outputData) continue;
                let status = { isHaltedInput: false, isHaltedOutput: false, missingInputs: [], canProduce: true };
                const outputProdRateModifier = this.eventModifiers.productionRates[outputCommodity] ?? 1.0; // C.2
                const effectiveOutputQty = recipe.outputQty * outputProdRateModifier;
                const outputTonsNeeded = effectiveOutputQty * TONS_PER_UNIT;
                if (outputData.currentSupplyTons + outputTonsNeeded > outputData.maxCapacityTons) { status.isHaltedOutput = true; status.canProduce = false; }
                for (const inputCommodity in recipe.inputs) { const inputTonsNeeded = recipe.inputs[inputCommodity] * TONS_PER_UNIT; const inputData = this.marketData[inputCommodity]; if (!inputData || inputData.currentSupplyTons < inputTonsNeeded) { status.isHaltedInput = true; status.canProduce = false; status.missingInputs.push(inputCommodity); } }
                if (status.canProduce) { for (const inputCommodity in recipe.inputs) { const inputTonsConsumed = recipe.inputs[inputCommodity] * TONS_PER_UNIT; this.marketData[inputCommodity].currentSupplyTons = max(0, this.marketData[inputCommodity].currentSupplyTons - inputTonsConsumed); } outputData.currentSupplyTons += outputTonsNeeded; }
                currentTickStatus[outputCommodity] = status;
            }
        }
        for (const commodityName in this.marketData) {
            const data = this.marketData[commodityName];
            const prodRateModifier = this.eventModifiers.productionRates[commodityName] ?? 1.0; // C.2
            const consRateModifier = this.eventModifiers.consumptionRates[commodityName] ?? 1.0; // C.2
            const effectiveProdRate = (data.productionRate || 0) * prodRateModifier;
            const effectiveConsRate = (data.consumptionRate || 0) * consRateModifier;
            let baseProducedTons = (!ProductionRecipes[commodityName]) ? effectiveProdRate * TONS_PER_UNIT : 0;
            let baseConsumedTons = effectiveConsRate * TONS_PER_UNIT;
             const supplyTonsAddModifier = this.eventModifiers.supplyTonsAdd[commodityName] ?? 0; // C.2
             const demandTonsAddModifier = this.eventModifiers.demandTonsAdd[commodityName] ?? 0; // C.2 (Effect not fully used yet)
             data.currentSupplyTons += supplyTonsAddModifier;
            data.currentSupplyTons += baseProducedTons;
            data.currentSupplyTons -= baseConsumedTons;
            data.currentSupplyTons = constrain(data.currentSupplyTons, 0, data.maxCapacityTons);
        }
        this.updateDemandMultipliers(currentTickStatus);
        this.updateMarketPrices();
    }

    // C.2: Reset event modifiers
    resetEventModifiers() {
         this.eventModifiers = { productionRates: {}, consumptionRates: {}, supplyTonsAdd: {}, demandTonsAdd: {} };
    }

    // C.2: Apply a single event effect modifier
    applyEventEffectModifier(effect) {
        const target = effect.target; const property = effect.property; const changeType = effect.changeType; const value = effect.value; const commodity = effect.commodity;
        if (target === 'production' && property === 'rate') { if (commodity) { const currentModifier = this.eventModifiers.productionRates[commodity] ?? 1.0; if (changeType === 'multiply') this.eventModifiers.productionRates[commodity] = currentModifier * value; } else { availableCommodities.forEach(c => { if (!ProductionRecipes[c.name] && this.marketData[c.name]?.productionRate > 0) { const currentModifier = this.eventModifiers.productionRates[c.name] ?? 1.0; if (changeType === 'multiply') this.eventModifiers.productionRates[c.name] = currentModifier * value; } }); } }
        else if (target === 'consumption' && property === 'rate') { if (commodity) { const currentModifier = this.eventModifiers.consumptionRates[commodity] ?? 1.0; if (changeType === 'multiply') this.eventModifiers.consumptionRates[commodity] = currentModifier * value; } else { availableCommodities.forEach(c => { if (this.marketData[c.name]?.consumptionRate > 0) { const currentModifier = this.eventModifiers.consumptionRates[c.name] ?? 1.0; if (changeType === 'multiply') this.eventModifiers.consumptionRates[c.name] = currentModifier * value; } }); } }
        else if (target === 'commodity' && property === 'supplyTons') { if (commodity && this.marketData[commodity]) { const currentModifier = this.eventModifiers.supplyTonsAdd[commodity] ?? 0; if (changeType === 'add') this.eventModifiers.supplyTonsAdd[commodity] = currentModifier + value * TONS_PER_UNIT; } }
        else if (target === 'commodity' && property === 'demandTons') { if (commodity) { const currentModifier = this.eventModifiers.demandTonsAdd[commodity] ?? 0; if (changeType === 'add') this.eventModifiers.demandTonsAdd[commodity] = currentModifier + value * TONS_PER_UNIT; } }
    }


   updateDemandMultipliers(currentTickStatus) { /* Unchanged */ const DEMAND_INCREASE_FACTOR = 1.01; const DEMAND_DECREASE_FACTOR = 0.98; const MAX_DEMAND_MULTIPLIER = 3.0; for (const outputCommodity in currentTickStatus) { const status = currentTickStatus[outputCommodity]; const recipe = ProductionRecipes[outputCommodity]; if (status.isHaltedInput) { status.missingInputs.forEach(missingInput => { if (!this.productionStatus[missingInput]) this.productionStatus[missingInput] = { demandMultiplier: 1.0 }; this.productionStatus[missingInput].demandMultiplier = min(this.productionStatus[missingInput].demandMultiplier * DEMAND_INCREASE_FACTOR, MAX_DEMAND_MULTIPLIER); }); } else if (status.canProduce) { for (const inputCommodity in recipe.inputs) { if (this.productionStatus[inputCommodity]) { this.productionStatus[inputCommodity].demandMultiplier = max(1.0, this.productionStatus[inputCommodity].demandMultiplier * DEMAND_DECREASE_FACTOR); } } } } for (const inputCommodity in this.productionStatus) { let neededThisTick = false; for (const outputCommodity in currentTickStatus) { if (currentTickStatus[outputCommodity].missingInputs?.includes(inputCommodity)) { neededThisTick = true; break; } } if (!neededThisTick && this.productionStatus[inputCommodity]?.demandMultiplier > 1.0) { this.productionStatus[inputCommodity].demandMultiplier = max(1.0, this.productionStatus[inputCommodity].demandMultiplier * DEMAND_DECREASE_FACTOR * 0.5); } } }
   updateMarketPrices() { /* Unchanged */ availableCommodities.forEach(c => { let commodityName = c.name; let data = this.marketData[commodityName]; if (!data) return; let supplyRatio = 0.5; if (data.maxCapacityTons > 0) { supplyRatio = constrain(data.currentSupplyTons / data.maxCapacityTons, 0.01, 1.0); } else if (data.currentSupplyTons > 0) { supplyRatio = 1.0; } else { supplyRatio = 0.01; } let sellFactor = map(supplyRatio, 0.01, 1.0, 1.8, 0.9); let buyFactor = map(supplyRatio, 0.01, 1.0, 1.1, 0.5); if (commodityName === "Energy Units") { let distanceFactor = map(this.orbitRadius, PlanetDefinitions[0].orbitRadius, PlanetDefinitions[PlanetDefinitions.length - 1].orbitRadius, 0.8, 1.5, true); sellFactor *= distanceFactor * 0.8; buyFactor *= distanceFactor * 0.7; } let basePrice = c.basePrice; let calculatedSellPrice = floor(basePrice * sellFactor); let calculatedBuyPrice = floor(basePrice * buyFactor); data.sellPrice = max(1, calculatedSellPrice); data.buyPrice = max(1, calculatedBuyPrice); if (data.sellPrice <= data.buyPrice) { data.sellPrice = data.buyPrice + max(1, floor(basePrice * 0.05)); } }); }
   updatePosition() { /* Scaled */ this.angle += this.orbitSpeed * currentTimeScaleFactor; this.angle %= TWO_PI; this.pos.x = this.orbitRadius * cos(this.angle); this.pos.y = this.orbitRadius * sin(this.angle); }
   update() { this.updatePosition(); this.moons.forEach(m => m.update()); this.minimapHighlight = false; }
   getTangentialVelocity() { /* Unchanged */ let sM = abs(this.orbitSpeed * this.orbitRadius); let tA = this.angle + HALF_PI * Math.sign(this.orbitSpeed); return createVector(cos(tA) * sM, sin(tA) * sM); }
   drawOrbit() { /* Unchanged */ push(); noFill(); stroke(255, 255, 255, 30); strokeWeight(max(1, 1 / scaleFactor)); ellipse(0, 0, this.orbitRadius * 2); pop(); }
   draw() { /* Unchanged */ push(); fill(this.color); noStroke(); ellipse(this.pos.x, this.pos.y, this.radius * 2); if (scaleFactor > 0.2) { fill(230); noStroke(); textSize(max(8, 12 / scaleFactor)); textAlign(CENTER, BOTTOM); text(this.name, this.pos.x, this.pos.y - this.radius - 5 / scaleFactor); } pop(); this.moons.forEach(m => m.draw()); }
   getGravityForce(tP) { /* Unchanged */ let f = p5.Vector.sub(this.pos, tP); let dSq = constrain(f.magSq(), this.radius * this.radius * 0.8, Infinity); let s = (G * this.mass) / dSq; f.setMag(s); return f; }
}
class Moon { /* Scaled Update */ constructor(pP, oR, r, c, oS, sA) { this.parent = pP; this.orbitRadius = oR; this.radius = r; this.color = c; this.orbitSpeed = oS; this.angle = sA; this.pos = createVector(); } update() { this.angle += this.orbitSpeed * currentTimeScaleFactor; this.angle %= TWO_PI; this.pos.x = this.parent.pos.x + this.orbitRadius * cos(this.angle); this.pos.y = this.parent.pos.y + this.orbitRadius * sin(this.angle); } draw() { push(); fill(this.color); noStroke(); ellipse(this.pos.x, this.pos.y, this.radius * 2); pop(); } }
class Player { /* Scaled Physics Update */ constructor(startPlanet) { /* Unchanged */ this.radius = 8; this.color = color(255, 255, 255); this.vel = createVector(0, 0); this.currentPlanet = startPlanet; this.angleOnPlanet = atan2(startPlanet.pos.y, startPlanet.pos.x); this.pos = this.calculateLandedPosition(); this.aimStartPos = null; this.trajectoryPoints = []; this.money = 1000; this.inventory = {}; availableCommodities.forEach(c => { this.inventory[c.name] = 0; }); this.maxCargoTons = MAX_CARGO_TONS; this.maxBoostPulses = 5; this.boostPulsesRemaining = this.maxBoostPulses; this.isBoosting = false; this.boostTimer = 0; this.lastTrajectoryMousePos = null; } getCurrentCargoTons() { /* Unchanged */ let totalTons = 0; for (const commodityName in this.inventory) { totalTons += (this.inventory[commodityName] || 0) * TONS_PER_UNIT; } return totalTons; } calculateLandedPosition() { /* Unchanged */ if (!this.currentPlanet) return this.pos; let sO = this.currentPlanet.radius + this.radius * 0.8; return createVector(this.currentPlanet.pos.x + cos(this.angleOnPlanet) * sO, this.currentPlanet.pos.y + sin(this.angleOnPlanet) * sO); } rotateOnPlanet(dA) { /* Unchanged */ if (playerState !== 'ON_PLANET' || !this.currentPlanet) return; this.angleOnPlanet += dA; this.pos = this.calculateLandedPosition(); } update(planets, star) { if (playerState === 'IN_SPACE') { let currentAcc = calculateTotalAccelerationAt(this.pos, planets, star); if (this.isBoosting && this.boostTimer > 0) { let boostDirection = this.vel.magSq() > 0.01 ? this.vel.copy().normalize() : p5.Vector.fromAngle(this.angleOnPlanet); let boostAcc = boostDirection.mult(BOOST_FORCE_MAGNITUDE); currentAcc.add(boostAcc); this.boostTimer--; if (this.boostTimer <= 0) { this.isBoosting = false; } } let effectiveDt = SIMULATION_DT * currentTimeScaleFactor; let nextPos = this.pos.copy().add(p5.Vector.mult(this.vel, effectiveDt)).add(p5.Vector.mult(currentAcc, 0.5 * effectiveDt * effectiveDt)); let nextAcc = calculateTotalAccelerationAt(nextPos, planets, star); if (this.isBoosting && this.boostTimer > 0) { let boostDirection=this.vel.magSq()>0.01?this.vel.copy().normalize():p5.Vector.fromAngle(this.angleOnPlanet);let boostAcc=boostDirection.mult(BOOST_FORCE_MAGNITUDE); nextAcc.add(boostAcc);} let nextVel = this.vel.copy().add(p5.Vector.mult(p5.Vector.add(currentAcc, nextAcc), 0.5 * effectiveDt)); this.pos = nextPos; this.vel = nextVel; for (let p of planets) { let dTC = p5.Vector.dist(this.pos, p.pos); if (dTC < p.radius + this.radius) { let iA = atan2(this.pos.y - p.pos.y, this.pos.x - p.pos.x); this.land(p, iA); break; } } if (dist(this.pos.x, this.pos.y, star.pos.x, star.pos.y) < star.radius + this.radius) { console.error("Collision with star!"); playerState = 'GAME_OVER'; } } else if (playerState === 'ON_PLANET') { this.pos = this.calculateLandedPosition(); this.vel = this.currentPlanet.getTangentialVelocity(); } else if (playerState === 'AIMING') { this.pos = this.calculateLandedPosition(); this.vel = this.currentPlanet.getTangentialVelocity(); let mouseVec = createVector(mouseX, mouseY); let recalcNeeded = false; if (!this.lastTrajectoryMousePos) { recalcNeeded = true; } else { let mouseDistSq = distSq(mouseX, mouseY, this.lastTrajectoryMousePos.x, this.lastTrajectoryMousePos.y); if (mouseDistSq > TRAJECTORY_RECALC_THRESHOLD_SQ) { recalcNeeded = true; } } if (recalcNeeded) { this.trajectoryPoints = this.predictTrajectory(this.pos, planets, star); this.lastTrajectoryMousePos = mouseVec; } } } predictTrajectory(startPos, planets, star) { /* Unchanged */ let pts=[];if(!startPos||!this.currentPlanet)return pts;let mouseWorld=screenToWorld(mouseX,mouseY);let aimDirection=p5.Vector.sub(mouseWorld,this.currentPlanet.pos);aimDirection.normalize();let launchMagnitude=dist(startPos.x,startPos.y,mouseWorld.x,mouseWorld.y);let initialSpeed=constrain(launchMagnitude*LAUNCH_SPEED_MULTIPLIER,0,MAX_LAUNCH_SPEED);let initialVel=p5.Vector.mult(aimDirection,initialSpeed);initialVel.add(this.currentPlanet.getTangentialVelocity());let currentSimPos=startPos.copy();let currentSimVel=initialVel.copy();pts.push(currentSimPos.copy());let dt=TRAJECTORY_DT;for(let i=0;i<TRAJECTORY_STEPS;i++){let currentAcc=calculateTotalAccelerationAt(currentSimPos,planets,star);let nextPos=currentSimPos.copy().add(p5.Vector.mult(currentSimVel,dt)).add(p5.Vector.mult(currentAcc,0.5*dt*dt));let nextAcc=calculateTotalAccelerationAt(nextPos,planets,star);let nextVel=currentSimVel.copy().add(p5.Vector.mult(p5.Vector.add(currentAcc,nextAcc),0.5*dt));currentSimPos=nextPos;currentSimVel=nextVel;pts.push(currentSimPos.copy());if(dist(currentSimPos.x,currentSimPos.y,star.pos.x,star.pos.y)<star.radius)break;let hitPlanet=false;for(let p of planets){if(dist(currentSimPos.x,currentSimPos.y,p.pos.x,p.pos.y)<p.radius){hitPlanet=true;break;}}if(hitPlanet)break;if(currentSimPos.mag()>2*planets[planets.length-1].orbitRadius)break;} return pts;} drawTrajectory() { /* Unchanged */ if(this.trajectoryPoints.length<2)return; push();stroke(255,255,0,180);strokeWeight(max(1,2/scaleFactor));let dL=10/scaleFactor,gL=8/scaleFactor;let startDrawPos=this.pos;if(!startDrawPos)return; drawDashedLine(startDrawPos.x,startDrawPos.y,this.trajectoryPoints[1].x,this.trajectoryPoints[1].y,dL,gL);for(let i=1;i<this.trajectoryPoints.length-1;i++){drawDashedLine(this.trajectoryPoints[i].x,this.trajectoryPoints[i].y,this.trajectoryPoints[i+1].x,this.trajectoryPoints[i+1].y,dL,gL);} pop(); } launch(planets, star) { /* Unchanged */ if(!this.currentPlanet)return;let mouseWorld=screenToWorld(mouseX,mouseY);let aimDirection=p5.Vector.sub(mouseWorld,this.currentPlanet.pos);aimDirection.normalize();let launchMagnitude=dist(this.pos.x,this.pos.y,mouseWorld.x,mouseWorld.y);let initialSpeed=constrain(launchMagnitude*LAUNCH_SPEED_MULTIPLIER,0,MAX_LAUNCH_SPEED);this.vel=p5.Vector.mult(aimDirection,initialSpeed);this.vel.add(this.currentPlanet.getTangentialVelocity());this.currentPlanet=null;this.trajectoryPoints=[];this.aimStartPos=null;this.lastTrajectoryMousePos=null;playerState='IN_SPACE';console.log("Launched!");} draw() { /* Unchanged */ push(); fill(this.color); stroke(0); strokeWeight(max(1, 1 / scaleFactor)); translate(this.pos.x, this.pos.y); if (playerState === 'IN_SPACE' && this.vel.magSq() > 0.01) { rotate(this.vel.heading()); } else if (this.currentPlanet && (playerState === 'ON_PLANET' || playerState === 'AIMING')) { rotate(this.angleOnPlanet); } triangle(-this.radius, this.radius * 0.7, -this.radius, -this.radius * 0.7, this.radius * 1.2, 0); if (this.isBoosting) { fill(255, random(100, 200), 0, 200); noStroke(); let flameLength = this.radius * random(1.5, 2.5); let flameWidth = this.radius * 1.2; triangle(-this.radius * 1.1, flameWidth / 2, -this.radius * 1.1, -flameWidth / 2, -this.radius * 1.1 - flameLength, 0); } pop(); } startAiming() { /* Unchanged */ this.aimStartPos=this.pos.copy();this.trajectoryPoints=[];this.lastTrajectoryMousePos=null;console.log("Aiming started"); } land(planet, impactAngle) { /* Unchanged */ if(playerState!=='IN_SPACE')return;console.log(`Landing on ${planet.name}`);playerState='ON_PLANET';this.currentPlanet=planet;this.vel.set(0,0);this.angleOnPlanet=impactAngle;this.pos=this.calculateLandedPosition();tradeMenu.visible=true;tradeMenu.planet=planet;this.boostPulsesRemaining=this.maxBoostPulses;this.isBoosting=false;this.boostTimer=0;console.log("Boosts reset:",this.boostPulsesRemaining);} activateBoost() { /* Unchanged */ if(this.isBoosting||this.boostPulsesRemaining<=0||playerState!=='IN_SPACE')return;this.isBoosting=true;this.boostTimer=BOOST_DURATION_FRAMES;this.boostPulsesRemaining--;console.log(`Boost activated! Pulses remaining: ${this.boostPulsesRemaining}`);} ejectToNearestPlanet(planets) { /* Unchanged */ if(playerState!=='IN_SPACE'||planets.length===0)return;let nearestPlanet=null,minDSq=Infinity;planets.forEach(p=>{let dSq=p5.Vector.sub(this.pos,p.pos).magSq();if(dSq<minDSq){minDSq=dSq;nearestPlanet=p;}});if(nearestPlanet){console.log(`Ejecting to ${nearestPlanet.name} for $${ESCAPE_POD_COST}`);this.money-=ESCAPE_POD_COST;let ejectLandAngle=atan2(nearestPlanet.pos.y,nearestPlanet.pos.x);this.land(nearestPlanet,ejectLandAngle);}} }

// --- UI Drawing Functions ---
function drawHUD() { /* Restored Definition */ push(); resetMatrix(); fill(200); noStroke(); textSize(16); textAlign(LEFT, TOP); fill(player.money < 0 ? color(255, 100, 100) : color(200)); text(`💰 $${player.money}`, 20, 20); let statusY = 45; if (player.money < 0) { fill(255, 100, 100); textSize(12); text(`(In Debt!)`, 20, 40); statusY = 65; } fill(200); textSize(16); let statusText="Status: Unknown"; if(isPaused){statusText="Status: Paused";}else if(player.currentPlanet){statusText=`Location: ${player.currentPlanet.name}`;if(playerState==='ON_PLANET')statusText+=" (Landed)";if(playerState==='AIMING')statusText=`Aiming from: ${player.currentPlanet.name}`;}else if(playerState==='IN_SPACE'){statusText="Status: In Transit";} text(statusText,20,statusY); let invY=statusY+25; let currentCargoUnits=player.getCurrentCargoTons()/TONS_PER_UNIT; text(`Cargo: ${currentCargoUnits.toFixed(0)} / ${MAX_CARGO_UNITS} Units`,20,invY);invY+=20; text("Inventory:",20,invY); invY+=20; let hasItems=false; availableCommodities.forEach(c=>{let qty=player.inventory[c.name]||0; if(qty>0){hasItems=true;text(`- ${c.name}: ${qty}`,30,invY);invY+=18;}}); if(!hasItems)text("  (Empty)",30,invY); invY+=5; if(playerState==='IN_SPACE'){fill(100,200,255);textSize(14);text(`Boosts: ${player.boostPulsesRemaining}/${player.maxBoostPulses}`,20,invY);invY+=20;} if(playerState==='IN_SPACE'){let btnE=uiButtons.eject; let eC=isMouseOver(btnE)?color(255,80,80,220):color(200,50,50,180);fill(eC);stroke(255,150,150);strokeWeight(1);rect(btnE.x,btnE.y,btnE.w,btnE.h,4);fill(255);noStroke();textAlign(CENTER,CENTER);textSize(14);text("EJECT (Esc)",btnE.x+btnE.w/2,btnE.y+btnE.h/2);} if(playerState==='ON_PLANET'&&!isPaused){textSize(14);textAlign(CENTER,BOTTOM);fill(255,255,0,180);text("Click screen (outside Trade Menu) to Aim. Use ← → to rotate.",width/2,height-40);}else if(playerState==='AIMING'&&!isPaused){textSize(14);textAlign(CENTER,BOTTOM);fill(0,255,0,180);text("Release Mouse Button to Launch!",width/2,height-40);} if(!isPaused){textSize(12); textAlign(RIGHT, BOTTOM); fill(150); text("Press 'P' to Pause", width - 20, height - 20);} pop(); }
function drawMinimap() { /* Restored Definition */ push(); resetMatrix(); let map=uiButtons.minimap; fill(0,0,0,150); stroke(100,150,255,200); strokeWeight(2); ellipse(map.centerX,map.centerY,map.w,map.h); fill(255,200,0); noStroke(); ellipse(map.centerX,map.centerY,8,8); let maxOrbit=0; planets.forEach(p=>{if(p.orbitRadius>maxOrbit)maxOrbit=p.orbitRadius;}); let mapScale=map.radius/maxOrbit; planets.forEach(p=>{ let dR=p.orbitRadius*mapScale; let pX=map.centerX+dR*cos(p.angle); let pY=map.centerY+dR*sin(p.angle); let pS=max(2,p.radius*0.15); if(p.minimapHighlight){fill(0,255,0);ellipse(pX,pY,pS+4,pS+4);} fill(p.color); noStroke(); ellipse(pX,pY,pS,pS); }); if(playerState==='IN_SPACE'){ let pA=atan2(player.pos.y,player.pos.x); let pD=player.pos.mag(); let dD=min(pD*mapScale,map.radius*1.1); let pX=map.centerX+dD*cos(pA); let pY=map.centerY+dD*sin(pA); fill(255); stroke(0); strokeWeight(1); ellipse(pX,pY,6,6); } else if(player.currentPlanet){ let dR=player.currentPlanet.orbitRadius*mapScale; let pX=map.centerX+dR*cos(player.currentPlanet.angle); let pY=map.centerY+dR*sin(player.currentPlanet.angle); fill(255); stroke(0); strokeWeight(1); ellipse(pX,pY,6,6); } if(playerState==='AIMING'&&player.trajectoryPoints.length>1&&player.currentPlanet){ stroke(255,255,0,150); strokeWeight(1.5); noFill(); let startPoint=player.pos; let mapStartPos={x:map.centerX+(startPoint.x/maxOrbit)*map.radius,y:map.centerY+(startPoint.y/maxOrbit)*map.radius}; let nextPoint=player.trajectoryPoints[1]; if(nextPoint){let iDir=p5.Vector.sub(nextPoint,player.trajectoryPoints[0]); if(iDir.magSq()>0.001){iDir.normalize();let eX=mapStartPos.x+iDir.x*map.radius*1.5;let eY=mapStartPos.y+iDir.y*map.radius*1.5;line(mapStartPos.x,mapStartPos.y,eX,eY);let launchDir=iDir; planets.forEach(p=>{if(p===player.currentPlanet)return;let localDR=p.orbitRadius*mapScale;let pX=map.centerX+localDR*cos(p.angle);let pY=map.centerY+localDR*sin(p.angle); let vTP=p5.Vector.sub(createVector(pX,pY),createVector(mapStartPos.x,mapStartPos.y));let dTP=vTP.mag();if(dTP>0){let vFS=vTP;let projD=vFS.dot(launchDir);if(projD>0&&projD<map.radius*2){let projP=p5.Vector.add(createVector(mapStartPos.x,mapStartPos.y),launchDir.copy().mult(projD));let dTL=dist(pX,pY,projP.x,projP.y);let pMS=max(2,p.radius*0.15);if(dTL<pMS*2.5){p.minimapHighlight=true;}}}});}}} noFill(); stroke(100,150,255,100); strokeWeight(1); ellipse(map.centerX,map.centerY,map.w,map.h); pop(); }
function drawGravityControls() { /* Restored Definition */ push(); resetMatrix(); let btnDec=uiButtons.gravityDecrease; let btnInc=uiButtons.gravityIncrease; let textX=btnDec.x+btnDec.w+10; let textY=btnDec.y+btnDec.h/2; fill(isMouseOver(btnDec)?color(200,80,80,220):color(150,50,50,180)); stroke(255,150,150); strokeWeight(1); rect(btnDec.x,btnDec.y,btnDec.w,btnDec.h,4); fill(255); noStroke(); textAlign(CENTER,CENTER); textSize(18); text("-",btnDec.x+btnDec.w/2,btnDec.y+btnDec.h/2-1); fill(200); textSize(14); textAlign(LEFT,CENTER); text(`Gravity (G): ${G.toFixed(2)}`,textX,textY); uiButtons.gravityIncrease.x=textX+textWidth(`Gravity (G): ${G.toFixed(2)}`)+10; btnInc=uiButtons.gravityIncrease; fill(isMouseOver(btnInc)?color(80,200,80,220):color(50,150,50,180)); stroke(150,255,150); strokeWeight(1); rect(btnInc.x,btnInc.y,btnInc.w,btnInc.h,4); fill(255); noStroke(); textAlign(CENTER,CENTER); textSize(18); text("+",btnInc.x+btnInc.w/2,btnInc.y+btnInc.h/2-1); pop(); }
function drawTradeMenu() { /* Restored Definition */ if (!tradeMenu.planet) return; push(); resetMatrix(); fill(20, 30, 60, 220); stroke(100, 150, 255); strokeWeight(2); rect(tradeMenu.x, tradeMenu.y, tradeMenu.w, tradeMenu.h, 10); fill(200, 220, 255); textSize(18); textAlign(CENTER, TOP); text(`Trade Station on ${tradeMenu.planet.name}`, tradeMenu.x + tradeMenu.w / 2, tradeMenu.y + 12); let btnToggle = uiButtons.tradeModeToggle; let toggleText = `Mode: ${tradeMenu.mode === 'SELL' ? 'SELLING' : 'BUYING'}`; let toggleColor = tradeMenu.mode === 'SELL' ? color(200, 80, 80, 200) : color(80, 200, 80, 200); if (isMouseOver(btnToggle)) { toggleColor = tradeMenu.mode === 'SELL' ? color(230, 100, 100, 220) : color(100, 230, 100, 220); } fill(toggleColor); stroke(255); strokeWeight(1); rect(btnToggle.x, btnToggle.y, btnToggle.w, btnToggle.h, 4); fill(255); noStroke(); textSize(12); textAlign(CENTER, CENTER); text(toggleText, btnToggle.x + btnToggle.w / 2, btnToggle.y + btnToggle.h / 2); let yPos = tradeMenu.y + 80; let xMargin = 15; let rowHeight = 26; let btnH = 18; let btnW_S = 25; let btnW_M = 28; let btnW_L = 30; let buttonSpacing = 4; let itemWidth = 110; let haveWidth = 40; let sdWidth = 45; let sellPriceWidth = 60; let buyPriceWidth = 60; let buttonTotalWidth = btnW_S + btnW_M + btnW_L + 2 * buttonSpacing; let buttonStartX = tradeMenu.x + tradeMenu.w - xMargin - buttonTotalWidth; let col_ItemX = tradeMenu.x + xMargin; let col_HaveX = col_ItemX + itemWidth + 10; let col_SDX = col_HaveX + haveWidth + 10; let col_SellPriceX = col_SDX + sdWidth + 15; let col_BuyPriceX = col_SellPriceX + sellPriceWidth + 5; fill(180); textSize(10); textAlign(LEFT, TOP); text("Item", col_ItemX, yPos); textAlign(CENTER, TOP); text("Have", col_HaveX, yPos); textAlign(CENTER, TOP); text("S# / D#", col_SDX, yPos); textAlign(RIGHT, TOP); text("Sell ($/U)", col_SellPriceX + sellPriceWidth - 5, yPos); textAlign(RIGHT, TOP); text("Buy ($/U)", col_BuyPriceX + buyPriceWidth - 5, yPos); textAlign(CENTER, TOP); text(tradeMenu.mode === 'SELL' ? "Sell Qty" : "Buy Qty", buttonStartX + buttonTotalWidth / 2, yPos); yPos += 18; tradeMenu.actionButtons = []; for (const c of availableCommodities) { if (yPos > tradeMenu.y + tradeMenu.h - 15) break; let marketData = tradeMenu.planet.marketData[c.name]; if (!marketData) continue; let playerQtyUnits = player.inventory[c.name] || 0; let sdRating = getSupplyDemandRating(marketData, tradeMenu.planet); let supplyRatingNum = convertRatingStringToNum(sdRating.supply); let demandRatingNum = convertRatingStringToNum(sdRating.demand); let btnY = yPos + (rowHeight - btnH) / 2; fill(220); textSize(11); textAlign(LEFT, CENTER); text(c.name, col_ItemX, yPos + rowHeight / 2); fill(200); textAlign(CENTER, CENTER); text(playerQtyUnits, col_HaveX, yPos + rowHeight / 2); fill(180); textAlign(CENTER, CENTER); textSize(10); text(`${supplyRatingNum}/${demandRatingNum}`, col_SDX, yPos + rowHeight / 2); fill(180); textAlign(RIGHT, CENTER); textSize(10); text(`$${marketData.buyPrice}`, col_SellPriceX + sellPriceWidth - 5, yPos + rowHeight / 2); fill(180); textAlign(RIGHT, CENTER); textSize(10); text(`$${marketData.sellPrice}`, col_BuyPriceX + buyPriceWidth - 5, yPos + rowHeight / 2); let currentButtonX = buttonStartX; [1, 5, 10].forEach((qty, i) => { let currentBtnW = [btnW_S, btnW_M, btnW_L][i]; let isActive = false; let btnColor = color(100); if (tradeMenu.mode === 'SELL') { isActive = playerQtyUnits >= qty; btnColor = color(255, 150, 150, isActive ? 200 : 80); } else { let cost = marketData.sellPrice * qty; let purchaseTonnage = qty * TONS_PER_UNIT; let canAfford = player.money >= cost; let hasSpace = player.getCurrentCargoTons() + purchaseTonnage <= player.maxCargoTons; isActive = canAfford && hasSpace; btnColor = color(150, 255, 150, isActive ? 200 : 80); if (!isActive && !hasSpace && canAfford) { btnColor = color(150, 200, 255, 100); } } fill(btnColor); stroke(200); strokeWeight(1); rect(currentButtonX, btnY, currentBtnW, btnH, 3); fill(isActive ? 0 : 100); textAlign(CENTER, CENTER); textSize(10); text(`${qty}x`, currentButtonX + currentBtnW / 2, btnY + btnH / 2); if (isActive) { tradeMenu.actionButtons.push({ commodity: c.name, qty: qty, rect: { x: currentButtonX, y: btnY, w: currentBtnW, h: btnH } }); } currentButtonX += currentBtnW + buttonSpacing; }); yPos += rowHeight; } pop(); }


function drawGameView() {
    push(); translate(width / 2, height / 2); scale(scaleFactor); translate(-player.pos.x, -player.pos.y);
    drawStarfield(); star.draw(); planets.forEach(p => p.drawOrbit()); planets.forEach(p => p.draw()); player.draw(); if (playerState === 'AIMING') player.drawTrajectory();
    pop();
    // These calls should now work as the functions are defined
    drawHUD();
    drawMinimap();
    drawGravityControls();
    if (tradeMenu.visible && playerState === 'ON_PLANET') drawTradeMenu();
     // C.4: Draw Event Log Snippet in Game View
     drawEventLogSnippet();
}

// B.5 & C.5 & C.4 Updated Map View
function drawLargeMapView(isBackground = false) {
    push(); resetMatrix();
    fill(0, 0, 20, isBackground ? 150 : 220); rect(0, 0, width, height);
    let btnMap = uiButtons.mapNavMap; let btnReport = uiButtons.mapNavTradeReport; let btnClose = uiButtons.largeMapClose;
    let titleY = 30;
    if (!isBackground && btnMap && btnReport) { /* Draw Nav buttons */ titleY = btnMap.y + btnMap.h + 15; let mapBtnColor=(currentView === 'LARGE_MAP')?color(150,180,255,220):color(50,70,100,180); if(currentView !== 'LARGE_MAP' && isMouseOver(btnMap)) mapBtnColor=color(80,100,140,200); fill(mapBtnColor); stroke(150,180,255); strokeWeight(1); rect(btnMap.x,btnMap.y,btnMap.w,btnMap.h,4); fill(230); noStroke(); textSize(14); textAlign(CENTER,CENTER); text("[ MAP ]",btnMap.x+btnMap.w/2,btnMap.y+btnMap.h/2); let reportBtnColor=(currentView === 'TRADE_REPORT')?color(150,180,255,220):color(50,70,100,180); if(currentView !== 'TRADE_REPORT' && isMouseOver(btnReport)) reportBtnColor=color(80,100,140,200); fill(reportBtnColor); stroke(150,180,255); strokeWeight(1); rect(btnReport.x,btnReport.y,btnReport.w,btnReport.h,4); fill(230); noStroke(); textSize(14); textAlign(CENTER,CENTER); text("[ TRADE REPORT ]",btnReport.x+btnReport.w/2,btnReport.y+btnReport.h/2); fill(200, 220, 255); textSize(24); textAlign(CENTER, TOP); text("Solar System Map", width / 2, titleY); }
    if (!isBackground) { drawMapCommodityList(); }

    /* Draw Map Visualization */ let mapCenterYOffset = titleY + 30; let maxOrbit = 0; planets.forEach(p => { if (p.orbitRadius > maxOrbit) maxOrbit = p.orbitRadius; }); let mapRadius = min(width * 0.8, height * 0.7) * 0.5; let mapScale = maxOrbit > 0 ? mapRadius / maxOrbit : mapRadius; let mapCX = width / 2; let mapCY = height / 2 + mapCenterYOffset / 3; fill(255, 200, 0); noStroke(); ellipse(mapCX, mapCY, max(10, 20 * mapScale), max(10, 20 * mapScale));
    planets.forEach(p => {
        let pX = mapCX + p.pos.x * mapScale; let pY = mapCY + p.pos.y * mapScale; let pS = max(3, p.radius * mapScale * 0.5);
        noFill(); stroke(255, 255, 255, 50); strokeWeight(1); ellipse(mapCX, mapCY, p.orbitRadius * mapScale * 2); // Use actual orbit radius
        fill(p.color); noStroke(); ellipse(pX, pY, pS, pS);

        // C.5: Draw Selection Halo
        if (!isBackground && selectedMapPlanet === p) {
             push(); noFill(); stroke(255, 255, 0, 200); strokeWeight(2); ellipse(pX, pY, pS * 2 + 4); pop();
        }

        // B.5: Draw S/D Indicator
        if (!isBackground && selectedMapCommodity) { let marketData = p.marketData[selectedMapCommodity]; if (marketData) { let sdRating = getSupplyDemandRating(marketData, p); let sNum = convertRatingStringToNum(sdRating.supply); let dNum = convertRatingStringToNum(sdRating.demand); fill(230, 230, 230, 200); noStroke(); textSize(max(6, 9 / (mapScale > 0 ? mapScale : 1) * 0.01)); textAlign(CENTER, TOP); text(`S:${sNum} D:${dNum}`, pX, pY + pS * 0.7 + 2); } }
        // Planet name drawing
        if (!isBackground || mapScale > 0.001) { fill(220); textSize(max(8, 10 / (mapScale > 0 ? mapScale : 1) * 0.01)); textAlign(CENTER, BOTTOM); text(p.name, pX, pY - pS * 0.7 - 2); }
    });
    if (!isBackground) { /* Draw Player Icon & Close Button */ if (playerState === 'IN_SPACE') { let pA=atan2(player.pos.y,player.pos.x); let pD=player.pos.mag(); let dD=min(pD*mapScale,mapRadius*1.1); let pX=mapCX+dD*cos(pA); let pY=mapCY+dD*sin(pA); fill(255); stroke(0); strokeWeight(1); ellipse(pX,pY,8,8); fill(255); noStroke(); textAlign(CENTER,TOP); textSize(10); text("You",pX,pY+5); } else if (player.currentPlanet) { let dR=player.currentPlanet.orbitRadius*mapScale; let pX=mapCX+dR*cos(player.currentPlanet.angle); let pY=mapCY+dR*sin(player.currentPlanet.angle); fill(255); stroke(0); strokeWeight(1); ellipse(pX,pY,8,8); fill(255); noStroke(); textAlign(CENTER,TOP); textSize(10); text("You",pX,pY+5); } if (btnClose) { fill(isMouseOver(btnClose) ? color(230, 100, 100) : color(200, 80, 80, 200)); stroke(255, 150, 150); strokeWeight(1); rect(btnClose.x, btnClose.y, btnClose.w, btnClose.h, 3); fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(14); text("X", btnClose.x + btnClose.w / 2, btnClose.y + btnClose.h / 2); } }

     // C.4: Draw Full Event Log Panel on Map View
     if (!isBackground) {
         drawFullEventLog();
     }
    pop();
}
function drawMapCommodityList() { /* Unchanged */ let area = uiButtons.mapCommodityListArea; if (!area) return; uiButtons.mapCommodityItems = []; fill(15, 25, 50, 210); stroke(80, 120, 200); rect(area.x, area.y, area.w, area.h, 5); let yPos = area.y + 10; let itemHeight = 22; textSize(12); let clearRect = { x: area.x + 5, y: yPos, w: area.w - 10, h: itemHeight }; let isClearHover = isMouseOver(clearRect); let isClearSelected = (selectedMapCommodity === null); if (isClearSelected) { fill(80, 120, 200, 200); noStroke(); rect(clearRect.x, clearRect.y, clearRect.w, clearRect.h, 3); } else if (isClearHover) { fill(50, 80, 130, 180); noStroke(); rect(clearRect.x, clearRect.y, clearRect.w, clearRect.h, 3); } fill(isClearSelected ? 255 : 200); textAlign(CENTER, CENTER); text("[Clear Filter]", clearRect.x + clearRect.w / 2, clearRect.y + clearRect.h / 2); uiButtons.mapCommodityItems.push({ name: null, rect: clearRect }); yPos += itemHeight + 3; for (const commodity of availableCommodities) { if (yPos > area.y + area.h - itemHeight - 5) break; let itemRect = { x: area.x + 5, y: yPos, w: area.w - 10, h: itemHeight }; let isSelected = (commodity.name === selectedMapCommodity); let isHover = isMouseOver(itemRect); if (isSelected) { fill(80, 120, 200, 200); noStroke(); rect(itemRect.x, itemRect.y, itemRect.w, itemRect.h, 3); } else if (isHover) { fill(50, 80, 130, 180); noStroke(); rect(itemRect.x, itemRect.y, itemRect.w, itemRect.h, 3); } fill(isSelected ? 255 : 200); textAlign(LEFT, CENTER); text(commodity.name, itemRect.x + 8, itemRect.y + itemRect.h / 2); uiButtons.mapCommodityItems.push({ name: commodity.name, rect: itemRect }); yPos += itemHeight + 3; } }

function drawTradeReportView() { /* Unchanged */ drawLargeMapView(true); push(); resetMatrix(); let btnMap = uiButtons.mapNavMap; let btnReport = uiButtons.mapNavTradeReport; let titleY = (btnMap ? btnMap.y + btnMap.h + 15 : 30); fill(200, 220, 255); textSize(24); textAlign(CENTER, TOP); text("Trade Report", width / 2, titleY); if (btnMap && btnReport) { let mapBtnColor = (currentView === 'LARGE_MAP') ? color(150, 180, 255, 220) : color(50, 70, 100, 180); if (currentView !== 'LARGE_MAP' && isMouseOver(btnMap)) mapBtnColor = color(80, 100, 140, 200); fill(mapBtnColor); stroke(150, 180, 255); strokeWeight(1); rect(btnMap.x, btnMap.y, btnMap.w, btnMap.h, 4); fill(230); noStroke(); textSize(14); textAlign(CENTER, CENTER); text("[ MAP ]", btnMap.x + btnMap.w / 2, btnMap.y + btnMap.h / 2); let reportBtnColor = (currentView === 'TRADE_REPORT') ? color(150, 180, 255, 220) : color(50, 70, 100, 180); fill(reportBtnColor); stroke(150, 180, 255); strokeWeight(1); rect(btnReport.x, btnReport.y, btnReport.w, btnReport.h, 4); fill(230); noStroke(); textSize(14); textAlign(CENTER, CENTER); text("[ TRADE REPORT ]", btnReport.x + btnReport.w / 2, btnReport.y + btnReport.h / 2); } let btnBack = uiButtons.reportBackButton; if (btnBack) { fill(isMouseOver(btnBack) ? color(200, 150, 80, 220) : color(150, 100, 50, 180)); stroke(255, 200, 150); strokeWeight(1); rect(btnBack.x, btnBack.y, btnBack.w, btnBack.h, 4); fill(230); noStroke(); textSize(14); textAlign(CENTER, CENTER); text("Back", btnBack.x + btnBack.w / 2, btnBack.y + btnBack.h / 2); } drawReportCommodityList(); drawReportDataTable(); pop(); }
function drawReportCommodityList() { /* Unchanged */ let area = uiButtons.reportCommodityListArea; if (!area) return; uiButtons.reportCommodityItems = []; fill(15, 25, 50, 210); stroke(80, 120, 200); rect(area.x, area.y, area.w, area.h, 5); let yPos = area.y + 10; let itemHeight = 22; textSize(12); for (const commodity of availableCommodities) { if (yPos > area.y + area.h - itemHeight - 5) break; let itemRect = { x: area.x + 5, y: yPos, w: area.w - 10, h: itemHeight }; let isSelected = (commodity.name === selectedReportCommodity); let isHover = isMouseOver(itemRect); if (isSelected) { fill(80, 120, 200, 200); noStroke(); rect(itemRect.x, itemRect.y, itemRect.w, itemRect.h, 3); } else if (isHover) { fill(50, 80, 130, 180); noStroke(); rect(itemRect.x, itemRect.y, itemRect.w, itemRect.h, 3); } fill(isSelected ? 255 : 200); textAlign(LEFT, CENTER); text(commodity.name, itemRect.x + 8, itemRect.y + itemRect.h / 2); uiButtons.reportCommodityItems.push({ name: commodity.name, rect: itemRect }); yPos += itemHeight + 3; } }
function drawReportDataTable() { /* Unchanged */ let area = uiButtons.reportTableArea; if (!area) return; uiButtons.reportHeaders = []; let reportData = []; for (const planet of planets) { let marketData = planet.marketData[selectedReportCommodity]; if (!marketData) continue; let sdRating = getSupplyDemandRating(marketData, planet); reportData.push({ planetName: planet.name, geo: planet.archetype, econ: planet.economyType, supplyNum: convertRatingStringToNum(sdRating.supply), demandNum: convertRatingStringToNum(sdRating.demand), buyPrice: marketData.buyPrice, sellPrice: marketData.sellPrice, }); } reportData.sort((a, b) => { let valA, valB; switch (reportSortColumn) { case 'Planet': valA = a.planetName; valB = b.planetName; break; case 'Geo': valA = a.geo; valB = b.geo; break; case 'Econ': valA = a.econ; valB = b.econ; break; case 'S#': valA = a.supplyNum; valB = b.supplyNum; break; case 'D#': valA = a.demandNum; valB = b.demandNum; break; case 'Buy $': valA = a.buyPrice; valB = b.buyPrice; break; case 'Sell $': valA = a.sellPrice; valB = b.sellPrice; break; default: return 0; } let comparison = (typeof valA === 'string') ? valA.localeCompare(valB) : (valA - valB); return reportSortDirection === 'ASC' ? comparison : -comparison; }); fill(15, 25, 50, 210); stroke(80, 120, 200); rect(area.x, area.y, area.w, area.h, 5); let headerY = area.y + 15; let rowStartY = headerY + 25; let rowHeight = 20; let xPadding = 10; let availW = area.w - 2 * xPadding; let col_Planet_W = availW * 0.22; let col_Geo_W = availW * 0.18; let col_Econ_W = availW * 0.20; let col_S_W = availW * 0.08; let col_D_W = availW * 0.08; let col_Buy_W = availW * 0.12; let col_Sell_W = availW * 0.12; let col_Planet_X = area.x + xPadding; let col_Geo_X = col_Planet_X + col_Planet_W; let col_Econ_X = col_Geo_X + col_Geo_W; let col_S_X = col_Econ_X + col_Econ_W; let col_D_X = col_S_X + col_S_W; let col_Buy_X = col_D_X + col_D_W; let col_Sell_X = col_Buy_X + col_Buy_W; textSize(10); fill(180); const headers = [ { name: "Planet", x: col_Planet_X, w: col_Planet_W, align: LEFT }, { name: "Geo", x: col_Geo_X, w: col_Geo_W, align: LEFT }, { name: "Econ", x: col_Econ_X, w: col_Econ_W, align: LEFT }, { name: "S#", x: col_S_X, w: col_S_W, align: CENTER }, { name: "D#", x: col_D_X, w: col_D_W, align: CENTER }, { name: "Buy $", x: col_Buy_X, w: col_Buy_W, align: RIGHT }, { name: "Sell $", x: col_Sell_X, w: col_Sell_W, align: RIGHT } ]; uiButtons.reportHeaders = []; headers.forEach(h => { textAlign(h.align, CENTER); let headerText = h.name; let headerRect = { x: h.x, y: area.y + 5, w: h.w, h: 25 }; let isSortCol = (h.name === reportSortColumn); if (isSortCol) headerText += (reportSortDirection === 'ASC' ? ' ▲' : ' ▼'); fill(isSortCol ? 230 : (isMouseOver(headerRect) ? 255 : 180)); text(headerText, h.align === LEFT ? h.x + 2 : (h.align === RIGHT ? h.x + h.w - 2 : h.x + h.w / 2), headerY); uiButtons.reportHeaders.push({ column: h.name, rect: headerRect }); }); let currentY = rowStartY; fill(210); textSize(11); for (const row of reportData) { if (currentY > area.y + area.h - rowHeight) break; textAlign(LEFT, CENTER); text(row.planetName, col_Planet_X + 2, currentY + rowHeight / 2); text(row.geo, col_Geo_X + 2, currentY + rowHeight / 2); text(row.econ, col_Econ_X + 2, currentY + rowHeight / 2); textAlign(CENTER, CENTER); text(row.supplyNum, col_S_X + col_S_W / 2, currentY + rowHeight / 2); text(row.demandNum, col_D_X + col_D_W / 2, currentY + rowHeight / 2); textAlign(RIGHT, CENTER); text(`$${row.buyPrice}`, col_Buy_X + col_Buy_W - 2, currentY + rowHeight / 2); text(`$${row.sellPrice}`, col_Sell_X + col_Sell_W - 2, currentY + rowHeight / 2); currentY += rowHeight; } }
function handleTradeMenuClick() { /* Unchanged */ for (let btn of tradeMenu.actionButtons) { if (isMouseOver(btn.rect)) { if (tradeMenu.mode === 'SELL') { sellCommodity(btn.commodity, btn.qty); } else { buyCommodity(btn.commodity, btn.qty); } return true; } } return false; }
function buyCommodity(commodityName, quantity) { /* Unchanged */ if (!tradeMenu.planet) return; let marketData = tradeMenu.planet.marketData[commodityName]; if (!marketData) return; let cost = marketData.sellPrice * quantity; let purchaseTonnage = quantity * TONS_PER_UNIT; if (player.money >= cost) { if (player.getCurrentCargoTons() + purchaseTonnage <= player.maxCargoTons) { player.money -= cost; player.inventory[commodityName] = (player.inventory[commodityName] || 0) + quantity; console.log(`Bought ${quantity}U (${purchaseTonnage}T) ${commodityName}`); tradeMenu.planet.updateMarketPrices(); } else { console.log("Not enough cargo space!"); } } else { console.log("Not enough money!"); } }
function sellCommodity(commodityName, quantity) { /* Unchanged */ if (!tradeMenu.planet) return; let marketData = tradeMenu.planet.marketData[commodityName]; if (!marketData) return; let playerQtyUnits = player.inventory[commodityName] || 0; let sellQtyUnits = min(quantity, playerQtyUnits); let sellTonnage = sellQtyUnits * TONS_PER_UNIT; if (sellQtyUnits > 0) { let earnings = marketData.buyPrice * sellQtyUnits; player.money += earnings; player.inventory[commodityName] -= sellQtyUnits; console.log(`Sold ${sellQtyUnits}U (${sellTonnage}T) ${commodityName}`); tradeMenu.planet.updateMarketPrices(); } else { console.log("Not enough to sell!"); } }
function mouseIsInTradeMenu() { /* Unchanged */ return mouseX > tradeMenu.x && mouseX < tradeMenu.x + tradeMenu.w && mouseY > tradeMenu.y && mouseY < tradeMenu.y + tradeMenu.h; }
function drawDashedLine(x1, y1, x2, y2, dL, gL) { /* Unchanged */ const lL=dist(x1,y1,x2,y2);if(lL<=0)return;const a=atan2(y2-y1,x2-x1);const tL=dL+gL;if(tL<=0)return;push();if(drawingContext.setLineDash){drawingContext.save();drawingContext.setLineDash([dL,gL]);drawingContext.beginPath();drawingContext.moveTo(x1,y1);drawingContext.lineTo(x2,y2);drawingContext.stroke();drawingContext.restore();}else{line(x1,y1,x2,y2);} pop();}
function drawEscapeConfirmation() { /* Unchanged */ push(); resetMatrix(); fill(0,0,0,180); rect(0,0,width,height); let bW=300,bH=120,bX=width/2-bW/2,bY=height/2-bH/2; fill(30,40,70,230); stroke(100,150,255); strokeWeight(2); rect(bX,bY,bW,bH,8); fill(220); noStroke(); textSize(16); textAlign(CENTER,CENTER); text(`Use escape pod (Enter)?\nCost: $${ESCAPE_POD_COST}`,bX+bW/2,bY+bH/2-20); if(player.money<ESCAPE_POD_COST){fill(255,150,150);textSize(12);text(`(This will increase your debt!)`,bX+bW/2,bY+bH/2+10);} let btnY=bY+bH-45,btnW=100,btnH=30; let yBX=bX+bW/2-btnW-10; let nBX=bX+bW/2+10; fill(isMouseOver({x:yBX,y:btnY,w:btnW,h:btnH})?color(80,200,80,220):color(50,150,50,180)); stroke(150,255,150); strokeWeight(1); rect(yBX,btnY,btnW,btnH,4); fill(255); noStroke(); textSize(14); text("Yes (Ent)",yBX+btnW/2,btnY+btnH/2); fill(isMouseOver({x:nBX,y:btnY,w:btnW,h:btnH})?color(200,80,80,220):color(150,50,50,180)); stroke(255,150,150); strokeWeight(1); rect(nBX,btnY,btnW,btnH,4); fill(255); noStroke(); textSize(14); text("No (Esc)",nBX+btnW/2,btnY+btnH/2); pop();}
function drawGameOver() { /* Unchanged */ push(); resetMatrix(); fill(255,0,0,150); rect(0,0,width,height); fill(255); textSize(64); textAlign(CENTER,CENTER); text("GAME OVER",width/2,height/2-40); textSize(24); text("Your ship met its demise!\nPress SPACEBAR to restart.",width/2,height/2+40); pop(); noLoop(); }
function windowResized() { /* Unchanged */ resizeCanvas(windowWidth, windowHeight); calculateUIPositions(); }

// C.4, C.6: Updated Pause Menu
function drawPauseMenu() {
    push(); resetMatrix(); fill(0, 0, 0, 180); rect(0, 0, width, height);
    // D.1: Adjust pause menu size to fit settings button
    let menuW = 200, menuH = 300; // Increased height for settings button
    let menuX = width / 2 - menuW / 2; let menuY = height / 2 - menuH / 2;
    fill(30, 40, 70, 230); stroke(100, 150, 255); strokeWeight(2); rect(menuX, menuY, menuW, menuH, 8);
    fill(220); noStroke(); textSize(24); textAlign(CENTER, TOP); text("Paused", width / 2, menuY + 15);

    // Resume / Restart Buttons
    let btnRsm = uiButtons.pauseResume; fill(isMouseOver(btnRsm) ? color(80, 200, 80, 220) : color(50, 150, 50, 180)); stroke(150, 255, 150); strokeWeight(1); rect(btnRsm.x, btnRsm.y, btnRsm.w, btnRsm.h, 4); fill(255); noStroke(); textSize(16); textAlign(CENTER, CENTER); text("Resume (P)", btnRsm.x + btnRsm.w / 2, btnRsm.y + btnRsm.h / 2);
    let btnRst = uiButtons.pauseRestart; fill(isMouseOver(btnRst) ? color(200, 150, 80, 220) : color(150, 100, 50, 180)); stroke(255, 200, 150); strokeWeight(1); rect(btnRst.x, btnRst.y, btnRst.w, btnRst.h, 4); fill(255); noStroke(); textSize(16); textAlign(CENTER, CENTER); text("Restart", btnRst.x + btnRst.w / 2, btnRst.y + btnRst.h / 2);

    // D.1: Draw Settings Button
    let btnSet = uiButtons.pauseSettings;
    if (btnSet) { // Check if calculated
        fill(isMouseOver(btnSet) ? color(180, 180, 210) : color(120, 120, 150));
        stroke(200); strokeWeight(1);
        rect(btnSet.x, btnSet.y, btnSet.w, btnSet.h, 4);
        fill(255); noStroke(); textSize(16); textAlign(CENTER, CENTER);
        text("Settings (O)", btnSet.x + btnSet.w / 2, btnSet.y + btnSet.h / 2);
    }

    // C.6: Basic Settings Display (Keep?) - Or remove entirely now Settings view exists? Remove for cleaner pause.
    /* REMOVED Settings Display from Pause Menu - Now in Settings View
    let settingsY = uiButtons.pauseRestart.y + uiButtons.pauseRestart.h + 30;
    textSize(14); fill(200); textAlign(LEFT, CENTER);
    text("Event Freq:", menuX + 15, settingsY);
    let btnDec = uiButtons.pauseSettingsEventFreqDec; if (btnDec) { ... draw button ... }
    textAlign(CENTER, CENTER); textSize(14); fill(200); let valX = ...; text(eventFrequencyMultiplier.toFixed(1), valX, settingsY);
    let btnInc = uiButtons.pauseSettingsEventFreqInc; if (btnInc) { ... draw button ... }
    */

    // C.4: Draw Full Event Log Panel on Pause Screen
    drawFullEventLog();

    pop();
}


// C.4: Event Log UI Drawing Functions
function drawEventLogSnippet() { /* Unchanged */ const snippetHeight = 60; const snippetWidth = 300; const snippetX = width - snippetWidth - 15; const snippetY = uiButtons.minimap.y + uiButtons.minimap.h + 10; const maxEntries = 3; const entryHeight = 16; push(); resetMatrix(); fill(10, 15, 30, 180); stroke(70, 90, 130); rect(snippetX, snippetY, snippetWidth, snippetHeight, 5); fill(180); textSize(10); textAlign(LEFT, TOP); let currentY = snippetY + 5; for(let i = 0; i < min(eventHistory.length, maxEntries); i++) { if (currentY > snippetY + snippetHeight - entryHeight + 2) break; const entry = eventHistory[i]; if (entry.status === 'started') { fill(255, 180, 180); } else if (entry.status === 'ended') { fill(180, 220, 255); } else { fill(180); } text(entry.message, snippetX + 5, currentY, snippetWidth - 10); currentY += entryHeight; } pop(); }
function drawFullEventLog() { /* Unchanged */ const panelW = 300; const panelX = width - panelW - 15; const panelY = uiButtons.mapNavMap ? uiButtons.mapNavMap.y + uiButtons.mapNavMap.h + 10 : 60; const panelH = height - panelY - 20; const filterAreaH = 40; const listAreaY = panelY + filterAreaH + 5; const listAreaH = panelH - filterAreaH - 10; const entryHeight = 15; const scrollbarWidth = 10; push(); resetMatrix(); fill(10, 15, 30, 210); stroke(70, 90, 130); rect(panelX, panelY, panelW, panelH, 5); fill(200); textSize(14); textAlign(CENTER, TOP); text("Event Log", panelX + panelW / 2, panelY + 8); textSize(10); textAlign(LEFT, TOP); fill(150); text(`Filter: ${eventLogFilterType}`, panelX + 5, panelY + 25); let locText = `Loc: ${eventLogFilterLocation}`; if (eventLogFilterLocation === 'All' && selectedMapPlanet) { locText = `Loc: All (Selected: ${selectedMapPlanet.name})`; } else if (eventLogFilterLocation !== 'All') { locText = `Loc: ${eventLogFilterLocation}`; } textAlign(RIGHT, TOP); text(locText, panelX + panelW - 5, panelY + 25); let filteredLog = eventHistory.filter(entry => { const typeMatch = (eventLogFilterType === 'All' || entry.eventType === eventLogFilterType); const locMatch = (eventLogFilterLocation === 'All' || entry.location === eventLogFilterLocation); return typeMatch && locMatch; }); const listAreaX = panelX + 5; const listAreaW = panelW - 10 - (filteredLog.length * entryHeight > listAreaH ? scrollbarWidth + 5 : 0); const maxVisibleEntries = floor(listAreaH / entryHeight); eventLogScrollOffset = constrain(eventLogScrollOffset, 0, max(0, filteredLog.length - maxVisibleEntries)); let startIndex = floor(eventLogScrollOffset); let endIndex = min(filteredLog.length, startIndex + maxVisibleEntries); let currentY = listAreaY; textAlign(LEFT, TOP); textSize(10); for (let i = startIndex; i < endIndex; i++) { if (currentY > listAreaY + listAreaH - entryHeight) break; const entry = filteredLog[i]; if (entry.status === 'started') fill(255, 180, 180); else if (entry.status === 'ended') fill(180, 220, 255); else fill(180); text(entry.message, listAreaX, currentY, listAreaW); currentY += entryHeight; } if (filteredLog.length > maxVisibleEntries) { const scrollbarX = listAreaX + listAreaW + 5; const scrollbarH = listAreaH; const thumbH = max(10, scrollbarH * (maxVisibleEntries / filteredLog.length)); const thumbY = listAreaY + (scrollbarH - thumbH) * (eventLogScrollOffset / max(1, filteredLog.length - maxVisibleEntries)); fill(50, 50, 80); noStroke(); rect(scrollbarX, listAreaY, scrollbarWidth, scrollbarH); fill(100, 100, 150); rect(scrollbarX, thumbY, scrollbarWidth, thumbH, 3); } pop(); }


// --- D.2: Settings View Drawing Functions ---
function drawSettingsView() {
    push();
    resetMatrix();
    // Background Overlay
    fill(0, 0, 0, 200);
    rect(0, 0, width, height);

    // Main Panel Calculation (Example: Centered, 80% width/height)
    let panelW = width * 0.8;
    let panelH = height * 0.8;
    let panelX = width / 2 - panelW / 2;
    let panelY = height / 2 - panelH / 2;

    // Draw Panel Background
    fill(20, 30, 50, 220);
    stroke(100, 150, 200);
    rect(panelX, panelY, panelW, panelH, 8);

    // Title
    fill(220); noStroke(); textSize(24); textAlign(CENTER, TOP);
    text("Settings", panelX + panelW / 2, panelY + 15);

    // Draw Menu & Active Panel
    let menuWidth = 180; // Width of the left menu
    drawSettingsMenu(panelX, panelY, panelH, menuWidth);
    drawActiveSettingsPanel(panelX + menuWidth, panelY, panelW - menuWidth, panelH);

    // Optional: Draw Close Button (Position top right of panel)
    // uiButtons.settingsClose = { x: panelX + panelW - 40, y: panelY + 10, w: 30, h: 30 };
    // fill(isMouseOver(uiButtons.settingsClose) ? ... : ...); rect(...); text("X",...);

    pop();
}

function drawSettingsMenu(panelX, panelY, panelH, menuWidth) {
    let menuX = panelX + 10;
    let menuY = panelY + 60; // Below title
    let menuItemHeight = 35;
    let menuSpacing = 8;
    const categories = ['Physics', 'Gameplay', 'Events', 'Keys']; // Define categories

    uiButtons.settingsMenuItems = []; // Clear/reset clickable areas each frame

    let currentItemY = menuY;
    for (const category of categories) {
        let itemRect = { x: menuX, y: currentItemY, w: menuWidth - 20, h: menuItemHeight };
        let isActive = (activeSettingsCategory === category);
        let isHover = isMouseOver(itemRect);

        // Draw background/highlight
        if (isActive) { fill(80, 120, 200, 200); }
        else if (isHover) { fill(50, 80, 130, 180); }
        else { fill(30, 50, 80, 150); }
        noStroke();
        rect(itemRect.x, itemRect.y, itemRect.w, itemRect.h, 4);

        // Draw text
        fill(isActive ? 255 : 200);
        textSize(14);
        textAlign(LEFT, CENTER);
        text(category, itemRect.x + 15, itemRect.y + itemRect.h / 2);

        // Store clickable area
        uiButtons.settingsMenuItems.push({ category: category, rect: itemRect });

        currentItemY += menuItemHeight + menuSpacing;
    }
}

function drawActiveSettingsPanel(contentX, contentY, contentW, contentH) {
     push();
     translate(contentX + 15, contentY + 60); // Use translate for relative positioning, add padding

     switch (activeSettingsCategory) {
         case 'Physics':
             drawSettingsPanel_Physics(contentW - 30, contentH - 75); // Pass adjusted dimensions
             break;
         case 'Gameplay':
             drawSettingsPanel_Gameplay(contentW - 30, contentH - 75);
             break;
         case 'Events':
             drawSettingsPanel_Events(contentW - 30, contentH - 75);
             break;
         case 'Keys':
             drawSettingsPanel_Keys(contentW - 30, contentH - 75);
             break;
     }
     pop();
}
// --- End D.2 ---


// --- D.3/D.4: Settings Panel Drawing Functions ---
function drawSettingsPanel_Physics(w, h) {
    let yPos = 0;
    let settingHeight = 30;
    let buttonSize = 20;
    let labelX = 0;
    let valueX = 250; // Adjust as needed
    let buttonX1 = valueX + 50;
    let buttonX2 = buttonX1 + buttonSize + 10;
    let descriptionX = buttonX2 + buttonSize + 15;

    fill(220); textSize(16); textAlign(LEFT, TOP);
    text("Physics Settings", labelX, yPos);
    yPos += settingHeight * 1.5;

    // Global Gravity
    textSize(12); textAlign(LEFT, CENTER); fill(200);
    text("Global Gravity:", labelX, yPos + buttonSize / 2);
    textAlign(CENTER, CENTER); fill(220);
    text(G.toFixed(2), valueX, yPos + buttonSize / 2);
    uiButtons.settingsGravityDec = {x: buttonX1, y: yPos, w: buttonSize, h: buttonSize};
    uiButtons.settingsGravityInc = {x: buttonX2, y: yPos, w: buttonSize, h: buttonSize};
    drawSettingsButton(uiButtons.settingsGravityDec, "-");
    drawSettingsButton(uiButtons.settingsGravityInc, "+");
    fill(150); textAlign(LEFT, CENTER);
    text("Controls the overall strength of gravitational pull.", descriptionX, yPos + buttonSize / 2);
    yPos += settingHeight;

    // Booster Power
    textAlign(LEFT, CENTER); fill(200);
    text("Booster Power:", labelX, yPos + buttonSize / 2);
    textAlign(CENTER, CENTER); fill(220);
    text(BOOST_FORCE_MAGNITUDE.toFixed(2), valueX, yPos + buttonSize / 2);
    uiButtons.settingsBoostDec = {x: buttonX1, y: yPos, w: buttonSize, h: buttonSize};
    uiButtons.settingsBoostInc = {x: buttonX2, y: yPos, w: buttonSize, h: buttonSize};
    drawSettingsButton(uiButtons.settingsBoostDec, "-");
    drawSettingsButton(uiButtons.settingsBoostInc, "+");
     fill(150); textAlign(LEFT, CENTER);
    text("Adjusts the acceleration provided by the booster.", descriptionX, yPos + buttonSize / 2);
    yPos += settingHeight * 1.5;

    // D.4: Celestial Body Mass (Display Only for now)
    fill(220); textSize(14); textAlign(LEFT, TOP);
    text("Celestial Body Mass", labelX, yPos);
    yPos += settingHeight;
    textSize(12); fill(200); textAlign(LEFT, CENTER);

    // Star
    text(star.name + " Mass:", labelX, yPos + buttonSize / 2);
    textAlign(CENTER, CENTER); fill(220);
    text(star.mass.toFixed(0), valueX, yPos + buttonSize / 2);
    fill(150); textAlign(LEFT, CENTER);
    text("Affects star's gravity.", descriptionX, yPos + buttonSize / 2);
    yPos += settingHeight;

    // Planets
    for(let i = 0; i < planets.length; i++) {
        let p = planets[i];
        textAlign(LEFT, CENTER); fill(200);
        text(p.name + " Mass:", labelX, yPos + buttonSize / 2);
         textAlign(CENTER, CENTER); fill(220);
        text(p.mass.toFixed(0), valueX, yPos + buttonSize / 2);
         fill(150); textAlign(LEFT, CENTER);
         text("Affects planet's gravity.", descriptionX, yPos + buttonSize / 2);
        yPos += settingHeight;
        if (yPos > h - settingHeight) break; // Avoid drawing off panel
    }
}

function drawSettingsPanel_Gameplay(w, h) {
    let yPos = 0; let settingHeight = 30; let buttonSize = 20; let labelX = 0; let valueX = 250; let buttonX1 = valueX + 50; let buttonX2 = buttonX1 + buttonSize + 10; let descriptionX = buttonX2 + buttonSize + 15;
    fill(220); textSize(16); textAlign(LEFT, TOP); text("Gameplay/Economy Settings", labelX, yPos); yPos += settingHeight * 1.5;

    // Time Dilation
    textSize(12); textAlign(LEFT, CENTER); fill(200); text("Time Dilation Factor:", labelX, yPos + buttonSize / 2);
    textAlign(CENTER, CENTER); fill(220); text(TIME_DILATION_FACTOR.toFixed(2), valueX, yPos + buttonSize / 2);
    uiButtons.settingsTimeDilationDec = {x: buttonX1, y: yPos, w: buttonSize, h: buttonSize}; uiButtons.settingsTimeDilationInc = {x: buttonX2, y: yPos, w: buttonSize, h: buttonSize};
    drawSettingsButton(uiButtons.settingsTimeDilationDec, "-"); drawSettingsButton(uiButtons.settingsTimeDilationInc, "+");
    fill(150); textAlign(LEFT, CENTER); text("Simulation speed multiplier in Map/Report view.", descriptionX, yPos + buttonSize / 2);
    yPos += settingHeight;

    // Economy Tick Speed
    textAlign(LEFT, CENTER); fill(200); text("Economy Tick (Frames/Min):", labelX, yPos + buttonSize / 2);
    textAlign(CENTER, CENTER); fill(220); text(GAME_MINUTE_INTERVAL_FRAMES, valueX, yPos + buttonSize / 2);
    uiButtons.settingsEconomyTickDec = {x: buttonX1, y: yPos, w: buttonSize, h: buttonSize}; uiButtons.settingsEconomyTickInc = {x: buttonX2, y: yPos, w: buttonSize, h: buttonSize};
    drawSettingsButton(uiButtons.settingsEconomyTickDec, "-"); drawSettingsButton(uiButtons.settingsEconomyTickInc, "+");
     fill(150); textAlign(LEFT, CENTER); text("Lower value = faster economy updates.", descriptionX, yPos + buttonSize / 2);
    yPos += settingHeight;
}

function drawSettingsPanel_Events(w, h) {
    let yPos = 0; let settingHeight = 30; let buttonSize = 20; let labelX = 0; let valueX = 250; let buttonX1 = valueX + 50; let buttonX2 = buttonX1 + buttonSize + 10; let descriptionX = buttonX2 + buttonSize + 15;
    fill(220); textSize(16); textAlign(LEFT, TOP); text("Event Settings", labelX, yPos); yPos += settingHeight * 1.5;

    // Global Event Frequency
    textSize(12); textAlign(LEFT, CENTER); fill(200); text("Global Event Frequency:", labelX, yPos + buttonSize / 2);
    textAlign(CENTER, CENTER); fill(220); text(eventFrequencyMultiplier.toFixed(1), valueX, yPos + buttonSize / 2);
    uiButtons.settingsEventFreqDec = {x: buttonX1, y: yPos, w: buttonSize, h: buttonSize}; uiButtons.settingsEventFreqInc = {x: buttonX2, y: yPos, w: buttonSize, h: buttonSize};
    drawSettingsButton(uiButtons.settingsEventFreqDec, "-"); drawSettingsButton(uiButtons.settingsEventFreqInc, "+");
    fill(150); textAlign(LEFT, CENTER); text("Multiplier for overall event chance.", descriptionX, yPos + buttonSize / 2);
    yPos += settingHeight;

    // Max Active Events
    textAlign(LEFT, CENTER); fill(200); text("Max Active Events:", labelX, yPos + buttonSize / 2);
    textAlign(CENTER, CENTER); fill(220); text(MAX_ACTIVE_EVENTS, valueX, yPos + buttonSize / 2);
    uiButtons.settingsMaxEventsDec = {x: buttonX1, y: yPos, w: buttonSize, h: buttonSize}; uiButtons.settingsMaxEventsInc = {x: buttonX2, y: yPos, w: buttonSize, h: buttonSize};
    drawSettingsButton(uiButtons.settingsMaxEventsDec, "-"); drawSettingsButton(uiButtons.settingsMaxEventsInc, "+");
    fill(150); textAlign(LEFT, CENTER); text("Limit on simultaneous events.", descriptionX, yPos + buttonSize / 2);
    yPos += settingHeight * 1.5;

    // Type Frequency Multipliers
    fill(200); textSize(13); textAlign(LEFT, TOP); text("Event Type Frequency Multipliers", labelX, yPos);
    fill(150); textSize(11); text("Adjusts relative frequency for specific event categories.", labelX, yPos + 15);
    yPos += settingHeight * 1.2; textSize(12);

    // Environmental
    textAlign(LEFT, CENTER); fill(200); text("Environmental:", labelX, yPos + buttonSize / 2);
    textAlign(CENTER, CENTER); fill(220); text(envEventFreqMult.toFixed(1), valueX, yPos + buttonSize / 2);
    uiButtons.settingsEnvFreqDec = {x: buttonX1, y: yPos, w: buttonSize, h: buttonSize}; uiButtons.settingsEnvFreqInc = {x: buttonX2, y: yPos, w: buttonSize, h: buttonSize};
    drawSettingsButton(uiButtons.settingsEnvFreqDec, "-"); drawSettingsButton(uiButtons.settingsEnvFreqInc, "+"); yPos += settingHeight;
    // Economic
    textAlign(LEFT, CENTER); fill(200); text("Economic:", labelX, yPos + buttonSize / 2);
    textAlign(CENTER, CENTER); fill(220); text(ecoEventFreqMult.toFixed(1), valueX, yPos + buttonSize / 2);
    uiButtons.settingsEcoFreqDec = {x: buttonX1, y: yPos, w: buttonSize, h: buttonSize}; uiButtons.settingsEcoFreqInc = {x: buttonX2, y: yPos, w: buttonSize, h: buttonSize};
    drawSettingsButton(uiButtons.settingsEcoFreqDec, "-"); drawSettingsButton(uiButtons.settingsEcoFreqInc, "+"); yPos += settingHeight;
     // Social/Political
    textAlign(LEFT, CENTER); fill(200); text("Social/Political:", labelX, yPos + buttonSize / 2);
    textAlign(CENTER, CENTER); fill(220); text(socEventFreqMult.toFixed(1), valueX, yPos + buttonSize / 2);
    uiButtons.settingsSocFreqDec = {x: buttonX1, y: yPos, w: buttonSize, h: buttonSize}; uiButtons.settingsSocFreqInc = {x: buttonX2, y: yPos, w: buttonSize, h: buttonSize};
    drawSettingsButton(uiButtons.settingsSocFreqDec, "-"); drawSettingsButton(uiButtons.settingsSocFreqInc, "+"); yPos += settingHeight;
     // Technological
    textAlign(LEFT, CENTER); fill(200); text("Technological:", labelX, yPos + buttonSize / 2);
    textAlign(CENTER, CENTER); fill(220); text(techEventFreqMult.toFixed(1), valueX, yPos + buttonSize / 2);
    uiButtons.settingsTechFreqDec = {x: buttonX1, y: yPos, w: buttonSize, h: buttonSize}; uiButtons.settingsTechFreqInc = {x: buttonX2, y: yPos, w: buttonSize, h: buttonSize};
    drawSettingsButton(uiButtons.settingsTechFreqDec, "-"); drawSettingsButton(uiButtons.settingsTechFreqInc, "+"); yPos += settingHeight;
}

// --- D.6: Key Binding Panel ---
function drawSettingsPanel_Keys(w, h) {
    let xPos = 0;
    let yPos = 0;
    let itemHeight = 28; // Increased height
    let spacing = 8;
    let actionLabelWidth = 100;
    let keyDisplayWidth = 80;
    let rebindButtonWidth = 80;
    let descriptionX = xPos + actionLabelWidth + keyDisplayWidth + rebindButtonWidth + 30;

    fill(220); textSize(16); textAlign(LEFT, TOP);
    text("Key Bindings", xPos, yPos);
    yPos += itemHeight * 1.5;

    uiButtons.keyRebindButtons = {}; // Reset clickable buttons

    const actionDescriptions = {
        PAUSE: 'Toggles the game pause state.', MAP_TOGGLE: 'Opens/Closes the system map view.',
        SETTINGS_OPEN: 'Opens this settings view.', TRADE_REPORT: 'Opens the trade report view.',
        BOOST: 'Activates ship booster.', EJECT: 'Initiates escape pod / Exits menus.',
        ROTATE_LEFT: 'Rotates ship left when landed.', ROTATE_RIGHT: 'Rotates ship right when landed.'
    };


    for (const actionName in keyBindings) {
        if (yPos > h - itemHeight) break; // Prevent overflow

        // Format action name for display (e.g., SETTINGS_OPEN -> Settings Open)
        let displayActionName = actionName.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
        let currentKey = getKeyNameForAction(actionName);

        // Draw Action Label
        textAlign(LEFT, CENTER); fill(200); textSize(12);
        text(displayActionName + ":", xPos, yPos + itemHeight / 2);

        // Draw Current Key Binding
        let keyDisplayX = xPos + actionLabelWidth + 10;
        textAlign(CENTER, CENTER); fill(220); textSize(13);
        rectMode(CENTER); // Center the key background
        fill(40, 60, 90); noStroke();
        rect(keyDisplayX + keyDisplayWidth/2, yPos + itemHeight/2, keyDisplayWidth, itemHeight * 0.8, 4);
        fill(220);
        text(currentKey, keyDisplayX + keyDisplayWidth / 2, yPos + itemHeight / 2);
        rectMode(CORNER); // Reset rectMode


        // Draw Rebind Button or "Press Key..." text
        let rebindButtonX = keyDisplayX + keyDisplayWidth + 10;
        let rebindButtonRect = { x: rebindButtonX, y: yPos + (itemHeight - 22)/2, w: rebindButtonWidth, h: 22 }; // Smaller button vertically centered

        if (rebindingAction === actionName) {
            fill(255, 255, 0); // Yellow text
            textSize(11); textAlign(CENTER, CENTER); noStroke();
            text("[Press key...]", rebindButtonX + rebindButtonWidth / 2, yPos + itemHeight / 2);
            // No clickable button while rebinding this action
        } else {
            // Draw the actual 'Rebind' button
            let isHover = isMouseOver(rebindButtonRect);
            fill(isHover ? color(180, 180, 210) : color(120, 120, 150));
            stroke(200);
            rect(rebindButtonRect.x, rebindButtonRect.y, rebindButtonRect.w, rebindButtonRect.h, 3);
            fill(255); noStroke(); textSize(12); textAlign(CENTER, CENTER);
            text("Rebind", rebindButtonX + rebindButtonWidth / 2, yPos + itemHeight / 2);
            // Store button info
            uiButtons.keyRebindButtons[actionName] = rebindButtonRect;
        }

        // Draw Description
        fill(150); textSize(11); textAlign(LEFT, CENTER);
        text(actionDescriptions[actionName] || '', descriptionX, yPos + itemHeight / 2);


        yPos += itemHeight + spacing; // Move to next line
    }
}
// --- End D.6 ---

// --- D.3 Helper ---
function drawSettingsButton(buttonRect, label) {
    if (!buttonRect) return;
    let isHover = isMouseOver(buttonRect);
    fill(isHover ? color(180, 180, 210) : color(120, 120, 150));
    stroke(200);
    rect(buttonRect.x, buttonRect.y, buttonRect.w, buttonRect.h, 3);
    fill(255); noStroke(); textSize(label === '-' || label === '+' ? 16 : 12); textAlign(CENTER, CENTER);
    text(label, buttonRect.x + buttonRect.w / 2, buttonRect.y + buttonRect.h / 2);
}
// --- End D.3 ---

// --- D.2/D.3/D.6: Settings Click Handling ---
function handleSettingsPanelClick() {
    // Check clicks based on the active category
    switch (activeSettingsCategory) {
        case 'Physics':
            // Gravity Buttons
            if (isMouseOver(uiButtons.settingsGravityDec)) { G = constrain(G - G_INCREMENT, MIN_G, MAX_G); return true; }
            if (isMouseOver(uiButtons.settingsGravityInc)) { G = constrain(G + G_INCREMENT, MIN_G, MAX_G); return true; }
            // Booster Buttons
            if (isMouseOver(uiButtons.settingsBoostDec)) { BOOST_FORCE_MAGNITUDE = max(0.01, BOOST_FORCE_MAGNITUDE - 0.01); return true; }
            if (isMouseOver(uiButtons.settingsBoostInc)) { BOOST_FORCE_MAGNITUDE = min(0.5, BOOST_FORCE_MAGNITUDE + 0.01); return true; }
             // Mass input handling would go here if implemented
            break;
        case 'Gameplay':
             // Time Dilation Buttons
             if (isMouseOver(uiButtons.settingsTimeDilationDec)) { TIME_DILATION_FACTOR = max(0.05, TIME_DILATION_FACTOR - 0.05); return true; }
             if (isMouseOver(uiButtons.settingsTimeDilationInc)) { TIME_DILATION_FACTOR = min(1.0, TIME_DILATION_FACTOR + 0.05); return true; }
             // Economy Tick Buttons
             if (isMouseOver(uiButtons.settingsEconomyTickDec)) { GAME_MINUTE_INTERVAL_FRAMES = max(10, GAME_MINUTE_INTERVAL_FRAMES - 10); return true; }
             if (isMouseOver(uiButtons.settingsEconomyTickInc)) { GAME_MINUTE_INTERVAL_FRAMES = min(600, GAME_MINUTE_INTERVAL_FRAMES + 10); return true; }
            break;
        case 'Events':
             // Global Freq Buttons
            if (isMouseOver(uiButtons.settingsEventFreqDec)) { eventFrequencyMultiplier = max(0.1, eventFrequencyMultiplier - 0.1); return true; }
            if (isMouseOver(uiButtons.settingsEventFreqInc)) { eventFrequencyMultiplier = min(5.0, eventFrequencyMultiplier + 0.1); return true; }
            // Max Events Buttons
            if (isMouseOver(uiButtons.settingsMaxEventsDec)) { MAX_ACTIVE_EVENTS = max(1, MAX_ACTIVE_EVENTS - 1); return true; }
            if (isMouseOver(uiButtons.settingsMaxEventsInc)) { MAX_ACTIVE_EVENTS = min(10, MAX_ACTIVE_EVENTS + 1); return true; }
            // Env Freq Buttons
            if (isMouseOver(uiButtons.settingsEnvFreqDec)) { envEventFreqMult = max(0.1, envEventFreqMult - 0.1); return true; }
            if (isMouseOver(uiButtons.settingsEnvFreqInc)) { envEventFreqMult = min(5.0, envEventFreqMult + 0.1); return true; }
             // Eco Freq Buttons
            if (isMouseOver(uiButtons.settingsEcoFreqDec)) { ecoEventFreqMult = max(0.1, ecoEventFreqMult - 0.1); return true; }
            if (isMouseOver(uiButtons.settingsEcoFreqInc)) { ecoEventFreqMult = min(5.0, ecoEventFreqMult + 0.1); return true; }
             // Soc Freq Buttons
            if (isMouseOver(uiButtons.settingsSocFreqDec)) { socEventFreqMult = max(0.1, socEventFreqMult - 0.1); return true; }
            if (isMouseOver(uiButtons.settingsSocFreqInc)) { socEventFreqMult = min(5.0, socEventFreqMult + 0.1); return true; }
             // Tech Freq Buttons
            if (isMouseOver(uiButtons.settingsTechFreqDec)) { techEventFreqMult = max(0.1, techEventFreqMult - 0.1); return true; }
            if (isMouseOver(uiButtons.settingsTechFreqInc)) { techEventFreqMult = min(5.0, techEventFreqMult + 0.1); return true; }
            break;
        case 'Keys':
             // Rebind Buttons
             for (const actionName in uiButtons.keyRebindButtons) {
                 if (isMouseOver(uiButtons.keyRebindButtons[actionName])) {
                     if (rebindingAction !== actionName) { // Avoid setting if already rebinding this
                        rebindingAction = actionName;
                        console.log("Waiting to rebind:", actionName);
                     }
                     return true; // Consume click
                 }
             }
            break;
    }
    return false; // No click handled in the panel
}
// --- End D.2/D.3/D.6 ---


// --- Remaining UI/Helper Functions ---
function drawHUD() { /* Restored Definition */ push(); resetMatrix(); fill(200); noStroke(); textSize(16); textAlign(LEFT, TOP); fill(player.money < 0 ? color(255, 100, 100) : color(200)); text(`💰 $${player.money}`, 20, 20); let statusY = 45; if (player.money < 0) { fill(255, 100, 100); textSize(12); text(`(In Debt!)`, 20, 40); statusY = 65; } fill(200); textSize(16); let statusText="Status: Unknown"; if(isPaused){statusText="Status: Paused";}else if(player.currentPlanet){statusText=`Location: ${player.currentPlanet.name}`;if(playerState==='ON_PLANET')statusText+=" (Landed)";if(playerState==='AIMING')statusText=`Aiming from: ${player.currentPlanet.name}`;}else if(playerState==='IN_SPACE'){statusText="Status: In Transit";} text(statusText,20,statusY); let invY=statusY+25; let currentCargoUnits=player.getCurrentCargoTons()/TONS_PER_UNIT; text(`Cargo: ${currentCargoUnits.toFixed(0)} / ${MAX_CARGO_UNITS} Units`,20,invY);invY+=20; text("Inventory:",20,invY); invY+=20; let hasItems=false; availableCommodities.forEach(c=>{let qty=player.inventory[c.name]||0; if(qty>0){hasItems=true;text(`- ${c.name}: ${qty}`,30,invY);invY+=18;}}); if(!hasItems)text("  (Empty)",30,invY); invY+=5; if(playerState==='IN_SPACE'){fill(100,200,255);textSize(14);text(`Boosts: ${player.boostPulsesRemaining}/${player.maxBoostPulses}`,20,invY);invY+=20;} if(playerState==='IN_SPACE'){let btnE=uiButtons.eject; let eC=isMouseOver(btnE)?color(255,80,80,220):color(200,50,50,180);fill(eC);stroke(255,150,150);strokeWeight(1);rect(btnE.x,btnE.y,btnE.w,btnE.h,4);fill(255);noStroke();textAlign(CENTER,CENTER);textSize(14);text("EJECT (Esc)",btnE.x+btnE.w/2,btnE.y+btnE.h/2);} if(playerState==='ON_PLANET'&&!isPaused){textSize(14);textAlign(CENTER,BOTTOM);fill(255,255,0,180);text("Click screen (outside Trade Menu) to Aim. Use ← → to rotate.",width/2,height-40);}else if(playerState==='AIMING'&&!isPaused){textSize(14);textAlign(CENTER,BOTTOM);fill(0,255,0,180);text("Release Mouse Button to Launch!",width/2,height-40);} if(!isPaused){textSize(12); textAlign(RIGHT, BOTTOM); fill(150); text("Press 'P' to Pause", width - 20, height - 20);} pop(); }
function drawMinimap() { /* Restored Definition */ push(); resetMatrix(); let map=uiButtons.minimap; fill(0,0,0,150); stroke(100,150,255,200); strokeWeight(2); ellipse(map.centerX,map.centerY,map.w,map.h); fill(255,200,0); noStroke(); ellipse(map.centerX,map.centerY,8,8); let maxOrbit=0; planets.forEach(p=>{if(p.orbitRadius>maxOrbit)maxOrbit=p.orbitRadius;}); let mapScale=map.radius/maxOrbit; planets.forEach(p=>{ let dR=p.orbitRadius*mapScale; let pX=map.centerX+dR*cos(p.angle); let pY=map.centerY+dR*sin(p.angle); let pS=max(2,p.radius*0.15); if(p.minimapHighlight){fill(0,255,0);ellipse(pX,pY,pS+4,pS+4);} fill(p.color); noStroke(); ellipse(pX,pY,pS,pS); }); if(playerState==='IN_SPACE'){ let pA=atan2(player.pos.y,player.pos.x); let pD=player.pos.mag(); let dD=min(pD*mapScale,map.radius*1.1); let pX=map.centerX+dD*cos(pA); let pY=map.centerY+dD*sin(pA); fill(255); stroke(0); strokeWeight(1); ellipse(pX,pY,6,6); } else if(player.currentPlanet){ let dR=player.currentPlanet.orbitRadius*mapScale; let pX=map.centerX+dR*cos(player.currentPlanet.angle); let pY=map.centerY+dR*sin(player.currentPlanet.angle); fill(255); stroke(0); strokeWeight(1); ellipse(pX,pY,6,6); } if(playerState==='AIMING'&&player.trajectoryPoints.length>1&&player.currentPlanet){ stroke(255,255,0,150); strokeWeight(1.5); noFill(); let startPoint=player.pos; let mapStartPos={x:map.centerX+(startPoint.x/maxOrbit)*map.radius,y:map.centerY+(startPoint.y/maxOrbit)*map.radius}; let nextPoint=player.trajectoryPoints[1]; if(nextPoint){let iDir=p5.Vector.sub(nextPoint,player.trajectoryPoints[0]); if(iDir.magSq()>0.001){iDir.normalize();let eX=mapStartPos.x+iDir.x*map.radius*1.5;let eY=mapStartPos.y+iDir.y*map.radius*1.5;line(mapStartPos.x,mapStartPos.y,eX,eY);let launchDir=iDir; planets.forEach(p=>{if(p===player.currentPlanet)return;let localDR=p.orbitRadius*mapScale;let pX=map.centerX+localDR*cos(p.angle);let pY=map.centerY+localDR*sin(p.angle); let vTP=p5.Vector.sub(createVector(pX,pY),createVector(mapStartPos.x,mapStartPos.y));let dTP=vTP.mag();if(dTP>0){let vFS=vTP;let projD=vFS.dot(launchDir);if(projD>0&&projD<map.radius*2){let projP=p5.Vector.add(createVector(mapStartPos.x,mapStartPos.y),launchDir.copy().mult(projD));let dTL=dist(pX,pY,projP.x,projP.y);let pMS=max(2,p.radius*0.15);if(dTL<pMS*2.5){p.minimapHighlight=true;}}}});}}} noFill(); stroke(100,150,255,100); strokeWeight(1); ellipse(map.centerX,map.centerY,map.w,map.h); pop(); }
function drawGravityControls() { /* Restored Definition */ push(); resetMatrix(); let btnDec=uiButtons.gravityDecrease; let btnInc=uiButtons.gravityIncrease; let textX=btnDec.x+btnDec.w+10; let textY=btnDec.y+btnDec.h/2; fill(isMouseOver(btnDec)?color(200,80,80,220):color(150,50,50,180)); stroke(255,150,150); strokeWeight(1); rect(btnDec.x,btnDec.y,btnDec.w,btnDec.h,4); fill(255); noStroke(); textAlign(CENTER,CENTER); textSize(18); text("-",btnDec.x+btnDec.w/2,btnDec.y+btnDec.h/2-1); fill(200); textSize(14); textAlign(LEFT,CENTER); text(`Gravity (G): ${G.toFixed(2)}`,textX,textY); uiButtons.gravityIncrease.x=textX+textWidth(`Gravity (G): ${G.toFixed(2)}`)+10; btnInc=uiButtons.gravityIncrease; fill(isMouseOver(btnInc)?color(80,200,80,220):color(50,150,50,180)); stroke(150,255,150); strokeWeight(1); rect(btnInc.x,btnInc.y,btnInc.w,btnInc.h,4); fill(255); noStroke(); textAlign(CENTER,CENTER); textSize(18); text("+",btnInc.x+btnInc.w/2,btnInc.y+btnInc.h/2-1); pop(); }
function drawTradeMenu() { /* Restored Definition */ if (!tradeMenu.planet) return; push(); resetMatrix(); fill(20, 30, 60, 220); stroke(100, 150, 255); strokeWeight(2); rect(tradeMenu.x, tradeMenu.y, tradeMenu.w, tradeMenu.h, 10); fill(200, 220, 255); textSize(18); textAlign(CENTER, TOP); text(`Trade Station on ${tradeMenu.planet.name}`, tradeMenu.x + tradeMenu.w / 2, tradeMenu.y + 12); let btnToggle = uiButtons.tradeModeToggle; let toggleText = `Mode: ${tradeMenu.mode === 'SELL' ? 'SELLING' : 'BUYING'}`; let toggleColor = tradeMenu.mode === 'SELL' ? color(200, 80, 80, 200) : color(80, 200, 80, 200); if (isMouseOver(btnToggle)) { toggleColor = tradeMenu.mode === 'SELL' ? color(230, 100, 100, 220) : color(100, 230, 100, 220); } fill(toggleColor); stroke(255); strokeWeight(1); rect(btnToggle.x, btnToggle.y, btnToggle.w, btnToggle.h, 4); fill(255); noStroke(); textSize(12); textAlign(CENTER, CENTER); text(toggleText, btnToggle.x + btnToggle.w / 2, btnToggle.y + btnToggle.h / 2); let yPos = tradeMenu.y + 80; let xMargin = 15; let rowHeight = 26; let btnH = 18; let btnW_S = 25; let btnW_M = 28; let btnW_L = 30; let buttonSpacing = 4; let itemWidth = 110; let haveWidth = 40; let sdWidth = 45; let sellPriceWidth = 60; let buyPriceWidth = 60; let buttonTotalWidth = btnW_S + btnW_M + btnW_L + 2 * buttonSpacing; let buttonStartX = tradeMenu.x + tradeMenu.w - xMargin - buttonTotalWidth; let col_ItemX = tradeMenu.x + xMargin; let col_HaveX = col_ItemX + itemWidth + 10; let col_SDX = col_HaveX + haveWidth + 10; let col_SellPriceX = col_SDX + sdWidth + 15; let col_BuyPriceX = col_SellPriceX + sellPriceWidth + 5; fill(180); textSize(10); textAlign(LEFT, TOP); text("Item", col_ItemX, yPos); textAlign(CENTER, TOP); text("Have", col_HaveX, yPos); textAlign(CENTER, TOP); text("S# / D#", col_SDX, yPos); textAlign(RIGHT, TOP); text("Sell ($/U)", col_SellPriceX + sellPriceWidth - 5, yPos); textAlign(RIGHT, TOP); text("Buy ($/U)", col_BuyPriceX + buyPriceWidth - 5, yPos); textAlign(CENTER, TOP); text(tradeMenu.mode === 'SELL' ? "Sell Qty" : "Buy Qty", buttonStartX + buttonTotalWidth / 2, yPos); yPos += 18; tradeMenu.actionButtons = []; for (const c of availableCommodities) { if (yPos > tradeMenu.y + tradeMenu.h - 15) break; let marketData = tradeMenu.planet.marketData[c.name]; if (!marketData) continue; let playerQtyUnits = player.inventory[c.name] || 0; let sdRating = getSupplyDemandRating(marketData, tradeMenu.planet); let supplyRatingNum = convertRatingStringToNum(sdRating.supply); let demandRatingNum = convertRatingStringToNum(sdRating.demand); let btnY = yPos + (rowHeight - btnH) / 2; fill(220); textSize(11); textAlign(LEFT, CENTER); text(c.name, col_ItemX, yPos + rowHeight / 2); fill(200); textAlign(CENTER, CENTER); text(playerQtyUnits, col_HaveX, yPos + rowHeight / 2); fill(180); textAlign(CENTER, CENTER); textSize(10); text(`${supplyRatingNum}/${demandRatingNum}`, col_SDX, yPos + rowHeight / 2); fill(180); textAlign(RIGHT, CENTER); textSize(10); text(`$${marketData.buyPrice}`, col_SellPriceX + sellPriceWidth - 5, yPos + rowHeight / 2); fill(180); textAlign(RIGHT, CENTER); textSize(10); text(`$${marketData.sellPrice}`, col_BuyPriceX + buyPriceWidth - 5, yPos + rowHeight / 2); let currentButtonX = buttonStartX; [1, 5, 10].forEach((qty, i) => { let currentBtnW = [btnW_S, btnW_M, btnW_L][i]; let isActive = false; let btnColor = color(100); if (tradeMenu.mode === 'SELL') { isActive = playerQtyUnits >= qty; btnColor = color(255, 150, 150, isActive ? 200 : 80); } else { let cost = marketData.sellPrice * qty; let purchaseTonnage = qty * TONS_PER_UNIT; let canAfford = player.money >= cost; let hasSpace = player.getCurrentCargoTons() + purchaseTonnage <= player.maxCargoTons; isActive = canAfford && hasSpace; btnColor = color(150, 255, 150, isActive ? 200 : 80); if (!isActive && !hasSpace && canAfford) { btnColor = color(150, 200, 255, 100); } } fill(btnColor); stroke(200); strokeWeight(1); rect(currentButtonX, btnY, currentBtnW, btnH, 3); fill(isActive ? 0 : 100); textAlign(CENTER, CENTER); textSize(10); text(`${qty}x`, currentButtonX + currentBtnW / 2, btnY + btnH / 2); if (isActive) { tradeMenu.actionButtons.push({ commodity: c.name, qty: qty, rect: { x: currentButtonX, y: btnY, w: currentBtnW, h: btnH } }); } currentButtonX += currentBtnW + buttonSpacing; }); yPos += rowHeight; } pop(); }

function drawGameView() { /* Unchanged */ push(); translate(width / 2, height / 2); scale(scaleFactor); translate(-player.pos.x, -player.pos.y); drawStarfield(); star.draw(); planets.forEach(p => p.drawOrbit()); planets.forEach(p => p.draw()); player.draw(); if (playerState === 'AIMING') player.drawTrajectory(); pop(); drawHUD(); drawMinimap(); drawGravityControls(); if (tradeMenu.visible && playerState === 'ON_PLANET') drawTradeMenu(); drawEventLogSnippet(); }
function drawLargeMapView(isBackground = false) { /* Unchanged */ push(); resetMatrix(); fill(0, 0, 20, isBackground ? 150 : 220); rect(0, 0, width, height); let btnMap = uiButtons.mapNavMap; let btnReport = uiButtons.mapNavTradeReport; let btnClose = uiButtons.largeMapClose; let titleY = 30; if (!isBackground && btnMap && btnReport) { titleY = btnMap.y + btnMap.h + 15; let mapBtnColor=(currentView === 'LARGE_MAP')?color(150,180,255,220):color(50,70,100,180); if(currentView !== 'LARGE_MAP' && isMouseOver(btnMap)) mapBtnColor=color(80,100,140,200); fill(mapBtnColor); stroke(150,180,255); strokeWeight(1); rect(btnMap.x,btnMap.y,btnMap.w,btnMap.h,4); fill(230); noStroke(); textSize(14); textAlign(CENTER,CENTER); text("[ MAP ]",btnMap.x+btnMap.w/2,btnMap.y+btnMap.h/2); let reportBtnColor=(currentView === 'TRADE_REPORT')?color(150,180,255,220):color(50,70,100,180); if(currentView !== 'TRADE_REPORT' && isMouseOver(btnReport)) reportBtnColor=color(80,100,140,200); fill(reportBtnColor); stroke(150,180,255); strokeWeight(1); rect(btnReport.x,btnReport.y,btnReport.w,btnReport.h,4); fill(230); noStroke(); textSize(14); textAlign(CENTER,CENTER); text("[ TRADE REPORT ]",btnReport.x+btnReport.w/2,btnReport.y+btnReport.h/2); fill(200, 220, 255); textSize(24); textAlign(CENTER, TOP); text("Solar System Map", width / 2, titleY); } if (!isBackground) { drawMapCommodityList(); } let mapCenterYOffset = titleY + 30; let maxOrbit = 0; planets.forEach(p => { if (p.orbitRadius > maxOrbit) maxOrbit = p.orbitRadius; }); let mapRadius = min(width * 0.8, height * 0.7) * 0.5; let mapScale = maxOrbit > 0 ? mapRadius / maxOrbit : mapRadius; let mapCX = width / 2; let mapCY = height / 2 + mapCenterYOffset / 3; fill(255, 200, 0); noStroke(); ellipse(mapCX, mapCY, max(10, 20 * mapScale), max(10, 20 * mapScale)); planets.forEach(p => { let pX = mapCX + p.pos.x * mapScale; let pY = mapCY + p.pos.y * mapScale; let pS = max(3, p.radius * mapScale * 0.5); noFill(); stroke(255, 255, 255, 50); strokeWeight(1); ellipse(mapCX, mapCY, p.orbitRadius * mapScale * 2); fill(p.color); noStroke(); ellipse(pX, pY, pS, pS); if (!isBackground && selectedMapPlanet === p) { push(); noFill(); stroke(255, 255, 0, 200); strokeWeight(2); ellipse(pX, pY, pS * 2 + 4); pop(); } if (!isBackground && selectedMapCommodity) { let marketData = p.marketData[selectedMapCommodity]; if (marketData) { let sdRating = getSupplyDemandRating(marketData, p); let sNum = convertRatingStringToNum(sdRating.supply); let dNum = convertRatingStringToNum(sdRating.demand); fill(230, 230, 230, 200); noStroke(); textSize(max(6, 9 / (mapScale > 0 ? mapScale : 1) * 0.01)); textAlign(CENTER, TOP); text(`S:${sNum} D:${dNum}`, pX, pY + pS * 0.7 + 2); } } if (!isBackground || mapScale > 0.001) { fill(220); textSize(max(8, 10 / (mapScale > 0 ? mapScale : 1) * 0.01)); textAlign(CENTER, BOTTOM); text(p.name, pX, pY - pS * 0.7 - 2); } }); if (!isBackground) { if (playerState === 'IN_SPACE') { let pA=atan2(player.pos.y,player.pos.x); let pD=player.pos.mag(); let dD=min(pD*mapScale,mapRadius*1.1); let pX=mapCX+dD*cos(pA); let pY=mapCY+dD*sin(pA); fill(255); stroke(0); strokeWeight(1); ellipse(pX,pY,8,8); fill(255); noStroke(); textAlign(CENTER,TOP); textSize(10); text("You",pX,pY+5); } else if (player.currentPlanet) { let dR=player.currentPlanet.orbitRadius*mapScale; let pX=mapCX+dR*cos(player.currentPlanet.angle); let pY=mapCY+dR*sin(player.currentPlanet.angle); fill(255); stroke(0); strokeWeight(1); ellipse(pX,pY,8,8); fill(255); noStroke(); textAlign(CENTER,TOP); textSize(10); text("You",pX,pY+5); } if (btnClose) { fill(isMouseOver(btnClose) ? color(230, 100, 100) : color(200, 80, 80, 200)); stroke(255, 150, 150); strokeWeight(1); rect(btnClose.x, btnClose.y, btnClose.w, btnClose.h, 3); fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(14); text("X", btnClose.x + btnClose.w / 2, btnClose.y + btnClose.h / 2); } } if (!isBackground) { drawFullEventLog(); } pop(); }
function drawMapCommodityList() { /* Unchanged */ let area = uiButtons.mapCommodityListArea; if (!area) return; uiButtons.mapCommodityItems = []; fill(15, 25, 50, 210); stroke(80, 120, 200); rect(area.x, area.y, area.w, area.h, 5); let yPos = area.y + 10; let itemHeight = 22; textSize(12); let clearRect = { x: area.x + 5, y: yPos, w: area.w - 10, h: itemHeight }; let isClearHover = isMouseOver(clearRect); let isClearSelected = (selectedMapCommodity === null); if (isClearSelected) { fill(80, 120, 200, 200); noStroke(); rect(clearRect.x, clearRect.y, clearRect.w, clearRect.h, 3); } else if (isClearHover) { fill(50, 80, 130, 180); noStroke(); rect(clearRect.x, clearRect.y, clearRect.w, clearRect.h, 3); } fill(isClearSelected ? 255 : 200); textAlign(CENTER, CENTER); text("[Clear Filter]", clearRect.x + clearRect.w / 2, clearRect.y + clearRect.h / 2); uiButtons.mapCommodityItems.push({ name: null, rect: clearRect }); yPos += itemHeight + 3; for (const commodity of availableCommodities) { if (yPos > area.y + area.h - itemHeight - 5) break; let itemRect = { x: area.x + 5, y: yPos, w: area.w - 10, h: itemHeight }; let isSelected = (commodity.name === selectedMapCommodity); let isHover = isMouseOver(itemRect); if (isSelected) { fill(80, 120, 200, 200); noStroke(); rect(itemRect.x, itemRect.y, itemRect.w, itemRect.h, 3); } else if (isHover) { fill(50, 80, 130, 180); noStroke(); rect(itemRect.x, itemRect.y, itemRect.w, itemRect.h, 3); } fill(isSelected ? 255 : 200); textAlign(LEFT, CENTER); text(commodity.name, itemRect.x + 8, itemRect.y + itemRect.h / 2); uiButtons.mapCommodityItems.push({ name: commodity.name, rect: itemRect }); yPos += itemHeight + 3; } }
function drawTradeReportView() { /* Unchanged */ drawLargeMapView(true); push(); resetMatrix(); let btnMap = uiButtons.mapNavMap; let btnReport = uiButtons.mapNavTradeReport; let titleY = (btnMap ? btnMap.y + btnMap.h + 15 : 30); fill(200, 220, 255); textSize(24); textAlign(CENTER, TOP); text("Trade Report", width / 2, titleY); if (btnMap && btnReport) { let mapBtnColor = (currentView === 'LARGE_MAP') ? color(150, 180, 255, 220) : color(50, 70, 100, 180); if (currentView !== 'LARGE_MAP' && isMouseOver(btnMap)) mapBtnColor = color(80, 100, 140, 200); fill(mapBtnColor); stroke(150, 180, 255); strokeWeight(1); rect(btnMap.x, btnMap.y, btnMap.w, btnMap.h, 4); fill(230); noStroke(); textSize(14); textAlign(CENTER, CENTER); text("[ MAP ]", btnMap.x + btnMap.w / 2, btnMap.y + btnMap.h / 2); let reportBtnColor = (currentView === 'TRADE_REPORT') ? color(150, 180, 255, 220) : color(50, 70, 100, 180); fill(reportBtnColor); stroke(150, 180, 255); strokeWeight(1); rect(btnReport.x, btnReport.y, btnReport.w, btnReport.h, 4); fill(230); noStroke(); textSize(14); textAlign(CENTER, CENTER); text("[ TRADE REPORT ]", btnReport.x + btnReport.w / 2, btnReport.y + btnReport.h / 2); } let btnBack = uiButtons.reportBackButton; if (btnBack) { fill(isMouseOver(btnBack) ? color(200, 150, 80, 220) : color(150, 100, 50, 180)); stroke(255, 200, 150); strokeWeight(1); rect(btnBack.x, btnBack.y, btnBack.w, btnBack.h, 4); fill(230); noStroke(); textSize(14); textAlign(CENTER, CENTER); text("Back", btnBack.x + btnBack.w / 2, btnBack.y + btnBack.h / 2); } drawReportCommodityList(); drawReportDataTable(); pop(); }
function drawReportCommodityList() { /* Unchanged */ let area = uiButtons.reportCommodityListArea; if (!area) return; uiButtons.reportCommodityItems = []; fill(15, 25, 50, 210); stroke(80, 120, 200); rect(area.x, area.y, area.w, area.h, 5); let yPos = area.y + 10; let itemHeight = 22; textSize(12); for (const commodity of availableCommodities) { if (yPos > area.y + area.h - itemHeight - 5) break; let itemRect = { x: area.x + 5, y: yPos, w: area.w - 10, h: itemHeight }; let isSelected = (commodity.name === selectedReportCommodity); let isHover = isMouseOver(itemRect); if (isSelected) { fill(80, 120, 200, 200); noStroke(); rect(itemRect.x, itemRect.y, itemRect.w, itemRect.h, 3); } else if (isHover) { fill(50, 80, 130, 180); noStroke(); rect(itemRect.x, itemRect.y, itemRect.w, itemRect.h, 3); } fill(isSelected ? 255 : 200); textAlign(LEFT, CENTER); text(commodity.name, itemRect.x + 8, itemRect.y + itemRect.h / 2); uiButtons.reportCommodityItems.push({ name: commodity.name, rect: itemRect }); yPos += itemHeight + 3; } }
function drawReportDataTable() { /* Unchanged */ let area = uiButtons.reportTableArea; if (!area) return; uiButtons.reportHeaders = []; let reportData = []; for (const planet of planets) { let marketData = planet.marketData[selectedReportCommodity]; if (!marketData) continue; let sdRating = getSupplyDemandRating(marketData, planet); reportData.push({ planetName: planet.name, geo: planet.archetype, econ: planet.economyType, supplyNum: convertRatingStringToNum(sdRating.supply), demandNum: convertRatingStringToNum(sdRating.demand), buyPrice: marketData.buyPrice, sellPrice: marketData.sellPrice, }); } reportData.sort((a, b) => { let valA, valB; switch (reportSortColumn) { case 'Planet': valA = a.planetName; valB = b.planetName; break; case 'Geo': valA = a.geo; valB = b.geo; break; case 'Econ': valA = a.econ; valB = b.econ; break; case 'S#': valA = a.supplyNum; valB = b.supplyNum; break; case 'D#': valA = a.demandNum; valB = b.demandNum; break; case 'Buy $': valA = a.buyPrice; valB = b.buyPrice; break; case 'Sell $': valA = a.sellPrice; valB = b.sellPrice; break; default: return 0; } let comparison = (typeof valA === 'string') ? valA.localeCompare(valB) : (valA - valB); return reportSortDirection === 'ASC' ? comparison : -comparison; }); fill(15, 25, 50, 210); stroke(80, 120, 200); rect(area.x, area.y, area.w, area.h, 5); let headerY = area.y + 15; let rowStartY = headerY + 25; let rowHeight = 20; let xPadding = 10; let availW = area.w - 2 * xPadding; let col_Planet_W = availW * 0.22; let col_Geo_W = availW * 0.18; let col_Econ_W = availW * 0.20; let col_S_W = availW * 0.08; let col_D_W = availW * 0.08; let col_Buy_W = availW * 0.12; let col_Sell_W = availW * 0.12; let col_Planet_X = area.x + xPadding; let col_Geo_X = col_Planet_X + col_Planet_W; let col_Econ_X = col_Geo_X + col_Geo_W; let col_S_X = col_Econ_X + col_Econ_W; let col_D_X = col_S_X + col_S_W; let col_Buy_X = col_D_X + col_D_W; let col_Sell_X = col_Buy_X + col_Buy_W; textSize(10); fill(180); const headers = [ { name: "Planet", x: col_Planet_X, w: col_Planet_W, align: LEFT }, { name: "Geo", x: col_Geo_X, w: col_Geo_W, align: LEFT }, { name: "Econ", x: col_Econ_X, w: col_Econ_W, align: LEFT }, { name: "S#", x: col_S_X, w: col_S_W, align: CENTER }, { name: "D#", x: col_D_X, w: col_D_W, align: CENTER }, { name: "Buy $", x: col_Buy_X, w: col_Buy_W, align: RIGHT }, { name: "Sell $", x: col_Sell_X, w: col_Sell_W, align: RIGHT } ]; uiButtons.reportHeaders = []; headers.forEach(h => { textAlign(h.align, CENTER); let headerText = h.name; let headerRect = { x: h.x, y: area.y + 5, w: h.w, h: 25 }; let isSortCol = (h.name === reportSortColumn); if (isSortCol) headerText += (reportSortDirection === 'ASC' ? ' ▲' : ' ▼'); fill(isSortCol ? 230 : (isMouseOver(headerRect) ? 255 : 180)); text(headerText, h.align === LEFT ? h.x + 2 : (h.align === RIGHT ? h.x + h.w - 2 : h.x + h.w / 2), headerY); uiButtons.reportHeaders.push({ column: h.name, rect: headerRect }); }); let currentY = rowStartY; fill(210); textSize(11); for (const row of reportData) { if (currentY > area.y + area.h - rowHeight) break; textAlign(LEFT, CENTER); text(row.planetName, col_Planet_X + 2, currentY + rowHeight / 2); text(row.geo, col_Geo_X + 2, currentY + rowHeight / 2); text(row.econ, col_Econ_X + 2, currentY + rowHeight / 2); textAlign(CENTER, CENTER); text(row.supplyNum, col_S_X + col_S_W / 2, currentY + rowHeight / 2); text(row.demandNum, col_D_X + col_D_W / 2, currentY + rowHeight / 2); textAlign(RIGHT, CENTER); text(`$${row.buyPrice}`, col_Buy_X + col_Buy_W - 2, currentY + rowHeight / 2); text(`$${row.sellPrice}`, col_Sell_X + col_Sell_W - 2, currentY + rowHeight / 2); currentY += rowHeight; } }
function handleTradeMenuClick() { /* Unchanged */ for (let btn of tradeMenu.actionButtons) { if (isMouseOver(btn.rect)) { if (tradeMenu.mode === 'SELL') { sellCommodity(btn.commodity, btn.qty); } else { buyCommodity(btn.commodity, btn.qty); } return true; } } return false; }
function buyCommodity(commodityName, quantity) { /* Unchanged */ if (!tradeMenu.planet) return; let marketData = tradeMenu.planet.marketData[commodityName]; if (!marketData) return; let cost = marketData.sellPrice * quantity; let purchaseTonnage = quantity * TONS_PER_UNIT; if (player.money >= cost) { if (player.getCurrentCargoTons() + purchaseTonnage <= player.maxCargoTons) { player.money -= cost; player.inventory[commodityName] = (player.inventory[commodityName] || 0) + quantity; console.log(`Bought ${quantity}U (${purchaseTonnage}T) ${commodityName}`); tradeMenu.planet.updateMarketPrices(); } else { console.log("Not enough cargo space!"); } } else { console.log("Not enough money!"); } }
function sellCommodity(commodityName, quantity) { /* Unchanged */ if (!tradeMenu.planet) return; let marketData = tradeMenu.planet.marketData[commodityName]; if (!marketData) return; let playerQtyUnits = player.inventory[commodityName] || 0; let sellQtyUnits = min(quantity, playerQtyUnits); let sellTonnage = sellQtyUnits * TONS_PER_UNIT; if (sellQtyUnits > 0) { let earnings = marketData.buyPrice * sellQtyUnits; player.money += earnings; player.inventory[commodityName] -= sellQtyUnits; console.log(`Sold ${sellQtyUnits}U (${sellTonnage}T) ${commodityName}`); tradeMenu.planet.updateMarketPrices(); } else { console.log("Not enough to sell!"); } }
function mouseIsInTradeMenu() { /* Unchanged */ return mouseX > tradeMenu.x && mouseX < tradeMenu.x + tradeMenu.w && mouseY > tradeMenu.y && mouseY < tradeMenu.y + tradeMenu.h; }
function drawDashedLine(x1, y1, x2, y2, dL, gL) { /* Unchanged */ const lL=dist(x1,y1,x2,y2);if(lL<=0)return;const a=atan2(y2-y1,x2-x1);const tL=dL+gL;if(tL<=0)return;push();if(drawingContext.setLineDash){drawingContext.save();drawingContext.setLineDash([dL,gL]);drawingContext.beginPath();drawingContext.moveTo(x1,y1);drawingContext.lineTo(x2,y2);drawingContext.stroke();drawingContext.restore();}else{line(x1,y1,x2,y2);} pop();}
function drawEscapeConfirmation() { /* Unchanged */ push(); resetMatrix(); fill(0,0,0,180); rect(0,0,width,height); let bW=300,bH=120,bX=width/2-bW/2,bY=height/2-bH/2; fill(30,40,70,230); stroke(100,150,255); strokeWeight(2); rect(bX,bY,bW,bH,8); fill(220); noStroke(); textSize(16); textAlign(CENTER,CENTER); text(`Use escape pod (Enter)?\nCost: $${ESCAPE_POD_COST}`,bX+bW/2,bY+bH/2-20); if(player.money<ESCAPE_POD_COST){fill(255,150,150);textSize(12);text(`(This will increase your debt!)`,bX+bW/2,bY+bH/2+10);} let btnY=bY+bH-45,btnW=100,btnH=30; let yBX=bX+bW/2-btnW-10; let nBX=bX+bW/2+10; fill(isMouseOver({x:yBX,y:btnY,w:btnW,h:btnH})?color(80,200,80,220):color(50,150,50,180)); stroke(150,255,150); strokeWeight(1); rect(yBX,btnY,btnW,btnH,4); fill(255); noStroke(); textSize(14); text("Yes (Ent)",yBX+btnW/2,btnY+btnH/2); fill(isMouseOver({x:nBX,y:btnY,w:btnW,h:btnH})?color(200,80,80,220):color(150,50,50,180)); stroke(255,150,150); strokeWeight(1); rect(nBX,btnY,btnW,btnH,4); fill(255); noStroke(); textSize(14); text("No (Esc)",nBX+btnW/2,btnY+btnH/2); pop();}
function drawGameOver() { /* Unchanged */ push(); resetMatrix(); fill(255,0,0,150); rect(0,0,width,height); fill(255); textSize(64); textAlign(CENTER,CENTER); text("GAME OVER",width/2,height/2-40); textSize(24); text("Your ship met its demise!\nPress SPACEBAR to restart.",width/2,height/2+40); pop(); noLoop(); }
function windowResized() { /* Unchanged */ resizeCanvas(windowWidth, windowHeight); calculateUIPositions(); }

// Updated Pause Menu to include Settings Button (D.1)
function drawPauseMenu() {
    push(); resetMatrix(); fill(0, 0, 0, 180); rect(0, 0, width, height);
    // D.1: Adjust pause menu size to fit settings button
    let menuW = 200, menuH = 200; // Adjusted height
    let menuX = width / 2 - menuW / 2; let menuY = height / 2 - menuH / 2;
    fill(30, 40, 70, 230); stroke(100, 150, 255); strokeWeight(2); rect(menuX, menuY, menuW, menuH, 8);
    fill(220); noStroke(); textSize(24); textAlign(CENTER, TOP); text("Paused", width / 2, menuY + 15);

    // Resume / Restart Buttons
    let btnRsm = uiButtons.pauseResume; fill(isMouseOver(btnRsm) ? color(80, 200, 80, 220) : color(50, 150, 50, 180)); stroke(150, 255, 150); strokeWeight(1); rect(btnRsm.x, btnRsm.y, btnRsm.w, btnRsm.h, 4); fill(255); noStroke(); textSize(16); textAlign(CENTER, CENTER); text("Resume (P)", btnRsm.x + btnRsm.w / 2, btnRsm.y + btnRsm.h / 2);
    let btnRst = uiButtons.pauseRestart; fill(isMouseOver(btnRst) ? color(200, 150, 80, 220) : color(150, 100, 50, 180)); stroke(255, 200, 150); strokeWeight(1); rect(btnRst.x, btnRst.y, btnRst.w, btnRst.h, 4); fill(255); noStroke(); textSize(16); textAlign(CENTER, CENTER); text("Restart", btnRst.x + btnRst.w / 2, btnRst.y + btnRst.h / 2);

    // D.1: Draw Settings Button
    let btnSet = uiButtons.pauseSettings;
    if (btnSet) { // Check if calculated
        fill(isMouseOver(btnSet) ? color(180, 180, 210) : color(120, 120, 150));
        stroke(200); strokeWeight(1);
        rect(btnSet.x, btnSet.y, btnSet.w, btnSet.h, 4);
        fill(255); noStroke(); textSize(16); textAlign(CENTER, CENTER);
        text("Settings (O)", btnSet.x + btnSet.w / 2, btnSet.y + btnSet.h / 2);
    }

    // C.4: Draw Full Event Log Panel on Pause Screen
    drawFullEventLog();

    pop();
}


// C.4: Event Log UI Drawing Functions
function drawEventLogSnippet() { /* Unchanged */ const snippetHeight = 60; const snippetWidth = 300; const snippetX = width - snippetWidth - 15; const snippetY = uiButtons.minimap.y + uiButtons.minimap.h + 10; const maxEntries = 3; const entryHeight = 16; push(); resetMatrix(); fill(10, 15, 30, 180); stroke(70, 90, 130); rect(snippetX, snippetY, snippetWidth, snippetHeight, 5); fill(180); textSize(10); textAlign(LEFT, TOP); let currentY = snippetY + 5; for(let i = 0; i < min(eventHistory.length, maxEntries); i++) { if (currentY > snippetY + snippetHeight - entryHeight + 2) break; const entry = eventHistory[i]; if (entry.status === 'started') { fill(255, 180, 180); } else if (entry.status === 'ended') { fill(180, 220, 255); } else { fill(180); } text(entry.message, snippetX + 5, currentY, snippetWidth - 10); currentY += entryHeight; } pop(); }
function drawFullEventLog() { /* Unchanged */ const panelW = 300; const panelX = width - panelW - 15; const panelY = uiButtons.mapNavMap ? uiButtons.mapNavMap.y + uiButtons.mapNavMap.h + 10 : 60; const panelH = height - panelY - 20; const filterAreaH = 40; const listAreaY = panelY + filterAreaH + 5; const listAreaH = panelH - filterAreaH - 10; const entryHeight = 15; const scrollbarWidth = 10; push(); resetMatrix(); fill(10, 15, 30, 210); stroke(70, 90, 130); rect(panelX, panelY, panelW, panelH, 5); fill(200); textSize(14); textAlign(CENTER, TOP); text("Event Log", panelX + panelW / 2, panelY + 8); textSize(10); textAlign(LEFT, TOP); fill(150); text(`Filter: ${eventLogFilterType}`, panelX + 5, panelY + 25); let locText = `Loc: ${eventLogFilterLocation}`; if (eventLogFilterLocation === 'All' && selectedMapPlanet) { locText = `Loc: All (Selected: ${selectedMapPlanet.name})`; } else if (eventLogFilterLocation !== 'All') { locText = `Loc: ${eventLogFilterLocation}`; } textAlign(RIGHT, TOP); text(locText, panelX + panelW - 5, panelY + 25); let filteredLog = eventHistory.filter(entry => { const typeMatch = (eventLogFilterType === 'All' || entry.eventType === eventLogFilterType); const locMatch = (eventLogFilterLocation === 'All' || entry.location === eventLogFilterLocation); return typeMatch && locMatch; }); const listAreaX = panelX + 5; const listAreaW = panelW - 10 - (filteredLog.length * entryHeight > listAreaH ? scrollbarWidth + 5 : 0); const maxVisibleEntries = floor(listAreaH / entryHeight); eventLogScrollOffset = constrain(eventLogScrollOffset, 0, max(0, filteredLog.length - maxVisibleEntries)); let startIndex = floor(eventLogScrollOffset); let endIndex = min(filteredLog.length, startIndex + maxVisibleEntries); let currentY = listAreaY; textAlign(LEFT, TOP); textSize(10); for (let i = startIndex; i < endIndex; i++) { if (currentY > listAreaY + listAreaH - entryHeight) break; const entry = filteredLog[i]; if (entry.status === 'started') fill(255, 180, 180); else if (entry.status === 'ended') fill(180, 220, 255); else fill(180); text(entry.message, listAreaX, currentY, listAreaW); currentY += entryHeight; } if (filteredLog.length > maxVisibleEntries) { const scrollbarX = listAreaX + listAreaW + 5; const scrollbarH = listAreaH; const thumbH = max(10, scrollbarH * (maxVisibleEntries / filteredLog.length)); const thumbY = listAreaY + (scrollbarH - thumbH) * (eventLogScrollOffset / max(1, filteredLog.length - maxVisibleEntries)); fill(50, 50, 80); noStroke(); rect(scrollbarX, listAreaY, scrollbarWidth, scrollbarH); fill(100, 100, 150); rect(scrollbarX, thumbY, scrollbarWidth, thumbH, 3); } pop(); }


// --- D.2: Settings View Drawing Functions ---
function drawSettingsView() {
    push();
    resetMatrix();
    fill(0, 0, 0, 200); rect(0, 0, width, height); // Background Overlay

    let panelW = width * 0.8; let panelH = height * 0.8; let panelX = width / 2 - panelW / 2; let panelY = height / 2 - panelH / 2;

    fill(20, 30, 50, 220); stroke(100, 150, 200); rect(panelX, panelY, panelW, panelH, 8); // Panel Background
    fill(220); noStroke(); textSize(24); textAlign(CENTER, TOP); text("Settings", panelX + panelW / 2, panelY + 15); // Title

    let menuWidth = 180;
    drawSettingsMenu(panelX, panelY, panelH, menuWidth);
    drawActiveSettingsPanel(panelX + menuWidth, panelY, panelW - menuWidth, panelH);

    pop();
}

function drawSettingsMenu(panelX, panelY, panelH, menuWidth) {
    let menuX = panelX + 10; let menuY = panelY + 60; let menuItemHeight = 35; let menuSpacing = 8;
    const categories = ['Physics', 'Gameplay', 'Events', 'Keys'];
    uiButtons.settingsMenuItems = [];

    let currentItemY = menuY;
    for (const category of categories) {
        let itemRect = { x: menuX, y: currentItemY, w: menuWidth - 20, h: menuItemHeight };
        let isActive = (activeSettingsCategory === category); let isHover = isMouseOver(itemRect);
        if (isActive) { fill(80, 120, 200, 200); } else if (isHover) { fill(50, 80, 130, 180); } else { fill(30, 50, 80, 150); }
        noStroke(); rect(itemRect.x, itemRect.y, itemRect.w, itemRect.h, 4);
        fill(isActive ? 255 : 200); textSize(14); textAlign(LEFT, CENTER); text(category, itemRect.x + 15, itemRect.y + itemRect.h / 2);
        uiButtons.settingsMenuItems.push({ category: category, rect: itemRect });
        currentItemY += menuItemHeight + menuSpacing;
    }
}

function drawActiveSettingsPanel(contentX, contentY, contentW, contentH) {
     push();
     translate(contentX + 15, contentY + 60); // Use translate for relative positioning, add padding
     switch (activeSettingsCategory) {
         case 'Physics': drawSettingsPanel_Physics(contentW - 30, contentH - 75); break;
         case 'Gameplay': drawSettingsPanel_Gameplay(contentW - 30, contentH - 75); break;
         case 'Events': drawSettingsPanel_Events(contentW - 30, contentH - 75); break;
         case 'Keys': drawSettingsPanel_Keys(contentW - 30, contentH - 75); break;
     }
     pop();
}
// --- End D.2 ---


// --- D.3/D.4: Settings Panel Drawing Functions ---
function drawSettingsPanel_Physics(w, h) {
    let yPos = 0; let settingHeight = 30; let buttonSize = 20; let labelX = 0; let valueX = 250; let buttonX1 = valueX + 50; let buttonX2 = buttonX1 + buttonSize + 10; let descriptionX = buttonX2 + buttonSize + 15;
    fill(220); textSize(16); textAlign(LEFT, TOP); text("Physics Settings", labelX, yPos); yPos += settingHeight * 1.5;

    textSize(12); textAlign(LEFT, CENTER); fill(200); text("Global Gravity:", labelX, yPos + buttonSize / 2);
    textAlign(CENTER, CENTER); fill(220); text(G.toFixed(2), valueX, yPos + buttonSize / 2);
    uiButtons.settingsGravityDec = {x: buttonX1, y: yPos, w: buttonSize, h: buttonSize}; uiButtons.settingsGravityInc = {x: buttonX2, y: yPos, w: buttonSize, h: buttonSize};
    drawSettingsButton(uiButtons.settingsGravityDec, "-"); drawSettingsButton(uiButtons.settingsGravityInc, "+");
    fill(150); textAlign(LEFT, CENTER); text("Controls the overall strength of gravitational pull.", descriptionX, yPos + buttonSize / 2); yPos += settingHeight;

    textAlign(LEFT, CENTER); fill(200); text("Booster Power:", labelX, yPos + buttonSize / 2);
    textAlign(CENTER, CENTER); fill(220); text(BOOST_FORCE_MAGNITUDE.toFixed(2), valueX, yPos + buttonSize / 2);
    uiButtons.settingsBoostDec = {x: buttonX1, y: yPos, w: buttonSize, h: buttonSize}; uiButtons.settingsBoostInc = {x: buttonX2, y: yPos, w: buttonSize, h: buttonSize};
    drawSettingsButton(uiButtons.settingsBoostDec, "-"); drawSettingsButton(uiButtons.settingsBoostInc, "+");
     fill(150); textAlign(LEFT, CENTER); text("Adjusts the acceleration provided by the booster.", descriptionX, yPos + buttonSize / 2); yPos += settingHeight * 1.5;

    fill(220); textSize(14); textAlign(LEFT, TOP); text("Celestial Body Mass", labelX, yPos);
    fill(150); textSize(11); text("Adjusts mass, impacting specific gravity (Input Fields Deferred).", labelX, yPos + 15);
    yPos += settingHeight * 1.2; textSize(12);

    textAlign(LEFT, CENTER); fill(200); text(star.name + " Mass:", labelX, yPos + buttonSize / 2);
    textAlign(CENTER, CENTER); fill(220); text(star.mass.toFixed(0), valueX, yPos + buttonSize / 2);
    fill(150); textAlign(LEFT, CENTER); text("Affects star's gravity.", descriptionX, yPos + buttonSize / 2); yPos += settingHeight;

    for(let i = 0; i < planets.length; i++) { let p = planets[i]; textAlign(LEFT, CENTER); fill(200); text(p.name + " Mass:", labelX, yPos + buttonSize / 2); textAlign(CENTER, CENTER); fill(220); text(p.mass.toFixed(0), valueX, yPos + buttonSize / 2); fill(150); textAlign(LEFT, CENTER); text("Affects planet's gravity.", descriptionX, yPos + buttonSize / 2); yPos += settingHeight; if (yPos > h - settingHeight) break; }
}

function drawSettingsPanel_Gameplay(w, h) {
    let yPos = 0; let settingHeight = 30; let buttonSize = 20; let labelX = 0; let valueX = 250; let buttonX1 = valueX + 50; let buttonX2 = buttonX1 + buttonSize + 10; let descriptionX = buttonX2 + buttonSize + 15;
    fill(220); textSize(16); textAlign(LEFT, TOP); text("Gameplay/Economy Settings", labelX, yPos); yPos += settingHeight * 1.5;

    textSize(12); textAlign(LEFT, CENTER); fill(200); text("Time Dilation Factor:", labelX, yPos + buttonSize / 2);
    textAlign(CENTER, CENTER); fill(220); text(TIME_DILATION_FACTOR.toFixed(2), valueX, yPos + buttonSize / 2);
    uiButtons.settingsTimeDilationDec = {x: buttonX1, y: yPos, w: buttonSize, h: buttonSize}; uiButtons.settingsTimeDilationInc = {x: buttonX2, y: yPos, w: buttonSize, h: buttonSize};
    drawSettingsButton(uiButtons.settingsTimeDilationDec, "-"); drawSettingsButton(uiButtons.settingsTimeDilationInc, "+");
    fill(150); textAlign(LEFT, CENTER); text("Simulation speed multiplier in Map/Report view.", descriptionX, yPos + buttonSize / 2); yPos += settingHeight;

    textAlign(LEFT, CENTER); fill(200); text("Economy Tick (Frames/Min):", labelX, yPos + buttonSize / 2);
    textAlign(CENTER, CENTER); fill(220); text(GAME_MINUTE_INTERVAL_FRAMES, valueX, yPos + buttonSize / 2);
    uiButtons.settingsEconomyTickDec = {x: buttonX1, y: yPos, w: buttonSize, h: buttonSize}; uiButtons.settingsEconomyTickInc = {x: buttonX2, y: yPos, w: buttonSize, h: buttonSize};
    drawSettingsButton(uiButtons.settingsEconomyTickDec, "-"); drawSettingsButton(uiButtons.settingsEconomyTickInc, "+");
     fill(150); textAlign(LEFT, CENTER); text("Lower value = faster economy updates.", descriptionX, yPos + buttonSize / 2); yPos += settingHeight;
}

function drawSettingsPanel_Events(w, h) {
    let yPos = 0; let settingHeight = 30; let buttonSize = 20; let labelX = 0; let valueX = 250; let buttonX1 = valueX + 50; let buttonX2 = buttonX1 + buttonSize + 10; let descriptionX = buttonX2 + buttonSize + 15;
    fill(220); textSize(16); textAlign(LEFT, TOP); text("Event Settings", labelX, yPos); yPos += settingHeight * 1.5;

    textSize(12); textAlign(LEFT, CENTER); fill(200); text("Global Event Frequency:", labelX, yPos + buttonSize / 2);
    textAlign(CENTER, CENTER); fill(220); text(eventFrequencyMultiplier.toFixed(1), valueX, yPos + buttonSize / 2);
    uiButtons.settingsEventFreqDec = {x: buttonX1, y: yPos, w: buttonSize, h: buttonSize}; uiButtons.settingsEventFreqInc = {x: buttonX2, y: yPos, w: buttonSize, h: buttonSize};
    drawSettingsButton(uiButtons.settingsEventFreqDec, "-"); drawSettingsButton(uiButtons.settingsEventFreqInc, "+");
    fill(150); textAlign(LEFT, CENTER); text("Multiplier for overall event chance.", descriptionX, yPos + buttonSize / 2); yPos += settingHeight;

    textAlign(LEFT, CENTER); fill(200); text("Max Active Events:", labelX, yPos + buttonSize / 2);
    textAlign(CENTER, CENTER); fill(220); text(MAX_ACTIVE_EVENTS, valueX, yPos + buttonSize / 2);
    uiButtons.settingsMaxEventsDec = {x: buttonX1, y: yPos, w: buttonSize, h: buttonSize}; uiButtons.settingsMaxEventsInc = {x: buttonX2, y: yPos, w: buttonSize, h: buttonSize};
    drawSettingsButton(uiButtons.settingsMaxEventsDec, "-"); drawSettingsButton(uiButtons.settingsMaxEventsInc, "+");
    fill(150); textAlign(LEFT, CENTER); text("Limit on simultaneous events.", descriptionX, yPos + buttonSize / 2); yPos += settingHeight * 1.5;

    fill(200); textSize(13); textAlign(LEFT, TOP); text("Event Type Frequency Multipliers", labelX, yPos);
    fill(150); textSize(11); text("Adjusts relative frequency for specific event categories.", labelX, yPos + 15); yPos += settingHeight * 1.2; textSize(12);

    textAlign(LEFT, CENTER); fill(200); text("Environmental:", labelX, yPos + buttonSize / 2); textAlign(CENTER, CENTER); fill(220); text(envEventFreqMult.toFixed(1), valueX, yPos + buttonSize / 2); uiButtons.settingsEnvFreqDec = {x: buttonX1, y: yPos, w: buttonSize, h: buttonSize}; uiButtons.settingsEnvFreqInc = {x: buttonX2, y: yPos, w: buttonSize, h: buttonSize}; drawSettingsButton(uiButtons.settingsEnvFreqDec, "-"); drawSettingsButton(uiButtons.settingsEnvFreqInc, "+"); yPos += settingHeight;
    textAlign(LEFT, CENTER); fill(200); text("Economic:", labelX, yPos + buttonSize / 2); textAlign(CENTER, CENTER); fill(220); text(ecoEventFreqMult.toFixed(1), valueX, yPos + buttonSize / 2); uiButtons.settingsEcoFreqDec = {x: buttonX1, y: yPos, w: buttonSize, h: buttonSize}; uiButtons.settingsEcoFreqInc = {x: buttonX2, y: yPos, w: buttonSize, h: buttonSize}; drawSettingsButton(uiButtons.settingsEcoFreqDec, "-"); drawSettingsButton(uiButtons.settingsEcoFreqInc, "+"); yPos += settingHeight;
    textAlign(LEFT, CENTER); fill(200); text("Social/Political:", labelX, yPos + buttonSize / 2); textAlign(CENTER, CENTER); fill(220); text(socEventFreqMult.toFixed(1), valueX, yPos + buttonSize / 2); uiButtons.settingsSocFreqDec = {x: buttonX1, y: yPos, w: buttonSize, h: buttonSize}; uiButtons.settingsSocFreqInc = {x: buttonX2, y: yPos, w: buttonSize, h: buttonSize}; drawSettingsButton(uiButtons.settingsSocFreqDec, "-"); drawSettingsButton(uiButtons.settingsSocFreqInc, "+"); yPos += settingHeight;
    textAlign(LEFT, CENTER); fill(200); text("Technological:", labelX, yPos + buttonSize / 2); textAlign(CENTER, CENTER); fill(220); text(techEventFreqMult.toFixed(1), valueX, yPos + buttonSize / 2); uiButtons.settingsTechFreqDec = {x: buttonX1, y: yPos, w: buttonSize, h: buttonSize}; uiButtons.settingsTechFreqInc = {x: buttonX2, y: yPos, w: buttonSize, h: buttonSize}; drawSettingsButton(uiButtons.settingsTechFreqDec, "-"); drawSettingsButton(uiButtons.settingsTechFreqInc, "+"); yPos += settingHeight;
}

// --- D.6: Key Binding Panel ---
function drawSettingsPanel_Keys(w, h) {
    let xPos = 0; let yPos = 0; let itemHeight = 28; let spacing = 8; let actionLabelWidth = 100; let keyDisplayWidth = 80; let rebindButtonWidth = 80; let descriptionX = xPos + actionLabelWidth + keyDisplayWidth + rebindButtonWidth + 30;
    fill(220); textSize(16); textAlign(LEFT, TOP); text("Key Bindings", xPos, yPos); yPos += itemHeight * 1.5;
    uiButtons.keyRebindButtons = {};

    const actionDescriptions = { PAUSE: 'Toggles the game pause state.', MAP_TOGGLE: 'Opens/Closes the system map view.', SETTINGS_OPEN: 'Opens this settings view.', TRADE_REPORT: 'Opens the trade report view.', BOOST: 'Activates ship booster.', EJECT: 'Initiates escape pod / Exits menus.', ROTATE_LEFT: 'Rotates ship left when landed.', ROTATE_RIGHT: 'Rotates ship right when landed.' };

    for (const actionName in keyBindings) {
        if (yPos > h - itemHeight) break;
        let displayActionName = actionName.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
        let currentKey = getKeyNameForAction(actionName);

        textAlign(LEFT, CENTER); fill(200); textSize(12); text(displayActionName + ":", xPos, yPos + itemHeight / 2);
        let keyDisplayX = xPos + actionLabelWidth + 10;
        textAlign(CENTER, CENTER); fill(220); textSize(13); rectMode(CENTER); fill(40, 60, 90); noStroke(); rect(keyDisplayX + keyDisplayWidth/2, yPos + itemHeight/2, keyDisplayWidth, itemHeight * 0.8, 4); fill(220); text(currentKey, keyDisplayX + keyDisplayWidth / 2, yPos + itemHeight / 2); rectMode(CORNER);

        let rebindButtonX = keyDisplayX + keyDisplayWidth + 10;
        let rebindButtonRect = { x: rebindButtonX, y: yPos + (itemHeight - 22)/2, w: rebindButtonWidth, h: 22 };

        if (rebindingAction === actionName) { fill(255, 255, 0); textSize(11); textAlign(CENTER, CENTER); noStroke(); text("[Press key...]", rebindButtonX + rebindButtonWidth / 2, yPos + itemHeight / 2); }
        else { let isHover = isMouseOver(rebindButtonRect); fill(isHover ? color(180, 180, 210) : color(120, 120, 150)); stroke(200); rect(rebindButtonRect.x, rebindButtonRect.y, rebindButtonRect.w, rebindButtonRect.h, 3); fill(255); noStroke(); textSize(12); textAlign(CENTER, CENTER); text("Rebind", rebindButtonX + rebindButtonWidth / 2, yPos + itemHeight / 2); uiButtons.keyRebindButtons[actionName] = rebindButtonRect; }

        fill(150); textSize(11); textAlign(LEFT, CENTER); text(actionDescriptions[actionName] || '', descriptionX, yPos + itemHeight / 2);
        yPos += itemHeight + spacing;
    }
}
// --- End D.6 ---

// --- D.3 Helper ---
function drawSettingsButton(buttonRect, label) {
    if (!buttonRect) return; let isHover = isMouseOver(buttonRect); fill(isHover ? color(180, 180, 210) : color(120, 120, 150)); stroke(200); rect(buttonRect.x, buttonRect.y, buttonRect.w, buttonRect.h, 3); fill(255); noStroke(); textSize(label === '-' || label === '+' ? 16 : 12); textAlign(CENTER, CENTER); text(label, buttonRect.x + buttonRect.w / 2, buttonRect.y + buttonRect.h / 2);
}
// --- End D.3 ---

// --- D.2/D.3/D.6: Settings Click Handling ---
function handleSettingsPanelClick() {
    switch (activeSettingsCategory) {
        case 'Physics':
            if (isMouseOver(uiButtons.settingsGravityDec)) { G = constrain(G - G_INCREMENT, MIN_G, MAX_G); return true; }
            if (isMouseOver(uiButtons.settingsGravityInc)) { G = constrain(G + G_INCREMENT, MIN_G, MAX_G); return true; }
            if (isMouseOver(uiButtons.settingsBoostDec)) { BOOST_FORCE_MAGNITUDE = max(0.01, round((BOOST_FORCE_MAGNITUDE - 0.01) * 100) / 100 ); return true; } // Round to avoid float issues
            if (isMouseOver(uiButtons.settingsBoostInc)) { BOOST_FORCE_MAGNITUDE = min(0.5, round((BOOST_FORCE_MAGNITUDE + 0.01) * 100) / 100 ); return true; }
            break;
        case 'Gameplay':
             if (isMouseOver(uiButtons.settingsTimeDilationDec)) { TIME_DILATION_FACTOR = max(0.05, round((TIME_DILATION_FACTOR - 0.05) * 100) / 100); return true; }
             if (isMouseOver(uiButtons.settingsTimeDilationInc)) { TIME_DILATION_FACTOR = min(1.0, round((TIME_DILATION_FACTOR + 0.05) * 100) / 100); return true; }
             if (isMouseOver(uiButtons.settingsEconomyTickDec)) { GAME_MINUTE_INTERVAL_FRAMES = max(10, GAME_MINUTE_INTERVAL_FRAMES - 10); return true; }
             if (isMouseOver(uiButtons.settingsEconomyTickInc)) { GAME_MINUTE_INTERVAL_FRAMES = min(600, GAME_MINUTE_INTERVAL_FRAMES + 10); return true; }
            break;
        case 'Events':
            if (isMouseOver(uiButtons.settingsEventFreqDec)) { eventFrequencyMultiplier = max(0.1, round((eventFrequencyMultiplier - 0.1) * 10) / 10); return true; }
            if (isMouseOver(uiButtons.settingsEventFreqInc)) { eventFrequencyMultiplier = min(5.0, round((eventFrequencyMultiplier + 0.1) * 10) / 10); return true; }
            if (isMouseOver(uiButtons.settingsMaxEventsDec)) { MAX_ACTIVE_EVENTS = max(1, MAX_ACTIVE_EVENTS - 1); return true; }
            if (isMouseOver(uiButtons.settingsMaxEventsInc)) { MAX_ACTIVE_EVENTS = min(10, MAX_ACTIVE_EVENTS + 1); return true; }
            if (isMouseOver(uiButtons.settingsEnvFreqDec)) { envEventFreqMult = max(0.1, round((envEventFreqMult - 0.1)*10)/10); return true; }
            if (isMouseOver(uiButtons.settingsEnvFreqInc)) { envEventFreqMult = min(5.0, round((envEventFreqMult + 0.1)*10)/10); return true; }
            if (isMouseOver(uiButtons.settingsEcoFreqDec)) { ecoEventFreqMult = max(0.1, round((ecoEventFreqMult - 0.1)*10)/10); return true; }
            if (isMouseOver(uiButtons.settingsEcoFreqInc)) { ecoEventFreqMult = min(5.0, round((ecoEventFreqMult + 0.1)*10)/10); return true; }
            if (isMouseOver(uiButtons.settingsSocFreqDec)) { socEventFreqMult = max(0.1, round((socEventFreqMult - 0.1)*10)/10); return true; }
            if (isMouseOver(uiButtons.settingsSocFreqInc)) { socEventFreqMult = min(5.0, round((socEventFreqMult + 0.1)*10)/10); return true; }
            if (isMouseOver(uiButtons.settingsTechFreqDec)) { techEventFreqMult = max(0.1, round((techEventFreqMult - 0.1)*10)/10); return true; }
            if (isMouseOver(uiButtons.settingsTechFreqInc)) { techEventFreqMult = min(5.0, round((techEventFreqMult + 0.1)*10)/10); return true; }
            break;
        case 'Keys':
             for (const actionName in uiButtons.keyRebindButtons) { if (isMouseOver(uiButtons.keyRebindButtons[actionName])) { if (rebindingAction !== actionName) { rebindingAction = actionName; console.log("Waiting to rebind:", actionName); } return true; } }
            break;
    }
    return false;
}
// --- End D.2/D.3/D.6 ---


// --- Remaining UI/Helper Functions --- (Restored/Unchanged)
function handleTradeMenuClick() { for (let btn of tradeMenu.actionButtons) { if (isMouseOver(btn.rect)) { if (tradeMenu.mode === 'SELL') { sellCommodity(btn.commodity, btn.qty); } else { buyCommodity(btn.commodity, btn.qty); } return true; } } return false; }
function buyCommodity(commodityName, quantity) { if (!tradeMenu.planet) return; let marketData = tradeMenu.planet.marketData[commodityName]; if (!marketData) return; let cost = marketData.sellPrice * quantity; let purchaseTonnage = quantity * TONS_PER_UNIT; if (player.money >= cost) { if (player.getCurrentCargoTons() + purchaseTonnage <= player.maxCargoTons) { player.money -= cost; player.inventory[commodityName] = (player.inventory[commodityName] || 0) + quantity; console.log(`Bought ${quantity}U (${purchaseTonnage}T) ${commodityName}`); tradeMenu.planet.updateMarketPrices(); } else { console.log("Not enough cargo space!"); } } else { console.log("Not enough money!"); } }
function sellCommodity(commodityName, quantity) { if (!tradeMenu.planet) return; let marketData = tradeMenu.planet.marketData[commodityName]; if (!marketData) return; let playerQtyUnits = player.inventory[commodityName] || 0; let sellQtyUnits = min(quantity, playerQtyUnits); let sellTonnage = sellQtyUnits * TONS_PER_UNIT; if (sellQtyUnits > 0) { let earnings = marketData.buyPrice * sellQtyUnits; player.money += earnings; player.inventory[commodityName] -= sellQtyUnits; console.log(`Sold ${sellQtyUnits}U (${sellTonnage}T) ${commodityName}`); tradeMenu.planet.updateMarketPrices(); } else { console.log("Not enough to sell!"); } }
function mouseIsInTradeMenu() { return mouseX > tradeMenu.x && mouseX < tradeMenu.x + tradeMenu.w && mouseY > tradeMenu.y && mouseY < tradeMenu.y + tradeMenu.h; }
function drawDashedLine(x1, y1, x2, y2, dL, gL) { const lL=dist(x1,y1,x2,y2);if(lL<=0)return;const a=atan2(y2-y1,x2-x1);const tL=dL+gL;if(tL<=0)return;push();if(drawingContext.setLineDash){drawingContext.save();drawingContext.setLineDash([dL,gL]);drawingContext.beginPath();drawingContext.moveTo(x1,y1);drawingContext.lineTo(x2,y2);drawingContext.stroke();drawingContext.restore();}else{line(x1,y1,x2,y2);} pop();}
function drawEscapeConfirmation() { push(); resetMatrix(); fill(0,0,0,180); rect(0,0,width,height); let bW=300,bH=120,bX=width/2-bW/2,bY=height/2-bH/2; fill(30,40,70,230); stroke(100,150,255); strokeWeight(2); rect(bX,bY,bW,bH,8); fill(220); noStroke(); textSize(16); textAlign(CENTER,CENTER); text(`Use escape pod (Enter)?\nCost: $${ESCAPE_POD_COST}`,bX+bW/2,bY+bH/2-20); if(player.money<ESCAPE_POD_COST){fill(255,150,150);textSize(12);text(`(This will increase your debt!)`,bX+bW/2,bY+bH/2+10);} let btnY=bY+bH-45,btnW=100,btnH=30; let yBX=bX+bW/2-btnW-10; let nBX=bX+bW/2+10; fill(isMouseOver({x:yBX,y:btnY,w:btnW,h:btnH})?color(80,200,80,220):color(50,150,50,180)); stroke(150,255,150); strokeWeight(1); rect(yBX,btnY,btnW,btnH,4); fill(255); noStroke(); textSize(14); text("Yes (Ent)",yBX+btnW/2,btnY+btnH/2); fill(isMouseOver({x:nBX,y:btnY,w:btnW,h:btnH})?color(200,80,80,220):color(150,50,50,180)); stroke(255,150,150); strokeWeight(1); rect(nBX,btnY,btnW,btnH,4); fill(255); noStroke(); textSize(14); text("No (Esc)",nBX+btnW/2,btnY+btnH/2); pop();}
function drawGameOver() { push(); resetMatrix(); fill(255,0,0,150); rect(0,0,width,height); fill(255); textSize(64); textAlign(CENTER,CENTER); text("GAME OVER",width/2,height/2-40); textSize(24); text("Your ship met its demise!\nPress SPACEBAR to restart.",width/2,height/2+40); pop(); noLoop(); }

</script>

</body>
</html>