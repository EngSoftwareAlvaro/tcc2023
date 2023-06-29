const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'https://api-nba-v1.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
    'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
  },
});

module.exports = apiClient;

