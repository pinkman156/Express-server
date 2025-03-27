// Vedic chart endpoint using Prokerala API
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { getProkeralaToken } = require('./utils');
require('dotenv').config();

const app = express();

// Configure middleware
app.use(cors());
app.use(express.json());

app.post('/api/chart/vedic', async (req, res) => {
  try {
    const { datetime, latitude, longitude, ayanamsa } = req.body;
    
    if (!datetime || !latitude || !longitude) {
      return res.status(400).json({ 
        error: true, 
        message: 'Missing required birth data (datetime, latitude, longitude)'
      });
    }
    
    // Get Prokerala auth token
    const token = await getProkeralaToken();
    
    // Format coordinates
    const coordinates = `${latitude},${longitude}`;
    
    // Get planet positions
    const planetResponse = await axios({
      method: 'GET',
      url: 'https://api.prokerala.com/v2/astrology/planet-position',
      params: {
        datetime,
        coordinates,
        ayanamsa: ayanamsa || 1 // Default to Lahiri ayanamsa
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Get kundli data
    const kundliResponse = await axios({
      method: 'GET',
      url: 'https://api.prokerala.com/v2/astrology/kundli',
      params: {
        datetime,
        coordinates,
        ayanamsa: ayanamsa || 1
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Get chart data
    const chartResponse = await axios({
      method: 'GET',
      url: 'https://api.prokerala.com/v2/astrology/chart',
      params: {
        datetime,
        coordinates,
        ayanamsa: ayanamsa || 1
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Combine all data into comprehensive chart analysis
    const response = {
      planets: planetResponse.data,
      houses: kundliResponse.data,
      chart: chartResponse.data
    };
    
    return res.json(response);
  } catch (error) {
    console.error('Vedic chart error:', error.message);
    
    // Forward the error response
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    return res.status(500).json({ 
      error: true,
      message: 'Chart generation error',
      details: error.message
    });
  }
});

module.exports = app; 