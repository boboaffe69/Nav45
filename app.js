/* =========================================================
   NAV45 — navigation for 45 km/h microcars
   Map: OpenFreeMap (OpenStreetMap) · Routing: Valhalla (FOSSGIS), moped profile
   Search: Photon · Charging: Bundesnetzagentur register · Fuel: OpenStreetMap (bundled)
   ========================================================= */
'use strict';
(() => {

const CFG = {
  valhalla: 'https://valhalla1.openstreetmap.de',
  photon: 'https://photon.komoot.io',
  styles: { light: 'https://tiles.openfreemap.org/styles/liberty', dark: 'https://tiles.openfreemap.org/styles/dark' },
  home: { center: [10.45, 51.1], zoom: 5.6 },
};
// Live GPS only in the phone app (Capacitor) or a mobile browser — never on the PC.
const IS_MOBILE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())
  || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1); // iPad
const HAS_GPS = IS_MOBILE && 'geolocation' in navigator;

/* =========================================================
   LANGUAGE
   ========================================================= */
const I18N = {
  en: {
    previewSetting: 'Preview drives', voicePick: 'Voice', systemVoice: 'System voice',
    voiceLoading: 'Loading the natural voice (one time, ~60 MB): {p} %', voiceReady: 'Natural voice ready',
    themeLabel: 'Map colors', themeAuto: 'Automatic', themeLight: 'Light', themeDark: 'Dark', batterySaver: 'Battery saver',
    stationsCount: '{c} charging · {f} fuel stations', stationsHint: 'Plan a route to see stations along the way',
    menu: 'Menu', togglePanel: 'Collapse side panel', electric: 'Electric', combustion: 'Fuel', reverse: 'Reverse starting point and destination',
    addStop: 'Add stop', options: 'Options', prefFastest: 'Fastest', prefQuiet: 'Quiet roads', prefShortest: 'Shortest',
    hills: 'Avoid steep hills', ferries: 'Avoid ferries', topSpeed: 'Top speed', legalLine: 'Never uses Autobahn or Kraftfahrstraße',
    vehicleModel: 'Model', moreVehicle: 'Range, battery and costs', batteryNow: 'Battery now', fuelNow: 'Tank now', kmRange: '{p}% · {k} km range',
    tabCharge: 'Charging', tabFuel: 'Fuel', fitsCar: 'Fits my car', dieselOnly: 'Diesel', petrolOnly: 'Petrol', within: 'Within {d}',
    language: 'Language', langName: 'English', voiceGuidance: 'Voice guidance', rangeRing: 'Show range on map', vehicleSettings: 'Vehicle settings',
    darkMode: 'Dark mode', north: 'Reset bearing to north', view3d: 'Tilt map (3D)', myLoc: 'Your location', zoomIn: 'Zoom in', zoomOut: 'Zoom out',
    searchHere: 'Search stations in this area', roadLimit: 'Speed limit on this road', voice: 'Voice on/off', overview: 'Route overview',
    recenter: 'Re-center', endNav: 'Exit navigation', light: 'Light', dark: 'Dark',
    chooseStart: 'Choose starting point', whereTo: 'Choose destination', addAStop: 'Add stop', removeStop: 'Remove',
    chargeHere: 'Charge', refuelHere: 'Refuel', chargeHereTitle: 'Charge/refuel at this stop',
    yourLocation: 'Your location', useGps: 'Use GPS', recent: 'Recent', searching: 'Searching…', noPlaces: 'No results', myLocLabel: 'Your location',
    droppedPin: 'Dropped pin', routes: 'Routes', via: 'via {a}', viaAnd: 'via {a} and {b}', fastestRoute: 'Fastest route', shortestRoute: 'Shortest route',
    alternative: 'Alternative route', quietRoute: 'Quiet route', noAutobahn: 'No Autobahn / Kraftfahrstraße', arriveAt: 'Arrive {t}', arriveWith: 'Arrive with {p}%',
    needsCharge: 'Needs a charging stop', needsFuel: 'Needs a fuel stop', chargingTime: '+{d} charging',
    chargePlusTitle: 'Time to charge back to 100 % at your charging stops', fuelPlusTitle: 'Time for your fuel stops',
    arriveIncl: 'Arrive {t} incl. charging', chargeTag: '+ {d} charging', splitDrive: 'Driving', splitCharge: 'Charging stops', splitFuel: 'Fuel stops', splitTotal: 'Total trip',
    chargeModeLabel: 'At charging stops', chargeNeeded: 'Charge only what I need (faster)', chargeFull: 'Charge up to the “Charge to” value',
    notEnough: '<b>Not enough range.</b> Your {what} runs out at km {km} of {total}.', whatEV: 'battery', whatFuel: 'tank',
    belowReserve: 'You drop below your {r}% reserve around km {km} and arrive with {a}%.', rangeOk: 'Range OK — you arrive with {a}% (about {k} km left).',
    autoPlanCharge: 'Add charging stops automatically', autoPlanFuel: 'Add fuel stops automatically', quickStop: 'quick stop',
    start: 'Start', preview: 'Preview drive', steps: 'Steps', hideSteps: 'Hide steps',
    updated: 'Route updated', sameRoute: 'Checked — this is already the best route for that setting', calcRoute: 'Finding the best route…', retry: 'Try again',
    noLegalRoute: 'No legal route for a 45 km/h vehicle between these points.', routingUnavailable: 'The routing service is not reachable right now.',
    routingTimeout: 'The routing service took too long to answer.', mapFail: 'The map could not load. Check your internet connection.',
    batteryAlong: 'Battery along the route', fuelAlong: 'Fuel along the route', energyUsed: 'energy', fuelUsed: 'fuel', estCost: 'cost', onArrival: 'at arrival',
    alongRoute: 'Along your route', inArea: 'In this area', stations: 'Stations',
    emptyPlan: 'Plan a route to see {what} along the way, or zoom into the map and use “{btn}”.',
    whatChargers: 'charging stations', whatFuels: 'fuel stations', pluralChargers: 'charging stations', pluralFuels: 'fuel stations', oneCharger: 'charging station', oneFuel: 'fuel station',
    noneRoute: 'No {what} within {d} of the route. Try a wider distance.', noneArea: 'No {what} in this area.', zoomInMore: 'Zoom in further to search this area.',
    onRoute: 'on route', away: 'away', suggested: 'Suggested', addAsStop: 'Add stop', removeFromRoute: 'Remove stop', showMore: 'Show {n} more',
    removed: 'Removed {n}', addedStop: 'Added stop: {n}',
    gapLeft: 'Added {c} stop(s), but part of the route still has no {w} in reach. Try a wider distance.',
    noneInReach: 'No {w} in reach on this route. Try a wider distance or charge before you leave.',
    autoAddedCharge: 'Added {n} charging stop(s)', autoAddedFuel: 'Added {n} fuel stop(s)',
    kmOnRoute: 'km {km} of your route', directlyOnRoute: 'directly on the route', offRoute: '{d} off the route',
    goHere: 'Directions', startHere: 'From here', stopBtn: 'Add stop',
    plugsUnknown: 'plugs unknown', dcOnly: 'fast-charge only (CCS)', open247: 'Open 24/7', card: 'card payment',
    noGps: 'No GPS signal — starting a preview drive instead.', gpsLost: 'GPS signal lost…', offRouteToast: 'Rerouting…', recalcVoice: 'Rerouting',
    reachedStopVoice: 'You have reached stop {k}', reachedStop: 'Reached stop {k}: {n}',
    chargeToast: 'Charge here: {f}% → {t}%, about {d}', refuelToast: 'Refuel here: {f}% → {t}%',
    chargingAt: 'Charging at {n}', refuelAt: 'Refuelling at {n}', realTime: 'Real time about {d} — sped up for the preview',
    arrivedVoice: 'You have arrived at your destination', arrived: 'You have arrived', distance: 'distance', driveTime: 'drive time', tripTime: 'trip time', done: 'Done', then: 'Then',
    settingsH: 'Vehicle settings', settingsLead: 'The model values are estimates. Enter your car’s real figures for accurate range planning.',
    capacity: 'Battery capacity (kWh)', rangeFull: 'Real range when full (km)', rangeHint: 'What you really get, not the brochure value',
    chargeKw: 'Charging power (kW)', chargeTo: 'Charge up to (%)', tank: 'Tank size (L)', consumption: 'Consumption (L/100 km)',
    fuelType: 'Fuel type', petrol: 'Petrol (Super / E10)', reserve: 'Safety reserve (%)', reserveHint: 'Warn before dropping below this',
    costs: 'Costs', priceKwh: 'Electricity price (€/kWh)', priceFuel: 'Fuel price (€/L)', cancel: 'Cancel', save: 'Save', saved: 'Saved',
    customE: 'Custom electric car', customF: 'Custom fuel car', groupE: 'Electric', groupF: 'Fuel', min: 'min', hmin: 'h',
    inM: 'In {d} meters', inKm: 'In {d} kilometers', desktopHint: 'Live GPS navigation is part of the phone app. On the PC you can plan routes and watch a preview drive.',
    dataNote: 'Charging stations: Bundesnetzagentur register ({c}). Fuel stations: OpenStreetMap ({f}). Map © OpenFreeMap, © OpenStreetMap contributors. Routing: Valhalla (FOSSGIS). Always follow road signs.',
  },
  de: {
    previewSetting: 'Vorschaufahrten', voicePick: 'Stimme', systemVoice: 'Systemstimme',
    voiceLoading: 'Natürliche Stimme wird geladen (einmalig, ca. 60 MB): {p} %', voiceReady: 'Natürliche Stimme bereit',
    themeLabel: 'Kartenfarben', themeAuto: 'Automatisch', themeLight: 'Hell', themeDark: 'Dunkel', batterySaver: 'Energiesparmodus',
    stationsCount: '{c} Ladestationen · {f} Tankstellen', stationsHint: 'Plane eine Route, um Stationen entlang der Strecke zu sehen',
    menu: 'Menü', togglePanel: 'Seitenleiste einklappen', electric: 'Elektro', combustion: 'Verbrenner', reverse: 'Start und Ziel tauschen',
    addStop: 'Stopp hinzufügen', options: 'Optionen', prefFastest: 'Schnellste', prefQuiet: 'Ruhige Straßen', prefShortest: 'Kürzeste',
    hills: 'Starke Steigungen meiden', ferries: 'Fähren meiden', topSpeed: 'Höchstgeschwindigkeit', legalLine: 'Nie über Autobahn oder Kraftfahrstraße',
    vehicleModel: 'Modell', moreVehicle: 'Reichweite, Akku und Kosten', batteryNow: 'Akku jetzt', fuelNow: 'Tank jetzt', kmRange: '{p}% · {k} km Reichweite',
    tabCharge: 'Laden', tabFuel: 'Tanken', fitsCar: 'Passt zu meinem Auto', dieselOnly: 'Diesel', petrolOnly: 'Benzin', within: 'Umkreis {d}',
    language: 'Sprache', langName: 'Deutsch', voiceGuidance: 'Sprachansagen', rangeRing: 'Reichweite auf der Karte', vehicleSettings: 'Fahrzeug-Einstellungen',
    darkMode: 'Dunkles Design', north: 'Nach Norden ausrichten', view3d: 'Karte neigen (3D)', myLoc: 'Mein Standort', zoomIn: 'Vergrößern', zoomOut: 'Verkleinern',
    searchHere: 'Stationen in diesem Bereich suchen', roadLimit: 'Tempolimit auf dieser Straße', voice: 'Ton an/aus', overview: 'Routenübersicht',
    recenter: 'Zentrieren', endNav: 'Navigation beenden', light: 'Hell', dark: 'Dunkel',
    chooseStart: 'Startpunkt wählen', whereTo: 'Ziel wählen', addAStop: 'Stopp hinzufügen', removeStop: 'Entfernen',
    chargeHere: 'Laden', refuelHere: 'Tanken', chargeHereTitle: 'An diesem Stopp laden/tanken',
    yourLocation: 'Mein Standort', useGps: 'GPS verwenden', recent: 'Zuletzt', searching: 'Suche…', noPlaces: 'Keine Ergebnisse', myLocLabel: 'Mein Standort',
    droppedPin: 'Markierter Ort', routes: 'Routen', via: 'über {a}', viaAnd: 'über {a} und {b}', fastestRoute: 'Schnellste Route', shortestRoute: 'Kürzeste Route',
    alternative: 'Alternative Route', quietRoute: 'Ruhige Route', noAutobahn: 'Keine Autobahn / Kraftfahrstraße', arriveAt: 'Ankunft {t}', arriveWith: 'Ankunft mit {p}%',
    needsCharge: 'Ladestopp nötig', needsFuel: 'Tankstopp nötig', chargingTime: '+{d} Laden',
    chargePlusTitle: 'Zeit, um an deinen Ladestopps wieder auf 100 % zu laden', fuelPlusTitle: 'Zeit für deine Tankstopps',
    arriveIncl: 'Ankunft {t} inkl. Laden', chargeTag: '+ {d} Laden', splitDrive: 'Fahrzeit', splitCharge: 'Ladestopps', splitFuel: 'Tankstopps', splitTotal: 'Gesamt',
    chargeModeLabel: 'An Ladestopps', chargeNeeded: 'Nur so viel laden wie nötig (schneller)', chargeFull: 'Bis zum „Laden bis“-Wert laden',
    notEnough: '<b>Reichweite reicht nicht.</b> {what} ist bei km {km} von {total} leer.', whatEV: 'Der Akku', whatFuel: 'Der Tank',
    belowReserve: 'Bei ca. km {km} fällst du unter deine {r}%-Reserve, Ankunft mit {a}%.', rangeOk: 'Reichweite OK – Ankunft mit {a}% (noch ca. {k} km).',
    autoPlanCharge: 'Ladestopps automatisch einplanen', autoPlanFuel: 'Tankstopps automatisch einplanen', quickStop: 'kurzer Stopp',
    start: 'Starten', preview: 'Vorschaufahrt', steps: 'Schritte', hideSteps: 'Schritte ausblenden',
    updated: 'Route aktualisiert', sameRoute: 'Geprüft – das ist für diese Einstellung bereits die beste Route', calcRoute: 'Beste Route wird gesucht…', retry: 'Erneut versuchen',
    noLegalRoute: 'Keine erlaubte Route für ein 45-km/h-Fahrzeug zwischen diesen Punkten.', routingUnavailable: 'Der Routing-Dienst ist gerade nicht erreichbar.',
    routingTimeout: 'Der Routing-Dienst hat zu lange gebraucht.', mapFail: 'Die Karte konnte nicht laden. Bitte Internetverbindung prüfen.',
    batteryAlong: 'Akku entlang der Route', fuelAlong: 'Tank entlang der Route', energyUsed: 'Energie', fuelUsed: 'Kraftstoff', estCost: 'Kosten', onArrival: 'bei Ankunft',
    alongRoute: 'Entlang der Route', inArea: 'In diesem Bereich', stations: 'Stationen',
    emptyPlan: 'Plane eine Route, um {what} entlang der Strecke zu sehen, oder zoome in die Karte und nutze „{btn}“.',
    whatChargers: 'Ladestationen', whatFuels: 'Tankstellen', pluralChargers: 'Ladestationen', pluralFuels: 'Tankstellen', oneCharger: 'Ladestation', oneFuel: 'Tankstelle',
    noneRoute: 'Keine {what} im Umkreis von {d} um die Route. Größeren Umkreis wählen.', noneArea: 'Keine {what} in diesem Bereich.', zoomInMore: 'Weiter hineinzoomen, um diesen Bereich zu durchsuchen.',
    onRoute: 'an der Route', away: 'entfernt', suggested: 'Empfohlen', addAsStop: 'Als Stopp', removeFromRoute: 'Stopp entfernen', showMore: '{n} weitere anzeigen',
    removed: '{n} entfernt', addedStop: 'Stopp hinzugefügt: {n}',
    gapLeft: '{c} Stopp(s) hinzugefügt, aber ein Teil der Route hat noch keine {w} in Reichweite. Größeren Umkreis wählen.',
    noneInReach: 'Keine {w} in Reichweite auf dieser Route. Größeren Umkreis wählen oder vor der Fahrt laden.',
    autoAddedCharge: '{n} Ladestopp(s) hinzugefügt', autoAddedFuel: '{n} Tankstopp(s) hinzugefügt',
    kmOnRoute: 'km {km} deiner Route', directlyOnRoute: 'direkt an der Route', offRoute: '{d} abseits der Route',
    goHere: 'Route hierher', startHere: 'Von hier', stopBtn: 'Als Stopp',
    plugsUnknown: 'Stecker unbekannt', dcOnly: 'nur Schnellladen (CCS)', open247: 'Rund um die Uhr', card: 'Kartenzahlung',
    noGps: 'Kein GPS-Signal – stattdessen startet eine Vorschaufahrt.', gpsLost: 'GPS-Signal verloren…', offRouteToast: 'Route wird neu berechnet…', recalcVoice: 'Route wird neu berechnet',
    reachedStopVoice: 'Sie haben Zwischenstopp {k} erreicht', reachedStop: 'Stopp {k} erreicht: {n}',
    chargeToast: 'Hier laden: {f}% → {t}%, ca. {d}', refuelToast: 'Hier tanken: {f}% → {t}%',
    chargingAt: 'Laden bei {n}', refuelAt: 'Tanken bei {n}', realTime: 'Echte Dauer ca. {d} – für die Vorschau beschleunigt',
    arrivedVoice: 'Sie haben Ihr Ziel erreicht', arrived: 'Ziel erreicht', distance: 'Strecke', driveTime: 'Fahrzeit', tripTime: 'Reisezeit', done: 'Fertig', then: 'Dann',
    settingsH: 'Fahrzeug-Einstellungen', settingsLead: 'Die Modellwerte sind Schätzungen. Trage die echten Werte deines Autos ein, damit die Reichweitenplanung stimmt.',
    capacity: 'Akkukapazität (kWh)', rangeFull: 'Reale Reichweite voll (km)', rangeHint: 'Was du wirklich schaffst, nicht der Prospektwert',
    chargeKw: 'Ladeleistung (kW)', chargeTo: 'Laden bis (%)', tank: 'Tankgröße (L)', consumption: 'Verbrauch (L/100 km)',
    fuelType: 'Kraftstoff', petrol: 'Benzin (Super / E10)', reserve: 'Sicherheitsreserve (%)', reserveHint: 'Warnung, bevor du darunter fällst',
    costs: 'Kosten', priceKwh: 'Strompreis (€/kWh)', priceFuel: 'Spritpreis (€/L)', cancel: 'Abbrechen', save: 'Speichern', saved: 'Gespeichert',
    customE: 'Eigenes E-Auto', customF: 'Eigener Verbrenner', groupE: 'Elektro', groupF: 'Verbrenner', min: 'Min.', hmin: 'Std.',
    inM: 'In {d} Metern', inKm: 'In {d} Kilometern', desktopHint: 'Die Live-Navigation mit GPS gibt es in der Handy-App. Am PC kannst du Routen planen und eine Vorschaufahrt ansehen.',
    dataNote: 'Ladestationen: Ladesäulenregister der Bundesnetzagentur ({c}). Tankstellen: OpenStreetMap ({f}). Karte © OpenFreeMap, © OpenStreetMap-Mitwirkende. Routing: Valhalla (FOSSGIS). Verkehrszeichen haben immer Vorrang.',
  },
};
const L = () => (S.lang.startsWith('de') ? 'de' : 'en');
function t(key, vars = {}) {
  let s = I18N[L()][key] ?? I18N.en[key] ?? key;
  for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
  return s;
}
const loc = () => (L() === 'de' ? 'de-DE' : 'en-GB');
const nf = (v, d = 1) => v.toLocaleString(loc(), { minimumFractionDigits: d, maximumFractionDigits: d });
const money = (v) => v.toLocaleString(loc(), { style: 'currency', currency: 'EUR' });
const ms = (name, cls = '') => `<span class="ms ${cls}">${name}</span>`;

