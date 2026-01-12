

const axios = require('axios');

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://lingva.ml/api/v1/auto/id/%EA%B7%B8%EC%9D%98%20%EC%9D%B4%EB%A6%84%EB%8F%84%20%EC%9D%B8%EA%B0%84%EC%9D%B4%EB%8B%A4',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  },
};

axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data, null, 2));
  })
  .catch((error) => {
    console.log('Request Error:', error.message);
  });
