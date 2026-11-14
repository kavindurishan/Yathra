/**
 * Authentic Sri Lankan National Transit Bus Routes & Waypoints Dataset
 * Features exact Colombo - Kandy (A1 / Route 01) stops, Galle Coastal (Route 02),
 * Southern Expressway (Route EX-01), Central Expressway (Route EX-04),
 * Northern Direct (Route 87), and Highland Mountain Line (Route 99).
 */

export const SRI_LANKA_BUS_ROUTES = {
  'colombo-kandy': {
    id: 'colombo-kandy',
    routeNumber: 'Route 01 / 01 EX',
    name: 'Colombo Central (Pettah/Fort) ⇄ Kandy Goods Shed',
    nameSi: 'කොළඹ (පිටකොටුව/කොටුව) ⇄ මහනුවර (ගුඩ්ස් ෂෙඩ්)',
    corridor: 'A1 Highway (Kandy Road) Transit Corridor',
    highway: 'A1 Highway (Colombo - Kandy Main Road)',
    distance: '115 km',
    duration: '3h 30m',
    defaultFrom: 'Colombo',
    defaultTo: 'Kandy',
    origin: 'Colombo Central Bus Stand (Pettah) / Colombo Fort',
    originTerminal: 'Colombo Central Bus Stand (Pettah) / Colombo Fort (Goods Shed Bus Stand)',
    destination: 'Kandy Goods Shed Bus Stand / Kandy Central Bus Stand',
    destinationTerminal: 'Kandy Goods Shed Bus Stand (Opposite Kandy Railway Station)',
    // Exact stops from user reference
    stops: [
      { name: 'Colombo Central Bus Stand (Pettah)', nameSi: 'කොළඹ මධ්‍යම බස් නැවතුම්පොළ (පිටකොටුව)', km: 0, time: '00m', type: 'terminal', desc: 'Main National Central Terminal & Fort Goods Shed' },
      { name: 'Peliyagoda', nameSi: 'පෑලියගොඩ', km: 8, time: '15m', type: 'stop', desc: 'Kelani River Bridge & A1 Gateway' },
      { name: 'Kiribathgoda', nameSi: 'කිරිබත්ගොඩ', km: 12, time: '22m', type: 'stop', desc: 'Commercial transit hub & flyover' },
      { name: 'Kadawatha', nameSi: 'කඩවත', km: 16, time: '30m', type: 'interchange', desc: 'Expressway Interchange & City Bus Stand' },
      { name: 'Belummahara', nameSi: 'බෙලූම්මහර', km: 23, time: '42m', type: 'stop', desc: 'Gampaha Junction connection' },
      { name: 'Miriswaththa', nameSi: 'මිරිස්වත්ත', km: 28, time: '50m', type: 'stop', desc: 'Wathupitiwala / Yakkala junction' },
      { name: 'Yakkala', nameSi: 'යක්කල', km: 32, time: '58m', type: 'stop', desc: 'Ayurveda campus & transit halt' },
      { name: 'Nittambuwa', nameSi: 'නිට්ටඹුව', km: 40, time: '1h 12m', type: 'transit_hub', desc: 'Major passenger hub & Tipline rest area' },
      { name: 'Warakapola', nameSi: 'වරකාපොල', km: 56, time: '1h 45m', type: 'transit_hub', desc: 'Sabaragamuwa border & express refreshment hub' },
      { name: 'Nelundeniya', nameSi: 'නෙළුන්දෙණිය', km: 64, time: '2h 00m', type: 'stop', desc: 'Alawwa / Kegalle highway bypass' },
      { name: 'Kegalle', nameSi: 'කෑගල්ල', km: 78, time: '2h 25m', type: 'transit_hub', desc: 'Kegalle Main Bus Stand (Town Center)' },
      { name: 'Mawanella', nameSi: 'මාවනැල්ල', km: 90, time: '2h 50m', type: 'stop', desc: 'Mawanella Bridge & Kadugannawa Pass foot' },
      { name: 'Peradeniya', nameSi: 'පේරාදෙණිය', km: 109, time: '3h 20m', type: 'junction', desc: 'Royal Botanical Gardens & University Junction' },
      { name: 'Kandy Goods Shed Bus Stand', nameSi: 'මහනුවර ගුඩ්ස් ෂෙඩ් බස් නැවතුම්පොළ', km: 115, time: '3h 30m', type: 'terminal', desc: 'Central Kandy Terminus (Goods Shed Bus Stand)' }
    ]
  },
  'panadura-kandy': {
    id: 'panadura-kandy',
    routeNumber: 'Route 17',
    name: 'Panadura Central ⇄ Kandy Goods Shed',
    nameSi: 'පානදුර මධ්‍යම ⇄ මහනුවර (ගුඩ්ස් ෂෙඩ්)',
    corridor: 'Route 17 Inter-Provincial Outer Bypass & A1 Kandy Highway',
    highway: 'Route 17 Suburban Bypass & A1 Highway',
    distance: '135 km',
    duration: '4h 15m',
    defaultFrom: 'Panadura',
    defaultTo: 'Kandy',
    origin: 'Panadura Central Bus Stand',
    originTerminal: 'Panadura Central Bus Stand (Galle Road)',
    destination: 'Kandy Goods Shed Bus Stand / Central Bus Stand',
    destinationTerminal: 'Kandy Goods Shed Bus Stand (Opposite Kandy Railway Station)',
    keyWaypoints: ['Nugegoda', 'Battaramulla', 'Malabe', 'Kaduwela', 'Weliweriya', 'Belummahara', 'Kegalle'],
    // Exact 25 stops from user reference image
    stops: [
      { name: 'Panadura', nameSi: 'පානදුර මධ්‍යම බස් නැවතුම්පොළ', km: 0, time: '00m', type: 'terminal', desc: 'Southern coastal starting terminus' },
      { name: 'Moratuwa', nameSi: 'මොරටුව', km: 8, time: '15m', type: 'stop', desc: 'Moratuwa town center & bridge' },
      { name: 'Ratmalana', nameSi: 'රත්මලාන', km: 12, time: '22m', type: 'stop', desc: 'Ratmalana airport junction' },
      { name: 'Dehiwala', nameSi: 'දෙහිවල', km: 15, time: '28m', type: 'stop', desc: 'Dehiwala junction & William Mills road' },
      { name: 'Kalubowila', nameSi: 'කළුබෝවිල', km: 17, time: '32m', type: 'stop', desc: 'Colombo South Teaching Hospital junction' },
      { name: 'Kohuwala', nameSi: 'කොහුවල', km: 19, time: '36m', type: 'stop', desc: 'Kohuwala 4-way intersection' },
      { name: 'Nugegoda', nameSi: 'නුගේගොඩ', km: 21, time: '40m', type: 'transit_hub', desc: 'Nugegoda Supermarket & flyover intersection' },
      { name: 'Pitakotte / Kotte', nameSi: 'පිටකෝට්ටේ', km: 24, time: '46m', type: 'stop', desc: 'Ancient Capital & Parliament approach' },
      { name: 'Battaramulla', nameSi: 'බත්තරමුල්ල', km: 27, time: '52m', type: 'transit_hub', desc: 'Sethsiripaya & Pelawatta junction' },
      { name: 'Malabe', nameSi: 'මාලඹේ (SLIIT / CINEC ආසන්නව)', km: 31, time: '1h 00m', type: 'transit_hub', desc: 'IT & Higher Education Hub near SLIIT / CINEC' },
      { name: 'Kaduwela', nameSi: 'කඩුවෙල', km: 36, time: '1h 10m', type: 'interchange', desc: 'Kelani river crossing & highway interchange' },
      { name: 'Biyagama', nameSi: 'බියගම', km: 41, time: '1h 20m', type: 'stop', desc: 'Export processing zone access' },
      { name: 'Delgoda', nameSi: 'දෙල්ගොඩ', km: 47, time: '1h 32m', type: 'stop', desc: 'Siyane Korale transit stop' },
      { name: 'Weliweriya', nameSi: 'වැලිවේරිය', km: 53, time: '1h 45m', type: 'stop', desc: 'Weliweriya town center' },
      { name: 'Belummahara', nameSi: 'බෙලූම්මහර', km: 58, time: '1h 55m', type: 'junction', desc: 'Intersection joining the main A1 Kandy Road' },
      { name: 'Yakkala', nameSi: 'යක්කල', km: 62, time: '2h 02m', type: 'stop', desc: 'A1 Highway transition halt' },
      { name: 'Nittambuwa (Pasyala)', nameSi: 'නිට්ටඹුව (පස්යාල)', km: 70, time: '2h 15m', type: 'transit_hub', desc: 'Major passenger hub & rest point' },
      { name: 'Warakapola', nameSi: 'වරකාපොල', km: 86, time: '2h 45m', type: 'transit_hub', desc: 'Mid-journey refreshment terminal' },
      { name: 'Ambepussa', nameSi: 'අඹේපුස්ස', km: 90, time: '2h 55m', type: 'stop', desc: 'Historic rest house & railway junction' },
      { name: 'Galigamuwa', nameSi: 'ගලිගමුව', km: 98, time: '3h 10m', type: 'stop', desc: 'Kegalle district entrance' },
      { name: 'Kegalle', nameSi: 'කෑගල්ල', km: 108, time: '3h 25m', type: 'transit_hub', desc: 'Kegalle Main Bus Stand' },
      { name: 'Mawanella', nameSi: 'මාවනැල්ල', km: 120, time: '3h 45m', type: 'stop', desc: 'Mawanella Bridge & Utuwankanda' },
      { name: 'Kadugannawa', nameSi: 'කඩුගන්නාව', km: 126, time: '3h 58m', type: 'junction', desc: 'Historic Kadugannawa Pass & Dawson Tower' },
      { name: 'Peradeniya', nameSi: 'පේරාදෙණිය', km: 130, time: '4h 05m', type: 'junction', desc: 'Peradeniya University & Botanical Gardens' },
      { name: 'Kandy', nameSi: 'මහනුවර ගුඩ්ස් ෂෙඩ් බස් නැවතුම්පොළ', km: 135, time: '4h 15m', type: 'terminal', desc: 'Central Kandy Goods Shed Bus Stand' }
    ]
  },
  'colombo-galle': {
    id: 'colombo-galle',
    routeNumber: 'Route 02',
    name: 'Colombo Fort ⇄ Galle Central Bus Stand',
    nameSi: 'කොළඹ කොටුව ⇄ ගාල්ල මධ්‍යම බස් නැවතුම්පොළ',
    corridor: 'Galle Road Coastal Line / A2 Highway',
    highway: 'A2 Galle Road Coastal Line',
    distance: '120 km',
    duration: '2h 30m',
    defaultFrom: 'Colombo',
    defaultTo: 'Galle',
    origin: 'Colombo Fort (Bastian Mawatha Bus Stand)',
    originTerminal: 'Bastian Mawatha Private Bus Terminal, Pettah',
    destination: 'Galle Central Bus Stand',
    destinationTerminal: 'Galle Central Bus Stand (Near Cricket Stadium)',
    stops: [
      { name: 'Colombo Fort (Bastian Mawatha)', nameSi: 'කොළඹ කොටුව (බැස්ටියන් මාවත)', km: 0, time: '00m', type: 'terminal', desc: 'Pettah Long Distance Terminal' },
      { name: 'Wellawatte', nameSi: 'වැල්ලවත්ත', km: 6, time: '12m', type: 'stop', desc: 'Marine Drive junction' },
      { name: 'Dehiwala', nameSi: 'දෙහිවල', km: 10, time: '18m', type: 'stop', desc: 'Dehiwala flyover & coastal stop' },
      { name: 'Mount Lavinia', nameSi: 'ගල්කිස්ස', km: 13, time: '24m', type: 'stop', desc: 'Mount Lavinia junction' },
      { name: 'Moratuwa', nameSi: 'මොරටුව', km: 20, time: '38m', type: 'stop', desc: 'Moratuwa town center' },
      { name: 'Panadura', nameSi: 'පානදුර', km: 28, time: '50m', type: 'transit_hub', desc: 'Panadura Main Bus Stand' },
      { name: 'Kalutara', nameSi: 'කළුතර', km: 43, time: '1h 12m', type: 'transit_hub', desc: 'Kalutara Bodhiya / South terminal' },
      { name: 'Beruwala', nameSi: 'බේරුවල', km: 55, time: '1h 28m', type: 'stop', desc: 'Fisheries harbour stop' },
      { name: 'Aluthgama', nameSi: 'අලුත්ගම', km: 60, time: '1h 35m', type: 'transit_hub', desc: 'Bentota river bridge bus stand' },
      { name: 'Ambalangoda', nameSi: 'අම්බලන්ගොඩ', km: 86, time: '2h 08m', type: 'transit_hub', desc: 'Ambalangoda Central Terminal' },
      { name: 'Hikkaduwa', nameSi: 'හික්කඩුව', km: 100, time: '2h 20m', type: 'stop', desc: 'Tourist coastal strip' },
      { name: 'Galle Central Bus Stand', nameSi: 'ගාල්ල මධ්‍යම බස් නැවතුම්පොළ', km: 120, time: '2h 30m', type: 'terminal', desc: 'Galle International Stadium & Fort Terminal' }
    ]
  },
  'makumbura-galle-e01': {
    id: 'makumbura-galle-e01',
    routeNumber: 'Route EX 01',
    name: 'Makumbura MMC (Kottawa) ⇄ Galle / Matara (E01)',
    nameSi: 'මාකුඹුර බහුවිධ මධ්‍යස්ථානය ⇄ ගාල්ල / මාතර (E01)',
    corridor: 'E01 Southern Expressway Direct Corridor',
    highway: 'E01 Southern Expressway',
    distance: '118 km',
    duration: '1h 20m',
    defaultFrom: 'Makumbura',
    defaultTo: 'Galle',
    origin: 'Makumbura Multimodal Center (MMC)',
    originTerminal: 'Makumbura Multimodal Transport Hub, Kottawa',
    destination: 'Galle Expressway Bus Terminal',
    destinationTerminal: 'Galle Central Bus Stand / Pinnaduwa',
    stops: [
      { name: 'Makumbura MMC (Kottawa)', nameSi: 'මාකුඹුර බහුවිධ මධ්‍යස්ථානය (කොට්ටාව)', km: 0, time: '00m', type: 'terminal', desc: 'Southern Expressway Central Hub' },
      { name: 'Kahathuduwa Interchange', nameSi: 'කහතුඩුව හුවමාරුව', km: 14, time: '10m', type: 'interchange', desc: 'Horana connection exit' },
      { name: 'Gelanigama Interchange', nameSi: 'ගෙලනිගම හුවමාරුව', km: 28, time: '20m', type: 'interchange', desc: 'Bandaragama exit' },
      { name: 'Welipenna Rest Area', nameSi: 'වැලිපැන්න සේවා පරිශ්‍රය', km: 56, time: '40m', type: 'transit_hub', desc: 'Expressway Restaurant & Fuel Zone' },
      { name: 'Kurundugahahetekma', nameSi: 'කුරුඳුගහහැතැක්ම හුවමාරුව', km: 78, time: '55m', type: 'interchange', desc: 'Elpitiya / Ambalangoda interchange' },
      { name: 'Pinnaduwa (Galle Exit)', nameSi: 'පින්නදූව (ගාල්ල පිටවීම)', km: 108, time: '1h 12m', type: 'interchange', desc: 'Galle expressway toll gate' },
      { name: 'Galle Central Bus Stand', nameSi: 'ගාල්ල මධ්‍යම බස් නැවතුම්පොළ', km: 118, time: '1h 20m', type: 'terminal', desc: 'Final Destination Terminal' }
    ]
  },
  'kadawatha-kandy-e04': {
    id: 'kadawatha-kandy-e04',
    routeNumber: 'Route EX 04',
    name: 'Kadawatha ⇄ Kandy (Central Expressway)',
    nameSi: 'කඩවත ⇄ මහනුවර (මධ්‍යම අධිවේගී මාර්ගය)',
    corridor: 'E04 Central Expressway / Kurunegala Corridor',
    highway: 'E04 Central Expressway & A10 Corridor',
    distance: '115 km',
    duration: '2h 15m',
    defaultFrom: 'Kadawatha',
    defaultTo: 'Kandy',
    origin: 'Kadawatha Expressway Bus Terminal',
    originTerminal: 'Kadawatha Expressway Interchange Bus Terminal',
    destination: 'Kandy Goods Shed Bus Stand',
    destinationTerminal: 'Kandy Goods Shed Bus Stand',
    stops: [
      { name: 'Kadawatha Expressway Terminal', nameSi: 'කඩවත අධිවේගී පර්යන්තය', km: 0, time: '00m', type: 'terminal', desc: 'Central Expressway Departure Bays' },
      { name: 'Mirigama Interchange', nameSi: 'මීරිගම හුවමාරුව', km: 38, time: '25m', type: 'interchange', desc: 'Expressway Section 1' },
      { name: 'Kurunegala Central Bus Stand', nameSi: 'කුරුණෑගල මධ්‍යම බස් නැවතුම්පොළ', km: 78, time: '1h 10m', type: 'transit_hub', desc: 'Wayamba Central Terminal' },
      { name: 'Katugastota', nameSi: 'කටුගස්තොට', km: 110, time: '2h 00m', type: 'junction', desc: 'Mahaweli bridge approach' },
      { name: 'Kandy Goods Shed Bus Stand', nameSi: 'මහනුවර ගුඩ්ස් ෂෙඩ් බස් නැවතුම්පොළ', km: 115, time: '2h 15m', type: 'terminal', desc: 'Central Kandy Hub' }
    ]
  },
  'colombo-jaffna': {
    id: 'colombo-jaffna',
    routeNumber: 'Route 87',
    name: 'Colombo Fort ⇄ Jaffna Central (A9 Direct)',
    nameSi: 'කොළඹ කොටුව ⇄ යාපනය මධ්‍යම බස් නැවතුම්පොළ',
    corridor: 'A9 Northern Highway Direct Corridor',
    highway: 'A9 Highway / Northern Direct Corridor',
    distance: '395 km',
    duration: '7h 30m',
    defaultFrom: 'Colombo',
    defaultTo: 'Jaffna',
    origin: 'Colombo Fort (Bastian Mawatha)',
    originTerminal: 'Colombo Fort Bastian Mawatha Bus Terminal',
    destination: 'Jaffna Central Bus Stand',
    destinationTerminal: 'Jaffna Central Bus Stand (Hospital Road)',
    stops: [
      { name: 'Colombo Fort (Bastian Mawatha)', nameSi: 'කොළඹ කොටුව (බැස්ටියන් මාවත)', km: 0, time: '00m', type: 'terminal', desc: 'Departure Bay 4' },
      { name: 'Kadawatha', nameSi: 'කඩවත', km: 16, time: '25m', type: 'stop', desc: 'Expressway interchange' },
      { name: 'Nittambuwa', nameSi: 'නිට්ටඹුව', km: 40, time: '55m', type: 'stop', desc: 'A1 connection' },
      { name: 'Kurunegala', nameSi: 'කුරුණෑගල', km: 95, time: '2h 10m', type: 'transit_hub', desc: 'Wayamba Terminal' },
      { name: 'Dambulla', nameSi: 'දඹුල්ල', km: 160, time: '3h 30m', type: 'transit_hub', desc: 'Cultural Triangle hub' },
      { name: 'Anuradhapura', nameSi: 'අනුරාධපුරය', km: 215, time: '4h 40m', type: 'transit_hub', desc: 'Ancient city central stand' },
      { name: 'Medawachchiya', nameSi: 'මැදවච්චිය', km: 245, time: '5h 15m', type: 'stop', desc: 'A9 railway junction' },
      { name: 'Vavuniya', nameSi: 'වවුනියාව', km: 275, time: '5h 45m', type: 'transit_hub', desc: 'Northern province border city' },
      { name: 'Kilinochchi', nameSi: 'කිලිනොච්චිය', km: 335, time: '6h 40m', type: 'stop', desc: 'Central town terminal' },
      { name: 'Jaffna Central Bus Stand', nameSi: 'යාපනය මධ්‍යම බස් නැවතුම්පොළ', km: 395, time: '7h 30m', type: 'terminal', desc: 'Final Northern Terminal' }
    ]
  },
  'colombo-badulla': {
    id: 'colombo-badulla',
    routeNumber: 'Route 99',
    name: 'Colombo Fort ⇄ Badulla Central (Highland Line)',
    nameSi: 'කොළඹ කොටුව ⇄ බදුල්ල මධ්‍යම බස් නැවතුම්පොළ',
    corridor: 'A4 Highland Scenic Mountain Route',
    highway: 'A4 Colombo - Batticaloa Highway & Highlands',
    distance: '230 km',
    duration: '6h 00m',
    defaultFrom: 'Colombo',
    defaultTo: 'Badulla',
    origin: 'Colombo Fort (Bastian Mawatha)',
    originTerminal: 'Colombo Fort Bastian Mawatha Bus Terminal',
    destination: 'Badulla Central Bus Stand',
    destinationTerminal: 'Badulla Central Bus Stand',
    stops: [
      { name: 'Colombo Fort (Bastian Mawatha)', nameSi: 'කොළඹ කොටුව (බැස්ටියන් මාවත)', km: 0, time: '00m', type: 'terminal', desc: 'Pettah departure' },
      { name: 'Avissawella', nameSi: 'අවිස්සාවේල්ල', km: 58, time: '1h 35m', type: 'transit_hub', desc: 'Kelani valley hub' },
      { name: 'Ratnapura', nameSi: 'රත්නපුරය', km: 100, time: '2h 40m', type: 'transit_hub', desc: 'City of Gems central terminal' },
      { name: 'Pelmadulla', nameSi: 'පැල්මඩුල්ල', km: 118, time: '3h 10m', type: 'stop', desc: 'Nonpareil highway fork' },
      { name: 'Balangoda', nameSi: 'බලන්ගොඩ', km: 142, time: '3h 50m', type: 'transit_hub', desc: 'Highland mountain ascent' },
      { name: 'Haputale', nameSi: 'හපුතලේ', km: 188, time: '5h 05m', type: 'stop', desc: 'Mountain pass & tea estates' },
      { name: 'Bandarawela', nameSi: 'බණ්ඩාරවෙල', km: 208, time: '5h 35m', type: 'transit_hub', desc: 'Hill country central stand' },
      { name: 'Badulla Central Bus Stand', nameSi: 'බදුල්ල මධ්‍යම බස් නැවතුම්පොළ', km: 230, time: '6h 00m', type: 'terminal', desc: 'Uva Province Central Terminus' }
    ]
  }
};