/* =========================================================
   SETTINGS & VEHICLES
   ========================================================= */
const PRESETS = [
  { id: 'ami', name: 'Citroën Ami', type: 'electric', capacity: 5.5, rangeKm: 75, chargeKw: 1.8 },
  { id: 'rocks', name: 'Opel Rocks Electric', type: 'electric', capacity: 5.5, rangeKm: 75, chargeKw: 2.3 },
  { id: 'topolino', name: 'Fiat Topolino', type: 'electric', capacity: 5.4, rangeKm: 75, chargeKw: 2.3 },
  { id: 'microlino', name: 'Microlino Lite', type: 'electric', capacity: 5.5, rangeKm: 90, chargeKw: 2.3 },
  { id: 'custom-e', nameKey: 'customE', type: 'electric' },
  { id: 'aixam', name: 'Aixam City (Diesel)', type: 'fuel', fuelKind: 'diesel', tank: 16, consumption: 3.1 },
  { id: 'ligier', name: 'Ligier JS50 (Diesel)', type: 'fuel', fuelKind: 'diesel', tank: 16, consumption: 3.3 },
  { id: 'custom-f', nameKey: 'customF', type: 'fuel' },
];
const presetName = (p) => (p.nameKey ? t(p.nameKey) : p.name);
const DEFAULTS = {
  presetId: 'ami', type: 'electric', capacity: 5.5, rangeKm: 75, chargeKw: 1.8, tank: 16, consumption: 3.1, fuelKind: 'diesel',
  level: 80, reserve: 10, chargeTarget: 100, chargeMode: 'full', priceKwh: 0.40, priceFuel: 1.75,
  topSpeed: 45, routePref: 'fastest', avoidHills: false, avoidFerries: true,
  voice: true, lang: (navigator.language || 'en').toLowerCase().startsWith('de') ? 'de-DE' : 'en-US',
  voiceDe: 'de_DE-thorsten-medium', voiceEn: 'en_US-hfc_female-medium',
  theme: 'light', themeMode: 'auto', batterySaver: IS_MOBILE, stationsOpen: false,
  corridor: 1000, compatOnly: true, simMult: 1, threeD: false, showRange: false,
  previewEnabled: !IS_MOBILE, // phone: off until switched on in the menu; PC has no GPS, so previews are on
};
const store = {
  get(k, d) { try { const v = localStorage.getItem('nav45v2.' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('nav45v2.' + k, JSON.stringify(v)); } catch { /* ignore */ } },
};
const S = Object.assign({}, DEFAULTS, store.get('settings', {}));
if (!['auto', 'light', 'dark'].includes(S.themeMode)) S.themeMode = 'auto';
if (![1, 2, 5, 10, 50].includes(S.simMult)) S.simMult = 1;
if (!S.cfgV3) { S.chargeMode = 'full'; S.cfgV3 = true; } // charging stops now charge back to 100 % by default
const saveSettings = () => store.set('settings', S);
const isEV = () => S.type === 'electric';
const vehicleKind = () => (isEV() ? 'charging' : 'fuel');
const capacity = () => (isEV() ? S.capacity : S.tank);
const fullRange = () => (isEV() ? S.rangeKm : (S.tank / S.consumption) * 100);
const rangeNow = () => fullRange() * S.level / 100;
const unit = () => (isEV() ? 'kWh' : 'L');
const price = () => (isEV() ? S.priceKwh : S.priceFuel);

/* =========================================================
   STATE & UTILS
   ========================================================= */
let uidN = 0;
const uid = () => 'w' + Date.now().toString(36) + (uidN++);
const emptyWp = () => ({ id: uid(), label: '', lat: null, lon: null, kind: 'place', charge: false });
const state = {
  wps: [], routes: [], sel: 0, route: null, energy: null, routeStatus: 'idle', routeError: '', showSteps: false, lastKey: '',
  stationsMode: 'route', stationTab: vehicleKind(), stationList: { charging: null, fuel: null }, shown: 25, suggestedId: null,
  markers: [], me: null, meMarker: null, nav: null, routeReq: 0, popup: null, styleReady: false,
};
{
  const saved = store.get('wps', null);
  state.wps = Array.isArray(saved) && saved.length >= 2 ? saved.map((w) => ({ ...emptyWp(), ...w, id: uid() })) : [emptyWp(), emptyWp()];
  if (!HAS_GPS) state.wps.forEach((w) => { if (w.kind === 'gps') Object.assign(w, emptyWp(), { id: w.id }); });
}
const saveWps = () => store.set('wps', state.wps.map(({ id, ...w }) => w));

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const debounce = (fn, ms2) => { let tm; return (...a) => { clearTimeout(tm); tm = setTimeout(() => fn(...a), ms2); }; };
const rad = (d) => d * Math.PI / 180;
function haversine(lat1, lon1, lat2, lon2) {
  const dLat = rad(lat2 - lat1), dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.sqrt(a));
}
function bearingOf(a, b) {
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat));
  const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng));
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
function decode6(str) {
  const out = []; let i = 0, lat = 0, lon = 0;
  while (i < str.length) {
    let b, shift = 0, res = 0;
    do { b = str.charCodeAt(i++) - 63; res |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (res & 1) ? ~(res >> 1) : (res >> 1);
    shift = 0; res = 0;
    do { b = str.charCodeAt(i++) - 63; res |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lon += (res & 1) ? ~(res >> 1) : (res >> 1);
    out.push([lon / 1e6, lat / 1e6]);
  }
  return out;
}
function fmtDist(m) {
  if (m < 100) return `${Math.max(0, Math.round(m / 5) * 5)} m`;
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  return `${m < 10000 ? nf(m / 1000, 1) : Math.round(m / 1000)} km`;
}
function fmtDur(s) {
  const min = Math.max(1, Math.round(s / 60));
  const h = Math.floor(min / 60);
  return h ? `${h} ${t('hmin')} ${min % 60} ${t('min')}` : `${min} ${t('min')}`;
}
const fmtClock = (d) => d.toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit' });
const fmtKm = (km) => (km < 10 ? nf(km, 1) : Math.round(km).toString());
function levelColor(l) {
  if (l <= 0) return '#d93025';
  if (l < 10) return '#ea4335';
  if (l < 25) return '#f29900';
  return '#34a853';
}
let busy = 0;
function setBusy(on) { busy = Math.max(0, busy + (on ? 1 : -1)); $('#progress').classList.toggle('on', busy > 0); }
/* a toast that stays and updates (e.g. download progress); text = null removes it */
function progressToast(id, text) {
  let el = document.getElementById('ptoast-' + id);
  if (text == null) { if (el) { el.classList.add('out'); setTimeout(() => el.remove(), 250); } return; }
  if (!el) { el = document.createElement('div'); el.className = 'toast'; el.id = 'ptoast-' + id; $('#toasts').appendChild(el); }
  el.textContent = text;
}
function toast(msg, ms2 = 3200) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 250); }, ms2);
}
async function fetchJSON(url, opts = {}, timeoutMs = 20000) {
  const ctl = new AbortController();
  const tm = setTimeout(() => ctl.abort(), timeoutMs);
  if (opts.signal) opts.signal.addEventListener('abort', () => ctl.abort());
  try {
    const res = await fetch(url, { ...opts, signal: ctl.signal });
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } finally { clearTimeout(tm); }
}
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

/* =========================================================
   MAP
   ========================================================= */
const map = new maplibregl.Map({
  container: 'map',
  style: { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': S.theme === 'dark' ? '#242f3e' : '#f5f5f5' } }] },
  center: CFG.home.center, zoom: CFG.home.zoom, maxPitch: 70, attributionControl: false,
  // battery: phones render at max 2x resolution, no label fade animations in saver mode
  pixelRatio: IS_MOBILE ? Math.min(devicePixelRatio || 1, 2) : (devicePixelRatio || 1),
  fadeDuration: S.batterySaver ? 0 : 300,
  refreshExpiredTiles: false,
});
map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

const styleCache = {};
let labelLayerId, firstReady = null, styleTimer = null;

/* Google-Maps-like night palette for the OpenFreeMap dark style */
function patchDark(style) {
  const P = {
    background: { 'background-color': '#242f3e' }, water: { 'fill-color': '#17263c' }, waterway: { 'line-color': '#17263c' },
    landcover_wood: { 'fill-color': '#263c3f' }, landuse_park: { 'fill-color': '#263c3f' }, landuse_residential: { 'fill-color': '#27323f' },
    building: { 'fill-color': '#2b3544', 'fill-outline-color': '#323d4d' },
    highway_path: { 'line-color': '#2f3948' }, highway_minor: { 'line-color': '#38414e' },
    highway_major_casing: { 'line-color': '#212a37' }, highway_major_inner: { 'line-color': '#4a5363' }, highway_major_subtle: { 'line-color': '#4a5363' },
    highway_motorway_casing: { 'line-color': '#1f2835' }, highway_motorway_inner: { 'line-color': '#746855' }, highway_motorway_subtle: { 'line-color': '#5f5646' },
    railway: { 'line-color': '#2f3948' }, railway_minor: { 'line-color': '#2f3948' }, railway_transit: { 'line-color': '#2f3948' },
    highway_name_other: { 'text-color': '#9ca5b3', 'text-halo-color': '#242f3e' }, highway_name_motorway: { 'text-color': '#f3d19c' },
    water_name: { 'text-color': '#515c6d', 'text-halo-color': '#17263c' },
  };
  for (const l of style.layers) {
    let p = P[l.id];
    if (!p && l.id.startsWith('boundary')) p = { 'line-color': '#4b6878' };
    if (!p && l.id.startsWith('place_')) p = { 'text-color': '#d59563', 'text-halo-color': '#242f3e' };
    if (p) l.paint = { ...(l.paint || {}), ...p };
  }
  return style;
}

/* ---------- automatic light/dark: night (sun below horizon) and tunnels ---------- */
function sunAltitude(date, lat, lon) {
  const r = Math.PI / 180, d = (date.getTime() - 946728000000) / 86400000;
  const M = r * (357.5291 + 0.98560028 * d);
  const C = r * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const Lm = M + C + r * 102.9372 + Math.PI, e = r * 23.4397;
  const dec = Math.asin(Math.sin(e) * Math.sin(Lm)), ra = Math.atan2(Math.sin(Lm) * Math.cos(e), Math.cos(Lm));
  const H = r * (280.16 + 360.9856235 * d) + r * lon - ra, phi = r * lat;
  return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H)) / r;
}
let isNight = false;
function updateNight() {
  const c = state.me || (state.wps[0] && state.wps[0].lat != null ? { lat: state.wps[0].lat, lon: state.wps[0].lon } : { lat: map.getCenter().lat, lon: map.getCenter().lng });
  isNight = sunAltitude(new Date(), c.lat, c.lon) < -0.833;
}
function effectiveTheme() {
  if (state.nav && state.nav.inTunnel) return 'dark';
  if (S.themeMode === 'auto') return isNight ? 'dark' : 'light';
  return S.themeMode;
}
function applyTheme(force = false) {
  const th = effectiveTheme();
  if (!force && th === S.theme && state.styleReady) return;
  S.theme = th; saveSettings();
  loadTheme(th);
}
function renderThemeMenu() {
  $('#m-theme-val').textContent = t({ auto: 'themeAuto', light: 'themeLight', dark: 'themeDark' }[S.themeMode]);
  $('#m-saver-switch').classList.toggle('on', S.batterySaver);
  $('#m-preview-switch').classList.toggle('on', S.previewEnabled);
  const vp = $('#m-voicepick-val');
  if (vp) { const id = neuralVoiceId(), list = NEURAL_VOICES[L()] || []; vp.textContent = id ? (list.find((v) => v.id === id) || {}).name || id : t('systemVoice'); }
}

async function loadTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  const tc = document.querySelector('meta[name=theme-color]');
  if (tc) tc.setAttribute('content', theme === 'dark' ? '#202124' : '#ffffff');
  $('#layer-label').textContent = theme === 'dark' ? t('light') : t('dark');
  clearTimeout(styleTimer);
  try {
    if (!styleCache[theme]) {
      const { ok, data } = await fetchJSON(CFG.styles[theme], {}, 15000);
      if (!ok || !data) throw new Error('style');
      styleCache[theme] = theme === 'dark' ? patchDark(data) : data;
    }
    state.styleReady = false;
    map.setStyle(structuredClone(styleCache[theme]), { diff: false });
  } catch {
    toast(`${t('mapFail')} <a href="#" id="map-retry" style="color:inherit;font-weight:500">${t('retry')}</a>`, 10000);
    setTimeout(() => { const a = $('#map-retry'); if (a) a.onclick = (e) => { e.preventDefault(); loadTheme(S.theme); }; }, 0);
  }
}

async function stationImage(kind) {
  try { await document.fonts.load('22px "Material Symbols Outlined"'); } catch { /* ignore */ }
  const s = 2, size = 30 * s, c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2 - 2 * s, 0, Math.PI * 2);
  ctx.fillStyle = kind === 'charging' ? '#1a73e8' : (kind === 'fuel' ? '#e37400' : '#188038'); ctx.fill();
  ctx.lineWidth = 2 * s; ctx.strokeStyle = '#ffffff'; ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `${17 * s}px "Material Symbols Outlined"`;
  ctx.fillText(kind === 'charging' ? 'ev_station' : 'local_gas_station', size / 2, size / 2 + 1);
  return { img: ctx.getImageData(0, 0, size, size), pixelRatio: s };
}

