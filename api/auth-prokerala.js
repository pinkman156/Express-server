// Prokerala authentication endpoint
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Configure middleware
app.use(cors());
app.use(express.json());

app.post('/api/auth/prokerala', async (req, res) => {
  try {
    // Get client credentials from environment variables
    const clientId = process.env.PROKERALA_CLIENT_ID;
    const clientSecret = process.env.PROKERALA_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      return res.status(500).json({ 
        error: true, 
        message: 'Missing API credentials'
      });
    }
    
    const response = await axios({
      method: 'POST',
      url: 'https://api.prokerala.com/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': clientId,
        'client_secret': clientSecret
      })
    });
    
    return res.json(response.data);
  } catch (error) {
    console.error('Prokerala token error:', error.message);
    
    // Forward the error response from Prokerala
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    return res.status(500).json({ 
      error: true,
      message: 'Authentication error',
      details: error.message
    });
  }
});

module.exports = app; 