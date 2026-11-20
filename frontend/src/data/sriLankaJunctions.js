// Verified Sri Lankan Junctions, Highway Exits & Bus Halts for SLIIT Shuttle Routes
export const SRI_LANKAN_WAYPOINT_PRESETS = [
  // Panadura - Moratuwa - Kotte - Malabe Corridor
  { name: 'Panadura Bus Stand', nameSi: 'පානදුර බස් නැවතුම', lat: 6.7132, lng: 79.9074, town: 'Panadura' },
  { name: 'Moratuwa Cross Junction', nameSi: 'මොරටුව හන්දිය', lat: 6.7730, lng: 79.8816, town: 'Moratuwa' },
  { name: 'Katubedda Junction', nameSi: 'කටුබැද්ද හන්දිය', lat: 6.7978, lng: 79.8892, town: 'Katubedda' },
  { name: 'Ratmalana Airport Road', nameSi: 'රත්මලාන ගුවන් තොටුපල පාර', lat: 6.8200, lng: 79.8800, town: 'Ratmalana' },
  { name: 'Dehiwala (William Junction)', nameSi: 'දෙහිවල (විලියම් හන්දිය)', lat: 6.8511, lng: 79.8659, town: 'Dehiwala' },
  { name: 'Kohuwala Junction', nameSi: 'කොහුවල හන්දිය', lat: 6.8600, lng: 79.8860, town: 'Kohuwala' },
  { name: 'Nugegoda Supermarket / Flyover', nameSi: 'නුගේගොඩ ගුවන් පාලම', lat: 6.8649, lng: 79.8997, town: 'Nugegoda' },
  { name: 'Pitakotte Junction', nameSi: 'පිටකෝට්ටේ හන්දිය', lat: 6.8900, lng: 79.9120, town: 'Pitakotte' },
  { name: 'Thalawathugoda Junction', nameSi: 'තලවතුගොඩ හන්දිය', lat: 6.8770, lng: 79.9320, town: 'Thalawathugoda' },
  { name: 'Hokandara Junction', nameSi: 'හෝකන්දර හන්දිය', lat: 6.8730, lng: 79.9540, town: 'Hokandara' },
  { name: 'Arangala Junction', nameSi: 'අරංගල හන්දිය', lat: 6.8870, lng: 79.9680, town: 'Arangala' },
  { name: 'Malabe Junction Clock Tower', nameSi: 'මාලඹේ ඔරලෝසු කණුව', lat: 6.9042, lng: 79.9547, town: 'Malabe' },
  { name: 'SLIIT Malabe Campus Main Entrance', nameSi: 'SLIIT මාලඹේ ප්‍රධාන පිවිසුම', lat: 6.9147, lng: 79.9729, town: 'Malabe' },

  // Negombo - Katunayake - Kelaniya - Kaduwela Corridor
  { name: 'Negombo Bus Stand', nameSi: 'මීගමුව බස් නැවතුම', lat: 7.2083, lng: 79.8358, town: 'Negombo' },
  { name: 'Koppara Junction', nameSi: 'කොප්පරා හන්දිය', lat: 7.1950, lng: 79.8480, town: 'Negombo' },
  { name: 'Katunayake 18th Mile Post', nameSi: 'කටුනායක 18 කණුව', lat: 7.1680, lng: 79.8760, town: 'Katunayake' },
  { name: 'Katunayake Highway Entrance', nameSi: 'කටුනායක අධිවේගී පිවිසුම', lat: 7.1550, lng: 79.8850, town: 'Katunayake' },
  { name: 'Peliyagoda / Thorana Junction', nameSi: 'තොරණ හන්දිය', lat: 6.9630, lng: 79.8890, town: 'Peliyagoda' },
  { name: 'Kelaniya Raja Maha Viharaya', nameSi: 'කැලණිය රජමහා විහාරය අසල', lat: 6.9530, lng: 79.9160, town: 'Kelaniya' },
  { name: 'Bandarawaththa Junction', nameSi: 'බණ්ඩාරවත්ත හන්දිය', lat: 6.9420, lng: 79.9320, town: 'Kelaniya' },
  { name: 'Kaduwela Interchange / Junction', nameSi: 'කඩුවෙල හන්දිය', lat: 6.9333, lng: 79.9833, town: 'Kaduwela' },

  // Minuwangoda - Ekala - Ja-Ela - Kaduwela Corridor
  { name: 'Minuwangoda Town Clock Tower', nameSi: 'මිනුවන්ගොඩ නගරය', lat: 7.1667, lng: 79.9500, town: 'Minuwangoda' },
  { name: 'Katugoda Junction', nameSi: 'කටුගොඩ හන්දිය', lat: 7.1510, lng: 79.9320, town: 'Katugoda' },
  { name: 'Ekala Industrial Zone', nameSi: 'ඒකල කාර්මික ජනපදය', lat: 7.1120, lng: 79.9120, town: 'Ekala' },
  { name: 'Ja-Ela Clock Tower', nameSi: 'ජා-ඇල ඔරලෝසු කණුව', lat: 7.0750, lng: 79.8920, town: 'Ja-Ela' },
  { name: 'Kandana Junction', nameSi: 'කඳාන හන්දිය', lat: 7.0460, lng: 79.8980, town: 'Kandana' },
  { name: 'Mahabage Junction', nameSi: 'මහාබාගේ හන්දිය', lat: 7.0180, lng: 79.8950, town: 'Mahabage' },
  { name: 'Kerawalapitiya E02 Interchange', nameSi: 'කෙරවලපිටිය අධිවේගී හුවමාරුව', lat: 7.0010, lng: 79.8910, town: 'Kerawalapitiya' },

  // Ganemulla - Ragama - Kadawatha Corridor
  { name: 'Ganemulla Railway Station Road', nameSi: 'ගණේමුල්ල දුම්රියපල පාර', lat: 7.0650, lng: 79.9600, town: 'Ganemulla' },
  { name: 'Batuwatta Railway Crossing', nameSi: 'බටුවත්ත දුම්රිය හරස් පාර', lat: 7.0420, lng: 79.9450, town: 'Batuwatta' },
  { name: 'Ragama Teaching Hospital Junction', nameSi: 'රාගම රෝහල හන්දිය', lat: 7.0270, lng: 79.9210, town: 'Ragama' },
  { name: 'Kadawatha Highway Entrance', nameSi: 'කඩවත අධිවේගී පිවිසුම', lat: 7.0017, lng: 79.9536, town: 'Kadawatha' },
  { name: 'Kiribathgoda Town', nameSi: 'කිරිබත්ගොඩ නගරය', lat: 6.9800, lng: 79.9300, town: 'Kiribathgoda' },
  { name: 'Athurugiriya Interchange', nameSi: 'අතුරුගිරිය අධිවේගී හුවමාරුව', lat: 6.8700, lng: 79.9900, town: 'Athurugiriya' },
  { name: 'Kottawa Makumbura MMC Interchange', nameSi: 'මාකුඹුර බහුවිධ ප්‍රවාහන මධ්‍යස්ථානය', lat: 6.8400, lng: 79.9700, town: 'Kottawa' }
];
