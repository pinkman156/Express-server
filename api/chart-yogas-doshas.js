// Yogas and Doshas endpoint for identifying auspicious and inauspicious combinations
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configure middleware
app.use(cors());
app.use(express.json());

app.post('/api/chart/yogas-doshas', async (req, res) => {
  try {
    const { birthData, birthChartData } = req.body;
    
    if (!birthData || !birthChartData) {
      return res.status(400).json({ 
        error: true, 
        message: 'Missing required data (birthData, birthChartData)'
      });
    }
    
    // Extract planet and house data
    const planets = birthChartData.planets?.data?.planets || [];
    const houses = birthChartData.houses?.data?.houses || [];
    const ascendant = birthChartData.houses?.data?.ascendant?.longitude || 0;
    
    // Format planet data for easier processing
    const planetData = {};
    planets.forEach(planet => {
      planetData[planet.name] = {
        longitude: parseFloat(planet.longitude),
        sign: planet.sign,
        house: determineHouse(parseFloat(planet.longitude), houses, ascendant),
        isRetrograde: planet.is_retrograde === true
      };
    });
    
    // Format house data
    const houseData = {};
    houses.forEach(house => {
      houseData[house.number] = {
        sign: house.sign,
        lord: house.lord,
        longitude: parseFloat(house.longitude)
      };
    });
    
    // Identify yogas (auspicious combinations)
    const yogas = identifyYogas(planetData, houseData, ascendant);
    
    // Identify doshas (inauspicious combinations)
    const doshas = identifyDoshas(planetData, houseData, ascendant);
    
    return res.json({
      yogas,
      doshas
    });
  } catch (error) {
    console.error('Yogas-Doshas error:', error.message);
    return res.status(500).json({ 
      error: true,
      message: 'Yogas and doshas calculation error',
      details: error.message
    });
  }
});

// Helper function to determine which house a planet is in
function determineHouse(longitude, houses, ascendant = 0) {
  // Convert to 0-360 range if needed
  longitude = longitude % 360;
  if (longitude < 0) longitude += 360;
  
  // Normalize all houses based on ascendant
  const normalizedHouses = houses.map(house => {
    let normalized = parseFloat(house.longitude) - ascendant;
    if (normalized < 0) normalized += 360;
    return { ...house, normalizedLongitude: normalized };
  });
  
  // Sort houses by normalized longitude
  normalizedHouses.sort((a, b) => a.normalizedLongitude - b.normalizedLongitude);
  
  // Normalize the planet longitude based on ascendant
  let normalizedLongitude = longitude - ascendant;
  if (normalizedLongitude < 0) normalizedLongitude += 360;
  
  // Find the house this longitude belongs to
  for (let i = 0; i < normalizedHouses.length; i++) {
    const currentHouse = normalizedHouses[i];
    const nextHouse = normalizedHouses[(i + 1) % normalizedHouses.length];
    
    let start = currentHouse.normalizedLongitude;
    let end = nextHouse.normalizedLongitude;
    
    // Handle the case when end < start (crossing 0°)
    if (end < start) end += 360;
    
    // Check if the longitude is within this house
    if (normalizedLongitude >= start && normalizedLongitude < end) {
      return currentHouse.number;
    }
  }
  
  return 1; // Default to first house if not found
}