/**
 * Finds the closest matching Sri Lanka route based on from and to locations.
 */
export function findMatchingRoute(from, to) {
  const f = (from || '').toLowerCase().trim();
  const t = (to || '').toLowerCase().trim();

  if ((f.includes('panadura') && t.includes('kandy')) || (f.includes('kandy') && t.includes('panadura'))) {
    return SRI_LANKA_BUS_ROUTES['panadura-kandy'];
  }
  if ((f.includes('kandy') || t.includes('kandy')) && (f.includes('kadawatha') || t.includes('kadawatha'))) {
    return SRI_LANKA_BUS_ROUTES['kadawatha-kandy-e04'];
  }
  if (f.includes('kandy') || t.includes('kandy')) {
    return SRI_LANKA_BUS_ROUTES['colombo-kandy'];
  }
  if ((f.includes('makumbura') || f.includes('kottawa')) && (t.includes('galle') || t.includes('matara'))) {
    return SRI_LANKA_BUS_ROUTES['makumbura-galle-e01'];
  }
  if (f.includes('galle') || t.includes('galle') || f.includes('matara') || t.includes('matara')) {
    return SRI_LANKA_BUS_ROUTES['colombo-galle'];
  }
  if (f.includes('jaffna') || t.includes('jaffna')) {
    return SRI_LANKA_BUS_ROUTES['colombo-jaffna'];
  }
  if (f.includes('badulla') || t.includes('badulla')) {
    return SRI_LANKA_BUS_ROUTES['colombo-badulla'];
  }

  // Default fallback to Colombo-Kandy route (user's requested primary route)
  return SRI_LANKA_BUS_ROUTES['colombo-kandy'];
}

