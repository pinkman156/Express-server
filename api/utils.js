// Helper functions for API endpoints
const axios = require('axios');
require('dotenv').config();

// Error handling wrapper for async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

// Standard error response formatter
const formatError = (status, message, details = null) => {
  const error = {
    error: true,
    status,
    message
  };
  
  if (details) {
    error.details = details;
  }
  
  return error;
};

// Get Prokerala API token
const getProkeralaToken = async () => {
  try {
    const clientId = process.env.PROKERALA_CLIENT_ID;
    const clientSecret = process.env.PROKERALA_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error('Missing Prokerala API credentials');
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
    
    return response.data.access_token;
  } catch (error) {
    console.error('Prokerala token error:', error.message);
    throw error;
  }
};

module.exports = {
  asyncHandler,
  formatError,
  getProkeralaToken
}; 