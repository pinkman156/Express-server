// Birth chart endpoint
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configure middleware
app.use(cors());
app.use(express.json());

app.post('/api/chart/birth', async (req, res) => {
  try {
    const { birthData, birthChartData } = req.body;
    
    if (!birthData || !birthChartData) {
      return res.status(400).json({ 
        error: true, 
        message: 'Missing required data (birthData, birthChartData)'
      });
    }
    
    // Process and format birth chart data
    // This endpoint mostly processes the data received from the Prokerala API
    // and structures it for frontend rendering
    
    const planets = birthChartData.planets?.data?.planets || [];
    const houses = birthChartData.houses?.data?.houses || [];
    
    // Format planet positions with house information
    const formattedPlanets = planets.map(planet => {
      const position = parseFloat(planet.longitude);
      const houseNumber = determineHouse(position, houses);
      
      return {
        name: planet.name,
        longitude: position,
        sign: planet.sign,
        house: houseNumber,
        isRetrograde: planet.is_retrograde
      };
    });
    
    // Format houses data
    const formattedHouses = houses.map(house => {
      return {
        number: house.number,
        sign: house.sign,
        lordInHouse: determinePlanetHouse(house.lord, formattedPlanets)
      };
    });
    
    // Format aspects between planets
    const aspects = calculateAspects(formattedPlanets);
    
    // Create the final birth chart data
    const formattedBirthChart = {
      planets: formattedPlanets,
      houses: formattedHouses,
      aspects: aspects,
      ascendant: birthChartData.houses?.data?.ascendant || null
    };
    
    return res.json(formattedBirthChart);
  } catch (error) {
    console.error('Birth chart error:', error.message);
    return res.status(500).json({ 
      error: true,
      message: 'Birth chart processing error',
      details: error.message
    });
  }
});

// Helper function to determine which house a planet is in
function determineHouse(longitude, houses) {
  // Convert to 0-360 range if needed
  longitude = longitude % 360;
  if (longitude < 0) longitude += 360;
  
  // Find the house this longitude belongs to
  for (let i = 0; i < houses.length; i++) {
    const currentHouse = houses[i];
    const nextHouse = houses[(i + 1) % houses.length];
    
    let start = parseFloat(currentHouse.longitude);
    let end = parseFloat(nextHouse.longitude);
    
    // Handle the case when end < start (crossing 0°)
    if (end < start) end += 360;
    
    // Check if the longitude is within this house
    if (longitude >= start && longitude < end) {
      return currentHouse.number;
    }
    
    // Special case for when longitude is after the last house
    if (end > 360 && longitude < (end - 360)) {
      return currentHouse.number;
    }
  }
  
  return 1; // Default to first house if not found
}

// Helper function to determine which house a planet lord is in
function determinePlanetHouse(planetName, planets) {
  const planet = planets.find(p => p.name.toLowerCase() === planetName.toLowerCase());
  return planet ? planet.house : null;
}

// Helper function to calculate aspects between planets
function calculateAspects(planets) {
  const aspects = [];
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];
      
      // Calculate the angular difference
      let diff = Math.abs(planet1.longitude - planet2.longitude);
      if (diff > 180) diff = 360 - diff;
      
      // Determine aspect type based on angle
      let aspectType = null;
      let orb = 0;
      
      if (Math.abs(diff - 0) <= 8) {
        aspectType = "conjunction";
        orb = Math.abs(diff - 0);
      } else if (Math.abs(diff - 60) <= 6) {
        aspectType = "sextile";
        orb = Math.abs(diff - 60);
      } else if (Math.abs(diff - 90) <= 6) {
        aspectType = "square";
        orb = Math.abs(diff - 90);
      } else if (Math.abs(diff - 120) <= 8) {
        aspectType = "trine";
        orb = Math.abs(diff - 120);
      } else if (Math.abs(diff - 180) <= 8) {
        aspectType = "opposition";
        orb = Math.abs(diff - 180);
      }
      
      if (aspectType) {
        aspects.push({
          planet1: planet1.name,
          planet2: planet2.name,
          aspectType,
          orb
        });
      }
    }
  }
  
  return aspects;
}

module.exports = app; 