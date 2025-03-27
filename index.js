// Server entry point for local development
const app = require('./api');
const express = require('express');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

// Use express app from api/index.js
if (typeof app.listen === 'function') {
  // Start the server if we're not in a serverless environment
  app.listen(PORT, () => {
    console.log(`Astro Insights API running on port ${PORT}`);
  });
} else {
  // Otherwise, export the handler function
  module.exports = app;
} 