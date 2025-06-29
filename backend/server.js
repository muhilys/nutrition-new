const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/ai', async (req, res) => {
  console.log('Received API request:', req.body);
  
  const { promptText, modelName } = req.body;
  const API_KEY = process.env.AI_API_KEY;

  // Validation
  if (!promptText || promptText.trim() === '') {
    return res.status(400).json({ error: 'promptText is required and cannot be empty' });
  }

  if (!API_KEY) {
    console.error('API Key not found in environment variables');
    return res.status(500).json({ error: 'API Key not configured on server' });
  }

  try {
    console.log('Making request to Groq API...');
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: modelName || 'llama-3.1-8b-instant',
        messages: [{ role: "user", content: promptText }],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      })
    });

    console.log('Groq API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return res.status(response.status).json({ 
        error: `Groq API error: ${response.statusText}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('Groq API response received successfully');
    res.json(data);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ 
      error: 'Internal server error: ' + err.message,
      type: err.name
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT}`);
  console.log('Environment check:');
  console.log('- API_KEY configured:', !!process.env.AI_API_KEY);
  console.log('- API_KEY length:', process.env.AI_API_KEY ? process.env.AI_API_KEY.length : 0);
});