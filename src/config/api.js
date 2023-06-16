const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'https://api-nba-v1.p.rapidapi.com',
  headers: {
    'x-rapidapi-key': '',
    'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com',
  },
});

module.exports = apiClient;
