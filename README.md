# Astro Insights API Server

Express.js backend for the Astrology Insights application, designed to be deployed as Vercel serverless functions.

## Overview

This server handles various API integrations required by the Astro Insights frontend:

- Prokerala Astrology API for chart data
- Together AI for LLM-generated insights
- OpenStreetMap for geocoding

## Endpoints

### Authentication
- `POST /api/auth/prokerala` - Get Prokerala API access token

### Geocoding
- `GET /api/geocode?place=<location>` - Get coordinates for a location

### AI Generation
- `POST /api/ai/generate` - Generate astrological insights using LLM

### Astrological Charts
- `POST /api/chart/vedic` - Generate Vedic chart data
- `POST /api/chart/birth` - Process birth chart information
- `POST /api/chart/dashas` - Calculate Vimshottari Dasha periods
- `POST /api/chart/yogas-doshas` - Analyze chart for yogas and doshas

### Health Check
- `GET /api/health` - Check if API is running

## Getting Started

### Prerequisites
- Node.js 18.x
- npm or yarn

### Environment Variables
Create a `.env` file with:
```
PROKERALA_CLIENT_ID=your_client_id
PROKERALA_CLIENT_SECRET=your_client_secret
TOGETHER_API_KEY=your_api_key
PORT=3001
```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## Deployment

This server is configured for deployment as Vercel serverless functions. Simply connect your GitHub repository to Vercel and ensure that the environment variables are properly set in the Vercel dashboard.

```bash
# Deploy to Vercel
vercel
```

## Directory Structure

```
/server
├── api/               # API handlers (serverless functions)
│   ├── utils.js       # Helper functions
│   ├── auth-prokerala.js
│   ├── geocode.js
│   ├── ai-generate.js
│   ├── chart-vedic.js
│   ├── chart-birth.js
│   ├── chart-dashas.js
│   ├── chart-yogas-doshas.js
│   └── index.js       # Main API router
├── .env               # Environment variables
├── package.json       # Dependencies
└── vercel.json        # Vercel configuration
``` 