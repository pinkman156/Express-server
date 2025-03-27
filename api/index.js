// Main API router
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configure middleware
app.use(cors());
app.use(express.json());

// Import route handlers
const authProkeralaHandler = require('./auth-prokerala');
const geocodeHandler = require('./geocode');
const aiGenerateHandler = require('./ai-generate');
const chartVedicHandler = require('./chart-vedic');
const chartBirthHandler = require('./chart-birth');
const chartDashasHandler = require('./chart-dashas');
const chartYogasDoshasHandler = require('./chart-yogas-doshas');

// Mount route handlers (all routes are defined in their respective handlers)
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

module.exports = app; 