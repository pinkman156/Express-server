// Together AI generation endpoint
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Configure middleware
app.use(cors());
app.use(express.json());

app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt, birthData } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        error: true, 
        message: 'Missing prompt in request body'
      });
    }
    
    const apiKey = process.env.TOGETHER_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: true, 
        message: 'Missing API key' 
      });
    }
    
    // Format the complete prompt with birth data if available
    let fullPrompt = prompt;
    if (birthData) {
      fullPrompt = `Birth Details:\n${JSON.stringify(birthData, null, 2)}\n\n${prompt}`;
    }
    
    const response = await axios({
      method: 'POST',
      url: 'https://api.together.xyz/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      data: {
        model: "meta-llama/Llama-3-70b-chat-hf",
        messages: [
          {
            role: "system",
            content: "You are an expert astrologer with deep knowledge of vedic astrology, planets, houses, aspects, and yogas. You provide insightful and personalized astrological readings."
          },
          {
            role: "user",
            content: fullPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }
    });
    
    return res.json(response.data);
  } catch (error) {
    console.error('Together AI error:', error.message);
    
    // Forward the error response
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    return res.status(500).json({ 
      error: true,
      message: 'AI generation error',
      details: error.message
    });
  }
});

module.exports = app; 