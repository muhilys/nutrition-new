document.getElementById('nutrition-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();

  // Ambil data dari form
  const promptText = document.getElementById('user-input').value || '';
  const modelName = document.getElementById('model').value || 'llama-3.1-8b-instant';

  // Reset tampilan hasil/error
  document.getElementById('result-section').classList.remove('hidden');
  document.getElementById('result-output').innerText = '';
  document.getElementById('error-message').classList.add('hidden');
  document.getElementById('error-message').innerText = '';

  try {
    const result = await callAIAPI(promptText, modelName);
    document.getElementById('result-output').innerText = result;
  } catch (err) {
    document.getElementById('result-output').innerText = '';
    document.getElementById('error-message').innerText = "Error: " + err.message;
    document.getElementById('error-message').classList.remove('hidden');
  }
});

// Fungsi untuk memanggil backend API
async function callAIAPI(promptText, modelName) {
  try {
    console.log('Making API call to:', '/api/ai');
    console.log('Payload:', { promptText, modelName });
    
    const response = await fetch('http://localhost:5000/api/ai', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ promptText, modelName })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.error || errorMessage;
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        const textBody = await response.text();
        errorMessage = textBody || errorMessage;
      }
      throw new Error(`Backend API Error: ${errorMessage}`);
    }

    const result = await response.json();
    console.log('API Response:', result);
  let text = null;
  if (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content) {
    text = result.choices[0].message.content;
  } else if (result.response) {
    text = result.response;
  } else if (result.text) {
    text = result.text;
  } else if (result.content) {
    text = result.content;
  } else if (typeof result === 'string') {
    text = result;
  }

  if (text && text.trim()) {
    return text.trim();
  } else {
    throw new Error("Respons AI tidak valid atau kosong.");
  }
  } catch (error) {
    console.error('API call failed:', error);
    
    // Check if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Tidak dapat terhubung ke server. Pastikan backend sedang berjalan dan dapat diakses.');
    }
    
    // Re-throw the original error
    throw error;
  }
}