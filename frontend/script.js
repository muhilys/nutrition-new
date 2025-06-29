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
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ promptText, modelName })
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Gagal memanggil backend API');
  }

  const result = await response.json();
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
}