// Helper function to identify yogas (auspicious combinations)
function identifyYogas(planets, houses, ascendant) {
  const yogas = [];
  
  // Check for Gaja Kesari Yoga (Jupiter in angular house from Moon)
  if (planets.Jupiter && planets.Moon) {
    const moonHouse = planets.Moon.house;
    const jupiterHouse = planets.Jupiter.house;
    
    if ([1, 4, 7, 10].includes(jupiterHouse) && 
        (Math.abs(jupiterHouse - moonHouse) === 1 || 
         Math.abs(jupiterHouse - moonHouse) === 4 || 
         Math.abs(jupiterHouse - moonHouse) === 7 || 
         Math.abs(jupiterHouse - moonHouse) === 10)) {
      yogas.push({
        name: "Gaja Kesari Yoga",
        description: "Formed when Jupiter is in a kendra (angular house) from the Moon. Grants wisdom, authority, and fame."
      });
    }
  }
  
  // Check for Budha-Aditya Yoga (Sun and Mercury in same house)
  if (planets.Sun && planets.Mercury && planets.Sun.house === planets.Mercury.house) {
    yogas.push({
      name: "Budha-Aditya Yoga",
      description: "Formed when Sun and Mercury are in the same house. Grants intelligence, leadership, and administrative abilities."
    });
  }
  
  // Check for Dharma-Karmadhipati Yoga (Lords of 9th and 10th in conjunction)
  const lord9th = houses[9]?.lord;
  const lord10th = houses[10]?.lord;
  
  if (lord9th && lord10th && planets[lord9th] && planets[lord10th] && 
      Math.abs(planets[lord9th].longitude - planets[lord10th].longitude) < 10) {
    yogas.push({
      name: "Dharma-Karmadhipati Yoga",
      description: "Formed when the lords of 9th and 10th houses are in conjunction. Grants career success, fame, and spiritual growth."
    });
  }
  
  // Check for Amala Yoga (Benefic planet in 10th house from Moon or Lagna)
  const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  const house10fromAsc = (10 % 12) || 12;
  const house10fromMoon = planets.Moon ? ((planets.Moon.house + 9) % 12) || 12 : null;
  
  for (const benefic of benefics) {
    if (planets[benefic] && (planets[benefic].house === house10fromAsc || planets[benefic].house === house10fromMoon)) {
      yogas.push({
        name: "Amala Yoga",
        description: `Formed when a benefic planet (${benefic}) is in the 10th house from Ascendant or Moon. Grants good reputation, fame, and success.`
      });
      break; // Only need to find one benefic
    }
  }
  
  // Add more yoga checks as needed
  
  return yogas;
}

// Helper function to identify doshas (inauspicious combinations)
function identifyDoshas(planets, houses, ascendant) {
  const doshas = [];
  
  // Check for Kemadruma Dosha (Moon with no planets in 2nd, 12th, or adjacent houses)
  if (planets.Moon) {
    const moonHouse = planets.Moon.house;
    const adjacentHouses = [
      moonHouse === 1 ? 12 : moonHouse - 1, // 12th from Moon
      moonHouse === 12 ? 1 : moonHouse + 1, // 2nd from Moon
    ];
    
    let hasPlanetInAdjacent = false;
    for (const planet in planets) {
      if (planet !== 'Moon' && adjacentHouses.includes(planets[planet].house)) {
        hasPlanetInAdjacent = true;
        break;
      }
    }
    
    if (!hasPlanetInAdjacent) {
      doshas.push({
        name: "Kemadruma Dosha",
        description: "Formed when the Moon has no planets in adjacent houses (2nd or 12th from Moon). May cause hardships and fluctuating fortunes."
      });
    }
  }
  
  // Check for Graha Yuddha (Planetary War)
  const planetPairs = [];
  const planetList = Object.keys(planets);
  
  for (let i = 0; i < planetList.length; i++) {
    for (let j = i + 1; j < planetList.length; j++) {
      // Skip Rahu, Ketu for Graha Yuddha
      if (['Rahu', 'Ketu'].includes(planetList[i]) || ['Rahu', 'Ketu'].includes(planetList[j])) {
        continue;
      }
      
      const planet1 = planets[planetList[i]];
      const planet2 = planets[planetList[j]];
      
      // Check if planets are in the same sign and within 1 degree
      if (planet1.sign === planet2.sign && 
          Math.abs(planet1.longitude - planet2.longitude) <= 1) {
        planetPairs.push([planetList[i], planetList[j]]);
      }
    }
  }
  
  if (planetPairs.length > 0) {
    doshas.push({
      name: "Graha Yuddha (Planetary War)",
      description: `Formed when planets are very close to each other: ${planetPairs.map(pair => pair.join(' and ')).join(', ')}. The weaker planet's significations may suffer.`
    });
  }
  
  // Check for Manglik Dosha (Mars in 1st, 4th, 7th, 8th, or 12th house)
  if (planets.Mars && [1, 4, 7, 8, 12].includes(planets.Mars.house)) {
    doshas.push({
      name: "Manglik Dosha",
      description: `Mars is placed in house ${planets.Mars.house}, which may cause challenges in marriage and partnerships.`
    });
  }
  
  // Add more dosha checks as needed
  
  return doshas;
}

module.exports = app; 