async function onStyleLoad() {
  if (!map.getStyle().sources.openmaptiles) return;
  const dark = S.theme === 'dark';
  const layers = map.getStyle().layers;
  labelLayerId = (layers.find((l) => l.type === 'symbol' && l.layout && l.layout['text-field']) || {}).id;
  if (!layers.some((l) => l.type === 'fill-extrusion')) {
    map.addLayer({ id: 'nav45-3d', type: 'fill-extrusion', source: 'openmaptiles', 'source-layer': 'building', minzoom: 14,
      paint: { 'fill-extrusion-color': dark ? '#2b3544' : '#e3e3e3', 'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 8],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0], 'fill-extrusion-opacity': 0.85 } }, labelLayerId);
  }
  const empty = { type: 'FeatureCollection', features: [] };
  for (const id of ['range', 'route-alt', 'route', 'route-dead', 'route-done', 'stations']) {
    map.addSource(id, id === 'stations' ? { type: 'geojson', data: empty, cluster: true, clusterRadius: 36, clusterMaxZoom: 11 } : { type: 'geojson', data: empty });
  }
  const w = (a, b, c) => ['interpolate', ['linear'], ['zoom'], 8, a, 14, b, 18, c];
  const lineLayout = { 'line-cap': 'round', 'line-join': 'round' };
  map.addLayer({ id: 'range-fill', type: 'fill', source: 'range', paint: { 'fill-color': '#1a73e8', 'fill-opacity': 0.06 } }, labelLayerId);
  map.addLayer({ id: 'range-line', type: 'line', source: 'range', paint: { 'line-color': '#1a73e8', 'line-width': 2, 'line-dasharray': [3, 2], 'line-opacity': 0.7 } }, labelLayerId);
  map.addLayer({ id: 'route-alt-casing', type: 'line', source: 'route-alt', layout: lineLayout, paint: { 'line-color': dark ? '#5f6b7c' : '#8fa3c0', 'line-width': w(6, 10, 18) } }, labelLayerId);
  map.addLayer({ id: 'route-alt', type: 'line', source: 'route-alt', layout: lineLayout, paint: { 'line-color': dark ? '#8c9bb0' : '#bccbe3', 'line-width': w(4, 7, 13) } }, labelLayerId);
  map.addLayer({ id: 'route-casing', type: 'line', source: 'route', layout: lineLayout, paint: { 'line-color': '#1967d2', 'line-width': w(7, 11, 20) } }, labelLayerId);
  map.addLayer({ id: 'route-line', type: 'line', source: 'route', layout: lineLayout, paint: { 'line-color': '#4285f4', 'line-width': w(5, 8, 15) } }, labelLayerId);
  map.addLayer({ id: 'route-dead', type: 'line', source: 'route-dead', layout: lineLayout, paint: { 'line-color': '#d93025', 'line-width': w(5, 8, 15), 'line-dasharray': [1, 1.4] } }, labelLayerId);
  map.addLayer({ id: 'route-done', type: 'line', source: 'route-done', layout: lineLayout, paint: { 'line-color': dark ? '#5f6368' : '#9aa0a6', 'line-width': w(5, 8, 15) } }, labelLayerId);
  for (const kind of ['charging', 'fuel']) if (!map.hasImage('st-' + kind)) { const { img, pixelRatio } = await stationImage(kind); if (!map.hasImage('st-' + kind)) map.addImage('st-' + kind, img, { pixelRatio }); }
  map.addLayer({ id: 'stations-cluster', type: 'circle', source: 'stations', filter: ['has', 'point_count'],
    paint: { 'circle-color': ['case', ['==', ['get', 'kind'], 'fuel'], '#e37400', '#1a73e8'], 'circle-stroke-color': '#fff', 'circle-stroke-width': 2,
      'circle-radius': ['step', ['get', 'point_count'], 14, 20, 18, 100, 22] } });
  map.addLayer({ id: 'stations-count', type: 'symbol', source: 'stations', filter: ['has', 'point_count'],
    layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-font': ['Noto Sans Bold'], 'text-size': 12, 'text-allow-overlap': true }, paint: { 'text-color': '#fff' } });
  map.addLayer({ id: 'stations-pt', type: 'symbol', source: 'stations', filter: ['!', ['has', 'point_count']],
    layout: { 'icon-image': ['get', 'icon'], 'icon-allow-overlap': true, 'icon-size': ['case', ['get', 'hi'], 1.25, 0.95], 'symbol-sort-key': ['get', 'sort'] } });
  state.styleReady = true;
  renderRouteLayers(); renderStationLayer(); renderRange();
  if (state.nav) { setStationsVisible(false); set3D(!S.batterySaver); }
  if (firstReady) { const f = firstReady; firstReady = null; f(); }
  prefetchStyles();
}
function set3D(on) {
  for (const l of map.getStyle().layers) if (l.type === 'fill-extrusion') map.setLayoutProperty(l.id, 'visibility', on ? 'visible' : 'none');
}
/* load both map styles once, so switching for a tunnel or at sunset is instant */
async function prefetchStyles() {
  for (const th of ['light', 'dark']) {
    if (styleCache[th]) continue;
    try { const { ok, data } = await fetchJSON(CFG.styles[th], {}, 15000); if (ok && data) styleCache[th] = th === 'dark' ? patchDark(data) : data; } catch { /* later */ }
  }
}
map.on('style.load', onStyleLoad);

/* ---------- phone bottom sheet ---------- */
const narrow = () => innerWidth <= 760;
let sheetSnap = 'half';
const sheetHeights = () => ({ peek: Math.round(Math.min(210, innerHeight * 0.3)), half: Math.round(innerHeight * 0.5), full: innerHeight - 36 });
function setSheet(snap) {
  sheetSnap = snap;
  document.documentElement.style.setProperty('--sheet-h', `${sheetHeights()[snap]}px`);
}
function panelPadding() {
  if (narrow()) return { top: 60, bottom: sheetHeights()[sheetSnap] + 24, left: 36, right: 36 };
  return { top: 70, bottom: 70, left: 60, right: 80 };
}
function fitCoords(coords) {
  if (!coords || coords.length < 2) return;
  const b = new maplibregl.LngLatBounds(coords[0], coords[0]);
  coords.forEach((c) => b.extend(c));
  map.fitBounds(b, { padding: panelPadding(), duration: 900, maxZoom: 16, pitch: S.threeD ? 45 : 0, bearing: 0 });
}
const fitRoute = () => { const all = state.routes.flatMap((r) => r.coords); fitCoords(all.length ? all : null); };

/* =========================================================
   STATIC TEXT
   ========================================================= */
function applyStaticText() {
  document.documentElement.lang = L();
  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  $$('#corridor option').forEach((o) => { const v = +o.value; o.textContent = t('within', { d: v >= 1000 ? `${v / 1000} km` : `${v} m` }); });
  $('#m-lang-val').textContent = t('langName');
  if ($('#m-saver-switch')) renderThemeMenu();
  $('#layer-label').textContent = S.theme === 'dark' ? t('light') : t('dark');
  renderDataNote();
}
function renderDataNote() {
  const c = DATA.charging ? DATA.charging.date : '…', f = DATA.fuel ? DATA.fuel.date : '…';
  $('#data-note').textContent = t('dataNote', { c, f });
  $('#drawer-note').textContent = t('dataNote', { c, f });
}
function setLanguage(lang) {
  S.lang = lang; saveSettings();
  applyStaticText();
  renderVehicle(); renderWaypoints(); updateStationControls(); renderResults(); renderStationList();
  if (state.routes.length) computeRoute({ fit: false, quiet: true });
}

/* =========================================================
   VEHICLE
   ========================================================= */
function renderVehicle() {
  $$('#type-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.type === S.type));
  const sel = $('#vehicle-preset');
  sel.innerHTML = ['electric', 'fuel'].map((ty) => `<optgroup label="${t(ty === 'electric' ? 'groupE' : 'groupF')}">${PRESETS.filter((p) => p.type === ty).map((p) => `<option value="${p.id}">${esc(presetName(p))}</option>`).join('')}</optgroup>`).join('');
  sel.value = S.presetId;
  const p = PRESETS.find((x) => x.id === S.presetId);
  $('#vehicle-name').textContent = p ? presetName(p) : '';
  $('#vehicle-ico').textContent = isEV() ? 'electric_car' : 'directions_car';
  $('#level-label').textContent = t(isEV() ? 'batteryNow' : 'fuelNow');
  $('#level-slider').value = S.level;
  updateLevelUI();
}
function updateLevelUI() {
  $('#level-val').textContent = S.level + '%';
  $('#vehicle-sub').textContent = t('kmRange', { p: S.level, k: Math.round(rangeNow()) });
  const bar = $('#vehicle-battery i');
  bar.style.width = S.level + '%';
  bar.style.background = S.level < 15 ? '#d93025' : S.level < 30 ? '#f29900' : '#34a853';
}
function applyPreset(id) {
  const p = PRESETS.find((x) => x.id === id);
  if (!p) return;
  S.presetId = id; S.type = p.type;
  for (const k of ['capacity', 'rangeKm', 'chargeKw', 'tank', 'consumption', 'fuelKind']) if (p[k] != null) S[k] = p[k];
}
function onVehicleChanged({ typeChanged = false } = {}) {
  saveSettings(); renderVehicle();
  if (typeChanged) {
    state.stationTab = vehicleKind();
    state.wps.forEach((w) => { if (w.kind === 'station') w.charge = w.stationKind === vehicleKind(); });
    renderWaypoints(); updateMarkers();
  }
  refreshEnergy(); renderRange(); loadStations();
}

/* =========================================================
   WAYPOINTS
   ========================================================= */
const wpRole = (i) => (i === 0 ? 'start' : i === state.wps.length - 1 ? 'end' : 'stop');
function renderWaypoints() {
  const list = $('#waypoints');
  list.innerHTML = '';
  state.wps.forEach((w, i) => {
    const role = wpRole(i);
    const row = document.createElement('div');
    row.className = `wp wp-${role}${role === 'stop' && w.charge ? ' is-charge' : ''}`;
    row.dataset.id = w.id;
    const icoHtml = role === 'end' ? ms('location_on', 'fill') : (role === 'stop' && w.charge) ? ms(isEV() ? 'ev_station' : 'local_gas_station') : '<span class="dot"></span>';
    const ph = t(role === 'start' ? 'chooseStart' : role === 'end' ? 'whereTo' : 'addAStop');
    const label = w.kind === 'gps' ? t('myLocLabel') : w.label;
    const showCharge = role === 'stop' && w.lat != null;
    row.innerHTML = `
      <div class="wp-ico" title="↕">${icoHtml}</div>
      <div class="wp-field">
        <input class="wp-input${w.kind === 'gps' ? ' is-gps' : ''}${showCharge ? ' has-charge' : ''}" placeholder="${ph}" value="${esc(label)}" spellcheck="false" autocomplete="off" />
        ${showCharge ? `<button class="wp-charge${w.charge ? ' on' : ''}" title="${t('chargeHereTitle')}">${ms(isEV() ? 'bolt' : 'local_gas_station')}${t(isEV() ? 'chargeHere' : 'refuelHere')}</button>` : ''}
        ${(role === 'stop' || w.lat != null) ? `<button class="wp-x" title="${t('removeStop')}">${ms('close')}</button>` : ''}
      </div>`;
    list.appendChild(row);
    bindSearch(row.querySelector('.wp-input'), w, label);
    const ch = row.querySelector('.wp-charge');
    if (ch) ch.onclick = () => { w.charge = !w.charge; saveWps(); renderWaypoints(); updateMarkers(); refreshEnergy(); };
    const x = row.querySelector('.wp-x');
    if (x) x.onclick = () => removeWp(w.id);
    row.querySelector('.wp-ico').addEventListener('pointerdown', (e) => startDrag(e, row));
  });
}
function startDrag(e, row) {
  e.preventDefault();
  const list = $('#waypoints');
  const before = state.wps.map((w) => w.id).join();
  row.classList.add('dragging');
  const onMove = (ev) => {
    const others = [...list.children].filter((r) => r !== row);
    let target = null;
    for (const r of others) { const b = r.getBoundingClientRect(); if (ev.clientY < b.top + b.height / 2) { target = r; break; } }
    if (target) { if (row.nextSibling !== target) list.insertBefore(row, target); } else if (list.lastChild !== row) list.appendChild(row);
  };
  const onUp = () => {
    window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp);
    row.classList.remove('dragging');
    const ids = [...list.children].map((r) => r.dataset.id);
    state.wps = ids.map((id) => state.wps.find((w) => w.id === id));
    renderWaypoints();
    if (ids.join() !== before) { updateMarkers(); saveWps(); computeRoute({ fit: false }); }
  };
  window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
}
function addStop(wp = null, index = state.wps.length - 1) {
  const w = wp || emptyWp();
  state.wps.splice(index, 0, w);
  renderWaypoints(); updateMarkers(); saveWps();
  if (!wp) setTimeout(() => { const inp = $(`.wp[data-id="${w.id}"] .wp-input`); if (inp) inp.focus(); }, 30);
  return w;
}
function removeWp(id) {
  const i = state.wps.findIndex((w) => w.id === id);
  if (i < 0) return;
  if (state.wps.length <= 2) Object.assign(state.wps[i], emptyWp(), { id });
  else state.wps.splice(i, 1);
  renderWaypoints(); updateMarkers(); saveWps(); computeRoute({ fit: false });
}
function setWp(w, data) {
  Object.assign(w, { label: data.label, sub: data.sub || '', lat: data.lat, lon: data.lon, kind: data.kind || 'place', stationKind: data.stationKind, stationId: data.stationId, charge: !!data.charge });
  renderWaypoints(); updateMarkers(); saveWps(); computeRoute();
}

/* ---------------- search (Photon) ---------------- */
function photonLabel(p) {
  const street = [p.street, p.housenumber].filter(Boolean).join(' ');
  const main = p.name || street || p.city || '—';
  const city = [p.postcode, p.city || p.town || p.village || p.district].filter(Boolean).join(' ');
  const sub = [p.name && street ? street : null, city, p.country && p.countrycode !== 'DE' ? p.country : null].filter(Boolean).join(', ') || (p.state || '');
  return { main, sub };
}
const placeIcon = (p) => (p.osm_value === 'charging_station' ? 'ev_station' : p.osm_value === 'fuel' ? 'local_gas_station' : p.osm_key === 'highway' ? 'road' : 'location_on');
let searchCtl = null;
async function photonSearch(q) {
  if (searchCtl) searchCtl.abort();
  searchCtl = new AbortController();
  const c = state.me ? { lat: state.me.lat, lng: state.me.lon } : map.getCenter();
  const url = `${CFG.photon}/api/?q=${encodeURIComponent(q)}&limit=7&lang=${L()}&lat=${c.lat.toFixed(4)}&lon=${c.lng.toFixed(4)}`;
  const { ok, data } = await fetchJSON(url, { signal: searchCtl.signal }, 10000);
  if (!ok || !data) throw new Error('search');
  return data.features.map((f) => { const { main, sub } = photonLabel(f.properties); return { label: main, sub, lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], ico: placeIcon(f.properties) }; });
}
async function reverseGeocode(lat, lon) {
  try {
    const { ok, data } = await fetchJSON(`${CFG.photon}/reverse?lat=${lat}&lon=${lon}&lang=${L()}`, {}, 8000);
    if (ok && data && data.features && data.features[0]) return photonLabel(data.features[0].properties);
  } catch { /* ignore */ }
  return { main: `${lat.toFixed(5)}, ${lon.toFixed(5)}`, sub: '' };
}
const recents = () => store.get('recents', []);
function pushRecent(r) {
  const list = recents().filter((x) => !(Math.abs(x.lat - r.lat) < 1e-5 && Math.abs(x.lon - r.lon) < 1e-5));
  list.unshift({ label: r.label, sub: r.sub, lat: r.lat, lon: r.lon });
  store.set('recents', list.slice(0, 6));
}
function bindSearch(input, w, shownLabel) {
  const field = input.parentElement;
  let items = [], active = -1, box = null;
  const close = () => { if (box) box.remove(); box = null; active = -1; };
  const choose = (it) => {
    close();
    if (it.loc) { useMyLocation(w); return; }
    pushRecent(it);
    setWp(w, { label: it.label, sub: it.sub, lat: it.lat, lon: it.lon });
  };
  const render = (list, loading = false, head = '') => {
    if (document.activeElement !== input) return;
    if (!box) { box = document.createElement('div'); box.className = 'suggest'; field.appendChild(box); }
    items = list;
    box.innerHTML = (head ? `<div class="sg-empty" style="padding:6px 16px">${head}</div>` : '') + (loading ? `<div class="sg-empty">${t('searching')}</div>` : list.length ? '' : `<div class="sg-empty">${t('noPlaces')}</div>`);
    list.forEach((it, idx) => {
      const el = document.createElement('div');
      el.className = `sg-item${it.loc ? ' loc' : ''}${idx === active ? ' active' : ''}`;
      el.innerHTML = `${ms(it.ico || 'location_on')}<div class="sg-text"><div class="sg-main">${esc(it.label)}</div>${it.sub ? `<div class="sg-sub">${esc(it.sub)}</div>` : ''}</div>`;
      el.addEventListener('mousedown', (e) => { e.preventDefault(); choose(it); });
      box.appendChild(el);
    });
    if (!list.length && !loading && !head) { /* keep "no results" */ }
  };
  const base = () => {
    const opts = [];
    if (HAS_GPS) opts.push({ loc: true, label: t('yourLocation'), sub: t('useGps'), ico: 'my_location' });
    recents().forEach((r) => opts.push({ ...r, ico: 'history' }));
    if (opts.length) render(opts); else close();
  };
  const run = debounce(async (q) => {
    try { const res = await photonSearch(q); if (input.value.trim() === q) { active = res.length ? 0 : -1; render(res); } }
    catch (e) { if (e.name !== 'AbortError') render([]); }
  }, 250);
  input.addEventListener('focus', () => { if (narrow()) setSheet('full'); input.select(); if (!input.value.trim() || input.value === shownLabel) base(); });
  input.addEventListener('input', () => { const q = input.value.trim(); if (q.length < 2) { base(); return; } render([], true); run(q); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); if (!items.length) return;
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      $$('.sg-item', box).forEach((el, i) => el.classList.toggle('active', i === active));
    } else if (e.key === 'Enter') { e.preventDefault(); const it = items[active >= 0 ? active : 0]; if (it) choose(it); }
    else if (e.key === 'Escape') { input.value = shownLabel; close(); input.blur(); }
  });
  input.addEventListener('blur', () => setTimeout(() => { close(); if (input.value !== shownLabel) input.value = shownLabel; }, 120));
}

/* ---------------- location (phone app only) ---------------- */
/* phone app: Capacitor Geolocation plugin (asks Android for permission once); mobile browser: navigator.geolocation */
async function getPosition() {
  if (!HAS_GPS) throw new Error('no-gps');
  const Geo = capPlugin('Geolocation');
  if (Geo) {
    try { await Geo.requestPermissions(); } catch { /* already decided */ }
    return Geo.getCurrentPosition({ enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 });
  }
  return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }));
}
async function watchPosition(onPos, onErr) {
  const Geo = capPlugin('Geolocation');
  if (Geo) {
    const id = await Geo.watchPosition({ enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }, (pos, err) => { if (err) onErr(err); else if (pos) onPos(pos); });
    return { clear: () => Geo.clearWatch({ id }).catch(() => {}) };
  }
  const id = navigator.geolocation.watchPosition(onPos, onErr, { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 });
  return { clear: () => navigator.geolocation.clearWatch(id) };
}
function showMe(lat, lon) {
  state.me = { lat, lon };
  if (!state.meMarker) { const el = document.createElement('div'); el.className = 'me-dot'; state.meMarker = new maplibregl.Marker({ element: el }).setLngLat([lon, lat]).addTo(map); }
  else state.meMarker.setLngLat([lon, lat]);
}
async function useMyLocation(w = null) {
  if (!HAS_GPS) return null;
  setBusy(true);
  try {
    const p = await getPosition();
    const { latitude: lat, longitude: lon } = p.coords;
    showMe(lat, lon);
    if (w) setWp(w, { label: t('myLocLabel'), lat, lon, kind: 'gps' });
    else map.flyTo({ center: [lon, lat], zoom: 15, duration: 1200 });
    return { lat, lon };
  } catch { toast(t('gpsLost')); return null; } finally { setBusy(false); }
}

/* ---------------- markers ---------------- */
function updateMarkers() {
  state.markers.forEach((m) => m.remove());
  state.markers = [];
  state.wps.forEach((w, i) => {
    if (w.lat == null) return;
    const role = wpRole(i);
    const el = document.createElement('div');
    el.className = 'wp-marker';
    if (role === 'end') el.innerHTML = ms('location_on', 'pin-end');
    else if (role === 'start') el.innerHTML = '<div class="pin-start"></div>';
    else el.innerHTML = `<div class="pin-stop${w.charge ? ' charge' : ''}">${w.charge ? ms(isEV() ? 'bolt' : 'local_gas_station') : i}</div>`;
    const m = new maplibregl.Marker({ element: el, draggable: !state.nav, anchor: role === 'end' ? 'bottom' : 'center', offset: role === 'end' ? [0, 6] : [0, 0] })
      .setLngLat([w.lon, w.lat]).addTo(map);
    m.on('dragend', async () => {
      const ll = m.getLngLat();
      Object.assign(w, { lat: ll.lat, lon: ll.lng, kind: 'place', label: '…', stationId: null });
      renderWaypoints(); computeRoute({ fit: false });
      const { main, sub } = await reverseGeocode(ll.lat, ll.lng);
      w.label = main; w.sub = sub; renderWaypoints(); saveWps();
    });
    state.markers.push(m);
  });
}

/* =========================================================
   ROUTING — Valhalla "motor_scooter" (moped) profile:
   no Autobahn and no Kraftfahrstraße (motorroad=yes)
   ========================================================= */
