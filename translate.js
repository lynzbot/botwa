const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/translate', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Teks tidak boleh kosong' });
  }

  try {
    const encodedText = encodeURIComponent(text);
    const url = `https://lingva.ml/api/v1/auto/id/${encodedText}`;

    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        'Connection': 'keep-alive',
        'Referer': 'https://lingva.ml/',
        'Origin': 'https://lingva.ml',
        'DNT': '1',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-GPC': '1'
      }
    });

    return res.json({
      translation: response.data.translation
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Gagal menerjemahkan',
      detail: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`API berjalan di http://localhost:${PORT}`);
});
