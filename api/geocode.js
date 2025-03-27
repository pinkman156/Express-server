// Geocoding endpoint using OpenStreetMap
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Configure middleware
app.use(cors());
app.use(express.json());

app.get('/api/geocode', async (req, res) => {
  try {
    const { place } = req.query;
    
    if (!place) {
      return res.status(400).json({ 
        error: true, 
        message: 'Missing place parameter'
      });
    }
    
    const response = await axios({
      method: 'GET',
      url: 'https://nominatim.openstreetmap.org/search',
      params: {
        q: place,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'AstroInsights/1.0',
        'Accept': 'application/json',
        'Accept-Language': 'en'
      }
    });
    
    if (response.data && response.data.length > 0) {
      const location = response.data[0];
      return res.json({
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon)
      });
    } else {
      return res.status(404).json({
        error: true,
        message: 'Location not found'
      });
    }
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return res.status(500).json({ 
      error: true,
      message: 'Geocoding service error',
      details: error.message
    });
  }
});

module.exports = app; 