/**
 * Builds Google Maps Embed URL with full waypoint trail.
 * If inspectStop is specified, returns high-zoom pin to that specific bus stop.
 * mapType: 'm' (Normal) or 'k' (Satellite)
 */
export function buildGoogleMapsRouteUrl(route, inspectStop = null, mapType = 'm') {
  if (!route) route = SRI_LANKA_BUS_ROUTES['colombo-kandy'];

  const typeParam = mapType === 'k' ? '&t=k' : '&t=m';

  if (inspectStop) {
    const query = encodeURIComponent(`${inspectStop} Bus Stand, Sri Lanka`);
    return `https://maps.google.com/maps?q=${query}${typeParam}&z=15&output=embed`;
  }

  // Determine origin and destination accurately
  const originName = route.startingLocation || route.origin || (route.stops && route.stops[0]?.name) || 'Colombo';
  const destinationName = route.destination || (route.stops && route.stops[route.stops.length - 1]?.name) || 'Kandy';

  const startLoc = encodeURIComponent(`${originName}, Sri Lanka`);
  const finalLoc = encodeURIComponent(`${destinationName}, Sri Lanka`);

  // Choose intermediate waypoints to guide road polyline accurately
  let selectedWaypoints = [];
  if (route.keyWaypoints && route.keyWaypoints.length > 0) {
    selectedWaypoints = route.keyWaypoints;
  } else if (Array.isArray(route.stops) && route.stops.length > 0) {
    const isFirstStopOrigin = route.stops[0]?.name?.toLowerCase().includes(originName.toLowerCase());
    const isLastStopDest = route.stops[route.stops.length - 1]?.name?.toLowerCase().includes(destinationName.toLowerCase());
    const intermediateStops = route.stops.slice(isFirstStopOrigin ? 1 : 0, isLastStopDest ? -1 : undefined);

    if (intermediateStops.length > 0) {
      const step = Math.max(1, Math.floor(intermediateStops.length / 4));
      for (let i = 0; i < intermediateStops.length; i += step) {
        selectedWaypoints.push(intermediateStops[i].name);
      }
    }
  }

  const waypointsParam = selectedWaypoints.map(w => `to:${encodeURIComponent(w + ', Sri Lanka')}`).join('+');
  const daddr = waypointsParam ? `${waypointsParam}+to:${finalLoc}` : finalLoc;
  return `https://maps.google.com/maps?saddr=${startLoc}&daddr=${daddr}${typeParam}&output=embed`;
}

