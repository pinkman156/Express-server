// Main API router for Vercel serverless functions
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import route handlers
const authProkeralaHandler = require('./auth-prokerala');
const geocodeHandler = require('./geocode');
const aiGenerateHandler = require('./ai-generate');
const chartVedicHandler = require('./chart-vedic');
const chartBirthHandler = require('./chart-birth');
const chartDashasHandler = require('./chart-dashas');
const chartYogasDoshasHandler = require('./chart-yogas-doshas');

// Create an Express app instance
const app = express();

// Configure middleware
app.use(cors());
app.use(express.json());

// Mount route handlers
app.use(authProkeralaHandler);
app.use(geocodeHandler);
app.use(aiGenerateHandler);
app.use(chartVedicHandler);
app.use(chartBirthHandler);
app.use(chartDashasHandler);
app.use(chartYogasDoshasHandler);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Astro Insights API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: true,
    message: 'Internal server error',
    details: err.message
  });
});

// Export the Express app as a Vercel serverless function
module.exports = app;

// Handler for Vercel serverless functions
module.exports = (req, res) => {
  // This is necessary for Vercel to properly handle the request
  return app(req, res);
}; 