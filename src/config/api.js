const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'https://api-nba-v1.p.rapidapi.com',
  headers: {
    'x-rapidapi-key': '6e8c1f89a2msh9023223c3ba1345p19f59djsn37a77f7e743a',
    'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com',
  },
});

module.exports = apiClient;