function costingOptions() {
  const o = { top_speed: S.topSpeed, use_hills: S.avoidHills ? 0.0 : 0.5, use_ferry: S.avoidFerries ? 0.0 : 0.5 };
  if (S.routePref === 'fastest') Object.assign(o, { use_primary: 1.0, use_living_streets: 0.0, use_tracks: 0.0 });
  else if (S.routePref === 'quiet') Object.assign(o, { use_primary: 0.0, use_living_streets: 0.5, use_tracks: 0.0 });
  else Object.assign(o, { shortest: true });
  return o;
}
async function computeRoute({ fit = true, heading = null, quiet = false, announce = false } = {}) {
  const first = state.wps[0], last = state.wps[state.wps.length - 1];
  const pts = state.wps.filter((w) => w.lat != null);
  if (first.lat == null || last.lat == null || pts.length < 2) {
    state.routeReq++; state.routes = []; state.route = null; state.energy = null; state.routeStatus = 'idle';
    renderRouteLayers(); renderResults(); renderRange(); loadStations();
    return;
  }
  const req = ++state.routeReq;
  state.routeStatus = 'loading';
  if (!state.routes.length || !quiet) renderResults();
  const body = {
    locations: pts.map((w, i) => ({ lat: w.lat, lon: w.lon, type: 'break', ...(i === 0 && heading != null ? { heading: Math.round(heading), heading_tolerance: 60 } : {}) })),
    costing: 'motor_scooter', costing_options: { motor_scooter: costingOptions() },
    units: 'kilometers', directions_options: { units: 'kilometers', language: S.lang },
  };
  if (pts.length === 2 && !state.nav) body.alternates = 2;
  setBusy(true);
  try {
    const { ok, data } = await fetchJSON(`${CFG.valhalla}/route?json=${encodeURIComponent(JSON.stringify(body))}`, {}, 20000);
    if (req !== state.routeReq) return;
    if (!ok || !data || !data.trip) {
      const msg = (data && data.error) || '';
      throw new Error(/no path|no suitable|no route/i.test(msg) || (data && [442, 171, 170].includes(data.error_code)) ? 'nolegal' : 'unavailable');
    }
    const trips = [data.trip, ...((data.alternates || []).map((a) => a.trip))];
    const prevKey = state.route ? state.route.key : '';
    state.routes = trips.map((tr) => parseTrip(tr, pts));
    // the preferred kind of route always comes first and is selected
    if (S.routePref === 'fastest') state.routes.sort((a, b) => a.timeS - b.timeS);
    else if (S.routePref === 'shortest') state.routes.sort((a, b) => a.total - b.total);
    labelRoutes();
    state.sel = 0;
    selectRoute(0, { fit: false });
    state.routeStatus = 'ok';
    if (S.voice) loadNeuralVoice(); // get the natural voice ready (downloads once, then stored on the device)
    if (narrow() && !state.nav && sheetSnap !== 'half') { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); setSheet('half'); }
    renderResults();
    if (announce) {
      toast(prevKey && prevKey === state.route.key ? t('sameRoute') : t('updated'));
      const card = $('.route-card.sel'); if (card) card.classList.add('updated');
    }
    if (fit && !state.nav) fitRoute();
  } catch (e) {
    if (req !== state.routeReq) return;
    state.routeStatus = 'error';
    state.routeError = e.name === 'AbortError' ? t('routingTimeout') : e.message === 'nolegal' ? t('noLegalRoute') : t('routingUnavailable');
    renderResults();
  } finally { setBusy(false); }
}
function parseTrip(trip, pts) {
  const coords = [], legs = [], mans = [];
  trip.legs.forEach((leg, li) => {
    const shape = decode6(leg.shape);
    const offset = li === 0 ? 0 : coords.length - 1;
    if (li === 0) coords.push(...shape); else coords.push(...shape.slice(1));
    legs.push({ startIdx: offset, endIdx: coords.length - 1, timeS: leg.summary.time, shape: leg.shape });
    leg.maneuvers.forEach((m) => mans.push({ ...m, gIdx: offset + m.begin_shape_index, leg: li }));
  });
  const cum = new Float64Array(coords.length);
  for (let i = 1; i < coords.length; i++) cum[i] = cum[i - 1] + haversine(coords[i - 1][1], coords[i - 1][0], coords[i][1], coords[i][0]);
  let tm = 0;
  mans.forEach((m) => { m.along = cum[Math.min(m.gIdx, cum.length - 1)]; m.tStart = tm; tm += m.time || 0; });
  legs.forEach((l) => { l.startM = cum[l.startIdx]; l.endM = cum[l.endIdx]; });
  // "via" = the two roads used for the longest distance
  const byName = new Map();
  mans.forEach((m) => (m.street_names || []).slice(0, 1).forEach((n) => byName.set(n, (byName.get(n) || 0) + (m.length || 0))));
  const via = [...byName.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map((x) => x[0]);
  return { coords, cum, total: cum[cum.length - 1], timeS: trip.summary.time, legs, mans, summary: trip.summary, wps: pts.slice(), via, limits: null,
    key: `${coords.length}:${Math.round(cum[cum.length - 1])}:${coords[Math.floor(coords.length / 2)]}` };
}
function labelRoutes() {
  const rs = state.routes;
  const fastest = rs.reduce((a, b) => (b.timeS < a.timeS ? b : a), rs[0]);
  const shortest = rs.reduce((a, b) => (b.total < a.total ? b : a), rs[0]);
  rs.forEach((r) => { r.label = r === fastest ? 'fastestRoute' : r === shortest ? 'shortestRoute' : 'alternative'; r.energy = computeEnergy(r); });
  if (rs.length === 1) rs[0].label = { fastest: 'fastestRoute', shortest: 'shortestRoute', quiet: 'quietRoute' }[S.routePref];
  else if (S.routePref === 'quiet') rs[0].label = 'quietRoute';
}
function selectRoute(i, { fit = false } = {}) {
  state.sel = i;
  state.route = state.routes[i];
  state.energy = state.route.energy = computeEnergy(state.route);
  state.showSteps = false;
  if (!state.route.limits) loadSpeedLimits(state.route);
  renderRouteLayers(); renderRange(); renderResults();
  loadStations();
  if (fit) fitRoute();
}

/* road speed limits (OSM maxspeed) and tunnels via Valhalla trace_attributes */
async function loadSpeedLimits(r) {
  r.limits = []; r.tunnels = [];
  try {
    for (const leg of r.legs) {
      const { ok, data } = await fetchJSON(`${CFG.valhalla}/trace_attributes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encoded_polyline: leg.shape, shape_match: 'edge_walk', costing: 'motor_scooter',
          filters: { attributes: ['edge.speed_limit', 'edge.tunnel', 'edge.begin_shape_index', 'edge.end_shape_index'], action: 'include' } }),
      }, 20000);
      if (!ok || !data || !data.edges) continue;
      for (const e of data.edges) {
        const a = leg.startIdx + (e.begin_shape_index || 0), b = leg.startIdx + (e.end_shape_index || 0);
        const from = r.cum[Math.min(a, r.cum.length - 1)], to = r.cum[Math.min(b, r.cum.length - 1)];
        r.limits.push({ from, to, lim: typeof e.speed_limit === 'number' && e.speed_limit > 0 ? e.speed_limit : null });
        if (e.tunnel) {
          const last = r.tunnels[r.tunnels.length - 1];
          if (last && from - last.to < 15) last.to = to; else r.tunnels.push({ from, to });
        }
      }
    }
  } catch { /* optional */ }
}
function inTunnelAt(dist) {
  const ts = state.route && state.route.tunnels;
  return !!ts && ts.some((x) => dist >= x.from - 40 && dist <= x.to + 25); // switch a little before the portal, back shortly after
}
function limitAt(dist) {
  const ls = state.route && state.route.limits;
  if (!ls || !ls.length) return null;
  let lo = 0, hi = ls.length - 1;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (ls[mid].from <= dist) lo = mid; else hi = mid - 1; }
  return ls[lo].to >= dist - 5 ? ls[lo].lim : null;
}
function timeAt(dist) {
  const r = state.route, m = r.mans;
  for (let i = 0; i < m.length; i++) {
    const a = m[i], b = m[i + 1], end = b ? b.along : r.total;
    if (dist <= end || !b) { const span = end - a.along; return a.tStart + (span > 0 ? clamp((dist - a.along) / span, 0, 1) : 1) * (a.time || 0); }
  }
  return r.timeS;
}

/* ---------------- energy model ---------------- */
function computeEnergy(r) {
  if (!r) return null;
  const full = fullRange(), cap = capacity();
  let lvl = S.level;
  const pts = [{ km: 0, lvl }], charges = [];
  let deadKm = null, reserveKm = null, totalChargeS = 0;
  r.legs.forEach((leg, i) => {
    const startKm = leg.startM / 1000, endKm = leg.endM / 1000;
    const endLvl = lvl - ((endKm - startKm) / full) * 100;
    if (deadKm == null && endLvl <= 0) deadKm = startKm + Math.max(0, lvl) / 100 * full;
    if (reserveKm == null && endLvl <= S.reserve) reserveKm = startKm + Math.max(0, lvl - S.reserve) / 100 * full;
    pts.push({ km: endKm, lvl: endLvl });
    lvl = endLvl;
    const wp = r.wps[i + 1];
    if (i < r.legs.length - 1 && wp && wp.charge) {
      const from = Math.max(lvl, 0);
      let target = isEV() ? S.chargeTarget : 100;
      if (isEV() && S.chargeMode !== 'full') {
        // charge only what is needed to reach the next charging stop / destination with the reserve + 5 % margin
        let remKm = 0;
        for (let j = i + 1; j < r.legs.length; j++) {
          remKm += (r.legs[j].endM - r.legs[j].startM) / 1000;
          const nw = r.wps[j + 1];
          if (j < r.legs.length - 1 && nw && nw.charge) break;
        }
        target = clamp(Math.ceil(S.reserve + (remKm / full) * 100 + 5), 0, S.chargeTarget);
      }
      if (target > from) {
        const amount = (target - from) / 100 * cap;
        const hours = isEV() ? amount / Math.max(0.5, S.chargeKw) : 5 / 60;
        charges.push({ wp, wpIndex: i + 1, km: endKm, from, to: target, hours });
        totalChargeS += hours * 3600; lvl = target; pts.push({ km: endKm, lvl });
      }
    }
  });
  const used = (r.total / 1000) / full * cap;
  return { pts, arrival: lvl, deadKm, reserveKm, charges, totalChargeS, used, cost: used * price(), full };
}
function levelAt(km, e = state.energy) {
  if (!e) return S.level;
  const p = e.pts;
  for (let i = 0; i < p.length - 1; i++) { const a = p[i], b = p[i + 1]; if (b.km > a.km && km >= a.km && km <= b.km) return a.lvl + (b.lvl - a.lvl) * (km - a.km) / (b.km - a.km); }
  return km <= 0 ? p[0].lvl : p[p.length - 1].lvl;
}
function refreshEnergy() {
  state.routes.forEach((r) => { r.energy = computeEnergy(r); });
  state.energy = state.route ? state.route.energy : null;
  renderRouteLayers(); renderResults(); computeSuggestion(); renderStationList(); renderStationLayer();
}

/* ---------------- route layers ---------------- */
function renderRouteLayers() {
  if (!state.styleReady) return;
  const FC = (features) => ({ type: 'FeatureCollection', features });
  const line = (coords, props = {}) => ({ type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: props });
  const r = state.route;
  map.getSource('route').setData(r ? line(r.coords) : FC([]));
  map.getSource('route-alt').setData(FC(state.routes.map((x, i) => (i === state.sel ? null : line(x.coords, { i }))).filter(Boolean)));
  let dead = FC([]);
  if (r && state.energy && state.energy.deadKm != null) {
    const d = state.energy.deadKm * 1000;
    const idx = r.cum.findIndex((c) => c >= d);
    if (idx > 0) dead = line([locateAt(d, r).arr, ...r.coords.slice(idx)]);
  }
  map.getSource('route-dead').setData(dead);
  if (!state.nav) map.getSource('route-done').setData(FC([]));
}

/* ---------------- results (route cards) ---------------- */
function renderResults() {
  const box = $('#results');
  if (state.routeStatus === 'idle') { box.innerHTML = ''; return; }
  if (state.routeStatus === 'loading' && !state.routes.length) {
    box.innerHTML = `<div class="res-head">${t('calcRoute')}</div>` + [1, 2].map(() => `<div class="skeleton-card"><div class="sk" style="width:24px;height:24px;border-radius:50%"></div><div style="flex:1"><div class="sk" style="height:16px;width:60%"></div><div class="sk" style="height:12px;width:40%;margin-top:8px"></div></div><div class="sk" style="height:16px;width:60px"></div></div>`).join('');
    return;
  }
  if (state.routeStatus === 'error') {
    box.innerHTML = `<div class="res-error">${ms('error')}<div>${esc(state.routeError)}<br><button class="text-btn" id="btn-retry-route" style="margin:6px 0 0 -12px">${ms('refresh')}${t('retry')}</button></div></div>`;
    $('#btn-retry-route').onclick = () => computeRoute();
    return;
  }
  const e = state.energy;
  box.innerHTML = `<div class="res-head"><span>${t('routes')}</span>${state.routeStatus === 'loading' ? `<span>${t('calcRoute')}</span>` : ''}</div>`;
  state.routes.forEach((r, i) => {
    const sel = i === state.sel, re = r.energy;
    const card = document.createElement('div');
    card.className = `route-card${sel ? ' sel' : ''}`;
    const via = r.via.length > 1 ? t('viaAnd', { a: esc(r.via[0]), b: esc(r.via[1]) }) : r.via.length ? t('via', { a: esc(r.via[0]) }) : t(r.label);
    const totalS = r.timeS + (re ? re.totalChargeS : 0);
    let energyTag = '';
    if (re) {
      if (re.deadKm != null) energyTag = `<span class="rc-tag bad">${ms('battery_alert')}${t(isEV() ? 'needsCharge' : 'needsFuel')}</span>`;
      else energyTag = `<span class="rc-tag ${re.arrival < S.reserve ? 'warn' : 'good'}">${ms(isEV() ? 'battery_charging_full' : 'local_gas_station')}${t('arriveWith', { p: Math.round(re.arrival) })}</span>`;
    }
    card.innerHTML = `${ms(isEV() ? 'electric_car' : 'directions_car')}
      <div class="rc-main">
        <div class="rc-via">${via}</div>
        <div class="rc-sub">${t(r.label)} · ${t(re && re.totalChargeS > 60 ? 'arriveIncl' : 'arriveAt', { t: fmtClock(new Date(Date.now() + totalS * 1000)) })}</div>
        <div class="rc-tags">${energyTag}${r.summary.has_highway ? `<span class="rc-tag bad">${ms('warning')}Autobahn</span>` : `<span class="rc-tag good">${ms('verified_user')}${t('noAutobahn')}</span>`}</div>
      </div>
      <div class="rc-time"><div class="rc-time-row"><b>${fmtDur(r.timeS)}</b>${re && re.totalChargeS > 60 ? chargePlusHTML(re.totalChargeS) : ''}</div><small>${fmtKm(r.total / 1000)} km</small>${S.previewEnabled ? `<button class="rc-play" title="${t('preview')}">${ms('play_arrow', 'fill')}</button>` : ''}</div>
      ${sel ? routeDetailHTML(r) : ''}`;
    card.addEventListener('click', (ev) => { if (ev.target.closest('button, .steps')) return; if (i !== state.sel) selectRoute(i); });
    const play = card.querySelector('.rc-play');
    if (play) play.onclick = () => { if (i !== state.sel) selectRoute(i); startNavigation('sim'); };
    box.appendChild(card);
  });
  bindDetail();
  requestAnimationFrame(drawEnergyChart);
}
/* "+ ⚡ 1 h 45 min" — charging time (back to 100 %) shown next to the driving time, in blue */
const chargePlusInner = (s) => `<span class="cp-plus">+</span>${ms(isEV() ? 'bolt' : 'local_gas_station', 'fill')}<span>${fmtDur(s)}</span>`;
const chargePlusHTML = (s) => `<span class="charge-plus" title="${esc(t(isEV() ? 'chargePlusTitle' : 'fuelPlusTitle'))}">${chargePlusInner(s)}</span>`;
function routeDetailHTML(r) {
  const e = r.energy;
  if (!e) return '';
  const km = r.total / 1000;
  const autoBtn = `<button class="text-btn" id="btn-autoplan">${ms('add_location_alt')}${t(isEV() ? 'autoPlanCharge' : 'autoPlanFuel')}</button>`;
  let notice;
  if (e.deadKm != null) notice = `<div class="notice bad">${ms('battery_alert')}<div>${t('notEnough', { what: t(isEV() ? 'whatEV' : 'whatFuel'), km: fmtKm(e.deadKm), total: fmtKm(km) })}<br>${autoBtn}</div></div>`;
  else if (e.reserveKm != null) notice = `<div class="notice warn">${ms('battery_3_bar')}<div>${t('belowReserve', { r: S.reserve, km: fmtKm(e.reserveKm), a: Math.round(e.arrival) })}<br>${autoBtn}</div></div>`;
  else notice = `<div class="notice ok">${ms('check_circle')}<div>${t('rangeOk', { a: Math.round(e.arrival), k: Math.round(e.arrival / 100 * e.full) })}</div></div>`;
  const charges = e.charges.map((c) => `<div class="charge-row">${ms(isEV() ? 'ev_station' : 'local_gas_station')}<span><b>${esc(c.wp.label)}</b> · ${Math.round(c.from)}% → ${Math.round(c.to)}% · ${isEV() ? fmtDur(c.hours * 3600) : t('quickStop')}</span></div>`).join('');
  const steps = state.showSteps ? `<div class="steps">${r.mans.map((m) => `<div class="step">${ms(manIcon(m.type))}<div class="step-t">${esc(displayText(m))}</div><div class="step-d">${m.length ? fmtDist(m.length * 1000) : ''}</div></div>`).join('')}</div>` : '';
  return `<div class="rc-detail">
      <div class="energy-bar"><canvas id="energy-canvas"></canvas></div>
      <div class="energy-legend"><span>${t(isEV() ? 'batteryAlong' : 'fuelAlong')}: <b>${Math.round(S.level)}% → ${Math.max(0, Math.round(e.arrival))}%</b></span><span>${nf(e.used, 1)} ${unit()} · ${money(e.cost)}</span></div>
      ${e.totalChargeS > 60 ? `<div class="time-split">
        <div><span>${ms('directions_car')}${t('splitDrive')}</span><b>${fmtDur(r.timeS)}</b></div>
        <div class="ch"><span>${ms(isEV() ? 'ev_station' : 'local_gas_station')}${t(isEV() ? 'splitCharge' : 'splitFuel')}</span><b>${fmtDur(e.totalChargeS)}</b></div>
        <div class="tot"><span>${ms('schedule')}${t('splitTotal')}</span><b>${fmtDur(r.timeS + e.totalChargeS)}</b></div>
      </div>` : ''}
      ${notice}${charges}
      <div class="rc-actions">
        ${HAS_GPS ? `<button class="btn filled" id="btn-start">${ms('navigation', 'fill')}${t('start')}</button>` : ''}
        <button class="btn" id="btn-steps">${ms('list')}${t(state.showSteps ? 'hideSteps' : 'steps')}</button>
      </div>
      ${steps}
    </div>`;
}
function bindDetail() {
  const ab = $('#btn-autoplan'); if (ab) ab.onclick = autoPlan;
  const bs = $('#btn-start'); if (bs) bs.onclick = () => startNavigation('gps');
  const st = $('#btn-steps'); if (st) st.onclick = () => { state.showSteps = !state.showSteps; renderResults(); };
}
function drawEnergyChart() {
  const c = $('#energy-canvas');
  if (!c || !state.route) return;
  const dpr = devicePixelRatio || 1, W = c.clientWidth, H = c.clientHeight;
  if (!W) return;
  c.width = W * dpr; c.height = H * dpr;
  const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
  const total = state.route.total / 1000, top = Math.max(100, S.level);
  const y = (l) => H - 2 - (clamp(l, 0, top) / top) * (H - 4);
  ctx.strokeStyle = 'rgba(242,153,0,.6)'; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(0, y(S.reserve)); ctx.lineTo(W, y(S.reserve)); ctx.stroke(); ctx.setLineDash([]);
  for (let x = 0; x < W; x++) {
    const l = levelAt(total * x / W);
    ctx.fillStyle = levelColor(l) + '40'; ctx.fillRect(x, y(l), 1, H - y(l));
    ctx.fillStyle = levelColor(l); ctx.fillRect(x, y(l) - 1, 1, 2);
  }
}
function manIcon(type) {
  if ([1, 2, 3].includes(type)) return 'navigation';
  if ([4, 5, 6].includes(type)) return 'sports_score';
  if ([9, 18, 20, 23, 37].includes(type)) return 'turn_slight_right';
  if ([16, 19, 21, 24, 38].includes(type)) return 'turn_slight_left';
  if (type === 10) return 'turn_right';
  if (type === 15) return 'turn_left';
  if (type === 11) return 'turn_sharp_right';
  if (type === 14) return 'turn_sharp_left';
  if (type === 12) return 'u_turn_right';
  if (type === 13) return 'u_turn_left';
  if (type === 25) return 'merge';
  if (type === 26 || type === 27) return 'roundabout_right';
  if (type === 28 || type === 29) return 'directions_boat';
  return 'straight';
}

/* ---------------- range ring ---------------- */
function renderRange() {
  if (!state.styleReady) return;
  $('#m-range-switch').classList.toggle('on', S.showRange);
  const src = map.getSource('range');
  const start = state.wps[0].lat != null ? { lat: state.wps[0].lat, lon: state.wps[0].lon } : state.me;
  if (!S.showRange || !start) { src.setData({ type: 'FeatureCollection', features: [] }); return; }
  const radius = rangeNow() * 0.72 * 1000, ring = [];
  for (let i = 0; i <= 96; i++) { const a = (i / 96) * 2 * Math.PI; ring.push([start.lon + (radius * Math.sin(a)) / (111320 * Math.cos(rad(start.lat))), start.lat + (radius * Math.cos(a)) / 111320]); }
  src.setData({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] }, properties: {} });
}

/* =========================================================
   STATIONS — bundled offline data, instant search
   ========================================================= */
const DATA = { charging: null, fuel: null };
const GRID = 20; // cells of 0.05°
const cellKey = (lat, lon) => `${Math.floor(lat * GRID)}_${Math.floor(lon * GRID)}`;
const PLUG = { s2: 'Type 2', c2: 'Type 2', sk: 'Schuko', cc: 'CCS', ch: 'CHAdeMO', ce: 'CEE', o: '' };
const PLUG_DE = { s2: 'Typ 2', c2: 'Typ 2', sk: 'Schuko', cc: 'CCS', ch: 'CHAdeMO', ce: 'CEE', o: '' };
const AC = ['s2', 'c2', 'sk', 'ce'];
let dataLoading = null;
function loadData() {
  if (dataLoading) return dataLoading;
  dataLoading = Promise.all([
    loadScript('data/charging.js').then(() => buildIndex('charging', window.NAV45_CHARGING)),
    loadScript('data/fuel.js').then(() => buildIndex('fuel', window.NAV45_FUEL)),
  ]).catch(() => {}).then(() => { renderDataNote(); });
  return dataLoading;
}
function buildIndex(kind, raw) {
  if (!raw) return;
  const grid = new Map();
  const items = raw.s.map((r, i) => {
    const st = kind === 'charging' ? chargingStation(r, raw, i) : fuelStation(r, i);
    const k = cellKey(st.lat, st.lon);
    let cell = grid.get(k); if (!cell) grid.set(k, (cell = [])); cell.push(st);
    return st;
  });
  DATA[kind] = { items, grid, date: raw.date };
}
function chargingStation(r, raw, i) {
  const [lat, lon, op, title, addr, ac, dc, f, plugStr] = r;
  const operator = raw.ops[op] || '';
  const plugs = (plugStr || '').split(',').filter(Boolean).map((p) => ({ code: p.slice(0, 2), n: +p.slice(2) || 1 }));
  const hasAC = plugs.some((p) => AC.includes(p.code));
  // some operators register only an ID code like "DELSGSSKL0044" as the name — show the operator instead
  const isCode = !!title && !/[a-zäöüß]/.test(title) && /\d/.test(title) && !/\s/.test(title.trim());
  return { id: 'c' + i, kind: 'charging', lat, lon, name: (title && !isCode ? title : operator) || '', operator, addr, ac, dc, h24: !!(f & 1), card: !!(f & 2), plugs, compatible: plugs.length ? hasAC : null };
}
function fuelStation(r, i) {
  const [lat, lon, name, brand, addr, diesel, petrol, f] = r;
  const compat = S.fuelKind === 'diesel' ? (diesel === 0 ? false : diesel === 1 ? true : null) : (petrol === 0 ? false : petrol === 1 ? true : null);
  return { id: 'f' + i, kind: 'fuel', lat, lon, name: name || brand || '', operator: brand && brand !== name ? brand : '', addr, diesel, petrol, h24: !!(f & 1), compatible: compat };
}
function stationCompatible(s) {
  if (s.kind === 'fuel') return S.fuelKind === 'diesel' ? (s.diesel === 0 ? false : s.diesel === 1 ? true : null) : (s.petrol === 0 ? false : s.petrol === 1 ? true : null);
  return s.compatible;
}
function stationTitle(s) { return s.name || t(s.kind === 'charging' ? 'oneCharger' : 'oneFuel'); }
function stationMeta(s) {
  const parts = [];
  if (s.kind === 'charging') {
    const P = L() === 'de' ? PLUG_DE : PLUG;
    const agg = new Map();
    s.plugs.forEach((p) => { const n = P[p.code]; if (n) agg.set(n, (agg.get(n) || 0) + p.n); });
    const pl = [...agg.entries()].map(([n, c]) => `${n}${c > 1 ? ' ×' + c : ''}`).join(', ');
    if (pl) parts.push(s.compatible === false ? `<span class="warn">${pl} · ${t('dcOnly')}</span>` : `<span class="ok">${pl}</span>`);
    else parts.push(`<span class="warn">${t('plugsUnknown')}</span>`);
    const kw = Math.max(s.ac || 0, s.dc || 0);
    if (kw) parts.push(`${nf(kw, kw % 1 ? 1 : 0)} kW`);
  } else {
    const f = [];
    if (s.diesel === 1) f.push('Diesel');
    if (s.petrol === 1) f.push('Super');
    if (f.length) parts.push(`<span class="${stationCompatible(s) ? 'ok' : ''}">${f.join(', ')}</span>`);
  }
  if (s.h24) parts.push(t('open247'));
  return parts.join(' · ');
}
function projectOnRoute(lat, lon, r = state.route) {
  const c = r.coords, kx = 111320 * Math.cos(rad(lat)), ky = 110540;
  let best = Infinity, along = 0;
  for (let i = 0; i < c.length - 1; i++) {
    const ax = (c[i][0] - lon) * kx, ay = (c[i][1] - lat) * ky, bx = (c[i + 1][0] - lon) * kx, by = (c[i + 1][1] - lat) * ky;
    const dx = bx - ax, dy = by - ay, len = dx * dx + dy * dy;
    const f = len > 0 ? clamp(-(ax * dx + ay * dy) / len, 0, 1) : 0;
    const px = ax + dx * f, py = ay + dy * f, d = px * px + py * py;
    if (d < best) { best = d; along = r.cum[i] + (r.cum[i + 1] - r.cum[i]) * f; }
  }
  return { along, off: Math.sqrt(best) };
}
function stationsAlongRoute(kind) {
  const D = DATA[kind], r = state.route;
  if (!D || !r) return [];
  const span = Math.ceil((S.corridor / 111000) * GRID) + 1, seen = new Set(), cand = [];
  let next = 0;
  for (let i = 0; i < r.coords.length; i++) {
    if (r.cum[i] < next && i !== r.coords.length - 1) continue;
    next = r.cum[i] + 400;
    const [lon, lat] = r.coords[i];
    const cy = Math.floor(lat * GRID), cx = Math.floor(lon * GRID);
    for (let dy = -span; dy <= span; dy++) for (let dx = -span - 1; dx <= span + 1; dx++) {
      const k = `${cy + dy}_${cx + dx}`;
      if (seen.has(k)) continue; seen.add(k);
      const cell = D.grid.get(k); if (cell) cand.push(...cell);
    }
  }
  const out = [];
  for (const s of cand) {
    const p = projectOnRoute(s.lat, s.lon, r);
    if (p.off <= S.corridor) out.push({ ...s, along: p.along, off: p.off });
  }
  return out.sort((a, b) => a.along - b.along);
}
function stationsInView(kind) {
  const D = DATA[kind];
  if (!D) return [];
  const b = map.getBounds(), c = map.getCenter(), out = [];
  for (let y = Math.floor(b.getSouth() * GRID); y <= Math.floor(b.getNorth() * GRID); y++) {
    for (let x = Math.floor(b.getWest() * GRID); x <= Math.floor(b.getEast() * GRID); x++) {
      const cell = D.grid.get(`${y}_${x}`); if (cell) cell.forEach((s) => out.push({ ...s, dist: haversine(c.lat, c.lng, s.lat, s.lon) }));
    }
  }
  return out.sort((a, b2) => a.dist - b2.dist);
}
async function loadStations({ mode = null } = {}) {
  if (mode) state.stationsMode = mode;
  if (state.route && !mode && state.stationsMode !== 'area') state.stationsMode = 'route';
  updateStationControls();
  await loadData();
  for (const kind of ['charging', 'fuel']) {
    if (state.stationsMode === 'route' && state.route) state.stationList[kind] = stationsAlongRoute(kind);
    else if (state.stationsMode === 'area') state.stationList[kind] = map.getZoom() >= 10 ? stationsInView(kind) : [];
    else state.stationList[kind] = null;
  }
  state.shown = 25;
  computeSuggestion(); renderStationList(); renderStationLayer();
}
function visibleStations(kind = state.stationTab) {
  const arr = state.stationList[kind] || [];
  return S.compatOnly ? arr.filter((s) => stationCompatible(s) !== false) : arr;
}
function pickStation(list) {
  if (!list.length) return null;
  const last = list[list.length - 1];
  const known = list.filter((s) => stationCompatible(s) === true);
  const k = known[known.length - 1];
  return k && last.along - k.along < 8000 ? k : last;
}
function computeSuggestion() {
  state.suggestedId = null;
  const e = state.energy;
  if (!e || !state.route || state.stationsMode !== 'route') return;
  const limitKm = e.reserveKm ?? e.deadKm;
  if (limitKm == null) return;
  const best = pickStation(visibleStations(vehicleKind()).filter((s) => s.along / 1000 < limitKm - 0.5));
  if (best) state.suggestedId = best.id;
}
const isStop = (s) => state.wps.some((w) => w.stationId === s.id);
function renderStationList() {
  const list = $('#station-list'), kind = state.stationTab, raw = state.stationList[kind];
  $('#stations-title').textContent = t(state.stationsMode === 'route' && state.route ? 'alongRoute' : state.stationsMode === 'area' ? 'inArea' : 'stations');
  $('#stations-count').textContent = state.stationList.charging == null ? t('stationsHint')
    : t('stationsCount', { c: visibleStations('charging').length, f: visibleStations('fuel').length });
  $('#stations-toggle .sec-ico').textContent = isEV() ? 'ev_station' : 'local_gas_station';
  $('#stations').classList.toggle('open', S.stationsOpen);
  $('#stations-body').classList.toggle('hidden', !S.stationsOpen);
  if (raw == null) {
    list.innerHTML = `<div class="empty">${t('emptyPlan', { what: t(kind === 'charging' ? 'whatChargers' : 'whatFuels'), btn: t('searchHere') })}</div>`;
    return;
  }
  if (state.stationsMode === 'area' && map.getZoom() < 10) { list.innerHTML = `<div class="empty">${t('zoomInMore')}</div>`; return; }
  const arr = visibleStations(kind);
  if (!arr.length) {
    const what = t(kind === 'charging' ? 'pluralChargers' : 'pluralFuels');
    list.innerHTML = `<div class="empty">${state.stationsMode === 'route' ? t('noneRoute', { what, d: S.corridor >= 1000 ? S.corridor / 1000 + ' km' : S.corridor + ' m' }) : t('noneArea', { what })}</div>`;
    return;
  }
  list.innerHTML = '';
  const sorted = state.suggestedId && kind === vehicleKind() ? [...arr.filter((s) => s.id === state.suggestedId), ...arr.filter((s) => s.id !== state.suggestedId)] : arr;
  sorted.slice(0, state.shown).forEach((s) => {
    const el = document.createElement('div');
    el.className = 'st';
    const side = s.along != null
      ? `<div class="st-km">km ${fmtKm(s.along / 1000)}</div><div class="st-off">${s.off < 60 ? t('onRoute') : '+' + fmtDist(s.off)}</div>`
      : `<div class="st-km">${fmtDist(s.dist)}</div><div class="st-off">${t('away')}</div>`;
    const added = isStop(s);
    el.innerHTML = `<div class="st-ico ${s.kind}">${ms(s.kind === 'charging' ? 'ev_station' : 'local_gas_station')}</div>
      <div class="st-body">${s.id === state.suggestedId ? `<span class="st-flag">${t('suggested')}</span>` : ''}
        <div class="st-name">${esc(stationTitle(s))}</div><div class="st-sub">${esc([s.operator && s.operator !== s.name ? s.operator : '', s.addr].filter(Boolean).join(' · '))}</div>
        <div class="st-meta">${stationMeta(s)}</div></div>
      <div class="st-side">${side}<button class="st-add${added ? ' added' : ''}" title="${t(added ? 'removeFromRoute' : 'addAsStop')}">${ms(added ? 'check' : 'add')}</button></div>`;
    el.onclick = (ev) => {
      if (ev.target.closest('.st-add')) { toggleStationStop(s); return; }
      map.flyTo({ center: [s.lon, s.lat], zoom: Math.max(map.getZoom(), 15), duration: 900 });
      openStationPopup(s);
    };
    list.appendChild(el);
  });
  if (arr.length > state.shown) {
    const more = document.createElement('button');
    more.className = 'text-btn more-btn';
    more.textContent = t('showMore', { n: Math.min(25, arr.length - state.shown) });
    more.onclick = () => { state.shown += 25; renderStationList(); };
    list.appendChild(more);
  }
}
function renderStationLayer() {
  if (!state.styleReady) return;
  const arr = state.stationList[state.stationTab] ? visibleStations(state.stationTab) : [];
  map.getSource('stations').setData({ type: 'FeatureCollection', features: arr.slice(0, 3000).map((s, i) => ({
    type: 'Feature', geometry: { type: 'Point', coordinates: [s.lon, s.lat] },
    properties: { id: s.id, kind: s.kind, icon: 'st-' + s.kind, hi: s.id === state.suggestedId || isStop(s), sort: s.id === state.suggestedId ? 0 : i + 1 },
  })) });
}
function setStationsVisible(on) {
  for (const l of ['stations-cluster', 'stations-count', 'stations-pt']) if (map.getLayer(l)) map.setLayoutProperty(l, 'visibility', on ? 'visible' : 'none');
}
function updateStationControls() {
  $$('#station-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === state.stationTab));
  $('#compat-chip').classList.toggle('on', S.compatOnly);
  $('#compat-label').textContent = state.stationTab === 'charging' ? t('fitsCar') : t(S.fuelKind === 'diesel' ? 'dieselOnly' : 'petrolOnly');
  $('#corridor').value = String(S.corridor);
}
const findStation = (id) => (state.stationList.charging || []).concat(state.stationList.fuel || []).find((s) => s.id === id);
function stopInsertIndex(alongM) {
  const r = state.route;
  if (!r || alongM == null) return state.wps.length - 1;
  for (let k = 1; k < r.wps.length - 1; k++) if (r.legs[k - 1].endM > alongM) { const idx = state.wps.indexOf(r.wps[k]); return idx < 1 ? state.wps.length - 1 : idx; }
  return state.wps.length - 1;
}
const stationWp = (s, charge) => ({ id: uid(), label: stationTitle(s), sub: s.addr, lat: s.lat, lon: s.lon, kind: 'station', stationKind: s.kind, stationId: s.id, charge });
function toggleStationStop(s) {
  const existing = state.wps.find((w) => w.stationId === s.id);
  if (existing) { removeWp(existing.id); toast(t('removed', { n: esc(stationTitle(s)) })); }
  else {
    addStop(stationWp(s, s.kind === vehicleKind()), Math.max(1, stopInsertIndex(s.along)));
    toast(t('addedStop', { n: esc(stationTitle(s)) }));
    computeRoute({ fit: false });
  }
  if (state.popup) state.popup.remove();
  renderStationList(); renderStationLayer();
}
async function autoPlan() {
  const kind = vehicleKind();
  state.stationTab = kind;
  await loadData();
  const r = state.route, e = state.energy;
  if (!r || !e) return;
  const cands = stationsAlongRoute(kind).filter((s) => !S.compatOnly || stationCompatible(s) !== false);
  const full = fullRange(), totalKm = r.total / 1000, target = isEV() ? S.chargeTarget : 100;
  const existing = e.charges.map((c) => ({ km: c.km, to: c.to }));
  const one = t(isEV() ? 'oneCharger' : 'oneFuel');
  let pos = 0, lvl = S.level, guard = 0;
  const chosen = [];
  while (guard++ < 12) {
    const reach = pos + Math.max(0, lvl - S.reserve) / 100 * full;
    const ex = existing.find((c) => c.km > pos + 0.01 && c.km <= reach);
    if (ex) { pos = ex.km; lvl = ex.to; continue; }
    if (reach >= totalKm) break;
    const best = pickStation(cands.filter((s) => s.along / 1000 > pos + 0.3 && s.along / 1000 <= reach));
    if (!best) { toast(chosen.length ? t('gapLeft', { c: chosen.length, w: one }) : t('noneInReach', { w: one }), 6000); break; }
    chosen.push(best); pos = best.along / 1000; lvl = target;
  }
  if (!chosen.length) return;
  chosen.forEach((s) => state.wps.splice(Math.max(1, stopInsertIndex(s.along)), 0, stationWp(s, true)));
  renderWaypoints(); updateMarkers(); saveWps();
  toast(t(isEV() ? 'autoAddedCharge' : 'autoAddedFuel', { n: chosen.length }));
  await computeRoute({ fit: false });
}

/* ---------------- popups ---------------- */
function openStationPopup(s) {
  if (state.popup) state.popup.remove();
  const el = document.createElement('div');
  const added = isStop(s);
  el.innerHTML = `<div class="pp-title">${esc(stationTitle(s))}</div><div class="pp-sub">${esc([s.operator && s.operator !== s.name ? s.operator : '', s.addr].filter(Boolean).join(' · '))}</div>
    <div class="pp-meta">${stationMeta(s)}${s.along != null ? `<br>${t('kmOnRoute', { km: fmtKm(s.along / 1000) })} · ${s.off < 60 ? t('directlyOnRoute') : t('offRoute', { d: fmtDist(s.off) })}` : ''}</div>
    <div class="pp-actions"><button class="btn filled" data-a="stop">${ms(added ? 'remove' : 'add')}${t(added ? 'removeFromRoute' : 'addAsStop')}</button><button class="btn" data-a="go">${ms('directions')}${t('goHere')}</button></div>`;
  el.querySelector('[data-a=stop]').onclick = () => toggleStationStop(s);
  el.querySelector('[data-a=go]').onclick = () => { state.popup.remove(); setWp(state.wps[state.wps.length - 1], { label: stationTitle(s), sub: s.addr, lat: s.lat, lon: s.lon, kind: 'station', stationKind: s.kind, stationId: s.id }); };
  state.popup = new maplibregl.Popup({ offset: 16, maxWidth: '320px' }).setLngLat([s.lon, s.lat]).setDOMContent(el).addTo(map);
}
function openPinPopup(ll) {
  if (state.popup) state.popup.remove();
  const el = document.createElement('div');
  el.innerHTML = `<div class="pp-title">${t('droppedPin')}</div><div class="pp-sub">${ll.lat.toFixed(5)}, ${ll.lng.toFixed(5)}</div>
    <div class="pp-actions"><button class="btn filled" data-a="end">${ms('directions')}${t('goHere')}</button><button class="btn" data-a="start">${ms('trip_origin')}${t('startHere')}</button><button class="btn" data-a="stop">${ms('add')}${t('stopBtn')}</button></div>`;
  state.popup = new maplibregl.Popup({ offset: 8, maxWidth: '380px' }).setLngLat(ll).setDOMContent(el).addTo(map);
  let info = { main: `${ll.lat.toFixed(5)}, ${ll.lng.toFixed(5)}`, sub: '' };
  const pending = reverseGeocode(ll.lat, ll.lng).then((r) => { info = r; el.querySelector('.pp-title').textContent = r.main; el.querySelector('.pp-sub').textContent = r.sub; });
  const act = async (which) => {
    if (state.popup) state.popup.remove();
    await Promise.race([pending, new Promise((r) => setTimeout(r, 1500))]);
    const data = { label: info.main, sub: info.sub, lat: ll.lat, lon: ll.lng };
    if (which === 'start') setWp(state.wps[0], data);
    else if (which === 'end') setWp(state.wps[state.wps.length - 1], data);
    else setWp(state.wps.find((w, i) => i > 0 && i < state.wps.length - 1 && w.lat == null) || addStop(emptyWp()), data);
  };
  el.querySelectorAll('[data-a]').forEach((b) => { b.onclick = () => act(b.dataset.a); });
}

/* =========================================================
   NAVIGATION (GPS on the phone, preview drive everywhere)
   ========================================================= */
function locateAt(d, r = state.route) {
  const { cum, coords, total } = r;
  d = clamp(d, 0, total);
  let lo = 0, hi = cum.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= d) lo = mid; else hi = mid; }
  const seg = cum[hi] - cum[lo], f = seg > 0 ? (d - cum[lo]) / seg : 0, a = coords[lo], b = coords[hi];
  const lng = a[0] + (b[0] - a[0]) * f, lat = a[1] + (b[1] - a[1]) * f;
  return { lng, lat, idx: lo, arr: [lng, lat] };
}
const TURNS = new Set([9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 26, 27]);
function nextManeuverIndex(p) { const m = state.route.mans; for (let i = 0; i < m.length; i++) if (m[i].along > p + 3) return i; return m.length - 1; }

/* =========================================================
   VOICE — Google-Maps-style sentences, spoken by the best available voice
   Phone app: the phone's text-to-speech engine (on Android normally Google's TTS,
   the same engine Google Maps uses). PC/browser: best installed system voice.
   ========================================================= */
let voices = [];
if ('speechSynthesis' in window) { const lv = () => { voices = speechSynthesis.getVoices(); }; lv(); speechSynthesis.onvoiceschanged = lv; }
const capPlugins = {};
function capPlugin(name) {
  const C = window.Capacitor;
  if (!C || !C.isNativePlatform || !C.isNativePlatform()) return null;
  if (!(name in capPlugins)) {
    try { capPlugins[name] = (C.Plugins && C.Plugins[name]) || (C.registerPlugin ? C.registerPlugin(name) : null); } catch { capPlugins[name] = null; }
  }
  return capPlugins[name];
}
let nativeVoiceIndex; // chosen once: best voice for the language on the phone
async function pickNativeVoice(tts) {
  if (nativeVoiceIndex !== undefined && nativeVoiceIndex.lang === S.lang) return nativeVoiceIndex.i;
  let i = null;
  try {
    const { voices: list } = await tts.getSupportedVoices();
    const want = L();
    const cands = (list || []).map((v, idx) => ({ v, idx })).filter(({ v }) => (v.lang || '').toLowerCase().replace('_', '-').startsWith(want));
    const score = ({ v }) => (/network/i.test(v.voiceURI || v.name || '') ? 2 : 0) + ((v.lang || '').toLowerCase().replace('_', '-') === S.lang.toLowerCase() ? 1 : 0);
    cands.sort((a, b) => score(b) - score(a));
    if (cands.length) i = cands[0].idx;
  } catch { /* use the system default voice for the language */ }
  nativeVoiceIndex = { lang: S.lang, i };
  return i;
}
function desktopVoice() {
  const pref = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith(L()));
  // Google / natural voices first; on iPhone the enhanced ("Erweitert"/"Premium") Apple voices like Anna
  const rank = (v) => (/google/i.test(v.name) ? 4 : 0) + (/natural|online|premium|enhanced|erweitert/i.test(v.name + ' ' + v.voiceURI) ? 3 : 0)
    + (/katja|hedda|conrad|amala|aria|jenny|guy|anna|helena|petra|markus|yannick|samantha/i.test(v.name) ? 1 : 0)
    + (v.lang.toLowerCase().replace('_', '-') === S.lang.toLowerCase() ? 1 : 0) + (v.localService ? 0.5 : 0);
  return pref.sort((a, b) => rank(b) - rank(a))[0] || null;
}
/* ---------- natural (neural) voice: Piper TTS running inside the app ----------
   The voice model is downloaded once (~63 MB) and kept on the device. Sentences are turned into
   audio ahead of time and played with an <audio> element — reliable on iPhone (no dropped speech,
   not muted by the silent switch) and much more natural than the built-in system voices. */
const NEURAL_VOICES = {
  de: [{ id: 'de_DE-thorsten-medium', name: 'Thorsten' }, { id: 'de_DE-kerstin-low', name: 'Kerstin' }],
  en: [{ id: 'en_US-hfc_female-medium', name: 'Hannah' }],
};
const voiceChoice = () => (L() === 'de' ? S.voiceDe : S.voiceEn) || 'auto';
const neuralVoiceId = () => {
  const c = voiceChoice(), list = NEURAL_VOICES[L()];
  if (c === 'system' || !window.PiperTTS || !list) return null;
  return (list.find((v) => v.id === c) || list[0]).id;
};
const NV = { session: null, sessionId: null, loading: null, failed: {}, cache: new Map(), chain: Promise.resolve(), audio: null, worker: undefined };
function neuralReady() { const id = neuralVoiceId(); return !!(id && NV.session && NV.sessionId === id); }

/* The voice runs in a background worker so speech generation never freezes the map.
   If a device can't start the worker, it runs on the page instead (same result, may stutter). */
let workerSeq = 0;
const workerJobs = new Map();
function voiceWorker() {
  if (NV.worker !== undefined) return NV.worker;
  NV.worker = null;
  if (store.get('debugNoWorker', false)) return null; // only used for testing
  try {
    const w = new Worker('voice-worker.js');
    w.onmessage = (e) => {
      const { id, type } = e.data, job = workerJobs.get(id);
      if (!job) return;
      if (type === 'progress') { if (job.onProgress) job.onProgress(e.data); return; }
      workerJobs.delete(id);
      if (type === 'done') job.resolve(e.data.blob); else job.reject(new Error(e.data.error));
    };
    w.onerror = () => { for (const j of workerJobs.values()) j.reject(new Error('worker failed')); workerJobs.clear(); NV.worker = null; };
    NV.worker = w;
  } catch { NV.worker = null; }
  return NV.worker;
}
function workerCall(msg, onProgress) {
  const w = voiceWorker();
  if (!w) return Promise.reject(new Error('no worker'));
  return new Promise((resolve, reject) => {
    const id = ++workerSeq;
    workerJobs.set(id, { resolve, reject, onProgress });
    w.postMessage({ ...msg, id });
  });
}
function loadNeuralVoice({ silent = false } = {}) {
  const id = neuralVoiceId();
  if (!id || NV.failed[id]) return null;
  if (NV.session && NV.sessionId === id) return Promise.resolve(NV.session);
  if (NV.loading && NV.loadingId === id) return NV.loading;
  NV.loadingId = id;
  let shown = -1;
  const progress = (p) => {
    if (silent || !p.total) return;
    const pct = Math.round((p.loaded / p.total) * 100);
    if (pct >= shown + 10 || pct === 100) { shown = pct; progressToast('voice', t('voiceLoading', { p: pct })); }
  };
  const onPage = () => {
    try { window.PiperTTS.TtsSession._instance = null; } catch { /* ignore */ }
    return window.PiperTTS.TtsSession.create({ voiceId: id, progress }).then((s) => ({ predict: (text) => s.predict(text) }));
  };
  const inWorker = () => workerCall({ type: 'load', voiceId: id }, progress).then(() => ({ predict: (text) => workerCall({ type: 'predict', text }), worker: true }));
  NV.loading = (voiceWorker() ? inWorker().catch(() => onPage()) : onPage()).then((s) => {
    NV.session = s; NV.sessionId = id; NV.loading = null; NV.cache.clear();
    progressToast('voice', null);
    return s;
  }).catch(() => { NV.loading = null; NV.failed[id] = true; progressToast('voice', null); return null; });
  return NV.loading;
}
/* text → audio URL (cached); syntheses run one after another */
function synth(text) {
  const key = `${NV.sessionId}|${text}`;
  if (NV.cache.has(key)) return NV.cache.get(key);
  const job = NV.chain.then(async () => {
    const s = NV.session;
    if (!s) throw new Error('voice not ready');
    return URL.createObjectURL(await s.predict(text));
  });
  NV.chain = job.catch(() => {});
  NV.cache.set(key, job);
  job.catch(() => NV.cache.delete(key));
  return job;
}
function audioEl() {
  if (!NV.audio) { NV.audio = new Audio(); NV.audio.preload = 'auto'; }
  return NV.audio;
}
const SILENT_WAV = (() => { // 0.05 s of silence, used to unlock audio on the first tap (iPhone rule)
  const n = 400, b = new ArrayBuffer(44 + n), v = new DataView(b), w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true);
  for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
  return URL.createObjectURL(new Blob([b], { type: 'audio/wav' }));
})();
/* must run directly inside a tap: lets the phone play our audio / speech later */
function unlockAudio() {
  if (unlockAudio.done) return;
  unlockAudio.done = true;
  try { const a = audioEl(); a.src = SILENT_WAV; a.play().catch(() => {}); } catch { /* ignore */ }
  try { if ('speechSynthesis' in window && !capPlugin('TextToSpeech')) { const u = new SpeechSynthesisUtterance('.'); u.volume = 0; speechSynthesis.speak(u); } } catch { /* ignore */ }
}

/* ---------- playing one sentence (resolves when it has finished) ---------- */
const keepUtterances = new Set(); // Safari/Chrome drop utterances that are garbage-collected while speaking
let playToken = 0;
async function playText(text) {
  const token = ++playToken;
  if (neuralReady()) {
    try {
      const url = await synth(text);
      if (token !== playToken) return;
      const a = audioEl();
      a.src = url;
      await new Promise((resolve) => {
        const done = () => { a.removeEventListener('ended', done); a.removeEventListener('error', done); a.removeEventListener('pause', done); resolve(); };
        a.addEventListener('ended', done); a.addEventListener('error', done); a.addEventListener('pause', done);
        a.play().catch(done);
      });
      return;
    } catch { /* fall back to the system voice */ }
  }
  const tts = capPlugin('TextToSpeech');
  if (tts) {
    try { const voice = await pickNativeVoice(tts); await tts.speak({ text, lang: S.lang, rate: 1.0, pitch: 1.0, volume: 1.0, category: 'playback', ...(voice != null ? { voice } : {}) }); } catch { /* ignore */ }
    return;
  }
  if (!('speechSynthesis' in window)) return;
  await new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = S.lang; u.voice = desktopVoice(); u.rate = 1.0;
    keepUtterances.add(u);
    const done = () => { keepUtterances.delete(u); clearTimeout(guard); resolve(); };
    const guard = setTimeout(done, 15000);
    u.onend = done; u.onerror = done;
    speechSynthesis.speak(u); // no cancel() right before speak — that makes iPhones drop the sentence
  });
}
function stopAudioNow() {
  playToken++;
  try { if (NV.audio) NV.audio.pause(); } catch { /* ignore */ }
  const tts = capPlugin('TextToSpeech');
  if (tts) tts.stop().catch(() => {});
  else if ('speechSynthesis' in window) speechSynthesis.cancel();
}

/* ---------- speech queue: sentences never cut each other off ---------- */
const VQ = { playing: null, next: null };
const voiceLog = []; // for testing: which sentence, at what distance to its turn, with which voice
function say(text, cue = null) {
  if (!S.voice || !text) return;
  const item = { text, cue };
  if (voiceLog.length > 300) voiceLog.shift();
  voiceLog.push({ text, stage: cue && cue.stage, toTurn: cue && state.nav && state.route ? Math.round(state.route.mans[cue.mi].along - state.nav.progress) : null, neural: neuralReady(), busy: !!VQ.playing });
  if (VQ.playing) {
    const cur = VQ.playing.cue;
    // a turn instruction may interrupt a stale or less urgent sentence (e.g. "follow the road")
    const stale = cur && state.nav && state.nav.progress > cur.expires;
    if (cue && cue.stage === 'now' && cur && (stale || cur.rank < 2 || cur.mi < cue.mi && cur.stage !== 'now')) { stopAudioNow(); VQ.playing = null; }
    else { VQ.next = item; return; } // wait until the current sentence is finished
  }
  playItem(item);
}
async function playItem(item) {
  VQ.playing = item;
  await playText(item.text);
  if (VQ.playing !== item) return;
  VQ.playing = null;
  const n = VQ.next; VQ.next = null;
  if (n && !(n.cue && state.nav && state.nav.progress > n.cue.expires)) playItem(n);
}
function stopSpeaking() { VQ.next = null; VQ.playing = null; stopAudioNow(); }
// kept for the few one-off messages ("Route wird neu berechnet" …)
const speak = (text) => say(text);

/* ---------- phrasing ---------- */
const REF_RE = /^(A|B|L|K|St|S|E|KS|SK)\s?\d+[a-z]?$/i;
const ORD = { de: ['', 'erste', 'zweite', 'dritte', 'vierte', 'fünfte', 'sechste', 'siebte', 'achte'], en: ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'] };
const cap1 = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
function streetOf(m) {
  const names = (m.street_names || []).filter(Boolean);
  return names.find((n) => !REF_RE.test(n)) || names[0] || '';
}
/* makes abbreviations readable for the voice: "St 2051" → "Staatsstraße 2051", "Hauptstr." → "Hauptstraße" */
function sayable(s) {
  return s.replace(/str\.(?=\s|,|$)/g, 'straße').replace(/Str\.(?=\s|,|$)/g, 'Straße').replace(/\bPl\.(?=\s|,|$)/g, 'Platz')
    .replace(/\bSt\s?(\d)/g, 'Staatsstraße $1').replace(/\bKS?\s?(\d)/g, 'Kreisstraße $1').replace(/\bS\s?(\d)/g, 'Staatsstraße $1');
}
function genderDE(n) {
  const low = n.toLowerCase();
  if (REF_RE.test(n)) return 'f'; // die B 10 / die L 1014
  if (/^(am|an|auf|im|in|zum|zur|unter|über|hinter|vor|bei|beim|alte[rs]?)\s/.test(low)) return null;
  if (/(straße|strasse|gasse|allee|chaussee|promenade|zeile|steige|brücke|staffel|stiege|achse|tangente|umgehung)$/.test(low)) return 'f';
  if (/(weg|platz|ring|damm|steig|pfad|graben|markt|berg|hof|kai|wall|winkel|park|stieg|anger|gürtel|tunnel|kreisel)$/.test(low)) return 'm';
  if (/(ufer|tor|feld|gewerbegebiet)$/.test(low)) return 'n';
  return null;
}
function intoDE(n) { // "in die Kaulstraße", "in den Lindenweg", "auf die B 10"
  if (!n) return '';
  const g = genderDE(n);
  if (REF_RE.test(n)) return `auf die ${n}`;
  return g === 'f' ? `in die ${n}` : g === 'm' ? `in den ${n}` : g === 'n' ? `auf das ${n}` : `auf ${n}`;
}
function onDE(n) { // "auf der Kaulstraße"
  if (!n) return '';
  const g = genderDE(n);
  return g === 'f' ? `auf der ${n}` : (g === 'm' || g === 'n') ? `auf dem ${n}` : `auf ${n}`;
}
/* the action of a maneuver, e.g. "rechts abbiegen in die Kaulstraße" / "turn right onto Kaulstraße" */
function actionText(m, { speech = false } = {}) {
  const s = actionRaw(m);
  return speech ? sayable(s) : s;
}
function actionRaw(m) {
  const de = L() === 'de';
  let n = streetOf(m);
  if (m.type === 26 && !n && state.route) { // roundabout: name the road you leave it on
    const i = state.route.mans.indexOf(m), ex = state.route.mans[i + 1];
    if (ex && ex.type === 27) n = streetOf(ex);
  }
  const into = de ? intoDE(n) : (n ? `onto ${n}` : '');
  const sp = (s) => (s ? ' ' + s : '');
  const isStop = state.route && m.leg < state.route.legs.length - 1;
  const cnt = m.roundabout_exit_count || 0;
  switch (m.type) {
    case 1: case 2: case 3: return de ? (n ? `${onDE(n)} losfahren` : 'der Route folgen') : (n ? `head out on ${n}` : 'follow the route');
    case 4: return de ? (isStop ? 'Sie haben Ihren Zwischenstopp erreicht' : 'Sie haben Ihr Ziel erreicht') : (isStop ? 'you have reached your stop' : 'you have arrived at your destination');
    case 5: return de ? `Ihr ${isStop ? 'Zwischenstopp' : 'Ziel'} befindet sich rechts` : `your ${isStop ? 'stop' : 'destination'} is on the right`;
    case 6: return de ? `Ihr ${isStop ? 'Zwischenstopp' : 'Ziel'} befindet sich links` : `your ${isStop ? 'stop' : 'destination'} is on the left`;
    case 7: case 8: case 17: case 22: return de ? `geradeaus weiterfahren${sp(onDE(n))}` : `continue straight${n ? ` on ${n}` : ''}`;
    case 9: return de ? `leicht rechts abbiegen${sp(into)}` : `turn slightly right${sp(into)}`;
    case 16: return de ? `leicht links abbiegen${sp(into)}` : `turn slightly left${sp(into)}`;
    case 10: return de ? `rechts abbiegen${sp(into)}` : `turn right${sp(into)}`;
    case 15: return de ? `links abbiegen${sp(into)}` : `turn left${sp(into)}`;
    case 11: return de ? `scharf rechts abbiegen${sp(into)}` : `make a sharp right${sp(into)}`;
    case 14: return de ? `scharf links abbiegen${sp(into)}` : `make a sharp left${sp(into)}`;
    case 12: case 13: return de ? 'wenden' : 'make a U-turn';
    case 18: case 20: return de ? `rechts abfahren${sp(into)}` : `take the exit on the right${sp(into)}`;
    case 19: case 21: return de ? `links abfahren${sp(into)}` : `take the exit on the left${sp(into)}`;
    case 23: return de ? `rechts halten${sp(into)}` : `keep right${sp(into)}`;
    case 24: return de ? `links halten${sp(into)}` : `keep left${sp(into)}`;
    case 25: case 37: case 38: return de ? (n ? `auffahren ${into}` : 'einfädeln') : (n ? `merge onto ${n}` : 'merge');
    case 26: return de ? `im Kreisverkehr die ${ORD.de[cnt] || `${cnt}.`} Ausfahrt nehmen${sp(into)}` : `at the roundabout, take the ${ORD.en[cnt] || `exit ${cnt}`} exit${sp(into)}`;
    case 27: return de ? `den Kreisverkehr verlassen${sp(into)}` : `exit the roundabout${sp(into)}`;
    case 28: return de ? 'die Fähre nehmen' : 'take the ferry';
    case 29: return de ? 'die Fähre verlassen' : 'leave the ferry';
    default: return (m.instruction || '').replace(/\.$/, '');
  }
}
const displayText = (m) => cap1(actionText(m));
/* spoken distance, rounded like a navigation app: 300 m, 1 km, 1,5 km */
function spokenDistance(d, accusative = false) {
  const de = L() === 'de';
  let v, km = false;
  if (d < 100) v = Math.max(10, Math.round(d / 10) * 10);
  else if (d < 500) v = Math.round(d / 50) * 50;
  else if (d < 950) v = Math.round(d / 100) * 100;
  else { v = Math.max(1, Math.round(d / 500) / 2); km = true; }
  if (!km) return de ? `${v} ${accusative ? 'Meter' : 'Metern'}` : `${v} meters`;
  if (v === 1) return de ? (accusative ? 'einen Kilometer' : 'einem Kilometer') : '1 kilometer';
  return de ? `${nf(v, v % 1 ? 1 : 0)} ${accusative ? 'Kilometer' : 'Kilometern'}` : `${nf(v, v % 1 ? 1 : 0)} kilometers`;
}
function alertSentence(m, d) { // "In 300 Metern, rechts abbiegen in die Kaulstraße."
  const de = L() === 'de', a = actionText(m, { speech: true });
  if (m.type === 4) return de ? `In ${spokenDistance(d)} erreichen Sie Ihr ${state.route && m.leg < state.route.legs.length - 1 ? 'Zwischenziel' : 'Ziel'}.` : `In ${spokenDistance(d)}, you will arrive at your destination.`;
  return `In ${spokenDistance(d)}, ${a}.`;
}
const TURN_TYPES = new Set([9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 23, 24, 26]);
function nowSentence(m, next) { // "Jetzt rechts abbiegen in die Kaulstraße. Danach links abbiegen."
  const a = actionText(m, { speech: true });
  let s = TURN_TYPES.has(m.type) ? `${L() === 'de' ? 'Jetzt' : 'Now'} ${a}.` : `${cap1(a)}.`;
  if (next && ![4, 5, 6, 27].includes(m.type) && next.type !== 27 && next.along - m.along < 150) s += ` ${L() === 'de' ? 'Danach' : 'Then'} ${actionText(next, { speech: true })}.`;
  return s;
}
function followSentence(dist) { // "Der Straße 2 Kilometer folgen."
  return L() === 'de' ? `Der Straße ${spokenDistance(dist, true)} folgen.` : `Continue for ${spokenDistance(dist)}.`;
}
function jetztSentence(m) { // short version when the turn was already announced together with the previous one
  const n = streetOf(m);
  const a = actionText({ ...m, street_names: [] }, { speech: true }).replace(/\s+$/, '');
  if (!a || [4, 5, 6].includes(m.type)) return nowSentence(m, null);
  return L() === 'de' ? `Jetzt ${a}.` : `Now ${a}.`;
}

/* ---------- announcement plan for the whole route ----------
   Each maneuver gets fixed cues (so their audio can be prepared in advance):
   far   "In einem Kilometer, …"      only after long stretches
   near  "In 200 Metern, …"           said exactly at 200 m (shorter on short roads)
   now   "Rechts abbiegen in die …"   about 3 seconds before the turn
   follow "Der Straße 2 Kilometer folgen."  right after a turn when the next one is far away */
const mentionsNext = (m, next) => next && ![4, 5, 6, 27].includes(m.type) && next.type !== 27 && next.along - m.along < 150;
function buildCues(r = state.route) {
  const cues = [], ms2 = r.mans;
  ms2.forEach((m, i) => {
    if (m.type === 27) return; // roundabout exit: announced together with the entry
    const prevAlong = i > 0 ? ms2[i - 1].along : 0, stretch = m.along - prevAlong;
    const next = ms2[i + 1];
    if (i === 0) { cues.push({ mi: 0, stage: 'now', rank: 3, at: -1, expires: 120, text: nowSentence(m, next) }); return; }
    const announced = mentionsNext(ms2[i - 1], m);
    if (!announced) {
      if (stretch >= 2500) cues.push({ mi: i, stage: 'follow', rank: 0, at: prevAlong + 50, expires: prevAlong + 500, text: followSentence(stretch) });
      if (stretch >= 1700) cues.push({ mi: i, stage: 'far', rank: 1, at: m.along - 1000, expires: m.along - 300, text: alertSentence(m, 1000) });
      let near = 0;
      if (stretch >= 280) near = 200;
      else if (stretch >= 160) near = Math.max(100, Math.floor((stretch - 60) / 50) * 50);
      if (near) cues.push({ mi: i, stage: 'near', rank: 2, at: m.along - near, expires: m.along - 40, text: alertSentence(m, near) });
    }
    cues.push({ mi: i, stage: 'now', rank: 3, at: null, along: m.along, expires: m.along + 15, text: announced ? jetztSentence(m) : nowSentence(m, next) });
  });
  return cues;
}
function runVoiceCues(p) {
  const nav = state.nav, r = state.route;
  if (!nav || !r) return;
  if (!nav.cues || nav.cuesFor !== r) {
    nav.cues = buildCues(r); nav.cuesFor = r; nav.cueDone = new Set();
    if (nav.skipStart) nav.cueDone.add(0); // after rerouting: no "start" sentence, just the next instruction
  }
  // the turn instruction ~3 s before the turn (real driving speed, not the preview speed-up)
  const nowLead = Math.max(30, Math.max(nav.speed, 4) * 3.2);
  const due = [];
  nav.cues.forEach((c, idx) => {
    if (nav.cueDone.has(idx)) return;
    const at = c.at != null ? c.at : c.along - nowLead;
    if (p >= at) { nav.cueDone.add(idx); if (p <= c.expires) due.push(c); }
  });
  if (due.length) say(due[due.length - 1].text, due[due.length - 1]); // only the most recent one if several became due at once
  // prepare the audio of the next announcements in advance
  if (neuralReady() && (!nav.lastPrefetch || Date.now() - nav.lastPrefetch > 1500)) {
    nav.lastPrefetch = Date.now();
    let n = 0;
    for (let idx = 0; idx < nav.cues.length && n < 6; idx++) {
      const c = nav.cues[idx];
      if (nav.cueDone.has(idx)) continue;
      const at = c.at != null ? c.at : c.along - nowLead;
      if (at - p > 3000) break;
      synth(c.text).catch(() => {}); n++;
    }
  }
}

function carMarkerEl() {
  const el = document.createElement('div');
  el.className = 'car-marker';
  el.innerHTML = '<svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="#4285f4" fill-opacity=".18"/><circle cx="26" cy="26" r="13" fill="#fff"/><circle cx="26" cy="26" r="10.5" fill="#1a73e8"/><path d="M26 18.5 31.5 32 26 29 20.5 32Z" fill="#fff"/></svg>';
  return el;
}
async function startNavigation(mode) {
  if (!state.route) return;
  unlockAudio(); // must happen before any await (still inside the tap)
  loadNeuralVoice();
  let gps = null;
  if (mode === 'gps') {
    try { gps = (await getPosition()).coords; } catch { gps = null; }
    if (!gps) { toast(t('noGps'), 4500); mode = 'sim'; }
    else if (projectOnRoute(gps.latitude, gps.longitude).off > 250) {
      state.wps[0] = { id: uid(), label: t('myLocLabel'), lat: gps.latitude, lon: gps.longitude, kind: 'gps', charge: false };
      renderWaypoints(); updateMarkers();
      await computeRoute({ fit: false });
      if (!state.route) return;
    }
  }
  if (state.popup) state.popup.remove();
  // keep only the selected route on the map, hide station icons while driving
  state.routes = [state.route]; state.sel = 0; renderRouteLayers();
  setStationsVisible(false);
  const nav = state.nav = { mode, progress: 0, target: 0, speed: 0, mult: S.simMult, paused: false, follow: true, lastTs: 0, bearing: 0, nextWp: 1,
    spokenAlert: new Set([0]), spokenPre: new Set([0]), spokenFar: new Set([0]), spokenPost: new Set(), offCount: 0, rerouting: false, startTime: Date.now(), lastUi: 0, lastDone: 0, charging: false, raf: 0, watch: null, gpsSpeed: 0, raw: null,
    inTunnel: false, lastFix: Date.now() };
  document.body.classList.add('navigating');
  $('#nav').classList.remove('hidden');
  $('#sim-bar').classList.toggle('hidden', mode !== 'sim');
  $$('#sim-bar [data-sim]').forEach((b) => b.classList.toggle('on', +b.dataset.sim === nav.mult));
  $('#sim-pause').innerHTML = ms('pause');
  $('#sp-limit').classList.add('hidden');
  $('#nav-mute-ico').textContent = S.voice ? 'volume_up' : 'volume_off';
  $('#nav-recenter').classList.add('hidden');
  updateMarkers();
  setTimeout(() => map.resize(), 250);
  const start = locateAt(0);
  nav.bearing = bearingOf(start, locateAt(30));
  nav.marker = new maplibregl.Marker({ element: carMarkerEl(), rotationAlignment: 'map', pitchAlignment: 'map' }).setLngLat([start.lng, start.lat]).addTo(map);
  map.flyTo({ center: [start.lng, start.lat], zoom: navZoom(0), pitch: NAV_PITCH, bearing: nav.bearing, duration: 1500, padding: navPadding() });
  keepAwake(true);
  if (S.batterySaver) set3D(false);
  const m0 = state.route.mans[0];
  stopSpeaking();
  nav.cues = null; // announcement plan is built on the first update (start sentence included)
  if (neuralReady()) buildCues(state.route).slice(0, 4).forEach((c) => synth(c.text).catch(() => {}));
  if (mode === 'gps') {
    nav.watch = await watchPosition(onFix, () => toast(t('gpsLost')));
    onFix({ coords: gps });
  }
  setTimeout(() => { if (state.nav === nav) nav.raf = requestAnimationFrame(tick); }, 1550);
  updateNavUI();
}
const navPadding = () => ({ top: Math.round(innerHeight * 0.38), bottom: 90, left: 0, right: 0 });
const NAV_PITCH = 50;
/* close-up driving view: ~250–400 m ahead, a bit further out at 45 km/h; bigger screens zoom in more so they don't show kilometres ahead */
function navZoom(speed) {
  const base = 18.2 - clamp((speed * 3.6) / 45, 0, 1) * 0.5;
  return base + Math.log2(Math.max(innerHeight, 480) / 800) * 0.8;
}
/* keep the screen on while navigating: phone app (Capacitor KeepAwake), desktop program, or browser Wake Lock */
async function keepAwake(on) {
  try {
    const KA = capPlugin('KeepAwake');
    if (KA) { if (on) await KA.keepAwake(); else await KA.allowSleep(); }
  } catch { /* ignore */ }
  try { if (window.nav45native && window.nav45native.keepAwake) await window.nav45native.keepAwake(on); } catch { /* ignore */ }
  try {
    if (on && 'wakeLock' in navigator && !state.wakeLock) { state.wakeLock = await navigator.wakeLock.request('screen'); state.wakeLock.addEventListener('release', () => { state.wakeLock = null; }); }
    else if (!on && state.wakeLock) { await state.wakeLock.release(); state.wakeLock = null; }
  } catch { /* ignore */ }
}
// the system drops wake locks when the app goes to the background — take it again when it comes back
document.addEventListener('visibilitychange', () => { if (!document.hidden && state.nav) keepAwake(true); });
function onFix(p) {
  const nav = state.nav;
  if (!nav || nav.mode !== 'gps' || !state.route) return;
  const { latitude: lat, longitude: lon, speed, heading } = p.coords;
  nav.raw = { lat, lon };
  nav.lastFix = Date.now();
  showMe(lat, lon);
  if (speed != null && !Number.isNaN(speed)) nav.gpsSpeed = Math.max(0, speed);
  const snap = projectOnRoute(lat, lon);
  if (snap.off < 45) { nav.offCount = 0; nav.target = Math.max(nav.target - 30, snap.along); }
  else if (++nav.offCount >= 3 && !nav.rerouting && !inTunnelAt(nav.target)) reroute(lat, lon, heading);
  // app in the background (screen off / other app): no drawing, but keep voice directions and arrival checks going
  if (document.hidden) { nav.progress = nav.target; nav.speed = nav.gpsSpeed; updateNavUI(); checkArrival(); }
}
async function reroute(lat, lon, heading) {
  const nav = state.nav;
  nav.rerouting = true;
  toast(t('offRouteToast')); speak(t('recalcVoice'));
  state.wps = [{ id: uid(), label: t('myLocLabel'), lat, lon, kind: 'gps', charge: false }, ...state.route.wps.slice(nav.nextWp)];
  renderWaypoints();
  await computeRoute({ fit: false, heading: heading != null && !Number.isNaN(heading) ? heading : null, quiet: true });
  if (state.nav !== nav) return;
  Object.assign(nav, { progress: 0, target: 0, nextWp: 1, cues: null, skipStart: true, offCount: 0, rerouting: false });
  updateMarkers();
}
function tick(ts) {
  const nav = state.nav;
  if (!nav) return;
  // battery saver: about 15 frames per second instead of 60
  if (S.batterySaver && nav.lastTs && ts - nav.lastTs < 66) { nav.raf = requestAnimationFrame(tick); return; }
  const dt = nav.lastTs ? Math.min(0.2, (ts - nav.lastTs) / 1000) : 0.016;
  nav.lastTs = ts;
  const r = state.route;
  if (nav.mode === 'sim') {
    if (!nav.paused && !nav.charging) {
      const m = r.mans[nextManeuverIndex(nav.progress)];
      let kmh = Math.min(S.topSpeed, limitAt(nav.progress + 15) || 999);
      if (m && TURNS.has(m.type)) kmh = Math.min(kmh, ([9, 16, 18, 19, 20, 21].includes(m.type) ? 28 : 16) + Math.max(0, m.along - nav.progress) * 0.3);
      kmh = Math.min(kmh, 8 + Math.max(0, r.legs[Math.min(nav.nextWp - 1, r.legs.length - 1)].endM - nav.progress) * 0.35);
      const tgt = kmh / 3.6, k = Math.sqrt(nav.mult);
      nav.speed = nav.speed < tgt ? Math.min(tgt, nav.speed + 2.2 * dt * k) : Math.max(tgt, nav.speed - 3.5 * dt * k);
      nav.progress = Math.min(r.total, nav.progress + nav.speed * dt * nav.mult);
    } else nav.speed = Math.max(0, nav.speed - 6 * dt);
  } else {
    // no GPS inside tunnels: keep moving along the route at the last known speed (like Google Maps)
    if (Date.now() - nav.lastFix > 2500 && inTunnelAt(nav.target)) nav.target = Math.min(r.total, nav.target + nav.gpsSpeed * dt);
    nav.progress += (nav.target - nav.progress) * Math.min(1, dt * 2.5);
    nav.speed = nav.gpsSpeed;
  }
  const tunnel = inTunnelAt(nav.progress);
  if (tunnel !== nav.inTunnel) { nav.inTunnel = tunnel; applyTheme(); }
  const pos = locateAt(nav.progress);
  const brg = nav.progress >= r.total - 2 ? nav.bearing : bearingOf(pos, locateAt(nav.progress + 35));
  nav.bearing = (nav.bearing + (((brg - nav.bearing + 540) % 360) - 180) * Math.min(1, dt * 3) + 360) % 360;
  nav.marker.setLngLat(nav.mode === 'gps' && nav.offCount > 0 && nav.raw ? [nav.raw.lon, nav.raw.lat] : [pos.lng, pos.lat]);
  if (nav.follow) {
    nav.marker.setRotation(0);
    map.jumpTo({ center: [pos.lng, pos.lat], bearing: nav.bearing, pitch: NAV_PITCH, zoom: navZoom(nav.speed), padding: navPadding() });
  } else nav.marker.setRotation(nav.bearing);
  if (ts - nav.lastUi > 150) { nav.lastUi = ts; updateNavUI(); }
  if (ts - nav.lastDone > 900) {
    nav.lastDone = ts;
    const done = r.coords.slice(0, pos.idx + 1); done.push(pos.arr);
    if (map.getSource('route-done')) map.getSource('route-done').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: done }, properties: {} });
  }
  checkArrival();
  if (state.nav === nav) nav.raf = requestAnimationFrame(tick);
}
function updateNavUI() {
  const nav = state.nav, r = state.route;
  if (!nav || !r) return;
  const p = nav.progress, mi = nextManeuverIndex(p), m = r.mans[mi], d = Math.max(0, m.along - p);
  $('#nav-dist').textContent = fmtDist(d);
  $('#nav-instr').textContent = displayText(m);
  $('#nav-icon').textContent = manIcon(m.type);
  const n2 = r.mans[mi + 1], then = $('#nav-then');
  if (n2 && n2.along - m.along < 300 && ![4, 5, 6].includes(m.type)) { then.classList.remove('hidden'); then.innerHTML = `${t('then')} ${ms(manIcon(n2.type))}`; }
  else then.classList.add('hidden');
  runVoiceCues(p);
  // bottom sheet
  const e = state.energy;
  // driving time and charging time are shown separately; the arrival clock includes both
  const driveS = Math.max(0, r.timeS - timeAt(p));
  const chargeS = e ? e.charges.filter((c) => c.km * 1000 > p + 20).reduce((s, c) => s + c.hours * 3600, 0) : 0;
  const remS = driveS + chargeS;
  $('#nb-time').textContent = fmtDur(driveS);
  const nbc = $('#nb-charge');
  if (chargeS > 60) { nbc.innerHTML = chargePlusInner(chargeS); nbc.classList.remove('hidden'); }
  else nbc.classList.add('hidden');
  $('#nb-km').textContent = fmtDist(Math.max(0, r.total - p));
  $('#nb-eta').textContent = fmtClock(new Date(Date.now() + remS * 1000));
  const lvl = Math.max(0, Math.round(levelAt(p / 1000)));
  const en = $('#nb-energy');
  en.textContent = `${isEV() ? '⚡' : '⛽'} ${lvl}%`;
  en.className = lvl < 10 ? 'crit' : lvl < 25 ? 'low' : '';
  $('#nb-fill').style.width = (p / r.total * 100).toFixed(2) + '%';
  // speed + road limit
  const kmh = Math.round(nav.speed * 3.6), road = limitAt(p), allowed = road ? Math.min(road, S.topSpeed) : S.topSpeed;
  $('#sp-speed').textContent = kmh;
  const sign = $('#sp-limit');
  if (road) { sign.textContent = road; sign.classList.remove('hidden'); } else sign.classList.add('hidden');
  $('#sp-max').textContent = `max ${allowed}`;
  $('#speed').classList.toggle('over', kmh > allowed + 3);
}
function checkArrival() {
  const nav = state.nav, r = state.route;
  if (!nav || nav.charging) return;
  const k = nav.nextWp;
  if (k > r.legs.length || nav.progress < r.legs[k - 1].endM - 12) return;
  nav.nextWp++;
  if (k === r.wps.length - 1) { finishNavigation(); return; }
  const ch = state.energy && state.energy.charges.find((c) => c.wpIndex === k);
  // (the arrival sentence for the stop is part of the announcement plan)
  if (ch) {
    if (nav.mode === 'sim') showChargeOverlay(ch);
    else toast(isEV() ? t('chargeToast', { f: Math.round(ch.from), t: Math.round(ch.to), d: fmtDur(ch.hours * 3600) }) : t('refuelToast', { f: Math.round(ch.from), t: Math.round(ch.to) }), 7000);
  } else toast(t('reachedStop', { k, n: esc(r.wps[k].label) }));
}
function showChargeOverlay(ch) {
  const nav = state.nav;
  nav.charging = true;
  const ov = document.createElement('div');
  ov.className = 'charge-overlay';
  ov.innerHTML = `<div class="charge-card">${ms(isEV() ? 'ev_station' : 'local_gas_station')}<b id="cc-pct">${Math.round(ch.from)}%</b><span>${t(isEV() ? 'chargingAt' : 'refuelAt', { n: esc(ch.wp.label) })}<br>${isEV() ? t('realTime', { d: fmtDur(ch.hours * 3600) }) : t('quickStop')}</span><div class="cc-bar"><div id="cc-fill"></div></div></div>`;
  document.body.appendChild(ov);
  const t0 = performance.now();
  const step = (now) => {
    const f = clamp((now - t0) / 2500, 0, 1), v = ch.from + (ch.to - ch.from) * f;
    ov.querySelector('#cc-pct').textContent = Math.round(v) + '%';
    ov.querySelector('#cc-fill').style.width = v + '%';
    if (f < 1 && state.nav === nav) requestAnimationFrame(step); else { ov.remove(); nav.charging = false; }
  };
  requestAnimationFrame(step);
}
function finishNavigation() {
  const nav = state.nav, r = state.route, e = state.energy;
  const elapsed = nav.mode === 'sim' ? r.timeS : (Date.now() - nav.startTime) / 1000;
  // ("Sie haben Ihr Ziel erreicht" is spoken by the announcement plan)
  const dest = r.wps[r.wps.length - 1];
  stopNavigation(false);
  openDialog(`<div class="arrive">${ms('sports_score')}<h2>${t('arrived')}</h2><p class="lead">${esc(dest.kind === 'gps' ? t('myLocLabel') : dest.label)}</p></div>
    <div class="stats"><div class="stat"><b>${fmtKm(r.total / 1000)} km</b><span>${t('distance')}</span></div><div class="stat"><b>${fmtDur(elapsed)}</b><span>${t(nav.mode === 'sim' ? 'driveTime' : 'tripTime')}</span></div><div class="stat"><b>${e ? nf(e.used, 1) + ' ' + unit() : '–'}</b><span>${e ? money(e.cost) : ''}</span></div></div>
    <div class="dialog-actions"><button class="btn filled" data-close>${t('done')}</button></div>`);
}
function stopNavigation(refit = true) {
  const nav = state.nav;
  if (!nav) return;
  cancelAnimationFrame(nav.raf);
  if (nav.watch) nav.watch.clear();
  keepAwake(false);
  if (refit) stopSpeaking();
  if (nav.marker) nav.marker.remove();
  $$('.charge-overlay').forEach((o) => o.remove());
  state.nav = null;
  setStationsVisible(true);
  if (state.styleReady) set3D(true);
  if (nav.inTunnel) applyTheme();
  document.body.classList.remove('navigating');
  $('#nav').classList.add('hidden');
  if (map.getSource('route-done')) map.getSource('route-done').setData({ type: 'FeatureCollection', features: [] });
  updateMarkers();
  map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 });
  setTimeout(() => { map.resize(); computeRoute({ fit: refit, quiet: true }); }, 250);
  if (!refit) map.easeTo({ pitch: S.threeD ? 45 : 0, duration: 600 });
}

/* =========================================================
   DIALOGS & MENU
   ========================================================= */
function openDialog(html) {
  $('#modal').innerHTML = html;
  $('#modal-backdrop').classList.remove('hidden');
  $$('[data-close]', $('#modal')).forEach((b) => { b.onclick = closeDialog; });
}
function closeDialog() { $('#modal-backdrop').classList.add('hidden'); }
$('#modal-backdrop').addEventListener('mousedown', (e) => { if (e.target.id === 'modal-backdrop') closeDialog(); });
function openVehicleSettings() {
  closeDrawer();
  const ev = isEV();
  const num = (id, label, val, step, hint = '') => `<div class="field"><label for="f-${id}">${label}</label><input type="number" id="f-${id}" value="${val}" step="${step}" min="0" />${hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
  const p = PRESETS.find((x) => x.id === S.presetId);
  openDialog(`<h2>${t('settingsH')}</h2><p class="lead">${esc(p ? presetName(p) : '')} — ${t('settingsLead')}</p>
    <div class="form-grid">
      ${ev ? num('capacity', t('capacity'), S.capacity, 0.1) + num('rangeKm', t('rangeFull'), S.rangeKm, 1, t('rangeHint')) + num('chargeKw', t('chargeKw'), S.chargeKw, 0.1, 'Schuko ≈ 1,8–2,3 kW') + num('chargeTarget', t('chargeTo'), S.chargeTarget, 5)
          + `<div class="field" style="grid-column:1/-1"><label>${t('chargeModeLabel')}</label><select id="f-chargeMode"><option value="needed">${t('chargeNeeded')}</option><option value="full">${t('chargeFull')}</option></select></div>`
        : num('tank', t('tank'), S.tank, 0.5) + num('consumption', t('consumption'), S.consumption, 0.1) + `<div class="field"><label>${t('fuelType')}</label><select id="f-fuelKind"><option value="diesel">Diesel</option><option value="petrol">${t('petrol')}</option></select></div>`}
      ${num('reserve', t('reserve'), S.reserve, 1, t('reserveHint'))}
      <div class="form-sec">${t('costs')}</div>
      ${ev ? num('priceKwh', t('priceKwh'), S.priceKwh, 0.01) : num('priceFuel', t('priceFuel'), S.priceFuel, 0.01)}
    </div>
    <div class="dialog-actions"><button class="btn" data-close>${t('cancel')}</button><button class="btn filled" id="f-save">${t('save')}</button></div>`);
  const fk = $('#f-fuelKind'); if (fk) fk.value = S.fuelKind;
  const cm = $('#f-chargeMode'); if (cm) cm.value = S.chargeMode === 'full' ? 'full' : 'needed';
  $('#f-save').onclick = () => {
    if (cm) S.chargeMode = cm.value;
    for (const k of ['capacity', 'rangeKm', 'chargeKw', 'chargeTarget', 'tank', 'consumption', 'reserve', 'priceKwh', 'priceFuel']) {
      const el = $('#f-' + k); if (!el) continue;
      const v = parseFloat(el.value); if (!Number.isNaN(v) && v > 0) S[k] = v;
    }
    S.chargeTarget = clamp(S.chargeTarget, 10, 100); S.reserve = clamp(S.reserve, 0, 50);
    if (fk) S.fuelKind = fk.value;
    closeDialog(); onVehicleChanged(); updateStationControls(); toast(t('saved'));
  };
}
function openDrawer() { $('#drawer').classList.add('open'); $('#scrim').classList.remove('hidden'); }
function closeDrawer() { $('#drawer').classList.remove('open'); $('#scrim').classList.add('hidden'); }
function setThemeMode(mode) { S.themeMode = mode; saveSettings(); renderThemeMenu(); applyTheme(); }

/* =========================================================
   WIRING
   ========================================================= */
function init() {
  applyStaticText();
  document.body.classList.toggle('dark', S.theme === 'dark');
  renderVehicle(); renderWaypoints(); updateStationControls(); renderStationList();
  $$('#pref-chips .chip').forEach((c) => c.classList.toggle('on', c.dataset.pref === S.routePref));
  $$('#speed-seg button').forEach((b) => b.classList.toggle('on', +b.dataset.speed === S.topSpeed));
  $('#opt-hills').checked = S.avoidHills; $('#opt-ferries').checked = S.avoidFerries;
  $('#ctrl-3d').classList.toggle('on', S.threeD);
  $('#m-voice-switch').classList.toggle('on', S.voice);
  if (!HAS_GPS) $('#ctrl-locate').classList.add('hidden');

  // header & vehicle
  $('#btn-menu').onclick = openDrawer;
  $('#scrim').onclick = closeDrawer;
  $$('#type-tabs button').forEach((b) => { b.onclick = () => { if (S.type === b.dataset.type) return; applyPreset(PRESETS.find((p) => p.type === b.dataset.type).id); onVehicleChanged({ typeChanged: true }); }; });
  $('#vehicle-toggle').onclick = () => { const open = $('#vehicle-edit').classList.toggle('hidden'); $('#vehicle').classList.toggle('open', !open); };
  $('#vehicle-preset').onchange = (e) => { const prev = S.type; applyPreset(e.target.value); onVehicleChanged({ typeChanged: prev !== S.type }); };
  const lvlCommit = debounce(() => { saveSettings(); refreshEnergy(); renderRange(); }, 120);
  $('#level-slider').oninput = (e) => { S.level = +e.target.value; updateLevelUI(); lvlCommit(); };
  $('#btn-vehicle-settings').onclick = openVehicleSettings;

  // route planning
  $('#btn-add-stop').onclick = () => addStop();
  $('#btn-swap').onclick = () => { state.wps.reverse(); renderWaypoints(); updateMarkers(); saveWps(); computeRoute({ fit: false }); };
  $('#btn-options').onclick = () => { const hid = $('#options').classList.toggle('hidden'); $('#options-caret').textContent = hid ? 'expand_more' : 'expand_less'; };
  const changed = () => { saveSettings(); computeRoute({ fit: false, announce: true }); };
  $$('#pref-chips .chip').forEach((c) => { c.onclick = () => { S.routePref = c.dataset.pref; $$('#pref-chips .chip').forEach((x) => x.classList.toggle('on', x === c)); changed(); }; });
  $('#opt-hills').onchange = (e) => { S.avoidHills = e.target.checked; changed(); };
  $('#opt-ferries').onchange = (e) => { S.avoidFerries = e.target.checked; changed(); };
  $$('#speed-seg button').forEach((b) => { b.onclick = () => { S.topSpeed = +b.dataset.speed; $$('#speed-seg button').forEach((x) => x.classList.toggle('on', x === b)); changed(); }; });

  // stations
  $$('#station-tabs button').forEach((b) => { b.onclick = () => { state.stationTab = b.dataset.tab; state.shown = 25; updateStationControls(); computeSuggestion(); renderStationList(); renderStationLayer(); }; });
  $('#corridor').onchange = (e) => { S.corridor = +e.target.value; saveSettings(); loadStations(); };
  $('#compat-chip').onclick = () => { S.compatOnly = !S.compatOnly; saveSettings(); updateStationControls(); computeSuggestion(); renderStationList(); renderStationLayer(); };

  // drawer
  $('#m-theme').onclick = () => setThemeMode({ auto: 'light', light: 'dark', dark: 'auto' }[S.themeMode]);
  $('#m-saver').onclick = () => { S.batterySaver = !S.batterySaver; saveSettings(); renderThemeMenu(); };
  $('#m-voicepick').onclick = async () => {
    unlockAudio();
    const opts = [...(NEURAL_VOICES[L()] || []).map((v) => v.id), 'system'];
    const cur = neuralVoiceId() || 'system';
    const nextId = opts[(opts.indexOf(cur) + 1) % opts.length];
    if (L() === 'de') S.voiceDe = nextId; else S.voiceEn = nextId;
    saveSettings(); renderThemeMenu();
    stopSpeaking();
    if (nextId !== 'system') await loadNeuralVoice();
    say(L() === 'de' ? 'In 200 Metern, rechts abbiegen in die Hauptstraße. Danach links abbiegen.' : 'In 200 meters, turn right onto Main Street. Then turn left.');
  };
  $('#m-preview').onclick = () => { S.previewEnabled = !S.previewEnabled; saveSettings(); renderThemeMenu(); renderResults(); };
  $('#stations-toggle').onclick = () => { S.stationsOpen = !S.stationsOpen; saveSettings(); renderStationList(); };
  $('#m-lang').onclick = () => setLanguage(L() === 'de' ? 'en-US' : 'de-DE');
  $('#m-voice').onclick = () => { S.voice = !S.voice; saveSettings(); $('#m-voice-switch').classList.toggle('on', S.voice); };
  $('#m-range').onclick = () => { S.showRange = !S.showRange; saveSettings(); renderRange(); };
  $('#m-vehicle').onclick = openVehicleSettings;

  // map controls
  // phone: drag the sheet handle (or tap it) between peek / half / full
  setSheet('half');
  addEventListener('resize', debounce(() => setSheet(sheetSnap), 150));
  $('#sheet-handle').addEventListener('pointerdown', (e) => {
    if (!narrow()) return;
    e.preventDefault();
    const panel = $('#panel'), y0 = e.clientY, h0 = panel.getBoundingClientRect().height;
    let moved = false;
    panel.classList.add('dragging');
    const mv = (ev) => {
      if (Math.abs(ev.clientY - y0) > 4) moved = true;
      document.documentElement.style.setProperty('--sheet-h', `${clamp(h0 + (y0 - ev.clientY), 110, innerHeight - 30)}px`);
    };
    const up = () => {
      removeEventListener('pointermove', mv); removeEventListener('pointerup', up);
      panel.classList.remove('dragging');
      if (!moved) { setSheet(sheetSnap === 'full' ? 'half' : sheetSnap === 'half' ? 'full' : 'half'); return; }
      const h = panel.getBoundingClientRect().height, hs = sheetHeights();
      setSheet(Object.keys(hs).sort((a, b) => Math.abs(hs[a] - h) - Math.abs(hs[b] - h))[0]);
    };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  });
  map.on('dragstart', () => { if (narrow() && !state.nav && sheetSnap === 'full') setSheet('half'); });

  $('#collapse-tab').onclick = () => { document.body.classList.toggle('collapsed'); setTimeout(() => map.resize(), 220); };
  $('#ctrl-zoom-in').onclick = () => map.zoomIn();
  $('#ctrl-zoom-out').onclick = () => map.zoomOut();
  $('#ctrl-compass').onclick = () => map.easeTo({ bearing: 0, pitch: S.threeD ? 45 : 0, duration: 500 });
  $('#ctrl-3d').onclick = () => { S.threeD = !S.threeD; saveSettings(); $('#ctrl-3d').classList.toggle('on', S.threeD); map.easeTo({ pitch: S.threeD ? 50 : 0, duration: 700 }); };
  $('#ctrl-theme').onclick = () => setThemeMode(S.theme === 'dark' ? 'light' : 'dark');
  $('#ctrl-locate').onclick = () => useMyLocation(null);
  map.on('rotate', () => { $('#compass-ico').style.transform = `rotate(${-map.getBearing()}deg)`; });

  const pill = $('#btn-search-area');
  map.on('moveend', () => { pill.classList.toggle('hidden', !!state.nav || !!state.route || map.getZoom() < 10); });
  pill.onclick = () => { pill.classList.add('hidden'); loadStations({ mode: 'area' }); };

  map.on('click', (e) => {
    if (state.nav) return;
    const layers = ['stations-pt', 'stations-cluster', 'route-alt'].filter((l) => map.getLayer(l));
    const f = map.queryRenderedFeatures(e.point, { layers });
    if (f.length) return;
    openPinPopup(e.lngLat);
  });
  map.on('click', 'route-alt', (e) => { if (!state.nav) selectRoute(e.features[0].properties.i); });
  map.on('click', 'stations-pt', (e) => { const s = findStation(e.features[0].properties.id); if (s) openStationPopup(s); });
  map.on('click', 'stations-cluster', async (e) => {
    const f = e.features[0];
    try { const z = await map.getSource('stations').getClusterExpansionZoom(f.properties.cluster_id); map.easeTo({ center: f.geometry.coordinates, zoom: z + 0.5 }); }
    catch { map.easeTo({ center: f.geometry.coordinates, zoom: map.getZoom() + 2 }); }
  });
  for (const l of ['stations-pt', 'stations-cluster', 'route-alt']) {
    map.on('mouseenter', l, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', l, () => { map.getCanvas().style.cursor = ''; });
  }

  // navigation controls
  const unfollow = () => { if (state.nav && state.nav.follow) { state.nav.follow = false; $('#nav-recenter').classList.remove('hidden'); } };
  map.on('dragstart', unfollow); map.on('wheel', unfollow);
  $('#nav-recenter').onclick = () => { if (state.nav) { state.nav.follow = true; $('#nav-recenter').classList.add('hidden'); } };
  $('#nav-overview').onclick = () => {
    if (!state.nav) return;
    unfollow();
    const rest = state.route.coords.slice(locateAt(state.nav.progress).idx);
    if (rest.length > 1) { const b = new maplibregl.LngLatBounds(rest[0], rest[0]); rest.forEach((c) => b.extend(c)); map.fitBounds(b, { padding: { top: 200, bottom: 140, left: 120, right: 120 }, pitch: 0, bearing: 0, duration: 900 }); }
  };
  $('#nav-mute').onclick = () => { S.voice = !S.voice; saveSettings(); $('#nav-mute-ico').textContent = S.voice ? 'volume_up' : 'volume_off'; $('#m-voice-switch').classList.toggle('on', S.voice); if (!S.voice) stopSpeaking(); };
  $('#nav-end').onclick = () => stopNavigation(true);
  $$('#sim-bar [data-sim]').forEach((b) => { b.onclick = () => { if (!state.nav) return; state.nav.mult = S.simMult = +b.dataset.sim; saveSettings(); $$('#sim-bar [data-sim]').forEach((x) => x.classList.toggle('on', x === b)); }; });
  $('#sim-pause').onclick = () => { if (!state.nav) return; state.nav.paused = !state.nav.paused; $('#sim-pause').innerHTML = ms(state.nav.paused ? 'play_arrow' : 'pause'); };

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeDialog(); closeDrawer(); } });
  addEventListener('resize', debounce(drawEnergyChart, 150));

  firstReady = () => {
    if (S.threeD) map.setPitch(50);
    updateMarkers();
    if (state.wps[0].lat != null && state.wps[state.wps.length - 1].lat != null) computeRoute();
    else if (HAS_GPS) useMyLocation(state.wps[0]);
  };
  renderThemeMenu();
  updateNight();
  S.theme = effectiveTheme();
  loadTheme(S.theme);
  // automatic mode: switch to dark after sunset and back after sunrise
  setInterval(() => { if (document.hidden) return; updateNight(); if (S.themeMode === 'auto' && !(state.nav && state.nav.inTunnel)) applyTheme(); }, 60000);
  loadData().then(() => { if (state.route) loadStations(); });
}

init();
// web/iPhone version: offline cache (not used by the PC program or the Android app, which load local files)
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost') &&!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
window.NAV45 = { state, S, map, DATA, voice: { alertSentence, nowSentence, followSentence, displayText, buildCues, log: voiceLog, ready: neuralReady, load: loadNeuralVoice, inWorker: () => !!(NV.session && NV.session.worker) } };
})();