/**
 * Builds external Google Maps direction URL with all waypoints intact.
 */
export function buildExternalGoogleMapsUrl(route) {
  if (!route) route = SRI_LANKA_BUS_ROUTES['colombo-kandy'];
  const originName = route.startingLocation || route.origin || (route.stops && route.stops[0]?.name) || 'Colombo';
  const destinationName = route.destination || (route.stops && route.stops[route.stops.length - 1]?.name) || 'Kandy';

  const origin = encodeURIComponent(`${originName}, Sri Lanka`);
  const dest = encodeURIComponent(`${destinationName}, Sri Lanka`);

  let waypoints = '';
  if (Array.isArray(route.stops) && route.stops.length > 0) {
    const isFirstStopOrigin = route.stops[0]?.name?.toLowerCase().includes(originName.toLowerCase());
    const isLastStopDest = route.stops[route.stops.length - 1]?.name?.toLowerCase().includes(destinationName.toLowerCase());
    const intermediateStops = route.stops.slice(isFirstStopOrigin ? 1 : 0, isLastStopDest ? -1 : undefined);
    waypoints = intermediateStops.slice(0, 5).map(s => encodeURIComponent(`${s.name}, Sri Lanka`)).join('|');
  }

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}${waypoints ? `&waypoints=${waypoints}` : ''}&travelmode=transit`;
}
