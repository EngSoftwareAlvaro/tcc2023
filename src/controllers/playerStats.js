const axios = require('axios');
const db = require('../config/db');

const options = {
  method: 'GET',
  url: 'https://api-nba-v1.p.rapidapi.com/players/statistics',
  params: {
    team: '14',
    season: '2022'
  },
  headers: {
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
    'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
  }
};

async function saveDataToDatabase(data) {
  try {
    // Mapeie os dados recebidos da API para o formato da tabela statsJogador
    const playerDataToSave = data.response.map(player => {
      return {
        idJogador: player.player.id,
        pontos: player.points,
        minutos: player.min,
        fgm: player.fgm,
        fga: player.fga,
        fgp: player.fgp,
        ftm: player.ftm,
        fta: player.fta, 
        ftp: player.ftp, 
        tpm: player.tpm,
        tpa: player.tpa,
        tpp: player.tpp,
        offReb: player.offReb,
        defReb: player.defReb,
        totReb: player.totReb,
        assists: player.assists,
        pFouls: player.pFouls,
        steals: player.steals,
        turnovers: player.turnovers,
        blocks: player.blocks,
        plusMinus: player.plusMinus,
      };
    });

    // Agora você pode salvar os dados mapeados na tabela statsJogador
    for (const player of playerDataToSave) {
      await db.insert('statsJogador', player);
    }

    
  } catch (error) {
    console.error('Erro ao salvar os dados dos jogadores:', error);
  }
}

async function fetchDataAndSaveToDatabase() {
    try {
      const response = await axios.request(options);
      const dataToSave = response.data;
  
      // Chame a função de salvamento de dados aqui
      await saveDataToDatabase(dataToSave);
    } catch (error) {
      console.error('Erro ao buscar e salvar os dados:', error);
    }
    
    // Adicione a mensagem de sucesso aqui
    console.log('Todos os dados foram salvos com sucesso.');
  }
// Chame a função para buscar e salvar os dados
fetchDataAndSaveToDatabase();