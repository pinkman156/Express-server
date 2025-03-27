// Dashas endpoint for Vimshottari Dasha calculations
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configure middleware
app.use(cors());
app.use(express.json());

// Vimshottari Dasha periods (in years)
const dashaPeriods = {
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
  Ketu: 7,
  Venus: 20
};

app.post('/api/chart/dashas', async (req, res) => {
  try {
    const { birthData, birthChartData } = req.body;
    
    if (!birthData || !birthChartData) {
      return res.status(400).json({ 
        error: true, 
        message: 'Missing required data (birthData, birthChartData)'
      });
    }
    
    // Get Moon's longitude from the birth chart data
    const planets = birthChartData.planets?.data?.planets || [];
    const moon = planets.find(planet => planet.name === 'Moon');
    
    if (!moon) {
      return res.status(400).json({
        error: true,
        message: 'Moon position not found in birth chart data'
      });
    }
    
    // Calculate balance of dasha at birth
    const moonLongitude = parseFloat(moon.longitude);
    const nakshatra = Math.floor(moonLongitude / 13.333333) + 1; // 27 nakshatras span 360 degrees
    const nakPosition = (moonLongitude % 13.333333) / 13.333333; // Position within nakshatra (0-1)
    
    // Nakshatra lords in order
    const nakshatraLords = [
      'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 
      'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 
      'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun', 
      'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
    ];
    
    // Get birth nakshatra's lord
    const birthNakshatraLord = nakshatraLords[nakshatra - 1];
    
    // Calculate balance of dasha at birth
    const lordPeriod = dashaPeriods[birthNakshatraLord];
    const balanceAtBirth = lordPeriod * (1 - nakPosition);
    
    // Create the sequence of dashas
    const dashaSequence = [];
    let currentLord = birthNakshatraLord;
    let startDate = new Date(birthData.dateTime);
    
    // Start with balance of birth dasha
    dashaSequence.push({
      planet: currentLord,
      startDate: new Date(startDate),
      endDate: new Date(startDate.setFullYear(startDate.getFullYear() + balanceAtBirth)),
      period: balanceAtBirth
    });
    
    // Create the full 120-year sequence
    let lordIndex = nakshatraLords.indexOf(birthNakshatraLord);
    for (let i = 0; i < 8; i++) { // 8 more planets after birth lord
      lordIndex = (lordIndex + 1) % nakshatraLords.length;
      while(nakshatraLords[lordIndex] === currentLord) {
        lordIndex = (lordIndex + 1) % nakshatraLords.length;
      }
      
      currentLord = nakshatraLords[lordIndex];
      const period = dashaPeriods[currentLord];
      
      const startDateTime = new Date(dashaSequence[dashaSequence.length - 1].endDate);
      const endDateTime = new Date(startDateTime);
      endDateTime.setFullYear(endDateTime.getFullYear() + period);
      
      dashaSequence.push({
        planet: currentLord,
        startDate: startDateTime,
        endDate: endDateTime,
        period: period
      });
    }
    
    // Calculate sub-periods (bhukti) for the current main dasha
    const currentDate = new Date();
    const currentMainDasha = dashaSequence.find(dasha => 
      dasha.startDate <= currentDate && dasha.endDate >= currentDate
    );
    
    let bhuktiPeriods = [];
    
    if (currentMainDasha) {
      // Get main dasha duration in days
      const dashaDuration = (currentMainDasha.endDate - currentMainDasha.startDate) / (1000 * 60 * 60 * 24);
      
      // Calculate bhukti periods
      let bhuktiStart = new Date(currentMainDasha.startDate);
      lordIndex = nakshatraLords.indexOf(currentMainDasha.planet);
      
      // Start with the main lord's bhukti
      for (let i = 0; i < 9; i++) { // 9 planets
        const bhuktiLordIndex = (lordIndex + i) % nakshatraLords.length;
        const bhuktiLord = nakshatraLords[bhuktiLordIndex];
        while(nakshatraLords[bhuktiLordIndex] === bhuktiLord && i < 8) {
          bhuktiLordIndex = (bhuktiLordIndex + 1) % nakshatraLords.length;
        }
        
        const bhuktiPeriodYears = (dashaPeriods[bhuktiLord] / 120) * currentMainDasha.period;
        const bhuktiPeriodDays = bhuktiPeriodYears * 365.25;
        
        const bhuktiEnd = new Date(bhuktiStart);
        bhuktiEnd.setDate(bhuktiEnd.getDate() + bhuktiPeriodDays);
        
        bhuktiPeriods.push({
          planet: bhuktiLord,
          startDate: new Date(bhuktiStart),
          endDate: new Date(bhuktiEnd),
          period: bhuktiPeriodYears
        });
        
        bhuktiStart = new Date(bhuktiEnd);
      }
    }
    
    return res.json({
      birthNakshatra: nakshatra,
      birthNakshatraLord: birthNakshatraLord,
      balanceAtBirth: balanceAtBirth,
      dashaSequence: dashaSequence,
      currentDasha: currentMainDasha,
      bhuktiPeriods: bhuktiPeriods
    });
  } catch (error) {
    console.error('Dashas calculation error:', error.message);
    return res.status(500).json({ 
      error: true,
      message: 'Dashas calculation error',
      details: error.message
    });
  }
});

module.exports = app; 