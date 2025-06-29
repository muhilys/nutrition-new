const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/ai', async (req, res) => {
  const { promptText, modelName } = req.body;
  const API_KEY = process.env.AI_API_KEY;

  if (!API_KEY) return res.status(500).json({ error: 'API Key not set' });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: promptText }],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('Backend running on port 5000'));